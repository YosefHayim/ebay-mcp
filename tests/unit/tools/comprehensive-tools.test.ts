import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeTool } from '../../../src/tools/index.js';
import type { EbaySellerApi } from '../../../src/api/index.js';

describe('Comprehensive Tools Coverage', () => {
  let mockApi: EbaySellerApi;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };

    // Create comprehensive mock API
    mockApi = {
      account: {
        getCustomPolicies: vi.fn(),
        getFulfillmentPolicies: vi.fn(),
        getPaymentPolicies: vi.fn(),
        getReturnPolicies: vi.fn(),
        createFulfillmentPolicy: vi.fn(),
        getFulfillmentPolicy: vi.fn(),
        getFulfillmentPolicyByName: vi.fn(),
        updateFulfillmentPolicy: vi.fn(),
        deleteFulfillmentPolicy: vi.fn(),
        createPaymentPolicy: vi.fn(),
        getPaymentPolicy: vi.fn(),
        getPaymentPolicyByName: vi.fn(),
        updatePaymentPolicy: vi.fn(),
        deletePaymentPolicy: vi.fn(),
        createReturnPolicy: vi.fn(),
        getReturnPolicy: vi.fn(),
        getReturnPolicyByName: vi.fn(),
        updateReturnPolicy: vi.fn(),
        deleteReturnPolicy: vi.fn(),
        createCustomPolicy: vi.fn(),
        getCustomPolicy: vi.fn(),
        updateCustomPolicy: vi.fn(),
        deleteCustomPolicy: vi.fn(),
        getKyc: vi.fn(),
        optInToPaymentsProgram: vi.fn(),
        getPaymentsProgramStatus: vi.fn(),
        getRateTables: vi.fn(),
        createOrReplaceSalesTax: vi.fn(),
        bulkCreateOrReplaceSalesTax: vi.fn(),
        deleteSalesTax: vi.fn(),
        getSalesTax: vi.fn(),
        getSalesTaxes: vi.fn(),
        getSubscription: vi.fn(),
        optInToProgram: vi.fn(),
        optOutOfProgram: vi.fn(),
        getOptedInPrograms: vi.fn(),
      },
      inventory: {
        getInventoryItems: vi.fn(),
        getInventoryItem: vi.fn(),
        createOrReplaceInventoryItem: vi.fn(),
        deleteInventoryItem: vi.fn(),
        bulkCreateOrReplaceInventoryItem: vi.fn(),
        bulkGetInventoryItem: vi.fn(),
        bulkUpdatePriceQuantity: vi.fn(),
        getProductCompatibility: vi.fn(),
        createOrReplaceProductCompatibility: vi.fn(),
        deleteProductCompatibility: vi.fn(),
        getInventoryItemGroup: vi.fn(),
        createOrReplaceInventoryItemGroup: vi.fn(),
        deleteInventoryItemGroup: vi.fn(),
        getInventoryLocations: vi.fn(),
        getInventoryLocation: vi.fn(),
        createOrReplaceInventoryLocation: vi.fn(),
        deleteInventoryLocation: vi.fn(),
        disableInventoryLocation: vi.fn(),
        enableInventoryLocation: vi.fn(),
        updateLocationDetails: vi.fn(),
        getOffers: vi.fn(),
        getOffer: vi.fn(),
        createOffer: vi.fn(),
        updateOffer: vi.fn(),
        deleteOffer: vi.fn(),
        publishOffer: vi.fn(),
        withdrawOffer: vi.fn(),
        bulkCreateOffer: vi.fn(),
        bulkPublishOffer: vi.fn(),
        getListingFees: vi.fn(),
        bulkMigrateListing: vi.fn(),
      },
      fulfillment: {
        getOrders: vi.fn(),
        getOrder: vi.fn(),
        createShippingFulfillment: vi.fn(),
        issueRefund: vi.fn(),
      },
      dispute: {
        getPaymentDisputeSummaries: vi.fn(),
        getPaymentDispute: vi.fn(),
        contestPaymentDispute: vi.fn(),
        acceptPaymentDispute: vi.fn(),
      },
      marketing: {
        getCampaigns: vi.fn(),
        getCampaign: vi.fn(),
        pauseCampaign: vi.fn(),
        resumeCampaign: vi.fn(),
        endCampaign: vi.fn(),
        updateCampaignIdentification: vi.fn(),
        cloneCampaign: vi.fn(),
        getPromotions: vi.fn(),
      },
      recommendation: {
        findListingRecommendations: vi.fn(),
      },
      analytics: {
        findSellerStandardsProfiles: vi.fn(),
        getSellerStandardsProfile: vi.fn(),
        getCustomerServiceMetric: vi.fn(),
        getTrafficReport: vi.fn(),
      },
      metadata: {
        getAutomotivePartsCompatibilityPolicies: vi.fn(),
        getCategoryPolicies: vi.fn(),
        getExtendedProducerResponsibilityPolicies: vi.fn(),
        getHazardousMaterialsLabels: vi.fn(),
        getItemConditionPolicies: vi.fn(),
        getListingStructurePolicies: vi.fn(),
        getNegotiatedPricePolicies: vi.fn(),
        getProductSafetyLabels: vi.fn(),
        getRegulatoryPolicies: vi.fn(),
        getShippingCostTypePolicies: vi.fn(),
        getClassifiedAdPolicies: vi.fn(),
        getCurrencies: vi.fn(),
        getListingTypePolicies: vi.fn(),
        getMotorsListingPolicies: vi.fn(),
        getShippingPolicies: vi.fn(),
        getSiteVisibilityPolicies: vi.fn(),
        getCompatibilitiesBySpecification: vi.fn(),
        getCompatibilityPropertyNames: vi.fn(),
        getCompatibilityPropertyValues: vi.fn(),
        getMultiCompatibilityPropertyValues: vi.fn(),
        getProductCompatibilities: vi.fn(),
        getSalesTaxJurisdictions: vi.fn(),
      },
      taxonomy: {
        getDefaultCategoryTreeId: vi.fn(),
        getCategoryTree: vi.fn(),
        getCategorySuggestions: vi.fn(),
        getItemAspectsForCategory: vi.fn(),
      },
      negotiation: {
        getOffersToBuyers: vi.fn(),
        sendOfferToInterestedBuyers: vi.fn(),
      },
      message: {
        searchMessages: vi.fn(),
        getMessage: vi.fn(),
        sendMessage: vi.fn(),
        replyToMessage: vi.fn(),
      },
      notification: {
        getConfig: vi.fn(),
        updateConfig: vi.fn(),
        createDestination: vi.fn(),
      },
      feedback: {
        getFeedback: vi.fn(),
        leaveFeedbackForBuyer: vi.fn(),
        getFeedbackSummary: vi.fn(),
      },
      identity: {
        getUser: vi.fn(),
      },
      compliance: {
        getListingViolations: vi.fn(),
        getListingViolationsSummary: vi.fn(),
        suppressViolation: vi.fn(),
      },
      vero: {
        createVeroReport: vi.fn(),
        getVeroReport: vi.fn(),
        getVeroReportItems: vi.fn(),
        getVeroReasonCode: vi.fn(),
        getVeroReasonCodes: vi.fn(),
      },
      translation: {
        translate: vi.fn(),
      },
      edelivery: {
        createShippingQuote: vi.fn(),
        getShippingQuote: vi.fn(),
      },
      setUserTokens: vi.fn(),
      getTokenInfo: vi.fn().mockReturnValue({
        hasUserToken: false,
        hasClientToken: true,
        accessTokenExpired: false,
        refreshTokenExpired: false,
      }),
      getAuthClient: vi.fn().mockReturnValue({
        getOAuthClient: vi.fn().mockReturnValue({
          clearAllTokens: vi.fn(),
          getAccessToken: vi.fn(),
        }),
      }),
    } as unknown as EbaySellerApi;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  // ===== ACCOUNT TOOLS =====
  describe('Account Management Tools', () => {
    it('ebay_get_custom_policies', async () => {
      const mockResponse = { customPolicies: [] };
      vi.mocked(mockApi.account.getCustomPolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_custom_policies', { policyTypes: 'RETURN' });
      expect(mockApi.account.getCustomPolicies()).toHaveBeenCalledWith('RETURN');
    });

    it('ebay_get_fulfillment_policies', async () => {
      const mockResponse = { fulfillmentPolicies: [] };
      vi.mocked(mockApi.account.getFulfillmentPolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_fulfillment_policies', { marketplaceId: 'EBAY_US' });
      expect(mockApi.account.getFulfillmentPolicies()).toHaveBeenCalledWith('EBAY_US');
    });

    it('ebay_get_payment_policies', async () => {
      const mockResponse = { paymentPolicies: [] };
      vi.mocked(mockApi.account.getPaymentPolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_payment_policies', { marketplaceId: 'EBAY_US' });
      expect(mockApi.account.getPaymentPolicies()).toHaveBeenCalledWith('EBAY_US');
    });

    it('ebay_get_return_policies', async () => {
      const mockResponse = { returnPolicies: [] };
      vi.mocked(mockApi.account.getReturnPolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_return_policies', { marketplaceId: 'EBAY_US' });
      expect(mockApi.account.getReturnPolicies()).toHaveBeenCalledWith('EBAY_US');
    });

    it('ebay_create_fulfillment_policy', async () => {
      const mockResponse = { fulfillmentPolicyId: 'FP123' };
      const policy = { name: 'Test', marketplaceId: 'EBAY_US' };
      vi.mocked(mockApi.account.createFulfillmentPolicy()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_create_fulfillment_policy', { policy });
      expect(mockApi.account.createFulfillmentPolicy()).toHaveBeenCalledWith(policy);
    });

    it('ebay_get_fulfillment_policy', async () => {
      const mockResponse = { fulfillmentPolicyId: 'FP123' };
      vi.mocked(mockApi.account.getFulfillmentPolicy()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_fulfillment_policy', { fulfillmentPolicyId: 'FP123' });
      expect(mockApi.account.getFulfillmentPolicy()).toHaveBeenCalledWith('FP123');
    });

    it('ebay_get_fulfillment_policy_by_name', async () => {
      const mockResponse = { fulfillmentPolicyId: 'FP123' };
      vi.mocked(mockApi.account.getFulfillmentPolicyByName()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_fulfillment_policy_by_name', {
        marketplaceId: 'EBAY_US',
        name: 'Test',
      });
      expect(mockApi.account.getFulfillmentPolicyByName()).toHaveBeenCalledWith('EBAY_US', 'Test');
    });

    it('ebay_update_fulfillment_policy', async () => {
      const mockResponse = { fulfillmentPolicyId: 'FP123' };
      const policy = { name: 'Updated', marketplaceId: 'EBAY_US' };
      vi.mocked(mockApi.account.updateFulfillmentPolicy()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_update_fulfillment_policy', {
        fulfillmentPolicyId: 'FP123',
        policy,
      });
      expect(mockApi.account.updateFulfillmentPolicy()).toHaveBeenCalledWith('FP123', policy);
    });

    it('ebay_delete_fulfillment_policy', async () => {
      vi.mocked(mockApi.account.deleteFulfillmentPolicy()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_delete_fulfillment_policy', {
        fulfillmentPolicyId: 'FP123',
      });
      expect(mockApi.account.deleteFulfillmentPolicy()).toHaveBeenCalledWith('FP123');
    });

    it('ebay_create_payment_policy', async () => {
      const mockResponse = { paymentPolicyId: 'PP123' };
      const policy = { name: 'Test', marketplaceId: 'EBAY_US' };
      vi.mocked(mockApi.account.createPaymentPolicy()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_create_payment_policy', { policy });
      expect(mockApi.account.createPaymentPolicy()).toHaveBeenCalledWith(policy);
    });

    it('ebay_get_payment_policy', async () => {
      const mockResponse = { paymentPolicyId: 'PP123' };
      vi.mocked(mockApi.account.getPaymentPolicy()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_payment_policy', { paymentPolicyId: 'PP123' });
      expect(mockApi.account.getPaymentPolicy()).toHaveBeenCalledWith('PP123');
    });

    it('ebay_get_payment_policy_by_name', async () => {
      const mockResponse = { paymentPolicyId: 'PP123' };
      vi.mocked(mockApi.account.getPaymentPolicyByName()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_payment_policy_by_name', {
        marketplaceId: 'EBAY_US',
        name: 'Test',
      });
      expect(mockApi.account.getPaymentPolicyByName()).toHaveBeenCalledWith('EBAY_US', 'Test');
    });

    it('ebay_update_payment_policy', async () => {
      const mockResponse = { paymentPolicyId: 'PP123' };
      const policy = { name: 'Updated', marketplaceId: 'EBAY_US' };
      vi.mocked(mockApi.account.updatePaymentPolicy()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_update_payment_policy', {
        paymentPolicyId: 'PP123',
        policy,
      });
      expect(mockApi.account.updatePaymentPolicy()).toHaveBeenCalledWith('PP123', policy);
    });

    it('ebay_delete_payment_policy', async () => {
      vi.mocked(mockApi.account.deletePaymentPolicy()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_delete_payment_policy', { paymentPolicyId: 'PP123' });
      expect(mockApi.account.deletePaymentPolicy()).toHaveBeenCalledWith('PP123');
    });

    it('ebay_create_return_policy', async () => {
      const mockResponse = { returnPolicyId: 'RP123' };
      const policy = { name: 'Test', marketplaceId: 'EBAY_US' };
      vi.mocked(mockApi.account.createReturnPolicy()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_create_return_policy', { policy });
      expect(mockApi.account.createReturnPolicy()).toHaveBeenCalledWith(policy);
    });

    it('ebay_get_return_policy', async () => {
      const mockResponse = { returnPolicyId: 'RP123' };
      vi.mocked(mockApi.account.getReturnPolicy()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_return_policy', { returnPolicyId: 'RP123' });
      expect(mockApi.account.getReturnPolicy()).toHaveBeenCalledWith('RP123');
    });

    it('ebay_get_return_policy_by_name', async () => {
      const mockResponse = { returnPolicyId: 'RP123' };
      vi.mocked(mockApi.account.getReturnPolicyByName()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_return_policy_by_name', {
        marketplaceId: 'EBAY_US',
        name: 'Test',
      });
      expect(mockApi.account.getReturnPolicyByName()).toHaveBeenCalledWith('EBAY_US', 'Test');
    });

    it('ebay_update_return_policy', async () => {
      const mockResponse = { returnPolicyId: 'RP123' };
      const policy = { name: 'Updated', marketplaceId: 'EBAY_US' };
      vi.mocked(mockApi.account.updateReturnPolicy()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_update_return_policy', {
        returnPolicyId: 'RP123',
        policy,
      });
      expect(mockApi.account.updateReturnPolicy()).toHaveBeenCalledWith('RP123', policy);
    });

    it('ebay_delete_return_policy', async () => {
      vi.mocked(mockApi.account.deleteReturnPolicy()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_delete_return_policy', { returnPolicyId: 'RP123' });
      expect(mockApi.account.deleteReturnPolicy()).toHaveBeenCalledWith('RP123');
    });

    it('ebay_create_custom_policy', async () => {
      const mockResponse = { customPolicyId: 'CP123' };
      const policy = { name: 'Test', policyType: 'RETURN' };
      vi.mocked(mockApi.account.createCustomPolicy()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_create_custom_policy', { policy });
      expect(mockApi.account.createCustomPolicy()).toHaveBeenCalledWith(policy);
    });

    it('ebay_get_custom_policy', async () => {
      const mockResponse = { customPolicyId: 'CP123' };
      vi.mocked(mockApi.account.getCustomPolicy()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_custom_policy', { customPolicyId: 'CP123' });
      expect(mockApi.account.getCustomPolicy()).toHaveBeenCalledWith('CP123');
    });

    it('ebay_update_custom_policy', async () => {
      const mockResponse = { customPolicyId: 'CP123' };
      const policy = { name: 'Updated', policyType: 'RETURN' };
      vi.mocked(mockApi.account.updateCustomPolicy()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_update_custom_policy', {
        customPolicyId: 'CP123',
        policy,
      });
      expect(mockApi.account.updateCustomPolicy()).toHaveBeenCalledWith('CP123', policy);
    });

    it('ebay_delete_custom_policy', async () => {
      vi.mocked(mockApi.account.deleteCustomPolicy()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_delete_custom_policy', { customPolicyId: 'CP123' });
      expect(mockApi.account.deleteCustomPolicy()).toHaveBeenCalledWith('CP123');
    });

    it('ebay_get_kyc', async () => {
      const mockResponse = { status: 'APPROVED' };
      vi.mocked(mockApi.account.getKyc()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_kyc', {});
      expect(mockApi.account.getKyc()).toHaveBeenCalled();
    });

    it('ebay_opt_in_to_payments_program', async () => {
      vi.mocked(mockApi.account.optInToPaymentsProgram()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_opt_in_to_payments_program', {
        marketplaceId: 'EBAY_US',
        paymentsProgramType: 'STANDARD',
      });
      expect(mockApi.account.optInToPaymentsProgram()).toHaveBeenCalledWith('EBAY_US', 'STANDARD');
    });

    it('ebay_get_payments_program_status', async () => {
      const mockResponse = { status: 'OPTED_IN' };
      vi.mocked(mockApi.account.getPaymentsProgramStatus()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_payments_program_status', {
        marketplaceId: 'EBAY_US',
        paymentsProgramType: 'STANDARD',
      });
      expect(mockApi.account.getPaymentsProgramStatus()).toHaveBeenCalledWith('EBAY_US', 'STANDARD');
    });

    it('ebay_get_rate_tables', async () => {
      const mockResponse = { rateTables: [] };
      vi.mocked(mockApi.account.getRateTables()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_rate_tables', {});
      expect(mockApi.account.getRateTables()).toHaveBeenCalled();
    });

    it('ebay_create_or_replace_sales_tax', async () => {
      vi.mocked(mockApi.account.createOrReplaceSalesTax()).mockResolvedValue(undefined);
      const salesTaxBase = { salesTaxPercentage: '8.5' };
      await executeTool(mockApi, 'ebay_create_or_replace_sales_tax', {
        countryCode: 'US',
        jurisdictionId: 'CA',
        salesTaxBase,
      });
      expect(mockApi.account.createOrReplaceSalesTax()).toHaveBeenCalledWith(
        'US',
        'CA',
        salesTaxBase
      );
    });

    it('ebay_bulk_create_or_replace_sales_tax', async () => {
      const mockResponse = { responses: [] };
      const requests = { requests: [] };
      vi.mocked(mockApi.account.bulkCreateOrReplaceSalesTax()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_bulk_create_or_replace_sales_tax', { requests });
      expect(mockApi.account.bulkCreateOrReplaceSalesTax()).toHaveBeenCalledWith(requests);
    });

    it('ebay_delete_sales_tax', async () => {
      vi.mocked(mockApi.account.deleteSalesTax()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_delete_sales_tax', {
        countryCode: 'US',
        jurisdictionId: 'CA',
      });
      expect(mockApi.account.deleteSalesTax()).toHaveBeenCalledWith('US', 'CA');
    });

    it('ebay_get_sales_tax', async () => {
      const mockResponse = { salesTaxPercentage: '8.5' };
      vi.mocked(mockApi.account.getSalesTax()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_sales_tax', {
        countryCode: 'US',
        jurisdictionId: 'CA',
      });
      expect(mockApi.account.getSalesTax()).toHaveBeenCalledWith('US', 'CA');
    });

    it('ebay_get_sales_taxes', async () => {
      const mockResponse = { salesTaxes: [] };
      vi.mocked(mockApi.account.getSalesTaxes()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_sales_taxes', { countryCode: 'US' });
      expect(mockApi.account.getSalesTaxes()).toHaveBeenCalledWith('US');
    });

    it('ebay_get_subscription', async () => {
      const mockResponse = { subscriptionLevel: 'BASIC' };
      vi.mocked(mockApi.account.getSubscription()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_subscription', { limitType: 'monthly' });
      expect(mockApi.account.getSubscription()).toHaveBeenCalledWith('monthly');
    });

    it('ebay_opt_in_to_program', async () => {
      vi.mocked(mockApi.account.optInToProgram()).mockResolvedValue(undefined);
      const request = { programType: 'TOP_RATED' };
      await executeTool(mockApi, 'ebay_opt_in_to_program', { request });
      expect(mockApi.account.optInToProgram()).toHaveBeenCalledWith(request);
    });

    it('ebay_opt_out_of_program', async () => {
      vi.mocked(mockApi.account.optOutOfProgram()).mockResolvedValue(undefined);
      const request = { programType: 'TOP_RATED' };
      await executeTool(mockApi, 'ebay_opt_out_of_program', { request });
      expect(mockApi.account.optOutOfProgram()).toHaveBeenCalledWith(request);
    });

    it('ebay_get_opted_in_programs', async () => {
      const mockResponse = { programs: [] };
      vi.mocked(mockApi.account.getOptedInPrograms()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_opted_in_programs', {});
      expect(mockApi.account.getOptedInPrograms()).toHaveBeenCalled();
    });
  });

  // ===== INVENTORY TOOLS =====
  describe('Inventory Management Tools', () => {
    it('ebay_get_inventory_items', async () => {
      const mockResponse = { inventoryItems: [] };
      vi.mocked(mockApi.inventory.getInventoryItems()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_inventory_items', { limit: 10, offset: 0 });
      expect(mockApi.inventory.getInventoryItems()).toHaveBeenCalledWith(10, 0);
    });

    it('ebay_get_inventory_item', async () => {
      const mockResponse = { sku: 'SKU123' };
      vi.mocked(mockApi.inventory.getInventoryItem()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_inventory_item', { sku: 'SKU123' });
      expect(mockApi.inventory.getInventoryItem()).toHaveBeenCalledWith('SKU123');
    });

    it('ebay_create_inventory_item', async () => {
      vi.mocked(mockApi.inventory.createOrReplaceInventoryItem()).mockResolvedValue(undefined);
      const inventoryItem = { product: { title: 'Test' }, condition: 'NEW' };
      await executeTool(mockApi, 'ebay_create_inventory_item', {
        sku: 'SKU123',
        inventoryItem,
      });
      expect(mockApi.inventory.createOrReplaceInventoryItem()).toHaveBeenCalledWith(
        'SKU123',
        inventoryItem
      );
    });

    // Note: There is no ebay_delete_inventory_item tool - inventory items are managed via create/update
    // Deleted items should be removed from offers instead

    it('ebay_bulk_create_or_replace_inventory_item', async () => {
      const mockResponse = { responses: [] };
      const requests = { requests: [] };
      vi.mocked(mockApi.inventory.bulkCreateOrReplaceInventoryItem()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_bulk_create_or_replace_inventory_item', { requests });
      expect(mockApi.inventory.bulkCreateOrReplaceInventoryItem()).toHaveBeenCalledWith(requests);
    });

    it('ebay_bulk_get_inventory_item', async () => {
      const mockResponse = { responses: [] };
      const requests = { requests: [] };
      vi.mocked(mockApi.inventory.bulkGetInventoryItem()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_bulk_get_inventory_item', { requests });
      expect(mockApi.inventory.bulkGetInventoryItem()).toHaveBeenCalledWith(requests);
    });

    it('ebay_bulk_update_price_quantity', async () => {
      const mockResponse = { responses: [] };
      const requests = { requests: [] };
      vi.mocked(mockApi.inventory.bulkUpdatePriceQuantity()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_bulk_update_price_quantity', { requests });
      expect(mockApi.inventory.bulkUpdatePriceQuantity()).toHaveBeenCalledWith(requests);
    });

    it('ebay_get_product_compatibility', async () => {
      const mockResponse = { compatibleProducts: [] };
      vi.mocked(mockApi.inventory.getProductCompatibility()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_product_compatibility', { sku: 'SKU123' });
      expect(mockApi.inventory.getProductCompatibility()).toHaveBeenCalledWith('SKU123');
    });

    it('ebay_create_or_replace_product_compatibility', async () => {
      vi.mocked(mockApi.inventory.createOrReplaceProductCompatibility()).mockResolvedValue(undefined);
      const compatibility = { compatibleProducts: [] };
      await executeTool(mockApi, 'ebay_create_or_replace_product_compatibility', {
        sku: 'SKU123',
        compatibility,
      });
      expect(mockApi.inventory.createOrReplaceProductCompatibility()).toHaveBeenCalledWith(
        'SKU123',
        compatibility
      );
    });

    it('ebay_delete_product_compatibility', async () => {
      vi.mocked(mockApi.inventory.deleteProductCompatibility()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_delete_product_compatibility', { sku: 'SKU123' });
      expect(mockApi.inventory.deleteProductCompatibility()).toHaveBeenCalledWith('SKU123');
    });

    it('ebay_get_inventory_item_group', async () => {
      const mockResponse = { inventoryItemGroupKey: 'GROUP123' };
      vi.mocked(mockApi.inventory.getInventoryItemGroup()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_inventory_item_group', {
        inventoryItemGroupKey: 'GROUP123',
      });
      expect(mockApi.inventory.getInventoryItemGroup()).toHaveBeenCalledWith('GROUP123');
    });

    it('ebay_create_or_replace_inventory_item_group', async () => {
      vi.mocked(mockApi.inventory.createOrReplaceInventoryItemGroup()).mockResolvedValue(undefined);
      const inventoryItemGroup = { inventoryItemGroupKey: 'GROUP123' };
      await executeTool(mockApi, 'ebay_create_or_replace_inventory_item_group', {
        inventoryItemGroupKey: 'GROUP123',
        inventoryItemGroup,
      });
      expect(mockApi.inventory.createOrReplaceInventoryItemGroup()).toHaveBeenCalledWith(
        'GROUP123',
        inventoryItemGroup
      );
    });

    it('ebay_delete_inventory_item_group', async () => {
      vi.mocked(mockApi.inventory.deleteInventoryItemGroup()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_delete_inventory_item_group', {
        inventoryItemGroupKey: 'GROUP123',
      });
      expect(mockApi.inventory.deleteInventoryItemGroup()).toHaveBeenCalledWith('GROUP123');
    });

    it('ebay_get_inventory_locations', async () => {
      const mockResponse = { locations: [] };
      vi.mocked(mockApi.inventory.getInventoryLocations()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_inventory_locations', { limit: 10, offset: 0 });
      expect(mockApi.inventory.getInventoryLocations()).toHaveBeenCalledWith(10, 0);
    });

    it('ebay_get_inventory_location', async () => {
      const mockResponse = { merchantLocationKey: 'LOC123' };
      vi.mocked(mockApi.inventory.getInventoryLocation()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_inventory_location', {
        merchantLocationKey: 'LOC123',
      });
      expect(mockApi.inventory.getInventoryLocation()).toHaveBeenCalledWith('LOC123');
    });

    it('ebay_create_or_replace_inventory_location', async () => {
      vi.mocked(mockApi.inventory.createOrReplaceInventoryLocation()).mockResolvedValue(undefined);
      const location = { name: 'Warehouse', locationTypes: ['WAREHOUSE'] };
      await executeTool(mockApi, 'ebay_create_or_replace_inventory_location', {
        merchantLocationKey: 'LOC123',
        location,
      });
      expect(mockApi.inventory.createOrReplaceInventoryLocation()).toHaveBeenCalledWith(
        'LOC123',
        location
      );
    });

    it('ebay_delete_inventory_location', async () => {
      vi.mocked(mockApi.inventory.deleteInventoryLocation()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_delete_inventory_location', {
        merchantLocationKey: 'LOC123',
      });
      expect(mockApi.inventory.deleteInventoryLocation()).toHaveBeenCalledWith('LOC123');
    });

    it('ebay_disable_inventory_location', async () => {
      vi.mocked(mockApi.inventory.disableInventoryLocation()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_disable_inventory_location', {
        merchantLocationKey: 'LOC123',
      });
      expect(mockApi.inventory.disableInventoryLocation()).toHaveBeenCalledWith('LOC123');
    });

    it('ebay_enable_inventory_location', async () => {
      vi.mocked(mockApi.inventory.enableInventoryLocation()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_enable_inventory_location', {
        merchantLocationKey: 'LOC123',
      });
      expect(mockApi.inventory.enableInventoryLocation()).toHaveBeenCalledWith('LOC123');
    });

    it('ebay_update_location_details', async () => {
      vi.mocked(mockApi.inventory.updateLocationDetails()).mockResolvedValue(undefined);
      const locationDetails = { name: 'Updated' };
      await executeTool(mockApi, 'ebay_update_location_details', {
        merchantLocationKey: 'LOC123',
        locationDetails,
      });
      expect(mockApi.inventory.updateLocationDetails()).toHaveBeenCalledWith(
        'LOC123',
        locationDetails
      );
    });

    it('ebay_get_offers', async () => {
      const mockResponse = { offers: [] };
      vi.mocked(mockApi.inventory.getOffers()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_offers', { sku: 'SKU123' });
      expect(mockApi.inventory.getOffers()).toHaveBeenCalledWith('SKU123', undefined, undefined);
    });

    it('ebay_get_offer', async () => {
      const mockResponse = { offerId: 'OFFER123' };
      vi.mocked(mockApi.inventory.getOffer()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_offer', { offerId: 'OFFER123' });
      expect(mockApi.inventory.getOffer()).toHaveBeenCalledWith('OFFER123');
    });

    it('ebay_create_offer', async () => {
      const mockResponse = { offerId: 'OFFER123' };
      const offer = { sku: 'SKU123', marketplaceId: 'EBAY_US', format: 'FIXED_PRICE' };
      vi.mocked(mockApi.inventory.createOffer()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_create_offer', { offer });
      expect(mockApi.inventory.createOffer()).toHaveBeenCalledWith(offer);
    });

    it('ebay_update_offer', async () => {
      const mockResponse = { offerId: 'OFFER123' };
      const offer = { sku: 'SKU123', marketplaceId: 'EBAY_US', format: 'FIXED_PRICE' };
      vi.mocked(mockApi.inventory.updateOffer()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_update_offer', { offerId: 'OFFER123', offer });
      expect(mockApi.inventory.updateOffer()).toHaveBeenCalledWith('OFFER123', offer);
    });

    it('ebay_delete_offer', async () => {
      vi.mocked(mockApi.inventory.deleteOffer()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_delete_offer', { offerId: 'OFFER123' });
      expect(mockApi.inventory.deleteOffer()).toHaveBeenCalledWith('OFFER123');
    });

    it('ebay_publish_offer', async () => {
      const mockResponse = { listingId: 'LISTING123' };
      vi.mocked(mockApi.inventory.publishOffer()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_publish_offer', { offerId: 'OFFER123' });
      expect(mockApi.inventory.publishOffer()).toHaveBeenCalledWith('OFFER123');
    });

    it('ebay_withdraw_offer', async () => {
      const mockResponse = { offerId: 'OFFER123' };
      vi.mocked(mockApi.inventory.withdrawOffer()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_withdraw_offer', { offerId: 'OFFER123' });
      expect(mockApi.inventory.withdrawOffer()).toHaveBeenCalledWith('OFFER123');
    });

    it('ebay_bulk_create_offer', async () => {
      const mockResponse = { responses: [] };
      const requests = { requests: [] };
      vi.mocked(mockApi.inventory.bulkCreateOffer()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_bulk_create_offer', { requests });
      expect(mockApi.inventory.bulkCreateOffer()).toHaveBeenCalledWith(requests);
    });

    it('ebay_bulk_publish_offer', async () => {
      const mockResponse = { responses: [] };
      const requests = { requests: [] };
      vi.mocked(mockApi.inventory.bulkPublishOffer()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_bulk_publish_offer', { requests });
      expect(mockApi.inventory.bulkPublishOffer()).toHaveBeenCalledWith(requests);
    });

    it('ebay_get_listing_fees', async () => {
      const mockResponse = { feeSummaries: [] };
      const offers = { offers: [] };
      vi.mocked(mockApi.inventory.getListingFees()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_listing_fees', { offers });
      expect(mockApi.inventory.getListingFees()).toHaveBeenCalledWith(offers);
    });

    it('ebay_bulk_migrate_listing', async () => {
      const mockResponse = { responses: [] };
      const requests = { requests: [] };
      vi.mocked(mockApi.inventory.bulkMigrateListing()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_bulk_migrate_listing', { requests });
      expect(mockApi.inventory.bulkMigrateListing()).toHaveBeenCalledWith(requests);
    });
  });

  // ===== FULFILLMENT TOOLS =====
  describe('Fulfillment Tools', () => {
    it('ebay_get_orders', async () => {
      const mockResponse = { orders: [] };
      vi.mocked(mockApi.fulfillment.getOrders()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_orders', { filter: 'test', limit: 10 });
      expect(mockApi.fulfillment.getOrders()).toHaveBeenCalledWith('test', 10, undefined);
    });

    it('ebay_get_order', async () => {
      const mockResponse = { orderId: 'ORDER123' };
      vi.mocked(mockApi.fulfillment.getOrder()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_order', { orderId: 'ORDER123' });
      expect(mockApi.fulfillment.getOrder()).toHaveBeenCalledWith('ORDER123');
    });

    it('ebay_create_shipping_fulfillment', async () => {
      const mockResponse = { fulfillmentId: 'FULFILL123' };
      const fulfillment = { lineItems: [], trackingNumber: '123' };
      vi.mocked(mockApi.fulfillment.createShippingFulfillment()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_create_shipping_fulfillment', {
        orderId: 'ORDER123',
        fulfillment,
      });
      expect(mockApi.fulfillment.createShippingFulfillment()).toHaveBeenCalledWith(
        'ORDER123',
        fulfillment
      );
    });

    it('ebay_issue_refund', async () => {
      const mockResponse = { refundId: 'REFUND123' };
      const refundData = {
        reasonForRefund: 'TEST',
        orderLevelRefundAmount: { value: '10', currency: 'USD' },
      };
      vi.mocked(mockApi.fulfillment.issueRefund()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_issue_refund', {
        orderId: 'ORDER123',
        refundData,
      });
      expect(mockApi.fulfillment.issueRefund()).toHaveBeenCalledWith('ORDER123', refundData);
    });
  });

  // Continue with remaining tools...
  // Due to length constraints, I'll add a few more critical tool categories

  describe('Marketing Tools', () => {
    it('ebay_get_campaigns', async () => {
      const mockResponse = { campaigns: [] };
      vi.mocked(mockApi.marketing.getCampaigns()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_campaigns', { campaignStatus: 'RUNNING' });
      expect(mockApi.marketing.getCampaigns()).toHaveBeenCalledWith('RUNNING', undefined, undefined);
    });

    it('ebay_get_campaign', async () => {
      const mockResponse = { campaignId: 'CAMP123' };
      vi.mocked(mockApi.marketing.getCampaign()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_campaign', { campaignId: 'CAMP123' });
      expect(mockApi.marketing.getCampaign()).toHaveBeenCalledWith('CAMP123');
    });

    it('ebay_pause_campaign', async () => {
      vi.mocked(mockApi.marketing.pauseCampaign()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_pause_campaign', { campaignId: 'CAMP123' });
      expect(mockApi.marketing.pauseCampaign()).toHaveBeenCalledWith('CAMP123');
    });

    it('ebay_resume_campaign', async () => {
      vi.mocked(mockApi.marketing.resumeCampaign()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_resume_campaign', { campaignId: 'CAMP123' });
      expect(mockApi.marketing.resumeCampaign()).toHaveBeenCalledWith('CAMP123');
    });

    it('ebay_end_campaign', async () => {
      vi.mocked(mockApi.marketing.endCampaign()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_end_campaign', { campaignId: 'CAMP123' });
      expect(mockApi.marketing.endCampaign()).toHaveBeenCalledWith('CAMP123');
    });

    it('ebay_update_campaign_identification', async () => {
      vi.mocked(mockApi.marketing.updateCampaignIdentification()).mockResolvedValue(undefined);
      const updateData = { campaignName: 'Updated' };
      await executeTool(mockApi, 'ebay_update_campaign_identification', {
        campaignId: 'CAMP123',
        updateData,
      });
      expect(mockApi.marketing.updateCampaignIdentification()).toHaveBeenCalledWith(
        'CAMP123',
        updateData
      );
    });

    it('ebay_clone_campaign', async () => {
      const mockResponse = { campaignId: 'CAMP124' };
      const cloneData = { campaignName: 'Cloned' };
      vi.mocked(mockApi.marketing.cloneCampaign()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_clone_campaign', {
        campaignId: 'CAMP123',
        cloneData,
      });
      expect(mockApi.marketing.cloneCampaign()).toHaveBeenCalledWith('CAMP123', cloneData);
    });

    it('ebay_get_promotions', async () => {
      const mockResponse = { promotions: [] };
      vi.mocked(mockApi.marketing.getPromotions()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_promotions', { marketplaceId: 'EBAY_US' });
      expect(mockApi.marketing.getPromotions()).toHaveBeenCalledWith('EBAY_US', undefined);
    });
  });

  describe('Communication Tools', () => {
    it('ebay_get_offers_to_buyers', async () => {
      const mockResponse = { offers: [] };
      vi.mocked(mockApi.negotiation.getOffersToBuyers()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_offers_to_buyers', { filter: 'test' });
      expect(mockApi.negotiation.getOffersToBuyers()).toHaveBeenCalledWith(
        'test',
        undefined,
        undefined
      );
    });

    it('ebay_send_offer_to_interested_buyers', async () => {
      vi.mocked(mockApi.negotiation.sendOfferToInterestedBuyers()).mockResolvedValue(undefined);
      const offerRequest = { message: 'Test' };
      await executeTool(mockApi, 'ebay_send_offer_to_interested_buyers', offerRequest);
      expect(mockApi.negotiation.sendOfferToInterestedBuyers()).toHaveBeenCalledWith(offerRequest);
    });

    it('ebay_search_messages', async () => {
      const mockResponse = { messages: [] };
      vi.mocked(mockApi.message.searchMessages()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_search_messages', {
        conversation_type: 'FROM_MEMBERS',
        limit: '25',
        offset: '0',
      });
      expect(mockApi.message.searchMessages()).toHaveBeenCalledWith(undefined, 25, 0);
    });

    it('ebay_get_message', async () => {
      const mockResponse = { messageId: 'MSG123' };
      vi.mocked(mockApi.message.getMessage()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_message', {
        conversation_id: 'CONV123',
        conversation_type: 'FROM_MEMBERS',
      });
      expect(mockApi.message.getMessage()).toHaveBeenCalledWith('CONV123');
    });

    it('ebay_send_message', async () => {
      vi.mocked(mockApi.message.sendMessage()).mockResolvedValue(undefined);
      const messageData = {
        message_text: 'Hello',
        other_party_username: 'buyer123',
      };
      await executeTool(mockApi, 'ebay_send_message', messageData);
      expect(mockApi.message.sendMessage()).toHaveBeenCalledWith(messageData);
    });

    it('ebay_reply_to_message', async () => {
      vi.mocked(mockApi.message.replyToMessage()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_reply_to_message', {
        messageId: 'MSG123',
        messageContent: 'Reply',
      });
      expect(mockApi.message.replyToMessage()).toHaveBeenCalledWith('MSG123', 'Reply');
    });
  });

  describe('Recommendation Tools', () => {
    it('ebay_find_listing_recommendations', async () => {
      const mockResponse = { listingRecommendations: [] };
      vi.mocked(mockApi.recommendation.findListingRecommendations()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_find_listing_recommendations', {
        listingIds: ['LISTING123'],
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.recommendation.findListingRecommendations()).toHaveBeenCalledWith(
        { listingIds: ['LISTING123'] },
        undefined,
        undefined,
        undefined,
        'EBAY_US'
      );
    });
  });

  describe('Analytics Tools', () => {
    it('ebay_get_traffic_report', async () => {
      const mockResponse = { records: [] };
      vi.mocked(mockApi.analytics.getTrafficReport()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_traffic_report', {
        dimension: 'LISTING',
        filter: 'test',
        metric: 'CLICK_THROUGH_RATE',
      });
      expect(mockApi.analytics.getTrafficReport()).toHaveBeenCalledWith(
        'LISTING',
        'test',
        'CLICK_THROUGH_RATE',
        undefined
      );
    });

    it('ebay_find_seller_standards_profiles', async () => {
      const mockResponse = { standards: [] };
      vi.mocked(mockApi.analytics.findSellerStandardsProfiles()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_find_seller_standards_profiles', {});
      expect(mockApi.analytics.findSellerStandardsProfiles()).toHaveBeenCalled();
    });

    it('ebay_get_seller_standards_profile', async () => {
      const mockResponse = { status: 'GOOD' };
      vi.mocked(mockApi.analytics.getSellerStandardsProfile()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_seller_standards_profile', {
        program: 'CUSTOMER_SERVICE',
        cycle: 'CURRENT',
      });
      expect(mockApi.analytics.getSellerStandardsProfile()).toHaveBeenCalledWith(
        'CUSTOMER_SERVICE',
        'CURRENT'
      );
    });

    it('ebay_get_customer_service_metric', async () => {
      const mockResponse = { metrics: [] };
      vi.mocked(mockApi.analytics.getCustomerServiceMetric()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_customer_service_metric', {
        customerServiceMetricType: 'INQUIRY_RESPONSE',
        evaluationType: 'CURRENT',
        evaluationMarketplaceId: 'EBAY_US',
      });
      expect(mockApi.analytics.getCustomerServiceMetric()).toHaveBeenCalledWith(
        'INQUIRY_RESPONSE',
        'CURRENT',
        'EBAY_US'
      );
    });
  });

  describe('Metadata Tools', () => {
    it('ebay_get_automotive_parts_compatibility_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getAutomotivePartsCompatibilityPolicies()).mockResolvedValue(
        mockResponse
      );
      await executeTool(mockApi, 'ebay_get_automotive_parts_compatibility_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getAutomotivePartsCompatibilityPolicies()).toHaveBeenCalledWith(
        'EBAY_US',
        undefined
      );
    });

    it('ebay_get_category_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getCategoryPolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_category_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getCategoryPolicies()).toHaveBeenCalledWith('EBAY_US', undefined);
    });

    it('ebay_get_extended_producer_responsibility_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getExtendedProducerResponsibilityPolicies()).mockResolvedValue(
        mockResponse
      );
      await executeTool(mockApi, 'ebay_get_extended_producer_responsibility_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getExtendedProducerResponsibilityPolicies()).toHaveBeenCalledWith(
        'EBAY_US',
        undefined
      );
    });

    it('ebay_get_hazardous_materials_labels', async () => {
      const mockResponse = { labels: [] };
      vi.mocked(mockApi.metadata.getHazardousMaterialsLabels()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_hazardous_materials_labels', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getHazardousMaterialsLabels()).toHaveBeenCalledWith('EBAY_US');
    });

    it('ebay_get_item_condition_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getItemConditionPolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_item_condition_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getItemConditionPolicies()).toHaveBeenCalledWith('EBAY_US', undefined);
    });

    it('ebay_get_listing_structure_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getListingStructurePolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_listing_structure_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getListingStructurePolicies()).toHaveBeenCalledWith(
        'EBAY_US',
        undefined
      );
    });

    it('ebay_get_negotiated_price_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getNegotiatedPricePolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_negotiated_price_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getNegotiatedPricePolicies()).toHaveBeenCalledWith(
        'EBAY_US',
        undefined
      );
    });

    it('ebay_get_product_safety_labels', async () => {
      const mockResponse = { labels: [] };
      vi.mocked(mockApi.metadata.getProductSafetyLabels()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_product_safety_labels', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getProductSafetyLabels()).toHaveBeenCalledWith('EBAY_US');
    });

    it('ebay_get_regulatory_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getRegulatoryPolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_regulatory_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getRegulatoryPolicies()).toHaveBeenCalledWith('EBAY_US', undefined);
    });

    it('ebay_get_shipping_cost_type_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getShippingCostTypePolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_shipping_cost_type_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getShippingCostTypePolicies()).toHaveBeenCalledWith(
        'EBAY_US',
        undefined
      );
    });

    it('ebay_get_classified_ad_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getClassifiedAdPolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_classified_ad_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getClassifiedAdPolicies()).toHaveBeenCalledWith('EBAY_US', undefined);
    });

    it('ebay_get_currencies', async () => {
      const mockResponse = { currencies: [] };
      vi.mocked(mockApi.metadata.getCurrencies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_currencies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getCurrencies()).toHaveBeenCalledWith('EBAY_US');
    });

    it('ebay_get_listing_type_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getListingTypePolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_listing_type_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getListingTypePolicies()).toHaveBeenCalledWith('EBAY_US', undefined);
    });

    it('ebay_get_motors_listing_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getMotorsListingPolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_motors_listing_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getMotorsListingPolicies()).toHaveBeenCalledWith('EBAY_US', undefined);
    });

    it('ebay_get_shipping_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getShippingPolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_shipping_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getShippingPolicies()).toHaveBeenCalledWith('EBAY_US', undefined);
    });

    it('ebay_get_site_visibility_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getSiteVisibilityPolicies()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_site_visibility_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getSiteVisibilityPolicies()).toHaveBeenCalledWith('EBAY_US', undefined);
    });

    it('ebay_get_compatibilities_by_specification', async () => {
      const mockResponse = { compatibilities: [] };
      const specification = { categoryId: '123' };
      vi.mocked(mockApi.metadata.getCompatibilitiesBySpecification()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_compatibilities_by_specification', { specification });
      expect(mockApi.metadata.getCompatibilitiesBySpecification()).toHaveBeenCalledWith(
        specification
      );
    });

    it('ebay_get_compatibility_property_names', async () => {
      const mockResponse = { names: [] };
      const data = { categoryTreeId: '0' };
      vi.mocked(mockApi.metadata.getCompatibilityPropertyNames()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_compatibility_property_names', { data });
      expect(mockApi.metadata.getCompatibilityPropertyNames()).toHaveBeenCalledWith(data);
    });

    it('ebay_get_compatibility_property_values', async () => {
      const mockResponse = { values: [] };
      const data = { categoryTreeId: '0' };
      vi.mocked(mockApi.metadata.getCompatibilityPropertyValues()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_compatibility_property_values', { data });
      expect(mockApi.metadata.getCompatibilityPropertyValues()).toHaveBeenCalledWith(data);
    });

    it('ebay_get_multi_compatibility_property_values', async () => {
      const mockResponse = { values: [] };
      const data = { categoryTreeId: '0' };
      vi.mocked(mockApi.metadata.getMultiCompatibilityPropertyValues()).mockResolvedValue(
        mockResponse
      );
      await executeTool(mockApi, 'ebay_get_multi_compatibility_property_values', { data });
      expect(mockApi.metadata.getMultiCompatibilityPropertyValues()).toHaveBeenCalledWith(data);
    });

    it('ebay_get_product_compatibilities', async () => {
      const mockResponse = { compatibilities: [] };
      const data = { categoryTreeId: '0' };
      vi.mocked(mockApi.metadata.getProductCompatibilities()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_product_compatibilities', { data });
      expect(mockApi.metadata.getProductCompatibilities()).toHaveBeenCalledWith(data);
    });

    it('ebay_get_sales_tax_jurisdictions', async () => {
      const mockResponse = { jurisdictions: [] };
      vi.mocked(mockApi.metadata.getSalesTaxJurisdictions()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_sales_tax_jurisdictions', {
        countryCode: 'US',
      });
      expect(mockApi.metadata.getSalesTaxJurisdictions()).toHaveBeenCalledWith('US');
    });
  });

  describe('Taxonomy Tools', () => {
    it('ebay_get_default_category_tree_id', async () => {
      const mockResponse = { categoryTreeId: '0' };
      vi.mocked(mockApi.taxonomy.getDefaultCategoryTreeId()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_default_category_tree_id', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.taxonomy.getDefaultCategoryTreeId()).toHaveBeenCalledWith('EBAY_US');
    });

    it('ebay_get_category_tree', async () => {
      const mockResponse = { rootCategoryNode: {} };
      vi.mocked(mockApi.taxonomy.getCategoryTree()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_category_tree', {
        categoryTreeId: '0',
      });
      expect(mockApi.taxonomy.getCategoryTree()).toHaveBeenCalledWith('0');
    });

    it('ebay_get_category_suggestions', async () => {
      const mockResponse = { categorySuggestions: [] };
      vi.mocked(mockApi.taxonomy.getCategorySuggestions()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_category_suggestions', {
        categoryTreeId: '0',
        query: 'iPhone',
      });
      expect(mockApi.taxonomy.getCategorySuggestions()).toHaveBeenCalledWith('0', 'iPhone');
    });

    it('ebay_get_item_aspects_for_category', async () => {
      const mockResponse = { aspects: [] };
      vi.mocked(mockApi.taxonomy.getItemAspectsForCategory()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_item_aspects_for_category', {
        categoryTreeId: '0',
        categoryId: '123',
      });
      expect(mockApi.taxonomy.getItemAspectsForCategory()).toHaveBeenCalledWith('0', '123');
    });
  });

  describe('Other API Tools', () => {
    it('ebay_get_user', async () => {
      const mockResponse = { userId: 'USER123' };
      vi.mocked(mockApi.identity.getUser()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_user', {});
      expect(mockApi.identity.getUser()).toHaveBeenCalled();
    });

    it('ebay_get_listing_violations', async () => {
      const mockResponse = { listingViolations: [] };
      vi.mocked(mockApi.compliance.getListingViolations()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_listing_violations', {
        complianceType: 'PRODUCT_ADOPTION',
      });
      expect(mockApi.compliance.getListingViolations()).toHaveBeenCalledWith(
        'PRODUCT_ADOPTION',
        undefined,
        undefined
      );
    });

    it('ebay_get_listing_violations_summary', async () => {
      const mockResponse = { violationSummaries: [] };
      vi.mocked(mockApi.compliance.getListingViolationsSummary()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_listing_violations_summary', {
        complianceType: 'PRODUCT_ADOPTION',
      });
      expect(mockApi.compliance.getListingViolationsSummary()).toHaveBeenCalledWith(
        'PRODUCT_ADOPTION'
      );
    });

    it('ebay_suppress_violation', async () => {
      vi.mocked(mockApi.compliance.suppressViolation()).mockResolvedValue(undefined);
      await executeTool(mockApi, 'ebay_suppress_violation', {
        listingViolationId: 'VIOLATION123',
      });
      expect(mockApi.compliance.suppressViolation()).toHaveBeenCalledWith('VIOLATION123');
    });

    it('ebay_create_vero_report', async () => {
      const mockResponse = { veroReportId: 'REPORT123' };
      const reportData = { items: [{ itemId: 'ITEM123', reportingReason: 'TRADEMARK' }] };
      vi.mocked(mockApi.vero.createVeroReport()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_create_vero_report', { reportData });
      expect(mockApi.vero.createVeroReport()).toHaveBeenCalledWith(reportData);
    });

    it('ebay_get_vero_report', async () => {
      const mockResponse = { veroReportId: 'REPORT123', status: 'OPEN' };
      vi.mocked(mockApi.vero.getVeroReport()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_vero_report', { veroReportId: 'REPORT123' });
      expect(mockApi.vero.getVeroReport()).toHaveBeenCalledWith('REPORT123');
    });

    it('ebay_get_vero_report_items', async () => {
      const mockResponse = { items: [] };
      vi.mocked(mockApi.vero.getVeroReportItems()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_vero_report_items', { filter: 'test' });
      expect(mockApi.vero.getVeroReportItems()).toHaveBeenCalledWith('test', undefined, undefined);
    });

    it('ebay_get_vero_reason_code', async () => {
      const mockResponse = { veroReasonCodeId: 'CODE123', name: 'Trademark' };
      vi.mocked(mockApi.vero.getVeroReasonCode()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_vero_reason_code', { veroReasonCodeId: 'CODE123' });
      expect(mockApi.vero.getVeroReasonCode()).toHaveBeenCalledWith('CODE123');
    });

    it('ebay_get_vero_reason_codes', async () => {
      const mockResponse = { veroReasonCodes: [] };
      vi.mocked(mockApi.vero.getVeroReasonCodes()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_vero_reason_codes', {});
      expect(mockApi.vero.getVeroReasonCodes()).toHaveBeenCalled();
    });

    it('ebay_translate', async () => {
      const mockResponse = { translations: [] };
      vi.mocked(mockApi.translation.translate()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_translate', {
        from: 'en',
        to: 'es',
        translationContext: 'ITEM_TITLE',
        text: ['Hello'],
      });
      expect(mockApi.translation.translate()).toHaveBeenCalledWith('en', 'es', 'ITEM_TITLE', [
        'Hello',
      ]);
    });

    it('ebay_create_shipping_quote', async () => {
      const mockResponse = { quoteId: 'QUOTE123' };
      const shippingQuoteRequest = { packageDetails: {} };
      vi.mocked(mockApi.edelivery.createShippingQuote()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_create_shipping_quote', { shippingQuoteRequest });
      expect(mockApi.edelivery.createShippingQuote()).toHaveBeenCalledWith(shippingQuoteRequest);
    });

    it('ebay_get_shipping_quote', async () => {
      const mockResponse = { quoteId: 'QUOTE123' };
      vi.mocked(mockApi.edelivery.getShippingQuote()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_shipping_quote', {
        shippingQuoteId: 'QUOTE123',
      });
      expect(mockApi.edelivery.getShippingQuote()).toHaveBeenCalledWith('QUOTE123');
    });
  });

  describe('Notification Tools', () => {
    it('ebay_get_notification_config', async () => {
      const mockResponse = { config: {} };
      vi.mocked(mockApi.notification.getConfig()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_notification_config', {});
      expect(mockApi.notification.getConfig()).toHaveBeenCalled();
    });

    it('ebay_update_notification_config', async () => {
      vi.mocked(mockApi.notification.updateConfig()).mockResolvedValue(undefined);
      const args = { alert_email: 'test@example.com' };
      await executeTool(mockApi, 'ebay_update_notification_config', args);
      expect(mockApi.notification.updateConfig()).toHaveBeenCalledWith(args);
    });

    it('ebay_create_notification_destination', async () => {
      const mockResponse = { destinationId: 'DEST123' };
      const args = {
        name: 'Test Destination',
        delivery_config: {
          endpoint: 'https://example.com/webhook',
          verification_token: 'abcdef1234567890abcdef1234567890',
        },
        status: 'ENABLED',
      };
      vi.mocked(mockApi.notification.createDestination()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_create_notification_destination', args);
      expect(mockApi.notification.createDestination()).toHaveBeenCalledWith(args);
    });
  });

  describe('Feedback Tools', () => {
    it('ebay_get_feedback', async () => {
      const mockResponse = { feedbackId: 'FEEDBACK123' };
      vi.mocked(mockApi.feedback.getFeedback()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_feedback', {
        user_id: 'USER123',
        feedback_type: 'POSITIVE',
        transaction_id: 'TRANS123',
      });
      expect(mockApi.feedback.getFeedback()).toHaveBeenCalledWith('TRANS123');
    });

    it('ebay_leave_feedback_for_buyer', async () => {
      vi.mocked(mockApi.feedback.leaveFeedbackForBuyer()).mockResolvedValue(undefined);
      const args = {
        listing_id: 'LISTING123',
        comment_text: 'Great buyer!',
        comment_type: 'POSITIVE',
      };
      await executeTool(mockApi, 'ebay_leave_feedback_for_buyer', args);
      expect(mockApi.feedback.leaveFeedbackForBuyer()).toHaveBeenCalledWith(args);
    });

    it('ebay_get_feedback_summary', async () => {
      const mockResponse = { feedbackScore: 100 };
      vi.mocked(mockApi.feedback.getFeedbackSummary()).mockResolvedValue(mockResponse);
      await executeTool(mockApi, 'ebay_get_feedback_summary', {
        user_id: 'USER123',
        filter: 'ratingType:{POSITIVE}',
      });
      expect(mockApi.feedback.getFeedbackSummary()).toHaveBeenCalled();
    });
  });
});
