import type { z } from "zod";
import type {
	createDestinationSchema,
	createSubscriptionFilterSchema,
	createSubscriptionSchema,
	deleteDestinationSchema,
	deleteSubscriptionFilterSchema,
	deleteSubscriptionSchema,
	disableSubscriptionSchema,
	enableSubscriptionSchema,
	getConfigSchema,
	getDestinationSchema,
	getDestinationsSchema,
	getPublicKeySchema,
	getSubscriptionFilterSchema,
	getSubscriptionSchema,
	getSubscriptionsSchema,
	getTopicSchema,
	getTopicsSchema,
	testSubscriptionSchema,
	updateConfigSchema,
	updateDestinationSchema,
	updateSubscriptionSchema,
} from "@/ebay-apis/communication/notificationHelpers.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	optionalPositiveNumberEffect,
	optionalStringEffect,
	requestDeleteEffect,
	requestGetEffect,
	requestPostEffect,
	requestPutEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/commerceNotificationV1Oas3.js";

type GetPublicKeyInput = z.infer<typeof getPublicKeySchema>;
type GetConfigInput = z.infer<typeof getConfigSchema>;
type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
type GetDestinationsInput = z.infer<typeof getDestinationsSchema>;
type CreateDestinationInput = z.infer<typeof createDestinationSchema>;
type GetDestinationInput = z.infer<typeof getDestinationSchema>;
type UpdateDestinationInput = z.infer<typeof updateDestinationSchema>;
type DeleteDestinationInput = z.infer<typeof deleteDestinationSchema>;
type GetSubscriptionsInput = z.infer<typeof getSubscriptionsSchema>;
type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
type GetSubscriptionInput = z.infer<typeof getSubscriptionSchema>;
type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
type DeleteSubscriptionInput = z.infer<typeof deleteSubscriptionSchema>;
type DisableSubscriptionInput = z.infer<typeof disableSubscriptionSchema>;
type EnableSubscriptionInput = z.infer<typeof enableSubscriptionSchema>;
type TestSubscriptionInput = z.infer<typeof testSubscriptionSchema>;
type GetTopicInput = z.infer<typeof getTopicSchema>;
type GetTopicsInput = z.infer<typeof getTopicsSchema>;
type CreateSubscriptionFilterInput = z.infer<
	typeof createSubscriptionFilterSchema
>;
type GetSubscriptionFilterInput = z.infer<typeof getSubscriptionFilterSchema>;
type DeleteSubscriptionFilterInput = z.infer<
	typeof deleteSubscriptionFilterSchema
>;
/** Destination request body accepted by destination writes. */
type DestinationRequest = components["schemas"]["DestinationRequest"];
/** Subscription creation request body. */
type CreateSubscriptionRequest =
	components["schemas"]["CreateSubscriptionRequest"];
/** Subscription update request body. */
type UpdateSubscriptionRequest =
	components["schemas"]["UpdateSubscriptionRequest"];
/** Subscription filter body accepted by createSubscriptionFilter. */
type CreateSubscriptionFilterRequest = Pick<
	CreateSubscriptionFilterInput,
	"filterSchema"
>;

/**
 * Notification API configuration returned by eBay getConfig.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/config/methods/getConfig
 */
export type GetNotificationConfigResponse = components["schemas"]["Config"];
/**
 * Destination search response returned by eBay getDestinations.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/destination/methods/getDestinations
 */
export type GetNotificationDestinationsResponse =
	components["schemas"]["DestinationSearchResponse"];
/**
 * Destination response returned by eBay getDestination.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/destination/methods/getDestination
 */
export type GetNotificationDestinationResponse =
	components["schemas"]["Destination"];
/**
 * Public key response returned by eBay getPublicKey.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/public_key/methods/getPublicKey
 */
export type GetNotificationPublicKeyResponse =
	components["schemas"]["PublicKey"];
/**
 * Subscription search response returned by eBay getSubscriptions.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/getSubscriptions
 */
export type GetNotificationSubscriptionsResponse =
	components["schemas"]["SubscriptionSearchResponse"];
/**
 * Subscription response returned by eBay getSubscription.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/getSubscription
 */
export type GetNotificationSubscriptionResponse =
	components["schemas"]["Subscription"];
/**
 * Subscription filter response returned by eBay getSubscriptionFilter.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/getSubscriptionFilter
 */
export type GetNotificationSubscriptionFilterResponse =
	components["schemas"]["SubscriptionFilter"];
/**
 * Topic response returned by eBay getTopic.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/topic/methods/getTopic
 */
export type GetNotificationTopicResponse = components["schemas"]["Topic"];
/**
 * Topic search response returned by eBay getTopics.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/topic/methods/getTopics
 */
export type GetNotificationTopicsResponse =
	components["schemas"]["TopicSearchResponse"];

/**
 * Notification API - Event notifications and subscriptions
 * Based on: commerce_notification_v1_oas3.json
 */
export class NotificationApi {
	private readonly basePath = "/commerce/notification/v1";
	private readonly client: EbayApiClient;

	constructor(client: EbayApiClient) {
		this.client = client;
	}

	/**
	 * Retrieves a public key used to validate notification signatures.
	 *
	 * @param input - Public key identifier from the notification signature header.
	 * @returns eBay's generated PublicKey response.
	 *
	 * @example
	 * ```ts
	 * const key = await notificationApi.getPublicKey({ publicKeyId: 'key-123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/public_key/methods/getPublicKey
	 */
	getPublicKey = async (
		input: GetPublicKeyInput,
	): Promise<GetNotificationPublicKeyResponse> => {
		const apiClient = this.client;
		const apiBasePath = this.basePath;

		const validatedInput = requireObjectEffect<GetPublicKeyInput>(
			input,
			"input",
		);
		const validatedPublicKeyId = requireStringEffect(
			validatedInput.publicKeyId,
			"publicKeyId",
		);

		return await requestGetEffect<GetNotificationPublicKeyResponse>(
			apiClient,
			`${apiBasePath}/public_key/${validatedPublicKeyId}`,
		);
	};

	/**
	 * Retrieves the Notification API alert configuration.
	 *
	 * @param input - Empty endpoint input object.
	 * @returns eBay's generated Config response.
	 *
	 * @example
	 * ```ts
	 * const config = await notificationApi.getConfig({});
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/config/methods/getConfig
	 */
	getConfig = (
		input: GetConfigInput = {},
	): Promise<GetNotificationConfigResponse> => {
		void input;
		return requestGetEffect<GetNotificationConfigResponse>(
			this.client,
			`${this.basePath}/config`,
		);
	};

	/**
	 * Updates the Notification API alert configuration.
	 *
	 * @param input - Notification alert configuration body.
	 * @returns A promise that resolves when eBay accepts the update.
	 *
	 * @example
	 * ```ts
	 * await notificationApi.updateConfig({ alertEmail: 'ops@example.com' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/config/methods/updateConfig
	 */
	updateConfig = async (input: UpdateConfigInput): Promise<void> => {
		const apiClient = this.client;
		const path = `${this.basePath}/config`;

		const configUpdate = requireObjectEffect<UpdateConfigInput>(input, "input");

		return await requestPutEffect<void>(apiClient, path, configUpdate);
	};

	/**
	 * Retrieves configured notification destinations.
	 *
	 * @param input - Optional page size and continuation token.
	 * @returns eBay's generated DestinationSearchResponse.
	 *
	 * @example
	 * ```ts
	 * const destinations = await notificationApi.getDestinations({ limit: 20 });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/destination/methods/getDestinations
	 */
	getDestinations = async (
		input: GetDestinationsInput = {},
	): Promise<GetNotificationDestinationsResponse> => {
		const apiClient = this.client;
		const path = `${this.basePath}/destination`;

		const validatedInput = requireObjectEffect<GetDestinationsInput>(
			input,
			"input",
		);
		const limit = optionalPositiveNumberEffect(validatedInput.limit, "limit");
		const continuationToken = optionalStringEffect(
			validatedInput.continuationToken,
			"continuationToken",
		);
		const params = buildEndpointParams({
			limit: { wireName: "limit", value: limit },
			continuationToken: {
				wireName: "continuation_token",
				value: continuationToken,
			},
		});

		return await requestGetEffect<GetNotificationDestinationsResponse>(
			apiClient,
			path,
			params,
		);
	};

	/**
	 * Retrieves one notification destination.
	 *
	 * @param input - Destination identifier.
	 * @returns eBay's generated Destination response.
	 *
	 * @example
	 * ```ts
	 * const destination = await notificationApi.getDestination({ destinationId: 'dest-1' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/destination/methods/getDestination
	 */
	getDestination = async (
		input: GetDestinationInput,
	): Promise<GetNotificationDestinationResponse> => {
		const apiClient = this.client;
		const apiBasePath = this.basePath;

		const validatedInput = requireObjectEffect<GetDestinationInput>(
			input,
			"input",
		);
		const validatedDestinationId = requireStringEffect(
			validatedInput.destinationId,
			"destinationId",
		);

		return await requestGetEffect<GetNotificationDestinationResponse>(
			apiClient,
			`${apiBasePath}/destination/${validatedDestinationId}`,
		);
	};

	/**
	 * Creates a notification destination.
	 *
	 * @param input - Destination request body.
	 * @returns A promise that resolves when eBay accepts the destination.
	 *
	 * @example
	 * ```ts
	 * await notificationApi.createDestination({ name: 'webhook' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/destination/methods/createDestination
	 */
	createDestination = async (input: CreateDestinationInput): Promise<void> => {
		const apiClient = this.client;
		const path = `${this.basePath}/destination`;

		const destinationRequest = requireObjectEffect<DestinationRequest>(
			input,
			"input",
		);

		return await requestPostEffect<void>(apiClient, path, destinationRequest);
	};

	/**
	 * Updates a notification destination.
	 *
	 * @param input - Destination identifier plus destination update body fields.
	 * @returns A promise that resolves when eBay accepts the update.
	 *
	 * @example
	 * ```ts
	 * await notificationApi.updateDestination({ destinationId: 'dest-1', name: 'webhook' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/destination/methods/updateDestination
	 */
	updateDestination = async (input: UpdateDestinationInput): Promise<void> => {
		const apiClient = this.client;
		const apiBasePath = this.basePath;

		const validatedInput = requireObjectEffect<UpdateDestinationInput>(
			input,
			"input",
		);
		const { destinationId, ...destination } = validatedInput;
		const validatedDestinationId = requireStringEffect(
			destinationId,
			"destinationId",
		);
		const destinationRequest = requireObjectEffect<DestinationRequest>(
			destination,
			"destination",
		);

		return await requestPutEffect<void>(
			apiClient,
			`${apiBasePath}/destination/${validatedDestinationId}`,
			destinationRequest,
		);
	};

	/**
	 * Deletes a notification destination.
	 *
	 * @param input - Destination identifier.
	 * @returns A promise that resolves when eBay deletes the destination.
	 *
	 * @example
	 * ```ts
	 * await notificationApi.deleteDestination({ destinationId: 'dest-1' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/destination/methods/deleteDestination
	 */
	deleteDestination = async (input: DeleteDestinationInput): Promise<void> => {
		const apiClient = this.client;
		const apiBasePath = this.basePath;

		const validatedInput = requireObjectEffect<DeleteDestinationInput>(
			input,
			"input",
		);
		const validatedDestinationId = requireStringEffect(
			validatedInput.destinationId,
			"destinationId",
		);

		return await requestDeleteEffect<void>(
			apiClient,
			`${apiBasePath}/destination/${validatedDestinationId}`,
		);
	};

	/**
	 * Retrieves configured notification subscriptions.
	 *
	 * @param input - Optional page size and continuation token.
	 * @returns eBay's generated SubscriptionSearchResponse.
	 *
	 * @example
	 * ```ts
	 * const subscriptions = await notificationApi.getSubscriptions({ limit: 20 });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/getSubscriptions
	 */
	getSubscriptions = async (
		input: GetSubscriptionsInput = {},
	): Promise<GetNotificationSubscriptionsResponse> => {
		const apiClient = this.client;
		const path = `${this.basePath}/subscription`;

		const validatedInput = requireObjectEffect<GetSubscriptionsInput>(
			input,
			"input",
		);
		const limit = optionalPositiveNumberEffect(validatedInput.limit, "limit");
		const continuationToken = optionalStringEffect(
			validatedInput.continuationToken,
			"continuationToken",
		);
		const params = buildEndpointParams({
			limit: { wireName: "limit", value: limit },
			continuationToken: {
				wireName: "continuation_token",
				value: continuationToken,
			},
		});

		return await requestGetEffect<GetNotificationSubscriptionsResponse>(
			apiClient,
			path,
			params,
		);
	};

	/**
	 * Creates a notification subscription.
	 *
	 * @param input - Subscription creation request body.
	 * @returns A promise that resolves when eBay accepts the subscription.
	 *
	 * @example
	 * ```ts
	 * await notificationApi.createSubscription({ topicId: 'MARKETPLACE' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/createSubscription
	 */
	createSubscription = async (
		input: CreateSubscriptionInput,
	): Promise<void> => {
		const apiClient = this.client;
		const path = `${this.basePath}/subscription`;

		const subscriptionRequest = requireObjectEffect<CreateSubscriptionRequest>(
			input,
			"input",
		);

		return await requestPostEffect<void>(apiClient, path, subscriptionRequest);
	};

	/**
	 * Retrieves one notification subscription.
	 *
	 * @param input - Subscription identifier.
	 * @returns eBay's generated Subscription response.
	 *
	 * @example
	 * ```ts
	 * const subscription = await notificationApi.getSubscription({ subscriptionId: 'sub-1' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/getSubscription
	 */
	getSubscription = async (
		input: GetSubscriptionInput,
	): Promise<GetNotificationSubscriptionResponse> => {
		const apiClient = this.client;
		const apiBasePath = this.basePath;

		const validatedInput = requireObjectEffect<GetSubscriptionInput>(
			input,
			"input",
		);
		const validatedSubscriptionId = requireStringEffect(
			validatedInput.subscriptionId,
			"subscriptionId",
		);

		return await requestGetEffect<GetNotificationSubscriptionResponse>(
			apiClient,
			`${apiBasePath}/subscription/${validatedSubscriptionId}`,
		);
	};

	/**
	 * Updates a notification subscription.
	 *
	 * @param input - Subscription identifier plus subscription update body fields.
	 * @returns A promise that resolves when eBay accepts the update.
	 *
	 * @example
	 * ```ts
	 * await notificationApi.updateSubscription({ subscriptionId: 'sub-1', status: 'DISABLED' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/updateSubscription
	 */
	updateSubscription = async (
		input: UpdateSubscriptionInput,
	): Promise<void> => {
		const apiClient = this.client;
		const apiBasePath = this.basePath;

		const validatedInput = requireObjectEffect<UpdateSubscriptionInput>(
			input,
			"input",
		);
		const { subscriptionId, ...subscription } = validatedInput;
		const validatedSubscriptionId = requireStringEffect(
			subscriptionId,
			"subscriptionId",
		);
		const subscriptionUpdate = requireObjectEffect<UpdateSubscriptionRequest>(
			subscription,
			"subscription",
		);

		return await requestPutEffect<void>(
			apiClient,
			`${apiBasePath}/subscription/${validatedSubscriptionId}`,
			subscriptionUpdate,
		);
	};

	/**
	 * Deletes a notification subscription.
	 *
	 * @param input - Subscription identifier.
	 * @returns A promise that resolves when eBay deletes the subscription.
	 *
	 * @example
	 * ```ts
	 * await notificationApi.deleteSubscription({ subscriptionId: 'sub-1' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/deleteSubscription
	 */
	deleteSubscription = async (
		input: DeleteSubscriptionInput,
	): Promise<void> => {
		const apiClient = this.client;
		const apiBasePath = this.basePath;

		const validatedInput = requireObjectEffect<DeleteSubscriptionInput>(
			input,
			"input",
		);
		const validatedSubscriptionId = requireStringEffect(
			validatedInput.subscriptionId,
			"subscriptionId",
		);

		return await requestDeleteEffect<void>(
			apiClient,
			`${apiBasePath}/subscription/${validatedSubscriptionId}`,
		);
	};

	/**
	 * Disables an active notification subscription.
	 *
	 * @param input - Subscription identifier.
	 * @returns A promise that resolves when eBay disables the subscription.
	 *
	 * @example
	 * ```ts
	 * await notificationApi.disableSubscription({ subscriptionId: 'sub-1' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/disableSubscription
	 */
	disableSubscription = async (
		input: DisableSubscriptionInput,
	): Promise<void> => {
		const apiClient = this.client;
		const apiBasePath = this.basePath;

		const validatedInput = requireObjectEffect<DisableSubscriptionInput>(
			input,
			"input",
		);
		const validatedSubscriptionId = requireStringEffect(
			validatedInput.subscriptionId,
			"subscriptionId",
		);

		return await requestPostEffect<void>(
			apiClient,
			`${apiBasePath}/subscription/${validatedSubscriptionId}/disable`,
		);
	};

	/**
	 * Enables a disabled notification subscription.
	 *
	 * @param input - Subscription identifier.
	 * @returns A promise that resolves when eBay enables the subscription.
	 *
	 * @example
	 * ```ts
	 * await notificationApi.enableSubscription({ subscriptionId: 'sub-1' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/enableSubscription
	 */
	enableSubscription = async (
		input: EnableSubscriptionInput,
	): Promise<void> => {
		const apiClient = this.client;
		const apiBasePath = this.basePath;

		const validatedInput = requireObjectEffect<EnableSubscriptionInput>(
			input,
			"input",
		);
		const validatedSubscriptionId = requireStringEffect(
			validatedInput.subscriptionId,
			"subscriptionId",
		);

		return await requestPostEffect<void>(
			apiClient,
			`${apiBasePath}/subscription/${validatedSubscriptionId}/enable`,
		);
	};

	/**
	 * Sends a test notification for a subscription.
	 *
	 * @param input - Subscription identifier.
	 * @returns A promise that resolves when eBay accepts the test notification.
	 *
	 * @example
	 * ```ts
	 * await notificationApi.testSubscription({ subscriptionId: 'sub-1' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/testSubscription
	 */
	testSubscription = async (input: TestSubscriptionInput): Promise<void> => {
		const apiClient = this.client;
		const apiBasePath = this.basePath;

		const validatedInput = requireObjectEffect<TestSubscriptionInput>(
			input,
			"input",
		);
		const validatedSubscriptionId = requireStringEffect(
			validatedInput.subscriptionId,
			"subscriptionId",
		);

		return await requestPostEffect<void>(
			apiClient,
			`${apiBasePath}/subscription/${validatedSubscriptionId}/test`,
		);
	};

	/**
	 * Retrieves one notification topic.
	 *
	 * @param input - Topic identifier.
	 * @returns eBay's generated Topic response.
	 *
	 * @example
	 * ```ts
	 * const topic = await notificationApi.getTopic({ topicId: 'topic-1' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/topic/methods/getTopic
	 */
	getTopic = async (
		input: GetTopicInput,
	): Promise<GetNotificationTopicResponse> => {
		const apiClient = this.client;
		const apiBasePath = this.basePath;

		const validatedInput = requireObjectEffect<GetTopicInput>(input, "input");
		const validatedTopicId = requireStringEffect(
			validatedInput.topicId,
			"topicId",
		);

		return await requestGetEffect<GetNotificationTopicResponse>(
			apiClient,
			`${apiBasePath}/topic/${validatedTopicId}`,
		);
	};

	/**
	 * Retrieves available notification topics.
	 *
	 * @param input - Optional page size and continuation token.
	 * @returns eBay's generated TopicSearchResponse.
	 *
	 * @example
	 * ```ts
	 * const topics = await notificationApi.getTopics({ limit: 20 });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/topic/methods/getTopics
	 */
	getTopics = async (
		input: GetTopicsInput = {},
	): Promise<GetNotificationTopicsResponse> => {
		const apiClient = this.client;
		const path = `${this.basePath}/topic`;

		const validatedInput = requireObjectEffect<GetTopicsInput>(input, "input");
		const limit = optionalPositiveNumberEffect(validatedInput.limit, "limit");
		const continuationToken = optionalStringEffect(
			validatedInput.continuationToken,
			"continuationToken",
		);
		const params = buildEndpointParams({
			limit: { wireName: "limit", value: limit },
			continuationToken: {
				wireName: "continuation_token",
				value: continuationToken,
			},
		});

		return await requestGetEffect<GetNotificationTopicsResponse>(
			apiClient,
			path,
			params,
		);
	};

	/**
	 * Creates a filter for a notification subscription.
	 *
	 * @param input - Subscription identifier plus JSON Schema filter body accepted by eBay.
	 * @returns eBay's generated empty response body.
	 *
	 * @example
	 * ```ts
	 * await notificationApi.createSubscriptionFilter({
	 *     subscriptionId: 'sub-1',
	 *     filterSchema: { type: 'object' },
	 *   });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/createSubscriptionFilter
	 */
	createSubscriptionFilter = async (
		input: CreateSubscriptionFilterInput,
	): Promise<void> => {
		const apiClient = this.client;
		const apiBasePath = this.basePath;

		const validatedInput = requireObjectEffect<CreateSubscriptionFilterInput>(
			input,
			"input",
		);
		const { subscriptionId, ...filter } = validatedInput;
		const validatedSubscriptionId = requireStringEffect(
			subscriptionId,
			"subscriptionId",
		);
		const filterRequest = requireObjectEffect<CreateSubscriptionFilterRequest>(
			filter,
			"filter",
		);

		return await requestPostEffect<void>(
			apiClient,
			`${apiBasePath}/subscription/${validatedSubscriptionId}/filter`,
			filterRequest,
		);
	};

	/**
	 * Retrieves one subscription filter.
	 *
	 * @param input - Subscription identifier and subscription filter identifier.
	 * @returns eBay's generated SubscriptionFilter response.
	 *
	 * @example
	 * ```ts
	 * const filter = await notificationApi.getSubscriptionFilter({ subscriptionId: 'sub-1', filterId: 'filter-1' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/getSubscriptionFilter
	 */
	getSubscriptionFilter = async (
		input: GetSubscriptionFilterInput,
	): Promise<GetNotificationSubscriptionFilterResponse> => {
		const apiClient = this.client;
		const apiBasePath = this.basePath;

		const validatedInput = requireObjectEffect<GetSubscriptionFilterInput>(
			input,
			"input",
		);
		const validatedSubscriptionId = requireStringEffect(
			validatedInput.subscriptionId,
			"subscriptionId",
		);
		const validatedFilterId = requireStringEffect(
			validatedInput.filterId,
			"filterId",
		);

		return await requestGetEffect<GetNotificationSubscriptionFilterResponse>(
			apiClient,
			`${apiBasePath}/subscription/${validatedSubscriptionId}/filter/${validatedFilterId}`,
		);
	};

	/**
	 * Deletes a subscription filter.
	 *
	 * @param input - Subscription identifier and subscription filter identifier.
	 * @returns A promise that resolves when eBay deletes the filter.
	 *
	 * @example
	 * ```ts
	 * await notificationApi.deleteSubscriptionFilter({
	 *     subscriptionId: 'sub-1',
	 *     filterId: 'filter-1',
	 *   });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/deleteSubscriptionFilter
	 */
	deleteSubscriptionFilter = async (
		input: DeleteSubscriptionFilterInput,
	): Promise<void> => {
		const apiClient = this.client;
		const apiBasePath = this.basePath;

		const validatedInput = requireObjectEffect<DeleteSubscriptionFilterInput>(
			input,
			"input",
		);
		const validatedSubscriptionId = requireStringEffect(
			validatedInput.subscriptionId,
			"subscriptionId",
		);
		const validatedFilterId = requireStringEffect(
			validatedInput.filterId,
			"filterId",
		);

		return await requestDeleteEffect<void>(
			apiClient,
			`${apiBasePath}/subscription/${validatedSubscriptionId}/filter/${validatedFilterId}`,
		);
	};
}
