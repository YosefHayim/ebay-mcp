import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
	getPackageJson,
	getPackageName,
	getVersion,
} from "@/shared/version.js";

function readShippedPackage(): { name: string; version: string } {
	const modulePath = fileURLToPath(import.meta.url);
	const moduleDirectory = dirname(modulePath);
	const packageJsonPath = join(moduleDirectory, "../../package.json");
	const packageText = readFileSync(packageJsonPath, "utf-8");
	return JSON.parse(packageText) as { name: string; version: string };
}

describe("getPackageJson", () => {
	it("reads the name and version from package.json", () => {
		const shippedPackage = readShippedPackage();

		const parsedPackage = getPackageJson();

		expect(parsedPackage.name).toBe(shippedPackage.name);
		expect(parsedPackage.version).toBe(shippedPackage.version);
	});
});

describe("getVersion", () => {
	it("returns the version from package.json", () => {
		const shippedPackage = readShippedPackage();

		const version = getVersion();

		expect(version).toBe(shippedPackage.version);
	});
});

describe("getPackageName", () => {
	it("returns the name from package.json", () => {
		const shippedPackage = readShippedPackage();

		const packageName = getPackageName();

		expect(packageName).toBe(shippedPackage.name);
	});
});
