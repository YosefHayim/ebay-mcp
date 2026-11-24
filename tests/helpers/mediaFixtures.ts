import { mkdir, mkdtemp, realpath, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export const JPEG_BYTES = Buffer.concat([
	Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]),
	Buffer.from("JFIF", "latin1"),
	Buffer.alloc(32, 0),
]);
export const PNG_BYTES = Buffer.concat([
	Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
	Buffer.alloc(32, 0),
]);
export const MP4_BYTES = Buffer.concat([
	Buffer.from([0x00, 0x00, 0x00, 0x18]),
	Buffer.from("ftypisom", "latin1"),
	Buffer.alloc(32, 0),
]);
export const MOV_BYTES = Buffer.concat([
	Buffer.from([0x00, 0x00, 0x00, 0x14]),
	Buffer.from("ftypqt  ", "latin1"),
	Buffer.alloc(32, 0),
]);

export function isoHeader(brand: string): Buffer {
	return Buffer.concat([
		Buffer.from([0x00, 0x00, 0x00, 0x18]),
		Buffer.from(`ftyp${brand}`, "latin1"),
		Buffer.alloc(16, 0),
	]);
}

export interface MediaFixture {
	readonly root: string;
	readonly outside: string;
	readonly jpeg: string;
	readonly png: string;
	readonly mp4: string;
	readonly mismatched: string;
	readonly text: string;
	readonly escapingLink: string;
	readonly outsideJpeg: string;
}

export async function createMediaFixture(): Promise<MediaFixture> {
	// realpath: macOS puts the temp dir behind a /var → /private/var symlink.
	const base = await realpath(
		await mkdtemp(path.join(tmpdir(), "ebay-mcp-media-")),
	);
	const root = path.join(base, "media");
	const outside = path.join(base, "outside");
	await mkdir(path.join(root, "nested"), { recursive: true });
	await mkdir(outside, { recursive: true });

	const jpeg = path.join(root, "front.jpg");
	const png = path.join(root, "nested", "back.png");
	const mp4 = path.join(root, "clip.mp4");
	const mismatched = path.join(root, "fake.jpg");
	const text = path.join(root, "notes.txt");
	const outsideJpeg = path.join(outside, "secret.jpg");
	const escapingLink = path.join(root, "escape.jpg");

	await writeFile(jpeg, JPEG_BYTES);
	await writeFile(png, PNG_BYTES);
	await writeFile(mp4, MP4_BYTES);
	await writeFile(mismatched, PNG_BYTES);
	await writeFile(text, "not media");
	await writeFile(outsideJpeg, JPEG_BYTES);
	await symlink(outsideJpeg, escapingLink);

	return {
		root,
		outside,
		jpeg,
		png,
		mp4,
		mismatched,
		text,
		escapingLink,
		outsideJpeg,
	};
}
