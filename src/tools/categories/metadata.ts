import { z } from 'zod';
import { MarketplaceId } from '@/types/ebay-enums.js';
import { defineTool } from '@/tools/define-tool.js';
import type { ToolEntry } from '@/tools/registry.js';
import { compatibilityDataSchema, compatibilitySpecificationSchema } from '@/tools/schemas.js';

/** Metadata API tools for marketplace, business policy, and sales tax metadata. */
export const metadataEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_automotive_parts_compatibility_policies',
    description: 'Get automotive parts compatibility policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
    handler: (api, args) =>
      api.metadata.getAutomotivePartsCompatibilityPolicies(args.marketplaceId, args.filter),
  }),
  defineTool({
    name: 'ebay_get_category_policies',
    description: 'Get category policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
    handler: (api, args) => api.metadata.getCategoryPolicies(args.marketplaceId, args.filter),
  }),
  defineTool({
    name: 'ebay_get_extended_producer_responsibility_policies',
    description: 'Get extended producer responsibility policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
    handler: (api, args) =>
      api.metadata.getExtendedProducerResponsibilityPolicies(args.marketplaceId, args.filter),
  }),
  defineTool({
    name: 'ebay_get_hazardous_materials_labels',
    description: 'Get hazardous materials labels for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
    },
    handler: (api, args) => api.metadata.getHazardousMaterialsLabels(args.marketplaceId),
  }),
  defineTool({
    name: 'ebay_get_item_condition_policies',
    description: 'Get item condition policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
    handler: (api, args) => api.metadata.getItemConditionPolicies(args.marketplaceId, args.filter),
  }),
  defineTool({
    name: 'ebay_get_listing_structure_policies',
    description: 'Get listing structure policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
    handler: (api, args) =>
      api.metadata.getListingStructurePolicies(args.marketplaceId, args.filter),
  }),
  defineTool({
    name: 'ebay_get_negotiated_price_policies',
    description: 'Get negotiated price policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
    handler: (api, args) =>
      api.metadata.getNegotiatedPricePolicies(args.marketplaceId, args.filter),
  }),
  defineTool({
    name: 'ebay_get_product_safety_labels',
    description: 'Get product safety labels for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
    },
    handler: (api, args) => api.metadata.getProductSafetyLabels(args.marketplaceId),
  }),
  defineTool({
    name: 'ebay_get_regulatory_policies',
    description: 'Get regulatory policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
    handler: (api, args) => api.metadata.getRegulatoryPolicies(args.marketplaceId, args.filter),
  }),
  defineTool({
    name: 'ebay_get_return_policy_metadata',
    description:
      'Get marketplace return policy requirements and guidelines. Returns eBay policies that define whether return policies are required for categories and the guidelines for creating domestic and international return policies.',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z
        .string()
        .optional()
        .describe('Filter criteria to limit results to specific category IDs'),
    },
    handler: (api, args) => api.metadata.getReturnPolicies(args.marketplaceId, args.filter),
  }),
  defineTool({
    name: 'ebay_get_shipping_cost_type_policies',
    description: 'Get shipping cost type policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
    handler: (api, args) =>
      api.metadata.getShippingCostTypePolicies(args.marketplaceId, args.filter),
  }),
  defineTool({
    name: 'ebay_get_classified_ad_policies',
    description: 'Get classified ad policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
    handler: (api, args) => api.metadata.getClassifiedAdPolicies(args.marketplaceId, args.filter),
  }),
  defineTool({
    name: 'ebay_get_currencies',
    description: 'Get currencies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
    },
    handler: (api, args) => api.metadata.getCurrencies(args.marketplaceId),
  }),
  defineTool({
    name: 'ebay_get_listing_type_policies',
    description: 'Get listing type policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
    handler: (api, args) => api.metadata.getListingTypePolicies(args.marketplaceId, args.filter),
  }),
  defineTool({
    name: 'ebay_get_motors_listing_policies',
    description: 'Get motors listing policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
    handler: (api, args) => api.metadata.getMotorsListingPolicies(args.marketplaceId, args.filter),
  }),
  defineTool({
    name: 'ebay_get_shipping_policies',
    description: 'Get shipping policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
    handler: (api, args) => api.metadata.getShippingPolicies(args.marketplaceId, args.filter),
  }),
  defineTool({
    name: 'ebay_get_site_visibility_policies',
    description: 'Get site visibility policies for a marketplace',
    inputSchema: {
      marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
      filter: z.string().optional().describe('Filter criteria'),
    },
    handler: (api, args) => api.metadata.getSiteVisibilityPolicies(args.marketplaceId, args.filter),
  }),
  defineTool({
    name: 'ebay_get_compatibilities_by_specification',
    description: 'Get compatibilities by specification',
    inputSchema: {
      specification: compatibilitySpecificationSchema.describe(
        'Compatibility specification object',
      ),
    },
    handler: (api, args) => api.metadata.getCompatibilitiesBySpecification(args.specification),
  }),
  defineTool({
    name: 'ebay_get_compatibility_property_names',
    description: 'Get compatibility property names',
    inputSchema: {
      data: compatibilityDataSchema.describe(
        'Request data for getting compatibility property names',
      ),
    },
    handler: (api, args) => api.metadata.getCompatibilityPropertyNames(args.data),
  }),
  defineTool({
    name: 'ebay_get_compatibility_property_values',
    description: 'Get compatibility property values',
    inputSchema: {
      data: compatibilityDataSchema.describe(
        'Request data for getting compatibility property values',
      ),
    },
    handler: (api, args) => api.metadata.getCompatibilityPropertyValues(args.data),
  }),
  defineTool({
    name: 'ebay_get_multi_compatibility_property_values',
    description: 'Get multiple compatibility property values',
    inputSchema: {
      data: compatibilityDataSchema.describe(
        'Request data for getting multi compatibility property values',
      ),
    },
    handler: (api, args) => api.metadata.getMultiCompatibilityPropertyValues(args.data),
  }),
  defineTool({
    name: 'ebay_get_product_compatibilities',
    description: 'Get product compatibilities',
    inputSchema: {
      data: compatibilityDataSchema.describe('Request data for getting product compatibilities'),
    },
    handler: (api, args) => api.metadata.getProductCompatibilities(args.data),
  }),
  defineTool({
    name: 'ebay_get_sales_tax_jurisdictions',
    description: 'Get sales tax jurisdictions for a country',
    inputSchema: {
      countryCode: z.string().describe('Country code (e.g., US)'),
    },
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Success response',
    },
    handler: (api, args) => api.metadata.getSalesTaxJurisdictions(args.countryCode),
  }),
];
