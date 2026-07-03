import type { EbayApiClient } from '@/api/client.js';
import {
  buildContinuationParams,
  deleteWithApiError,
  getWithApiError,
  postWithApiError,
  putWithApiError,
  requireObject,
  requireString,
  type QueryParams,
} from '@/api/shared/request.js';

/**
 * Notification API - Event notifications and subscriptions
 * Based on: docs/sell-apps/communication/commerce_notification_v1_oas3.json
 */
export class NotificationApi {
  private readonly basePath = '/commerce/notification/v1';

  constructor(private client: EbayApiClient) {}

  private path(endpoint: string): string {
    return `${this.basePath}${endpoint}`;
  }

  private async get(endpoint: string, failureMessage: string, params?: QueryParams) {
    return await getWithApiError(this.client, this.path(endpoint), failureMessage, params);
  }

  private async post(endpoint: string, failureMessage: string, body?: unknown) {
    return await postWithApiError(this.client, this.path(endpoint), failureMessage, body);
  }

  private async put(endpoint: string, failureMessage: string, body?: unknown) {
    return await putWithApiError(this.client, this.path(endpoint), failureMessage, body);
  }

  private async delete(endpoint: string, failureMessage: string) {
    return await deleteWithApiError(this.client, this.path(endpoint), failureMessage);
  }

  private async getContinuation(
    endpoint: string,
    failureMessage: string,
    limit?: number,
    continuationToken?: string,
  ) {
    return await this.get(
      endpoint,
      failureMessage,
      buildContinuationParams(limit, continuationToken),
    );
  }

  /**
   * Get public key for validating notifications
   * @param publicKeyId Public key identifier.
   * @throws Error if required parameters are missing or invalid
   */
  async getPublicKey(publicKeyId: string) {
    requireString(publicKeyId, 'publicKeyId');
    return await this.get(`/public_key/${publicKeyId}`, 'Failed to get public key');
  }

  /**
   * Get notification config
   * @throws Error if the request fails
   */
  async getConfig() {
    return await this.get('/config', 'Failed to get config');
  }

  /**
   * Update notification config
   * @throws Error if required parameters are missing or invalid
   */
  async updateConfig(config: Record<string, unknown>) {
    requireObject(config, 'config');
    return await this.put('/config', 'Failed to update config', config);
  }

  /**
   * Get all destinations (paginated)
   * @throws Error if the request fails
   */
  async getDestinations(limit?: number, continuationToken?: string) {
    return await this.getContinuation(
      '/destination',
      'Failed to get destinations',
      limit,
      continuationToken,
    );
  }

  /**
   * Get destination
   * @param destinationId Destination identifier.
   * @throws Error if required parameters are missing or invalid
   */
  async getDestination(destinationId: string) {
    requireString(destinationId, 'destinationId');
    return await this.get(`/destination/${destinationId}`, 'Failed to get destination');
  }

  /**
   * Create destination
   * @throws Error if required parameters are missing or invalid
   */
  async createDestination(destination: Record<string, unknown>) {
    requireObject(destination, 'destination');
    return await this.post('/destination', 'Failed to create destination', destination);
  }

  /**
   * Update destination
   * @throws Error if required parameters are missing or invalid
   */
  async updateDestination(destinationId: string, destination: Record<string, unknown>) {
    requireString(destinationId, 'destinationId');
    requireObject(destination, 'destination');
    return await this.put(
      `/destination/${destinationId}`,
      'Failed to update destination',
      destination,
    );
  }

  /**
   * Delete destination
   * @throws Error if required parameters are missing or invalid
   */
  async deleteDestination(destinationId: string) {
    requireString(destinationId, 'destinationId');
    return await this.delete(`/destination/${destinationId}`, 'Failed to delete destination');
  }

  /**
   * Get all subscriptions
   * Endpoint: GET /subscription
   * @throws Error if the request fails
   */
  async getSubscriptions(limit?: number, continuationToken?: string) {
    return await this.getContinuation(
      '/subscription',
      'Failed to get subscriptions',
      limit,
      continuationToken,
    );
  }

  /**
   * Create a subscription
   * Endpoint: POST /subscription
   * @throws Error if required parameters are missing or invalid
   */
  async createSubscription(subscription: Record<string, unknown>) {
    requireObject(subscription, 'subscription');
    return await this.post('/subscription', 'Failed to create subscription', subscription);
  }

  /**
   * Get a subscription
   * Endpoint: GET /subscription/{subscription_id}
   * @param subscriptionId Subscription identifier.
   * @throws Error if required parameters are missing or invalid
   */
  async getSubscription(subscriptionId: string) {
    requireString(subscriptionId, 'subscriptionId');
    return await this.get(`/subscription/${subscriptionId}`, 'Failed to get subscription');
  }

  /**
   * Update a subscription
   * Endpoint: PUT /subscription/{subscription_id}
   * @throws Error if required parameters are missing or invalid
   */
  async updateSubscription(subscriptionId: string, subscription: Record<string, unknown>) {
    requireString(subscriptionId, 'subscriptionId');
    requireObject(subscription, 'subscription');
    return await this.put(
      `/subscription/${subscriptionId}`,
      'Failed to update subscription',
      subscription,
    );
  }

  /**
   * Delete a subscription
   * Endpoint: DELETE /subscription/{subscription_id}
   * @throws Error if required parameters are missing or invalid
   */
  async deleteSubscription(subscriptionId: string) {
    requireString(subscriptionId, 'subscriptionId');
    return await this.delete(`/subscription/${subscriptionId}`, 'Failed to delete subscription');
  }

  /**
   * Disable a subscription
   * Endpoint: POST /subscription/{subscription_id}/disable
   * @throws Error if required parameters are missing or invalid
   */
  async disableSubscription(subscriptionId: string) {
    requireString(subscriptionId, 'subscriptionId');
    return await this.post(
      `/subscription/${subscriptionId}/disable`,
      'Failed to disable subscription',
      {},
    );
  }

  /**
   * Enable a subscription
   * Endpoint: POST /subscription/{subscription_id}/enable
   * @throws Error if required parameters are missing or invalid
   */
  async enableSubscription(subscriptionId: string) {
    requireString(subscriptionId, 'subscriptionId');
    return await this.post(
      `/subscription/${subscriptionId}/enable`,
      'Failed to enable subscription',
      {},
    );
  }

  /**
   * Test a subscription
   * Endpoint: POST /subscription/{subscription_id}/test
   * @throws Error if required parameters are missing or invalid
   */
  async testSubscription(subscriptionId: string) {
    requireString(subscriptionId, 'subscriptionId');
    return await this.post(
      `/subscription/${subscriptionId}/test`,
      'Failed to test subscription',
      {},
    );
  }

  /**
   * Get a topic
   * Endpoint: GET /topic/{topic_id}
   * @param topicId Topic identifier.
   * @throws Error if required parameters are missing or invalid
   */
  async getTopic(topicId: string) {
    requireString(topicId, 'topicId');
    return await this.get(`/topic/${topicId}`, 'Failed to get topic');
  }

  /**
   * Get all topics
   * Endpoint: GET /topic
   * @throws Error if the request fails
   */
  async getTopics(limit?: number, continuationToken?: string) {
    return await this.getContinuation('/topic', 'Failed to get topics', limit, continuationToken);
  }

  /**
   * Create a subscription filter
   * Endpoint: POST /subscription/{subscription_id}/filter
   * @throws Error if required parameters are missing or invalid
   */
  async createSubscriptionFilter(subscriptionId: string, filter: Record<string, unknown>) {
    requireString(subscriptionId, 'subscriptionId');
    requireObject(filter, 'filter');
    return await this.post(
      `/subscription/${subscriptionId}/filter`,
      'Failed to create subscription filter',
      filter,
    );
  }

  /**
   * Get a subscription filter
   * Endpoint: GET /subscription/{subscription_id}/filter/{filter_id}
   * @throws Error if required parameters are missing or invalid
   */
  async getSubscriptionFilter(subscriptionId: string, filterId: string) {
    requireString(subscriptionId, 'subscriptionId');
    requireString(filterId, 'filterId');
    return await this.get(
      `/subscription/${subscriptionId}/filter/${filterId}`,
      'Failed to get subscription filter',
    );
  }

  /**
   * Delete a subscription filter
   * Endpoint: DELETE /subscription/{subscription_id}/filter/{filter_id}
   * @throws Error if required parameters are missing or invalid
   */
  async deleteSubscriptionFilter(subscriptionId: string, filterId: string) {
    requireString(subscriptionId, 'subscriptionId');
    requireString(filterId, 'filterId');
    return await this.delete(
      `/subscription/${subscriptionId}/filter/${filterId}`,
      'Failed to delete subscription filter',
    );
  }
}
