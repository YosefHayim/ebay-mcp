export function getErrorMessage(
	error: unknown,
	fallback = "Unknown error",
): string {
	return error instanceof Error ? error.message : fallback;
}

export interface EbayErrorDetails {
	readonly message: string;
	readonly status?: number;
	readonly errors?: unknown[];
}

interface EbayErrorAccumulator {
	message: string;
	status?: number;
	errors?: unknown[];
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
	const isNotObject = typeof value != "object";

	if (isNotObject) {
		return undefined;
	}

	const isNull = value == null;

	if (isNull) {
		return undefined;
	}

	return value as Record<string, unknown>;
}

const noTaggedCause = Symbol("noTaggedCause");

const fiberFailureCauseId = Symbol.for("effect/Runtime/FiberFailure/Cause");

function readBranchedTaggedCause(
	node: Record<string, unknown>,
	tag: string,
	field: string,
): unknown {
	const leftFailure = readTaggedCause(node["left"], tag, field);
	const hasLeftFailure = leftFailure !== noTaggedCause;

	if (hasLeftFailure) {
		return leftFailure;
	}

	return readTaggedCause(node["right"], tag, field);
}

function readTaggedCause(cause: unknown, tag: string, field: string): unknown {
	const node = asRecord(cause);
	const isMissingNode = node === undefined;

	if (isMissingNode) {
		return noTaggedCause;
	}

	const isMatch = node["_tag"] === tag;

	if (isMatch) {
		return node[field];
	}

	const isSequential = node["_tag"] === "Sequential";

	if (isSequential) {
		return readBranchedTaggedCause(node, tag, field);
	}

	const isParallel = node["_tag"] === "Parallel";

	if (isParallel) {
		return readBranchedTaggedCause(node, tag, field);
	}

	return noTaggedCause;
}

function nextErrorNode(node: Record<string, unknown>): unknown {
	const fiberCause = (node as Record<symbol, unknown>)[fiberFailureCauseId];
	const hasNoFiberCause = fiberCause === undefined;

	if (hasNoFiberCause) {
		return node["cause"];
	}

	const failure = readTaggedCause(fiberCause, "Fail", "error");
	const hasFailure = failure !== noTaggedCause;

	if (hasFailure) {
		return failure;
	}

	const defect = readTaggedCause(fiberCause, "Die", "defect");
	const hasDefect = defect !== noTaggedCause;

	if (hasDefect) {
		return defect;
	}

	return node["cause"];
}

function firstEbayErrorMessage(errors: unknown[]): string | undefined {
	const first = asRecord(errors[0]);
	if (!first) {
		return;
	}
	const detail = first["longMessage"] ?? first["message"];
	return typeof detail == "string" ? detail : undefined;
}

function readErrorMessage(node: Record<string, unknown>): string | undefined {
	const message = node["message"];
	const isNotString = typeof message != "string";

	if (isNotString) {
		return undefined;
	}

	const isEmpty = message.length == 0;

	if (isEmpty) {
		return undefined;
	}

	return message;
}

function readListedErrors(
	node: Record<string, unknown>,
): unknown[] | undefined {
	const errorBody = asRecord(node["data"]);
	const isMissingBody = errorBody == null;

	if (isMissingBody) {
		return undefined;
	}

	const listedErrors = errorBody["errors"];
	const isList = Array.isArray(listedErrors);

	if (isList) {
		return listedErrors;
	}

	return undefined;
}

function arrayCause(cause: unknown): unknown[] | undefined {
	const isList = Array.isArray(cause);

	if (isList) {
		return cause;
	}

	return undefined;
}

function readCauseErrors(
	node: Record<string, unknown>,
	knownErrors: unknown[] | undefined,
): unknown[] | undefined {
	const hasKnownErrors = knownErrors != null;

	if (hasKnownErrors) {
		return undefined;
	}

	const cause = node["cause"];
	const causeList = arrayCause(cause);
	const isMissingList = causeList == null;

	if (isMissingList) {
		return undefined;
	}

	const isEmpty = causeList.length == 0;

	if (isEmpty) {
		return undefined;
	}

	return causeList;
}

function shouldWalkCause(current: unknown, seen: Set<unknown>): boolean {
	const isMissing = current == null;

	if (isMissing) {
		return false;
	}

	const wasSeen = seen.has(current);

	if (wasSeen) {
		return false;
	}

	return true;
}

function collectEbayErrorNode(
	node: Record<string, unknown>,
	acc: EbayErrorAccumulator,
): void {
	const message = readErrorMessage(node);
	const hasMessage = message != null;

	if (hasMessage) {
		acc.message = message;
	}

	if (typeof node["status"] == "number") {
		acc.status = node["status"];
	}

	const listedErrors = readListedErrors(node);
	const hasListedErrors = listedErrors != null;

	if (hasListedErrors) {
		acc.errors = listedErrors;
		const detail = firstEbayErrorMessage(listedErrors);

		if (detail) {
			acc.message = detail;
		}

		return;
	}

	// Trading XML failures store their structured entries directly on `cause`.
	const causeErrors = readCauseErrors(node, acc.errors);
	const hasCauseErrors = causeErrors != null;

	if (hasCauseErrors) {
		acc.errors = causeErrors;
	}
}

export function getEbayErrorDetails(error: unknown): EbayErrorDetails {
	const acc: EbayErrorAccumulator = { message: getErrorMessage(error) };
	const seen = new Set<unknown>();
	let current: unknown = error;

	while (shouldWalkCause(current, seen)) {
		seen.add(current);
		const node = asRecord(current);
		if (!node) {
			break;
		}
		collectEbayErrorNode(node, acc);
		current = nextErrorNode(node);
	}

	return {
		message: acc.message,
		...(acc.status === undefined ? {} : { status: acc.status }),
		...(acc.errors === undefined ? {} : { errors: acc.errors }),
	};
}
