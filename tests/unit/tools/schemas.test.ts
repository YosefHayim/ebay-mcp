import { describe, it, expect } from 'vitest';
import {
  timeDurationSchema,
  amountSchema,
  regionSchema,
  regionSetSchema,
  fulfillmentPolicySchema,
  paymentPolicySchema,
  returnPolicySchema,
  inventoryItemSchema,
  offerSchema,
  locationSchema as inventoryLocationSchema,
} from '@/tools/schemas.js';

describe('Schema Validation', () => {
  describe('Common Schemas', () => {
    describe('timeDurationSchema', () => {
      it('validate valid time duration', () => {
        const validDuration = {
          unit: 'DAY',
          value: 30,
        };

        const parsedDuration = timeDurationSchema.safeParse(validDuration);
        expect(parsedDuration.success).toBe(true);
      });

      it('reject invalid unit', () => {
        const invalidDuration = {
          unit: 'INVALID_UNIT',
          value: 30,
        };

        const parsedDuration = timeDurationSchema.safeParse(invalidDuration);
        expect(parsedDuration.success).toBe(false);
      });

      it('require unit and value', () => {
        const missingFields = {
          unit: 'DAY',
        };

        const parsedDuration = timeDurationSchema.safeParse(missingFields);
        expect(parsedDuration.success).toBe(false);
      });

      it('allow additional properties (passthrough)', () => {
        const withExtra = {
          unit: 'DAY',
          value: 30,
          extraField: 'extra',
        };

        const parsedDuration = timeDurationSchema.safeParse(withExtra);
        expect(parsedDuration.success).toBe(true);
        if (parsedDuration.success) {
          expect(parsedDuration.data).toHaveProperty('extraField');
        }
      });
    });

    describe('amountSchema', () => {
      it('validate valid amount', () => {
        const validAmount = {
          currency: 'USD',
          value: '99.99',
        };

        const parsedAmount = amountSchema.safeParse(validAmount);
        expect(parsedAmount.success).toBe(true);
      });

      it('accept different currencies', () => {
        const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

        currencies.forEach((currency) => {
          const amount = { currency, value: '100.00' };
          const parsedAmount = amountSchema.safeParse(amount);
          expect(parsedAmount.success).toBe(true);
        });
      });

      it('require both currency and value', () => {
        const missingValue = { currency: 'USD' };
        const missingCurrency = { value: '99.99' };

        expect(amountSchema.safeParse(missingValue).success).toBe(false);
        expect(amountSchema.safeParse(missingCurrency).success).toBe(false);
      });
    });

    describe('regionSchema', () => {
      it('validate region with name and type', () => {
        const validRegion = {
          regionName: 'United States',
          regionType: 'COUNTRY',
        };

        const parsedRegion = regionSchema.safeParse(validRegion);
        expect(parsedRegion.success).toBe(true);
      });

      it('allow optional fields', () => {
        const minimalRegion = {};

        const parsedRegion = regionSchema.safeParse(minimalRegion);
        expect(parsedRegion.success).toBe(true);
      });

      it('validate all region types', () => {
        const regionTypes = [
          'COUNTRY',
          'COUNTRY_REGION',
          'STATE_OR_PROVINCE',
          'WORLD_REGION',
          'WORLDWIDE',
        ];

        regionTypes.forEach((regionType) => {
          const region = { regionName: 'Test', regionType };
          const parsedRegion = regionSchema.safeParse(region);
          expect(parsedRegion.success).toBe(true);
        });
      });
    });

    describe('regionSetSchema', () => {
      it('validate region set with included and excluded regions', () => {
        const validRegionSet = {
          regionIncluded: [
            { regionName: 'United States', regionType: 'COUNTRY' },
            { regionName: 'Canada', regionType: 'COUNTRY' },
          ],
          regionExcluded: [{ regionName: 'Alaska', regionType: 'STATE_OR_PROVINCE' }],
        };

        const parsedRegionSet = regionSetSchema.safeParse(validRegionSet);
        expect(parsedRegionSet.success).toBe(true);
      });

      it('allow empty region set', () => {
        const parsedRegionSet = regionSetSchema.safeParse({});
        expect(parsedRegionSet.success).toBe(true);
      });
    });
  });

  describe('Account Management Schemas', () => {
    describe('fulfillmentPolicySchema', () => {
      it('validate basic fulfillment policy', () => {
        const validPolicy = {
          name: 'Standard Shipping',
          marketplaceId: 'EBAY_US',
          categoryTypes: [{ name: 'ALL_EXCLUDING_MOTORS_VEHICLES', default: true }],
          handlingTime: { unit: 'DAY', value: 1 },
          shippingOptions: [
            {
              costType: 'FLAT_RATE',
              optionType: 'DOMESTIC',
              shippingServices: [
                {
                  shippingCost: { currency: 'USD', value: '5.99' },
                  shippingCarrierCode: 'USPS',
                  shippingServiceCode: 'USPSPriority',
                },
              ],
            },
          ],
        };

        const parsedPolicy = fulfillmentPolicySchema.safeParse(validPolicy);
        expect(parsedPolicy.success).toBe(true);
      });

      it('require name and marketplaceId', () => {
        const missingName = { marketplaceId: 'EBAY_US' };
        const missingMarketplace = { name: 'Test Policy' };

        expect(fulfillmentPolicySchema.safeParse(missingName).success).toBe(false);
        expect(fulfillmentPolicySchema.safeParse(missingMarketplace).success).toBe(false);
      });
    });

    describe('paymentPolicySchema', () => {
      it('validate basic payment policy', () => {
        const validPolicy = {
          name: 'Immediate Payment Required',
          marketplaceId: 'EBAY_US',
          categoryTypes: [{ name: 'ALL_EXCLUDING_MOTORS_VEHICLES', default: true }],
          paymentMethods: [{ paymentMethodType: 'PAYPAL' }],
        };

        const parsedPolicy = paymentPolicySchema.safeParse(validPolicy);
        expect(parsedPolicy.success).toBe(true);
      });

      it('require name and marketplaceId', () => {
        const missingName = { marketplaceId: 'EBAY_US' };

        expect(paymentPolicySchema.safeParse(missingName).success).toBe(false);
      });
    });

    describe('returnPolicySchema', () => {
      it('validate return policy', () => {
        const validPolicy = {
          name: '30 Day Returns',
          marketplaceId: 'EBAY_US',
          categoryTypes: [{ name: 'ALL_EXCLUDING_MOTORS_VEHICLES', default: true }],
          returnsAccepted: true,
          returnPeriod: { unit: 'DAY', value: 30 },
        };

        const parsedPolicy = returnPolicySchema.safeParse(validPolicy);
        expect(parsedPolicy.success).toBe(true);
      });

      it('allow no returns accepted', () => {
        const noReturns = {
          name: 'No Returns',
          marketplaceId: 'EBAY_US',
          returnsAccepted: false,
        };

        const parsedPolicy = returnPolicySchema.safeParse(noReturns);
        expect(parsedPolicy.success).toBe(true);
      });
    });
  });

  describe('Inventory Management Schemas', () => {
    describe('inventoryItemSchema', () => {
      it('validate complete inventory item', () => {
        const validItem = {
          availability: {
            shipToLocationAvailability: {
              quantity: 10,
            },
          },
          condition: 'NEW',
          product: {
            title: 'Test Product',
            description: 'A test product description',
            aspects: {
              Brand: ['Test Brand'],
              Color: ['Blue'],
            },
            imageUrls: ['https://example.com/image.jpg'],
          },
        };

        const parsedItem = inventoryItemSchema.safeParse(validItem);
        expect(parsedItem.success).toBe(true);
      });

      it('allow missing availability (all fields optional)', () => {
        const missingAvailability = {
          condition: 'NEW',
          product: {
            title: 'Test',
            description: 'Test',
          },
        };

        const parsedItem = inventoryItemSchema.safeParse(missingAvailability);
        expect(parsedItem.success).toBe(true);
      });

      it('accept different conditions', () => {
        const conditions = ['NEW', 'LIKE_NEW', 'NEW_OTHER', 'USED_EXCELLENT', 'USED_GOOD'];

        conditions.forEach((condition) => {
          const inventoryItem = {
            availability: { shipToLocationAvailability: { quantity: 1 } },
            condition,
            product: { title: 'Test' },
          };
          const parsedItem = inventoryItemSchema.safeParse(inventoryItem);
          expect(parsedItem.success).toBe(true);
        });
      });
    });

    describe('offerSchema', () => {
      it('validate complete offer', () => {
        const validOffer = {
          sku: 'TEST-SKU-001',
          marketplaceId: 'EBAY_US',
          format: 'FIXED_PRICE',
          listingPolicies: {
            fulfillmentPolicyId: '12345',
            paymentPolicyId: '67890',
            returnPolicyId: '11111',
          },
          pricingSummary: {
            price: { currency: 'USD', value: '99.99' },
          },
          quantityLimitPerBuyer: 5,
          categoryId: '1234',
        };

        const parsedOffer = offerSchema.safeParse(validOffer);
        expect(parsedOffer.success).toBe(true);
      });

      it('require sku and marketplaceId', () => {
        const missingSku = { marketplaceId: 'EBAY_US', format: 'FIXED_PRICE' };
        const missingMarketplace = { sku: 'TEST-001', format: 'FIXED_PRICE' };

        expect(offerSchema.safeParse(missingSku).success).toBe(false);
        expect(offerSchema.safeParse(missingMarketplace).success).toBe(false);
      });

      it('validate listing formats', () => {
        const formats = ['FIXED_PRICE', 'AUCTION'];

        formats.forEach((format) => {
          const offer = {
            sku: 'TEST-001',
            marketplaceId: 'EBAY_US',
            format,
          };
          const parsedOffer = offerSchema.safeParse(offer);
          expect(parsedOffer.success).toBe(true);
        });
      });
    });

    describe('inventoryLocationSchema', () => {
      it('validate inventory location', () => {
        const validLocation = {
          location: {
            address: {
              addressLine1: '123 Main St',
              city: 'San Jose',
              stateOrProvince: 'CA',
              postalCode: '95110',
              country: 'US',
            },
          },
          locationInstructions: 'Loading dock at rear',
          name: 'Main Warehouse',
          merchantLocationStatus: 'ENABLED',
          locationTypes: ['WAREHOUSE'],
        };

        const parsedLocation = inventoryLocationSchema.safeParse(validLocation);
        expect(parsedLocation.success).toBe(true);
      });

      it('allow missing location object (all fields optional)', () => {
        const missingLocation = {
          name: 'Test Location',
          merchantLocationStatus: 'ENABLED',
        };

        const parsedLocation = inventoryLocationSchema.safeParse(missingLocation);
        expect(parsedLocation.success).toBe(true);
      });
    });
  });

  describe('Schema Edge Cases', () => {
    it('handle empty objects gracefully', () => {
      const schemas = [regionSchema, regionSetSchema];

      schemas.forEach((schema) => {
        const parsedEmpty = schema.safeParse({});
        expect(parsedEmpty.success).toBe(true);
      });
    });

    it('reject non-object values', () => {
      const schemas = [amountSchema, timeDurationSchema, regionSchema];

      const invalidValues = [null, undefined, 'string', 123, [], true];

      schemas.forEach((schema) => {
        invalidValues.forEach((invalidValue) => {
          const parsedInvalid = schema.safeParse(invalidValue);
          expect(parsedInvalid.success).toBe(false);
        });
      });
    });

    it('preserve extra fields with passthrough', () => {
      const schemaWithExtra = amountSchema.safeParse({
        currency: 'USD',
        value: '99.99',
        metadata: { source: 'test' },
        customField: 'custom',
      });

      expect(schemaWithExtra.success).toBe(true);
      if (schemaWithExtra.success) {
        expect(schemaWithExtra.data).toHaveProperty('metadata');
        expect(schemaWithExtra.data).toHaveProperty('customField');
      }
    });
  });
});
