import { z } from '@/utils/effectSchema.js';

const nonempty = z.string().min(1).regex(/\S/, 'Must contain a non-whitespace character');
const httpsUrl = z
  .string()
  .url()
  .regex(/^https:\/\//i, 'An HTTPS URL is required');
const documentMetadata = {
  documentType: nonempty.describe('eBay DocumentTypeEnum, e.g. USER_GUIDE_OR_MANUAL'),
  languages: z.array(nonempty).min(1).describe('eBay LanguageEnum values, e.g. ENGLISH'),
};
const localPath = nonempty.describe(
  'Absolute path or media:// reference inside the media allowlist',
);

/** Input for creating an EPS image from a remotely hosted image. */
export const createImageFromUrlInputSchema = z.object({ imageUrl: httpsUrl });
/** Metadata for staging a listing document. */
export const createDocumentInputSchema = z.object(documentMetadata);
/** Metadata and HTTPS source for creating a listing document. */
export const createDocumentFromUrlInputSchema = z.object({
  ...documentMetadata,
  documentUrl: httpsUrl,
});
/** Identifier for a listing or post-order document. */
export const documentIdInputSchema = z.object({ documentId: nonempty });
/** Local upload for an already staged listing document. */
export const uploadDocumentInputSchema = z.object({ documentId: nonempty, path: localPath });
/** Post-order association metadata sent as multipart fields. */
export const postOrderDocumentMetadataSchema = z.object({
  documentUsageType: nonempty.describe('Document usage, e.g. RETURN_SHIPPING_LABEL'),
  entityType: nonempty.describe('Post-order entity type, e.g. RETURNS'),
  entityId: nonempty.describe('Identifier of the post-order entity'),
});
/** Local document and its post-order association metadata. */
export const uploadPostOrderDocumentInputSchema = z.object({
  ...postOrderDocumentMetadataSchema.shape,
  path: localPath,
});
