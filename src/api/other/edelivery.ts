import type { EbayApiClient } from '../client.js';

/**
 * eDelivery API - International shipping eDelivery
 * Based on: docs/sell-apps/other-apis/sell_edelivery_international_shipping_oas3.json
 */
export class EDeliveryApi {
  private readonly basePath = '/sell/logistics/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Create shipping quote
   */
  async createShippingQuote(shippingQuoteRequest: Record<string, unknown>) {
    return await this.client.post(`${this.basePath}/shipping_quote`, shippingQuoteRequest);
  }

  /**
   * Get shipping quote
   */
  async getShippingQuote(shippingQuoteId: string) {
    return await this.client.get(`${this.basePath}/shipping_quote/${shippingQuoteId}`);
  }

  // ==================== Cost & Preferences ====================

  /**
   * Get actual costs for shipped packages
   * Endpoint: GET /actual_costs
   */
  async getActualCosts(params?: Record<string, string>) {
    return await this.client.get(`${this.basePath}/actual_costs`, params);
  }

  /**
   * Get address preferences
   * Endpoint: GET /address_preference
   */
  async getAddressPreferences() {
    return await this.client.get(`${this.basePath}/address_preference`);
  }

  /**
   * Create address preference
   * Endpoint: POST /address_preference
   */
  async createAddressPreference(addressPreference: Record<string, unknown>) {
    return await this.client.post(`${this.basePath}/address_preference`, addressPreference);
  }

  /**
   * Get consign preferences
   * Endpoint: GET /consign_preference
   */
  async getConsignPreferences() {
    return await this.client.get(`${this.basePath}/consign_preference`);
  }

  /**
   * Create consign preference
   * Endpoint: POST /consign_preference
   */
  async createConsignPreference(consignPreference: Record<string, unknown>) {
    return await this.client.post(`${this.basePath}/consign_preference`, consignPreference);
  }

  // ==================== Agents & Services ====================

  /**
   * Get available shipping agents
   * Endpoint: GET /agents
   */
  async getAgents(params?: Record<string, string>) {
    return await this.client.get(`${this.basePath}/agents`, params);
  }

  /**
   * Get battery qualifications
   * Endpoint: GET /battery_qualifications
   */
  async getBatteryQualifications(params?: Record<string, string>) {
    return await this.client.get(`${this.basePath}/battery_qualifications`, params);
  }

  /**
   * Get dropoff sites
   * Endpoint: GET /dropoff_sites
   */
  async getDropoffSites(params: Record<string, string>) {
    return await this.client.get(`${this.basePath}/dropoff_sites`, params);
  }

  /**
   * Get available shipping services
   * Endpoint: GET /services
   */
  async getShippingServices(params?: Record<string, string>) {
    return await this.client.get(`${this.basePath}/services`, params);
  }

  // ==================== Bundles ====================

  /**
   * Create a bundle of packages
   * Endpoint: POST /bundle
   */
  async createBundle(bundleRequest: Record<string, unknown>) {
    return await this.client.post(`${this.basePath}/bundle`, bundleRequest);
  }

  /**
   * Get bundle by ID
   * Endpoint: GET /bundle/{bundle_id}
   */
  async getBundle(bundleId: string) {
    return await this.client.get(`${this.basePath}/bundle/${bundleId}`);
  }

  /**
   * Cancel a bundle
   * Endpoint: POST /bundle/{bundle_id}/cancel
   */
  async cancelBundle(bundleId: string) {
    return await this.client.post(`${this.basePath}/bundle/${bundleId}/cancel`, {});
  }

  /**
   * Get bundle label
   * Endpoint: GET /bundle/{bundle_id}/label
   */
  async getBundleLabel(bundleId: string) {
    return await this.client.get(`${this.basePath}/bundle/${bundleId}/label`);
  }

  // ==================== Packages (Single) ====================

  /**
   * Create a package
   * Endpoint: POST /package
   */
  async createPackage(packageRequest: Record<string, unknown>) {
    return await this.client.post(`${this.basePath}/package`, packageRequest);
  }

  /**
   * Get package by ID
   * Endpoint: GET /package/{package_id}
   */
  async getPackage(packageId: string) {
    return await this.client.get(`${this.basePath}/package/${packageId}`);
  }

  /**
   * Delete a package
   * Endpoint: DELETE /package/{package_id}
   */
  async deletePackage(packageId: string) {
    return await this.client.delete(`${this.basePath}/package/${packageId}`);
  }

  /**
   * Get package by order line item
   * Endpoint: GET /package/{order_line_item_id}/item
   */
  async getPackageByOrderLineItem(orderLineItemId: string) {
    return await this.client.get(`${this.basePath}/package/${orderLineItemId}/item`);
  }

  /**
   * Cancel a package
   * Endpoint: POST /package/{package_id}/cancel
   */
  async cancelPackage(packageId: string) {
    return await this.client.post(`${this.basePath}/package/${packageId}/cancel`, {});
  }

  /**
   * Clone a package
   * Endpoint: POST /package/{package_id}/clone
   */
  async clonePackage(packageId: string) {
    return await this.client.post(`${this.basePath}/package/${packageId}/clone`, {});
  }

  /**
   * Confirm a package
   * Endpoint: POST /package/{package_id}/confirm
   */
  async confirmPackage(packageId: string) {
    return await this.client.post(`${this.basePath}/package/${packageId}/confirm`, {});
  }

  // ==================== Packages (Bulk) ====================

  /**
   * Bulk cancel packages
   * Endpoint: POST /package/bulk_cancel_packages
   */
  async bulkCancelPackages(bulkCancelRequest: Record<string, unknown>) {
    return await this.client.post(
      `${this.basePath}/package/bulk_cancel_packages`,
      bulkCancelRequest
    );
  }

  /**
   * Bulk confirm packages
   * Endpoint: POST /package/bulk_confirm_packages
   */
  async bulkConfirmPackages(bulkConfirmRequest: Record<string, unknown>) {
    return await this.client.post(
      `${this.basePath}/package/bulk_confirm_packages`,
      bulkConfirmRequest
    );
  }

  /**
   * Bulk delete packages
   * Endpoint: POST /package/bulk_delete_packages
   */
  async bulkDeletePackages(bulkDeleteRequest: Record<string, unknown>) {
    return await this.client.post(
      `${this.basePath}/package/bulk_delete_packages`,
      bulkDeleteRequest
    );
  }

  // ==================== Labels & Tracking ====================

  /**
   * Get labels
   * Endpoint: GET /labels
   */
  async getLabels(params?: Record<string, string>) {
    return await this.client.get(`${this.basePath}/labels`, params);
  }

  /**
   * Get handover sheet
   * Endpoint: GET /handover_sheet
   */
  async getHandoverSheet(params?: Record<string, string>) {
    return await this.client.get(`${this.basePath}/handover_sheet`, params);
  }

  /**
   * Get tracking information
   * Endpoint: GET /tracking
   */
  async getTracking(params: Record<string, string>) {
    return await this.client.get(`${this.basePath}/tracking`, params);
  }

  // ==================== Other ====================

  /**
   * Create a complaint
   * Endpoint: POST /complaint
   */
  async createComplaint(complaintRequest: Record<string, unknown>) {
    return await this.client.post(`${this.basePath}/complaint`, complaintRequest);
  }
}
