import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
	createMediaFixture,
	type MediaFixture,
} from "@tests/helpers/mediaFixtures.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MAX_FEED_FILE_BYTES } from "@/shared/localFeedFiles.js";
import { loadLocalMedia } from "@/shared/localMedia.js";
import type { MediaAccessConfig } from "@/shared/mediaAccess.js";

const XML = Buffer.from(
	'<?xml version="1.0" encoding="UTF-8"?>\n<BulkDataExchangeRequests/>',
);
const ZIP = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]);
const GZIP = Buffer.from([0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00]);

let fixture: MediaFixture;
let access: MediaAccessConfig;

beforeAll(async () => {
	fixture = await createMediaFixture();
	access = { allowedDirs: [fixture.root], mediaRoot: fixture.root, errors: [] };
});
afterAll(async () => {
	await rm(path.dirname(fixture.root), { recursive: true, force: true });
});

const writeFeed = async (
	name: string,
	bytes: Buffer | string,
): Promise<string> => {
	const filePath = path.join(fixture.root, name);
	await writeFile(filePath, bytes);
	return filePath;
};

describe("feed files", () => {
	it.each([
		["add.xml", XML, "application/xml"],
		[
			"bom.xml",
			Buffer.concat([
				Buffer.from([0xef, 0xbb, 0xbf]),
				Buffer.from("\n  "),
				XML,
			]),
			"application/xml",
		],
		[
			"listings.csv",
			Buffer.from("Action,SKU,Titel\nAdd,SKU-1,Gr\u00f6\u00dfe M\n"),
			"text/csv",
		],
		["add.zip", ZIP, "application/zip"],
		[
			"padded.xml",
			Buffer.concat([Buffer.from(" ".repeat(2048)), XML]),
			"application/xml",
		],
		["orders.xml.gz", GZIP, "application/gzip"],
	])("accepts %s as %s", async (name, bytes, mimeType) => {
		await writeFeed(name, bytes);

		const file = await loadLocalMedia(`media://${name}`, "feedFile", access);

		expect(file).toMatchObject({
			fileName: name,
			mimeType,
			kind: "feedFile",
			size: bytes.length,
		});
		expect(file.bytes).toEqual(bytes);
	});

	it.each([
		["nul.csv", Buffer.from("a,b\u0000c\n"), "UTF-8 text without NUL bytes"],
		[
			"latin1.xml",
			Buffer.from("<a>Größe</a>", "latin1"),
			"UTF-8 text without NUL bytes",
		],
		[
			"utf16.xml",
			Buffer.from("﻿<a/>", "utf16le"),
			"UTF-8 text without NUL bytes",
		],
		["renamed-csv.xml", Buffer.from("Action,SKU\nAdd,SKU-1\n"), "XML markup"],
		["text.zip", Buffer.from("<a/>"), "not a ZIP archive"],
		["zip.gz", ZIP, "not a gzip file"],
	])("rejects %s whose content does not match its extension", async (name, bytes, reason) => {
		await expect(
			loadLocalMedia(await writeFeed(name, bytes), "feedFile", access),
		).rejects.toMatchObject({
			message: expect.stringContaining(reason),
		});
	});
});

describe("feed file limits and access", () => {
	it.each([
		"feed.json",
		"feed.7z",
		"feed.txt",
		"feed.pdf",
	])("rejects the %s extension", async (name) => {
		await expect(
			loadLocalMedia(await writeFeed(name, XML), "feedFile", access),
		).rejects.toMatchObject({
			message: expect.stringContaining("unsupported feedFile extension"),
		});
	});

	it("enforces the 15 MiB feed file limit exactly", async () => {
		const atLimit = Buffer.alloc(MAX_FEED_FILE_BYTES, 0x20);
		atLimit.write("<a/>");
		const filePath = await writeFeed("big.xml", atLimit);

		expect(MAX_FEED_FILE_BYTES).toBe(15 * 1024 * 1024);
		expect((await loadLocalMedia(filePath, "feedFile", access)).size).toBe(
			MAX_FEED_FILE_BYTES,
		);
		await writeFeed("big.xml", Buffer.concat([atLimit, Buffer.from(" ")]));
		await expect(
			loadLocalMedia(filePath, "feedFile", access),
		).rejects.toMatchObject({
			message: expect.stringContaining(`${MAX_FEED_FILE_BYTES} bytes`),
		});
	});

	it("applies the media allowlist: disabled access, traversal, symlink escapes and empty files", async () => {
		const empty = await writeFeed("empty.csv", "");
		const sources = [
			empty,
			fixture.escapingLink,
			"media://../outside/secret.jpg",
			"relative.xml",
		];

		for (const source of sources) {
			await expect(
				loadLocalMedia(source, "feedFile", access),
			).rejects.toThrow();
		}
		await expect(
			loadLocalMedia(await writeFeed("ok.xml", XML), "feedFile", {
				allowedDirs: [],
				errors: [],
			}),
		).rejects.toMatchObject({
			message: expect.stringContaining("EBAY_MCP_MEDIA_DIRS"),
		});
	});

	it("keeps feed extensions out of the media and document policies", async () => {
		const filePath = await writeFeed("policy.xml", XML);

		for (const kind of [
			"image",
			"video",
			"document",
			"postOrderDocument",
		] as const) {
			await expect(loadLocalMedia(filePath, kind, access)).rejects.toThrow();
		}
		await expect(
			loadLocalMedia(fixture.jpeg, "feedFile", access),
		).rejects.toMatchObject({
			message: expect.stringContaining("unsupported feedFile extension"),
		});
	});
});
