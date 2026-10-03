import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  type EbayApiError,
  type EndpointInputError,
  requestPostEffect,
  requireObjectEffect,
} from '@/api/shared/request.js';
import type { components } from '@/types/sell-apps/other-apis/commerceTranslationV1BetaOas3.js';
import { Effect } from 'effect';

/**
 * Request body accepted by eBay Commerce Translation API translate.
 *
 * @see https://developer.ebay.com/api-docs/commerce/translation/resources/translate/methods/translate
 */
export type TranslateInput = components['schemas']['TranslateRequest'];

/**
 * Response returned by translate.
 *
 * @see https://developer.ebay.com/api-docs/commerce/translation/resources/translate/methods/translate
 */
export type TranslateResponse = components['schemas']['TranslateResponse'];

/** Translation API - listing title and description translation. */
export class TranslationApi {
  private readonly basePath = '/commerce/translation/v1';

  public constructor(private readonly client: EbayApiClient) {}

  /**
   * Translates listing title or description text from one language into another.
   *
   * @param input - Generated TranslateRequest body.
   * @returns An Effect that succeeds with eBay's TranslateResponse.
   *
   * @example
   * ```ts
   * const translated = await Effect.runPromise(
   *   translationApi.translate({
   *     from: 'en',
   *     to: 'es',
   *     translationContext: 'ITEM_TITLE',
   *     text: ['Hello'],
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/translation/resources/translate/methods/translate
   */
  public translate = (
    input: TranslateInput,
  ): Effect.Effect<TranslateResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/translate`;

    return Effect.gen(function* () {
      const translateRequest = yield* requireObjectEffect<TranslateInput>(input, 'input');

      return yield* requestPostEffect<TranslateResponse>(client, path, translateRequest);
    });
  };
}
