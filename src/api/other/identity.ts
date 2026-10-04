import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { EbayApiError } from '@/api/shared/request.js';
import { getIdentityBaseUrl } from '@/config/environment.js';
import type { components } from '@/types/sell-apps/other-apis/commerceIdentityV1Oas3.js';
import { Effect } from 'effect';

/** Input accepted by Identity API getUser. */
export type GetUserInput = Record<string, never>;

/**
 * Response returned by getUser.
 *
 * @see https://developer.ebay.com/api-docs/commerce/identity/resources/user/methods/getUser
 */
export type UserResponse = components['schemas']['UserResponse'];

/** Identity API - user identity verification through the apiz host. */
export class IdentityApi {
  private readonly basePath = '/commerce/identity/v1';

  public constructor(private readonly client: EbayApiClient) {}

  /**
   * Retrieves account profile information for the authenticated user.
   *
   * @param input - Empty endpoint input object.
   * @returns An Effect that succeeds with eBay's UserResponse.
   *
   * @example
   * ```ts
   * const user = await Effect.runPromise(identityApi.getUser({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/identity/resources/user/methods/getUser
   */
  public getUser = (input: GetUserInput = {}): Effect.Effect<UserResponse, EbayApiError> => {
    void input;
    const client = this.client;

    return Effect.tryPromise({
      try: () => {
        const config = client.getConfig();
        const identityBaseUrl = getIdentityBaseUrl(config.environment, config.apiBaseUrl);

        return client.getWithFullUrl<UserResponse>(`${identityBaseUrl}${this.basePath}/user`);
      },
      catch: (cause) =>
        new EbayApiError({
          method: 'GET',
          path: `${this.basePath}/user`,
          cause,
        }),
    });
  };
}
