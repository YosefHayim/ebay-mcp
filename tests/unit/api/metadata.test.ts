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
      const stubCompatibilityPolicies = {
        compatibilityPolicies: [{ policyId: '1', categoryId: '100' }],
      };
      vi.mocked(mockClient.get).mockResolvedValue(stubCompatibilityPolicies);

      const compatibilityPolicies = await Effect.runPromise(
        api.getAutomotivePartsCompatibilityPolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_automotive_parts_compatibility_policies',
      );
      expect(compatibilityPolicies).toEqual(stubCompatibilityPolicies);
    });

    it('gets automotive parts compatibility policies with a category filter', async () => {
      const stubCompatibilityPolicies = { compatibilityPolicies: [] };
      vi.mocked(mockClient.get).mockResolvedValue(stubCompatibilityPolicies);

      const compatibilityPolicies = await Effect.runPromise(
        api.getAutomotivePartsCompatibilityPolicies({
          marketplaceId: 'EBAY_US',
          filter: 'categoryIds:{12345}',
        }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_automotive_parts_compatibility_policies',
        { filter: 'categoryIds:{12345}' },
      );
      expect(compatibilityPolicies).toEqual(stubCompatibilityPolicies);
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
      const stubCategoryPolicies = { categoryPolicies: [{ categoryId: '1', policyIds: ['P1'] }] };
      vi.mocked(mockClient.get).mockResolvedValue(stubCategoryPolicies);

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
      expect(unfiltered).toEqual(stubCategoryPolicies);
      expect(filtered).toEqual(stubCategoryPolicies);
    });

    it('gets extended producer responsibility policies with and without a category filter', async () => {
      const stubEprPolicies = { eprPolicies: [{ policyId: 'EPR1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(stubEprPolicies);

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
      expect(unfiltered).toEqual(stubEprPolicies);
      expect(filtered).toEqual(stubEprPolicies);
    });

    it('gets hazardous materials labels', async () => {
      const stubHazmatLabels = { labels: [{ labelId: 'HAZMAT1', description: 'Flammable' }] };
      vi.mocked(mockClient.get).mockResolvedValue(stubHazmatLabels);

      const hazmatLabels = await Effect.runPromise(
        api.getHazardousMaterialsLabels({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_hazardous_materials_labels',
      );
      expect(hazmatLabels).toEqual(stubHazmatLabels);
    });

    it('gets item condition policies', async () => {
      const stubConditionPolicies = {
        conditionPolicies: [{ policyId: 'COND1', conditions: ['NEW', 'USED'] }],
      };
      vi.mocked(mockClient.get).mockResolvedValue(stubConditionPolicies);

      const conditionPolicies = await Effect.runPromise(
        api.getItemConditionPolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_item_condition_policies',
      );
      expect(conditionPolicies).toEqual(stubConditionPolicies);
    });

    it('gets listing structure policies', async () => {
      const stubStructurePolicies = { structurePolicies: [{ policyId: 'STRUCT1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(stubStructurePolicies);

      const structurePolicies = await Effect.runPromise(
        api.getListingStructurePolicies({ marketplaceId: 'EBAY_GB' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_GB/get_listing_structure_policies',
      );
      expect(structurePolicies).toEqual(stubStructurePolicies);
    });

    it('gets negotiated price policies', async () => {
      const stubPricePolicies = { pricePolicies: [{ policyId: 'PRICE1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(stubPricePolicies);

      const pricePolicies = await Effect.runPromise(
        api.getNegotiatedPricePolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_negotiated_price_policies',
      );
      expect(pricePolicies).toEqual(stubPricePolicies);
    });

    it('gets product safety labels', async () => {
      const stubSafetyLabels = { labels: [{ labelId: 'SAFETY1', description: 'CE Mark' }] };
      vi.mocked(mockClient.get).mockResolvedValue(stubSafetyLabels);

      const safetyLabels = await Effect.runPromise(
        api.getProductSafetyLabels({ marketplaceId: 'EBAY_DE' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_DE/get_product_safety_labels',
      );
      expect(safetyLabels).toEqual(stubSafetyLabels);
    });

    it('gets regulatory policies', async () => {
      const stubRegulatoryPolicies = { regulatoryPolicies: [{ policyId: 'REG1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(stubRegulatoryPolicies);

      const regulatoryPolicies = await Effect.runPromise(
        api.getRegulatoryPolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_regulatory_policies',
      );
      expect(regulatoryPolicies).toEqual(stubRegulatoryPolicies);
    });

    it('gets return policies', async () => {
      const stubReturnPolicies = { returnPolicies: [{ policyId: 'RET1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(stubReturnPolicies);

      const returnPolicies = await Effect.runPromise(
        api.getReturnPolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_return_policies',
      );
      expect(returnPolicies).toEqual(stubReturnPolicies);
    });

    it('gets classified ad policies', async () => {
      const stubClassifiedPolicies = { classifiedPolicies: [{ policyId: 'CLASS1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(stubClassifiedPolicies);

      const classifiedPolicies = await Effect.runPromise(
        api.getClassifiedAdPolicies({ marketplaceId: 'EBAY_MOTORS' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_MOTORS/get_classified_ad_policies',
      );
      expect(classifiedPolicies).toEqual(stubClassifiedPolicies);
    });

    it('gets currencies', async () => {
      const stubCurrencies = {
        currencies: [
          { currency: 'USD', description: 'US Dollar' },
          { currency: 'CAD', description: 'Canadian Dollar' },
        ],
      };
      vi.mocked(mockClient.get).mockResolvedValue(stubCurrencies);

      const currencies = await Effect.runPromise(api.getCurrencies({ marketplaceId: 'EBAY_US' }));

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_currencies',
      );
      expect(currencies).toEqual(stubCurrencies);
    });

    it('gets listing type policies', async () => {
      const stubListingTypePolicies = { listingTypePolicies: [{ policyId: 'TYPE1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(stubListingTypePolicies);

      const listingTypePolicies = await Effect.runPromise(
        api.getListingTypePolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_listing_type_policies',
      );
      expect(listingTypePolicies).toEqual(stubListingTypePolicies);
    });

    it('gets Motors listing policies', async () => {
      const stubMotorsPolicies = { motorsPolicies: [{ policyId: 'MOTORS1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(stubMotorsPolicies);

      const motorsPolicies = await Effect.runPromise(
        api.getMotorsListingPolicies({ marketplaceId: 'EBAY_MOTORS' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_MOTORS/get_motors_listing_policies',
      );
      expect(motorsPolicies).toEqual(stubMotorsPolicies);
    });

    it('gets shipping policies', async () => {
      const stubShippingPolicies = { shippingPolicies: [{ policyId: 'SHIP1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(stubShippingPolicies);

      const shippingPolicies = await Effect.runPromise(
        api.getShippingPolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_shipping_policies',
      );
      expect(shippingPolicies).toEqual(stubShippingPolicies);
    });

    it('gets site visibility policies', async () => {
      const stubVisibilityPolicies = { visibilityPolicies: [{ policyId: 'VIS1' }] };
      vi.mocked(mockClient.get).mockResolvedValue(stubVisibilityPolicies);

      const visibilityPolicies = await Effect.runPromise(
        api.getSiteVisibilityPolicies({ marketplaceId: 'EBAY_US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/marketplace/EBAY_US/get_site_visibility_policies',
      );
      expect(visibilityPolicies).toEqual(stubVisibilityPolicies);
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
      const stubCompatibilities = {
        compatibilityDetails: [{ productFamilyId: '12345', productId: '67890' }],
      };
      vi.mocked(mockClient.post).mockResolvedValue(stubCompatibilities);

      const compatibilities = await Effect.runPromise(
        api.getCompatibilitiesBySpecification({ marketplaceId: 'EBAY_US', specification }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/metadata/v1/compatibilities/get_compatibilities_by_specification',
        specification,
        compatibilityHeaders('EBAY_US'),
      );
      expect(compatibilities).toEqual(stubCompatibilities);
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
      const propertyNamesRequest = {
        categoryId: '6016',
        dataset: ['Searchable'],
      };
      const stubPropertyNames = { properties: [{ dataset: 'Searchable', propertyNames: [] }] };
      vi.mocked(mockClient.post).mockResolvedValue(stubPropertyNames);

      const propertyNames = await Effect.runPromise(
        api.getCompatibilityPropertyNames({ marketplaceId: 'EBAY_US', data: propertyNamesRequest }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/metadata/v1/compatibilities/get_compatibility_property_names',
        propertyNamesRequest,
        compatibilityHeaders('EBAY_US'),
      );
      expect(propertyNames).toEqual(stubPropertyNames);
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
      const propertyValuesRequest = {
        categoryId: '6016',
        propertyName: 'Make',
        propertyFilters: [{ propertyName: 'Year', propertyValue: '2022' }],
        sortOrder: 'Ascending',
      };
      const stubPropertyValues = { propertyName: 'Make', propertyValues: [] };
      vi.mocked(mockClient.post).mockResolvedValue(stubPropertyValues);

      const propertyValues = await Effect.runPromise(
        api.getCompatibilityPropertyValues({
          marketplaceId: 'EBAY_US',
          data: propertyValuesRequest,
        }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/metadata/v1/compatibilities/get_compatibility_property_values',
        propertyValuesRequest,
        compatibilityHeaders('EBAY_US'),
      );
      expect(propertyValues).toEqual(stubPropertyValues);
    });

    it('gets multiple compatibility property values with the generated request body', async () => {
      const multiPropertyValuesRequest = {
        categoryId: '6016',
        propertyFilters: [{ propertyName: 'Make', propertyValue: 'Toyota' }],
        propertyNames: ['Model', 'Trim'],
      };
      const stubMultiPropertyValues = { compatibilities: [{ compatibilityProperties: [] }] };
      vi.mocked(mockClient.post).mockResolvedValue(stubMultiPropertyValues);

      const multiPropertyValues = await Effect.runPromise(
        api.getMultiCompatibilityPropertyValues({
          marketplaceId: 'EBAY_US',
          data: multiPropertyValuesRequest,
        }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/metadata/v1/compatibilities/get_multi_compatibility_property_values',
        multiPropertyValuesRequest,
        compatibilityHeaders('EBAY_US'),
      );
      expect(multiPropertyValues).toEqual(stubMultiPropertyValues);
    });

    it('gets product compatibilities with the generated request body', async () => {
      const productCompatibilityRequest = {
        productIdentifier: { epid: '12345' },
        dataset: ['Searchable'],
        applicationPropertyFilters: [{ propertyName: 'Make', propertyValue: 'Toyota' }],
      };
      const stubProductCompatibilities = { compatibilityDetails: [{ productDetails: [] }] };
      vi.mocked(mockClient.post).mockResolvedValue(stubProductCompatibilities);

      const productCompatibilities = await Effect.runPromise(
        api.getProductCompatibilities({
          marketplaceId: 'EBAY_US',
          data: productCompatibilityRequest,
        }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/metadata/v1/compatibilities/get_product_compatibilities',
        productCompatibilityRequest,
        compatibilityHeaders('EBAY_US'),
      );
      expect(productCompatibilities).toEqual(stubProductCompatibilities);
    });
  });

  describe('country tax endpoints', () => {
    it('gets sales tax jurisdictions for a country', async () => {
      const stubJurisdictions = {
        salesTaxJurisdictions: [
          { salesTaxJurisdictionId: 'CA', salesTaxPercentage: '7.25' },
          { salesTaxJurisdictionId: 'NY', salesTaxPercentage: '4.00' },
        ],
      };
      vi.mocked(mockClient.get).mockResolvedValue(stubJurisdictions);

      const jurisdictions = await Effect.runPromise(
        api.getSalesTaxJurisdictions({ countryCode: 'US' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/metadata/v1/country/US/sales_tax_jurisdiction',
      );
      expect(jurisdictions).toEqual(stubJurisdictions);
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
