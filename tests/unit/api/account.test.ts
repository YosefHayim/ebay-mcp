import { Effect } from 'effect';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountApi } from '@/api/account-management/account.js';
import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import type { components } from '@/types/sell-apps/account-management/sellAccountV1Oas3.js';

type CustomPolicy = components['schemas']['CustomPolicy'];
type CustomPolicyResponse = components['schemas']['CustomPolicyResponse'];
type FulfillmentPolicy = components['schemas']['FulfillmentPolicy'];
type FulfillmentPolicyResponse = components['schemas']['FulfillmentPolicyResponse'];
type PaymentPolicy = components['schemas']['PaymentPolicy'];
type PaymentPolicyResponse = components['schemas']['PaymentPolicyResponse'];
type ReturnPolicy = components['schemas']['ReturnPolicy'];
type ReturnPolicyResponse = components['schemas']['ReturnPolicyResponse'];
type PaymentsProgramResponse = components['schemas']['PaymentsProgramResponse'];
type PaymentsProgramOnboardingResponse = components['schemas']['PaymentsProgramOnboardingResponse'];
type SellingPrivileges = components['schemas']['SellingPrivileges'];
type Programs = components['schemas']['Programs'];
type KycResponse = components['schemas']['KycResponse'];
type RateTableResponse = components['schemas']['RateTableResponse'];
type SalesTax = components['schemas']['SalesTax'];
type SalesTaxes = components['schemas']['SalesTaxes'];
type SubscriptionResponse = components['schemas']['SubscriptionResponse'];
type SellerEligibilityMultiProgramResponse =
  components['schemas']['SellerEligibilityMultiProgramResponse'];

describe('AccountApi', () => {
  let accountApi: AccountApi;
  let mockClient: EbayApiClient;

  beforeEach(() => {
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
    it('gets all custom policies without filters', async () => {
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

      const customPolicies = await Effect.runPromise(accountApi.getCustomPolicies());

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/custom_policy/');
      expect(customPolicies).toEqual(mockResponse);
    });

    it('gets custom policies with a policy type filter', async () => {
      vi.spyOn(mockClient, 'get').mockResolvedValue({ customPolicies: [] });

      await Effect.runPromise(accountApi.getCustomPolicies({ policyTypes: 'PRODUCT_COMPLIANCE' }));

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/custom_policy/', {
        policy_types: 'PRODUCT_COMPLIANCE',
      });
    });

    it('gets a specific custom policy by ID', async () => {
      const mockPolicy: CustomPolicy = {
        customPolicyId: '1234567890',
        name: 'Test Policy',
        description: 'Test description',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPolicy);

      const customPolicy = await Effect.runPromise(
        accountApi.getCustomPolicy({ customPolicyId: '1234567890' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/custom_policy/1234567890');
      expect(customPolicy).toEqual(mockPolicy);
    });

    it('creates a custom policy', async () => {
      const policy = {
        name: 'New Custom Policy',
        policyType: 'PRODUCT_COMPLIANCE',
        description: 'New policy description',
      };
      const mockResponse: CustomPolicy = {
        customPolicyId: '9876543210',
        ...policy,
      };

      vi.spyOn(mockClient, 'post').mockResolvedValue(mockResponse);

      const createdPolicy = await Effect.runPromise(accountApi.createCustomPolicy({ policy }));

      expect(mockClient.post).toHaveBeenCalledWith('/sell/account/v1/custom_policy/', policy);
      expect(createdPolicy.customPolicyId).toBe('9876543210');
    });

    it('updates a custom policy', async () => {
      const policy = {
        name: 'Updated Policy',
        policyType: 'TAKE_BACK',
        description: 'Updated description',
      };

      vi.spyOn(mockClient, 'put').mockResolvedValue(undefined);

      await Effect.runPromise(
        accountApi.updateCustomPolicy({ customPolicyId: '1234567890', policy }),
      );

      expect(mockClient.put).toHaveBeenCalledWith(
        '/sell/account/v1/custom_policy/1234567890',
        policy,
      );
    });
  });

  describe('Fulfillment Policies', () => {
    it('gets fulfillment policies for a marketplace', async () => {
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

      const fulfillmentPolicies = await Effect.runPromise(
        accountApi.getFulfillmentPolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/fulfillment_policy', {
        marketplace_id: 'EBAY_US',
      });
      expect(fulfillmentPolicies).toEqual(mockResponse);
    });

    it('gets a fulfillment policy by ID', async () => {
      const mockPolicy: FulfillmentPolicy = {
        fulfillmentPolicyId: '1234567890',
        name: 'Test Policy',
        marketplaceId: 'EBAY_US',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPolicy);

      const fulfillmentPolicy = await Effect.runPromise(
        accountApi.getFulfillmentPolicy({ fulfillmentPolicyId: '1234567890' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/fulfillment_policy/1234567890');
      expect(fulfillmentPolicy).toEqual(mockPolicy);
    });

    it('gets a fulfillment policy by name', async () => {
      const mockPolicy: FulfillmentPolicy = {
        fulfillmentPolicyId: '1234567890',
        name: 'Standard Shipping',
        marketplaceId: 'EBAY_US',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPolicy);

      const fulfillmentPolicy = await Effect.runPromise(
        accountApi.getFulfillmentPolicyByName({
          marketplaceId: 'EBAY_US',
          name: 'Standard Shipping',
        }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/account/v1/fulfillment_policy/get_by_policy_name',
        {
          marketplace_id: 'EBAY_US',
          name: 'Standard Shipping',
        },
      );
      expect(fulfillmentPolicy).toEqual(mockPolicy);
    });

    it('creates, updates, and deletes a fulfillment policy', async () => {
      const policy = {
        name: 'New Shipping Policy',
        marketplaceId: 'EBAY_US',
      };
      const mockResponse = {
        fulfillmentPolicyId: '9876543210',
      };

      vi.spyOn(mockClient, 'post').mockResolvedValue(mockResponse);
      vi.spyOn(mockClient, 'put').mockResolvedValue(mockResponse);
      vi.spyOn(mockClient, 'delete').mockResolvedValue(undefined);

      const created = await Effect.runPromise(accountApi.createFulfillmentPolicy({ policy }));
      const updated = await Effect.runPromise(
        accountApi.updateFulfillmentPolicy({ fulfillmentPolicyId: '9876543210', policy }),
      );
      await Effect.runPromise(
        accountApi.deleteFulfillmentPolicy({ fulfillmentPolicyId: '9876543210' }),
      );

      expect(mockClient.post).toHaveBeenCalledWith('/sell/account/v1/fulfillment_policy/', policy);
      expect(mockClient.put).toHaveBeenCalledWith(
        '/sell/account/v1/fulfillment_policy/9876543210',
        policy,
      );
      expect(mockClient.delete).toHaveBeenCalledWith(
        '/sell/account/v1/fulfillment_policy/9876543210',
      );
      expect(created).toEqual(mockResponse);
      expect(updated).toEqual(mockResponse);
    });
  });

  describe('Payment Policies', () => {
    it('gets payment policies for a marketplace', async () => {
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

      const paymentPolicies = await Effect.runPromise(
        accountApi.getPaymentPolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/payment_policy', {
        marketplace_id: 'EBAY_US',
      });
      expect(paymentPolicies).toEqual(mockResponse);
    });

    it('gets a payment policy by ID', async () => {
      const mockPolicy: PaymentPolicy = {
        paymentPolicyId: '1234567890',
        name: 'Test Policy',
        marketplaceId: 'EBAY_US',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPolicy);

      const paymentPolicy = await Effect.runPromise(
        accountApi.getPaymentPolicy({ paymentPolicyId: '1234567890' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/payment_policy/1234567890');
      expect(paymentPolicy).toEqual(mockPolicy);
    });

    it('gets a payment policy by name', async () => {
      const mockPolicy: PaymentPolicy = {
        paymentPolicyId: '1234567890',
        name: 'Immediate Payment',
        marketplaceId: 'EBAY_US',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPolicy);

      const paymentPolicy = await Effect.runPromise(
        accountApi.getPaymentPolicyByName({
          marketplaceId: 'EBAY_US',
          name: 'Immediate Payment',
        }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/account/v1/payment_policy/get_by_policy_name',
        {
          marketplace_id: 'EBAY_US',
          name: 'Immediate Payment',
        },
      );
      expect(paymentPolicy).toEqual(mockPolicy);
    });

    it('creates, updates, and deletes a payment policy', async () => {
      const policy = {
        name: 'New Payment Policy',
        marketplaceId: 'EBAY_US',
      };
      const mockResponse = {
        paymentPolicyId: '9876543210',
      };

      vi.spyOn(mockClient, 'post').mockResolvedValue(mockResponse);
      vi.spyOn(mockClient, 'put').mockResolvedValue(mockResponse);
      vi.spyOn(mockClient, 'delete').mockResolvedValue(undefined);

      const created = await Effect.runPromise(accountApi.createPaymentPolicy({ policy }));
      const updated = await Effect.runPromise(
        accountApi.updatePaymentPolicy({ paymentPolicyId: '9876543210', policy }),
      );
      await Effect.runPromise(accountApi.deletePaymentPolicy({ paymentPolicyId: '9876543210' }));

      expect(mockClient.post).toHaveBeenCalledWith('/sell/account/v1/payment_policy', policy);
      expect(mockClient.put).toHaveBeenCalledWith(
        '/sell/account/v1/payment_policy/9876543210',
        policy,
      );
      expect(mockClient.delete).toHaveBeenCalledWith('/sell/account/v1/payment_policy/9876543210');
      expect(created).toEqual(mockResponse);
      expect(updated).toEqual(mockResponse);
    });
  });

  describe('Return Policies', () => {
    it('gets return policies for a marketplace', async () => {
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

      const returnPolicies = await Effect.runPromise(
        accountApi.getReturnPolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/return_policy', {
        marketplace_id: 'EBAY_US',
      });
      expect(returnPolicies).toEqual(mockResponse);
    });

    it('gets a return policy by ID', async () => {
      const mockPolicy: ReturnPolicy = {
        returnPolicyId: '1234567890',
        name: 'Test Policy',
        marketplaceId: 'EBAY_US',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPolicy);

      const returnPolicy = await Effect.runPromise(
        accountApi.getReturnPolicy({ returnPolicyId: '1234567890' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/return_policy/1234567890');
      expect(returnPolicy).toEqual(mockPolicy);
    });

    it('gets a return policy by name', async () => {
      const mockPolicy: ReturnPolicy = {
        returnPolicyId: '1234567890',
        name: '30 Day Returns',
        marketplaceId: 'EBAY_US',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockPolicy);

      const returnPolicy = await Effect.runPromise(
        accountApi.getReturnPolicyByName({
          marketplaceId: 'EBAY_US',
          name: '30 Day Returns',
        }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/account/v1/return_policy/get_by_policy_name',
        {
          marketplace_id: 'EBAY_US',
          name: '30 Day Returns',
        },
      );
      expect(returnPolicy).toEqual(mockPolicy);
    });

    it('creates, updates, and deletes a return policy', async () => {
      const policy = {
        name: 'New Return Policy',
        marketplaceId: 'EBAY_US',
      };
      const mockResponse = {
        returnPolicyId: '9876543210',
      };

      vi.spyOn(mockClient, 'post').mockResolvedValue(mockResponse);
      vi.spyOn(mockClient, 'put').mockResolvedValue(mockResponse);
      vi.spyOn(mockClient, 'delete').mockResolvedValue(undefined);

      const created = await Effect.runPromise(accountApi.createReturnPolicy({ policy }));
      const updated = await Effect.runPromise(
        accountApi.updateReturnPolicy({ returnPolicyId: '9876543210', policy }),
      );
      await Effect.runPromise(accountApi.deleteReturnPolicy({ returnPolicyId: '9876543210' }));

      expect(mockClient.post).toHaveBeenCalledWith('/sell/account/v1/return_policy', policy);
      expect(mockClient.put).toHaveBeenCalledWith(
        '/sell/account/v1/return_policy/9876543210',
        policy,
      );
      expect(mockClient.delete).toHaveBeenCalledWith('/sell/account/v1/return_policy/9876543210');
      expect(created).toEqual(mockResponse);
      expect(updated).toEqual(mockResponse);
    });
  });

  describe('Account Information', () => {
    it('gets seller privileges, KYC, rate tables, and opted-in programs', async () => {
      const mockPrivileges: SellingPrivileges = { sellerRegistrationCompleted: true };
      const mockKyc: KycResponse = {
        kycCheck: [
          {
            dataRequired: 'BUSINESS_VERIFICATION',
            status: 'PASSED',
          },
        ],
      };
      const mockRateTables: RateTableResponse = {
        rateTables: [{ rateTableId: '123456', name: 'Domestic Shipping' }],
      };
      const mockPrograms: Programs = {
        programs: [{ programType: 'OUT_OF_STOCK_CONTROL', programStatus: 'OPTED_IN' }],
      };

      vi.spyOn(mockClient, 'get')
        .mockResolvedValueOnce(mockPrivileges)
        .mockResolvedValueOnce(mockKyc)
        .mockResolvedValueOnce(mockRateTables)
        .mockResolvedValueOnce(mockPrograms);

      expect(await Effect.runPromise(accountApi.getPrivileges({}))).toEqual(mockPrivileges);
      expect(await Effect.runPromise(accountApi.getKyc({}))).toEqual(mockKyc);
      expect(await Effect.runPromise(accountApi.getRateTables({}))).toEqual(mockRateTables);
      expect(await Effect.runPromise(accountApi.getOptedInPrograms({}))).toEqual(mockPrograms);

      expect(mockClient.get).toHaveBeenNthCalledWith(1, '/sell/account/v1/privilege');
      expect(mockClient.get).toHaveBeenNthCalledWith(2, '/sell/account/v1/kyc');
      expect(mockClient.get).toHaveBeenNthCalledWith(3, '/sell/account/v1/rate_table');
      expect(mockClient.get).toHaveBeenNthCalledWith(
        4,
        '/sell/account/v1/program/get_opted_in_programs',
      );
    });

    it('gets subscription information with optional pagination fields', async () => {
      const mockSubscription: SubscriptionResponse = {
        subscriptionId: 'sub_12345',
        subscriptionType: 'STORE_SUBSCRIPTION',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockSubscription);

      const subscription = await Effect.runPromise(
        accountApi.getSubscription({ limit: '10', continuationToken: 'next-page' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/subscription', {
        limit: '10',
        continuation_token: 'next-page',
      });
      expect(subscription).toEqual(mockSubscription);
    });
  });

  describe('Payments Program', () => {
    it('gets payments program status', async () => {
      const mockResponse: PaymentsProgramResponse = {
        marketplaceId: 'EBAY_US',
        paymentsProgramType: 'EBAY_PAYMENTS',
        status: 'OPTED_IN',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const paymentsProgram = await Effect.runPromise(
        accountApi.getPaymentsProgram({
          marketplaceId: 'EBAY_US',
          paymentsProgramType: 'EBAY_PAYMENTS',
        }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/account/v1/payments_program/EBAY_US/EBAY_PAYMENTS',
      );
      expect(paymentsProgram).toEqual(mockResponse);
    });

    it('gets payments program onboarding status', async () => {
      const mockResponse: PaymentsProgramOnboardingResponse = {
        marketplaceId: 'EBAY_US',
        paymentsProgramType: 'EBAY_PAYMENTS',
        status: 'OPTED_IN',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const onboarding = await Effect.runPromise(
        accountApi.getPaymentsProgramOnboarding({
          marketplaceId: 'EBAY_US',
          paymentsProgramType: 'EBAY_PAYMENTS',
        }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/account/v1/payments_program/EBAY_US/EBAY_PAYMENTS/onboarding',
      );
      expect(onboarding).toEqual(mockResponse);
    });
  });

  describe('Sales Tax', () => {
    it('gets all sales taxes for a country', async () => {
      const mockResponse: SalesTaxes = {
        salesTaxes: [{ countryCode: 'US', jurisdictionId: 'CA', salesTaxPercentage: '8.25' }],
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const salesTaxes = await Effect.runPromise(accountApi.getSalesTaxes({ countryCode: 'US' }));

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/sales_tax', {
        country_code: 'US',
      });
      expect(salesTaxes).toEqual(mockResponse);
    });

    it('gets a specific sales tax table entry', async () => {
      const mockSalesTax: SalesTax = {
        countryCode: 'US',
        jurisdictionId: 'CA',
        salesTaxPercentage: '8.25',
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockSalesTax);

      const salesTax = await Effect.runPromise(
        accountApi.getSalesTax({ countryCode: 'US', jurisdictionId: 'CA' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith('/sell/account/v1/sales_tax/US/CA');
      expect(salesTax).toEqual(mockSalesTax);
    });

    it('creates, bulk creates, and deletes sales tax entries', async () => {
      const salesTaxBase = {
        salesTaxPercentage: '8.25',
        shippingAndHandlingTaxed: false,
      };
      const requests = [
        { countryCode: 'US', jurisdictionId: 'CA', salesTaxBase },
        { countryCode: 'US', jurisdictionId: 'NY', salesTaxBase: { salesTaxPercentage: '4.0' } },
      ];

      vi.spyOn(mockClient, 'put').mockResolvedValue(undefined);
      vi.spyOn(mockClient, 'post').mockResolvedValue(undefined);
      vi.spyOn(mockClient, 'delete').mockResolvedValue(undefined);

      await Effect.runPromise(
        accountApi.createOrReplaceSalesTax({
          countryCode: 'US',
          jurisdictionId: 'CA',
          salesTaxBase,
        }),
      );
      await Effect.runPromise(accountApi.bulkCreateOrReplaceSalesTax({ requests }));
      await Effect.runPromise(
        accountApi.deleteSalesTax({ countryCode: 'US', jurisdictionId: 'CA' }),
      );

      expect(mockClient.put).toHaveBeenCalledWith('/sell/account/v1/sales_tax/US/CA', salesTaxBase);
      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/account/v1/bulk_create_or_replace_sales_tax',
        { requests },
      );
      expect(mockClient.delete).toHaveBeenCalledWith('/sell/account/v1/sales_tax/US/CA');
    });
  });

  describe('Programs', () => {
    it('opts in and out of a program', async () => {
      const request = {
        programType: 'OUT_OF_STOCK_CONTROL',
      };

      vi.spyOn(mockClient, 'post').mockResolvedValue(undefined);

      await Effect.runPromise(accountApi.optInToProgram({ request }));
      await Effect.runPromise(accountApi.optOutOfProgram({ request }));

      expect(mockClient.post).toHaveBeenNthCalledWith(
        1,
        '/sell/account/v1/program/opt_in',
        request,
      );
      expect(mockClient.post).toHaveBeenNthCalledWith(
        2,
        '/sell/account/v1/program/opt_out',
        request,
      );
    });
  });

  describe('Advertising Eligibility', () => {
    it('gets advertising eligibility with the marketplace header and program filter', async () => {
      const mockResponse: SellerEligibilityMultiProgramResponse = {
        sellerEligibility: [],
      };

      vi.spyOn(mockClient, 'get').mockResolvedValue(mockResponse);

      const eligibility = await Effect.runPromise(
        accountApi.getAdvertisingEligibility({
          marketplaceId: 'EBAY_US',
          programTypes: 'PLA',
        }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/account/v1/advertising_eligibility',
        { program_types: 'PLA' },
        {
          headers: {
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        },
      );
      expect(eligibility).toEqual(mockResponse);
    });
  });
});
