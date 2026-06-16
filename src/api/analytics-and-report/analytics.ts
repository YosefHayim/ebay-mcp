import type { components } from '@/types/sell-apps/analytics-and-report/sellAnalyticsV1Oas3.js';
import type { EbayApiClient } from '../client.js';
import { withApiError } from '@/api/shared/request.js';

type Report = components['schemas']['Report'];
type StandardsProfile = components['schemas']['StandardsProfile'];
type GetCustomerServiceMetricResponse = components['schemas']['GetCustomerServiceMetricResponse'];

/**
 * Analytics API - Sales and traffic analytics
 * Based on: docs/sell-apps/analytics-and-report/sell_analytics_v1_oas3.json
 */
export class AnalyticsApi {
  private readonly basePath = '/sell/analytics/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Get traffic report for listings
   * @throws Error if required parameters are missing or invalid
   */
  async getTrafficReport(
    dimension: string,
    filter: string,
    metric: string,
    sort?: string
  ): Promise<Report> {
    // Input validation
    if (!dimension || typeof dimension !== 'string') {
      throw new Error('dimension is required and must be a string');
    }
    if (!filter || typeof filter !== 'string') {
      throw new Error('filter is required and must be a string');
    }
    if (!metric || typeof metric !== 'string') {
      throw new Error('metric is required and must be a string');
    }
    if (sort !== undefined && typeof sort !== 'string') {
      throw new Error('sort must be a string when provided');
    }

    const params: Record<string, string> = {
      dimension,
      filter,
      metric,
    };
    if (sort) params.sort = sort;

    return await withApiError('Failed to get traffic report', () =>
      this.client.get<Report>(`${this.basePath}/traffic_report`, params)
    );
  }

  /**
   * Find all seller standards profiles
   * Endpoint: GET /seller_standards_profile
   * @throws Error if the request fails
   */
  async findSellerStandardsProfiles() {
    return await withApiError('Failed to find seller standards profiles', () =>
      this.client.get(`${this.basePath}/seller_standards_profile`)
    );
  }

  /**
   * Get a specific seller standards profile
   * Endpoint: GET /seller_standards_profile/{program}/{cycle}
   * @throws Error if required parameters are missing or invalid
   */
  async getSellerStandardsProfile(program: string, cycle: string): Promise<StandardsProfile> {
    // Input validation
    if (!program || typeof program !== 'string') {
      throw new Error('program is required and must be a string');
    }
    if (!cycle || typeof cycle !== 'string') {
      throw new Error('cycle is required and must be a string');
    }

    return await withApiError('Failed to get seller standards profile', () =>
      this.client.get<StandardsProfile>(
        `${this.basePath}/seller_standards_profile/${program}/${cycle}`
      )
    );
  }

  /**
   * Get customer service metrics
   * Endpoint: GET /customer_service_metric/{customer_service_metric_type}/{evaluation_type}
   * @throws Error if required parameters are missing or invalid
   */
  async getCustomerServiceMetric(
    customerServiceMetricType: string,
    evaluationType: string,
    evaluationMarketplaceId: string
  ): Promise<GetCustomerServiceMetricResponse> {
    // Input validation
    if (!customerServiceMetricType || typeof customerServiceMetricType !== 'string') {
      throw new Error('customerServiceMetricType is required and must be a string');
    }
    if (!evaluationType || typeof evaluationType !== 'string') {
      throw new Error('evaluationType is required and must be a string');
    }
    if (!evaluationMarketplaceId || typeof evaluationMarketplaceId !== 'string') {
      throw new Error('evaluationMarketplaceId is required and must be a string');
    }

    const params = {
      evaluation_marketplace_id: evaluationMarketplaceId,
    };

    return await withApiError('Failed to get customer service metric', () =>
      this.client.get<GetCustomerServiceMetricResponse>(
        `${this.basePath}/customer_service_metric/${customerServiceMetricType}/${evaluationType}`,
        params
      )
    );
  }
}
