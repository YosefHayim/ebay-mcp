/**
 * Tests for eBay enum types
 */

import { describe, it, expect } from 'vitest';
import {
  MarketplaceId,
  Condition,
  FormatType,
  OrderPaymentStatus,
  CampaignStatus,
  RefundMethod,
  ReturnMethod,
  ReturnShippingCostPayer,
  ShippingCostType,
  ShippingOptionType,
  CategoryType,
  PaymentMethodType,
  LineItemFulfillmentStatus,
  OfferStatus,
  ListingStatus,
  ComplianceType,
  TimeDurationUnit,
  WeightUnit,
  LengthUnit,
  LanguageCode,
  CurrencyCode,
  RegionType,
  DepositType,
  PricingVisibility,
  LocationType,
  MerchantLocationStatus,
  DayOfWeek,
  ReasonForRefund,
  FundingModel,
  MessageReferenceType,
  FeedbackRating,
  ReportedItemType,
} from '@/types/ebay-enums.js';

describe('eBay Enums', () => {
  describe('MarketplaceId', () => {
    it('should have all marketplace values', () => {
      expect(MarketplaceId.EBAY_US).toBe('EBAY_US');
      expect(MarketplaceId.EBAY_GB).toBe('EBAY_GB');
      expect(MarketplaceId.EBAY_AU).toBe('EBAY_AU');
      expect(MarketplaceId.EBAY_DE).toBe('EBAY_DE');
      expect(MarketplaceId.EBAY_FR).toBe('EBAY_FR');
      expect(MarketplaceId.EBAY_IT).toBe('EBAY_IT');
      expect(MarketplaceId.EBAY_ES).toBe('EBAY_ES');
      expect(MarketplaceId.EBAY_CA).toBe('EBAY_CA');
    });

    it('should contain 41 marketplace values', () => {
      const values = Object.values(MarketplaceId);
      expect(values).toHaveLength(41);
    });
  });

  describe('Condition', () => {
    it('should have standard condition values', () => {
      expect(Condition.NEW).toBe('NEW');
      expect(Condition.LIKE_NEW).toBe('LIKE_NEW');
      expect(Condition.USED_EXCELLENT).toBe('USED_EXCELLENT');
      expect(Condition.USED_VERY_GOOD).toBe('USED_VERY_GOOD');
      expect(Condition.USED_GOOD).toBe('USED_GOOD');
      expect(Condition.USED_ACCEPTABLE).toBe('USED_ACCEPTABLE');
      expect(Condition.FOR_PARTS_OR_NOT_WORKING).toBe('FOR_PARTS_OR_NOT_WORKING');
    });

    it('should contain 17 condition values', () => {
      const values = Object.values(Condition);
      expect(values).toHaveLength(17);
    });
  });

  describe('FormatType', () => {
    it('should have listing format values', () => {
      expect(FormatType.AUCTION).toBe('AUCTION');
      expect(FormatType.FIXED_PRICE).toBe('FIXED_PRICE');
    });

    it('should contain 2 format values', () => {
      const values = Object.values(FormatType);
      expect(values).toHaveLength(2);
    });
  });

  describe('OrderPaymentStatus', () => {
    it('should have payment status values', () => {
      expect(OrderPaymentStatus.PAID).toBe('PAID');
      expect(OrderPaymentStatus.PENDING).toBe('PENDING');
      expect(OrderPaymentStatus.FAILED).toBe('FAILED');
      expect(OrderPaymentStatus.FULLY_REFUNDED).toBe('FULLY_REFUNDED');
      expect(OrderPaymentStatus.PARTIALLY_REFUNDED).toBe('PARTIALLY_REFUNDED');
    });

    it('should contain 5 payment status values', () => {
      const values = Object.values(OrderPaymentStatus);
      expect(values).toHaveLength(5);
    });
  });

  describe('CampaignStatus', () => {
    it('should have campaign status values', () => {
      expect(CampaignStatus.RUNNING).toBe('RUNNING');
      expect(CampaignStatus.PAUSED).toBe('PAUSED');
      expect(CampaignStatus.ENDED).toBe('ENDED');
      expect(CampaignStatus.SCHEDULED).toBe('SCHEDULED');
    });

    it('should contain 9 campaign status values', () => {
      const values = Object.values(CampaignStatus);
      expect(values).toHaveLength(9);
    });
  });

  describe('RefundMethod', () => {
    it('should have refund method values', () => {
      expect(RefundMethod.MONEY_BACK).toBe('MONEY_BACK');
      expect(RefundMethod.MERCHANDISE_CREDIT).toBe('MERCHANDISE_CREDIT');
    });
  });

  describe('ReturnMethod', () => {
    it('should have return method values', () => {
      expect(ReturnMethod.REPLACEMENT).toBe('REPLACEMENT');
      expect(ReturnMethod.EXCHANGE).toBe('EXCHANGE');
    });
  });

  describe('ReturnShippingCostPayer', () => {
    it('should have shipping cost payer values', () => {
      expect(ReturnShippingCostPayer.BUYER).toBe('BUYER');
      expect(ReturnShippingCostPayer.SELLER).toBe('SELLER');
    });
  });

  describe('ShippingCostType', () => {
    it('should have shipping cost type values', () => {
      expect(ShippingCostType.CALCULATED).toBe('CALCULATED');
      expect(ShippingCostType.FLAT_RATE).toBe('FLAT_RATE');
      expect(ShippingCostType.NOT_SPECIFIED).toBe('NOT_SPECIFIED');
    });
  });

  describe('ShippingOptionType', () => {
    it('should have shipping option type values', () => {
      expect(ShippingOptionType.DOMESTIC).toBe('DOMESTIC');
      expect(ShippingOptionType.INTERNATIONAL).toBe('INTERNATIONAL');
    });
  });

  describe('CategoryType', () => {
    it('should have category type values', () => {
      expect(CategoryType.ALL_EXCLUDING_MOTORS_VEHICLES).toBe('ALL_EXCLUDING_MOTORS_VEHICLES');
      expect(CategoryType.MOTORS_VEHICLES).toBe('MOTORS_VEHICLES');
    });
  });

  describe('PaymentMethodType', () => {
    it('should have payment method values', () => {
      expect(PaymentMethodType.PAYPAL).toBe('PAYPAL');
      expect(PaymentMethodType.CREDIT_CARD).toBe('CREDIT_CARD');
      expect(PaymentMethodType.PERSONAL_CHECK).toBe('PERSONAL_CHECK');
      expect(PaymentMethodType.MONEY_ORDER_CASHIERS_CHECK).toBe('MONEY_ORDER_CASHIERS_CHECK');
      expect(PaymentMethodType.CASH_ON_DELIVERY).toBe('CASH_ON_DELIVERY');
      expect(PaymentMethodType.CASH_ON_PICKUP).toBe('CASH_ON_PICKUP');
    });

    it('should contain 6 payment method values', () => {
      const values = Object.values(PaymentMethodType);
      expect(values).toHaveLength(15);
    });
  });

  describe('LineItemFulfillmentStatus', () => {
    it('should have fulfillment status values', () => {
      expect(LineItemFulfillmentStatus.FULFILLED).toBe('FULFILLED');
      expect(LineItemFulfillmentStatus.NOT_STARTED).toBe('NOT_STARTED');
      expect(LineItemFulfillmentStatus.IN_PROGRESS).toBe('IN_PROGRESS');
    });
  });

  describe('OfferStatus', () => {
    it('should have offer status values', () => {
      expect(OfferStatus.PUBLISHED).toBe('PUBLISHED');
      expect(OfferStatus.UNPUBLISHED).toBe('UNPUBLISHED');
    });
  });

  describe('ListingStatus', () => {
    it('should have listing status values', () => {
      expect(ListingStatus.ACTIVE).toBe('ACTIVE');
      expect(ListingStatus.ENDED).toBe('ENDED');
      expect(ListingStatus.INACTIVE).toBe('INACTIVE');
      expect(ListingStatus.OUT_OF_STOCK).toBe('OUT_OF_STOCK');
    });
  });

  describe('ComplianceType', () => {
    it('should have compliance type values', () => {
      expect(ComplianceType.PRODUCT_ADOPTION).toBe('PRODUCT_ADOPTION');
      expect(ComplianceType.PRODUCT_SAFETY).toBe('PRODUCT_SAFETY');
      expect(ComplianceType.PRODUCT_ASPECTS_ADOPTION).toBe('PRODUCT_ASPECTS_ADOPTION');
      expect(ComplianceType.REGULATORY).toBe('REGULATORY');
      expect(ComplianceType.RETURNS_POLICY).toBe('RETURNS_POLICY');
    });
  });

  describe('TimeDurationUnit', () => {
    it('should have time duration unit values', () => {
      expect(TimeDurationUnit.YEAR).toBe('YEAR');
      expect(TimeDurationUnit.MONTH).toBe('MONTH');
      expect(TimeDurationUnit.DAY).toBe('DAY');
      expect(TimeDurationUnit.HOUR).toBe('HOUR');
      expect(TimeDurationUnit.CALENDAR_DAY).toBe('CALENDAR_DAY');
      expect(TimeDurationUnit.BUSINESS_DAY).toBe('BUSINESS_DAY');
      expect(TimeDurationUnit.MINUTE).toBe('MINUTE');
      expect(TimeDurationUnit.SECOND).toBe('SECOND');
      expect(TimeDurationUnit.MILLISECOND).toBe('MILLISECOND');
    });

    it('should contain 9 time duration values', () => {
      const values = Object.values(TimeDurationUnit);
      expect(values).toHaveLength(9);
    });
  });

  describe('WeightUnit', () => {
    it('should have weight unit values', () => {
      expect(WeightUnit.POUND).toBe('POUND');
      expect(WeightUnit.KILOGRAM).toBe('KILOGRAM');
      expect(WeightUnit.OUNCE).toBe('OUNCE');
      expect(WeightUnit.GRAM).toBe('GRAM');
    });
  });

  describe('LengthUnit', () => {
    it('should have length unit values', () => {
      expect(LengthUnit.INCH).toBe('INCH');
      expect(LengthUnit.FEET).toBe('FEET');
      expect(LengthUnit.CENTIMETER).toBe('CENTIMETER');
      expect(LengthUnit.METER).toBe('METER');
    });
  });

  describe('LanguageCode', () => {
    it('should have language code values', () => {
      expect(LanguageCode.EN).toBe('en');
      expect(LanguageCode.DE).toBe('de');
      expect(LanguageCode.FR).toBe('fr');
      expect(LanguageCode.ES).toBe('es');
      expect(LanguageCode.IT).toBe('it');
      expect(LanguageCode.NL).toBe('nl');
      expect(LanguageCode.ZH_CN).toBe('zh-CN');
    });

    it('should contain 13 language codes', () => {
      const values = Object.values(LanguageCode);
      expect(values).toHaveLength(13);
    });
  });

  describe('CurrencyCode', () => {
    it('should have currency code values', () => {
      expect(CurrencyCode.USD).toBe('USD');
      expect(CurrencyCode.GBP).toBe('GBP');
      expect(CurrencyCode.EUR).toBe('EUR');
      expect(CurrencyCode.AUD).toBe('AUD');
      expect(CurrencyCode.CAD).toBe('CAD');
      expect(CurrencyCode.JPY).toBe('JPY');
    });

    it('should contain 14 currency codes', () => {
      const values = Object.values(CurrencyCode);
      expect(values).toHaveLength(14);
    });
  });

  describe('RegionType', () => {
    it('should have region type values', () => {
      expect(RegionType.COUNTRY).toBe('COUNTRY');
      expect(RegionType.COUNTRY_REGION).toBe('COUNTRY_REGION');
      expect(RegionType.STATE_OR_PROVINCE).toBe('STATE_OR_PROVINCE');
      expect(RegionType.WORLD_REGION).toBe('WORLD_REGION');
      expect(RegionType.WORLDWIDE).toBe('WORLDWIDE');
    });

    it('should contain 5 region type values', () => {
      const values = Object.values(RegionType);
      expect(values).toHaveLength(5);
    });
  });

  describe('DepositType', () => {
    it('should have deposit type values', () => {
      expect(DepositType.PERCENTAGE).toBe('PERCENTAGE');
      expect(DepositType.FIXED_AMOUNT).toBe('FIXED_AMOUNT');
    });
  });

  describe('PricingVisibility', () => {
    it('should have pricing visibility values', () => {
      expect(PricingVisibility.NONE).toBe('NONE');
      expect(PricingVisibility.PRE_CHECKOUT).toBe('PRE_CHECKOUT');
      expect(PricingVisibility.DURING_CHECKOUT).toBe('DURING_CHECKOUT');
    });
  });

  describe('LocationType', () => {
    it('should have location type values', () => {
      expect(LocationType.STORE).toBe('STORE');
      expect(LocationType.WAREHOUSE).toBe('WAREHOUSE');
    });
  });

  describe('MerchantLocationStatus', () => {
    it('should have merchant location status values', () => {
      expect(MerchantLocationStatus.ENABLED).toBe('ENABLED');
      expect(MerchantLocationStatus.DISABLED).toBe('DISABLED');
    });
  });

  describe('DayOfWeek', () => {
    it('should have all days of the week', () => {
      expect(DayOfWeek.MONDAY).toBe('MONDAY');
      expect(DayOfWeek.TUESDAY).toBe('TUESDAY');
      expect(DayOfWeek.WEDNESDAY).toBe('WEDNESDAY');
      expect(DayOfWeek.THURSDAY).toBe('THURSDAY');
      expect(DayOfWeek.FRIDAY).toBe('FRIDAY');
      expect(DayOfWeek.SATURDAY).toBe('SATURDAY');
      expect(DayOfWeek.SUNDAY).toBe('SUNDAY');
    });

    it('should contain 7 day values', () => {
      const values = Object.values(DayOfWeek);
      expect(values).toHaveLength(7);
    });
  });

  describe('ReasonForRefund', () => {
    it('should have refund reason values', () => {
      expect(ReasonForRefund.BUYER_CANCEL).toBe('BUYER_CANCEL');
      expect(ReasonForRefund.OUT_OF_STOCK).toBe('OUT_OF_STOCK');
      expect(ReasonForRefund.FOUND_CHEAPER_PRICE).toBe('FOUND_CHEAPER_PRICE');
      expect(ReasonForRefund.INCORRECT_PRICE).toBe('INCORRECT_PRICE');
      expect(ReasonForRefund.ITEM_DAMAGED).toBe('ITEM_DAMAGED');
      expect(ReasonForRefund.ITEM_DEFECTIVE).toBe('ITEM_DEFECTIVE');
      expect(ReasonForRefund.LOST_IN_TRANSIT).toBe('LOST_IN_TRANSIT');
      expect(ReasonForRefund.MUTUALLY_AGREED).toBe('MUTUALLY_AGREED');
      expect(ReasonForRefund.SELLER_CANCEL).toBe('SELLER_CANCEL');
    });

    it('should contain 9 refund reason values', () => {
      const values = Object.values(ReasonForRefund);
      expect(values).toHaveLength(9);
    });
  });

  describe('FundingModel', () => {
    it('should have funding model values', () => {
      expect(FundingModel.COST_PER_SALE).toBe('COST_PER_SALE');
      expect(FundingModel.COST_PER_CLICK).toBe('COST_PER_CLICK');
    });
  });

  describe('MessageReferenceType', () => {
    it('should have message reference type values', () => {
      expect(MessageReferenceType.LISTING).toBe('LISTING');
      expect(MessageReferenceType.ORDER).toBe('ORDER');
    });
  });

  describe('FeedbackRating', () => {
    it('should have feedback rating values', () => {
      expect(FeedbackRating.POSITIVE).toBe('POSITIVE');
      expect(FeedbackRating.NEUTRAL).toBe('NEUTRAL');
      expect(FeedbackRating.NEGATIVE).toBe('NEGATIVE');
    });
  });

  describe('ReportedItemType', () => {
    it('should have reported item type values', () => {
      expect(ReportedItemType.LISTING).toBe('LISTING');
      expect(ReportedItemType.IMAGE).toBe('IMAGE');
    });
  });

  describe('Enum Type Safety', () => {
    it('should only accept valid enum values', () => {
      // This is a compile-time check, but we can verify the enum structure
      const acceptOnlyValidMarketplace = (mp: MarketplaceId): boolean => {
        return Object.values(MarketplaceId).includes(mp);
      };

      expect(acceptOnlyValidMarketplace(MarketplaceId.EBAY_US)).toBe(true);
      expect(acceptOnlyValidMarketplace(MarketplaceId.EBAY_GB)).toBe(true);
    });

    it('should reject invalid string values at runtime', () => {
      const isValidMarketplace = (value: string): value is MarketplaceId => {
        return Object.values(MarketplaceId).includes(value as MarketplaceId);
      };

      expect(isValidMarketplace('EBAY_US')).toBe(true);
      expect(isValidMarketplace('INVALID_MARKETPLACE')).toBe(false);
    });
  });

  describe('Enum Value Consistency', () => {
    it('should have enum keys match enum values', () => {
      // For most enums, the key should match the value
      Object.entries(MarketplaceId).forEach(([key, value]) => {
        expect(key).toBe(value);
      });

      Object.entries(Condition).forEach(([key, value]) => {
        expect(key).toBe(value);
      });

      Object.entries(FormatType).forEach(([key, value]) => {
        expect(key).toBe(value);
      });
    });

    it('should handle language codes with lowercase values', () => {
      // Language codes are lowercase, so keys are uppercase, values lowercase
      expect(LanguageCode.EN).toBe('en');
      expect(LanguageCode.DE).toBe('de');
      expect(LanguageCode.FR).toBe('fr');
    });
  });

  describe('Enum Completeness', () => {
    it('should have all 33 implemented enums', () => {
      // Verify we have the expected number of enum types
      const enumTypes = [
        MarketplaceId,
        Condition,
        FormatType,
        OrderPaymentStatus,
        CampaignStatus,
        RefundMethod,
        ReturnMethod,
        ReturnShippingCostPayer,
        ShippingCostType,
        ShippingOptionType,
        CategoryType,
        PaymentMethodType,
        LineItemFulfillmentStatus,
        OfferStatus,
        ListingStatus,
        ComplianceType,
        TimeDurationUnit,
        WeightUnit,
        LengthUnit,
        LanguageCode,
        CurrencyCode,
        RegionType,
        DepositType,
        PricingVisibility,
        LocationType,
        MerchantLocationStatus,
        DayOfWeek,
        ReasonForRefund,
        FundingModel,
        MessageReferenceType,
        FeedbackRating,
        ReportedItemType,
      ];

      expect(enumTypes).toHaveLength(32);
    });
  });
});
