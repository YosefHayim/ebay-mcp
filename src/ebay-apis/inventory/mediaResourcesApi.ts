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

export type CreateDocumentResponse =
	components["schemas"]["CreateDocumentResponse"];
export type DocumentResponse = components["schemas"]["DocumentResponse"];

function uploadForm(file: MediaUpload): FormData {
	const form = new FormData();
	form.append(
		"file",
		new Blob([new Uint8Array(file.bytes)], { type: file.mimeType }),
		file.fileName,
	);
	return form;
}

export function createMediaResourceMethods(client: EbayApiClient) {
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
}
