import type { EbayApiClient } from '@/api/client.js';
import {
  buildOptionalStringParams,
  requireObject,
  requireString,
  withApiError,
} from '@/api/shared/request.js';

/**
 * Metadata API - Marketplace policies and configurations
 * Based on: docs/sell-apps/listing-metadata/sell_metadata_v1_oas3.json
 */
export class MetadataApi {
  private readonly basePath = '/sell/metadata/v1';

  constructor(private client: EbayApiClient) {}

  private async getMarketplacePolicy(
    endpoint: string,
    marketplaceId: string,
    failureMessage: string,
  ): Promise<unknown> {
    requireString(marketplaceId, 'marketplaceId');
    const path = `${this.basePath}/marketplace/${marketplaceId}/${endpoint}`;

    return await withApiError(failureMessage, () => this.client.get(path));
  }

  private async getFilteredMarketplacePolicy(
    endpoint: string,
    marketplaceId: string,
    failureMessage: string,
    filter?: string,
  ): Promise<unknown> {
    requireString(marketplaceId, 'marketplaceId');
    const params = buildOptionalStringParams({ filter });
    const path = `${this.basePath}/marketplace/${marketplaceId}/${endpoint}`;

    return await withApiError(failureMessage, () => this.client.get(path, params));
  }

  /**
   * Get automotive parts compatibility policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_automotive_parts_compatibility_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getAutomotivePartsCompatibilityPolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_automotive_parts_compatibility_policies',
      marketplaceId,
      'Failed to get automotive parts compatibility policies',
      filter,
    );
  }

  /**
   * Get category policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_category_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getCategoryPolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_category_policies',
      marketplaceId,
      'Failed to get category policies',
      filter,
    );
  }

  /**
   * Get extended producer responsibility policies
   * Endpoint: GET /marketplace/{marketplace_id}/get_extended_producer_responsibility_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getExtendedProducerResponsibilityPolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_extended_producer_responsibility_policies',
      marketplaceId,
      'Failed to get extended producer responsibility policies',
      filter,
    );
  }

  /**
   * Get hazardous materials labels
   * Endpoint: GET /marketplace/{marketplace_id}/get_hazardous_materials_labels
   * @throws Error if marketplaceId is missing or invalid
   */
  async getHazardousMaterialsLabels(marketplaceId: string) {
    return await this.getMarketplacePolicy(
      'get_hazardous_materials_labels',
      marketplaceId,
      'Failed to get hazardous materials labels',
    );
  }

  /**
   * Get item condition policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_item_condition_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getItemConditionPolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_item_condition_policies',
      marketplaceId,
      'Failed to get item condition policies',
      filter,
    );
  }

  /**
   * Get listing structure policies
   * Endpoint: GET /marketplace/{marketplace_id}/get_listing_structure_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getListingStructurePolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_listing_structure_policies',
      marketplaceId,
      'Failed to get listing structure policies',
      filter,
    );
  }

  /**
   * Get negotiated price policies
   * Endpoint: GET /marketplace/{marketplace_id}/get_negotiated_price_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getNegotiatedPricePolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_negotiated_price_policies',
      marketplaceId,
      'Failed to get negotiated price policies',
      filter,
    );
  }

  /**
   * Get product safety labels
   * Endpoint: GET /marketplace/{marketplace_id}/get_product_safety_labels
   * @throws Error if marketplaceId is missing or invalid
   */
  async getProductSafetyLabels(marketplaceId: string) {
    return await this.getMarketplacePolicy(
      'get_product_safety_labels',
      marketplaceId,
      'Failed to get product safety labels',
    );
  }

  /**
   * Get regulatory policies
   * Endpoint: GET /marketplace/{marketplace_id}/get_regulatory_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getRegulatoryPolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_regulatory_policies',
      marketplaceId,
      'Failed to get regulatory policies',
      filter,
    );
  }

  /**
   * Get return policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_return_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getReturnPolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_return_policies',
      marketplaceId,
      'Failed to get return policies',
      filter,
    );
  }

  /**
   * Get shipping cost type policies
   * Endpoint: GET /marketplace/{marketplace_id}/get_shipping_cost_type_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getShippingCostTypePolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_shipping_cost_type_policies',
      marketplaceId,
      'Failed to get shipping cost type policies',
      filter,
    );
  }

  /**
   * Get classified ad policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_classified_ad_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getClassifiedAdPolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_classified_ad_policies',
      marketplaceId,
      'Failed to get classified ad policies',
      filter,
    );
  }

  /**
   * Get currencies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_currencies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getCurrencies(marketplaceId: string) {
    return await this.getMarketplacePolicy(
      'get_currencies',
      marketplaceId,
      'Failed to get currencies',
    );
  }

  /**
   * Get listing type policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_listing_type_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getListingTypePolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_listing_type_policies',
      marketplaceId,
      'Failed to get listing type policies',
      filter,
    );
  }

  /**
   * Get motors listing policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_motors_listing_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getMotorsListingPolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_motors_listing_policies',
      marketplaceId,
      'Failed to get motors listing policies',
      filter,
    );
  }

  /**
   * Get shipping policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_shipping_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getShippingPolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_shipping_policies',
      marketplaceId,
      'Failed to get shipping policies',
      filter,
    );
  }

  /**
   * Get site visibility policies for a marketplace
   * Endpoint: GET /marketplace/{marketplace_id}/get_site_visibility_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getSiteVisibilityPolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_site_visibility_policies',
      marketplaceId,
      'Failed to get site visibility policies',
      filter,
    );
  }

  /**
   * Get compatibilities by specification
   * Endpoint: POST /compatibilities/get_compatibilities_by_specification
   * @throws Error if specification is missing or invalid
   */
  async getCompatibilitiesBySpecification(specification: Record<string, unknown>) {
    requireObject(specification, 'specification');

    return await withApiError('Failed to get compatibilities by specification', () =>
      this.client.post(
        `${this.basePath}/compatibilities/get_compatibilities_by_specification`,
        specification,
      ),
    );
  }

  /**
   * Get compatibility property names
   * Endpoint: POST /compatibilities/get_compatibility_property_names
   * @throws Error if request data is missing or invalid
   */
  async getCompatibilityPropertyNames(data: Record<string, unknown>) {
    requireObject(data, 'data');

    return await withApiError('Failed to get compatibility property names', () =>
      this.client.post(`${this.basePath}/compatibilities/get_compatibility_property_names`, data),
    );
  }

  /**
   * Get compatibility property values
   * Endpoint: POST /compatibilities/get_compatibility_property_values
   * @throws Error if request data is missing or invalid
   */
  async getCompatibilityPropertyValues(data: Record<string, unknown>) {
    requireObject(data, 'data');

    return await withApiError('Failed to get compatibility property values', () =>
      this.client.post(`${this.basePath}/compatibilities/get_compatibility_property_values`, data),
    );
  }

  /**
   * Get multi compatibility property values
   * Endpoint: POST /compatibilities/get_multi_compatibility_property_values
   * @throws Error if request data is missing or invalid
   */
  async getMultiCompatibilityPropertyValues(data: Record<string, unknown>) {
    requireObject(data, 'data');

    return await withApiError('Failed to get multi compatibility property values', () =>
      this.client.post(
        `${this.basePath}/compatibilities/get_multi_compatibility_property_values`,
        data,
      ),
    );
  }

  /**
   * Get product compatibilities
   * Endpoint: POST /compatibilities/get_product_compatibilities
   * @throws Error if request data is missing or invalid
   */
  async getProductCompatibilities(data: Record<string, unknown>) {
    requireObject(data, 'data');

    return await withApiError('Failed to get product compatibilities', () =>
      this.client.post(`${this.basePath}/compatibilities/get_product_compatibilities`, data),
    );
  }

  /**
   * Get sales tax jurisdictions for a country
   * Endpoint: GET /country/{countryCode}/sales_tax_jurisdiction
   * @throws Error if countryCode is missing or invalid
   */
  async getSalesTaxJurisdictions(countryCode: string) {
    requireString(countryCode, 'countryCode');

    return await withApiError('Failed to get sales tax jurisdictions', () =>
      this.client.get(`${this.basePath}/country/${countryCode}/sales_tax_jurisdiction`),
    );
  }

  /**
   * Get product compliance policies
   * Endpoint: GET /marketplace/{marketplace_id}/get_product_compliance_policies
   * @throws Error if marketplaceId is missing or invalid
   */
  async getProductCompliancePolicies(marketplaceId: string, filter?: string) {
    return await this.getFilteredMarketplacePolicy(
      'get_product_compliance_policies',
      marketplaceId,
      'Failed to get product compliance policies',
      filter,
    );
  }
}
