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
	return typeof value == "object" && value !== null
		? (value as Record<string, unknown>)
		: undefined;
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

function collectEbayErrorNode(
	node: Record<string, unknown>,
	acc: EbayErrorAccumulator,
): void {
	const message =
		typeof node["message"] == "string" && node["message"].length > 0
			? node["message"]
			: undefined;
	if (message !== undefined) {
		acc.message = message;
	}
	if (typeof node["status"] == "number") {
		acc.status = node["status"];
	}

	const errorBody = asRecord(node["data"]);
	if (errorBody && Array.isArray(errorBody["errors"])) {
		acc.errors = errorBody["errors"];
		const detail = firstEbayErrorMessage(errorBody["errors"]);
		if (detail) {
			acc.message = detail;
		}
		return;
	}

	// Trading XML failures store their structured entries directly on `cause`.
	if (
		acc.errors === undefined &&
		Array.isArray(node["cause"]) &&
		node["cause"].length > 0
	) {
		acc.errors = node["cause"];
	}
}

export function getEbayErrorDetails(error: unknown): EbayErrorDetails {
	const acc: EbayErrorAccumulator = { message: getErrorMessage(error) };
	const seen = new Set<unknown>();
	let current: unknown = error;

	while (current !== undefined && current !== null && !seen.has(current)) {
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
