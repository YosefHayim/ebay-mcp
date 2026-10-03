import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { MetadataApi, compatibilityHeaders } from '@/api/listing-metadata/metadata.js';
import { invalidInput } from '@tests/helpers/invalidInput.js';
import { Effect } from 'effect';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('MetadataApi', () => {
  let api: MetadataApi;
  let mockClient: EbayApiClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as EbayApiClient;

    api = new MetadataApi(mockClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('marketplace policy endpoints', () => {
    it('gets automotive parts compatibility policies without a filter', async () => {
      const response = { compatibilityPolicies: [{ policyId: '1', categoryId: '100' }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getAutomotivePartsCompatibilityPolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_automotive_parts_compatibility_policies',
      );
      expect(result).toEqual(response);
    });

    it('gets automotive parts compatibility policies with a category filter', async () => {
      const response = { compatibilityPolicies: [] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getAutomotivePartsCompatibilityPolicies({
          marketplaceId: 'EBAY_US',
          filter: 'categoryIds:{12345}',
        }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_automotive_parts_compatibility_policies',
        { filter: 'categoryIds:{12345}' },
      );
      expect(result).toEqual(response);
    });

    it('rejects invalid marketplace and filter input before requesting automotive policies', async () => {
      const missingMarketplace = await Effect.runPromise(
        Effect.flip(
          api.getAutomotivePartsCompatibilityPolicies(invalidInput({ marketplaceId: '' })),
        ),
      );
      const invalidMarketplace = await Effect.runPromise(
        Effect.flip(
          api.getAutomotivePartsCompatibilityPolicies(invalidInput({ marketplaceId: 123 })),
        ),
      );
      const invalidFilter = await Effect.runPromise(
        Effect.flip(
          api.getAutomotivePartsCompatibilityPolicies(
            invalidInput({ marketplaceId: 'EBAY_US', filter: 123 }),
          ),
        ),
      );

      expect(missingMarketplace._tag).toBe('EndpointInputError');
      expect(missingMarketplace.parameter).toBe('marketplaceId');
      expect(invalidMarketplace._tag).toBe('EndpointInputError');
      expect(invalidFilter._tag).toBe('EndpointInputError');
      expect(invalidFilter.parameter).toBe('filter');
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('gets category policies with and without a category filter', async () => {
      const response = { categoryPolicies: [{ categoryId: '1', policyIds: ['P1'] }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const unfiltered = await Effect.runPromise(
        api.getCategoryPolicies({ marketplaceId: 'EBAY_US' }),
      );
      const filtered = await Effect.runPromise(
        api.getCategoryPolicies({ marketplaceId: 'EBAY_US', filter: 'categoryIds:{12345}' }),
      );

      expect(mockClient.get).toHaveBeenNthCalledWith(
        1,
        '/sell/metadata/v1/marketplace/EBAY_US/get_category_policies',
      );
      expect(mockClient.get).toHaveBeenNthCalledWith(
        2,
        '/sell/metadata/v1/marketplace/EBAY_US/get_category_policies',
        { filter: 'categoryIds:{12345}' },
      );
      expect(unfiltered).toEqual(response);
      expect(filtered).toEqual(response);
    });

    it('gets extended producer responsibility policies with and without a category filter', async () => {
      const response = { eprPolicies: [{ policyId: 'EPR1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const unfiltered = await Effect.runPromise(
        api.getExtendedProducerResponsibilityPolicies({ marketplaceId: 'EBAY_DE' }),
      );
      const filtered = await Effect.runPromise(
        api.getExtendedProducerResponsibilityPolicies({
          marketplaceId: 'EBAY_DE',
          filter: 'categoryIds:{12345}',
        }),
      );

      expect(mockClient.get).toHaveBeenNthCalledWith(
        1,
        '/sell/metadata/v1/marketplace/EBAY_DE/get_extended_producer_responsibility_policies',
      );
      expect(mockClient.get).toHaveBeenNthCalledWith(
        2,
        '/sell/metadata/v1/marketplace/EBAY_DE/get_extended_producer_responsibility_policies',
        { filter: 'categoryIds:{12345}' },
      );
      expect(unfiltered).toEqual(response);
      expect(filtered).toEqual(response);
    });

    it('gets hazardous materials labels', async () => {
      const response = { labels: [{ labelId: 'HAZMAT1', description: 'Flammable' }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getHazardousMaterialsLabels({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_hazardous_materials_labels',
      );
      expect(result).toEqual(response);
    });

    it('gets item condition policies', async () => {
      const response = { conditionPolicies: [{ policyId: 'COND1', conditions: ['NEW', 'USED'] }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getItemConditionPolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_item_condition_policies',
      );
      expect(result).toEqual(response);
    });

    it('gets listing structure policies', async () => {
      const response = { structurePolicies: [{ policyId: 'STRUCT1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getListingStructurePolicies({ marketplaceId: 'EBAY_GB' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_GB/get_listing_structure_policies',
      );
      expect(result).toEqual(response);
    });

    it('gets negotiated price policies', async () => {
      const response = { pricePolicies: [{ policyId: 'PRICE1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getNegotiatedPricePolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_negotiated_price_policies',
      );
      expect(result).toEqual(response);
    });

    it('gets product safety labels', async () => {
      const response = { labels: [{ labelId: 'SAFETY1', description: 'CE Mark' }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getProductSafetyLabels({ marketplaceId: 'EBAY_DE' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_DE/get_product_safety_labels',
      );
      expect(result).toEqual(response);
    });

    it('gets regulatory policies', async () => {
      const response = { regulatoryPolicies: [{ policyId: 'REG1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getRegulatoryPolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_regulatory_policies',
      );
      expect(result).toEqual(response);
    });

    it('gets return policies', async () => {
      const response = { returnPolicies: [{ policyId: 'RET1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(api.getReturnPolicies({ marketplaceId: 'EBAY_US' }));

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_return_policies',
      );
      expect(result).toEqual(response);
    });

    it('gets classified ad policies', async () => {
      const response = { classifiedPolicies: [{ policyId: 'CLASS1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getClassifiedAdPolicies({ marketplaceId: 'EBAY_MOTORS' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_MOTORS/get_classified_ad_policies',
      );
      expect(result).toEqual(response);
    });

    it('gets currencies', async () => {
      const response = {
        currencies: [
          { currency: 'USD', description: 'US Dollar' },
          { currency: 'CAD', description: 'Canadian Dollar' },
        ],
      };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(api.getCurrencies({ marketplaceId: 'EBAY_US' }));

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_currencies',
      );
      expect(result).toEqual(response);
    });

    it('gets listing type policies', async () => {
      const response = { listingTypePolicies: [{ policyId: 'TYPE1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getListingTypePolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_listing_type_policies',
      );
      expect(result).toEqual(response);
    });

    it('gets Motors listing policies', async () => {
      const response = { motorsPolicies: [{ policyId: 'MOTORS1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getMotorsListingPolicies({ marketplaceId: 'EBAY_MOTORS' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_MOTORS/get_motors_listing_policies',
      );
      expect(result).toEqual(response);
    });

    it('gets shipping policies', async () => {
      const response = { shippingPolicies: [{ policyId: 'SHIP1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(api.getShippingPolicies({ marketplaceId: 'EBAY_US' }));

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_shipping_policies',
      );
      expect(result).toEqual(response);
    });

    it('gets site visibility policies', async () => {
      const response = { visibilityPolicies: [{ policyId: 'VIS1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getSiteVisibilityPolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_site_visibility_policies',
      );
      expect(result).toEqual(response);
    });
  });

  describe('compatibility endpoints', () => {
    it('gets compatibilities by specification with the marketplace header', async () => {
      const specification = {
        categoryId: '6016',
        specifications: [
          { propertyName: 'Make', propertyValue: 'Toyota' },
          { propertyName: 'Model', propertyValue: 'Camry' },
        ],
      };
      const response = { compatibilityDetails: [{ productFamilyId: '12345', productId: '67890' }] };
      vi.mocked(mockClient.post).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getCompatibilitiesBySpecification({ marketplaceId: 'EBAY_US', specification }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/metadata/v1/compatibilities/get_compatibilities_by_specification',
        specification,
        compatibilityHeaders('EBAY_US'),
      );
      expect(result).toEqual(response);
    });

    it('rejects invalid compatibility specification input before requesting eBay', async () => {
      const missingSpecification = await Effect.runPromise(
        Effect.flip(
          api.getCompatibilitiesBySpecification(
            invalidInput({ marketplaceId: 'EBAY_US', specification: null }),
          ),
        ),
      );
      const invalidInputObject = await Effect.runPromise(
        Effect.flip(api.getCompatibilitiesBySpecification(invalidInput('invalid'))),
      );

      expect(missingSpecification._tag).toBe('EndpointInputError');
      expect(missingSpecification.parameter).toBe('specification');
      expect(invalidInputObject._tag).toBe('EndpointInputError');
      expect(invalidInputObject.parameter).toBe('input');
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('gets compatibility property names with the generated request body', async () => {
      const data = {
        categoryId: '6016',
        dataset: ['Searchable'],
      };
      const response = { properties: [{ dataset: 'Searchable', propertyNames: [] }] };
      vi.mocked(mockClient.post).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getCompatibilityPropertyNames({ marketplaceId: 'EBAY_US', data }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/metadata/v1/compatibilities/get_compatibility_property_names',
        data,
        compatibilityHeaders('EBAY_US'),
      );
      expect(result).toEqual(response);
    });

    it('rejects invalid compatibility property-name data before requesting eBay', async () => {
      const error = await Effect.runPromise(
        Effect.flip(
          api.getCompatibilityPropertyNames(invalidInput({ marketplaceId: 'EBAY_US', data: null })),
        ),
      );

      expect(error._tag).toBe('EndpointInputError');
      expect(error.parameter).toBe('data');
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('gets compatibility property values with the generated request body', async () => {
      const data = {
        categoryId: '6016',
        propertyName: 'Make',
        propertyFilters: [{ propertyName: 'Year', propertyValue: '2022' }],
        sortOrder: 'Ascending',
      };
      const response = { propertyName: 'Make', propertyValues: [] };
      vi.mocked(mockClient.post).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getCompatibilityPropertyValues({ marketplaceId: 'EBAY_US', data }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/metadata/v1/compatibilities/get_compatibility_property_values',
        data,
        compatibilityHeaders('EBAY_US'),
      );
      expect(result).toEqual(response);
    });

    it('gets multiple compatibility property values with the generated request body', async () => {
      const data = {
        categoryId: '6016',
        propertyFilters: [{ propertyName: 'Make', propertyValue: 'Toyota' }],
        propertyNames: ['Model', 'Trim'],
      };
      const response = { compatibilities: [{ compatibilityProperties: [] }] };
      vi.mocked(mockClient.post).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getMultiCompatibilityPropertyValues({ marketplaceId: 'EBAY_US', data }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/metadata/v1/compatibilities/get_multi_compatibility_property_values',
        data,
        compatibilityHeaders('EBAY_US'),
      );
      expect(result).toEqual(response);
    });

    it('gets product compatibilities with the generated request body', async () => {
      const data = {
        productIdentifier: { epid: '12345' },
        dataset: ['Searchable'],
        applicationPropertyFilters: [{ propertyName: 'Make', propertyValue: 'Toyota' }],
      };
      const response = { compatibilityDetails: [{ productDetails: [] }] };
      vi.mocked(mockClient.post).mockResolvedValue(response);

      const result = await Effect.runPromise(
        api.getProductCompatibilities({ marketplaceId: 'EBAY_US', data }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/metadata/v1/compatibilities/get_product_compatibilities',
        data,
        compatibilityHeaders('EBAY_US'),
      );
      expect(result).toEqual(response);
    });
  });

  describe('country tax endpoints', () => {
    it('gets sales tax jurisdictions for a country', async () => {
      const response = {
        salesTaxJurisdictions: [
          { salesTaxJurisdictionId: 'CA', salesTaxPercentage: '7.25' },
          { salesTaxJurisdictionId: 'NY', salesTaxPercentage: '4.00' },
        ],
      };
      vi.mocked(mockClient.get).mockResolvedValue(response);

      const result = await Effect.runPromise(api.getSalesTaxJurisdictions({ countryCode: 'US' }));

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/country/US/sales_tax_jurisdiction',
      );
      expect(result).toEqual(response);
    });

    it('rejects invalid sales-tax jurisdiction country input before requesting eBay', async () => {
      const missingCountry = await Effect.runPromise(
        Effect.flip(api.getSalesTaxJurisdictions(invalidInput({ countryCode: '' }))),
      );
      const invalidCountry = await Effect.runPromise(
        Effect.flip(api.getSalesTaxJurisdictions(invalidInput({ countryCode: 123 }))),
      );

      expect(missingCountry._tag).toBe('EndpointInputError');
      expect(missingCountry.parameter).toBe('countryCode');
      expect(invalidCountry._tag).toBe('EndpointInputError');
      expect(mockClient.get).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('returns tagged API errors from GET requests', async () => {
      const cause = new Error('Network error');
      vi.mocked(mockClient.get).mockRejectedValue(cause);

      const error = await Effect.runPromise(
        Effect.flip(api.getCategoryPolicies({ marketplaceId: 'EBAY_US' })),
      );

      expect(error._tag).toBe('EbayApiError');
      expect(error.method).toBe('GET');
      expect(error.path).toBe('/sell/metadata/v1/marketplace/EBAY_US/get_category_policies');
      expect(error.cause).toBe(cause);
    });

    it('returns tagged API errors from POST requests', async () => {
      const cause = new Error('Invalid data');
      vi.mocked(mockClient.post).mockRejectedValue(cause);

      const error = await Effect.runPromise(
        Effect.flip(
          api.getCompatibilitiesBySpecification({
            marketplaceId: 'EBAY_US',
            specification: { categoryId: '6016' },
          }),
        ),
      );

      expect(error._tag).toBe('EbayApiError');
      expect(error.method).toBe('POST');
      expect(error.path).toBe(
        '/sell/metadata/v1/compatibilities/get_compatibilities_by_specification',
      );
      expect(error.cause).toBe(cause);
    });

    it('keeps non-Error causes on tagged API errors', async () => {
      vi.mocked(mockClient.get).mockRejectedValue('string error');

      const error = await Effect.runPromise(
        Effect.flip(api.getHazardousMaterialsLabels({ marketplaceId: 'EBAY_US' })),
      );

      expect(error._tag).toBe('EbayApiError');
      expect(error.cause).toBe('string error');
    });
  });
});
