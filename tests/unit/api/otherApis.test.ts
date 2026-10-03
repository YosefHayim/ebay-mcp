import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeApi } from '@/api/order-management/dispute.js';
import { TaxonomyApi } from '@/api/listing-metadata/taxonomy.js';
import { RecommendationApi } from '@/api/marketing-and-promotions/recommendation.js';
import { ComplianceApi } from '@/api/other/compliance.js';
import { VeroApi } from '@/api/other/vero.js';
import { TranslationApi } from '@/api/other/translation.js';
import { EDeliveryApi } from '@/api/other/edelivery.js';
import { IdentityApi } from '@/api/other/identity.js';
import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { Effect } from 'effect';

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

    it('get payment dispute summaries with filter', async () => {
      const mockResponse = { paymentDisputeSummaries: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getPaymentDisputeSummaries({ orderId: 'ORDER123', limit: 10 }));

      expect(client.get).toHaveBeenCalledWith('/sell/fulfillment/v1/payment_dispute_summary', {
        order_id: 'ORDER123',
        limit: '10',
      });
    });

    it('get payment dispute by ID', async () => {
      const mockResponse = { paymentDisputeId: 'DISPUTE123' };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getPaymentDispute({ paymentDisputeId: 'DISPUTE123' }));

      expect(client.get).toHaveBeenCalledWith('/sell/fulfillment/v1/payment_dispute/DISPUTE123');
    });

    it('contest payment dispute', async () => {
      vi.mocked(client.post).mockResolvedValue(undefined);

      await Effect.runPromise(
        api.contestPaymentDispute({ paymentDisputeId: 'DISPUTE123', body: { returnAddress: {} } }),
      );

      expect(client.post).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/payment_dispute/DISPUTE123/contest',
        { returnAddress: {} },
      );
    });

    it('accept payment dispute', async () => {
      vi.mocked(client.post).mockResolvedValue(undefined);

      await Effect.runPromise(
        api.acceptPaymentDispute({ paymentDisputeId: 'DISPUTE123', body: { returnAddress: {} } }),
      );

      expect(client.post).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/payment_dispute/DISPUTE123/accept',
        { returnAddress: {} },
      );
    });
  });

  describe('TaxonomyApi', () => {
    let api: TaxonomyApi;

    beforeEach(() => {
      api = new TaxonomyApi(client);
    });

    it('get default category tree ID', async () => {
      const mockResponse = { categoryTreeId: '0' };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getDefaultCategoryTreeId({ marketplaceId: 'EBAY_US' }));

      expect(client.get).toHaveBeenCalledWith(
        '/commerce/taxonomy/v1/get_default_category_tree_id',
        { marketplace_id: 'EBAY_US' },
      );
    });

    it('fail when marketplaceId is missing', async () => {
      const error = await Effect.runPromise(
        Effect.flip(api.getDefaultCategoryTreeId({ marketplaceId: '' })),
      );

      expect(error._tag).toBe('EndpointInputError');
      expect(error.message).toContain('marketplaceId is required');
    });

    it('get category tree', async () => {
      const mockResponse = { rootCategoryNode: {} };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getCategoryTree({ categoryTreeId: '0' }));

      expect(client.get).toHaveBeenCalledWith('/commerce/taxonomy/v1/category_tree/0');
    });

    it('get category suggestions', async () => {
      const mockResponse = { categorySuggestions: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getCategorySuggestions({ categoryTreeId: '0', query: 'iPhone' }));

      expect(client.get).toHaveBeenCalledWith(
        '/commerce/taxonomy/v1/category_tree/0/get_category_suggestions',
        { q: 'iPhone' },
      );
    });

    it('get item aspects for category', async () => {
      const mockResponse = { aspects: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(
        api.getItemAspectsForCategory({ categoryTreeId: '0', categoryId: '123' }),
      );

      expect(client.get).toHaveBeenCalledWith(
        '/commerce/taxonomy/v1/category_tree/0/get_item_aspects_for_category',
        { category_id: '123' },
      );
    });

    it('get category subtree', async () => {
      const mockResponse = { categorySubtreeNode: {} };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getCategorySubtree({ categoryTreeId: '0', categoryId: '123' }));

      expect(client.get).toHaveBeenCalledWith(
        '/commerce/taxonomy/v1/category_tree/0/get_category_subtree',
        { category_id: '123' },
      );
    });

    it('get compatibility properties', async () => {
      const mockResponse = { compatibilityProperties: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(
        api.getCompatibilityProperties({ categoryTreeId: '0', categoryId: '123' }),
      );

      expect(client.get).toHaveBeenCalledWith(
        '/commerce/taxonomy/v1/category_tree/0/get_compatibility_properties',
        { category_id: '123' },
      );
    });

    it('get compatibility property values', async () => {
      const mockResponse = { compatibilityPropertyValues: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(
        api.getCompatibilityPropertyValues({
          categoryTreeId: '0',
          categoryId: '123',
          compatibilityProperty: 'Make',
        }),
      );

      expect(client.get).toHaveBeenCalledWith(
        '/commerce/taxonomy/v1/category_tree/0/get_compatibility_property_values',
        {
          category_id: '123',
          compatibility_property: 'Make',
        },
      );
    });
  });

  describe('RecommendationApi', () => {
    let api: RecommendationApi;

    beforeEach(() => {
      api = new RecommendationApi(client);
    });

    it('find listing recommendations', async () => {
      const mockResponse = { listingRecommendations: [] };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await Effect.runPromise(
        api.findListingRecommendations({
          requestBody: { listingIds: ['LISTING123'] },
          filter: 'filter:test',
          limit: 10,
          marketplaceId: 'EBAY_US',
        }),
      );

      expect(client.post).toHaveBeenCalledWith(
        '/sell/recommendation/v1/find',
        { listingIds: ['LISTING123'] },
        {
          params: {
            filter: 'filter:test',
            limit: '10',
          },
          headers: {
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        },
      );
    });

    it('reject missing marketplace before requesting recommendations', async () => {
      const error = await Effect.runPromise(
        Effect.flip(api.findListingRecommendations({ marketplaceId: '' })),
      );

      expect(error._tag).toBe('EndpointInputError');
      expect(error.parameter).toBe('marketplaceId');
      expect(client.post).not.toHaveBeenCalled();
    });
  });

  describe('ComplianceApi', () => {
    let api: ComplianceApi;

    beforeEach(() => {
      api = new ComplianceApi(client);
    });

    it('get listing violations fails with decommission message and does not call eBay', async () => {
      const error = await Effect.runPromise(
        Effect.flip(api.getListingViolations({ complianceType: 'PRODUCT_ADOPTION', limit: 10 })),
      );

      expect(error._tag).toBe('EbayApiError');
      expect(error.message).toContain('decommissioned the Sell Compliance API on 2026-03-30');
      expect(error.message).toContain('Issue Resolution Center');
      expect(client.get).not.toHaveBeenCalled();
    });

    it('get listing violations summary fails with decommission message and does not call eBay', async () => {
      const error = await Effect.runPromise(
        Effect.flip(api.getListingViolationsSummary({ complianceType: 'PRODUCT_ADOPTION' })),
      );

      expect(error._tag).toBe('EbayApiError');
      expect(error.message).toContain('decommissioned the Sell Compliance API on 2026-03-30');
      expect(client.get).not.toHaveBeenCalled();
    });

    it('get listing violations without params still fails decommissioned (no network)', async () => {
      const error = await Effect.runPromise(Effect.flip(api.getListingViolations()));

      expect(error._tag).toBe('EbayApiError');
      expect(client.get).not.toHaveBeenCalled();
    });
  });

  describe('VeroApi', () => {
    let api: VeroApi;

    beforeEach(() => {
      api = new VeroApi(client);
    });

    it('create VERO report', async () => {
      const mockResponse = { veroReportId: 'REPORT123' };
      const reportData = {
        reportItems: [
          {
            itemId: 'ITEM123',
            veroReasonCodeId: 'TRADEMARK',
          },
        ],
      };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.createVeroReport({ reportData }));

      expect(client.post).toHaveBeenCalledWith('/commerce/vero/v1/vero_report', reportData);
    });

    it('get VERO report by ID', async () => {
      const mockResponse = { veroReportId: 'REPORT123', status: 'OPEN' };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getVeroReport({ veroReportId: 'REPORT123' }));

      expect(client.get).toHaveBeenCalledWith('/commerce/vero/v1/vero_report/REPORT123');
    });

    it('get VERO report items', async () => {
      const mockResponse = { items: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(
        api.getVeroReportItems({ filter: 'filter:test', limit: 10, offset: 5 }),
      );

      expect(client.get).toHaveBeenCalledWith('/commerce/vero/v1/vero_report_items', {
        filter: 'filter:test',
        limit: 10,
        offset: 5,
      });
    });

    it('get VERO report items without optional params', async () => {
      const mockResponse = { items: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getVeroReportItems({}));

      expect(client.get).toHaveBeenCalledWith('/commerce/vero/v1/vero_report_items');
    });

    it('get VERO reason code by ID', async () => {
      const mockResponse = {
        veroReasonCodeId: 'CODE123',
        name: 'Trademark Infringement',
        description: 'Unauthorized use of trademark',
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getVeroReasonCode({ veroReasonCodeId: 'CODE123' }));

      expect(client.get).toHaveBeenCalledWith('/commerce/vero/v1/vero_reason_code/CODE123');
    });

    it('get all VERO reason codes', async () => {
      const mockResponse = {
        veroReasonCodes: [
          { veroReasonCodeId: 'CODE1', name: 'Trademark' },
          { veroReasonCodeId: 'CODE2', name: 'Copyright' },
        ],
      };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getVeroReasonCodes({}));

      expect(client.get).toHaveBeenCalledWith('/commerce/vero/v1/vero_reason_code');
    });

    it('reject missing VERO reason code ID before requesting eBay', async () => {
      const error = await Effect.runPromise(
        Effect.flip(api.getVeroReasonCode({ veroReasonCodeId: '' })),
      );

      expect(error._tag).toBe('EndpointInputError');
      expect(error.parameter).toBe('veroReasonCodeId');
      expect(client.get).not.toHaveBeenCalled();
    });
  });

  describe('TranslationApi', () => {
    let api: TranslationApi;

    beforeEach(() => {
      api = new TranslationApi(client);
    });

    it('translate text', async () => {
      const mockResponse = { translations: [] };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await Effect.runPromise(
        api.translate({
          from: 'en',
          to: 'es',
          translationContext: 'ITEM_TITLE',
          text: ['Hello'],
        }),
      );

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

    // Cost & Preferences
    it('gets actual costs with generated query params', async () => {
      const mockResponse = { costs: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getActualCosts({ trackingNumbers: 'TRACK123' }));

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/actual_costs', {
        tracking_numbers: 'TRACK123',
      });
    });

    it('gets address preferences', async () => {
      const mockResponse = { preferences: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getAddressPreferences({}));

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/address_preference');
    });

    it('creates address preference with body input', async () => {
      const mockResponse = { preferenceId: 'PREF123' };
      const addressPreference = { shipFromAddress: { city: 'New York' } };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.createAddressPreference({ body: addressPreference }));

      expect(client.post).toHaveBeenCalledWith(
        '/sell/logistics/v1/address_preference',
        addressPreference,
      );
    });

    it('gets consign preferences', async () => {
      const mockResponse = { preferences: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getConsignPreferences({}));

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/consign_preference');
    });

    it('creates consign preference with body input', async () => {
      const mockResponse = { preferenceId: 'CONS123' };
      const consignPreference = { consignAddress: { consignPreferenceName: 'Main' } };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.createConsignPreference({ body: consignPreference }));

      expect(client.post).toHaveBeenCalledWith(
        '/sell/logistics/v1/consign_preference',
        consignPreference,
      );
    });

    // Agents & Services
    it('gets agents with pagination query params', async () => {
      const mockResponse = { agents: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getAgents({ limit: 50, offset: 10 }));

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/agents', {
        limit: '50',
        offset: '10',
      });
    });

    it('gets battery qualifications with pagination query params', async () => {
      const mockResponse = { qualifications: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getBatteryQualifications({ limit: 25 }));

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/battery_qualifications', {
        limit: '25',
      });
    });

    it('gets dropoff sites with pagination query params', async () => {
      const mockResponse = { sites: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getDropoffSites({ offset: 5 }));

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/dropoff_sites', {
        offset: '5',
      });
    });

    it('gets services with pagination query params', async () => {
      const mockResponse = { services: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getServices({ limit: 20 }));

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/services', { limit: '20' });
    });

    // Bundles
    it('creates bundle with body input', async () => {
      const mockResponse = { bundleId: 'BUNDLE123' };
      const bundleRequest = { bundle: { trackingNumbers: ['TRACK1', 'TRACK2'] } };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.createBundle({ body: bundleRequest }));

      expect(client.post).toHaveBeenCalledWith('/sell/logistics/v1/bundle', bundleRequest);
    });

    it('gets bundle by ID', async () => {
      const mockResponse = { bundleId: 'BUNDLE123' };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getBundle({ bundleId: 'BUNDLE123' }));

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/bundle/BUNDLE123');
    });

    it('cancels bundle without a synthetic body', async () => {
      vi.mocked(client.post).mockResolvedValue(undefined);

      await Effect.runPromise(api.cancelBundle({ bundleId: 'BUNDLE123' }));

      expect(client.post).toHaveBeenCalledWith('/sell/logistics/v1/bundle/BUNDLE123/cancel');
    });

    it('gets bundle label by ID', async () => {
      const mockResponse = { labelUrl: 'https://label.url' };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getBundleLabel({ bundleId: 'BUNDLE123' }));

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/bundle/BUNDLE123/label');
    });

    // Packages (Single)
    it('creates package with body input', async () => {
      const mockResponse = { packageId: 'PKG123' };
      const packageRequest = { packageInfo: { packageWeight: 1000 } };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.createPackage({ body: packageRequest }));

      expect(client.post).toHaveBeenCalledWith('/sell/logistics/v1/package', packageRequest);
    });

    it('gets package by ID', async () => {
      const mockResponse = { packageId: 'PKG123' };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getPackage({ packageId: 'PKG123' }));

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/package/PKG123');
    });

    it('deletes package by ID', async () => {
      vi.mocked(client.delete).mockResolvedValue(undefined);

      await Effect.runPromise(api.deletePackage({ packageId: 'PKG123' }));

      expect(client.delete).toHaveBeenCalledWith('/sell/logistics/v1/package/PKG123');
    });

    it('gets packages by order line item ID', async () => {
      const mockResponse = { packageId: 'PKG123' };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getPackagesByLineItemId({ orderLineItemId: 'ORDER_LINE_123' }));

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/package/ORDER_LINE_123/item');
    });

    it('cancels package without a synthetic body', async () => {
      vi.mocked(client.post).mockResolvedValue(undefined);

      await Effect.runPromise(api.cancelPackage({ packageId: 'PKG123' }));

      expect(client.post).toHaveBeenCalledWith('/sell/logistics/v1/package/PKG123/cancel');
    });

    it('clones package without a synthetic body', async () => {
      const mockResponse = { packageId: 'PKG456' };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.clonePackage({ packageId: 'PKG123' }));

      expect(client.post).toHaveBeenCalledWith('/sell/logistics/v1/package/PKG123/clone');
    });

    it('confirms package without a synthetic body', async () => {
      vi.mocked(client.post).mockResolvedValue(undefined);

      await Effect.runPromise(api.confirmPackage({ packageId: 'PKG123' }));

      expect(client.post).toHaveBeenCalledWith('/sell/logistics/v1/package/PKG123/confirm');
    });

    // Packages (Bulk)
    it('bulk cancels packages with body input', async () => {
      const mockResponse = { results: [] };
      const bulkPackagesRequest = { requests: { packageIds: ['PKG1', 'PKG2'] } };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.bulkCancelPackages({ body: bulkPackagesRequest }));

      expect(client.post).toHaveBeenCalledWith(
        '/sell/logistics/v1/package/bulk_cancel_packages',
        bulkPackagesRequest,
      );
    });

    it('bulk confirms packages with body input', async () => {
      const mockResponse = { results: [] };
      const bulkPackagesRequest = { requests: { packageIds: ['PKG1', 'PKG2'] } };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.bulkConfirmPackages({ body: bulkPackagesRequest }));

      expect(client.post).toHaveBeenCalledWith(
        '/sell/logistics/v1/package/bulk_confirm_packages',
        bulkPackagesRequest,
      );
    });

    it('bulk deletes packages with body input', async () => {
      const mockResponse = { results: [] };
      const bulkPackagesRequest = { requests: { packageIds: ['PKG1', 'PKG2'] } };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.bulkDeletePackages({ body: bulkPackagesRequest }));

      expect(client.post).toHaveBeenCalledWith(
        '/sell/logistics/v1/package/bulk_delete_packages',
        bulkPackagesRequest,
      );
    });

    // Labels & Tracking
    it('gets labels with generated query params', async () => {
      const mockResponse = { labels: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(
        api.getLabels({
          pageSize: 'A4',
          printPreference: 'nameEn',
          trackingNumbers: 'TRACK123',
        }),
      );

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/labels', {
        page_size: 'A4',
        print_preference: 'nameEn',
        tracking_numbers: 'TRACK123',
      });
    });

    it('gets handover sheet with generated query params', async () => {
      const mockResponse = { sheetUrl: 'https://sheet.url' };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getHandoverSheet({ trackingNumbers: 'TRACK123' }));

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/handover_sheet', {
        tracking_numbers: 'TRACK123',
      });
    });

    it('gets tracking with generated query params', async () => {
      const mockResponse = { tracking: [] };
      vi.mocked(client.get).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getTracking({ trackingNumber: 'TRACK123' }));

      expect(client.get).toHaveBeenCalledWith('/sell/logistics/v1/tracking', {
        tracking_number: 'TRACK123',
      });
    });

    // Other
    it('creates complaint with body input', async () => {
      const mockResponse = { complaintId: 'COMPLAINT123' };
      const complaint = { complaintRequest: { description: 'Package damaged' } };
      vi.mocked(client.post).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.createComplaint({ body: complaint }));

      expect(client.post).toHaveBeenCalledWith('/sell/logistics/v1/complaint', complaint);
    });

    it('rejects missing tracking number before getTracking requests eBay', async () => {
      const failure = await Effect.runPromiseExit(api.getTracking({ trackingNumber: '' }));

      expect(failure._tag).toBe('Failure');
      if (failure._tag === 'Failure') {
        const error = failure.cause._tag === 'Fail' ? failure.cause.error : undefined;
        expect(error?._tag).toBe('EndpointInputError');
      }
      expect(client.get).not.toHaveBeenCalled();
    });
  });

  describe('IdentityApi', () => {
    let api: IdentityApi;

    beforeEach(() => {
      api = new IdentityApi(client);
    });

    it('get user identity', async () => {
      const mockResponse = { userId: 'USER123' };
      vi.mocked(client.getWithFullUrl).mockResolvedValue(mockResponse);

      await Effect.runPromise(api.getUser({}));

      expect(client.getWithFullUrl).toHaveBeenCalledWith(
        'https://apiz.sandbox.ebay.com/commerce/identity/v1/user',
      );
    });

    it('handle errors when getting user', async () => {
      const cause = new Error('Unauthorized');
      vi.mocked(client.getWithFullUrl).mockRejectedValue(cause);

      const error = await Effect.runPromise(Effect.flip(api.getUser({})));

      expect(error._tag).toBe('EbayApiError');
      expect(error.method).toBe('GET');
      expect(error.path).toBe('/commerce/identity/v1/user');
      expect(error.cause).toBe(cause);
    });
  });
});
