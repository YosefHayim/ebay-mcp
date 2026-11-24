import { loadEnvFile } from "node:process";

function isMissingEnvFile(error: unknown): boolean {
	if (typeof error !== "object") {
		return false;
	}

	if (error == null) {
		return false;
	}

	if (!("code" in error)) {
		return false;
	}

	return error.code === "ENOENT";
}

export function loadEnvFileIfPresent(envPath?: string): void {
	try {
		if (envPath == null) {
			loadEnvFile();
			return;
		}

		loadEnvFile(envPath);
	} catch (error) {
		const isMissing = isMissingEnvFile(error);

		if (isMissing) {
			return;
		}

		throw error;
	}
}
