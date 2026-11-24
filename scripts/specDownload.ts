import { mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { getErrorMessage } from "@/shared/errors.js";
import { httpRequestEffect, readHttpFailureMessage } from "@/shared/http.js";

const isVersionText = (version: unknown): boolean =>
	typeof version === "string" && version.trim() !== "";

const hasSpecVersion = (spec: unknown): boolean =>
	spec !== null &&
	typeof spec === "object" &&
	(("openapi" in spec && isVersionText(spec.openapi)) ||
		("swagger" in spec && isVersionText(spec.swagger)));

export function checkSpecDownload(specBytes: Buffer): Buffer {
	const specText = specBytes.toString("utf-8");
	const isEmpty = specText.trim() === "";

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
	const isFailedStatus = status < 200 || status > 299;

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
