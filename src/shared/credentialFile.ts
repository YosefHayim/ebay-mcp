import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function resolveCredentialEnvPath(moduleUrl: string | URL): string {
	return join(dirname(fileURLToPath(moduleUrl)), "../../.env");
}

export const CREDENTIAL_ENV_PATH = resolveCredentialEnvPath(import.meta.url);
