import { mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { getErrorMessage } from "@/shared/errors.js";
import { httpRequestEffect } from "@/shared/http.js";

const isVersionText = (version: unknown): boolean =>
	typeof version === "string" && version.trim() !== "";

const hasSpecVersion = (spec: unknown): boolean =>
	spec !== null &&
	typeof spec === "object" &&
	(("openapi" in spec && isVersionText(spec.openapi)) ||
		("swagger" in spec && isVersionText(spec.swagger)));

export class UnusableSpecError extends Error {
	readonly _tag = "UnusableSpecError" as const;

	constructor(fields: { message: string }) {
		super(fields.message);
		this.name = "UnusableSpecError";
	}
}

export class SpecCacheWriteError extends Error {
	readonly _tag = "SpecCacheWriteError" as const;
	readonly specPath: string;

	constructor(fields: { specPath: string; message: string }) {
		super(fields.message);
		this.name = "SpecCacheWriteError";
		this.specPath = fields.specPath;
	}
}

export function checkSpecDownload(specBytes: Buffer): Buffer {
	const specText = specBytes.toString("utf-8");
	const isEmpty = specText.trim() === "";

	if (isEmpty) {
		throw new UnusableSpecError({ message: "empty response" });
	}

	let spec: unknown;

	try {
		spec = JSON.parse(specText) as unknown;
	} catch {
		throw new UnusableSpecError({ message: "response is not JSON" });
	}

	const hasVersion = hasSpecVersion(spec);

	if (!hasVersion) {
		throw new UnusableSpecError({
			message: "JSON has no openapi or swagger version",
		});
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
	const specBytes = checkSpecDownload(specResponse.data);
	const downloadPath = `${specPath}.download`;

	try {
		mkdirSync(dirname(specPath), { recursive: true });
		writeFileSync(downloadPath, specBytes);
		renameSync(downloadPath, specPath);
	} catch (error) {
		rmSync(downloadPath, { force: true });
		throw new SpecCacheWriteError({
			specPath,
			message: getErrorMessage(error, "write failed"),
		});
	}
}
