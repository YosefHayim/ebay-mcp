import type { EbayApiClient } from '@/api/client.js';
import { EbayApiError, EndpointInputError } from '@/api/shared/request.js';
import { getIdentityBaseUrl, getMediaBaseUrl } from '@/config/environment.js';
import {
  createDocumentFromUrlInputSchema,
  createDocumentInputSchema,
  createImageFromUrlInputSchema,
  documentIdInputSchema,
  postOrderDocumentMetadataSchema,
} from '@/schemas/inventory-management/mediaDocuments.js';
import type { components } from '@/types/sell-apps/listing-management/commerceMediaV1BetaOas3.js';
import { decodeEffectSchema } from '@/utils/effectSchema.js';
import type { InferEffectSchema } from '@/utils/effectSchemaTypes.js';
import { Effect } from 'effect';
import type { MediaUpload } from './media.js';

const BASE_PATH = '/commerce/media/v1_beta';
const UPLOAD_TIMEOUT_MS = 10 * 60_000;
type CreateDocumentInput = InferEffectSchema<typeof createDocumentInputSchema>;
type CreateDocumentFromUrlInput = InferEffectSchema<typeof createDocumentFromUrlInputSchema>;
type CreateImageFromUrlInput = InferEffectSchema<typeof createImageFromUrlInputSchema>;
type DocumentIdInput = InferEffectSchema<typeof documentIdInputSchema>;
type PostOrderMetadata = InferEffectSchema<typeof postOrderDocumentMetadataSchema>;

/** Created listing document. @see https://developer.ebay.com/api-docs/commerce/media/resources/document/methods/createDocument */
export type CreateDocumentResponse = components['schemas']['CreateDocumentResponse'];
/** Listing document status and metadata. @see https://developer.ebay.com/api-docs/commerce/media/resources/document/methods/getDocument */
export type DocumentResponse = components['schemas']['DocumentResponse'];

const inputFailure = (cause: { message: string }) =>
  new EndpointInputError({ parameter: 'input', message: cause.message });

const uploadForm = (file: MediaUpload): FormData => {
  const form = new FormData();
  form.append(
    'file',
    new Blob([new Uint8Array(file.bytes)], { type: file.mimeType }),
    file.fileName,
  );
  return form;
};

const locationId = (location: string | undefined, path: string) =>
  Effect.try({
    try: () => {
      if (!location) {
        throw new Error('eBay returned no Location header');
      }
      const url = new URL(location);
      const prefix = `${path}/`;
      const segment = url.pathname.slice(prefix.length);
      if (
        url.protocol !== 'https:' ||
        !url.pathname.startsWith(prefix) ||
        !segment ||
        segment.includes('/')
      ) {
        throw new Error('eBay returned an invalid resource Location');
      }
      return { location, id: decodeURIComponent(segment) };
    },
    catch: (cause) => new EbayApiError({ method: 'POST', path, cause }),
  });

/**
 * Creates endpoint methods for image URLs and documents on the Media API.
 * @param client - Shared authenticated HTTP client.
 * @returns Endpoint Effects composed into MediaApi.
 */
export const createMediaResourceMethods = (client: EbayApiClient) => {
  const url = (path: string, postOrder = false) => {
    const config = client.getConfig();
    const base = postOrder
      ? getIdentityBaseUrl(config.environment, config.apiBaseUrl)
      : getMediaBaseUrl(config.environment, config.apiBaseUrl);
    return `${base}${BASE_PATH}${path}`;
  };
  const failure = (method: 'GET' | 'POST' | 'DELETE', path: string) => (cause: unknown) =>
    new EbayApiError({ method, path: `${BASE_PATH}${path}`, cause });

  /**
   * Creates an EPS image from an HTTPS URL, retaining its resource identifier.
   * @param input - HTTPS image source.
   * @returns Generated image payload and Location metadata.
   * @example media.createImageFromUrl({ imageUrl: 'https://example.com/front.jpg' })
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/image/methods/createImageFromUrl
   */
  const createImageFromUrl = (input: CreateImageFromUrlInput) =>
    Effect.gen(function* () {
      const body = yield* decodeEffectSchema(createImageFromUrlInputSchema, input).pipe(
        Effect.mapError(inputFailure),
      );
      const path = '/image/create_image_from_url';
      const response = yield* Effect.tryPromise({
        try: () =>
          client.postForResponse<components['schemas']['ImageResponse']>(url(path), body, {
            absolute: true,
          }),
        catch: failure('POST', path),
      });
      const resource = yield* locationId(response.headers.location, `${BASE_PATH}/image`);
      return { imageId: resource.id, location: resource.location, image: response.data };
    });

  /**
   * Stages a listing document for subsequent upload.
   * @param input - Document type and languages.
   * @returns Generated creation response with the document ID.
   * @example media.createDocument({ documentType: 'USER_GUIDE_OR_MANUAL', languages: ['ENGLISH'] })
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/document/methods/createDocument
   */
  const createDocument = (input: CreateDocumentInput) =>
    Effect.gen(function* () {
      const body = yield* decodeEffectSchema(createDocumentInputSchema, input).pipe(
        Effect.mapError(inputFailure),
      );
      return yield* Effect.tryPromise({
        try: () => client.post<CreateDocumentResponse>(url('/document'), body, { absolute: true }),
        catch: failure('POST', '/document'),
      });
    });

  /**
   * Creates a listing document from an HTTPS source.
   * @param input - Source URL, document type and languages.
   * @returns Generated creation response; use getDocument to check acceptance.
   * @example media.createDocumentFromUrl({ documentUrl: 'https://example.com/manual.pdf', documentType: 'USER_GUIDE_OR_MANUAL', languages: ['ENGLISH'] })
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/document/methods/createDocumentFromUrl
   */
  const createDocumentFromUrl = (input: CreateDocumentFromUrlInput) =>
    Effect.gen(function* () {
      const body = yield* decodeEffectSchema(createDocumentFromUrlInputSchema, input).pipe(
        Effect.mapError(inputFailure),
      );
      const path = '/document/create_document_from_url';
      return yield* Effect.tryPromise({
        try: () => client.post<CreateDocumentResponse>(url(path), body, { absolute: true }),
        catch: failure('POST', path),
      });
    });

  /**
   * Retrieves the status and metadata of a listing document.
   * @param input - Document identifier.
   * @returns Generated document response.
   * @example media.getDocument({ documentId: 'DOC-1' })
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/document/methods/getDocument
   */
  const getDocument = (input: DocumentIdInput) =>
    Effect.gen(function* () {
      const { documentId } = yield* decodeEffectSchema(documentIdInputSchema, input).pipe(
        Effect.mapError(inputFailure),
      );
      const path = `/document/${encodeURIComponent(documentId)}`;
      return yield* Effect.tryPromise({
        try: () => client.get<DocumentResponse>(url(path), undefined, { absolute: true }),
        catch: failure('GET', path),
      });
    });

  /**
   * Uploads bytes for a previously staged listing document.
   * @param input - Document ID and validated local file.
   * @returns Generated document status and metadata.
   * @example media.uploadDocument({ documentId: 'DOC-1', file })
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/document/methods/uploadDocument
   */
  const uploadDocument = (input: DocumentIdInput & { file: MediaUpload }) =>
    Effect.gen(function* () {
      const { documentId } = yield* decodeEffectSchema(documentIdInputSchema, input).pipe(
        Effect.mapError(inputFailure),
      );
      const path = `/document/${encodeURIComponent(documentId)}/upload`;
      return yield* Effect.tryPromise({
        try: () =>
          client.post<DocumentResponse>(url(path), uploadForm(input.file), {
            absolute: true,
            timeoutMs: UPLOAD_TIMEOUT_MS,
          }),
        catch: failure('POST', path),
      });
    });

  /**
   * Uploads a document for a post-order entity without publishing it.
   * @param input - Validated file and post-order association fields.
   * @returns Document ID and Location captured from the header-only response.
   * @example media.uploadPostOrderDocument({ file, documentUsageType: 'RETURN_SHIPPING_LABEL', entityType: 'RETURNS', entityId: 'R-1' })
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/post_order/methods/uploadPostOrderDocument
   */
  const uploadPostOrderDocument = (input: PostOrderMetadata & { file: MediaUpload }) =>
    Effect.gen(function* () {
      const metadata = yield* decodeEffectSchema(postOrderDocumentMetadataSchema, input).pipe(
        Effect.mapError(inputFailure),
      );
      const form = uploadForm(input.file);
      for (const [key, value] of Object.entries(metadata)) {
        form.append(key, value);
      }
      const path = '/post_order/document';
      const response = yield* Effect.tryPromise({
        try: () =>
          client.postForResponse<unknown>(url(path, true), form, {
            absolute: true,
            timeoutMs: UPLOAD_TIMEOUT_MS,
          }),
        catch: failure('POST', path),
      });
      const resource = yield* locationId(response.headers.location, `${BASE_PATH}${path}`);
      return { documentId: resource.id, location: resource.location };
    });

  /**
   * Downloads post-order document bytes. The spec's string[] schema describes a binary PDF body.
   * @param input - Document identifier.
   * @returns Buffer containing the PDF; protocol formatting occurs at the MCP boundary.
   * @example media.downloadPostOrderDocument({ documentId: 'DOC-1' })
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/post_order/methods/downloadPostOrderDocument
   */
  const downloadPostOrderDocument = (input: DocumentIdInput) =>
    Effect.gen(function* () {
      const { documentId } = yield* decodeEffectSchema(documentIdInputSchema, input).pipe(
        Effect.mapError(inputFailure),
      );
      const path = `/post_order/document/${encodeURIComponent(documentId)}`;
      return yield* Effect.tryPromise({
        try: () =>
          client.get<Buffer>(url(path, true), undefined, {
            absolute: true,
            responseType: 'arraybuffer',
            headers: { Accept: 'application/pdf' },
          }),
        catch: failure('GET', path),
      });
    });

  /**
   * Removes a submitted post-order document. eBay rejects removal after publication.
   * @param input - Document identifier.
   * @returns An Effect completing on the empty HTTP 204 response.
   * @example media.removePostOrderDocument({ documentId: 'DOC-1' })
   * @see https://developer.ebay.com/api-docs/commerce/media/resources/post_order/methods/removePostOrderDocument
   */
  const removePostOrderDocument = (input: DocumentIdInput) =>
    Effect.gen(function* () {
      const { documentId } = yield* decodeEffectSchema(documentIdInputSchema, input).pipe(
        Effect.mapError(inputFailure),
      );
      const path = `/post_order/document/${encodeURIComponent(documentId)}`;
      yield* Effect.tryPromise({
        try: () => client.delete<void>(url(path, true), { absolute: true }),
        catch: failure('DELETE', path),
      });
    });

  return {
    createImageFromUrl,
    createDocument,
    createDocumentFromUrl,
    getDocument,
    uploadDocument,
    uploadPostOrderDocument,
    downloadPostOrderDocument,
    removePostOrderDocument,
  };
};
