import type { EbayApiClient } from '@/api/client.js';
import { getPaginatedWithContextError, getPathWithContextError } from './shared.js';
import { withApiError } from '@/api/shared/request.js';

/**
 * Feedback API - Manage buyer and seller feedback
 * Based on: docs/sell-apps/communication/commerce_feedback_v1_beta_oas3.json
 */
export class FeedbackApi {
  private readonly basePath = '/commerce/feedback/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Get items awaiting feedback
   * Endpoint: GET /awaiting_feedback
   * @param filter API filter expression.
   * @param limit Maximum number of records to return.
   * @param offset Zero-based pagination offset.
   * @throws Error if the request fails
   */
  async getAwaitingFeedback(filter?: string, limit?: number, offset?: number) {
    return await getPaginatedWithContextError(
      this.client,
      `${this.basePath}/awaiting_feedback`,
      'Failed to get awaiting feedback',
      filter,
      limit,
      offset,
    );
  }

  /**
   * Get feedback for a transaction
   * Endpoint: GET /feedback
   * @throws Error if required parameters are missing or invalid
   */
  async getFeedback(transactionId: string) {
    if (!transactionId || typeof transactionId !== 'string') {
      throw new Error('transactionId is required and must be a string');
    }

    return await withApiError('Failed to get feedback', () =>
      this.client.get(`${this.basePath}/feedback`, {
        transaction_id: transactionId,
      }),
    );
  }

  /**
   * Get feedback rating summary
   * Endpoint: GET /feedback_rating_summary
   * @throws Error if the request fails
   */
  async getFeedbackRatingSummary() {
    return await getPathWithContextError(
      this.client,
      `${this.basePath}/feedback_rating_summary`,
      'Failed to get feedback rating summary',
    );
  }

  /**
   * Leave feedback for a buyer
   * Endpoint: POST /feedback
   * @throws Error if required parameters are missing or invalid
   */
  async leaveFeedbackForBuyer(feedbackData: Record<string, unknown>) {
    if (!feedbackData || typeof feedbackData !== 'object') {
      throw new Error('feedbackData is required and must be an object');
    }

    return await withApiError('Failed to leave feedback', () =>
      this.client.post(`${this.basePath}/feedback`, feedbackData),
    );
  }

  /**
   * Respond to feedback
   * Endpoint: POST /respond_to_feedback
   * @throws Error if required parameters are missing or invalid
   */
  async respondToFeedback(feedbackId: string, responseText: string) {
    if (!feedbackId || typeof feedbackId !== 'string') {
      throw new Error('feedbackId is required and must be a string');
    }
    if (!responseText || typeof responseText !== 'string') {
      throw new Error('responseText is required and must be a string');
    }

    return await withApiError('Failed to respond to feedback', () =>
      this.client.post(`${this.basePath}/respond_to_feedback`, {
        feedback_id: feedbackId,
        response_text: responseText,
      }),
    );
  }

  /**
   * Get feedback summary
   * @deprecated Use getFeedbackRatingSummary() instead
   */
  async getFeedbackSummary() {
    return await this.getFeedbackRatingSummary();
  }
}
