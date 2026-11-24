import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
	createMediaFixture,
	JPEG_BYTES,
	type MediaFixture,
	PNG_BYTES,
} from "@tests/helpers/mediaFixtures.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type LocalMediaKind, loadLocalMedia } from "@/shared/localMedia.js";
import type { MediaAccessConfig } from "@/shared/mediaAccess.js";

let fixture: MediaFixture;
let access: MediaAccessConfig;
beforeAll(async () => {
	fixture = await createMediaFixture();
	access = { allowedDirs: [fixture.root], mediaRoot: fixture.root, errors: [] };
});
afterAll(async () => {
	await rm(path.dirname(fixture.root), { recursive: true, force: true });
});

describe.each([
	"document",
	"postOrderDocument",
] as const)("%s files", (kind) => {
	it.each([
		["pdf", Buffer.from("%PDF-1.7")],
		["jpg", JPEG_BYTES],
		["jpeg", JPEG_BYTES],
		["png", PNG_BYTES],
	])("accepts %s", async (ext, bytes) => {
		const name = `valid-${kind}.${ext}`;
		await writeFile(path.join(fixture.root, name), bytes);
		const file = await loadLocalMedia(`media://${name}`, kind, access);
		expect(file.bytes).toEqual(bytes);
		expect(file.kind).toBe(kind);
	});

	it("enforces its exact byte limit", async () => {
		const limit = (kind === "document" ? 10 : 5) * 1024 * 1024;
		const name = path.join(fixture.root, `${kind}.pdf`);
		const bytes = Buffer.alloc(limit);
		bytes.write("%PDF-1.7");
		await writeFile(name, bytes);
		expect((await loadLocalMedia(name, kind, access)).size).toBe(limit);
		await writeFile(name, Buffer.concat([bytes, Buffer.from("x")]));
		await expect(loadLocalMedia(name, kind, access)).rejects.toThrow();
	});

	it("rejects disabled access, empty/mismatched files, traversal and symlink escapes", async () => {
		const empty = path.join(fixture.root, `empty-${kind}.pdf`);
		await writeFile(empty, "");
		const sources = [
			empty,
			fixture.mismatched,
			fixture.escapingLink,
			fixture.outsideJpeg,
			"media://../outside/secret.jpg",
			"media://%ZZ",
			fixture.mp4,
		];
		for (const source of sources) {
			await expect(loadLocalMedia(source, kind, access)).rejects.toThrow();
		}
		await expect(
			loadLocalMedia(fixture.jpeg, kind, { allowedDirs: [], errors: [] }),
		).rejects.toThrow();
	});
});

it.each([
	["bmp", Buffer.from("BMabcdef")],
	["gif", Buffer.from("GIF89abcdef")],
])("allows %s only for post-order documents", async (ext, bytes) => {
	const name = path.join(fixture.root, `label.${ext}`);
	await writeFile(name, bytes);
	expect(
		(await loadLocalMedia(name, "postOrderDocument", access)).bytes,
	).toEqual(bytes);
	await expect(loadLocalMedia(name, "document", access)).rejects.toThrow();
});

it.each([
	"image",
	"video",
] satisfies LocalMediaKind[])("does not allow PDFs as %s", async (kind) => {
	const name = path.join(fixture.root, "not-an-image.pdf");
	await writeFile(name, "%PDF-1.7");
	await expect(loadLocalMedia(name, kind, access)).rejects.toThrow();
});
