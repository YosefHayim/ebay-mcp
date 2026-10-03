/**
 * Tests for Zod schema validation with native enums
 */

import { describe, it, expect } from 'vitest';
import {
  timeDurationSchema,
  regionSchema,
  shippingOptionSchema,
  depositSchema,
  returnPolicySchema,
  inventoryItemSchema,
  pricingSchema,
  offerSchema,
  locationSchema,
  refundDataSchema,
  fundingStrategySchema,
  messageDataSchema,
  feedbackDataSchema,
  infringementDataSchema,
  listingFeesRequestSchema,
} from '@/tools/schemas.js';
import {
  TimeDurationUnit,
  RegionType,
  ShippingCostType,
  ShippingOptionType,
  DepositType,
  RefundMethod,
  ReturnMethod,
  ReturnShippingCostPayer,
  Condition,
  LengthUnit,
  WeightUnit,
  PricingVisibility,
  FormatType,
  LocationType,
  MerchantLocationStatus,
  DayOfWeek,
  ReasonForRefund,
  FundingModel,
  MessageReferenceType,
  FeedbackRating,
  ReportedItemType,
} from '@/types/ebayEnums.js';

describe('schema enum validation', () => {
  describe('timeDurationSchema', () => {
    it('accept valid TimeDurationUnit enum values', () => {
      const validData = {
        unit: TimeDurationUnit.DAY,
        value: 30,
      };
      expect(() => timeDurationSchema.parse(validData)).not.toThrow();
    });

    it('accept all TimeDurationUnit values', () => {
      const units = [
        TimeDurationUnit.YEAR,
        TimeDurationUnit.MONTH,
        TimeDurationUnit.DAY,
        TimeDurationUnit.HOUR,
        TimeDurationUnit.CALENDAR_DAY,
        TimeDurationUnit.BUSINESS_DAY,
        TimeDurationUnit.MINUTE,
        TimeDurationUnit.SECOND,
        TimeDurationUnit.MILLISECOND,
      ];

      units.forEach((unit) => {
        const duration = { unit, value: 10 };
        expect(() => timeDurationSchema.parse(duration)).not.toThrow();
      });
    });

    it('reject invalid unit values', () => {
      const invalidData = {
        unit: 'INVALID_UNIT',
        value: 30,
      };
      expect(() => timeDurationSchema.parse(invalidData)).toThrow();
    });
  });

  describe('regionSchema', () => {
    it('accept valid RegionType enum values', () => {
      const validData = {
        regionName: 'United States',
        regionType: RegionType.COUNTRY,
      };
      expect(() => regionSchema.parse(validData)).not.toThrow();
    });

    it('accept all RegionType values', () => {
      const types = [
        RegionType.COUNTRY,
        RegionType.COUNTRY_REGION,
        RegionType.STATE_OR_PROVINCE,
        RegionType.WORLD_REGION,
        RegionType.WORLDWIDE,
      ];

      types.forEach((regionType) => {
        const region = { regionName: 'Test Region', regionType };
        expect(() => regionSchema.parse(region)).not.toThrow();
      });
    });
  });

  describe('shippingOptionSchema', () => {
    it('accept valid ShippingCostType and ShippingOptionType', () => {
      const validData = {
        costType: ShippingCostType.FLAT_RATE,
        optionType: ShippingOptionType.DOMESTIC,
        shippingServices: [],
      };
      expect(() => shippingOptionSchema.parse(validData)).not.toThrow();
    });

    it('accept CALCULATED cost type', () => {
      const calculatedShippingOption = {
        costType: ShippingCostType.CALCULATED,
        optionType: ShippingOptionType.INTERNATIONAL,
        shippingServices: [],
      };
      expect(() => shippingOptionSchema.parse(calculatedShippingOption)).not.toThrow();
    });
  });

  describe('depositSchema', () => {
    it('accept valid DepositType enum values', () => {
      const validData = {
        depositType: DepositType.PERCENTAGE,
        depositAmount: { currency: 'USD', value: '10' },
        dueIn: { unit: TimeDurationUnit.DAY, value: 7 },
      };
      expect(() => depositSchema.parse(validData)).not.toThrow();
    });

    it('accept FIXED_AMOUNT deposit type', () => {
      const fixedDeposit = {
        depositType: DepositType.FIXED_AMOUNT,
        depositAmount: { currency: 'USD', value: '100' },
        dueIn: { unit: TimeDurationUnit.DAY, value: 7 },
      };
      expect(() => depositSchema.parse(fixedDeposit)).not.toThrow();
    });
  });

  describe('returnPolicySchema', () => {
    it('accept valid RefundMethod, ReturnMethod, and ReturnShippingCostPayer', () => {
      const validData = {
        name: 'Test Policy',
        marketplaceId: 'EBAY_US',
        refundMethod: RefundMethod.MONEY_BACK,
        returnMethod: ReturnMethod.REPLACEMENT,
        returnShippingCostPayer: ReturnShippingCostPayer.SELLER,
        returnsAccepted: true,
      };
      expect(() => returnPolicySchema.parse(validData)).not.toThrow();
    });

    it('accept MERCHANDISE_CREDIT refund method', () => {
      const creditReturnPolicy = {
        name: 'Test Policy',
        marketplaceId: 'EBAY_US',
        refundMethod: RefundMethod.MERCHANDISE_CREDIT,
      };
      expect(() => returnPolicySchema.parse(creditReturnPolicy)).not.toThrow();
    });
  });

  describe('inventoryItemSchema', () => {
    it('accept valid Condition enum', () => {
      const validData = {
        availability: {
          shipToLocationAvailability: {
            quantity: 10,
          },
        },
        condition: Condition.NEW,
        product: {
          title: 'Test Product',
          description: 'Test Description',
        },
      };
      expect(() => inventoryItemSchema.parse(validData)).not.toThrow();
    });

    it('accept all Condition values', () => {
      const conditions = [
        Condition.NEW,
        Condition.LIKE_NEW,
        Condition.NEW_OTHER,
        Condition.NEW_WITH_DEFECTS,
        Condition.MANUFACTURER_REFURBISHED,
        Condition.CERTIFIED_REFURBISHED,
        Condition.USED_EXCELLENT,
        Condition.USED_VERY_GOOD,
        Condition.USED_GOOD,
        Condition.USED_ACCEPTABLE,
        Condition.FOR_PARTS_OR_NOT_WORKING,
      ];

      conditions.forEach((condition) => {
        const inventoryItem = {
          availability: {
            shipToLocationAvailability: { quantity: 10 },
          },
          condition,
          product: {
            title: 'Test Product',
            description: 'Test Description',
          },
        };
        expect(() => inventoryItemSchema.parse(inventoryItem)).not.toThrow();
      });
    });

    it('accept valid LengthUnit and WeightUnit', () => {
      const measuredInventoryItem = {
        availability: {
          shipToLocationAvailability: { quantity: 10 },
        },
        condition: Condition.NEW,
        product: {
          title: 'Test Product',
          description: 'Test Description',
        },
        packageWeightAndSize: {
          dimensions: {
            length: 10,
            width: 5,
            height: 3,
            unit: LengthUnit.INCH,
          },
          weight: {
            value: 2,
            unit: WeightUnit.POUND,
          },
        },
      };
      expect(() => inventoryItemSchema.parse(measuredInventoryItem)).not.toThrow();
    });
  });

  describe('pricingSchema', () => {
    it('accept valid PricingVisibility enum', () => {
      const validData = {
        price: { currency: 'USD', value: '99.99' },
        pricingVisibility: PricingVisibility.PRE_CHECKOUT,
      };
      expect(() => pricingSchema.parse(validData)).not.toThrow();
    });

    it('accept all PricingVisibility values', () => {
      const visibilities = [
        PricingVisibility.NONE,
        PricingVisibility.PRE_CHECKOUT,
        PricingVisibility.DURING_CHECKOUT,
      ];

      visibilities.forEach((pricingVisibility) => {
        const pricing = {
          price: { currency: 'USD', value: '99.99' },
          pricingVisibility,
        };
        expect(() => pricingSchema.parse(pricing)).not.toThrow();
      });
    });
  });

  describe('offerSchema', () => {
    it('accept valid FormatType enum', () => {
      const validData = {
        sku: 'TEST-SKU-001',
        marketplaceId: 'EBAY_US',
        format: FormatType.FIXED_PRICE,
        availableQuantity: 10,
        categoryId: '12345',
        listingPolicies: {
          fulfillmentPolicyId: 'fp-123',
          paymentPolicyId: 'pp-123',
          returnPolicyId: 'rp-123',
        },
        pricingSummary: {
          price: { currency: 'USD', value: '99.99' },
        },
      };
      expect(() => offerSchema.parse(validData)).not.toThrow();
    });

    it('accept AUCTION format type', () => {
      const auctionOffer = {
        sku: 'TEST-SKU-001',
        marketplaceId: 'EBAY_US',
        format: FormatType.AUCTION,
        availableQuantity: 1,
        categoryId: '12345',
        listingPolicies: {
          fulfillmentPolicyId: 'fp-123',
          paymentPolicyId: 'pp-123',
          returnPolicyId: 'rp-123',
        },
        pricingSummary: {
          price: { currency: 'USD', value: '0.99' },
        },
      };
      expect(() => offerSchema.parse(auctionOffer)).not.toThrow();
    });
  });

  describe('locationSchema', () => {
    it('accept valid LocationType and MerchantLocationStatus', () => {
      const validData = {
        name: 'Main Warehouse',
        merchantLocationStatus: MerchantLocationStatus.ENABLED,
        locationTypes: [LocationType.WAREHOUSE],
        location: {
          address: {
            addressLine1: '123 Main St',
            city: 'San Jose',
            stateOrProvince: 'CA',
            postalCode: '95131',
            country: 'US',
          },
        },
      };
      expect(() => locationSchema.parse(validData)).not.toThrow();
    });

    it('accept STORE location type', () => {
      const storeLocation = {
        name: 'Retail Store',
        merchantLocationStatus: MerchantLocationStatus.ENABLED,
        locationTypes: [LocationType.STORE],
        location: {
          address: {
            addressLine1: '456 Store Ave',
            city: 'New York',
            stateOrProvince: 'NY',
            postalCode: '10001',
            country: 'US',
          },
        },
      };
      expect(() => locationSchema.parse(storeLocation)).not.toThrow();
    });

    it('accept valid DayOfWeek in operating hours', () => {
      const locationWithHours = {
        name: 'Store with Hours',
        merchantLocationStatus: MerchantLocationStatus.ENABLED,
        locationTypes: [LocationType.STORE],
        location: {
          address: {
            addressLine1: '789 Business Blvd',
            city: 'Chicago',
            stateOrProvince: 'IL',
            postalCode: '60601',
            country: 'US',
          },
        },
        operatingHours: [
          {
            dayOfWeekEnum: DayOfWeek.MONDAY,
            intervals: [{ open: '09:00', close: '17:00' }],
          },
          {
            dayOfWeekEnum: DayOfWeek.FRIDAY,
            intervals: [{ open: '09:00', close: '17:00' }],
          },
        ],
      };
      expect(() => locationSchema.parse(locationWithHours)).not.toThrow();
    });
  });

  describe('refundDataSchema', () => {
    it('accept valid ReasonForRefund enum', () => {
      const validData = {
        reasonForRefund: ReasonForRefund.ITEM_DAMAGED,
      };
      expect(() => refundDataSchema.parse(validData)).not.toThrow();
    });

    it('accept all ReasonForRefund values', () => {
      const reasons = [
        ReasonForRefund.BUYER_CANCEL,
        ReasonForRefund.OUT_OF_STOCK,
        ReasonForRefund.FOUND_CHEAPER_PRICE,
        ReasonForRefund.INCORRECT_PRICE,
        ReasonForRefund.ITEM_DAMAGED,
        ReasonForRefund.ITEM_DEFECTIVE,
        ReasonForRefund.LOST_IN_TRANSIT,
        ReasonForRefund.MUTUALLY_AGREED,
        ReasonForRefund.SELLER_CANCEL,
      ];

      reasons.forEach((reasonForRefund) => {
        const refund = { reasonForRefund };
        expect(() => refundDataSchema.parse(refund)).not.toThrow();
      });
    });
  });

  describe('fundingStrategySchema', () => {
    it('accept valid FundingModel enum', () => {
      const validData = {
        fundingModel: FundingModel.COST_PER_SALE,
        bidPercentage: '5.0',
      };
      expect(() => fundingStrategySchema.parse(validData)).not.toThrow();
    });

    it('accept COST_PER_CLICK funding model', () => {
      const cpcFundingStrategy = {
        fundingModel: FundingModel.COST_PER_CLICK,
        bidPercentage: '0.50',
      };
      expect(() => fundingStrategySchema.parse(cpcFundingStrategy)).not.toThrow();
    });
  });

  describe('messageDataSchema', () => {
    it('accept valid MessageReferenceType enum', () => {
      const validData = {
        messageText: 'Test message',
        reference: {
          referenceId: '123456',
          referenceType: MessageReferenceType.LISTING,
        },
      };
      expect(() => messageDataSchema.parse(validData)).not.toThrow();
    });

    it('accept ORDER reference type', () => {
      const orderMessage = {
        messageText: 'Order inquiry',
        reference: {
          referenceId: 'order-789',
          referenceType: MessageReferenceType.ORDER,
        },
      };
      expect(() => messageDataSchema.parse(orderMessage)).not.toThrow();
    });
  });

  describe('feedbackDataSchema', () => {
    it('accept valid FeedbackRating enum', () => {
      const validData = {
        orderLineItemId: 'order-123-item-1',
        rating: FeedbackRating.POSITIVE,
        feedbackText: 'Great buyer!',
      };
      expect(() => feedbackDataSchema.parse(validData)).not.toThrow();
    });

    it('accept all FeedbackRating values', () => {
      const ratings = [FeedbackRating.POSITIVE, FeedbackRating.NEUTRAL, FeedbackRating.NEGATIVE];

      ratings.forEach((rating) => {
        const feedback = {
          orderLineItemId: 'order-123-item-1',
          rating,
        };
        expect(() => feedbackDataSchema.parse(feedback)).not.toThrow();
      });
    });
  });

  describe('infringementDataSchema', () => {
    it('accept valid ReportedItemType enum', () => {
      const validData = {
        itemId: '123456789',
        reportedItemType: ReportedItemType.LISTING,
        reportingReason: 'Copyright infringement',
      };
      expect(() => infringementDataSchema.parse(validData)).not.toThrow();
    });

    it('accept IMAGE reported item type', () => {
      const imageInfringement = {
        itemId: '987654321',
        reportedItemType: ReportedItemType.IMAGE,
        reportingReason: 'Unauthorized image use',
      };
      expect(() => infringementDataSchema.parse(imageInfringement)).not.toThrow();
    });
  });

  describe('listingFeesRequestSchema', () => {
    it('accept valid FormatType in offers', () => {
      const validData = {
        offers: [
          {
            offerId: 'offer-123',
            marketplaceId: 'EBAY_US',
            format: FormatType.FIXED_PRICE,
          },
        ],
      };
      expect(() => listingFeesRequestSchema.parse(validData)).not.toThrow();
    });

    it('accept AUCTION format in listing fees', () => {
      const auctionFeesRequest = {
        offers: [
          {
            offerId: 'offer-456',
            marketplaceId: 'EBAY_US',
            format: FormatType.AUCTION,
          },
        ],
      };
      expect(() => listingFeesRequestSchema.parse(auctionFeesRequest)).not.toThrow();
    });
  });

  describe('Cross-Schema Enum Consistency', () => {
    it('use the same TimeDurationUnit across schemas', () => {
      const durationData = {
        unit: TimeDurationUnit.BUSINESS_DAY,
        value: 3,
      };

      // Used in both timeDurationSchema and depositSchema
      expect(() => timeDurationSchema.parse(durationData)).not.toThrow();

      const depositData = {
        depositType: DepositType.PERCENTAGE,
        depositAmount: { currency: 'USD', value: '10' },
        dueIn: durationData,
      };
      expect(() => depositSchema.parse(depositData)).not.toThrow();
    });

    it('use the same FormatType across offer and listing fees schemas', () => {
      const format = FormatType.FIXED_PRICE;

      const offerData = {
        sku: 'TEST-SKU',
        marketplaceId: 'EBAY_US',
        format,
        availableQuantity: 10,
        categoryId: '12345',
        listingPolicies: {
          fulfillmentPolicyId: 'fp-123',
          paymentPolicyId: 'pp-123',
          returnPolicyId: 'rp-123',
        },
        pricingSummary: {
          price: { currency: 'USD', value: '99.99' },
        },
      };

      expect(() => offerSchema.parse(offerData)).not.toThrow();

      const feesData = {
        offers: [
          {
            offerId: 'offer-789',
            marketplaceId: 'EBAY_US',
            format,
          },
        ],
      };

      expect(() => listingFeesRequestSchema.parse(feesData)).not.toThrow();
    });
  });

  describe('Enum Validation Error Messages', () => {
    it('provide clear error for invalid enum value', () => {
      const invalidData = {
        unit: 'INVALID_UNIT',
        value: 30,
      };

      const parsed = timeDurationSchema.safeParse(invalidData);

      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(String(parsed.error)).toContain('unit');
      }
    });

    it('validate nested enum values', () => {
      const invalidData = {
        depositType: 'INVALID_TYPE',
        depositAmount: { currency: 'USD', value: '10' },
        dueIn: { unit: TimeDurationUnit.DAY, value: 7 },
      };

      expect(() => depositSchema.parse(invalidData)).toThrow();
    });
  });
});
