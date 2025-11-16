import type { EbayApiClient } from '@/api/client.js';
import type { components } from '@/types/sell-apps/order-management/sellFulfillmentV1Oas3.js';

type AcceptPaymentDisputeRequest = components['schemas']['AcceptPaymentDisputeRequest'];
type ContestPaymentDisputeRequest = components['schemas']['ContestPaymentDisputeRequest'];
type DisputeSummaryResponse = components['schemas']['DisputeSummaryResponse'];
type PaymentDispute = components['schemas']['PaymentDispute'];
type PaymentDisputeActivityHistory = components['schemas']['PaymentDisputeActivityHistory'];
type FileEvidence = components['schemas']['FileEvidence'];
type AddEvidencePaymentDisputeRequest = components['schemas']['AddEvidencePaymentDisputeRequest'];
type AddEvidencePaymentDisputeResponse = components['schemas']['AddEvidencePaymentDisputeResponse'];
type UpdateEvidencePaymentDisputeRequest =
  components['schemas']['UpdateEvidencePaymentDisputeRequest'];

/**
 * Dispute API - Manage payment disputes
 * Based on: docs/sell-apps/order-management/sell_fulfillment_v1_oas3.json
 */
export class DisputeApi {
  private readonly basePath = '/sell/fulfillment/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Get payment dispute details
   */
  async getPaymentDispute(paymentDisputeId: string): Promise<PaymentDispute> {
    return await this.client.get<PaymentDispute>(
      `${this.basePath}/payment_dispute/${paymentDisputeId}`
    );
  }

  /**
   * Get payment dispute evidence file
   */
  async fetchEvidenceContent(
    paymentDisputeId: string,
    evidenceId: string,
    fileId: string
  ): Promise<ArrayBuffer> {
    const params: Record<string, string> = {
      evidence_id: evidenceId,
      file_id: fileId,
    };
    return await this.client.get<ArrayBuffer>(
      `${this.basePath}/payment_dispute/${paymentDisputeId}/fetch_evidence_content`,
      params
    );
  }

  /**
   * Get payment dispute activity
   */
  async getActivities(paymentDisputeId: string): Promise<PaymentDisputeActivityHistory> {
    return await this.client.get<PaymentDisputeActivityHistory>(
      `${this.basePath}/payment_dispute/${paymentDisputeId}/activity`
    );
  }

  /**
   * Search for payment disputes
   */
  async getPaymentDisputeSummaries(params?: {
    order_id?: string;
    buyer_username?: string;
    open_date_from?: string;
    open_date_to?: string;
    payment_dispute_status?: string;
    limit?: number;
    offset?: number;
  }): Promise<DisputeSummaryResponse> {
    return await this.client.get<DisputeSummaryResponse>(
      `${this.basePath}/payment_dispute_summary`,
      params
    );
  }

  /**
   * Contest a payment dispute
   */
  async contestPaymentDispute(
    paymentDisputeId: string,
    body?: ContestPaymentDisputeRequest
  ): Promise<void> {
    return await this.client.post<void>(
      `${this.basePath}/payment_dispute/${paymentDisputeId}/contest`,
      body
    );
  }

  /**
   * Accept a payment dispute
   */
  async acceptPaymentDispute(
    paymentDisputeId: string,
    body?: AcceptPaymentDisputeRequest
  ): Promise<void> {
    return await this.client.post<void>(
      `${this.basePath}/payment_dispute/${paymentDisputeId}/accept`,
      body
    );
  }

  /**
   * Upload an evidence file
   */
  async uploadEvidenceFile(paymentDisputeId: string, body: ArrayBuffer): Promise<FileEvidence> {
    return await this.client.post<FileEvidence>(
      `${this.basePath}/payment_dispute/${paymentDisputeId}/upload_evidence_file`,
      body,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  }

  /**
   * Add an evidence file
   */
  async addEvidence(
    paymentDisputeId: string,
    body: AddEvidencePaymentDisputeRequest
  ): Promise<AddEvidencePaymentDisputeResponse> {
    return await this.client.post<AddEvidencePaymentDisputeResponse>(
      `${this.basePath}/payment_dispute/${paymentDisputeId}/add_evidence`,
      body
    );
  }

  /**
   * Update an evidence file
   */
  async updateEvidence(
    paymentDisputeId: string,
    body: UpdateEvidencePaymentDisputeRequest
  ): Promise<void> {
    return await this.client.post<void>(
      `${this.basePath}/payment_dispute/${paymentDisputeId}/update_evidence`,
      body
    );
  }
}
