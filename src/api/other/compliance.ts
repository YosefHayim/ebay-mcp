import type { EbayApiClient } from '@/api/client.js';
import { withApiError } from '@/api/shared/request.js';

/**
 * Compliance API - Listing compliance checks
 * Based on: docs/sell-apps/other-apis/sell_compliance_v1_oas3.json
 */
export class ComplianceApi {
  private readonly basePath = '/sell/compliance/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Get listing violations
   */
  async getListingViolations(complianceType?: string, offset?: number, limit?: number) {
    const params: Record<string, string | number> = {};
    if (complianceType) params.compliance_type = complianceType;
    if (offset) params.offset = offset;
    if (limit) params.limit = limit;
    return await withApiError('Failed to get listing violations', () =>
      this.client.get(`${this.basePath}/listing_violation`, params),
    );
  }

  /**
   * Get listing violation summary
   */
  async getListingViolationsSummary(complianceType?: string) {
    const params: Record<string, string> = {};
    if (complianceType) params.compliance_type = complianceType;
    return await withApiError('Failed to get listing violations summary', () =>
      this.client.get(`${this.basePath}/listing_violation_summary`, params),
    );
  }

  /**
   * Suppress a violation
   */
  async suppressViolation(listingViolationId: string) {
    return await withApiError('Failed to suppress violation', () =>
      this.client.post(`${this.basePath}/suppress_violation`, {
        listing_violation_id: listingViolationId,
      }),
    );
  }

  /**
   * Get compliance snapshot (alias for getListingViolations)
   */
  async getComplianceSnapshot(complianceType?: string, offset?: number, limit?: number) {
    return await this.getListingViolations(complianceType, offset, limit);
  }
}
