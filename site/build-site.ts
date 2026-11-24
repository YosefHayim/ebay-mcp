import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { toSSG } from "hono/ssg";
import { createToolCatalog } from "../scripts/buildToolCatalog.ts";
import type { SiteAssets } from "./site-assets.ts";

const siteFolder = path.dirname(fileURLToPath(import.meta.url));
const repoFolder = path.dirname(siteFolder);
const distFolder = path.join(siteFolder, "dist");
const iconsFolder = path.join(repoFolder, "assets", "icons");
const SHORT_HASH_LENGTH = 8;

const createShortHash = (hashedText: string): string =>
	createHash("sha256")
		.update(hashedText)
		.digest("hex")
		.slice(0, SHORT_HASH_LENGTH);

const bundleBrowserScript = async (): Promise<string> => {
	const browserBuild = await build({
		entryPoints: [path.join(siteFolder, "page-script.ts")],
		outdir: distFolder,
		entryNames: "[name]-[hash]",
		metafile: true,
		bundle: true,
		format: "esm",
		platform: "browser",
		target: "es2022",
		minify: true,
		tsconfig: path.join(siteFolder, "tsconfig.json"),
		define: { "process.env.NODE_ENV": '"production"' },
		alias: { "@site": siteFolder },
		logLevel: "info",
	});

	const outputs = Object.entries(browserBuild.metafile.outputs);
	const entryOutput = outputs.find(([, output]) =>
		output.entryPoint?.endsWith("page-script.ts"),
	);
	const isEntryMissing = entryOutput == null;
	if (isEntryMissing) throw new Error("esbuild wrote no page script entry");

	return path.basename(entryOutput[0]);
};

const writeStylesFile = async (): Promise<string> => {
	const stylesText = await fs.readFile(
		path.join(siteFolder, "styles.css"),
		"utf8",
	);
	const stylesFile = `styles-${createShortHash(stylesText)}.css`;
	await fs.writeFile(path.join(distFolder, stylesFile), stylesText);

	return stylesFile;
};

const writeCatalogFile = async (catalogText: string): Promise<string> => {
	const catalogFile = `tool-catalog-${createShortHash(catalogText)}.json`;
	await fs.writeFile(path.join(distFolder, catalogFile), catalogText);

	return catalogFile;
};

const copyIcons = async () => {
	await fs.copyFile(
		path.join(iconsFolder, "32x32.png"),
		path.join(distFolder, "favicon-32.png"),
	);
	await fs.copyFile(
		path.join(iconsFolder, "512x512.png"),
		path.join(distFolder, "icon-512.png"),
	);
};

const writePageHtml = async (catalog: unknown, siteAssets: SiteAssets) => {
	const serverBundle = await build({
		entryPoints: [path.join(siteFolder, "site-app.tsx")],
		bundle: true,
		write: false,
		format: "esm",
		platform: "node",
		target: "node22",
		jsx: "automatic",
		jsxImportSource: "hono/jsx",
		tsconfig: path.join(siteFolder, "tsconfig.json"),
		alias: { "@site": siteFolder },
		logLevel: "info",
	});
	const [serverBundleFile] = serverBundle.outputFiles;
	const isServerBundleMissing = serverBundleFile == null;
	if (isServerBundleMissing) throw new Error("esbuild wrote no server bundle");

	const serverBundleUrl = `data:text/javascript;base64,${Buffer.from(serverBundleFile.text).toString("base64")}`;
	const { createSiteApp } = await import(serverBundleUrl);
	const siteApp = createSiteApp(catalog, siteAssets);

	const staticSiteReply = await toSSG(siteApp, fs, { dir: distFolder });
	const hasStaticSiteFailed = !staticSiteReply.success;
	if (hasStaticSiteFailed)
		throw new Error("toSSG failed", { cause: staticSiteReply.error });
};

const createSite = async () => {
	await fs.rm(distFolder, { recursive: true, force: true });
	await fs.mkdir(distFolder, { recursive: true });
	const catalog = createToolCatalog();
	const catalogText = JSON.stringify(catalog);

	const scriptFile = await bundleBrowserScript();
	const stylesFile = await writeStylesFile();
	const catalogFile = await writeCatalogFile(catalogText);
	await copyIcons();
	await writePageHtml(catalog, { scriptFile, stylesFile, catalogFile });
};

await createSite();
