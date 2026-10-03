import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  buildEndpointParams,
  type EbayApiError,
  type EndpointInputError,
  optionalPositiveNumberEffect,
  optionalStringEffect,
  requestDeleteEffect,
  requestGetEffect,
  requestPostEffect,
  requestPutEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type { components } from '@/types/sell-apps/communication/commerceNotificationV1Oas3.js';
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
} from '@/utils/communication/notification.js';
import { Effect } from 'effect';
import type { z } from 'zod';

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
type CreateSubscriptionFilterInput = z.infer<typeof createSubscriptionFilterSchema>;
type GetSubscriptionFilterInput = z.infer<typeof getSubscriptionFilterSchema>;
type DeleteSubscriptionFilterInput = z.infer<typeof deleteSubscriptionFilterSchema>;
/** Destination request body accepted by destination writes. */
type DestinationRequest = components['schemas']['DestinationRequest'];
/** Subscription creation request body. */
type CreateSubscriptionRequest = components['schemas']['CreateSubscriptionRequest'];
/** Subscription update request body. */
type UpdateSubscriptionRequest = components['schemas']['UpdateSubscriptionRequest'];
/** Subscription filter body accepted by createSubscriptionFilter. */
type CreateSubscriptionFilterRequest = Pick<CreateSubscriptionFilterInput, 'filterSchema'>;

/**
 * Notification API configuration returned by eBay getConfig.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/config/methods/getConfig
 */
export type GetNotificationConfigResponse = components['schemas']['Config'];
/**
 * Destination search response returned by eBay getDestinations.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/destination/methods/getDestinations
 */
export type GetNotificationDestinationsResponse =
  components['schemas']['DestinationSearchResponse'];
/**
 * Destination response returned by eBay getDestination.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/destination/methods/getDestination
 */
export type GetNotificationDestinationResponse = components['schemas']['Destination'];
/**
 * Public key response returned by eBay getPublicKey.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/public_key/methods/getPublicKey
 */
export type GetNotificationPublicKeyResponse = components['schemas']['PublicKey'];
/**
 * Subscription search response returned by eBay getSubscriptions.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/getSubscriptions
 */
export type GetNotificationSubscriptionsResponse =
  components['schemas']['SubscriptionSearchResponse'];
/**
 * Subscription response returned by eBay getSubscription.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/getSubscription
 */
export type GetNotificationSubscriptionResponse = components['schemas']['Subscription'];
/**
 * Subscription filter response returned by eBay getSubscriptionFilter.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/getSubscriptionFilter
 */
export type GetNotificationSubscriptionFilterResponse = components['schemas']['SubscriptionFilter'];
/**
 * Topic response returned by eBay getTopic.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/topic/methods/getTopic
 */
export type GetNotificationTopicResponse = components['schemas']['Topic'];
/**
 * Topic search response returned by eBay getTopics.
 *
 * @see https://developer.ebay.com/api-docs/commerce/notification/resources/topic/methods/getTopics
 */
export type GetNotificationTopicsResponse = components['schemas']['TopicSearchResponse'];

/**
 * Notification API - Event notifications and subscriptions
 * Based on: commerce_notification_v1_oas3.json
 */
export class NotificationApi {
  private readonly basePath = '/commerce/notification/v1';
  private readonly client: EbayApiClient;

  constructor(client: EbayApiClient) {
    this.client = client;
  }

  /**
   * Retrieves a public key used to validate notification signatures.
   *
   * @param input - Public key identifier from the notification signature header.
   * @returns An Effect that succeeds with eBay's generated PublicKey response.
   *
   * @example
   * ```ts
   * const key = await Effect.runPromise(notificationApi.getPublicKey({ publicKeyId: 'key-123' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/public_key/methods/getPublicKey
   */
  getPublicKey = (
    input: GetPublicKeyInput,
  ): Effect.Effect<GetNotificationPublicKeyResponse, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const apiBasePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetPublicKeyInput>(input, 'input');
      const validatedPublicKeyId = yield* requireStringEffect(request.publicKeyId, 'publicKeyId');

      return yield* requestGetEffect<GetNotificationPublicKeyResponse>(
        apiClient,
        `${apiBasePath}/public_key/${validatedPublicKeyId}`,
      );
    });
  };

  /**
   * Retrieves the Notification API alert configuration.
   *
   * @param input - Empty endpoint input object.
   * @returns An Effect that succeeds with eBay's generated Config response.
   *
   * @example
   * ```ts
   * const config = await Effect.runPromise(notificationApi.getConfig({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/config/methods/getConfig
   */
  getConfig = (
    input: GetConfigInput = {},
  ): Effect.Effect<GetNotificationConfigResponse, EbayApiError> => {
    void input;
    return requestGetEffect<GetNotificationConfigResponse>(this.client, `${this.basePath}/config`);
  };

  /**
   * Updates the Notification API alert configuration.
   *
   * @param input - Notification alert configuration body.
   * @returns An Effect that succeeds when eBay accepts the update.
   *
   * @example
   * ```ts
   * await Effect.runPromise(notificationApi.updateConfig({ alertEmail: 'ops@example.com' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/config/methods/updateConfig
   */
  updateConfig = (
    input: UpdateConfigInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const path = `${this.basePath}/config`;

    return Effect.gen(function* () {
      const body = yield* requireObjectEffect<UpdateConfigInput>(input, 'input');

      return yield* requestPutEffect<void>(apiClient, path, body);
    });
  };

  /**
   * Retrieves configured notification destinations.
   *
   * @param input - Optional page size and continuation token.
   * @returns An Effect that succeeds with eBay's generated DestinationSearchResponse.
   *
   * @example
   * ```ts
   * const destinations = await Effect.runPromise(notificationApi.getDestinations({ limit: 20 }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/destination/methods/getDestinations
   */
  getDestinations = (
    input: GetDestinationsInput = {},
  ): Effect.Effect<GetNotificationDestinationsResponse, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const path = `${this.basePath}/destination`;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetDestinationsInput>(input, 'input');
      const limit = yield* optionalPositiveNumberEffect(request.limit, 'limit');
      const continuationToken = yield* optionalStringEffect(
        request.continuationToken,
        'continuationToken',
      );
      const params = buildEndpointParams({
        limit: { wireName: 'limit', value: limit },
        continuationToken: { wireName: 'continuation_token', value: continuationToken },
      });

      return yield* requestGetEffect<GetNotificationDestinationsResponse>(apiClient, path, params);
    });
  };

  /**
   * Retrieves one notification destination.
   *
   * @param input - Destination identifier.
   * @returns An Effect that succeeds with eBay's generated Destination response.
   *
   * @example
   * ```ts
   * const destination = await Effect.runPromise(
   *   notificationApi.getDestination({ destinationId: 'dest-1' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/destination/methods/getDestination
   */
  getDestination = (
    input: GetDestinationInput,
  ): Effect.Effect<GetNotificationDestinationResponse, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const apiBasePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetDestinationInput>(input, 'input');
      const validatedDestinationId = yield* requireStringEffect(
        request.destinationId,
        'destinationId',
      );

      return yield* requestGetEffect<GetNotificationDestinationResponse>(
        apiClient,
        `${apiBasePath}/destination/${validatedDestinationId}`,
      );
    });
  };

  /**
   * Creates a notification destination.
   *
   * @param input - Destination request body.
   * @returns An Effect that succeeds when eBay accepts the destination.
   *
   * @example
   * ```ts
   * await Effect.runPromise(notificationApi.createDestination({ name: 'webhook' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/destination/methods/createDestination
   */
  createDestination = (
    input: CreateDestinationInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const path = `${this.basePath}/destination`;

    return Effect.gen(function* () {
      const body = yield* requireObjectEffect<DestinationRequest>(input, 'input');

      return yield* requestPostEffect<void>(apiClient, path, body);
    });
  };

  /**
   * Updates a notification destination.
   *
   * @param input - Destination identifier plus destination update body fields.
   * @returns An Effect that succeeds when eBay accepts the update.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   notificationApi.updateDestination({ destinationId: 'dest-1', name: 'webhook' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/destination/methods/updateDestination
   */
  updateDestination = (
    input: UpdateDestinationInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const apiBasePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<UpdateDestinationInput>(input, 'input');
      const { destinationId, ...destination } = request;
      const validatedDestinationId = yield* requireStringEffect(destinationId, 'destinationId');
      const body = yield* requireObjectEffect<DestinationRequest>(destination, 'destination');

      return yield* requestPutEffect<void>(
        apiClient,
        `${apiBasePath}/destination/${validatedDestinationId}`,
        body,
      );
    });
  };

  /**
   * Deletes a notification destination.
   *
   * @param input - Destination identifier.
   * @returns An Effect that succeeds when eBay deletes the destination.
   *
   * @example
   * ```ts
   * await Effect.runPromise(notificationApi.deleteDestination({ destinationId: 'dest-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/destination/methods/deleteDestination
   */
  deleteDestination = (
    input: DeleteDestinationInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const apiBasePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<DeleteDestinationInput>(input, 'input');
      const validatedDestinationId = yield* requireStringEffect(
        request.destinationId,
        'destinationId',
      );

      return yield* requestDeleteEffect<void>(
        apiClient,
        `${apiBasePath}/destination/${validatedDestinationId}`,
      );
    });
  };

  /**
   * Retrieves configured notification subscriptions.
   *
   * @param input - Optional page size and continuation token.
   * @returns An Effect that succeeds with eBay's generated SubscriptionSearchResponse.
   *
   * @example
   * ```ts
   * const subscriptions = await Effect.runPromise(notificationApi.getSubscriptions({ limit: 20 }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/getSubscriptions
   */
  getSubscriptions = (
    input: GetSubscriptionsInput = {},
  ): Effect.Effect<GetNotificationSubscriptionsResponse, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const path = `${this.basePath}/subscription`;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetSubscriptionsInput>(input, 'input');
      const limit = yield* optionalPositiveNumberEffect(request.limit, 'limit');
      const continuationToken = yield* optionalStringEffect(
        request.continuationToken,
        'continuationToken',
      );
      const params = buildEndpointParams({
        limit: { wireName: 'limit', value: limit },
        continuationToken: { wireName: 'continuation_token', value: continuationToken },
      });

      return yield* requestGetEffect<GetNotificationSubscriptionsResponse>(apiClient, path, params);
    });
  };

  /**
   * Creates a notification subscription.
   *
   * @param input - Subscription creation request body.
   * @returns An Effect that succeeds when eBay accepts the subscription.
   *
   * @example
   * ```ts
   * await Effect.runPromise(notificationApi.createSubscription({ topicId: 'MARKETPLACE' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/createSubscription
   */
  createSubscription = (
    input: CreateSubscriptionInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const path = `${this.basePath}/subscription`;

    return Effect.gen(function* () {
      const body = yield* requireObjectEffect<CreateSubscriptionRequest>(input, 'input');

      return yield* requestPostEffect<void>(apiClient, path, body);
    });
  };

  /**
   * Retrieves one notification subscription.
   *
   * @param input - Subscription identifier.
   * @returns An Effect that succeeds with eBay's generated Subscription response.
   *
   * @example
   * ```ts
   * const subscription = await Effect.runPromise(
   *   notificationApi.getSubscription({ subscriptionId: 'sub-1' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/getSubscription
   */
  getSubscription = (
    input: GetSubscriptionInput,
  ): Effect.Effect<GetNotificationSubscriptionResponse, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const apiBasePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetSubscriptionInput>(input, 'input');
      const validatedSubscriptionId = yield* requireStringEffect(
        request.subscriptionId,
        'subscriptionId',
      );

      return yield* requestGetEffect<GetNotificationSubscriptionResponse>(
        apiClient,
        `${apiBasePath}/subscription/${validatedSubscriptionId}`,
      );
    });
  };

  /**
   * Updates a notification subscription.
   *
   * @param input - Subscription identifier plus subscription update body fields.
   * @returns An Effect that succeeds when eBay accepts the update.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   notificationApi.updateSubscription({ subscriptionId: 'sub-1', status: 'DISABLED' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/updateSubscription
   */
  updateSubscription = (
    input: UpdateSubscriptionInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const apiBasePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<UpdateSubscriptionInput>(input, 'input');
      const { subscriptionId, ...subscription } = request;
      const validatedSubscriptionId = yield* requireStringEffect(subscriptionId, 'subscriptionId');
      const body = yield* requireObjectEffect<UpdateSubscriptionRequest>(
        subscription,
        'subscription',
      );

      return yield* requestPutEffect<void>(
        apiClient,
        `${apiBasePath}/subscription/${validatedSubscriptionId}`,
        body,
      );
    });
  };

  /**
   * Deletes a notification subscription.
   *
   * @param input - Subscription identifier.
   * @returns An Effect that succeeds when eBay deletes the subscription.
   *
   * @example
   * ```ts
   * await Effect.runPromise(notificationApi.deleteSubscription({ subscriptionId: 'sub-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/deleteSubscription
   */
  deleteSubscription = (
    input: DeleteSubscriptionInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const apiBasePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<DeleteSubscriptionInput>(input, 'input');
      const validatedSubscriptionId = yield* requireStringEffect(
        request.subscriptionId,
        'subscriptionId',
      );

      return yield* requestDeleteEffect<void>(
        apiClient,
        `${apiBasePath}/subscription/${validatedSubscriptionId}`,
      );
    });
  };

  /**
   * Disables an active notification subscription.
   *
   * @param input - Subscription identifier.
   * @returns An Effect that succeeds when eBay disables the subscription.
   *
   * @example
   * ```ts
   * await Effect.runPromise(notificationApi.disableSubscription({ subscriptionId: 'sub-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/disableSubscription
   */
  disableSubscription = (
    input: DisableSubscriptionInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const apiBasePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<DisableSubscriptionInput>(input, 'input');
      const validatedSubscriptionId = yield* requireStringEffect(
        request.subscriptionId,
        'subscriptionId',
      );

      return yield* requestPostEffect<void>(
        apiClient,
        `${apiBasePath}/subscription/${validatedSubscriptionId}/disable`,
      );
    });
  };

  /**
   * Enables a disabled notification subscription.
   *
   * @param input - Subscription identifier.
   * @returns An Effect that succeeds when eBay enables the subscription.
   *
   * @example
   * ```ts
   * await Effect.runPromise(notificationApi.enableSubscription({ subscriptionId: 'sub-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/enableSubscription
   */
  enableSubscription = (
    input: EnableSubscriptionInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const apiBasePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<EnableSubscriptionInput>(input, 'input');
      const validatedSubscriptionId = yield* requireStringEffect(
        request.subscriptionId,
        'subscriptionId',
      );

      return yield* requestPostEffect<void>(
        apiClient,
        `${apiBasePath}/subscription/${validatedSubscriptionId}/enable`,
      );
    });
  };

  /**
   * Sends a test notification for a subscription.
   *
   * @param input - Subscription identifier.
   * @returns An Effect that succeeds when eBay accepts the test notification.
   *
   * @example
   * ```ts
   * await Effect.runPromise(notificationApi.testSubscription({ subscriptionId: 'sub-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/testSubscription
   */
  testSubscription = (
    input: TestSubscriptionInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const apiBasePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<TestSubscriptionInput>(input, 'input');
      const validatedSubscriptionId = yield* requireStringEffect(
        request.subscriptionId,
        'subscriptionId',
      );

      return yield* requestPostEffect<void>(
        apiClient,
        `${apiBasePath}/subscription/${validatedSubscriptionId}/test`,
      );
    });
  };

  /**
   * Retrieves one notification topic.
   *
   * @param input - Topic identifier.
   * @returns An Effect that succeeds with eBay's generated Topic response.
   *
   * @example
   * ```ts
   * const topic = await Effect.runPromise(notificationApi.getTopic({ topicId: 'topic-1' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/topic/methods/getTopic
   */
  getTopic = (
    input: GetTopicInput,
  ): Effect.Effect<GetNotificationTopicResponse, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const apiBasePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetTopicInput>(input, 'input');
      const validatedTopicId = yield* requireStringEffect(request.topicId, 'topicId');

      return yield* requestGetEffect<GetNotificationTopicResponse>(
        apiClient,
        `${apiBasePath}/topic/${validatedTopicId}`,
      );
    });
  };

  /**
   * Retrieves available notification topics.
   *
   * @param input - Optional page size and continuation token.
   * @returns An Effect that succeeds with eBay's generated TopicSearchResponse.
   *
   * @example
   * ```ts
   * const topics = await Effect.runPromise(notificationApi.getTopics({ limit: 20 }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/topic/methods/getTopics
   */
  getTopics = (
    input: GetTopicsInput = {},
  ): Effect.Effect<GetNotificationTopicsResponse, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const path = `${this.basePath}/topic`;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetTopicsInput>(input, 'input');
      const limit = yield* optionalPositiveNumberEffect(request.limit, 'limit');
      const continuationToken = yield* optionalStringEffect(
        request.continuationToken,
        'continuationToken',
      );
      const params = buildEndpointParams({
        limit: { wireName: 'limit', value: limit },
        continuationToken: { wireName: 'continuation_token', value: continuationToken },
      });

      return yield* requestGetEffect<GetNotificationTopicsResponse>(apiClient, path, params);
    });
  };

  /**
   * Creates a filter for a notification subscription.
   *
   * @param input - Subscription identifier plus JSON Schema filter body accepted by eBay.
   * @returns An Effect that succeeds with eBay's generated empty response body.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   notificationApi.createSubscriptionFilter({
   *     subscriptionId: 'sub-1',
   *     filterSchema: { type: 'object' },
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/createSubscriptionFilter
   */
  createSubscriptionFilter = (
    input: CreateSubscriptionFilterInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const apiBasePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<CreateSubscriptionFilterInput>(input, 'input');
      const { subscriptionId, ...filter } = request;
      const validatedSubscriptionId = yield* requireStringEffect(subscriptionId, 'subscriptionId');
      const body = yield* requireObjectEffect<CreateSubscriptionFilterRequest>(filter, 'filter');

      return yield* requestPostEffect<void>(
        apiClient,
        `${apiBasePath}/subscription/${validatedSubscriptionId}/filter`,
        body,
      );
    });
  };

  /**
   * Retrieves one subscription filter.
   *
   * @param input - Subscription identifier and subscription filter identifier.
   * @returns An Effect that succeeds with eBay's generated SubscriptionFilter response.
   *
   * @example
   * ```ts
   * const filter = await Effect.runPromise(
   *   notificationApi.getSubscriptionFilter({ subscriptionId: 'sub-1', filterId: 'filter-1' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/getSubscriptionFilter
   */
  getSubscriptionFilter = (
    input: GetSubscriptionFilterInput,
  ): Effect.Effect<
    GetNotificationSubscriptionFilterResponse,
    EbayApiError | EndpointInputError
  > => {
    const apiClient = this.client;
    const apiBasePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetSubscriptionFilterInput>(input, 'input');
      const validatedSubscriptionId = yield* requireStringEffect(
        request.subscriptionId,
        'subscriptionId',
      );
      const validatedFilterId = yield* requireStringEffect(request.filterId, 'filterId');

      return yield* requestGetEffect<GetNotificationSubscriptionFilterResponse>(
        apiClient,
        `${apiBasePath}/subscription/${validatedSubscriptionId}/filter/${validatedFilterId}`,
      );
    });
  };

  /**
   * Deletes a subscription filter.
   *
   * @param input - Subscription identifier and subscription filter identifier.
   * @returns An Effect that succeeds when eBay deletes the filter.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   notificationApi.deleteSubscriptionFilter({
   *     subscriptionId: 'sub-1',
   *     filterId: 'filter-1',
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/notification/resources/subscription/methods/deleteSubscriptionFilter
   */
  deleteSubscriptionFilter = (
    input: DeleteSubscriptionFilterInput,
  ): Effect.Effect<void, EbayApiError | EndpointInputError> => {
    const apiClient = this.client;
    const apiBasePath = this.basePath;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<DeleteSubscriptionFilterInput>(input, 'input');
      const validatedSubscriptionId = yield* requireStringEffect(
        request.subscriptionId,
        'subscriptionId',
      );
      const validatedFilterId = yield* requireStringEffect(request.filterId, 'filterId');

      return yield* requestDeleteEffect<void>(
        apiClient,
        `${apiBasePath}/subscription/${validatedSubscriptionId}/filter/${validatedFilterId}`,
      );
    });
  };
}
