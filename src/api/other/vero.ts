import type { EbayApiClient } from '@/api/client.js';
import { buildTruthyPaginatedParams } from '@/api/shared/query-params.js';
import { withApiError } from '@/api/shared/request.js';

/**
 * VERO API - Verified Rights Owner program
 * Based on: docs/sell-apps/other-apis/commerce_vero_v1_oas3.json
 */
export class VeroApi {
  private readonly basePath = '/commerce/vero/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Create a VERO report to report intellectual property infringement
   */
  async createVeroReport(reportData: Record<string, unknown>) {
    return await withApiError('Failed to create vero report', () =>
      this.client.post(`${this.basePath}/vero_report`, reportData),
    );
  }

  /**
   * Get a specific VERO report by ID
   */
  async getVeroReport(veroReportId: string) {
    return await withApiError('Failed to get vero report', () =>
      this.client.get(`${this.basePath}/vero_report/${veroReportId}`),
    );
  }

  /**
   * Get VERO report items (listings reported for infringement)
   */
  async getVeroReportItems(filter?: string, limit?: number, offset?: number) {
    const params = buildTruthyPaginatedParams(filter, limit, offset);
    return await withApiError('Failed to get vero report items', () =>
      this.client.get(`${this.basePath}/vero_report_items`, params),
    );
  }

  /**
   * Get a specific VERO reason code by ID
   */
  async getVeroReasonCode(veroReasonCodeId: string) {
    return await withApiError('Failed to get vero reason code', () =>
      this.client.get(`${this.basePath}/vero_reason_code/${veroReasonCodeId}`),
    );
  }

  /**
   * Get all available VERO reason codes
   */
  async getVeroReasonCodes() {
    return await withApiError('Failed to get vero reason codes', () =>
      this.client.get(`${this.basePath}/vero_reason_code`),
    );
  }
}
