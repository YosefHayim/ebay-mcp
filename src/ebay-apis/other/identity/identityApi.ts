import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import { EbayApiError } from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/commerceIdentityV1Oas3.js";
import { getIdentityBaseUrl } from "@/shared/environment.js";

/** Input accepted by Identity API getUser. */
export type GetUserInput = Record<string, never>;

/**
 * Response returned by getUser.
 *
 * @see https://developer.ebay.com/api-docs/commerce/identity/resources/user/methods/getUser
 */
export type UserResponse = components["schemas"]["UserResponse"];

/** Identity API - user identity verification through the apiz host. */
export class IdentityApi {
	private readonly basePath = "/commerce/identity/v1";

	public constructor(private readonly client: EbayApiClient) {}

	/**
	 * Retrieves account profile information for the authenticated user.
	 *
	 * @param input - Empty endpoint input object.
	 * @returns A promise of eBay's UserResponse.
	 *
	 * @example
	 * ```ts
	 * const user = await identityApi.getUser({});
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/identity/resources/user/methods/getUser
	 */
	public getUser = async (input: GetUserInput = {}): Promise<UserResponse> => {
		void input;

		try {
			const config = this.client.getConfig();
			const identityBaseUrl = getIdentityBaseUrl(
				config.environment,
				config.apiBaseUrl,
			);

			return await this.client.getWithFullUrl<UserResponse>(
				`${identityBaseUrl}${this.basePath}/user`,
			);
		} catch (error) {
			throw new EbayApiError({
				method: "GET",
				path: `${this.basePath}/user`,
				cause: error,
			});
		}
	};
}
