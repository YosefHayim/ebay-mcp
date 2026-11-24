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
type DestinationRequest = components["schemas"]["DestinationRequest"];
type CreateSubscriptionRequest =
	components["schemas"]["CreateSubscriptionRequest"];
type UpdateSubscriptionRequest =
	components["schemas"]["UpdateSubscriptionRequest"];
type CreateSubscriptionFilterRequest = Pick<
	CreateSubscriptionFilterInput,
	"filterSchema"
>;

export type GetNotificationConfigResponse = components["schemas"]["Config"];
export type GetNotificationDestinationsResponse =
	components["schemas"]["DestinationSearchResponse"];
export type GetNotificationDestinationResponse =
	components["schemas"]["Destination"];
export type GetNotificationPublicKeyResponse =
	components["schemas"]["PublicKey"];
export type GetNotificationSubscriptionsResponse =
	components["schemas"]["SubscriptionSearchResponse"];
export type GetNotificationSubscriptionResponse =
	components["schemas"]["Subscription"];
export type GetNotificationSubscriptionFilterResponse =
	components["schemas"]["SubscriptionFilter"];
export type GetNotificationTopicResponse = components["schemas"]["Topic"];
export type GetNotificationTopicsResponse =
	components["schemas"]["TopicSearchResponse"];

export class NotificationApi {
	private readonly basePath = "/commerce/notification/v1";
	private readonly client: EbayApiClient;

	constructor(client: EbayApiClient) {
		this.client = client;
	}

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

	getConfig = (
		input: GetConfigInput = {},
	): Promise<GetNotificationConfigResponse> => {
		void input;
		return requestGetEffect<GetNotificationConfigResponse>(
			this.client,
			`${this.basePath}/config`,
		);
	};

	updateConfig = async (input: UpdateConfigInput): Promise<void> => {
		const apiClient = this.client;
		const path = `${this.basePath}/config`;

		const configUpdate = requireObjectEffect<UpdateConfigInput>(input, "input");

		return await requestPutEffect<void>(apiClient, path, configUpdate);
	};

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

	createDestination = async (input: CreateDestinationInput): Promise<void> => {
		const apiClient = this.client;
		const path = `${this.basePath}/destination`;

		const destinationRequest = requireObjectEffect<DestinationRequest>(
			input,
			"input",
		);

		return await requestPostEffect<void>(apiClient, path, destinationRequest);
	};

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
