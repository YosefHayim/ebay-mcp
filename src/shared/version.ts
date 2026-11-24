import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface PackageJson {
	name: string;
	version: string;
	[key: string]: unknown;
}

let cachedPackageJson: PackageJson | null = null;

function isPackageJson(candidate: unknown): candidate is PackageJson {
	if (typeof candidate !== "object") {
		return false;
	}

	if (candidate === null) {
		return false;
	}

	const name = Reflect.get(candidate, "name");
	const version = Reflect.get(candidate, "version");

	if (typeof name !== "string") {
		return false;
	}

	return typeof version === "string";
}

function readPackageFile(): unknown {
	const modulePath = fileURLToPath(import.meta.url);
	const moduleDirectory = dirname(modulePath);
	const packageJsonPath = join(moduleDirectory, "../../package.json");

	try {
		const packageText = readFileSync(packageJsonPath, "utf-8");
		return JSON.parse(packageText) as unknown;
	} catch {
		return null;
	}
}

export function getPackageJson(): PackageJson {
	if (cachedPackageJson !== null) {
		return cachedPackageJson;
	}

	const parsedPackage = readPackageFile();

	if (isPackageJson(parsedPackage)) {
		cachedPackageJson = parsedPackage;
		return cachedPackageJson;
	}

	cachedPackageJson = { name: "ebay-mcp", version: "0.0.0" };
	return cachedPackageJson;
}

export function getVersion(): string {
	return getPackageJson().version;
}

export function getPackageName(): string {
	return getPackageJson().name;
}
