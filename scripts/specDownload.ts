import { mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { getErrorMessage } from "@/shared/errors.js";
import { httpRequestEffect, readHttpFailureMessage } from "@/shared/http.js";

function isNonNullObject(candidate: unknown): candidate is object {
	const isNull = candidate == null;

	if (isNull) {
		return false;
	}

	const isObject = typeof candidate == "object";
	const isNotObject = !isObject;

	if (isNotObject) {
		return false;
	}

	return true;
}

function isVersionText(version: unknown): boolean {
	const isString = typeof version == "string";
	const isNotString = !isString;

	if (isNotString) {
		return false;
	}

	const isBlank = version.trim() == "";

	if (isBlank) {
		return false;
	}

	return true;
}

function isOpenApiDocument(spec: object): spec is { openapi: unknown } {
	return "openapi" in spec;
}

function isSwaggerDocument(spec: object): spec is { swagger: unknown } {
	return "swagger" in spec;
}

function hasOpenApiVersion(spec: object): boolean {
	const hasOpenApiField = isOpenApiDocument(spec);

	if (hasOpenApiField) {
		return isVersionText(spec.openapi);
	}

	return false;
}

function hasSwaggerVersion(spec: object): boolean {
	const hasSwaggerField = isSwaggerDocument(spec);

	if (hasSwaggerField) {
		return isVersionText(spec.swagger);
	}

	return false;
}

function hasSpecVersion(spec: unknown): boolean {
	const isObject = isNonNullObject(spec);
	const isNotObject = !isObject;

	if (isNotObject) {
		return false;
	}

	const hasOpenApi = hasOpenApiVersion(spec);

	if (hasOpenApi) {
		return true;
	}

	return hasSwaggerVersion(spec);
}

function isOutsideSuccessStatus(status: number): boolean {
	const minimumSuccessStatus = 200;
	const isBelowSuccess = status < minimumSuccessStatus;

	if (isBelowSuccess) {
		return true;
	}

	const maximumSuccessStatus = 299;
	const isAboveSuccess = status > maximumSuccessStatus;

	if (isAboveSuccess) {
		return true;
	}

	return false;
}

export function checkSpecDownload(specBytes: Buffer): Buffer {
	const specText = specBytes.toString("utf-8");
	const isEmpty = specText.trim() == "";

	if (isEmpty) {
		throw new Error("empty response");
	}

	let spec: unknown;

	try {
		spec = JSON.parse(specText) as unknown;
	} catch {
		throw new Error("response is not JSON");
	}

	const hasVersion = hasSpecVersion(spec);

	if (!hasVersion) {
		throw new Error("JSON has no openapi or swagger version");
	}

	return specBytes;
}

export async function refreshCachedSpec(
	url: string,
	specPath: string,
): Promise<void> {
	const specResponse = await httpRequestEffect<Buffer>({
		url,
		responseType: "arraybuffer",
		timeoutMs: 20_000,
	});
	const status = specResponse.status;
	const isFailedStatus = isOutsideSuccessStatus(status);

	if (isFailedStatus) {
		throw new Error(
			readHttpFailureMessage(
				specResponse.data,
				`Request to ${url} failed with status ${status}`,
			),
		);
	}

	const specBytes = checkSpecDownload(specResponse.data);
	const downloadPath = `${specPath}.download`;

	try {
		mkdirSync(dirname(specPath), { recursive: true });
		writeFileSync(downloadPath, specBytes);
		renameSync(downloadPath, specPath);
	} catch (error) {
		rmSync(downloadPath, { force: true });
		throw new Error(getErrorMessage(error, "write failed"), { cause: error });
	}
}
