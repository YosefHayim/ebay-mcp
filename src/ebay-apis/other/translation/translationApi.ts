import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	requestPostEffect,
	requireObjectEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/commerceTranslationV1BetaOas3.js";

export type TranslateInput = components["schemas"]["TranslateRequest"];

export type TranslateResponse = components["schemas"]["TranslateResponse"];

export class TranslationApi {
	private readonly basePath = "/commerce/translation/v1_beta";

	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	public translate = async (
		input: TranslateInput,
	): Promise<TranslateResponse> => {
		const client = this.client;
		const path = `${this.basePath}/translate`;

		const translateRequest = requireObjectEffect<TranslateInput>(
			input,
			"input",
		);

		return requestPostEffect<TranslateResponse>(client, path, translateRequest);
	};
}
