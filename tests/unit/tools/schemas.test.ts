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
} from '../../../src/tools/schemas.js';

describe('Schema Validation', () => {
  describe('Common Schemas', () => {
    describe('timeDurationSchema', () => {
      it('should validate valid time duration', () => {
        const validDuration = {
          unit: 'DAY',
          value: 30,
        };

        const result = timeDurationSchema.safeParse(validDuration);
        expect(result.success).toBe(true);
      });

      it('should reject invalid unit', () => {
        const invalidDuration = {
          unit: 'INVALID_UNIT',
          value: 30,
        };

        const result = timeDurationSchema.safeParse(invalidDuration);
        expect(result.success).toBe(false);
      });

      it('should require unit and value', () => {
        const missingFields = {
          unit: 'DAY',
        };

        const result = timeDurationSchema.safeParse(missingFields);
        expect(result.success).toBe(false);
      });

      it('should allow additional properties (passthrough)', () => {
        const withExtra = {
          unit: 'DAY',
          value: 30,
          extraField: 'extra',
        };

        const result = timeDurationSchema.safeParse(withExtra);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toHaveProperty('extraField');
        }
      });
    });

    describe('amountSchema', () => {
      it('should validate valid amount', () => {
        const validAmount = {
          currency: 'USD',
          value: '99.99',
        };

        const result = amountSchema.safeParse(validAmount);
        expect(result.success).toBe(true);
      });

      it('should accept different currencies', () => {
        const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

        currencies.forEach((currency) => {
          const amount = { currency, value: '100.00' };
          const result = amountSchema.safeParse(amount);
          expect(result.success).toBe(true);
        });
      });

      it('should require both currency and value', () => {
        const missingValue = { currency: 'USD' };
        const missingCurrency = { value: '99.99' };

        expect(amountSchema.safeParse(missingValue).success).toBe(false);
        expect(amountSchema.safeParse(missingCurrency).success).toBe(false);
      });
    });

    describe('regionSchema', () => {
      it('should validate region with name and type', () => {
        const validRegion = {
          regionName: 'United States',
          regionType: 'COUNTRY',
        };

        const result = regionSchema.safeParse(validRegion);
        expect(result.success).toBe(true);
      });

      it('should allow optional fields', () => {
        const minimalRegion = {};

        const result = regionSchema.safeParse(minimalRegion);
        expect(result.success).toBe(true);
      });

      it('should validate all region types', () => {
        const regionTypes = [
          'COUNTRY',
          'COUNTRY_REGION',
          'STATE_OR_PROVINCE',
          'WORLD_REGION',
          'WORLDWIDE',
        ];

        regionTypes.forEach((regionType) => {
          const region = { regionName: 'Test', regionType };
          const result = regionSchema.safeParse(region);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('regionSetSchema', () => {
      it('should validate region set with included and excluded regions', () => {
        const validRegionSet = {
          regionIncluded: [
            { regionName: 'United States', regionType: 'COUNTRY' },
            { regionName: 'Canada', regionType: 'COUNTRY' },
          ],
          regionExcluded: [{ regionName: 'Alaska', regionType: 'STATE_OR_PROVINCE' }],
        };

        const result = regionSetSchema.safeParse(validRegionSet);
        expect(result.success).toBe(true);
      });

      it('should allow empty region set', () => {
        const result = regionSetSchema.safeParse({});
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Account Management Schemas', () => {
    describe('fulfillmentPolicySchema', () => {
      it('should validate basic fulfillment policy', () => {
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

        const result = fulfillmentPolicySchema.safeParse(validPolicy);
        expect(result.success).toBe(true);
      });

      it('should require name and marketplaceId', () => {
        const missingName = { marketplaceId: 'EBAY_US' };
        const missingMarketplace = { name: 'Test Policy' };

        expect(fulfillmentPolicySchema.safeParse(missingName).success).toBe(false);
        expect(fulfillmentPolicySchema.safeParse(missingMarketplace).success).toBe(false);
      });
    });

    describe('paymentPolicySchema', () => {
      it('should validate basic payment policy', () => {
        const validPolicy = {
          name: 'Immediate Payment Required',
          marketplaceId: 'EBAY_US',
          categoryTypes: [{ name: 'ALL_EXCLUDING_MOTORS_VEHICLES', default: true }],
          paymentMethods: [{ paymentMethodType: 'PAYPAL' }],
        };

        const result = paymentPolicySchema.safeParse(validPolicy);
        expect(result.success).toBe(true);
      });

      it('should require name and marketplaceId', () => {
        const missingName = { marketplaceId: 'EBAY_US' };

        expect(paymentPolicySchema.safeParse(missingName).success).toBe(false);
      });
    });

    describe('returnPolicySchema', () => {
      it('should validate return policy', () => {
        const validPolicy = {
          name: '30 Day Returns',
          marketplaceId: 'EBAY_US',
          categoryTypes: [{ name: 'ALL_EXCLUDING_MOTORS_VEHICLES', default: true }],
          returnsAccepted: true,
          returnPeriod: { unit: 'DAY', value: 30 },
        };

        const result = returnPolicySchema.safeParse(validPolicy);
        expect(result.success).toBe(true);
      });

      it('should allow no returns accepted', () => {
        const noReturns = {
          name: 'No Returns',
          marketplaceId: 'EBAY_US',
          returnsAccepted: false,
        };

        const result = returnPolicySchema.safeParse(noReturns);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Inventory Management Schemas', () => {
    describe('inventoryItemSchema', () => {
      it('should validate complete inventory item', () => {
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

        const result = inventoryItemSchema.safeParse(validItem);
        expect(result.success).toBe(true);
      });

      it('should allow missing availability (all fields optional)', () => {
        const missingAvailability = {
          condition: 'NEW',
          product: {
            title: 'Test',
            description: 'Test',
          },
        };

        const result = inventoryItemSchema.safeParse(missingAvailability);
        expect(result.success).toBe(true);
      });

      it('should accept different conditions', () => {
        const conditions = ['NEW', 'LIKE_NEW', 'NEW_OTHER', 'USED_EXCELLENT', 'USED_GOOD'];

        conditions.forEach((condition) => {
          const item = {
            availability: { shipToLocationAvailability: { quantity: 1 } },
            condition,
            product: { title: 'Test' },
          };
          const result = inventoryItemSchema.safeParse(item);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('offerSchema', () => {
      it('should validate complete offer', () => {
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

        const result = offerSchema.safeParse(validOffer);
        expect(result.success).toBe(true);
      });

      it('should require sku and marketplaceId', () => {
        const missingSku = { marketplaceId: 'EBAY_US', format: 'FIXED_PRICE' };
        const missingMarketplace = { sku: 'TEST-001', format: 'FIXED_PRICE' };

        expect(offerSchema.safeParse(missingSku).success).toBe(false);
        expect(offerSchema.safeParse(missingMarketplace).success).toBe(false);
      });

      it('should validate listing formats', () => {
        const formats = ['FIXED_PRICE', 'AUCTION'];

        formats.forEach((format) => {
          const offer = {
            sku: 'TEST-001',
            marketplaceId: 'EBAY_US',
            format,
          };
          const result = offerSchema.safeParse(offer);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('inventoryLocationSchema', () => {
      it('should validate inventory location', () => {
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

        const result = inventoryLocationSchema.safeParse(validLocation);
        expect(result.success).toBe(true);
      });

      it('should allow missing location object (all fields optional)', () => {
        const missingLocation = {
          name: 'Test Location',
          merchantLocationStatus: 'ENABLED',
        };

        const result = inventoryLocationSchema.safeParse(missingLocation);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Schema Edge Cases', () => {
    it('should handle empty objects gracefully', () => {
      const schemas = [regionSchema, regionSetSchema];

      schemas.forEach((schema) => {
        const result = schema.safeParse({});
        expect(result.success).toBe(true);
      });
    });

    it('should reject non-object values', () => {
      const schemas = [amountSchema, timeDurationSchema, regionSchema];

      const invalidValues = [null, undefined, 'string', 123, [], true];

      schemas.forEach((schema) => {
        invalidValues.forEach((value) => {
          const result = schema.safeParse(value);
          expect(result.success).toBe(false);
        });
      });
    });

    it('should preserve extra fields with passthrough', () => {
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
