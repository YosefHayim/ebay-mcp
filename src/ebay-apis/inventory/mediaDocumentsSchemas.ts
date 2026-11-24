import { z } from "zod";

const nonempty = z
	.string()
	.min(1)
	.regex(/\S/, "Must contain a non-whitespace character");
const httpsUrl = z
	.string()
	.url()
	.regex(/^https:\/\//i, "An HTTPS URL is required");
const documentMetadata = {
	documentType: nonempty.describe(
		"eBay DocumentTypeEnum, e.g. USER_GUIDE_OR_MANUAL",
	),
	languages: z
		.array(nonempty)
		.min(1)
		.describe("eBay LanguageEnum values, e.g. ENGLISH"),
};
const localPath = nonempty.describe(
	"Absolute path or media:// reference inside the media allowlist",
);

export const createImageFromUrlInputSchema = z.object({ imageUrl: httpsUrl });
export const createDocumentInputSchema = z.object(documentMetadata);
export const createDocumentFromUrlInputSchema = z.object({
	...documentMetadata,
	documentUrl: httpsUrl,
});
export const documentIdInputSchema = z.object({ documentId: nonempty });
export const uploadDocumentInputSchema = z.object({
	documentId: nonempty,
	path: localPath,
});
export const postOrderDocumentMetadataSchema = z.object({
	documentUsageType: nonempty.describe(
		"Document usage, e.g. RETURN_SHIPPING_LABEL",
	),
	entityType: nonempty.describe("Post-order entity type, e.g. RETURNS"),
	entityId: nonempty.describe("Identifier of the post-order entity"),
});
export const uploadPostOrderDocumentInputSchema = z.object({
	...postOrderDocumentMetadataSchema.shape,
	path: localPath,
});
