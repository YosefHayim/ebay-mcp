import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
	checkSpecDownload,
	refreshCachedSpec,
	UnusableSpecError,
} from "./specDownload.js";

const CACHED_SPEC = '{"openapi":"3.0.0","info":{"title":"cached"}}';
const FRESH_SPEC = '{"openapi":"3.0.0","info":{"title":"fresh"}}';

function failureMessage(specBody: string): string | undefined {
	try {
		checkSpecDownload(Buffer.from(specBody));
		return undefined;
	} catch (error) {
		if (error instanceof UnusableSpecError) {
			return error.message;
		}

		throw error;
	}
}

describe("checkSpecDownload", () => {
	it("rejects an empty or whitespace-only body", () => {
		expect(failureMessage("")).toBe("empty response");
		expect(failureMessage(" \n\t")).toBe("empty response");
	});

	it("rejects a body that is not JSON", () => {
		expect(failureMessage("<html>Access Denied</html>")).toBe(
			"response is not JSON",
		);
	});

	it("rejects JSON without an openapi or swagger version", () => {
		expect(failureMessage('{"error":"not found"}')).toBe(
			"JSON has no openapi or swagger version",
		);
		expect(failureMessage("[]")).toBe("JSON has no openapi or swagger version");
		expect(failureMessage("null")).toBe(
			"JSON has no openapi or swagger version",
		);
		expect(failureMessage('{"openapi":""}')).toBe(
			"JSON has no openapi or swagger version",
		);
		expect(failureMessage('{"swagger":"  "}')).toBe(
			"JSON has no openapi or swagger version",
		);
	});

	it("accepts OpenAPI 3 and Swagger 2 documents", () => {
		expect(failureMessage(FRESH_SPEC)).toBeUndefined();
		expect(failureMessage('{"swagger":"2.0","paths":{}}')).toBeUndefined();
	});
});

describe("refreshCachedSpec", () => {
	let cacheDir = "";
	let specServer: Server | undefined;

	afterEach(() => {
		specServer?.close();
		if (cacheDir) {
			rmSync(cacheDir, { recursive: true, force: true });
		}
	});

	const serveSpecBody = async (specBody: string): Promise<string> => {
		specServer = createServer((_request, response) => {
			response.writeHead(200, { "Content-Type": "application/json" });
			response.end(specBody);
		});
		const server = specServer;
		await new Promise<void>((listening) =>
			server.listen(0, "127.0.0.1", listening),
		);
		const { port } = server.address() as AddressInfo;
		return `http://127.0.0.1:${port}/spec.json`;
	};

	const cachedSpecPath = (): string => {
		cacheDir = mkdtempSync(join(tmpdir(), "ebay-spec-cache-"));
		const specPath = join(cacheDir, "sell_feed_v1_oas3.json");
		writeFileSync(specPath, CACHED_SPEC);
		return specPath;
	};

	it("keeps the cached spec when the download is empty", async () => {
		const url = await serveSpecBody("");
		const specPath = cachedSpecPath();

		await expect(refreshCachedSpec(url, specPath)).rejects.toBeInstanceOf(
			UnusableSpecError,
		);
		expect(readFileSync(specPath, "utf-8")).toBe(CACHED_SPEC);
	});

	it("replaces the cached spec with a valid download", async () => {
		const url = await serveSpecBody(FRESH_SPEC);
		const specPath = cachedSpecPath();

		await refreshCachedSpec(url, specPath);

		expect(readFileSync(specPath, "utf-8")).toBe(FRESH_SPEC);
		expect(existsSync(`${specPath}.download`)).toBe(false);
	});

	it("reports a failed cache write and leaves no partial download behind", async () => {
		const url = await serveSpecBody(FRESH_SPEC);
		const specPath = cachedSpecPath();
		rmSync(specPath);
		mkdirSync(specPath);

		await expect(refreshCachedSpec(url, specPath)).rejects.toMatchObject({
			_tag: "SpecCacheWriteError",
		});
		expect(existsSync(`${specPath}.download`)).toBe(false);
	});
});
