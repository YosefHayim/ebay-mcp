import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Effect } from 'effect';
import { executeTool } from '@/tools/index.js';
import type { EbaySellerApi } from '@/api/ebaySellerApi.js';
import process from 'node:process';

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
        getKyc: vi.fn(),
        getPaymentsProgram: vi.fn(),
        getPaymentsProgramOnboarding: vi.fn(),
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
        getPrivileges: vi.fn(),
        getAdvertisingEligibility: vi.fn(),
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
        createInventoryLocation: vi.fn(),
        deleteInventoryLocation: vi.fn(),
        disableInventoryLocation: vi.fn(),
        enableInventoryLocation: vi.fn(),
        updateInventoryLocation: vi.fn(),
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
        getSkuLocationMapping: vi.fn(),
        createOrReplaceSkuLocationMapping: vi.fn(),
        deleteSkuLocationMapping: vi.fn(),
        publishOfferByInventoryItemGroup: vi.fn(),
        withdrawOfferByInventoryItemGroup: vi.fn(),
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
        getActivities: vi.fn(),
        fetchEvidenceContent: vi.fn(),
        contestPaymentDispute: vi.fn(),
        acceptPaymentDispute: vi.fn(),
        uploadEvidenceFile: vi.fn(),
        addEvidence: vi.fn(),
        updateEvidence: vi.fn(),
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
        sendOfferToInterestedBuyers: vi.fn(),
      },
      message: {
        sendMessage: vi.fn(),
        getConversations: vi.fn(),
        getConversation: vi.fn(),
      },
      notification: {
        getConfig: vi.fn(),
        updateConfig: vi.fn(),
        createDestination: vi.fn(),
      },
      feedback: {
        getFeedback: vi.fn(),
        leaveFeedbackForBuyer: vi.fn(),
        getFeedbackRatingSummary: vi.fn(),
      },
      identity: {
        getUser: vi.fn(),
      },
      compliance: {
        getListingViolations: vi.fn(),
        getListingViolationsSummary: vi.fn(),
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
        getActualCosts: vi.fn(),
        getAddressPreferences: vi.fn(),
        createAddressPreference: vi.fn(),
        getConsignPreferences: vi.fn(),
        createConsignPreference: vi.fn(),
        getAgents: vi.fn(),
        getBatteryQualifications: vi.fn(),
        getDropoffSites: vi.fn(),
        getServices: vi.fn(),
        createBundle: vi.fn(),
        getBundle: vi.fn(),
        cancelBundle: vi.fn(),
        getBundleLabel: vi.fn(),
        createPackage: vi.fn(),
        getPackage: vi.fn(),
        deletePackage: vi.fn(),
        getPackagesByLineItemId: vi.fn(),
        cancelPackage: vi.fn(),
        clonePackage: vi.fn(),
        confirmPackage: vi.fn(),
        bulkCancelPackages: vi.fn(),
        bulkConfirmPackages: vi.fn(),
        bulkDeletePackages: vi.fn(),
        getLabels: vi.fn(),
        getHandoverSheet: vi.fn(),
        getTracking: vi.fn(),
        createComplaint: vi.fn(),
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
      const input = { policyTypes: 'RETURN' };
      vi.mocked(mockApi.account.getCustomPolicies).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_custom_policies', input);
      expect(mockApi.account.getCustomPolicies).toHaveBeenCalledWith(input);
    });

    it('ebay_get_fulfillment_policies', async () => {
      const mockResponse = { fulfillmentPolicies: [] };
      const input = { marketplaceId: 'EBAY_US' };
      vi.mocked(mockApi.account.getFulfillmentPolicies).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_fulfillment_policies', input);
      expect(mockApi.account.getFulfillmentPolicies).toHaveBeenCalledWith(input);
    });

    it('ebay_get_payment_policies', async () => {
      const mockResponse = { paymentPolicies: [] };
      const input = { marketplaceId: 'EBAY_US' };
      vi.mocked(mockApi.account.getPaymentPolicies).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_payment_policies', input);
      expect(mockApi.account.getPaymentPolicies).toHaveBeenCalledWith(input);
    });

    it('ebay_get_return_policies', async () => {
      const mockResponse = { returnPolicies: [] };
      const input = { marketplaceId: 'EBAY_US' };
      vi.mocked(mockApi.account.getReturnPolicies).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_return_policies', input);
      expect(mockApi.account.getReturnPolicies).toHaveBeenCalledWith(input);
    });

    it('ebay_create_fulfillment_policy', async () => {
      const mockResponse = { fulfillmentPolicyId: 'FP123' };
      const policy = { name: 'Test', marketplaceId: 'EBAY_US' };
      const input = { policy };
      vi.mocked(mockApi.account.createFulfillmentPolicy).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_create_fulfillment_policy', input);
      expect(mockApi.account.createFulfillmentPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_get_fulfillment_policy', async () => {
      const mockResponse = { fulfillmentPolicyId: 'FP123' };
      const input = { fulfillmentPolicyId: 'FP123' };
      vi.mocked(mockApi.account.getFulfillmentPolicy).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_fulfillment_policy', input);
      expect(mockApi.account.getFulfillmentPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_get_fulfillment_policy_by_name', async () => {
      const mockResponse = { fulfillmentPolicyId: 'FP123' };
      const input = {
        marketplaceId: 'EBAY_US',
        name: 'Test',
      };
      vi.mocked(mockApi.account.getFulfillmentPolicyByName).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_fulfillment_policy_by_name', input);
      expect(mockApi.account.getFulfillmentPolicyByName).toHaveBeenCalledWith(input);
    });

    it('ebay_update_fulfillment_policy', async () => {
      const mockResponse = { fulfillmentPolicyId: 'FP123' };
      const policy = { name: 'Updated', marketplaceId: 'EBAY_US' };
      const input = {
        fulfillmentPolicyId: 'FP123',
        policy,
      };
      vi.mocked(mockApi.account.updateFulfillmentPolicy).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_update_fulfillment_policy', input);
      expect(mockApi.account.updateFulfillmentPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_delete_fulfillment_policy', async () => {
      const input = { fulfillmentPolicyId: 'FP123' };
      vi.mocked(mockApi.account.deleteFulfillmentPolicy).mockReturnValue(Effect.succeed(undefined));
      await executeTool(mockApi, 'ebay_delete_fulfillment_policy', input);
      expect(mockApi.account.deleteFulfillmentPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_create_payment_policy', async () => {
      const mockResponse = { paymentPolicyId: 'PP123' };
      const policy = { name: 'Test', marketplaceId: 'EBAY_US' };
      const input = { policy };
      vi.mocked(mockApi.account.createPaymentPolicy).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_create_payment_policy', input);
      expect(mockApi.account.createPaymentPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_get_payment_policy', async () => {
      const mockResponse = { paymentPolicyId: 'PP123' };
      const input = { paymentPolicyId: 'PP123' };
      vi.mocked(mockApi.account.getPaymentPolicy).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_payment_policy', input);
      expect(mockApi.account.getPaymentPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_get_payment_policy_by_name', async () => {
      const mockResponse = { paymentPolicyId: 'PP123' };
      const input = {
        marketplaceId: 'EBAY_US',
        name: 'Test',
      };
      vi.mocked(mockApi.account.getPaymentPolicyByName).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_payment_policy_by_name', input);
      expect(mockApi.account.getPaymentPolicyByName).toHaveBeenCalledWith(input);
    });

    it('ebay_update_payment_policy', async () => {
      const mockResponse = { paymentPolicyId: 'PP123' };
      const policy = { name: 'Updated', marketplaceId: 'EBAY_US' };
      const input = {
        paymentPolicyId: 'PP123',
        policy,
      };
      vi.mocked(mockApi.account.updatePaymentPolicy).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_update_payment_policy', input);
      expect(mockApi.account.updatePaymentPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_delete_payment_policy', async () => {
      const input = { paymentPolicyId: 'PP123' };
      vi.mocked(mockApi.account.deletePaymentPolicy).mockReturnValue(Effect.succeed(undefined));
      await executeTool(mockApi, 'ebay_delete_payment_policy', input);
      expect(mockApi.account.deletePaymentPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_create_return_policy', async () => {
      const mockResponse = { returnPolicyId: 'RP123' };
      const policy = { name: 'Test', marketplaceId: 'EBAY_US' };
      const input = { policy };
      vi.mocked(mockApi.account.createReturnPolicy).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_create_return_policy', input);
      expect(mockApi.account.createReturnPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_get_return_policy', async () => {
      const mockResponse = { returnPolicyId: 'RP123' };
      const input = { returnPolicyId: 'RP123' };
      vi.mocked(mockApi.account.getReturnPolicy).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_return_policy', input);
      expect(mockApi.account.getReturnPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_get_return_policy_by_name', async () => {
      const mockResponse = { returnPolicyId: 'RP123' };
      const input = {
        marketplaceId: 'EBAY_US',
        name: 'Test',
      };
      vi.mocked(mockApi.account.getReturnPolicyByName).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_return_policy_by_name', input);
      expect(mockApi.account.getReturnPolicyByName).toHaveBeenCalledWith(input);
    });

    it('ebay_update_return_policy', async () => {
      const mockResponse = { returnPolicyId: 'RP123' };
      const policy = { name: 'Updated', marketplaceId: 'EBAY_US' };
      const input = {
        returnPolicyId: 'RP123',
        policy,
      };
      vi.mocked(mockApi.account.updateReturnPolicy).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_update_return_policy', input);
      expect(mockApi.account.updateReturnPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_delete_return_policy', async () => {
      const input = { returnPolicyId: 'RP123' };
      vi.mocked(mockApi.account.deleteReturnPolicy).mockReturnValue(Effect.succeed(undefined));
      await executeTool(mockApi, 'ebay_delete_return_policy', input);
      expect(mockApi.account.deleteReturnPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_create_custom_policy', async () => {
      const mockResponse = { customPolicyId: 'CP123' };
      const policy = { name: 'Test', policyType: 'RETURN' };
      const input = { policy };
      vi.mocked(mockApi.account.createCustomPolicy).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_create_custom_policy', input);
      expect(mockApi.account.createCustomPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_get_custom_policy', async () => {
      const mockResponse = { customPolicyId: 'CP123' };
      const input = { customPolicyId: 'CP123' };
      vi.mocked(mockApi.account.getCustomPolicy).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_custom_policy', input);
      expect(mockApi.account.getCustomPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_update_custom_policy', async () => {
      const policy = { name: 'Updated', policyType: 'RETURN' };
      const input = {
        customPolicyId: 'CP123',
        policy,
      };
      vi.mocked(mockApi.account.updateCustomPolicy).mockReturnValue(Effect.succeed(undefined));
      await executeTool(mockApi, 'ebay_update_custom_policy', input);
      expect(mockApi.account.updateCustomPolicy).toHaveBeenCalledWith(input);
    });

    it('ebay_get_kyc', async () => {
      const mockResponse = { status: 'APPROVED' };
      vi.mocked(mockApi.account.getKyc).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_kyc', {});
      expect(mockApi.account.getKyc).toHaveBeenCalledWith({});
    });

    it('ebay_get_payments_program', async () => {
      const mockResponse = { status: 'OPTED_IN' };
      const input = {
        marketplaceId: 'EBAY_US',
        paymentsProgramType: 'STANDARD',
      };
      vi.mocked(mockApi.account.getPaymentsProgram).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_payments_program', input);
      expect(mockApi.account.getPaymentsProgram).toHaveBeenCalledWith(input);
    });

    it('ebay_get_payments_program_onboarding', async () => {
      const mockResponse = { status: 'OPTED_IN' };
      const input = {
        marketplaceId: 'EBAY_US',
        paymentsProgramType: 'STANDARD',
      };
      vi.mocked(mockApi.account.getPaymentsProgramOnboarding).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_payments_program_onboarding', input);
      expect(mockApi.account.getPaymentsProgramOnboarding).toHaveBeenCalledWith(input);
    });

    it('ebay_get_rate_tables', async () => {
      const mockResponse = { rateTables: [] };
      vi.mocked(mockApi.account.getRateTables).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_rate_tables', {});
      expect(mockApi.account.getRateTables).toHaveBeenCalledWith({});
    });

    it('ebay_create_or_replace_sales_tax', async () => {
      const salesTaxBase = { salesTaxPercentage: '8.5' };
      const input = {
        countryCode: 'US',
        jurisdictionId: 'CA',
        salesTaxBase,
      };
      vi.mocked(mockApi.account.createOrReplaceSalesTax).mockReturnValue(Effect.succeed(undefined));
      await executeTool(mockApi, 'ebay_create_or_replace_sales_tax', input);
      expect(mockApi.account.createOrReplaceSalesTax).toHaveBeenCalledWith(input);
    });

    it('ebay_bulk_create_or_replace_sales_tax', async () => {
      const requests = [
        { countryCode: 'US', jurisdictionId: 'CA', salesTaxBase: { salesTaxPercentage: '8.25' } },
      ];
      const input = { requests };
      vi.mocked(mockApi.account.bulkCreateOrReplaceSalesTax).mockReturnValue(
        Effect.succeed(undefined),
      );
      await executeTool(mockApi, 'ebay_bulk_create_or_replace_sales_tax', input);
      expect(mockApi.account.bulkCreateOrReplaceSalesTax).toHaveBeenCalledWith(input);
    });

    it('ebay_delete_sales_tax', async () => {
      const input = {
        countryCode: 'US',
        jurisdictionId: 'CA',
      };
      vi.mocked(mockApi.account.deleteSalesTax).mockReturnValue(Effect.succeed(undefined));
      await executeTool(mockApi, 'ebay_delete_sales_tax', input);
      expect(mockApi.account.deleteSalesTax).toHaveBeenCalledWith(input);
    });

    it('ebay_get_sales_tax', async () => {
      const mockResponse = { salesTaxPercentage: '8.5' };
      const input = {
        countryCode: 'US',
        jurisdictionId: 'CA',
      };
      vi.mocked(mockApi.account.getSalesTax).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_sales_tax', input);
      expect(mockApi.account.getSalesTax).toHaveBeenCalledWith(input);
    });

    it('ebay_get_sales_taxes', async () => {
      const mockResponse = { salesTaxes: [] };
      const input = { countryCode: 'US' };
      vi.mocked(mockApi.account.getSalesTaxes).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_sales_taxes', input);
      expect(mockApi.account.getSalesTaxes).toHaveBeenCalledWith(input);
    });

    it('ebay_get_subscription', async () => {
      const mockResponse = { subscriptionLevel: 'BASIC' };
      const input = { limit: '10', continuationToken: 'next-page' };
      vi.mocked(mockApi.account.getSubscription).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_subscription', input);
      expect(mockApi.account.getSubscription).toHaveBeenCalledWith(input);
    });

    it('ebay_opt_in_to_program', async () => {
      const request = { programType: 'TOP_RATED' };
      const input = { request };
      vi.mocked(mockApi.account.optInToProgram).mockReturnValue(Effect.succeed(undefined));
      await executeTool(mockApi, 'ebay_opt_in_to_program', input);
      expect(mockApi.account.optInToProgram).toHaveBeenCalledWith(input);
    });

    it('ebay_opt_out_of_program', async () => {
      const request = { programType: 'TOP_RATED' };
      const input = { request };
      vi.mocked(mockApi.account.optOutOfProgram).mockReturnValue(Effect.succeed(undefined));
      await executeTool(mockApi, 'ebay_opt_out_of_program', input);
      expect(mockApi.account.optOutOfProgram).toHaveBeenCalledWith(input);
    });

    it('ebay_get_opted_in_programs', async () => {
      const mockResponse = { programs: [] };
      vi.mocked(mockApi.account.getOptedInPrograms).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_opted_in_programs', {});
      expect(mockApi.account.getOptedInPrograms).toHaveBeenCalledWith({});
    });

    it('ebay_get_privileges', async () => {
      const mockResponse = { sellerRegistrationCompleted: true };
      vi.mocked(mockApi.account.getPrivileges).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_privileges', {});
      expect(mockApi.account.getPrivileges).toHaveBeenCalledWith({});
    });

    it('ebay_get_advertising_eligibility', async () => {
      const mockResponse = { sellerEligibility: [] };
      const input = { marketplaceId: 'EBAY_US', programTypes: 'PLA' };
      vi.mocked(mockApi.account.getAdvertisingEligibility).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_advertising_eligibility', input);
      expect(mockApi.account.getAdvertisingEligibility).toHaveBeenCalledWith(input);
    });
  });

  // ===== INVENTORY TOOLS =====
  describe('Inventory Management Tools', () => {
    it('ebay_get_inventory_items', async () => {
      const mockResponse = { inventoryItems: [] };
      const input = { limit: 10, offset: 0 };
      vi.mocked(mockApi.inventory.getInventoryItems).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_inventory_items', input);
      expect(mockApi.inventory.getInventoryItems).toHaveBeenCalledWith(input);
    });

    it('ebay_get_inventory_item', async () => {
      const mockResponse = { sku: 'SKU123' };
      const input = { sku: 'SKU123' };
      vi.mocked(mockApi.inventory.getInventoryItem).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_inventory_item', input);
      expect(mockApi.inventory.getInventoryItem).toHaveBeenCalledWith(input);
    });

    it('ebay_create_or_replace_inventory_item', async () => {
      vi.mocked(mockApi.inventory.createOrReplaceInventoryItem).mockReturnValue(
        Effect.succeed(undefined),
      );
      const body = { product: { title: 'Test' }, condition: 'NEW' };
      const input = {
        sku: 'SKU123',
        body,
      };
      await executeTool(mockApi, 'ebay_create_or_replace_inventory_item', input);
      expect(mockApi.inventory.createOrReplaceInventoryItem).toHaveBeenCalledWith(input);
    });

    it('ebay_delete_inventory_item', async () => {
      const input = { sku: 'SKU123' };
      vi.mocked(mockApi.inventory.deleteInventoryItem).mockReturnValue(Effect.succeed(undefined));
      await executeTool(mockApi, 'ebay_delete_inventory_item', input);
      expect(mockApi.inventory.deleteInventoryItem).toHaveBeenCalledWith(input);
    });

    it('ebay_bulk_create_or_replace_inventory_item', async () => {
      const mockResponse = { responses: [] };
      const input = { body: { requests: [] } };
      vi.mocked(mockApi.inventory.bulkCreateOrReplaceInventoryItem).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_bulk_create_or_replace_inventory_item', input);
      expect(mockApi.inventory.bulkCreateOrReplaceInventoryItem).toHaveBeenCalledWith(input);
    });

    it('ebay_bulk_get_inventory_item', async () => {
      const mockResponse = { responses: [] };
      const input = { body: { requests: [] } };
      vi.mocked(mockApi.inventory.bulkGetInventoryItem).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_bulk_get_inventory_item', input);
      expect(mockApi.inventory.bulkGetInventoryItem).toHaveBeenCalledWith(input);
    });

    it('ebay_bulk_update_price_quantity', async () => {
      const mockResponse = { responses: [] };
      const input = { body: { requests: [] } };
      vi.mocked(mockApi.inventory.bulkUpdatePriceQuantity).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_bulk_update_price_quantity', input);
      expect(mockApi.inventory.bulkUpdatePriceQuantity).toHaveBeenCalledWith(input);
    });

    it('ebay_get_product_compatibility', async () => {
      const mockResponse = { compatibleProducts: [] };
      const input = { sku: 'SKU123' };
      vi.mocked(mockApi.inventory.getProductCompatibility).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_product_compatibility', input);
      expect(mockApi.inventory.getProductCompatibility).toHaveBeenCalledWith(input);
    });

    it('ebay_create_or_replace_product_compatibility', async () => {
      vi.mocked(mockApi.inventory.createOrReplaceProductCompatibility).mockReturnValue(
        Effect.succeed(undefined),
      );
      const input = {
        sku: 'SKU123',
        body: { compatibleProducts: [] },
      };
      await executeTool(mockApi, 'ebay_create_or_replace_product_compatibility', input);
      expect(mockApi.inventory.createOrReplaceProductCompatibility).toHaveBeenCalledWith(input);
    });

    it('ebay_delete_product_compatibility', async () => {
      const input = { sku: 'SKU123' };
      vi.mocked(mockApi.inventory.deleteProductCompatibility).mockReturnValue(
        Effect.succeed(undefined),
      );
      await executeTool(mockApi, 'ebay_delete_product_compatibility', input);
      expect(mockApi.inventory.deleteProductCompatibility).toHaveBeenCalledWith(input);
    });

    it('ebay_get_inventory_item_group', async () => {
      const mockResponse = { inventoryItemGroupKey: 'GROUP123' };
      const input = {
        inventoryItemGroupKey: 'GROUP123',
      };
      vi.mocked(mockApi.inventory.getInventoryItemGroup).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_inventory_item_group', input);
      expect(mockApi.inventory.getInventoryItemGroup).toHaveBeenCalledWith(input);
    });

    it('ebay_create_or_replace_inventory_item_group', async () => {
      vi.mocked(mockApi.inventory.createOrReplaceInventoryItemGroup).mockReturnValue(
        Effect.succeed(undefined),
      );
      const input = {
        inventoryItemGroupKey: 'GROUP123',
        body: {
          inventoryItemGroupKey: 'GROUP123',
          title: 'Test Group',
          aspects: {},
        },
      };
      await executeTool(mockApi, 'ebay_create_or_replace_inventory_item_group', input);
      expect(mockApi.inventory.createOrReplaceInventoryItemGroup).toHaveBeenCalledWith(input);
    });

    it('ebay_delete_inventory_item_group', async () => {
      const input = {
        inventoryItemGroupKey: 'GROUP123',
      };
      vi.mocked(mockApi.inventory.deleteInventoryItemGroup).mockReturnValue(
        Effect.succeed(undefined),
      );
      await executeTool(mockApi, 'ebay_delete_inventory_item_group', input);
      expect(mockApi.inventory.deleteInventoryItemGroup).toHaveBeenCalledWith(input);
    });

    it('ebay_get_inventory_locations', async () => {
      const mockResponse = { locations: [] };
      const input = { limit: 10, offset: 0 };
      vi.mocked(mockApi.inventory.getInventoryLocations).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_inventory_locations', input);
      expect(mockApi.inventory.getInventoryLocations).toHaveBeenCalledWith(input);
    });

    it('ebay_get_inventory_location', async () => {
      const mockResponse = { merchantLocationKey: 'LOC123' };
      const input = {
        merchantLocationKey: 'LOC123',
      };
      vi.mocked(mockApi.inventory.getInventoryLocation).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_inventory_location', input);
      expect(mockApi.inventory.getInventoryLocation).toHaveBeenCalledWith(input);
    });

    it('ebay_create_inventory_location', async () => {
      vi.mocked(mockApi.inventory.createInventoryLocation).mockReturnValue(
        Effect.succeed(undefined),
      );
      const input = {
        merchantLocationKey: 'LOC123',
        body: { name: 'Warehouse', locationTypes: ['WAREHOUSE'] },
      };
      await executeTool(mockApi, 'ebay_create_inventory_location', input);
      expect(mockApi.inventory.createInventoryLocation).toHaveBeenCalledWith(input);
    });

    it('ebay_delete_inventory_location', async () => {
      const input = {
        merchantLocationKey: 'LOC123',
      };
      vi.mocked(mockApi.inventory.deleteInventoryLocation).mockReturnValue(
        Effect.succeed(undefined),
      );
      await executeTool(mockApi, 'ebay_delete_inventory_location', input);
      expect(mockApi.inventory.deleteInventoryLocation).toHaveBeenCalledWith(input);
    });

    it('ebay_disable_inventory_location', async () => {
      const input = {
        merchantLocationKey: 'LOC123',
      };
      vi.mocked(mockApi.inventory.disableInventoryLocation).mockReturnValue(
        Effect.succeed(undefined),
      );
      await executeTool(mockApi, 'ebay_disable_inventory_location', input);
      expect(mockApi.inventory.disableInventoryLocation).toHaveBeenCalledWith(input);
    });

    it('ebay_enable_inventory_location', async () => {
      const input = {
        merchantLocationKey: 'LOC123',
      };
      vi.mocked(mockApi.inventory.enableInventoryLocation).mockReturnValue(
        Effect.succeed(undefined),
      );
      await executeTool(mockApi, 'ebay_enable_inventory_location', input);
      expect(mockApi.inventory.enableInventoryLocation).toHaveBeenCalledWith(input);
    });

    it('ebay_update_inventory_location', async () => {
      vi.mocked(mockApi.inventory.updateInventoryLocation).mockReturnValue(
        Effect.succeed(undefined),
      );
      const input = {
        merchantLocationKey: 'LOC123',
        body: { name: 'Updated' },
      };
      await executeTool(mockApi, 'ebay_update_inventory_location', input);
      expect(mockApi.inventory.updateInventoryLocation).toHaveBeenCalledWith(input);
    });

    it('ebay_get_offers', async () => {
      const mockResponse = { offers: [] };
      const input = { sku: 'SKU123' };
      vi.mocked(mockApi.inventory.getOffers).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_offers', input);
      expect(mockApi.inventory.getOffers).toHaveBeenCalledWith(input);
    });

    it('ebay_get_offer', async () => {
      const mockResponse = { offerId: 'OFFER123' };
      const input = { offerId: 'OFFER123' };
      vi.mocked(mockApi.inventory.getOffer).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_offer', input);
      expect(mockApi.inventory.getOffer).toHaveBeenCalledWith(input);
    });

    it('ebay_create_offer', async () => {
      const mockResponse = { offerId: 'OFFER123' };
      const input = {
        body: { sku: 'SKU123', marketplaceId: 'EBAY_US', format: 'FIXED_PRICE' },
      };
      vi.mocked(mockApi.inventory.createOffer).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_create_offer', input);
      expect(mockApi.inventory.createOffer).toHaveBeenCalledWith(input);
    });

    it('ebay_update_offer', async () => {
      const mockResponse = { offerId: 'OFFER123' };
      const input = {
        offerId: 'OFFER123',
        body: { sku: 'SKU123', marketplaceId: 'EBAY_US', format: 'FIXED_PRICE' },
      };
      vi.mocked(mockApi.inventory.updateOffer).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_update_offer', input);
      expect(mockApi.inventory.updateOffer).toHaveBeenCalledWith(input);
    });

    it('ebay_delete_offer', async () => {
      const input = { offerId: 'OFFER123' };
      vi.mocked(mockApi.inventory.deleteOffer).mockReturnValue(Effect.succeed(undefined));
      await executeTool(mockApi, 'ebay_delete_offer', input);
      expect(mockApi.inventory.deleteOffer).toHaveBeenCalledWith(input);
    });

    it('ebay_publish_offer', async () => {
      const mockResponse = { listingId: 'LISTING123' };
      const input = { offerId: 'OFFER123' };
      vi.mocked(mockApi.inventory.publishOffer).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_publish_offer', input);
      expect(mockApi.inventory.publishOffer).toHaveBeenCalledWith(input);
    });

    it('ebay_withdraw_offer', async () => {
      const mockResponse = { offerId: 'OFFER123' };
      const input = { offerId: 'OFFER123' };
      vi.mocked(mockApi.inventory.withdrawOffer).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_withdraw_offer', input);
      expect(mockApi.inventory.withdrawOffer).toHaveBeenCalledWith(input);
    });

    it('ebay_bulk_create_offer', async () => {
      const mockResponse = { responses: [] };
      const input = { body: { requests: [] } };
      vi.mocked(mockApi.inventory.bulkCreateOffer).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_bulk_create_offer', input);
      expect(mockApi.inventory.bulkCreateOffer).toHaveBeenCalledWith(input);
    });

    it('ebay_bulk_publish_offer', async () => {
      const mockResponse = { responses: [] };
      const input = { body: { requests: [] } };
      vi.mocked(mockApi.inventory.bulkPublishOffer).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_bulk_publish_offer', input);
      expect(mockApi.inventory.bulkPublishOffer).toHaveBeenCalledWith(input);
    });

    it('ebay_get_listing_fees', async () => {
      const mockResponse = { feeSummaries: [] };
      const input = { body: { offers: [] } };
      vi.mocked(mockApi.inventory.getListingFees).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_listing_fees', input);
      expect(mockApi.inventory.getListingFees).toHaveBeenCalledWith(input);
    });

    it('ebay_bulk_migrate_listing', async () => {
      const mockResponse = { responses: [] };
      const input = { body: { requests: [] } };
      vi.mocked(mockApi.inventory.bulkMigrateListing).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_bulk_migrate_listing', input);
      expect(mockApi.inventory.bulkMigrateListing).toHaveBeenCalledWith(input);
    });

    it('ebay_get_sku_location_mapping', async () => {
      const mockResponse = { locations: [] };
      const input = { listingId: 'LISTING123', sku: 'SKU123' };
      vi.mocked(mockApi.inventory.getSkuLocationMapping).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_sku_location_mapping', input);
      expect(mockApi.inventory.getSkuLocationMapping).toHaveBeenCalledWith(input);
    });

    it('ebay_create_or_replace_sku_location_mapping', async () => {
      const input = {
        listingId: 'LISTING123',
        sku: 'SKU123',
        body: { locations: [{ merchantLocationKey: 'LOC123' }] },
      };
      vi.mocked(mockApi.inventory.createOrReplaceSkuLocationMapping).mockReturnValue(
        Effect.succeed(undefined),
      );
      await executeTool(mockApi, 'ebay_create_or_replace_sku_location_mapping', input);
      expect(mockApi.inventory.createOrReplaceSkuLocationMapping).toHaveBeenCalledWith(input);
    });

    it('ebay_delete_sku_location_mapping', async () => {
      const input = { listingId: 'LISTING123', sku: 'SKU123' };
      vi.mocked(mockApi.inventory.deleteSkuLocationMapping).mockReturnValue(
        Effect.succeed(undefined),
      );
      await executeTool(mockApi, 'ebay_delete_sku_location_mapping', input);
      expect(mockApi.inventory.deleteSkuLocationMapping).toHaveBeenCalledWith(input);
    });

    it('ebay_publish_offer_by_inventory_item_group', async () => {
      const mockResponse = { listingId: 'LISTING123' };
      const input = {
        body: { inventoryItemGroupKey: 'GROUP123', marketplaceId: 'EBAY_US' },
      };
      vi.mocked(mockApi.inventory.publishOfferByInventoryItemGroup).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_publish_offer_by_inventory_item_group', input);
      expect(mockApi.inventory.publishOfferByInventoryItemGroup).toHaveBeenCalledWith(input);
    });

    it('ebay_withdraw_offer_by_inventory_item_group', async () => {
      const input = {
        body: { inventoryItemGroupKey: 'GROUP123', marketplaceId: 'EBAY_US' },
      };
      vi.mocked(mockApi.inventory.withdrawOfferByInventoryItemGroup).mockReturnValue(
        Effect.succeed(undefined),
      );
      await executeTool(mockApi, 'ebay_withdraw_offer_by_inventory_item_group', input);
      expect(mockApi.inventory.withdrawOfferByInventoryItemGroup).toHaveBeenCalledWith(input);
    });
  });

  // ===== FULFILLMENT TOOLS =====
  describe('Fulfillment Tools', () => {
    it('ebay_get_orders', async () => {
      const mockResponse = { orders: [] };
      const input = { filter: 'test', limit: 10 };
      vi.mocked(mockApi.fulfillment.getOrders).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_orders', input);
      expect(mockApi.fulfillment.getOrders).toHaveBeenCalledWith(input);
    });

    it('ebay_get_order', async () => {
      const mockResponse = { orderId: 'ORDER123' };
      const input = { orderId: 'ORDER123' };
      vi.mocked(mockApi.fulfillment.getOrder).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_order', input);
      expect(mockApi.fulfillment.getOrder).toHaveBeenCalledWith(input);
    });

    it('ebay_create_shipping_fulfillment', async () => {
      const mockResponse = {};
      const body = { lineItems: [], trackingNumber: '123' };
      const input = {
        orderId: 'ORDER123',
        body,
      };
      vi.mocked(mockApi.fulfillment.createShippingFulfillment).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_create_shipping_fulfillment', input);
      expect(mockApi.fulfillment.createShippingFulfillment).toHaveBeenCalledWith(input);
    });

    it('ebay_issue_refund', async () => {
      const mockResponse = { refundId: 'REFUND123' };
      const body = {
        reasonForRefund: 'BUYER_CANCEL',
        orderLevelRefundAmount: { value: '10', currency: 'USD' },
      };
      const input = {
        orderId: 'ORDER123',
        body,
      };
      vi.mocked(mockApi.fulfillment.issueRefund).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_issue_refund', input);
      expect(mockApi.fulfillment.issueRefund).toHaveBeenCalledWith(input);
    });

    it('ebay_get_payment_dispute_summaries', async () => {
      const mockResponse = { paymentDisputeSummaries: [] };
      const input = { orderId: 'ORDER123', limit: 10 };
      vi.mocked(mockApi.dispute.getPaymentDisputeSummaries).mockReturnValue(
        Effect.succeed(mockResponse),
      );

      await executeTool(mockApi, 'ebay_get_payment_dispute_summaries', input);

      expect(mockApi.dispute.getPaymentDisputeSummaries).toHaveBeenCalledWith(input);
    });
  });

  // Continue with remaining tools...
  // Due to length constraints, I'll add a few more critical tool categories

  describe('Marketing Tools', () => {
    it('ebay_get_campaigns', async () => {
      const mockResponse = { campaigns: [] };
      vi.mocked(mockApi.marketing.getCampaigns).mockReturnValue(Effect.succeed(mockResponse));
      const input = { campaignStatus: 'RUNNING' };
      await executeTool(mockApi, 'ebay_get_campaigns', input);
      expect(mockApi.marketing.getCampaigns).toHaveBeenCalledWith(input);
    });

    it('ebay_get_campaign', async () => {
      const mockResponse = { campaignId: 'CAMP123' };
      vi.mocked(mockApi.marketing.getCampaign).mockReturnValue(Effect.succeed(mockResponse));
      const input = { campaignId: 'CAMP123' };
      await executeTool(mockApi, 'ebay_get_campaign', input);
      expect(mockApi.marketing.getCampaign).toHaveBeenCalledWith(input);
    });

    it('ebay_pause_campaign', async () => {
      vi.mocked(mockApi.marketing.pauseCampaign).mockReturnValue(Effect.succeed(undefined));
      const input = { campaignId: 'CAMP123' };
      await executeTool(mockApi, 'ebay_pause_campaign', input);
      expect(mockApi.marketing.pauseCampaign).toHaveBeenCalledWith(input);
    });

    it('ebay_resume_campaign', async () => {
      vi.mocked(mockApi.marketing.resumeCampaign).mockReturnValue(Effect.succeed(undefined));
      const input = { campaignId: 'CAMP123' };
      await executeTool(mockApi, 'ebay_resume_campaign', input);
      expect(mockApi.marketing.resumeCampaign).toHaveBeenCalledWith(input);
    });

    it('ebay_end_campaign', async () => {
      vi.mocked(mockApi.marketing.endCampaign).mockReturnValue(Effect.succeed(undefined));
      const input = { campaignId: 'CAMP123' };
      await executeTool(mockApi, 'ebay_end_campaign', input);
      expect(mockApi.marketing.endCampaign).toHaveBeenCalledWith(input);
    });

    it('ebay_update_campaign_identification', async () => {
      vi.mocked(mockApi.marketing.updateCampaignIdentification).mockReturnValue(
        Effect.succeed(undefined),
      );
      const request = { campaignName: 'Updated' };
      const input = {
        campaignId: 'CAMP123',
        request,
      };
      await executeTool(mockApi, 'ebay_update_campaign_identification', input);
      expect(mockApi.marketing.updateCampaignIdentification).toHaveBeenCalledWith(input);
    });

    it('ebay_clone_campaign', async () => {
      const mockResponse = { campaignId: 'CAMP124' };
      const request = { campaignName: 'Cloned' };
      vi.mocked(mockApi.marketing.cloneCampaign).mockReturnValue(Effect.succeed(mockResponse));
      const input = {
        campaignId: 'CAMP123',
        request,
      };
      await executeTool(mockApi, 'ebay_clone_campaign', input);
      expect(mockApi.marketing.cloneCampaign).toHaveBeenCalledWith(input);
    });

    it('ebay_get_promotions', async () => {
      const mockResponse = { promotions: [] };
      vi.mocked(mockApi.marketing.getPromotions).mockReturnValue(Effect.succeed(mockResponse));
      const input = {
        marketplaceId: 'EBAY_US',
        limit: 10,
        offset: 5,
        promotionStatus: 'RUNNING',
        promotionType: 'ORDER_DISCOUNT',
      };
      await executeTool(mockApi, 'ebay_get_promotions', input);
      expect(mockApi.marketing.getPromotions).toHaveBeenCalledWith(input);
    });
  });

  describe('Communication Tools', () => {
    it('ebay_send_offer_to_interested_buyers', async () => {
      const mockResponse = { offers: [] };
      vi.mocked(mockApi.negotiation.sendOfferToInterestedBuyers).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      const offerRequest = { message: 'Test', marketplaceId: 'EBAY_US' };
      await executeTool(mockApi, 'ebay_send_offer_to_interested_buyers', offerRequest);
      expect(mockApi.negotiation.sendOfferToInterestedBuyers).toHaveBeenCalledWith(offerRequest);
    });

    it('ebay_get_conversations', async () => {
      const mockResponse = { conversations: [] };
      vi.mocked(mockApi.message.getConversations).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_conversations', {
        conversationType: 'FROM_MEMBERS',
        limit: 25,
        offset: 0,
      });
      expect(mockApi.message.getConversations).toHaveBeenCalledWith({
        conversationType: 'FROM_MEMBERS',
        limit: 25,
        offset: 0,
      });
    });

    it('ebay_get_conversation', async () => {
      const mockResponse = { messageId: 'MSG123' };
      vi.mocked(mockApi.message.getConversation).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_conversation', {
        conversationId: 'CONV123',
        conversationType: 'FROM_MEMBERS',
      });
      expect(mockApi.message.getConversation).toHaveBeenCalledWith({
        conversationId: 'CONV123',
        conversationType: 'FROM_MEMBERS',
      });
    });

    it('ebay_send_message', async () => {
      const mockResponse = { messageId: 'MSG123' };
      vi.mocked(mockApi.message.sendMessage).mockReturnValue(Effect.succeed(mockResponse));
      const messageData = {
        messageText: 'Hello',
        otherPartyUsername: 'buyer123',
      };
      await executeTool(mockApi, 'ebay_send_message', messageData);
      expect(mockApi.message.sendMessage).toHaveBeenCalledWith(messageData);
    });
  });

  describe('Recommendation Tools', () => {
    it('ebay_find_listing_recommendations', async () => {
      const mockResponse = { listingRecommendations: [] };
      vi.mocked(mockApi.recommendation.findListingRecommendations).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      const input = {
        requestBody: { listingIds: ['LISTING123'] },
        marketplaceId: 'EBAY_US',
      };
      await executeTool(mockApi, 'ebay_find_listing_recommendations', input);
      expect(mockApi.recommendation.findListingRecommendations).toHaveBeenCalledWith(input);
    });
  });

  describe('Analytics Tools', () => {
    it('ebay_get_traffic_report', async () => {
      const mockResponse = { records: [] };
      vi.mocked(mockApi.analytics.getTrafficReport).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_traffic_report', {
        dimension: 'LISTING',
        filter: 'test',
        metric: 'CLICK_THROUGH_RATE',
      });
      expect(mockApi.analytics.getTrafficReport).toHaveBeenCalledWith({
        dimension: 'LISTING',
        filter: 'test',
        metric: 'CLICK_THROUGH_RATE',
      });
    });

    it('ebay_find_seller_standards_profiles', async () => {
      const mockResponse = { standards: [] };
      vi.mocked(mockApi.analytics.findSellerStandardsProfiles).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_find_seller_standards_profiles', {});
      expect(mockApi.analytics.findSellerStandardsProfiles).toHaveBeenCalledWith({});
    });

    it('ebay_get_seller_standards_profile', async () => {
      const mockResponse = { status: 'GOOD' };
      vi.mocked(mockApi.analytics.getSellerStandardsProfile).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_seller_standards_profile', {
        program: 'CUSTOMER_SERVICE',
        cycle: 'CURRENT',
      });
      expect(mockApi.analytics.getSellerStandardsProfile).toHaveBeenCalledWith({
        program: 'CUSTOMER_SERVICE',
        cycle: 'CURRENT',
      });
    });

    it('ebay_get_customer_service_metric', async () => {
      const mockResponse = { metrics: [] };
      vi.mocked(mockApi.analytics.getCustomerServiceMetric).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_customer_service_metric', {
        customerServiceMetricType: 'INQUIRY_RESPONSE',
        evaluationType: 'CURRENT',
        evaluationMarketplaceId: 'EBAY_US',
      });
      expect(mockApi.analytics.getCustomerServiceMetric).toHaveBeenCalledWith({
        customerServiceMetricType: 'INQUIRY_RESPONSE',
        evaluationType: 'CURRENT',
        evaluationMarketplaceId: 'EBAY_US',
      });
    });
  });

  describe('Metadata Tools', () => {
    it('ebay_get_automotive_parts_compatibility_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getAutomotivePartsCompatibilityPolicies).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_automotive_parts_compatibility_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getAutomotivePartsCompatibilityPolicies).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_category_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getCategoryPolicies).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_category_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getCategoryPolicies).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_extended_producer_responsibility_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getExtendedProducerResponsibilityPolicies).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_extended_producer_responsibility_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getExtendedProducerResponsibilityPolicies).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_hazardous_materials_labels', async () => {
      const mockResponse = { labels: [] };
      vi.mocked(mockApi.metadata.getHazardousMaterialsLabels).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_hazardous_materials_labels', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getHazardousMaterialsLabels).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_item_condition_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getItemConditionPolicies).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_item_condition_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getItemConditionPolicies).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_listing_structure_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getListingStructurePolicies).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_listing_structure_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getListingStructurePolicies).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_negotiated_price_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getNegotiatedPricePolicies).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_negotiated_price_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getNegotiatedPricePolicies).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_product_safety_labels', async () => {
      const mockResponse = { labels: [] };
      vi.mocked(mockApi.metadata.getProductSafetyLabels).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_product_safety_labels', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getProductSafetyLabels).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_regulatory_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getRegulatoryPolicies).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_regulatory_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getRegulatoryPolicies).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_classified_ad_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getClassifiedAdPolicies).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_classified_ad_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getClassifiedAdPolicies).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_currencies', async () => {
      const mockResponse = { currencies: [] };
      vi.mocked(mockApi.metadata.getCurrencies).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_currencies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getCurrencies).toHaveBeenCalledWith({ marketplaceId: 'EBAY_US' });
    });

    it('ebay_get_listing_type_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getListingTypePolicies).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_listing_type_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getListingTypePolicies).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_motors_listing_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getMotorsListingPolicies).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_motors_listing_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getMotorsListingPolicies).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_shipping_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getShippingPolicies).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_shipping_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getShippingPolicies).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_site_visibility_policies', async () => {
      const mockResponse = { policies: [] };
      vi.mocked(mockApi.metadata.getSiteVisibilityPolicies).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_site_visibility_policies', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.metadata.getSiteVisibilityPolicies).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_compatibilities_by_specification', async () => {
      const mockResponse = { compatibilities: [] };
      const specification = { categoryId: '123' };
      vi.mocked(mockApi.metadata.getCompatibilitiesBySpecification).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_compatibilities_by_specification', {
        marketplaceId: 'EBAY_US',
        specification,
      });
      expect(mockApi.metadata.getCompatibilitiesBySpecification).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
        specification,
      });
    });

    it('ebay_get_compatibility_property_names', async () => {
      const mockResponse = { names: [] };
      const data = { categoryId: '6016' };
      vi.mocked(mockApi.metadata.getCompatibilityPropertyNames).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_compatibility_property_names', {
        marketplaceId: 'EBAY_US',
        data,
      });
      expect(mockApi.metadata.getCompatibilityPropertyNames).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
        data,
      });
    });

    it('ebay_get_compatibility_property_values', async () => {
      const mockResponse = { values: [] };
      const data = { categoryId: '6016', propertyName: 'Make' };
      vi.mocked(mockApi.metadata.getCompatibilityPropertyValues).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_compatibility_property_values', {
        marketplaceId: 'EBAY_US',
        data,
      });
      expect(mockApi.metadata.getCompatibilityPropertyValues).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
        data,
      });
    });

    it('ebay_get_multi_compatibility_property_values', async () => {
      const mockResponse = { values: [] };
      const data = { categoryId: '6016', propertyNames: ['Make', 'Model'] };
      vi.mocked(mockApi.metadata.getMultiCompatibilityPropertyValues).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_multi_compatibility_property_values', {
        marketplaceId: 'EBAY_US',
        data,
      });
      expect(mockApi.metadata.getMultiCompatibilityPropertyValues).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
        data,
      });
    });

    it('ebay_get_product_compatibilities', async () => {
      const mockResponse = { compatibilities: [] };
      const data = { productIdentifier: { epid: '12345' } };
      vi.mocked(mockApi.metadata.getProductCompatibilities).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_product_compatibilities', {
        marketplaceId: 'EBAY_US',
        data,
      });
      expect(mockApi.metadata.getProductCompatibilities).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
        data,
      });
    });

    it('ebay_get_sales_tax_jurisdictions', async () => {
      const mockResponse = { jurisdictions: [] };
      vi.mocked(mockApi.metadata.getSalesTaxJurisdictions).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_sales_tax_jurisdictions', {
        countryCode: 'US',
      });
      expect(mockApi.metadata.getSalesTaxJurisdictions).toHaveBeenCalledWith({
        countryCode: 'US',
      });
    });
  });

  describe('Taxonomy Tools', () => {
    it('ebay_get_default_category_tree_id', async () => {
      const mockResponse = { categoryTreeId: '0' };
      vi.mocked(mockApi.taxonomy.getDefaultCategoryTreeId).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_default_category_tree_id', {
        marketplaceId: 'EBAY_US',
      });
      expect(mockApi.taxonomy.getDefaultCategoryTreeId).toHaveBeenCalledWith({
        marketplaceId: 'EBAY_US',
      });
    });

    it('ebay_get_category_tree', async () => {
      const mockResponse = { rootCategoryNode: {} };
      vi.mocked(mockApi.taxonomy.getCategoryTree).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_category_tree', {
        categoryTreeId: '0',
      });
      expect(mockApi.taxonomy.getCategoryTree).toHaveBeenCalledWith({ categoryTreeId: '0' });
    });

    it('ebay_get_category_suggestions', async () => {
      const mockResponse = { categorySuggestions: [] };
      vi.mocked(mockApi.taxonomy.getCategorySuggestions).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_category_suggestions', {
        categoryTreeId: '0',
        query: 'iPhone',
      });
      expect(mockApi.taxonomy.getCategorySuggestions).toHaveBeenCalledWith({
        categoryTreeId: '0',
        query: 'iPhone',
      });
    });

    it('ebay_get_item_aspects_for_category', async () => {
      const mockResponse = { aspects: [] };
      vi.mocked(mockApi.taxonomy.getItemAspectsForCategory).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_item_aspects_for_category', {
        categoryTreeId: '0',
        categoryId: '123',
      });
      expect(mockApi.taxonomy.getItemAspectsForCategory).toHaveBeenCalledWith({
        categoryTreeId: '0',
        categoryId: '123',
      });
    });
  });

  describe('Other API Tools', () => {
    it('ebay_get_user', async () => {
      const mockResponse = { userId: 'USER123' };
      vi.mocked(mockApi.identity.getUser).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_user', {});
      expect(mockApi.identity.getUser).toHaveBeenCalledWith({});
    });

    it('ebay_get_listing_violations', async () => {
      const mockResponse = { listingViolations: [] };
      vi.mocked(mockApi.compliance.getListingViolations).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_listing_violations', {
        complianceType: 'PRODUCT_ADOPTION',
      });
      expect(mockApi.compliance.getListingViolations).toHaveBeenCalledWith({
        complianceType: 'PRODUCT_ADOPTION',
      });
    });

    it('ebay_get_listing_violations_summary', async () => {
      const mockResponse = { violationSummaries: [] };
      vi.mocked(mockApi.compliance.getListingViolationsSummary).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_listing_violations_summary', {
        complianceType: 'PRODUCT_ADOPTION',
      });
      expect(mockApi.compliance.getListingViolationsSummary).toHaveBeenCalledWith({
        complianceType: 'PRODUCT_ADOPTION',
      });
    });

    it('ebay_create_vero_report', async () => {
      const mockResponse = { veroReportId: 'REPORT123' };
      const reportData = { reportItems: [{ itemId: 'ITEM123', veroReasonCodeId: 'TRADEMARK' }] };
      vi.mocked(mockApi.vero.createVeroReport).mockReturnValue(Effect.succeed(mockResponse));
      const input = { reportData };
      await executeTool(mockApi, 'ebay_create_vero_report', input);
      expect(mockApi.vero.createVeroReport).toHaveBeenCalledWith(input);
    });

    it('ebay_get_vero_report', async () => {
      const mockResponse = { veroReportId: 'REPORT123', status: 'OPEN' };
      vi.mocked(mockApi.vero.getVeroReport).mockReturnValue(Effect.succeed(mockResponse));
      const input = { veroReportId: 'REPORT123' };
      await executeTool(mockApi, 'ebay_get_vero_report', input);
      expect(mockApi.vero.getVeroReport).toHaveBeenCalledWith(input);
    });

    it('ebay_get_vero_report_items', async () => {
      const mockResponse = { items: [] };
      vi.mocked(mockApi.vero.getVeroReportItems).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_vero_report_items', { filter: 'test' });
      expect(mockApi.vero.getVeroReportItems).toHaveBeenCalledWith({ filter: 'test' });
    });

    it('ebay_get_vero_reason_code', async () => {
      const mockResponse = { veroReasonCodeId: 'CODE123', name: 'Trademark' };
      vi.mocked(mockApi.vero.getVeroReasonCode).mockReturnValue(Effect.succeed(mockResponse));
      const input = { veroReasonCodeId: 'CODE123' };
      await executeTool(mockApi, 'ebay_get_vero_reason_code', input);
      expect(mockApi.vero.getVeroReasonCode).toHaveBeenCalledWith(input);
    });

    it('ebay_get_vero_reason_codes', async () => {
      const mockResponse = { veroReasonCodes: [] };
      vi.mocked(mockApi.vero.getVeroReasonCodes).mockReturnValue(Effect.succeed(mockResponse));
      const input = {};
      await executeTool(mockApi, 'ebay_get_vero_reason_codes', input);
      expect(mockApi.vero.getVeroReasonCodes).toHaveBeenCalledWith(input);
    });

    it('ebay_translate', async () => {
      const mockResponse = { translations: [] };
      vi.mocked(mockApi.translation.translate).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_translate', {
        from: 'en',
        to: 'es',
        translationContext: 'ITEM_TITLE',
        text: ['Hello'],
      });
      expect(mockApi.translation.translate).toHaveBeenCalledWith({
        from: 'en',
        to: 'es',
        translationContext: 'ITEM_TITLE',
        text: ['Hello'],
      });
    });

    it('ebay_get_services', async () => {
      const mockResponse = { serviceList: { services: [] } };
      vi.mocked(mockApi.edelivery.getServices).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_services', { limit: 10 });
      expect(mockApi.edelivery.getServices).toHaveBeenCalledWith({ limit: 10 });
    });

    it('ebay_create_package', async () => {
      const mockResponse = { createPackageResult: { packageId: 'PKG123' } };
      const args = { body: { packageInfo: { packageWeight: 1000 } } };
      vi.mocked(mockApi.edelivery.createPackage).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_create_package', args);
      expect(mockApi.edelivery.createPackage).toHaveBeenCalledWith(args);
    });
  });

  describe('Notification Tools', () => {
    it('ebay_get_notification_config', async () => {
      const mockResponse = { config: {} };
      vi.mocked(mockApi.notification.getConfig).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_notification_config', {});
      expect(mockApi.notification.getConfig).toHaveBeenCalledWith({});
    });

    it('ebay_update_notification_config', async () => {
      vi.mocked(mockApi.notification.updateConfig).mockReturnValue(Effect.succeed(undefined));
      const args = { alertEmail: 'test@example.com' };
      await executeTool(mockApi, 'ebay_update_notification_config', args);
      expect(mockApi.notification.updateConfig).toHaveBeenCalledWith(args);
    });

    it('ebay_create_notification_destination', async () => {
      const mockResponse = { destinationId: 'DEST123' };
      const args = {
        name: 'Test Destination',
        deliveryConfig: {
          endpoint: 'https://example.com/webhook',
          verificationToken: 'abcdef1234567890abcdef1234567890',
        },
        status: 'ENABLED',
      };
      vi.mocked(mockApi.notification.createDestination).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_create_notification_destination', args);
      expect(mockApi.notification.createDestination).toHaveBeenCalledWith(args);
    });
  });

  describe('Feedback Tools', () => {
    it('ebay_get_feedback', async () => {
      const mockResponse = { feedbackId: 'FEEDBACK123' };
      vi.mocked(mockApi.feedback.getFeedback).mockReturnValue(Effect.succeed(mockResponse));
      await executeTool(mockApi, 'ebay_get_feedback', {
        userId: 'USER123',
        feedbackType: 'FEEDBACK_RECEIVED',
        transactionId: 'TRANS123',
      });
      expect(mockApi.feedback.getFeedback).toHaveBeenCalledWith({
        userId: 'USER123',
        feedbackType: 'FEEDBACK_RECEIVED',
        transactionId: 'TRANS123',
      });
    });

    it('ebay_leave_feedback_for_buyer', async () => {
      const mockResponse = { feedbackId: 'FEEDBACK123' };
      vi.mocked(mockApi.feedback.leaveFeedbackForBuyer).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      const args = {
        listingId: 'LISTING123',
        commentText: 'Great buyer!',
        commentType: 'POSITIVE',
      };
      await executeTool(mockApi, 'ebay_leave_feedback_for_buyer', args);
      expect(mockApi.feedback.leaveFeedbackForBuyer).toHaveBeenCalledWith(args);
    });

    it('ebay_get_feedback_rating_summary', async () => {
      const mockResponse = { feedbackScore: 100 };
      vi.mocked(mockApi.feedback.getFeedbackRatingSummary).mockReturnValue(
        Effect.succeed(mockResponse),
      );
      await executeTool(mockApi, 'ebay_get_feedback_rating_summary', {
        userId: 'USER123',
        filter: 'ratingType:{POSITIVE}',
      });
      expect(mockApi.feedback.getFeedbackRatingSummary).toHaveBeenCalledWith({
        userId: 'USER123',
        filter: 'ratingType:{POSITIVE}',
      });
    });
  });
});
