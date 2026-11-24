import path from "node:path";
import process from "node:process";

export const MEDIA_DIRS_ENV = "EBAY_MCP_MEDIA_DIRS";

export const MEDIA_ROOT_ENV = "EBAY_MCP_MEDIA_ROOT";

export interface MediaAccessConfig {
	readonly allowedDirs: readonly string[];
	readonly mediaRoot?: string | undefined;
	readonly errors: readonly string[];
}

function parseAbsoluteDir(
	raw: string,
	variable: string,
	errors: string[],
): string | undefined {
	if (!path.isAbsolute(raw)) {
		errors.push(`${variable} entries must be absolute paths; got "${raw}".`);
		return;
	}
	return path.resolve(raw);
}

export function getMediaAccessConfig(
	env: NodeJS.ProcessEnv = process.env,
): MediaAccessConfig {
	const errors: string[] = [];
	const allowedDirs: string[] = [];

	const rawDirs = (env[MEDIA_DIRS_ENV] ?? "")
		.split(path.delimiter)
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);
	for (const raw of rawDirs) {
		const dir = parseAbsoluteDir(raw, MEDIA_DIRS_ENV, errors);
		if (dir && !allowedDirs.includes(dir)) {
			allowedDirs.push(dir);
		}
	}

	const rawRoot = (env[MEDIA_ROOT_ENV] ?? "").trim();
	const mediaRoot = rawRoot
		? parseAbsoluteDir(rawRoot, MEDIA_ROOT_ENV, errors)
		: undefined;
	if (mediaRoot && !allowedDirs.includes(mediaRoot)) {
		allowedDirs.push(mediaRoot);
	}

	return { allowedDirs, mediaRoot, errors };
}
