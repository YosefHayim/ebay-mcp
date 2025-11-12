import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeApi } from '../../../src/api/order-management/dispute.js';
import { TaxonomyApi } from '../../../src/api/listing-metadata/taxonomy.js';
import { RecommendationApi } from '../../../src/api/marketing-and-promotions/recommendation.js';
import { ComplianceApi } from '../../../src/api/other/compliance.js';
import { VeroApi } from '../../../src/api/other/vero.js';
import { TranslationApi } from '../../../src/api/other/translation.js';
import { EDeliveryApi } from '../../../src/api/other/edelivery.js';
import { IdentityApi } from '../../../src/api/other/identity.js';
import type { EbayApiClient } from '../../../src/api/client.js';

describe('Other APIs', () => {
  let client: EbayApiClient;

  beforeEach(() => {
    client = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      getConfig: vi.fn(() => ({ environment: 'sandbox' })),
      getWithFullUrl: vi.fn(),
    } as unknown as EbayApiClient;
  });

  describe('DisputeApi', () => {
    let api: DisputeApi;

    beforeEach(() => {
      api = new DisputeApi(client);
    });

    it('should get payment dispute summaries with filter', async () => {
      const mockResponse = { paymentDisputeSummaries: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getPaymentDisputeSummaries({ order_id: 'ORDER123', limit: 10 });

      expect(client.get).toHaveBeenCalledWith('/sell/fulfillment/v1/payment_dispute_summary', {
        order_id: 'ORDER123',
        limit: 10,
      });
    });

    it('should get payment dispute by ID', async () => {
      const mockResponse = { paymentDisputeId: 'DISPUTE123' };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getPaymentDispute('DISPUTE123');

      expect(client.get).toHaveBeenCalledWith('/sell/fulfillment/v1/payment_dispute/DISPUTE123');
    });

    it('should contest payment dispute', async () => {
      vi.mocked(client.post).mockResolvedValue(undefined);

      await api.contestPaymentDispute('DISPUTE123', { returnAddress: {} });

      expect(client.post).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/payment_dispute/DISPUTE123/contest',
        { returnAddress: {} }
      );
    });

    it('should accept payment dispute', async () => {
      vi.mocked(client.post).mockResolvedValue(undefined);

      await api.acceptPaymentDispute('DISPUTE123', { returnAddress: {} });

      expect(client.post).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/payment_dispute/DISPUTE123/accept',
        { returnAddress: {} }
      );
    });
  });

  describe('TaxonomyApi', () => {
    let api: TaxonomyApi;

    beforeEach(() => {
      api = new TaxonomyApi(client);
    });

    it('should get default category tree ID', async () => {
      const mockResponse = { categoryTreeId: '0' };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getDefaultCategoryTreeId('EBAY_US');

      expect(client.get).toHaveBeenCalledWith(
        '/commerce/taxonomy/v1/get_default_category_tree_id',
        { marketplace_id: 'EBAY_US' }
      );
    });

    it('should get category tree', async () => {
      const mockResponse = { rootCategoryNode: {} };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getCategoryTree('0');

      expect(client.get).toHaveBeenCalledWith('/commerce/taxonomy/v1/category_tree/0');
    });

    it('should get category suggestions', async () => {
      const mockResponse = { categorySuggestions: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getCategorySuggestions('0', 'iPhone');

      expect(client.get).toHaveBeenCalledWith(
        '/commerce/taxonomy/v1/category_tree/0/get_category_suggestions',
        { q: 'iPhone' }
      );
    });

    it('should get item aspects for category', async () => {
      const mockResponse = { aspects: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getItemAspectsForCategory('0', '123');

      expect(client.get).toHaveBeenCalledWith(
        '/commerce/taxonomy/v1/category_tree/0/get_item_aspects_for_category/123'
      );
    });

    it('should get category subtree', async () => {
      const mockResponse = { categorySubtreeNode: {} };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getCategorySubtree('0', '123');

      expect(client.get).toHaveBeenCalledWith(
        '/commerce/taxonomy/v1/category_tree/0/get_category_subtree',
        { category_id: '123' }
      );
    });

    it('should get compatibility properties', async () => {
      const mockResponse = { compatibilityProperties: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getCompatibilityProperties('0', '123');

      expect(client.get).toHaveBeenCalledWith(
        '/commerce/taxonomy/v1/category_tree/0/get_compatibility_properties',
        { category_id: '123' }
      );
    });

    it('should get compatibility property values', async () => {
      const mockResponse = { compatibilityPropertyValues: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getCompatibilityPropertyValues('0', '123', 'Make');

      expect(client.get).toHaveBeenCalledWith(
        '/commerce/taxonomy/v1/category_tree/0/get_compatibility_property_values',
        {
          category_id: '123',
          compatibility_property: 'Make',
        }
      );
    });
  });

  describe('RecommendationApi', () => {
    let api: RecommendationApi;

    beforeEach(() => {
      api = new RecommendationApi(client);
    });

    it('should find listing recommendations', async () => {
      const mockResponse = { listingRecommendations: [] };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await api.findListingRecommendations(
        { listingIds: ['LISTING123'] },
        'filter:test',
        10,
        undefined,
        'EBAY_US'
      );

      expect(client.post).toHaveBeenCalledWith(
        '/sell/recommendation/v1/find',
        { listingIds: ['LISTING123'] },
        {
          params: {
            filter: 'filter:test',
            limit: 10,
          },
          headers: {
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      );
    });
  });

  describe('ComplianceApi', () => {
    let api: ComplianceApi;

    beforeEach(() => {
      api = new ComplianceApi(client);
    });

    it('should get listing violations', async () => {
      const mockResponse = { listingViolations: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getListingViolations('PRODUCT_ADOPTION', undefined, 10);

      expect(client.get).toHaveBeenCalledWith('/sell/compliance/v1/listing_violation', {
        compliance_type: 'PRODUCT_ADOPTION',
        limit: 10,
      });
    });

    it('should get listing violations summary', async () => {
      const mockResponse = { violationSummaries: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getListingViolationsSummary('PRODUCT_ADOPTION');

      expect(client.get).toHaveBeenCalledWith('/sell/compliance/v1/listing_violation_summary', {
        compliance_type: 'PRODUCT_ADOPTION',
      });
    });

    it('should suppress violation', async () => {
      vi.mocked(client.post).mockResolvedValue(undefined);

      await api.suppressViolation('VIOLATION123');

      expect(client.post).toHaveBeenCalledWith('/sell/compliance/v1/suppress_violation', {
        listing_violation_id: 'VIOLATION123',
      });
    });
  });

  describe('VeroApi', () => {
    let api: VeroApi;

    beforeEach(() => {
      api = new VeroApi(client);
    });

    it('should create VERO report', async () => {
      const mockResponse = { veroReportId: 'REPORT123' };
      const reportData = {
        items: [
          {
            itemId: 'ITEM123',
            reportingReason: 'TRADEMARK',
          },
        ],
        rightsOwnerEmail: 'owner@example.com',
      };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await api.createVeroReport(reportData);

      expect(client.post).toHaveBeenCalledWith('/commerce/vero/v1/vero_report', reportData);
    });

    it('should get VERO report by ID', async () => {
      const mockResponse = { veroReportId: 'REPORT123', status: 'OPEN' };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getVeroReport('REPORT123');

      expect(client.get).toHaveBeenCalledWith('/commerce/vero/v1/vero_report/REPORT123');
    });

    it('should get VERO report items', async () => {
      const mockResponse = { items: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getVeroReportItems('filter:test', 10, 5);

      expect(client.get).toHaveBeenCalledWith('/commerce/vero/v1/vero_report_items', {
        filter: 'filter:test',
        limit: 10,
        offset: 5,
      });
    });

    it('should get VERO report items without optional params', async () => {
      const mockResponse = { items: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getVeroReportItems();

      expect(client.get).toHaveBeenCalledWith('/commerce/vero/v1/vero_report_items', {});
    });

    it('should get VERO reason code by ID', async () => {
      const mockResponse = {
        veroReasonCodeId: 'CODE123',
        name: 'Trademark Infringement',
        description: 'Unauthorized use of trademark',
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getVeroReasonCode('CODE123');

      expect(client.get).toHaveBeenCalledWith('/commerce/vero/v1/vero_reason_code/CODE123');
    });

    it('should get all VERO reason codes', async () => {
      const mockResponse = {
        veroReasonCodes: [
          { veroReasonCodeId: 'CODE1', name: 'Trademark' },
          { veroReasonCodeId: 'CODE2', name: 'Copyright' },
        ],
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getVeroReasonCodes();

      expect(client.get).toHaveBeenCalledWith('/commerce/vero/v1/vero_reason_code');
    });
  });

  describe('TranslationApi', () => {
    let api: TranslationApi;

    beforeEach(() => {
      api = new TranslationApi(client);
    });

    it('should translate text', async () => {
      const mockResponse = { translations: [] };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await api.translate('en', 'es', 'ITEM_TITLE', ['Hello']);

      expect(client.post).toHaveBeenCalledWith('/commerce/translation/v1/translate', {
        from: 'en',
        to: 'es',
        translationContext: 'ITEM_TITLE',
        text: ['Hello'],
      });
    });
  });

  describe('EDeliveryApi', () => {
    let api: EDeliveryApi;

    beforeEach(() => {
      api = new EDeliveryApi(client);
    });

    it('should create shipping quote', async () => {
      const mockResponse = { quoteId: 'QUOTE123' };
      const shippingQuoteRequest = {
        packageDetails: { weight: { value: 1, unit: 'kg' } },
        shipFrom: { country: 'US' },
        shipTo: { country: 'CA' },
      };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await api.createShippingQuote(shippingQuoteRequest);

      expect(client.post).toHaveBeenCalledWith(
        '/sell/logistics/v1/shipping_quote',
        shippingQuoteRequest
      );
    });

    it('should get shipping quote', async () => {
      const mockResponse = { quoteId: 'QUOTE123' };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await api.getShippingQuote('QUOTE123');

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/shipping_quote/QUOTE123');
    });
  });

  describe('IdentityApi', () => {
    let api: IdentityApi;

    beforeEach(() => {
      api = new IdentityApi(client);
    });

    it('should get user identity', async () => {
      const mockResponse = { userId: 'USER123' };
      vi.mocked(client.getWithFullUrl).mockResolvedValue(mockResponse);

      await api.getUser();

      expect(client.getWithFullUrl).toHaveBeenCalledWith(
        'https://apiz.sandbox.ebay.com/commerce/identity/v1/user'
      );
    });

    it('should handle errors when getting user', async () => {
      vi.mocked(client.getWithFullUrl).mockRejectedValue(new Error('Unauthorized'));

      await expect(api.getUser()).rejects.toThrow('Unauthorized');
    });
  });
});
