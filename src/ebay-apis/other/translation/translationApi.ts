import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	requestPostEffect,
	requireObjectEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/commerceTranslationV1BetaOas3.js";

/**
 * Request body accepted by eBay Commerce Translation API translate.
 *
 * @see https://developer.ebay.com/api-docs/commerce/translation/resources/translate/methods/translate
 */
export type TranslateInput = components["schemas"]["TranslateRequest"];

/**
 * Response returned by translate.
 *
 * @see https://developer.ebay.com/api-docs/commerce/translation/resources/translate/methods/translate
 */
export type TranslateResponse = components["schemas"]["TranslateResponse"];

/** Translation API - listing title and description translation. */
export class TranslationApi {
	private readonly basePath = "/commerce/translation/v1_beta";

	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	/**
	 * Translates listing title or description text from one language into another.
	 *
	 * @param input - Generated TranslateRequest body.
	 * @returns A promise of eBay's TranslateResponse.
	 *
	 * @example
	 * ```ts
	 * const translated = await translationApi.translate({
	 *   from: "en",
	 *   to: "es",
	 *   translationContext: "ITEM_TITLE",
	 *   text: ["Hello"],
	 * });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/translation/resources/translate/methods/translate
	 */
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
