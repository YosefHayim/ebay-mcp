import type { z } from "zod";
import {
	createDocumentFromUrlInputSchema,
	createDocumentInputSchema,
	createImageFromUrlInputSchema,
	documentIdInputSchema,
	postOrderDocumentMetadataSchema,
} from "@/ebay-apis/inventory/mediaDocumentsSchemas.js";
import type {
	EbayApiClient,
	EbayResponse,
} from "@/ebay-client/ebayApiClient.js";
import { locatedResourceId } from "@/ebay-client/location.js";
import {
	createEbayRequestFailure,
	decodeEndpointInputEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/commerceMediaV1BetaOas3.js";
import { getIdentityBaseUrl, getMediaBaseUrl } from "@/shared/environment.js";
import type { MediaUpload } from "./mediaApi.js";

const BASE_PATH = "/commerce/media/v1_beta";
const UPLOAD_TIMEOUT_MS = 10 * 60_000;
type CreateDocumentInput = z.infer<typeof createDocumentInputSchema>;
type CreateDocumentFromUrlInput = z.infer<
	typeof createDocumentFromUrlInputSchema
>;
type CreateImageFromUrlInput = z.infer<typeof createImageFromUrlInputSchema>;
type DocumentIdInput = z.infer<typeof documentIdInputSchema>;
type PostOrderMetadata = z.infer<typeof postOrderDocumentMetadataSchema>;

/** Created listing document. @see https://developer.ebay.com/api-docs/commerce/media/resources/document/methods/createDocument */
export type CreateDocumentResponse =
	components["schemas"]["CreateDocumentResponse"];
/** Listing document status and metadata. @see https://developer.ebay.com/api-docs/commerce/media/resources/document/methods/getDocument */
export type DocumentResponse = components["schemas"]["DocumentResponse"];

const uploadForm = (file: MediaUpload): FormData => {
	const form = new FormData();
	form.append(
		"file",
		new Blob([new Uint8Array(file.bytes)], { type: file.mimeType }),
		file.fileName,
	);
	return form;
};

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
	const failure =
		(method: "GET" | "POST" | "DELETE", path: string) => (cause: unknown) =>
			createEbayRequestFailure(method, `${BASE_PATH}${path}`, cause);

	/**
	 * Creates an EPS image from an HTTPS URL, retaining its resource identifier.
	 * @param input - HTTPS image source.
	 * @returns Generated image payload and Location metadata.
	 * @example media.createImageFromUrl({ imageUrl: 'https://example.com/front.jpg' })
	 * @see https://developer.ebay.com/api-docs/commerce/media/resources/image/methods/createImageFromUrl
	 */
	const createImageFromUrl = async (input: CreateImageFromUrlInput) => {
		const imageSource = decodeEndpointInputEffect(
			createImageFromUrlInputSchema,
			input,
		);
		const path = "/image/create_image_from_url";

		var imageResponse: EbayResponse<components["schemas"]["ImageResponse"]>;

		try {
			imageResponse = await client.postForResponse<
				components["schemas"]["ImageResponse"]
			>(url(path), imageSource, {
				absolute: true,
			});
		} catch (cause) {
			throw failure("POST", path)(cause);
		}

		const resource = locatedResourceId(
			imageResponse.headers["location"],
			`${BASE_PATH}/image`,
		);

		return {
			imageId: resource.id,
			location: resource.location,
			image: imageResponse.data,
		};
	};

	/**
	 * Stages a listing document for subsequent upload.
	 * @param input - Document type and languages.
	 * @returns Generated creation response with the document ID.
	 * @example media.createDocument({ documentType: 'USER_GUIDE_OR_MANUAL', languages: ['ENGLISH'] })
	 * @see https://developer.ebay.com/api-docs/commerce/media/resources/document/methods/createDocument
	 */
	const createDocument = async (input: CreateDocumentInput) => {
		const documentRequest = decodeEndpointInputEffect(
			createDocumentInputSchema,
			input,
		);

		try {
			return await client.post<CreateDocumentResponse>(
				url("/document"),
				documentRequest,
				{
					absolute: true,
				},
			);
		} catch (cause) {
			throw failure("POST", "/document")(cause);
		}
	};

	/**
	 * Creates a listing document from an HTTPS source.
	 * @param input - Source URL, document type and languages.
	 * @returns Generated creation response; use getDocument to check acceptance.
	 * @example media.createDocumentFromUrl({ documentUrl: 'https://example.com/manual.pdf', documentType: 'USER_GUIDE_OR_MANUAL', languages: ['ENGLISH'] })
	 * @see https://developer.ebay.com/api-docs/commerce/media/resources/document/methods/createDocumentFromUrl
	 */
	const createDocumentFromUrl = async (input: CreateDocumentFromUrlInput) => {
		const documentRequest = decodeEndpointInputEffect(
			createDocumentFromUrlInputSchema,
			input,
		);
		const path = "/document/create_document_from_url";

		try {
			return await client.post<CreateDocumentResponse>(
				url(path),
				documentRequest,
				{
					absolute: true,
				},
			);
		} catch (cause) {
			throw failure("POST", path)(cause);
		}
	};

	/**
	 * Retrieves the status and metadata of a listing document.
	 * @param input - Document identifier.
	 * @returns Generated document response.
	 * @example media.getDocument({ documentId: 'DOC-1' })
	 * @see https://developer.ebay.com/api-docs/commerce/media/resources/document/methods/getDocument
	 */
	const getDocument = async (input: DocumentIdInput) => {
		const { documentId } = decodeEndpointInputEffect(
			documentIdInputSchema,
			input,
		);
		const path = `/document/${encodeURIComponent(documentId)}`;

		try {
			return await client.get<DocumentResponse>(url(path), undefined, {
				absolute: true,
			});
		} catch (cause) {
			throw failure("GET", path)(cause);
		}
	};

	/**
	 * Uploads bytes for a previously staged listing document.
	 * @param input - Document ID and validated local file.
	 * @returns Generated document status and metadata.
	 * @example media.uploadDocument({ documentId: 'DOC-1', file })
	 * @see https://developer.ebay.com/api-docs/commerce/media/resources/document/methods/uploadDocument
	 */
	const uploadDocument = async (
		input: DocumentIdInput & { file: MediaUpload },
	) => {
		const { documentId } = decodeEndpointInputEffect(
			documentIdInputSchema,
			input,
		);
		const path = `/document/${encodeURIComponent(documentId)}/upload`;

		try {
			return await client.post<DocumentResponse>(
				url(path),
				uploadForm(input.file),
				{
					absolute: true,
					timeoutMs: UPLOAD_TIMEOUT_MS,
				},
			);
		} catch (cause) {
			throw failure("POST", path)(cause);
		}
	};

	/**
	 * Uploads a document for a post-order entity without publishing it.
	 * @param input - Validated file and post-order association fields.
	 * @returns Document ID and Location captured from the header-only response.
	 * @example media.uploadPostOrderDocument({ file, documentUsageType: 'RETURN_SHIPPING_LABEL', entityType: 'RETURNS', entityId: 'R-1' })
	 * @see https://developer.ebay.com/api-docs/commerce/media/resources/post_order/methods/uploadPostOrderDocument
	 */
	const uploadPostOrderDocument = async (
		input: PostOrderMetadata & { file: MediaUpload },
	) => {
		const metadata = decodeEndpointInputEffect(
			postOrderDocumentMetadataSchema,
			input,
		);
		const form = uploadForm(input.file);

		for (const [fieldName, fieldValue] of Object.entries(metadata)) {
			form.append(fieldName, fieldValue);
		}

		const path = "/post_order/document";

		var uploadResponse: EbayResponse<unknown>;

		try {
			uploadResponse = await client.postForResponse<unknown>(
				url(path, true),
				form,
				{
					absolute: true,
					timeoutMs: UPLOAD_TIMEOUT_MS,
				},
			);
		} catch (cause) {
			throw failure("POST", path)(cause);
		}

		const resource = locatedResourceId(
			uploadResponse.headers["location"],
			`${BASE_PATH}${path}`,
		);

		return { documentId: resource.id, location: resource.location };
	};

	/**
	 * Downloads post-order document bytes. The spec's string[] schema describes a binary PDF body.
	 * @param input - Document identifier.
	 * @returns Buffer containing the PDF; protocol formatting occurs at the MCP boundary.
	 * @example media.downloadPostOrderDocument({ documentId: 'DOC-1' })
	 * @see https://developer.ebay.com/api-docs/commerce/media/resources/post_order/methods/downloadPostOrderDocument
	 */
	const downloadPostOrderDocument = async (input: DocumentIdInput) => {
		const { documentId } = decodeEndpointInputEffect(
			documentIdInputSchema,
			input,
		);
		const path = `/post_order/document/${encodeURIComponent(documentId)}`;

		try {
			return await client.get<Buffer>(url(path, true), undefined, {
				absolute: true,
				responseType: "arraybuffer",
				headers: { Accept: "application/pdf" },
			});
		} catch (cause) {
			throw failure("GET", path)(cause);
		}
	};

	/**
	 * Removes a submitted post-order document. eBay rejects removal after publication.
	 * @param input - Document identifier.
	 * @returns An Effect completing on the empty HTTP 204 response.
	 * @example media.removePostOrderDocument({ documentId: 'DOC-1' })
	 * @see https://developer.ebay.com/api-docs/commerce/media/resources/post_order/methods/removePostOrderDocument
	 */
	const removePostOrderDocument = async (input: DocumentIdInput) => {
		const { documentId } = decodeEndpointInputEffect(
			documentIdInputSchema,
			input,
		);
		const path = `/post_order/document/${encodeURIComponent(documentId)}`;

		try {
			await client.delete<void>(url(path, true), { absolute: true });
		} catch (cause) {
			throw failure("DELETE", path)(cause);
		}
	};

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
