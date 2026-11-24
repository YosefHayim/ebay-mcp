import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import { createEbayRequestFailure } from "@/ebay-client/request.js";

import type { components } from "@/ebay-openapi-types/commerceIdentityV1Oas3.js";
import { getIdentityBaseUrl } from "@/shared/environment.js";

export type GetUserInput = Record<string, never>;

export type UserResponse = components["schemas"]["UserResponse"];

export class IdentityApi {
	private readonly basePath = "/commerce/identity/v1";

	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

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
			throw createEbayRequestFailure("GET", `${this.basePath}/user`, error);
		}
	};
}
