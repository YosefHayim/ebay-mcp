import type { EbayApiClient } from '../client.js';

/**
 * Metadata API - Marketplace policies and configurations
 * Based on: docs/sell-apps/listing-metadata/sell_metadata_v1_oas3.json
 */
export class MetadataApi {
  private readonly basePath = '/sell/metadata/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Get automotive parts compatibility policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_automotive_parts_compatibility_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getAutomotivePartsCompatibilityPolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_automotive_parts_compatibility_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get automotive parts compatibility policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get category policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_category_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getCategoryPolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_category_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get category policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get extended producer responsibility policies
   * Endpoint: GET /marketplace/{marketplace_id}/get_extended_producer_responsibility_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getExtendedProducerResponsibilityPolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_extended_producer_responsibility_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get extended producer responsibility policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get hazardous materials labels
   * Endpoint: GET /marketplace/{marketplace_id}/get_hazardous_materials_labels
   * @throws Error if marketplaceId is missing or invalid
   */
  async getHazardousMaterialsLabels(marketplaceId: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    try {
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_hazardous_materials_labels`
      );
    } catch (error) {
      throw new Error(
        `Failed to get hazardous materials labels: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get item condition policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_item_condition_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getItemConditionPolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_item_condition_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get item condition policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get listing structure policies
   * Endpoint: GET /marketplace/{marketplace_id}/get_listing_structure_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getListingStructurePolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_listing_structure_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get listing structure policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get negotiated price policies
   * Endpoint: GET /marketplace/{marketplace_id}/get_negotiated_price_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getNegotiatedPricePolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_negotiated_price_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get negotiated price policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get product safety labels
   * Endpoint: GET /marketplace/{marketplace_id}/get_product_safety_labels
   * @throws Error if marketplaceId is missing or invalid
   */
  async getProductSafetyLabels(marketplaceId: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    try {
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_product_safety_labels`
      );
    } catch (error) {
      throw new Error(
        `Failed to get product safety labels: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get regulatory policies
   * Endpoint: GET /marketplace/{marketplace_id}/get_regulatory_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getRegulatoryPolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_regulatory_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get regulatory policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get return policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_return_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getReturnPolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_return_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get return policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get shipping cost type policies
   * Endpoint: GET /marketplace/{marketplace_id}/get_shipping_cost_type_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getShippingCostTypePolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_shipping_cost_type_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get shipping cost type policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get classified ad policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_classified_ad_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getClassifiedAdPolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_classified_ad_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get classified ad policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get currencies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_currencies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getCurrencies(marketplaceId: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    try {
      return await this.client.get(`${this.basePath}/marketplace/${marketplaceId}/get_currencies`);
    } catch (error) {
      throw new Error(
        `Failed to get currencies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get listing type policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_listing_type_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getListingTypePolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_listing_type_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get listing type policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get motors listing policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_motors_listing_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getMotorsListingPolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_motors_listing_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get motors listing policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get shipping policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_shipping_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getShippingPolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_shipping_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get shipping policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get site visibility policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_site_visibility_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getSiteVisibilityPolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_site_visibility_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get site visibility policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get compatibilities by specification
   * Endpoint: POST /compatibilities/get_compatibilities_by_specification
   * @throws Error if specification is missing or invalid
   */
  async getCompatibilitiesBySpecification(specification: Record<string, unknown>) {
    if (!specification || typeof specification !== 'object') {
      throw new Error('specification is required and must be an object');
    }

    try {
      return await this.client.post(
        `${this.basePath}/compatibilities/get_compatibilities_by_specification`,
        specification
      );
    } catch (error) {
      throw new Error(
        `Failed to get compatibilities by specification: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get compatibility property names
   * Endpoint: POST /compatibilities/get_compatibility_property_names
   * @throws Error if request data is missing or invalid
   */
  async getCompatibilityPropertyNames(data: Record<string, unknown>) {
    if (!data || typeof data !== 'object') {
      throw new Error('data is required and must be an object');
    }

    try {
      return await this.client.post(
        `${this.basePath}/compatibilities/get_compatibility_property_names`,
        data
      );
    } catch (error) {
      throw new Error(
        `Failed to get compatibility property names: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get compatibility property values
   * Endpoint: POST /compatibilities/get_compatibility_property_values
   * @throws Error if request data is missing or invalid
   */
  async getCompatibilityPropertyValues(data: Record<string, unknown>) {
    if (!data || typeof data !== 'object') {
      throw new Error('data is required and must be an object');
    }

    try {
      return await this.client.post(
        `${this.basePath}/compatibilities/get_compatibility_property_values`,
        data
      );
    } catch (error) {
      throw new Error(
        `Failed to get compatibility property values: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get multi compatibility property values
   * Endpoint: POST /compatibilities/get_multi_compatibility_property_values
   * @throws Error if request data is missing or invalid
   */
  async getMultiCompatibilityPropertyValues(data: Record<string, unknown>) {
    if (!data || typeof data !== 'object') {
      throw new Error('data is required and must be an object');
    }

    try {
      return await this.client.post(
        `${this.basePath}/compatibilities/get_multi_compatibility_property_values`,
        data
      );
    } catch (error) {
      throw new Error(
        `Failed to get multi compatibility property values: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get product compatibilities
   * Endpoint: POST /compatibilities/get_product_compatibilities
   * @throws Error if request data is missing or invalid
   */
  async getProductCompatibilities(data: Record<string, unknown>) {
    if (!data || typeof data !== 'object') {
      throw new Error('data is required and must be an object');
    }

    try {
      return await this.client.post(
        `${this.basePath}/compatibilities/get_product_compatibilities`,
        data
      );
    } catch (error) {
      throw new Error(
        `Failed to get product compatibilities: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get sales tax jurisdictions for a country
   * Endpoint: GET /country/{countryCode}/sales_tax_jurisdiction
   * @throws Error if countryCode is missing or invalid
   */
  async getSalesTaxJurisdictions(countryCode: string) {
    if (!countryCode || typeof countryCode !== 'string') {
      throw new Error('countryCode is required and must be a string');
    }

    try {
      return await this.client.get(
        `${this.basePath}/country/${countryCode}/sales_tax_jurisdiction`
      );
    } catch (error) {
      throw new Error(
        `Failed to get sales tax jurisdictions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get product compliance policies
   * Endpoint: GET /marketplace/{marketplace_id}/get_product_compliance_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getProductCompliancePolicies(marketplaceId: string, filter?: string) {
    if (!marketplaceId || typeof marketplaceId !== 'string') {
      throw new Error('marketplaceId is required and must be a string');
    }

    if (filter !== undefined && typeof filter !== 'string') {
      throw new Error('filter must be a string when provided');
    }

    try {
      const params: Record<string, string> = {};
      if (filter) params.filter = filter;
      return await this.client.get(
        `${this.basePath}/marketplace/${marketplaceId}/get_product_compliance_policies`,
        params
      );
    } catch (error) {
      throw new Error(
        `Failed to get product compliance policies: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
