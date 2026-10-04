import { z } from 'zod';
import { MarketplaceId } from '@/types/ebayEnums.js';
import { shippingMetadataInputSchema } from '@/schemas/metadata/shipping.js';
import { defineTool } from '@/tools/defineTool.js';
import type { ToolEntry } from '@/tools/registry.js';
import { Effect } from 'effect';

const SHIPPING_LANGUAGE_NOTE =
  'Set acceptLanguage to fr-CA (EBAY_CA), fr-BE or nl-BE (EBAY_BE) to localize the metadata for the French Canada and Belgian marketplaces. Use the returned values when configuring fulfillment policies (ebay_create_fulfillment_policy).';

/** Marketplace-scoped metadata request with an optional category filter. */
const marketplaceMetadataSchema = z.object({
  marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
  filter: z.string().optional().describe('Filter criteria'),
});

/** Marketplace-scoped metadata request with no filter parameter. */
const marketplaceOnlyMetadataSchema = z.object({
  marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
});

/** Metadata compatibility property filter from the generated request bodies. */
const propertyFilterSchema = z
  .object({
    propertyName: z.string().optional().describe('Compatibility property name'),
    propertyValue: z.string().optional().describe('Compatibility property value'),
    unitOfMeasurement: z.string().optional().describe('Property unit of measurement'),
    url: z.string().optional().describe('Property reference URL'),
  })
  .passthrough();

/** Pagination input accepted by generated Metadata compatibility requests. */
const paginationInputSchema = z
  .object({
    limit: z.number().optional().describe('Maximum number of results'),
    offset: z.number().optional().describe('Number of results to skip'),
  })
  .passthrough();

/** Sort order item accepted by generated Metadata compatibility requests. */
const sortOrderSchema = z
  .object({
    sortOrder: z
      .object({
        order: z.string().optional().describe('Sort order'),
        propertyName: z.string().optional().describe('Property name to sort by'),
      })
      .passthrough()
      .optional()
      .describe('Sort property definition'),
    sortPriority: z.string().optional().describe('Sort priority'),
  })
  .passthrough();

/** Product identifier accepted by getProductCompatibilities. */
const productIdentifierSchema = z
  .object({
    ean: z.string().optional().describe('EAN product identifier'),
    epid: z.string().optional().describe('eBay product identifier'),
    isbn: z.string().optional().describe('ISBN product identifier'),
    productId: z.string().optional().describe('Product identifier'),
    upc: z.string().optional().describe('UPC product identifier'),
  })
  .passthrough();

/** Product disabled filter accepted by getProductCompatibilities. */
const disabledProductFilterSchema = z
  .object({
    excludeForEbayReviews: z.boolean().optional().describe('Exclude products blocked for reviews'),
    excludeForEbaySelling: z.boolean().optional().describe('Exclude products blocked for selling'),
  })
  .passthrough();

/** Generated SpecificationRequest shape for getCompatibilitiesBySpecification. */
const specificationRequestSchema = z
  .object({
    categoryId: z.string().optional().describe('eBay leaf category ID'),
    compatibilityPropertyFilters: z
      .array(propertyFilterSchema)
      .optional()
      .describe('Compatibility property filters'),
    dataset: z.string().optional().describe('Dataset to return'),
    datasetPropertyName: z.array(z.string()).optional().describe('Specific dataset property names'),
    exactMatch: z.boolean().optional().describe('Return only exact specification matches'),
    paginationInput: paginationInputSchema.optional().describe('Pagination input'),
    sortOrders: z.array(sortOrderSchema).optional().describe('Compatibility property sort order'),
    specifications: z.array(propertyFilterSchema).optional().describe('Part specifications'),
  })
  .passthrough();

/** Generated PropertyNamesRequest shape for getCompatibilityPropertyNames. */
const propertyNamesRequestSchema = z
  .object({
    categoryId: z.string().optional().describe('eBay leaf category ID'),
    dataset: z.array(z.string()).optional().describe('Datasets to return'),
  })
  .passthrough();

/** Generated PropertyValuesRequest shape for getCompatibilityPropertyValues. */
const propertyValuesRequestSchema = z
  .object({
    categoryId: z.string().optional().describe('eBay leaf category ID'),
    propertyFilters: z.array(propertyFilterSchema).optional().describe('Property filters'),
    propertyName: z.string().optional().describe('Property name whose values should be returned'),
    sortOrder: z.string().optional().describe('Property value sort order'),
  })
  .passthrough();

/** Generated MultiCompatibilityPropertyValuesRequest shape. */
const multiCompatibilityPropertyValuesDataSchema = z
  .object({
    categoryId: z.string().optional().describe('eBay leaf category ID'),
    propertyFilters: z.array(propertyFilterSchema).optional().describe('Property filters'),
    propertyNames: z.array(z.string()).optional().describe('Property names'),
  })
  .passthrough();

/** Generated ProductRequest shape for getProductCompatibilities. */
const productRequestSchema = z
  .object({
    applicationPropertyFilters: z
      .array(propertyFilterSchema)
      .optional()
      .describe('Application property filters'),
    dataset: z.array(z.string()).optional().describe('Datasets to return'),
    datasetPropertyName: z.array(z.string()).optional().describe('Dataset property names'),
    disabledProductFilter: disabledProductFilterSchema
      .optional()
      .describe('Disabled product filter'),
    paginationInput: paginationInputSchema.optional().describe('Pagination input'),
    productIdentifier: productIdentifierSchema.optional().describe('Product identifier'),
    sortOrders: z.array(sortOrderSchema).optional().describe('Compatibility property sort order'),
  })
  .passthrough();

/** Compatibility metadata request carrying the required marketplace header value. */
const compatibilitySpecificationRequestSchema = z.object({
  marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
  specification: specificationRequestSchema.describe('Compatibility specification object'),
});

/** Compatibility property-name request carrying the required marketplace header value. */
const compatibilityPropertyNamesRequestSchema = z.object({
  marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
  data: propertyNamesRequestSchema.describe('Compatibility property-name request data'),
});

/** Compatibility property-value request carrying the required marketplace header value. */
const compatibilityPropertyValuesRequestSchema = z.object({
  marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
  data: propertyValuesRequestSchema.describe('Compatibility property-value request data'),
});

/** Multi-property compatibility value request carrying the required marketplace header value. */
const multiCompatibilityPropertyValuesRequestSchema = z.object({
  marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
  data: multiCompatibilityPropertyValuesDataSchema.describe('Multi-property values request data'),
});

/** Product compatibility request carrying the required marketplace header value. */
const productCompatibilityRequestSchema = z.object({
  marketplaceId: z.nativeEnum(MarketplaceId).describe('Marketplace ID'),
  data: productRequestSchema.describe('Product compatibility request data'),
});

/** Sales-tax jurisdiction request by country code. */
const salesTaxJurisdictionsSchema = z.object({
  countryCode: z.string().describe('Country code (e.g., US)'),
});

/** Metadata API tools for marketplace, business policy, and sales tax metadata. */
export const metadataEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_automotive_parts_compatibility_policies',
    description: 'Get automotive parts compatibility policies for a marketplace',
    inputSchema: marketplaceMetadataSchema.shape,
    handler: (api, args) =>
      Effect.runPromise(api.metadata.getAutomotivePartsCompatibilityPolicies(args)),
  }),
  defineTool({
    name: 'ebay_get_category_policies',
    description: 'Get category policies for a marketplace',
    inputSchema: marketplaceMetadataSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getCategoryPolicies(args)),
  }),
  defineTool({
    name: 'ebay_get_extended_producer_responsibility_policies',
    description: 'Get extended producer responsibility policies for a marketplace',
    inputSchema: marketplaceMetadataSchema.shape,
    handler: (api, args) =>
      Effect.runPromise(api.metadata.getExtendedProducerResponsibilityPolicies(args)),
  }),
  defineTool({
    name: 'ebay_get_hazardous_materials_labels',
    description: 'Get hazardous materials labels for a marketplace',
    inputSchema: marketplaceOnlyMetadataSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getHazardousMaterialsLabels(args)),
  }),
  defineTool({
    name: 'ebay_get_item_condition_policies',
    description: 'Get item condition policies for a marketplace',
    inputSchema: marketplaceMetadataSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getItemConditionPolicies(args)),
  }),
  defineTool({
    name: 'ebay_get_listing_structure_policies',
    description: 'Get listing structure policies for a marketplace',
    inputSchema: marketplaceMetadataSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getListingStructurePolicies(args)),
  }),
  defineTool({
    name: 'ebay_get_negotiated_price_policies',
    description: 'Get negotiated price policies for a marketplace',
    inputSchema: marketplaceMetadataSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getNegotiatedPricePolicies(args)),
  }),
  defineTool({
    name: 'ebay_get_product_safety_labels',
    description: 'Get product safety labels for a marketplace',
    inputSchema: marketplaceOnlyMetadataSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getProductSafetyLabels(args)),
  }),
  defineTool({
    name: 'ebay_get_regulatory_policies',
    description: 'Get regulatory policies for a marketplace',
    inputSchema: marketplaceMetadataSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getRegulatoryPolicies(args)),
  }),
  defineTool({
    name: 'ebay_get_return_policy_metadata',
    description:
      'Get marketplace return policy requirements and guidelines. Returns eBay policies that define whether return policies are required for categories and the guidelines for creating domestic and international return policies.',
    inputSchema: marketplaceMetadataSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getReturnPolicies(args)),
  }),
  defineTool({
    name: 'ebay_get_classified_ad_policies',
    description: 'Get classified ad policies for a marketplace',
    inputSchema: marketplaceMetadataSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getClassifiedAdPolicies(args)),
  }),
  defineTool({
    name: 'ebay_get_currencies',
    description: 'Get currencies for a marketplace',
    inputSchema: marketplaceOnlyMetadataSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getCurrencies(args)),
  }),
  defineTool({
    name: 'ebay_get_listing_type_policies',
    description: 'Get listing type policies for a marketplace',
    inputSchema: marketplaceMetadataSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getListingTypePolicies(args)),
  }),
  defineTool({
    name: 'ebay_get_motors_listing_policies',
    description: 'Get motors listing policies for a marketplace',
    inputSchema: marketplaceMetadataSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getMotorsListingPolicies(args)),
  }),
  defineTool({
    name: 'ebay_get_shipping_policies',
    description: 'Get shipping policies for a marketplace',
    inputSchema: marketplaceMetadataSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getShippingPolicies(args)),
  }),
  defineTool({
    name: 'ebay_get_site_visibility_policies',
    description: 'Get site visibility policies for a marketplace',
    inputSchema: marketplaceMetadataSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getSiteVisibilityPolicies(args)),
  }),
  defineTool({
    name: 'ebay_get_exclude_shipping_locations',
    description: `Metadata API: list the regions, countries and special locations (e.g. PO Box, APO/FPO) a seller can exclude from shipping on a marketplace. ${SHIPPING_LANGUAGE_NOTE}`,
    inputSchema: shippingMetadataInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.metadata.getExcludeShippingLocations(args)),
  }),
  defineTool({
    name: 'ebay_get_handling_times',
    description: `Metadata API: list the handling times (maximum business days to ship after cleared payment, flagged when extended) a marketplace allows. ${SHIPPING_LANGUAGE_NOTE}`,
    inputSchema: shippingMetadataInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.metadata.getHandlingTimes(args)),
  }),
  defineTool({
    name: 'ebay_get_shipping_carriers',
    description: `Metadata API: list the shipping carriers supported on a marketplace. Each shippingCarrier value is the enum to use when supplying shipment tracking. ${SHIPPING_LANGUAGE_NOTE}`,
    inputSchema: shippingMetadataInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.metadata.getShippingCarriers(args)),
  }),
  defineTool({
    name: 'ebay_get_shipping_locations',
    description: `Metadata API: list the regions, countries and special locations a seller can ship to on a marketplace. ${SHIPPING_LANGUAGE_NOTE}`,
    inputSchema: shippingMetadataInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.metadata.getShippingLocations(args)),
  }),
  defineTool({
    name: 'ebay_get_shipping_services',
    description: `Metadata API: list the shipping services available on a marketplace with carrier, category, domestic/international flag, shipping times, cost types and package limits. Only services with validForSellingFlow=true can be used in listings or fulfillment policies. ${SHIPPING_LANGUAGE_NOTE}`,
    inputSchema: shippingMetadataInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.metadata.getShippingServices(args)),
  }),
  defineTool({
    name: 'ebay_get_compatibilities_by_specification',
    description: 'Get compatibilities by specification',
    inputSchema: compatibilitySpecificationRequestSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getCompatibilitiesBySpecification(args)),
  }),
  defineTool({
    name: 'ebay_get_compatibility_property_names',
    description: 'Get compatibility property names',
    inputSchema: compatibilityPropertyNamesRequestSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getCompatibilityPropertyNames(args)),
  }),
  defineTool({
    name: 'ebay_get_compatibility_property_values',
    description: 'Get compatibility property values',
    inputSchema: compatibilityPropertyValuesRequestSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getCompatibilityPropertyValues(args)),
  }),
  defineTool({
    name: 'ebay_get_multi_compatibility_property_values',
    description: 'Get multiple compatibility property values',
    inputSchema: multiCompatibilityPropertyValuesRequestSchema.shape,
    handler: (api, args) =>
      Effect.runPromise(api.metadata.getMultiCompatibilityPropertyValues(args)),
  }),
  defineTool({
    name: 'ebay_get_product_compatibilities',
    description: 'Get product compatibilities',
    inputSchema: productCompatibilityRequestSchema.shape,
    handler: (api, args) => Effect.runPromise(api.metadata.getProductCompatibilities(args)),
  }),
  defineTool({
    name: 'ebay_get_sales_tax_jurisdictions',
    description: 'Get sales tax jurisdictions for a country',
    inputSchema: salesTaxJurisdictionsSchema.shape,
    outputSchema: {
      type: 'object',
      properties: {},
      description: 'Success response',
    },
    handler: (api, args) => Effect.runPromise(api.metadata.getSalesTaxJurisdictions(args)),
  }),
];
