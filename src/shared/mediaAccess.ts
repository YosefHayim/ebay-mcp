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

function pickNewAllowedDir(
	dir: string | undefined,
	allowedDirs: readonly string[],
): string | undefined {
	const isMissing = dir == null;

	if (isMissing) {
		return undefined;
	}

	const isEmpty = dir == "";

	if (isEmpty) {
		return undefined;
	}

	const isAlreadyListed = allowedDirs.includes(dir);

	if (isAlreadyListed) {
		return undefined;
	}

	return dir;
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
	for (const rawDir of rawDirs) {
		const parsedDir = parseAbsoluteDir(rawDir, MEDIA_DIRS_ENV, errors);
		const allowedDir = pickNewAllowedDir(parsedDir, allowedDirs);
		const isNewDir = allowedDir != null;

		if (isNewDir) {
			allowedDirs.push(allowedDir);
		}
	}

	const rawRoot = (env[MEDIA_ROOT_ENV] ?? "").trim();
	const mediaRoot = rawRoot
		? parseAbsoluteDir(rawRoot, MEDIA_ROOT_ENV, errors)
		: undefined;
	const allowedRoot = pickNewAllowedDir(mediaRoot, allowedDirs);
	const isNewRoot = allowedRoot != null;

	if (isNewRoot) {
		allowedDirs.push(allowedRoot);
	}

	return { allowedDirs, mediaRoot, errors };
}
