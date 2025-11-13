import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AccountApi } from '../../../src/api/account-management/account.js';
import type { EbayApiClient } from '../../../src/api/client.js';
import type { components } from '../../../src/types/sell_account_v1_oas3.js';

type CustomPolicyResponse = components['schemas']['CustomPolicyResponse'];
type CustomPolicy = components['schemas']['CustomPolicy'];
type FulfillmentPolicyResponse = components['schemas']['FulfillmentPolicyResponse'];
type FulfillmentPolicy = components['schemas']['FulfillmentPolicy'];
type PaymentPolicyResponse = components['schemas']['PaymentPolicyResponse'];
type PaymentPolicy = components['schemas']['PaymentPolicy'];
type ReturnPolicyResponse = components['schemas']['ReturnPolicyResponse'];
type ReturnPolicy = components['schemas']['ReturnPolicy'];
type SellingPrivileges = components['schemas']['SellingPrivileges'];
type Programs = components['schemas']['Programs'];
type KycResponse = components['schemas']['KycResponse'];
type PaymentsProgramResponse = components['schemas']['PaymentsProgramResponse'];
type RateTableResponse = components['schemas']['RateTableResponse'];
type SalesTax = components['schemas']['SalesTax'];
type SalesTaxes = components['schemas']['SalesTaxes'];
type SubscriptionResponse = components['schemas']['SubscriptionResponse'];

describe('AccountApi', () => {
  let accountApi: AccountApi;
  let mockClient: EbayApiClient;

  beforeEach(() => {
    // Create mock client with spy methods
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as EbayApiClient;

    accountApi = new AccountApi(mockClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Custom Policies', () => {
    it('should get all custom policies without filters', async () => {
      const mockResponse: CustomPolicyResponse = {
        customPolicies: [
          {
            customPolicyId: '1234567890',
            name: 'Test Custom Policy',
            description: 'Test description',
          },
        ],
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const result = await accountApi.getCustomPolicies();

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/custom_policy', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should get custom policies with policy type filter', async () => {
      const mockResponse: CustomPolicyResponse = {
        customPolicies: [],
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      await accountApi.getCustomPolicies('PRODUCT_COMPLIANCE');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/custom_policy', {
        policy_types: 'PRODUCT_COMPLIANCE',
      });
    });

    it('should get a specific custom policy by ID', async () => {
      const mockPolicy: CustomPolicy = {
        customPolicyId: '1234567890',
        name: 'Test Policy',
        description: 'Test description',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPolicy);

      const result = await accountApi.getCustomPolicy('1234567890');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/custom_policy/1234567890');
      expect(result).toEqual(mockPolicy);
    });

    it('should create a custom policy', async () => {
      const policyRequest = {
        name: 'New Custom Policy',
        description: 'New policy description',
      };

      const mockResponse: CustomPolicy = {
        customPolicyId: '9876543210',
        ...policyRequest,
      };

      vi.spyOn(mockClient, 'post').mockResolvedValue(mockResponse);

      const result = await accountApi.createCustomPolicy(policyRequest);

      expect(mockClient.post).toHaveBeenCalledWith('/sell/account/v1/custom_policy', policyRequest);
      expect(result.customPolicyId).toBe('9876543210');
    });

    it('should update a custom policy', async () => {
      const policyRequest = {
        name: 'Updated Policy',
        description: 'Updated description',
      };

      vi.spyOn(mockClient, 'put').mockResolvedValue(undefined);

      await accountApi.updateCustomPolicy('1234567890', policyRequest);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/sell/account/v1/custom_policy/1234567890',
        policyRequest
      );
    });

    it('should delete a custom policy', async () => {
      vi.spyOn(mockClient, 'delete').mockResolvedValue(undefined);

      await accountApi.deleteCustomPolicy('1234567890');

      expect(mockClient.delete).toHaveBeenCalledWith('/sell/account/v1/custom_policy/1234567890');
    });
  });

  describe('Fulfillment Policies', () => {
    it('should get all fulfillment policies', async () => {
      const mockResponse: FulfillmentPolicyResponse = {
        fulfillmentPolicies: [
          {
            fulfillmentPolicyId: '1234567890',
            name: 'Standard Shipping',
            marketplaceId: 'EBAY_US',
          },
        ],
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const result = await accountApi.getFulfillmentPolicies('EBAY_US');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/fulfillment_policy', {
        marketplace_id: 'EBAY_US',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should get fulfillment policies for specific marketplace', async () => {
      const mockResponse: FulfillmentPolicyResponse = {
        fulfillmentPolicies: [],
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      await accountApi.getFulfillmentPolicies('EBAY_US');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/fulfillment_policy', {
        marketplace_id: 'EBAY_US',
      });
    });

    it('should get a specific fulfillment policy by ID', async () => {
      const mockPolicy: FulfillmentPolicy = {
        fulfillmentPolicyId: '1234567890',
        name: 'Test Policy',
        marketplaceId: 'EBAY_US',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPolicy);

      const result = await accountApi.getFulfillmentPolicy('1234567890');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/fulfillment_policy/1234567890');
      expect(result).toEqual(mockPolicy);
    });

    it('should get fulfillment policy by name', async () => {
      const mockPolicy: FulfillmentPolicy = {
        fulfillmentPolicyId: '1234567890',
        name: 'Standard Shipping',
        marketplaceId: 'EBAY_US',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPolicy);

      const result = await accountApi.getFulfillmentPolicyByName('EBAY_US', 'Standard Shipping');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/fulfillment_policy_by_name', {
        marketplace_id: 'EBAY_US',
        name: 'Standard Shipping',
      });
      expect(result).toEqual(mockPolicy);
    });

    it('should create a fulfillment policy', async () => {
      const policyRequest = {
        name: 'New Shipping Policy',
        marketplaceId: 'EBAY_US',
      };

      const mockResponse = {
        fulfillmentPolicyId: '9876543210',
      };

      vi.spyOn(mockClient, 'post').mockResolvedValue(mockResponse);

      const result = await accountApi.createFulfillmentPolicy(policyRequest);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/account/v1/fulfillment_policy',
        policyRequest
      );
      expect(result.fulfillmentPolicyId).toBe('9876543210');
    });

    it('should update a fulfillment policy', async () => {
      const policyRequest = {
        name: 'Updated Policy',
        marketplaceId: 'EBAY_US',
      };

      const mockResponse = {
        fulfillmentPolicyId: '1234567890',
      };

      vi.spyOn(mockClient, 'put').mockResolvedValue(mockResponse);

      const result = await accountApi.updateFulfillmentPolicy('1234567890', policyRequest);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/sell/account/v1/fulfillment_policy/1234567890',
        policyRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it('should delete a fulfillment policy', async () => {
      vi.spyOn(mockClient, 'delete').mockResolvedValue(undefined);

      await accountApi.deleteFulfillmentPolicy('1234567890');

      expect(mockClient.delete).toHaveBeenCalledWith(
        '/sell/account/v1/fulfillment_policy/1234567890'
      );
    });
  });

  describe('Payment Policies', () => {
    it('should get all payment policies', async () => {
      const mockResponse: PaymentPolicyResponse = {
        paymentPolicies: [
          {
            paymentPolicyId: '1234567890',
            name: 'Immediate Payment',
            marketplaceId: 'EBAY_US',
          },
        ],
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const result = await accountApi.getPaymentPolicies('EBAY_US');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/payment_policy', {
        marketplace_id: 'EBAY_US',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should get payment policies for specific marketplace', async () => {
      vi.spyOn(mockClient, 'get').mockResolvedValue({ paymentPolicies: [] });

      await accountApi.getPaymentPolicies('EBAY_US');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/payment_policy', {
        marketplace_id: 'EBAY_US',
      });
    });

    it('should get a specific payment policy by ID', async () => {
      const mockPolicy: PaymentPolicy = {
        paymentPolicyId: '1234567890',
        name: 'Test Policy',
        marketplaceId: 'EBAY_US',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPolicy);

      const result = await accountApi.getPaymentPolicy('1234567890');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/payment_policy/1234567890');
      expect(result).toEqual(mockPolicy);
    });

    it('should get payment policy by name', async () => {
      const mockPolicy: PaymentPolicy = {
        paymentPolicyId: '1234567890',
        name: 'Immediate Payment',
        marketplaceId: 'EBAY_US',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPolicy);

      const result = await accountApi.getPaymentPolicyByName('EBAY_US', 'Immediate Payment');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/payment_policy_by_name', {
        marketplace_id: 'EBAY_US',
        name: 'Immediate Payment',
      });
      expect(result).toEqual(mockPolicy);
    });

    it('should create a payment policy', async () => {
      const policyRequest = {
        name: 'New Payment Policy',
        marketplaceId: 'EBAY_US',
      };

      const mockResponse = {
        paymentPolicyId: '9876543210',
      };

      vi.spyOn(mockClient, 'post').mockResolvedValue(mockResponse);

      const result = await accountApi.createPaymentPolicy(policyRequest);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/account/v1/payment_policy',
        policyRequest
      );
      expect(result.paymentPolicyId).toBe('9876543210');
    });

    it('should update a payment policy', async () => {
      const policyRequest = {
        name: 'Updated Policy',
        marketplaceId: 'EBAY_US',
      };

      const mockResponse = {
        paymentPolicyId: '1234567890',
      };

      vi.spyOn(mockClient, 'put').mockResolvedValue(mockResponse);

      const result = await accountApi.updatePaymentPolicy('1234567890', policyRequest);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/sell/account/v1/payment_policy/1234567890',
        policyRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it('should delete a payment policy', async () => {
      vi.spyOn(mockClient, 'delete').mockResolvedValue(undefined);

      await accountApi.deletePaymentPolicy('1234567890');

      expect(mockClient.delete).toHaveBeenCalledWith('/sell/account/v1/payment_policy/1234567890');
    });
  });

  describe('Return Policies', () => {
    it('should get all return policies', async () => {
      const mockResponse: ReturnPolicyResponse = {
        returnPolicies: [
          {
            returnPolicyId: '1234567890',
            name: '30 Day Returns',
            marketplaceId: 'EBAY_US',
          },
        ],
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const result = await accountApi.getReturnPolicies('EBAY_US');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/return_policy', {
        marketplace_id: 'EBAY_US',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should get return policies for specific marketplace', async () => {
      vi.spyOn(mockClient, 'get').mockResolvedValue({ returnPolicies: [] });

      await accountApi.getReturnPolicies('EBAY_US');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/return_policy', {
        marketplace_id: 'EBAY_US',
      });
    });

    it('should get a specific return policy by ID', async () => {
      const mockPolicy: ReturnPolicy = {
        returnPolicyId: '1234567890',
        name: 'Test Policy',
        marketplaceId: 'EBAY_US',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPolicy);

      const result = await accountApi.getReturnPolicy('1234567890');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/return_policy/1234567890');
      expect(result).toEqual(mockPolicy);
    });

    it('should get return policy by name', async () => {
      const mockPolicy: ReturnPolicy = {
        returnPolicyId: '1234567890',
        name: '30 Day Returns',
        marketplaceId: 'EBAY_US',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPolicy);

      const result = await accountApi.getReturnPolicyByName('EBAY_US', '30 Day Returns');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/return_policy_by_name', {
        marketplace_id: 'EBAY_US',
        name: '30 Day Returns',
      });
      expect(result).toEqual(mockPolicy);
    });

    it('should create a return policy', async () => {
      const policyRequest = {
        name: 'New Return Policy',
        marketplaceId: 'EBAY_US',
      };

      const mockResponse = {
        returnPolicyId: '9876543210',
      };

      vi.spyOn(mockClient, 'post').mockResolvedValue(mockResponse);

      const result = await accountApi.createReturnPolicy(policyRequest);

      expect(mockClient.post).toHaveBeenCalledWith('/sell/account/v1/return_policy', policyRequest);
      expect(result.returnPolicyId).toBe('9876543210');
    });

    it('should update a return policy', async () => {
      const policyRequest = {
        name: 'Updated Policy',
        marketplaceId: 'EBAY_US',
      };

      const mockResponse = {
        returnPolicyId: '1234567890',
      };

      vi.spyOn(mockClient, 'put').mockResolvedValue(mockResponse);

      const result = await accountApi.updateReturnPolicy('1234567890', policyRequest);

      expect(mockClient.put).toHaveBeenCalledWith(
        '/sell/account/v1/return_policy/1234567890',
        policyRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it('should delete a return policy', async () => {
      vi.spyOn(mockClient, 'delete').mockResolvedValue(undefined);

      await accountApi.deleteReturnPolicy('1234567890');

      expect(mockClient.delete).toHaveBeenCalledWith('/sell/account/v1/return_policy/1234567890');
    });
  });

  describe('Account Information', () => {
    it('should get seller privileges', async () => {
      const mockPrivileges: SellingPrivileges = {
        sellerRegistrationCompleted: true,
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPrivileges);

      const result = await accountApi.getPrivileges();

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/privilege');
      expect(result).toEqual(mockPrivileges);
    });

    it('should get KYC status', async () => {
      const mockKyc: KycResponse = {
        kycCheck: [
          {
            dataRequired: 'BUSINESS_VERIFICATION',
            status: 'PASSED',
          },
        ],
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockKyc);

      const result = await accountApi.getKyc();

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/kyc');
      expect(result).toEqual(mockKyc);
    });

    it('should get subscription information', async () => {
      const mockSubscription: SubscriptionResponse = {
        subscriptionId: 'sub_12345',
        subscriptionType: 'STORE_SUBSCRIPTION',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockSubscription);

      const result = await accountApi.getSubscription();

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/subscription', undefined);
      expect(result).toEqual(mockSubscription);
    });

    it('should get subscription with limit type filter', async () => {
      vi.spyOn(mockClient, 'get').mockResolvedValue({});

      await accountApi.getSubscription('SELLING_LIMIT');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/subscription', {
        limit: 'SELLING_LIMIT',
      });
    });
  });

  describe('Payments Program', () => {
    it('should opt-in to payments program', async () => {
      const mockResponse: PaymentsProgramResponse = {
        marketplaceId: 'EBAY_US',
        paymentsProgramType: 'EBAY_PAYMENTS',
        status: 'OPTED_IN',
      };

      vi.spyOn(mockClient, 'post').mockResolvedValue(mockResponse);

      const result = await accountApi.optInToPaymentsProgram('EBAY_US', 'EBAY_PAYMENTS');

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/account/v1/payments_program/EBAY_US/EBAY_PAYMENTS',
        {}
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get payments program status', async () => {
      const mockResponse: PaymentsProgramResponse = {
        marketplaceId: 'EBAY_US',
        paymentsProgramType: 'EBAY_PAYMENTS',
        status: 'OPTED_IN',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const result = await accountApi.getPaymentsProgramStatus('EBAY_US', 'EBAY_PAYMENTS');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/account/v1/payments_program/EBAY_US/EBAY_PAYMENTS'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Rate Tables', () => {
    it('should get rate tables', async () => {
      const mockResponse: RateTableResponse = {
        rateTables: [
          {
            rateTableId: '123456',
            name: 'Domestic Shipping',
          },
        ],
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const result = await accountApi.getRateTables();

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/rate_table');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Sales Tax', () => {
    it('should get all sales taxes', async () => {
      const mockResponse: SalesTaxes = {
        salesTaxes: [
          {
            countryCode: 'US',
            jurisdictionId: 'CA',
            salesTaxPercentage: '8.25',
          },
        ],
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const result = await accountApi.getSalesTaxes('US');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/sales_tax', {
        country_code: 'US',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should get sales taxes for specific country', async () => {
      vi.spyOn(mockClient, 'get').mockResolvedValue({ salesTaxes: [] });

      await accountApi.getSalesTaxes('US');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/sales_tax', {
        country_code: 'US',
      });
    });

    it('should get specific sales tax', async () => {
      const mockSalesTax: SalesTax = {
        countryCode: 'US',
        jurisdictionId: 'CA',
        salesTaxPercentage: '8.25',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockSalesTax);

      const result = await accountApi.getSalesTax('US', 'CA');

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/sales_tax/US/CA');
      expect(result).toEqual(mockSalesTax);
    });

    it('should create or replace sales tax', async () => {
      const salesTaxBase = {
        salesTaxPercentage: '8.25',
        shippingAndHandlingTaxed: false,
      };

      vi.spyOn(mockClient, 'put').mockResolvedValue(undefined);

      await accountApi.createOrReplaceSalesTax('US', 'CA', salesTaxBase);

      expect(mockClient.put).toHaveBeenCalledWith('/sell/account/v1/sales_tax/US/CA', salesTaxBase);
    });

    it('should bulk create or replace sales taxes', async () => {
      const requests = [
        {
          countryCode: 'US',
          jurisdictionId: 'CA',
          salesTaxBase: { salesTaxPercentage: '8.25' },
        },
        {
          countryCode: 'US',
          jurisdictionId: 'NY',
          salesTaxBase: { salesTaxPercentage: '4.0' },
        },
      ];

      vi.spyOn(mockClient, 'post').mockResolvedValue(undefined);

      await accountApi.bulkCreateOrReplaceSalesTax(requests);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/account/v1/sales_tax/bulk_create_or_replace',
        { requests }
      );
    });

    it('should delete sales tax', async () => {
      vi.spyOn(mockClient, 'delete').mockResolvedValue(undefined);

      await accountApi.deleteSalesTax('US', 'CA');

      expect(mockClient.delete).toHaveBeenCalledWith('/sell/account/v1/sales_tax/US/CA');
    });
  });

  describe('Programs', () => {
    it('should opt-in to program', async () => {
      const request = {
        programType: 'OUT_OF_STOCK_CONTROL',
      };

      vi.spyOn(mockClient, 'post').mockResolvedValue(undefined);

      await accountApi.optInToProgram(request);

      expect(mockClient.post).toHaveBeenCalledWith('/sell/account/v1/program/opt_in', request);
    });

    it('should opt-out of program', async () => {
      const request = {
        programType: 'OUT_OF_STOCK_CONTROL',
      };

      vi.spyOn(mockClient, 'post').mockResolvedValue(undefined);

      await accountApi.optOutOfProgram(request);

      expect(mockClient.post).toHaveBeenCalledWith('/sell/account/v1/program/opt_out', request);
    });

    it('should get opted-in programs', async () => {
      const mockPrograms: Programs = {
        programs: [
          {
            programType: 'OUT_OF_STOCK_CONTROL',
            programStatus: 'OPTED_IN',
          },
        ],
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPrograms);

      const result = await accountApi.getOptedInPrograms();

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/program');
      expect(result).toEqual(mockPrograms);
    });
  });
});
