import type { EbayApiClient } from '@/api/client.js';
import type { components } from '../../types/sell-apps/account-management/sellAccountV1Oas3.js';

type CustomPolicyCreateRequest = components['schemas']['CustomPolicyCreateRequest'];
type CustomPolicyResponse = components['schemas']['CustomPolicyResponse'];
type CustomPolicy = components['schemas']['CustomPolicy'];
type FulfillmentPolicyRequest = components['schemas']['FulfillmentPolicyRequest'];
type SetFulfillmentPolicyResponse = components['schemas']['SetFulfillmentPolicyResponse'];
type FulfillmentPolicyResponse = components['schemas']['FulfillmentPolicyResponse'];
type FulfillmentPolicy = components['schemas']['FulfillmentPolicy'];
type KycResponse = components['schemas']['KycResponse'];
type PaymentPolicyRequest = components['schemas']['PaymentPolicyRequest'];
type SetPaymentPolicyResponse = components['schemas']['SetPaymentPolicyResponse'];
type GetPaymentPoliciesResponse = components['schemas']['PaymentPolicyResponse'];
type PaymentPolicy = components['schemas']['PaymentPolicy'];
type PaymentsProgramResponse = components['schemas']['PaymentsProgramResponse'];
type PaymentsProgramOnboardingResponse = components['schemas']['PaymentsProgramOnboardingResponse'];
type SellerEligibilityMultiProgramResponse =
  components['schemas']['SellerEligibilityMultiProgramResponse'];
type SellingPrivileges = components['schemas']['SellingPrivileges'];
type Programs = components['schemas']['Programs'];
type OptInToProgramRequest = components['schemas']['Program'];
type RateTableResponse = components['schemas']['RateTableResponse'];
type ReturnPolicyRequest = components['schemas']['ReturnPolicyRequest'];
type SetReturnPolicyResponse = components['schemas']['SetReturnPolicyResponse'];
type ReturnPolicyResponse = components['schemas']['ReturnPolicyResponse'];
type ReturnPolicy = components['schemas']['ReturnPolicy'];
type SalesTaxBase = components['schemas']['SalesTaxBase'];
type SalesTax = components['schemas']['SalesTax'];
type SalesTaxes = components['schemas']['SalesTaxes'];
type SubscriptionResponse = components['schemas']['SubscriptionResponse'];

/**
 * Account API - Seller account configuration, policies, programs
 * Based on: docs/sell-apps/account-management/sell_account_v1_oas3.json
 */
export class AccountApi {
  private readonly basePath = '/sell/account/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Get custom policies for the seller
   */
  async getCustomPolicies(policyTypes?: string): Promise<CustomPolicyResponse> {
    const params = policyTypes ? { policy_types: policyTypes } : undefined;
    return await this.client.get<CustomPolicyResponse>(`${this.basePath}/custom_policy`, params);
  }

  /**
   * Get a specific custom policy
   */
  async getCustomPolicy(customPolicyId: string): Promise<CustomPolicy> {
    return await this.client.get<CustomPolicy>(`${this.basePath}/custom_policy/${customPolicyId}`);
  }

  /**
   * Get fulfillment policies
   * @param marketplaceId - Required: The eBay marketplace ID
   */
  async getFulfillmentPolicies(marketplaceId: string): Promise<FulfillmentPolicyResponse> {
    return await this.client.get<FulfillmentPolicyResponse>(`${this.basePath}/fulfillment_policy`, {
      marketplace_id: marketplaceId,
    });
  }

  /**
   * Get payment policies
   * @param marketplaceId - Required: The eBay marketplace ID
   */
  async getPaymentPolicies(marketplaceId: string): Promise<GetPaymentPoliciesResponse> {
    return await this.client.get<GetPaymentPoliciesResponse>(`${this.basePath}/payment_policy`, {
      marketplace_id: marketplaceId,
    });
  }

  /**
   * Get return policies
   * @param marketplaceId - Required: The eBay marketplace ID
   */
  async getReturnPolicies(marketplaceId: string): Promise<ReturnPolicyResponse> {
    return await this.client.get<ReturnPolicyResponse>(`${this.basePath}/return_policy`, {
      marketplace_id: marketplaceId,
    });
  }

  /**
   * Get seller account privileges
   */
  async getPrivileges(): Promise<SellingPrivileges> {
    return await this.client.get<SellingPrivileges>(`${this.basePath}/privilege`);
  }

  // ============================================================
  // Fulfillment Policy Methods
  // ============================================================

  /**
   * Create a new fulfillment policy
   */
  async createFulfillmentPolicy(
    policy: FulfillmentPolicyRequest
  ): Promise<SetFulfillmentPolicyResponse> {
    return await this.client.post<SetFulfillmentPolicyResponse>(
      `${this.basePath}/fulfillment_policy`,
      policy
    );
  }

  /**
   * Get a specific fulfillment policy by ID
   */
  async getFulfillmentPolicy(fulfillmentPolicyId: string): Promise<FulfillmentPolicy> {
    return await this.client.get<FulfillmentPolicy>(
      `${this.basePath}/fulfillment_policy/${fulfillmentPolicyId}`
    );
  }

  /**
   * Get a fulfillment policy by name
   */
  async getFulfillmentPolicyByName(
    marketplaceId: string,
    name: string
  ): Promise<FulfillmentPolicy> {
    return await this.client.get<FulfillmentPolicy>(`${this.basePath}/fulfillment_policy_by_name`, {
      marketplace_id: marketplaceId,
      name,
    });
  }

  /**
   * Update a fulfillment policy
   */
  async updateFulfillmentPolicy(
    fulfillmentPolicyId: string,
    policy: FulfillmentPolicyRequest
  ): Promise<SetFulfillmentPolicyResponse> {
    return await this.client.put<SetFulfillmentPolicyResponse>(
      `${this.basePath}/fulfillment_policy/${fulfillmentPolicyId}`,
      policy
    );
  }

  /**
   * Delete a fulfillment policy
   */
  async deleteFulfillmentPolicy(fulfillmentPolicyId: string): Promise<void> {
    return await this.client.delete(`${this.basePath}/fulfillment_policy/${fulfillmentPolicyId}`);
  }

  // ============================================================
  // Payment Policy Methods
  // ============================================================

  /**
   * Create a new payment policy
   */
  async createPaymentPolicy(policy: PaymentPolicyRequest): Promise<SetPaymentPolicyResponse> {
    return await this.client.post<SetPaymentPolicyResponse>(
      `${this.basePath}/payment_policy`,
      policy
    );
  }

  /**
   * Get a specific payment policy by ID
   */
  async getPaymentPolicy(paymentPolicyId: string): Promise<PaymentPolicy> {
    return await this.client.get<PaymentPolicy>(
      `${this.basePath}/payment_policy/${paymentPolicyId}`
    );
  }

  /**
   * Get a payment policy by name
   */
  async getPaymentPolicyByName(marketplaceId: string, name: string): Promise<PaymentPolicy> {
    return await this.client.get<PaymentPolicy>(`${this.basePath}/payment_policy_by_name`, {
      marketplace_id: marketplaceId,
      name,
    });
  }

  /**
   * Update a payment policy
   */
  async updatePaymentPolicy(
    paymentPolicyId: string,
    policy: PaymentPolicyRequest
  ): Promise<SetPaymentPolicyResponse> {
    return await this.client.put<SetPaymentPolicyResponse>(
      `${this.basePath}/payment_policy/${paymentPolicyId}`,
      policy
    );
  }

  /**
   * Delete a payment policy
   */
  async deletePaymentPolicy(paymentPolicyId: string): Promise<void> {
    return await this.client.delete(`${this.basePath}/payment_policy/${paymentPolicyId}`);
  }

  // ============================================================
  // Return Policy Methods
  // ============================================================

  /**
   * Create a new return policy
   */
  async createReturnPolicy(policy: ReturnPolicyRequest): Promise<SetReturnPolicyResponse> {
    return await this.client.post<SetReturnPolicyResponse>(
      `${this.basePath}/return_policy`,
      policy
    );
  }

  /**
   * Get a specific return policy by ID
   */
  async getReturnPolicy(returnPolicyId: string): Promise<ReturnPolicy> {
    return await this.client.get<ReturnPolicy>(`${this.basePath}/return_policy/${returnPolicyId}`);
  }

  /**
   * Get a return policy by name
   */
  async getReturnPolicyByName(marketplaceId: string, name: string): Promise<ReturnPolicy> {
    return await this.client.get<ReturnPolicy>(`${this.basePath}/return_policy_by_name`, {
      marketplace_id: marketplaceId,
      name,
    });
  }

  /**
   * Update a return policy
   */
  async updateReturnPolicy(
    returnPolicyId: string,
    policy: ReturnPolicyRequest
  ): Promise<SetReturnPolicyResponse> {
    return await this.client.put<SetReturnPolicyResponse>(
      `${this.basePath}/return_policy/${returnPolicyId}`,
      policy
    );
  }

  /**
   * Delete a return policy
   */
  async deleteReturnPolicy(returnPolicyId: string): Promise<void> {
    return await this.client.delete(`${this.basePath}/return_policy/${returnPolicyId}`);
  }

  // ============================================================
  // Custom Policy Methods
  // ============================================================

  /**
   * Create a new custom policy
   */
  async createCustomPolicy(policy: CustomPolicyCreateRequest): Promise<CustomPolicy> {
    return await this.client.post<CustomPolicy>(`${this.basePath}/custom_policy`, policy);
  }

  /**
   * Update a custom policy
   */
  async updateCustomPolicy(
    customPolicyId: string,
    policy: CustomPolicyCreateRequest
  ): Promise<void> {
    return await this.client.put(`${this.basePath}/custom_policy/${customPolicyId}`, policy);
  }

  /**
   * Delete a custom policy
   */
  async deleteCustomPolicy(customPolicyId: string): Promise<void> {
    return await this.client.delete(`${this.basePath}/custom_policy/${customPolicyId}`);
  }

  // ============================================================
  // KYC, Payments Program, Rate Tables, Sales Tax, Subscription, Programs
  // ============================================================

  /**
   * Get KYC status
   */
  async getKyc(): Promise<KycResponse> {
    return await this.client.get<KycResponse>(`${this.basePath}/kyc`);
  }

  /**
   * Opt-in to a payments program
   */
  async optInToPaymentsProgram(
    marketplaceId: string,
    paymentsProgramType: string
  ): Promise<PaymentsProgramResponse> {
    return await this.client.post<PaymentsProgramResponse>(
      `${this.basePath}/payments_program/${marketplaceId}/${paymentsProgramType}`,
      {}
    );
  }

  /**
   * Get payments program status
   */
  async getPaymentsProgramStatus(
    marketplaceId: string,
    paymentsProgramType: string
  ): Promise<PaymentsProgramResponse> {
    return await this.client.get<PaymentsProgramResponse>(
      `${this.basePath}/payments_program/${marketplaceId}/${paymentsProgramType}`
    );
  }

  /**
   * Get rate tables
   */
  async getRateTables(): Promise<RateTableResponse> {
    return await this.client.get<RateTableResponse>(`${this.basePath}/rate_table`);
  }

  /**
   * Create or replace sales tax table
   */
  async createOrReplaceSalesTax(
    countryCode: string,
    jurisdictionId: string,
    salesTaxBase: SalesTaxBase
  ): Promise<void> {
    return await this.client.put(
      `${this.basePath}/sales_tax/${countryCode}/${jurisdictionId}`,
      salesTaxBase
    );
  }

  /**
   * Bulk create or replace sales tax tables
   */
  async bulkCreateOrReplaceSalesTax(
    requests: {
      countryCode: string;
      jurisdictionId: string;
      salesTaxBase: SalesTaxBase;
    }[]
  ): Promise<void> {
    return await this.client.post(`${this.basePath}/sales_tax/bulk_create_or_replace`, {
      requests,
    });
  }

  /**
   * Delete sales tax table
   */
  async deleteSalesTax(countryCode: string, jurisdictionId: string): Promise<void> {
    return await this.client.delete(`${this.basePath}/sales_tax/${countryCode}/${jurisdictionId}`);
  }

  /**
   * Get sales tax table
   */
  async getSalesTax(countryCode: string, jurisdictionId: string): Promise<SalesTax> {
    return await this.client.get<SalesTax>(
      `${this.basePath}/sales_tax/${countryCode}/${jurisdictionId}`
    );
  }

  /**
   * Get all sales tax tables
   * @param countryCode - Required: Two-letter ISO 3166-1 country code
   */
  async getSalesTaxes(countryCode: string): Promise<SalesTaxes> {
    return await this.client.get<SalesTaxes>(`${this.basePath}/sales_tax`, {
      country_code: countryCode,
    });
  }

  /**
   * Get subscription information
   */
  async getSubscription(limitType?: string): Promise<SubscriptionResponse> {
    const params = limitType ? { limit: limitType } : undefined;
    return await this.client.get<SubscriptionResponse>(`${this.basePath}/subscription`, params);
  }

  /**
   * Opt-in to a program
   */
  async optInToProgram(request: OptInToProgramRequest): Promise<void> {
    return await this.client.post(`${this.basePath}/program/opt_in`, request);
  }

  /**
   * Opt-out of a program
   */
  async optOutOfProgram(request: OptInToProgramRequest): Promise<void> {
    return await this.client.post(`${this.basePath}/program/opt_out`, request);
  }

  /**
   * Get opted-in programs
   */
  async getOptedInPrograms(): Promise<Programs> {
    return await this.client.get<Programs>(`${this.basePath}/program`);
  }

  /**
   * Get seller eligibility for advertising programs
   * This method allows developers to check the seller eligibility status for eBay advertising programs.
   * @param programTypes - Optional comma-separated list of program types to check
   * @param marketplaceId - Required eBay marketplace ID (passed in X-EBAY-C-MARKETPLACE-ID header)
   */
  async getAdvertisingEligibility(
    marketplaceId: string,
    programTypes?: string
  ): Promise<SellerEligibilityMultiProgramResponse> {
    const params = programTypes ? { program_types: programTypes } : undefined;
    return await this.client.get<SellerEligibilityMultiProgramResponse>(
      `${this.basePath}/advertising_eligibility`,
      params,
      {
        headers: {
          'X-EBAY-C-MARKETPLACE-ID': marketplaceId,
        },
      }
    );
  }

  /**
   * Get payments program status for a marketplace
   * Note: This method is deprecated as all seller accounts globally have been enabled for the new eBay payment and checkout flow.
   * @param marketplaceId - The eBay marketplace ID
   * @param paymentsProgramType - The type of payments program
   */
  async getPaymentsProgram(
    marketplaceId: string,
    paymentsProgramType: string
  ): Promise<PaymentsProgramResponse> {
    return await this.client.get<PaymentsProgramResponse>(
      `${this.basePath}/payments_program/${marketplaceId}/${paymentsProgramType}`
    );
  }

  /**
   * Get payments program onboarding information
   * Note: This method is deprecated as all seller accounts globally have been enabled for the new eBay payment and checkout flow.
   * @param marketplaceId - The eBay marketplace ID
   * @param paymentsProgramType - The type of payments program
   */
  async getPaymentsProgramOnboarding(
    marketplaceId: string,
    paymentsProgramType: string
  ): Promise<PaymentsProgramOnboardingResponse> {
    return await this.client.get<PaymentsProgramOnboardingResponse>(
      `${this.basePath}/payments_program/${marketplaceId}/${paymentsProgramType}/onboarding`
    );
  }
}
