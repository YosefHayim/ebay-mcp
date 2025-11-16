import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsApi } from '@/api/analytics-and-report/analytics.js';
import type { EbayApiClient } from '@/api/client.js';

describe('AnalyticsApi', () => {
  let client: EbayApiClient;
  let api: AnalyticsApi;

  beforeEach(() => {
    client = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as EbayApiClient;
    api = new AnalyticsApi(client);
  });

  describe('getTrafficReport', () => {
    it('should get traffic report with valid parameters', async () => {
      const mockResponse = {
        reports: [
          {
            listingId: '123',
            dimension: 'LISTING',
            metrics: { CLICK_THROUGH_RATE: '5.2', IMPRESSION: '1000' },
          },
        ],
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      const result = await api.getTrafficReport(
        'LISTING',
        'listingId:123',
        'CLICK_THROUGH_RATE,IMPRESSION'
      );

      expect(result).toEqual(mockResponse);
      expect(client.get).toHaveBeenCalledWith('/sell/analytics/v1/traffic_report', {
        dimension: 'LISTING',
        filter: 'listingId:123',
        metric: 'CLICK_THROUGH_RATE,IMPRESSION',
      });
    });

    it('should throw error when dimension is missing', async () => {
      await expect(api.getTrafficReport('' as any, 'filter', 'metric')).rejects.toThrow(
        'dimension is required'
      );
    });

    it('should throw error when filter is missing', async () => {
      await expect(api.getTrafficReport('LISTING', '' as any, 'metric')).rejects.toThrow(
        'filter is required'
      );
    });

    it('should throw error when metric is missing', async () => {
      await expect(api.getTrafficReport('LISTING', 'filter', '' as any)).rejects.toThrow(
        'metric is required'
      );
    });

    it('should include optional sort parameter', async () => {
      const mockResponse = { reports: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getTrafficReport('DAY', 'listingId:123', 'IMPRESSION', 'IMPRESSION');

      expect(client.get).toHaveBeenCalledWith('/sell/analytics/v1/traffic_report', {
        dimension: 'DAY',
        filter: 'listingId:123',
        metric: 'IMPRESSION',
        sort: 'IMPRESSION',
      });
    });

    it('should throw error when sort is not a string', async () => {
      await expect(api.getTrafficReport('LISTING', 'filter', 'metric', 123 as any)).rejects.toThrow(
        'sort must be a string when provided'
      );
    });

    it('should handle API errors when fetching traffic report', async () => {
      vi.mocked(client.get).mockRejectedValue(new Error('Service Unavailable'));

      await expect(api.getTrafficReport('LISTING', 'filter', 'metric')).rejects.toThrow(
        'Failed to get traffic report: Service Unavailable'
      );
    });
  });

  describe('findSellerStandardsProfiles', () => {
    it('should get all seller standards profiles', async () => {
      const mockResponse = {
        standardsProfiles: [
          {
            cycle: { cycleType: 'CURRENT' },
            defaultProgram: true,
            evaluationDate: '2024-01-01',
            program: 'CUSTOMER_SERVICE',
            standardsLevel: 'STANDARD',
          },
        ],
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      const result = await api.findSellerStandardsProfiles();

      expect(result).toEqual(mockResponse);
      expect(client.get).toHaveBeenCalledWith('/sell/analytics/v1/seller_standards_profile');
    });

    it('should handle errors when fetching profiles', async () => {
      vi.mocked(client.get).mockRejectedValue(new Error('API Error'));

      await expect(api.findSellerStandardsProfiles()).rejects.toThrow(
        'Failed to find seller standards profiles: API Error'
      );
    });
  });

  describe('getSellerStandardsProfile', () => {
    it('should get specific seller standards profile', async () => {
      const mockResponse = {
        cycle: { cycleType: 'CURRENT' },
        defaultProgram: true,
        program: 'CUSTOMER_SERVICE',
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      const result = await api.getSellerStandardsProfile('CUSTOMER_SERVICE', 'CURRENT');

      expect(result).toEqual(mockResponse);
      expect(client.get).toHaveBeenCalledWith(
        '/sell/analytics/v1/seller_standards_profile/CUSTOMER_SERVICE/CURRENT'
      );
    });

    it('should throw error when program is missing', async () => {
      await expect(api.getSellerStandardsProfile('' as any, 'CURRENT')).rejects.toThrow(
        'program is required'
      );
    });

    it('should throw error when cycle is missing', async () => {
      await expect(api.getSellerStandardsProfile('CUSTOMER_SERVICE', '' as any)).rejects.toThrow(
        'cycle is required'
      );
    });

    it('should handle errors when fetching profile', async () => {
      vi.mocked(client.get).mockRejectedValue(new Error('Not Found'));

      await expect(api.getSellerStandardsProfile('CUSTOMER_SERVICE', 'CURRENT')).rejects.toThrow(
        'Failed to get seller standards profile: Not Found'
      );
    });
  });

  describe('getCustomerServiceMetric', () => {
    it('should get customer service metrics with all parameters', async () => {
      const mockResponse = {
        dimensionMetrics: [
          {
            name: 'TRANSACTION',
            value: '95.5',
          },
        ],
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      const result = await api.getCustomerServiceMetric('TRANSACTION', 'CURRENT', 'EBAY_US');

      expect(result).toEqual(mockResponse);
      expect(client.get).toHaveBeenCalledWith(
        '/sell/analytics/v1/customer_service_metric/TRANSACTION/CURRENT',
        {
          evaluation_marketplace_id: 'EBAY_US',
        }
      );
    });

    it('should throw error when customerServiceMetricType is missing', async () => {
      await expect(api.getCustomerServiceMetric('' as any, 'CURRENT', 'EBAY_US')).rejects.toThrow(
        'customerServiceMetricType is required'
      );
    });

    it('should throw error when evaluationType is missing', async () => {
      await expect(
        api.getCustomerServiceMetric('TRANSACTION', '' as any, 'EBAY_US')
      ).rejects.toThrow('evaluationType is required');
    });

    it('should throw error when evaluationMarketplaceId is missing', async () => {
      await expect(
        api.getCustomerServiceMetric('TRANSACTION', 'CURRENT', '' as any)
      ).rejects.toThrow('evaluationMarketplaceId is required');
    });

    it('should handle errors when fetching metrics', async () => {
      vi.mocked(client.get).mockRejectedValue(new Error('Unauthorized'));

      await expect(
        api.getCustomerServiceMetric('TRANSACTION', 'CURRENT', 'EBAY_US')
      ).rejects.toThrow('Failed to get customer service metric: Unauthorized');
    });
  });
});
