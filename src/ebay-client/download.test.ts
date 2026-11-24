import { describe, expect, it, vi } from "vitest";
import {
	fileNameFromDisposition,
	MAX_INLINE_DOWNLOAD_BYTES,
	requestDownloadEffect,
} from "@/ebay-client/download.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import { formatFileResult } from "@/tool-registry/fileResult.js";

describe("fileNameFromDisposition", () => {
	it.each([
		['attachment; filename="report.csv.gz"', "report.csv.gz"],
		["attachment; filename=label.pdf", "label.pdf"],
		["attachment; filename*=UTF-8''r%C3%A9sum%C3%A9.zip", "résumé.zip"],
		["attachment; filename*=UTF-8'en'r%C3%A9sum%C3%A9.zip", "résumé.zip"],
		[
			"attachment; filename=\"plain.xml\"; filename*=UTF-8''encoded.xml",
			"encoded.xml",
		],
	])("reads %s", (header, expected) => {
		expect(fileNameFromDisposition(header)).toBe(expected);
	});

	it("returns undefined without a file name", () => {
		expect(fileNameFromDisposition(undefined)).toBeUndefined();
		expect(fileNameFromDisposition("inline")).toBeUndefined();
		expect(
			fileNameFromDisposition("attachment; filename*=UTF-8''%E0%A4%A"),
		).toBeUndefined();
	});
});

describe("requestDownloadEffect", () => {
	it("requests binary bytes and keeps the content type and file name", async () => {
		const bytes = Buffer.from("PK\u0003\u0004");
		const client = {
			getForResponse: vi.fn().mockResolvedValue({
				data: bytes,
				status: 200,
				headers: {
					"content-type": "application/zip; charset=binary",
					"content-disposition": 'attachment; filename="result.zip"',
				},
			}),
		} as unknown as EbayApiClient;

		const file = await requestDownloadEffect(
			client,
			"/sell/feed/v1/task/T1/download_result_file",
			{
				headers: { Accept: "application/octet-stream" },
			},
		);

		expect(client.getForResponse).toHaveBeenCalledWith(
			"/sell/feed/v1/task/T1/download_result_file",
			undefined,
			{
				headers: { Accept: "application/octet-stream" },
				responseType: "arraybuffer",
				maxBytes: MAX_INLINE_DOWNLOAD_BYTES,
			},
		);
		expect(file).toEqual({
			bytes,
			contentType: "application/zip",
			fileName: "result.zip",
		});
	});

	it("defaults to application/octet-stream when eBay sends no content type", async () => {
		const client = {
			getForResponse: vi
				.fn()
				.mockResolvedValue({ data: Buffer.alloc(0), status: 200, headers: {} }),
		} as unknown as EbayApiClient;

		const file = await requestDownloadEffect(client, "/x");

		expect(file.contentType).toBe("application/octet-stream");
		expect(file.fileName).toBeUndefined();
	});

	it("refuses files above the inline MCP limit with a tagged error", async () => {
		const client = {
			getForResponse: vi.fn().mockResolvedValue({
				data: Buffer.alloc(MAX_INLINE_DOWNLOAD_BYTES + 1),
				status: 200,
				headers: { "content-type": "application/octet-stream" },
			}),
		} as unknown as EbayApiClient;

		await expect(
			requestDownloadEffect(
				client,
				"/commerce/taxonomy/v1/category_tree/0/fetch_item_aspects",
			),
		).rejects.toThrow(
			`eBay file from /commerce/taxonomy/v1/category_tree/0/fetch_item_aspects is at least ${MAX_INLINE_DOWNLOAD_BYTES + 1} bytes, above the ${MAX_INLINE_DOWNLOAD_BYTES}-byte limit for returning files inline over MCP`,
		);
	});

	it("rejects a file by its declared length when reading stopped early", async () => {
		const declared = MAX_INLINE_DOWNLOAD_BYTES * 4;
		const client = {
			getForResponse: vi.fn().mockResolvedValue({
				data: Buffer.alloc(0),
				status: 200,
				headers: { "content-length": String(declared) },
			}),
		} as unknown as EbayApiClient;

		await expect(requestDownloadEffect(client, "/big")).rejects.toThrow(
			`eBay file from /big is at least ${declared} bytes, above the ${MAX_INLINE_DOWNLOAD_BYTES}-byte limit for returning files inline over MCP`,
		);
	});

	it("fails with a tagged EbayApiError", async () => {
		const client = {
			getForResponse: vi.fn().mockRejectedValue(new Error("not found")),
		} as unknown as EbayApiClient;

		await expect(requestDownloadEffect(client, "/missing")).rejects.toThrow(
			"eBay GET /missing failed: not found",
		);
	});
});

describe("formatFileResult", () => {
	it("embeds the bytes as a base64 resource with a summary line", () => {
		const toolResult = formatFileResult(
			{
				bytes: Buffer.from("hello"),
				contentType: "text/csv",
				fileName: "orders.csv",
			},
			"ebay-feed://task/T1/result",
			"Feed task T1 result file",
		);

		expect(toolResult.content).toEqual([
			{
				type: "text",
				text: "Feed task T1 result file orders.csv (text/csv, 5 bytes)",
			},
			{
				type: "resource",
				resource: {
					uri: "ebay-feed://task/T1/result",
					mimeType: "text/csv",
					blob: Buffer.from("hello").toString("base64"),
				},
			},
		]);
	});
});
