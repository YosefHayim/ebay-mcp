import { once } from "node:events";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { httpRequest, httpRequestEffect } from "@/shared/http.js";

/**
 * A real loopback server is used instead of a fetch mock because the behaviour
 * under test is the response *stream* stalling after the headers have already
 * arrived — something only a live socket reproduces.
 */
let server: Server;
let baseUrl: string;
const openSockets: NodeJS.WritableStream[] = [];

beforeAll(async () => {
	server = createServer((request, response) => {
		if (request.url === "/stalled-body") {
			response.writeHead(200, {
				"content-type": "application/json",
				"content-length": "64",
			});
			response.write('{"inventoryItems":');
			// Headers and a first chunk land, then the stream stops forever.
			openSockets.push(response);
			return;
		}

		if (request.url === "/stalled-headers") {
			openSockets.push(response);
			return;
		}

		if (request.url === "/missing") {
			response.writeHead(400, { "content-type": "application/json" });
			response.end(
				JSON.stringify({
					errors: [{ longMessage: "No such item", message: "Missing" }],
				}),
			);
			return;
		}

		if (request.url === "/declared-large") {
			response.writeHead(200, {
				"content-type": "application/gzip",
				"content-length": "64",
			});
			response.end("x".repeat(64));
			return;
		}

		if (request.url === "/endless-binary") {
			// Chunked and never ended: only a capped read can return before the timeout.
			response.writeHead(200, { "content-type": "application/octet-stream" });
			response.write("x".repeat(32));
			openSockets.push(response);
			return;
		}

		response.writeHead(200, { "content-type": "application/json" });
		response.end('{"ok":true}');
	});

	server.listen(0, "127.0.0.1");
	await once(server, "listening");
	baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
	for (const socket of openSockets) {
		socket.end();
	}
	server.close();
	await once(server, "close");
});

describe("httpRequest timeouts", () => {
	it("returns the decoded body when the response completes", async () => {
		const response = await httpRequest<{ ok: boolean }>({
			url: `${baseUrl}/ok`,
			timeoutMs: 5000,
		});

		expect(response.status).toBe(200);
		expect(response.data).toEqual({ ok: true });
	});

	it("fails a request whose response body never finishes arriving", async () => {
		// Long enough for the headers to land first on a loaded runner; 150 ms lost that race.
		const error = await httpRequest({
			url: `${baseUrl}/stalled-body`,
			timeoutMs: 1000,
		}).catch((cause: unknown) => cause);

		expect(error).toBeInstanceOf(Error);
		expect((error as Error).message).toBe(
			`Request to ${baseUrl}/stalled-body timed out after 1000ms reading the response body`,
		);
	});

	it("fails a request whose response headers never arrive", async () => {
		const error = await httpRequest({
			url: `${baseUrl}/stalled-headers`,
			timeoutMs: 150,
		}).catch((cause: unknown) => cause);

		expect(error).toBeInstanceOf(Error);
		expect((error as Error).message).toBe(
			`Request to ${baseUrl}/stalled-headers timed out after 150ms reading the response headers`,
		);
	});
});

describe("httpRequest error statuses", () => {
	it("throws the eBay error detail when the status is not 2xx", async () => {
		await expect(httpRequest({ url: `${baseUrl}/missing` })).rejects.toThrow(
			"No such item",
		);
	});

	it("returns a non-2xx response from httpRequestEffect", async () => {
		const response = await httpRequestEffect({
			url: `${baseUrl}/missing`,
		});

		expect(response.status).toBe(400);
		expect(response.statusText).toBe("Bad Request");
		expect(response.data).toEqual({
			errors: [{ longMessage: "No such item", message: "Missing" }],
		});
	});
});

describe("httpRequest capped binary reads", () => {
	it("skips a body whose declared length exceeds the cap", async () => {
		const response = await httpRequest<Buffer>({
			url: `${baseUrl}/declared-large`,
			responseType: "arraybuffer",
			maxBytes: 16,
		});

		expect(response.data.length).toBe(0);
		expect(response.headers["content-length"]).toBe("64");
	});

	it("stops reading an endless body once it passes the cap", async () => {
		const response = await httpRequest<Buffer>({
			url: `${baseUrl}/endless-binary`,
			responseType: "arraybuffer",
			maxBytes: 16,
			timeoutMs: 5000,
		});

		expect(response.data.length).toBeGreaterThan(16);
	});

	it("returns a body within the cap unchanged", async () => {
		const response = await httpRequest<Buffer>({
			url: `${baseUrl}/declared-large`,
			responseType: "arraybuffer",
			maxBytes: 64,
		});

		expect(response.data.toString()).toBe("x".repeat(64));
	});
});
