import type { EbayApiClient } from '../client.js';

/**
 * Taxonomy API - Category trees and hierarchies
 * Based on: eBay Commerce Taxonomy API
 */
export class TaxonomyApi {
  private readonly basePath = '/commerce/taxonomy/v1';

  constructor(private client: EbayApiClient) {}

  /**
   * Get the default category tree ID for a marketplace
   */
  async getDefaultCategoryTreeId(marketplaceId: string) {
    return await this.client.get(`${this.basePath}/get_default_category_tree_id`, {
      marketplace_id: marketplaceId,
    });
  }

  /**
   * Get category tree
   */
  async getCategoryTree(categoryTreeId: string) {
    return await this.client.get(`${this.basePath}/category_tree/${categoryTreeId}`);
  }

  /**
   * Get category subtree
   */
  async getCategorySubtree(categoryTreeId: string, categoryId: string) {
    return await this.client.get(
      `${this.basePath}/category_tree/${categoryTreeId}/get_category_subtree`,
      { category_id: categoryId }
    );
  }

  /**
   * Get category suggestions
   */
  async getCategorySuggestions(categoryTreeId: string, query: string) {
    return await this.client.get(
      `${this.basePath}/category_tree/${categoryTreeId}/get_category_suggestions`,
      { q: query }
    );
  }

  /**
   * Get item aspects for category
   */
  async getItemAspectsForCategory(categoryTreeId: string, categoryId: string) {
    return await this.client.get(
      `${this.basePath}/category_tree/${categoryTreeId}/get_item_aspects_for_category`,
      { category_id: categoryId }
    );
  }

  /**
   * Get compatibility properties
   */
  async getCompatibilityProperties(categoryTreeId: string, categoryId: string) {
    return await this.client.get(
      `${this.basePath}/category_tree/${categoryTreeId}/get_compatibility_properties`,
      { category_id: categoryId }
    );
  }

  /**
   * Get compatibility property values
   */
  async getCompatibilityPropertyValues(
    categoryTreeId: string,
    categoryId: string,
    compatibilityProperty: string
  ) {
    return await this.client.get(
      `${this.basePath}/category_tree/${categoryTreeId}/get_compatibility_property_values`,
      {
        category_id: categoryId,
        compatibility_property: compatibilityProperty,
      }
    );
  }
}
