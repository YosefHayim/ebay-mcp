/**
 * Comprehensive eBay API Enum Definitions
 *
 * This file contains TypeScript enums for common eBay API values.
 * These enums are extracted from eBay's OpenAPI specifications and
 * official developer documentation.
 *
 * Reference: https://developer.ebay.com/api-docs/
 */

/**
 * eBay Marketplace Identifiers
 *
 * Used across multiple APIs to specify which eBay marketplace to target.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/account/types/ba:MarketplaceIdEnum
 */
export enum MarketplaceId {
  /** Austria - https://www.ebay.at */
  EBAY_AT = 'EBAY_AT',

  /** Australia - https://www.ebay.com.au */
  EBAY_AU = 'EBAY_AU',

  /** Belgium - https://www.ebay.be/ */
  EBAY_BE = 'EBAY_BE',

  /** Canada - https://www.ebay.ca */
  EBAY_CA = 'EBAY_CA',

  /** Switzerland - https://www.ebay.ch */
  EBAY_CH = 'EBAY_CH',

  /** China - Reserved for future use */
  EBAY_CN = 'EBAY_CN',

  /** Czech Republic - Reserved for future use */
  EBAY_CZ = 'EBAY_CZ',

  /** Germany - https://www.ebay.de */
  EBAY_DE = 'EBAY_DE',

  /** Denmark - Reserved for future use */
  EBAY_DK = 'EBAY_DK',

  /** Spain - https://www.ebay.es */
  EBAY_ES = 'EBAY_ES',

  /** Finland - Reserved for future use */
  EBAY_FI = 'EBAY_FI',

  /** France - https://www.ebay.fr */
  EBAY_FR = 'EBAY_FR',

  /** United Kingdom - https://www.ebay.co.uk */
  EBAY_GB = 'EBAY_GB',

  /** Greece - Reserved for future use */
  EBAY_GR = 'EBAY_GR',

  /** Hong Kong - https://www.ebay.com.hk */
  EBAY_HK = 'EBAY_HK',

  /** Hungary - Reserved for future use */
  EBAY_HU = 'EBAY_HU',

  /** Indonesia - Reserved for future use */
  EBAY_ID = 'EBAY_ID',

  /** Ireland - https://www.ebay.ie */
  EBAY_IE = 'EBAY_IE',

  /** Israel - Reserved for future use */
  EBAY_IL = 'EBAY_IL',

  /** India - Reserved for future use */
  EBAY_IN = 'EBAY_IN',

  /** Italy - https://www.ebay.it */
  EBAY_IT = 'EBAY_IT',

  /** Japan - Reserved for future use */
  EBAY_JP = 'EBAY_JP',

  /** Malaysia - https://www.ebay.com.my */
  EBAY_MY = 'EBAY_MY',

  /** Netherlands - https://www.ebay.nl */
  EBAY_NL = 'EBAY_NL',

  /** Norway - Reserved for future use */
  EBAY_NO = 'EBAY_NO',

  /** New Zealand - Reserved for future use */
  EBAY_NZ = 'EBAY_NZ',

  /** Peru - Reserved for future use */
  EBAY_PE = 'EBAY_PE',

  /** Philippines - https://www.ebay.ph */
  EBAY_PH = 'EBAY_PH',

  /** Poland - https://www.ebay.pl */
  EBAY_PL = 'EBAY_PL',

  /** Puerto Rico - Reserved for future use */
  EBAY_PR = 'EBAY_PR',

  /** Portugal - Reserved for future use */
  EBAY_PT = 'EBAY_PT',

  /** Russia - Reserved for future use */
  EBAY_RU = 'EBAY_RU',

  /** Sweden - Reserved for future use */
  EBAY_SE = 'EBAY_SE',

  /** Singapore - https://www.ebay.com.sg */
  EBAY_SG = 'EBAY_SG',

  /** Thailand - https://info.ebay.co.th */
  EBAY_TH = 'EBAY_TH',

  /** Taiwan - https://www.ebay.com.tw */
  EBAY_TW = 'EBAY_TW',

  /** United States - https://www.ebay.com */
  EBAY_US = 'EBAY_US',

  /** Vietnam - https://www.ebay.vn */
  EBAY_VN = 'EBAY_VN',

  /** South Africa - Reserved for future use */
  EBAY_ZA = 'EBAY_ZA',

  /** eBay Half.com US - No longer used */
  EBAY_HALF_US = 'EBAY_HALF_US',

  /** eBay Motors US - Parent category for Auto Parts and Vehicles on EBAY_US */
  EBAY_MOTORS_US = 'EBAY_MOTORS_US',
}

/**
 * Item Condition Enums
 *
 * Specifies the condition of an item being listed.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/inventory/types/slr:ConditionEnum
 */
export enum Condition {
  /** Brand-new, unopened item in its original packaging */
  NEW = 'NEW',

  /** Item opened but very lightly used; for trading cards indicates Graded status */
  LIKE_NEW = 'LIKE_NEW',

  /** New, unused item missing original packaging or not sealed */
  NEW_OTHER = 'NEW_OTHER',

  /** New item with defects like scuffs or missing buttons */
  NEW_WITH_DEFECTS = 'NEW_WITH_DEFECTS',

  /** @deprecated Use CERTIFIED_REFURBISHED instead */
  MANUFACTURER_REFURBISHED = 'MANUFACTURER_REFURBISHED',

  /** Pristine, like-new condition inspected and refurbished by manufacturer */
  CERTIFIED_REFURBISHED = 'CERTIFIED_REFURBISHED',

  /** Like new condition, refurbished with minimal wear */
  EXCELLENT_REFURBISHED = 'EXCELLENT_REFURBISHED',

  /** Minimal wear, refurbished by manufacturer or approved vendor */
  VERY_GOOD_REFURBISHED = 'VERY_GOOD_REFURBISHED',

  /** Moderate wear, inspected and refurbished */
  GOOD_REFURBISHED = 'GOOD_REFURBISHED',

  /** Restored to working order by seller or third party */
  SELLER_REFURBISHED = 'SELLER_REFURBISHED',

  /** Used but excellent condition; for apparel means Pre-owned Good */
  USED_EXCELLENT = 'USED_EXCELLENT',

  /** Used but very good condition; for trading cards means Ungraded */
  USED_VERY_GOOD = 'USED_VERY_GOOD',

  /** Used but in good condition */
  USED_GOOD = 'USED_GOOD',

  /** Used item in acceptable condition */
  USED_ACCEPTABLE = 'USED_ACCEPTABLE',

  /** Item not fully functioning; needs repair or parts harvesting */
  FOR_PARTS_OR_NOT_WORKING = 'FOR_PARTS_OR_NOT_WORKING',

  /** Previously owned, excellent condition; apparel categories only */
  PRE_OWNED_EXCELLENT = 'PRE_OWNED_EXCELLENT',

  /** Previously owned with significant visible flaws; apparel only */
  PRE_OWNED_FAIR = 'PRE_OWNED_FAIR',
}

/**
 * Listing Format Types
 *
 * Specifies whether a listing is auction or fixed-price.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/inventory/types/slr:FormatTypeEnum
 */
export enum FormatType {
  /** Auction listing format */
  AUCTION = 'AUCTION',

  /** Fixed-price listing format */
  FIXED_PRICE = 'FIXED_PRICE',
}

/**
 * Order Payment Status
 *
 * Indicates the payment status of an order.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/fulfillment/types/sel:OrderPaymentStatusEnum
 */
export enum OrderPaymentStatus {
  /** Buyer payment or refund has failed */
  FAILED = 'FAILED',

  /** Full amount of the order has been refunded to the buyer */
  FULLY_REFUNDED = 'FULLY_REFUNDED',

  /** Order has been paid in full. Safe for seller to ship */
  PAID = 'PAID',

  /** Partial amount of the order has been refunded to the buyer */
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',

  /** Buyer payment or seller refund is in pending state */
  PENDING = 'PENDING',
}

/**
 * Marketing Campaign Status
 *
 * Indicates the current status of a Promoted Listings campaign.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/marketing/types/pls:CampaignStatusEnum
 */
export enum CampaignStatus {
  /** Campaign is deleted and no longer accessible */
  DELETED = 'DELETED',

  /** Campaign is inactive and in draft status */
  DRAFT = 'DRAFT',

  /** Campaign has ended and cannot be restarted */
  ENDED = 'ENDED',

  /** Request to end campaign received, system is processing */
  ENDING_SOON = 'ENDING_SOON',

  /** Campaign is paused, listings not being promoted */
  PAUSED = 'PAUSED',

  /** Criterion-based campaign in process of being created */
  PENDING = 'PENDING',

  /** Campaign is active, listings are being promoted */
  RUNNING = 'RUNNING',

  /** Campaign created but scheduled to start on future date */
  SCHEDULED = 'SCHEDULED',

  /** System-generated pause due to seller's Below Standard level */
  SYSTEM_PAUSED = 'SYSTEM_PAUSED',
}

/**
 * Refund Method Types
 *
 * Specifies the refund method for return policies.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/account/types/api:RefundMethodEnum
 */
export enum RefundMethod {
  /** Refund in money back to buyer */
  MONEY_BACK = 'MONEY_BACK',

  /** Refund as merchandise credit */
  MERCHANDISE_CREDIT = 'MERCHANDISE_CREDIT',
}

/**
 * Return Method Types
 *
 * Specifies how returns are handled.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/account/types/api:ReturnMethodEnum
 */
export enum ReturnMethod {
  /** Replacement item provided */
  REPLACEMENT = 'REPLACEMENT',

  /** Item exchange */
  EXCHANGE = 'EXCHANGE',
}

/**
 * Return Shipping Cost Payer
 *
 * Specifies who pays for return shipping.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/account/types/api:ReturnShippingCostPayerEnum
 */
export enum ReturnShippingCostPayer {
  /** Buyer pays for return shipping */
  BUYER = 'BUYER',

  /** Seller pays for return shipping */
  SELLER = 'SELLER',
}

/**
 * Time Duration Units
 *
 * Units for time-based durations used across multiple APIs.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/account/types/ba:TimeDurationUnitEnum
 */
export enum TimeDurationUnit {
  /** Year */
  YEAR = 'YEAR',

  /** Month */
  MONTH = 'MONTH',

  /** Day */
  DAY = 'DAY',

  /** Hour */
  HOUR = 'HOUR',

  /** Calendar day */
  CALENDAR_DAY = 'CALENDAR_DAY',

  /** Business day */
  BUSINESS_DAY = 'BUSINESS_DAY',

  /** Minute */
  MINUTE = 'MINUTE',

  /** Second */
  SECOND = 'SECOND',

  /** Millisecond */
  MILLISECOND = 'MILLISECOND',
}

/**
 * Shipping Cost Types
 *
 * Specifies how shipping costs are calculated.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/account/types/api:ShippingCostTypeEnum
 */
export enum ShippingCostType {
  /** Flat rate shipping */
  FLAT_RATE = 'FLAT_RATE',

  /** Calculated shipping based on weight/dimensions */
  CALCULATED = 'CALCULATED',

  /** Not specified */
  NOT_SPECIFIED = 'NOT_SPECIFIED',
}

/**
 * Shipping Option Types
 *
 * Specifies domestic or international shipping.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/account/types/api:ShippingOptionTypeEnum
 */
export enum ShippingOptionType {
  /** Domestic shipping */
  DOMESTIC = 'DOMESTIC',

  /** International shipping */
  INTERNATIONAL = 'INTERNATIONAL',
}

/**
 * Category Types
 *
 * Specifies eBay category types for business policies.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/account/types/api:CategoryTypeEnum
 */
export enum CategoryType {
  /** All categories */
  ALL_EXCLUDING_MOTORS_VEHICLES = 'ALL_EXCLUDING_MOTORS_VEHICLES',

  /** Motors vehicles category */
  MOTORS_VEHICLES = 'MOTORS_VEHICLES',
}

/**
 * Payment Method Types
 *
 * Specifies available payment methods.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/account/types/api:PaymentMethodTypeEnum
 */
export enum PaymentMethodType {
  /** Credit card payment */
  CREDIT_CARD = 'CREDIT_CARD', // This payment method is no longer valid.

  /** PayPal payment */
  PAYPAL = 'PAYPAL', // This payment method is no longer valid.

  /** Personal check */
  PERSONAL_CHECK = 'PERSONAL_CHECK', // This enumeration value indicates that the payment method will be a Personal check.

  /** Money order or cashier's check */
  MONEY_ORDER_CASHIERS_CHECK = 'MONEY_ORDER_CASHIERS_CHECK', // This enumeration value indicates that the payment method will be a Cashier Check.

  /** Cash on delivery */
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY', // This enumeration value indicates that the payment method will be cash, and the transaction will occur after the item is delivered to the buyer.

  /** Cash on pickup */
  CASH_ON_PICKUP = 'CASH_ON_PICKUP', // This enumeration value indicates that the payment method will be cash, and the transaction will occur when the buyer picks up the item.

  /** This enumeration value indicates that the payment method will be cash, and the transaction will occur in-person. */
  CASH_IN_PERSON = 'CASH_IN_PERSON',

  /** This enumeration value indicates that escrow was used as the payment method to pay for the order. This form of payment is used for high-value orders. */
  ESCROW = 'ESCROW',

  /** This payment method is no longer valid. */
  INTEGRATED_MERCHANT_CREDIT_CARD = 'INTEGRATED_MERCHANT_CREDIT_CARD',

  /** This payment method is no longer valid. */
  LOAN_CHECK = 'LOAN_CHECK',

  /** This enumeration value indicates that the payment method will be by a Money Order. */
  MONEY_ORDER = 'MONEY_ORDER',

  /** This payment method is no longer valid. */
  PAISA_PAY = 'PAISA_PAY',

  /** This payment method is no longer valid. */
  PAISA_PAY_ESCROW = 'PAISA_PAY_ESCROW',

  /** This payment method is no longer valid. */
  PAISA_PAY_ESCROW_EMI = 'PAISA_PAY_ESCROW_EMI',

  /** This enumeration value indicates that the seller is offering an offline payment method not otherwise covered. */
  OTHER = 'OTHER',
}

/**
 * Line Item Fulfillment Status
 *
 * Status of individual line items in an order.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/fulfillment/types/sel:LineItemFulfillmentStatusEnum
 */
export enum LineItemFulfillmentStatus {
  /** Line item has been fulfilled */
  FULFILLED = 'FULFILLED',

  /** In process of fulfillment */
  IN_PROGRESS = 'IN_PROGRESS',

  /** Not started */
  NOT_STARTED = 'NOT_STARTED',
}

/**
 * Offer Status
 *
 * Current status of an inventory offer.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/inventory/types/slr:OfferStatusEnum
 */
export enum OfferStatus {
  /** Offer is published and active */
  PUBLISHED = 'PUBLISHED',

  /** Offer is unpublished */
  UNPUBLISHED = 'UNPUBLISHED',
}

/**
 * Listing Status
 *
 * Current status of a listing.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/inventory/types/slr:ListingStatusEnum
 */
export enum ListingStatus {
  /** Listing is active */
  ACTIVE = 'ACTIVE', // This enumeration value indicates that the eBay listing associated with the offer is active.

  /** Listing is out of stock */
  OUT_OF_STOCK = 'OUT_OF_STOCK', // This enumeration value indicates that the eBay listing associated with the offer is still active, but that the product is currently out-of-stock. If a single-variation listing is out-of-stock, that listing will be kept alive but hidden from search. If a variation inside a multiple-variation listing is out-of-stock, only that variation is hidden, but the listing remains active and discoverable.

  /** Listing has ended */
  ENDED = 'ENDED', // This enumeration value indicates that the eBay listing associated with the offer has ended.

  /** Listing is inactive */
  INACTIVE = 'INACTIVE', // This enumeration value indicates that the eBay listing associated with the offer is currently inactive.

  /** This enumeration value indicates that the eBay customer service has administratively ended the eBay listing associated with the offer. */
  EBAY_ENDED = 'EBAY_ENDED',

  /** This enumeration value indicates that the eBay listing associated with the offer has yet to be listed. */
  NOT_LISTED = 'NOT_LISTED',

  /** This enumeration value indicates that the eBay listing associated with the offer has ended. */
  // ENDED = 'ENDED', // Duplicate, already defined above
}

/**
 * Compliance Types
 *
 * Types of compliance issues.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/compliance/types/com:ComplianceTypeEnum
 */
export enum ComplianceType {
  /** @deprecated Note: The ASPECTS_ADOPTION compliance type has been deprecated and will be decommissioned on September 9th, 2025.
   * Use this compliance type to see if a seller's listings have missing or invalid item aspects (item specifics).
   * For each category, eBay maintains a list of required and recommended item aspects. */
  ASPECTS_ADOPTION = 'ASPECTS_ADOPTION',

  /** Use this compliance type to see if any of the seller's listings are violating eBay's policy of using an 'HTTP' link
   * (to eBay and non-eBay sites) in the listing instead of 'HTTPS' links. This requirement includes links to externally-hosted
   * listing images. If the server hosting the listing images does not support the HTTPS protocol, this server cannot be used
   * to host listing images. */
  HTTPS = 'HTTPS',

  /** Use this compliance type to see if any listings are violating eBay's policy of not allowing links in the listing to sites
   * outside of eBay. The seller including a personal email address and/or a phone number in the listing is also a violation of this policy.
   * All communication between seller and buyers should be handled through eBay's communication system. The only exceptions to this
   * outside links rule are links to product videos, information on freight shipping services, or any legally required information. */
  OUTSIDE_EBAY_BUYING_AND_SELLING = 'OUTSIDE_EBAY_BUYING_AND_SELLING',

  /** Product safety compliance */
  PRODUCT_SAFETY = 'PRODUCT_SAFETY',

  /** Product Adoption is not enforced at this time, so this compliance type is not currently applicable. */
  PRODUCT_ADOPTION = 'PRODUCT_ADOPTION',

  /** Product Adoption is not enforced at this time, so this compliance type is not currently applicable. */
  PRODUCT_ADOPTION_CONFORMANCE = 'PRODUCT_ADOPTION_CONFORMANCE',

  /** Regulatory compliance */
  REGULATORY = 'REGULATORY',

  /** Returns policy compliance */
  RETURNS_POLICY = 'RETURNS_POLICY',
}

/**
 * Language Codes (ISO 639-1)
 *
 * Two-letter language codes used for content localization.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/inventory/types/slr:LocaleEnum
 */
// This enumeration type contains the different locales that can be used. The locale value indicates the language that is used to express the inventory item details.
export enum LanguageCode {
  /** This value indicates the content is localized for US English. */
  EN_US = 'en_US',

  /** This value indicates the content is localized for Canadian English. */
  EN_CA = 'en_CA',

  /** This value indicates the content is localized for Canadian French. */
  FR_CA = 'fr_CA',

  /** This value indicates the content is localized for UK English. */
  EN_GB = 'en_GB',

  /** This value indicates the content is localized for Australian English. */
  EN_AU = 'en_AU',

  /** This value indicates the content is localized for English but on the India site. Note: eBay India is no longer a functioning eBay marketplace. */
  EN_IN = 'en_IN',

  /** This value indicates the content is localized for German speakers on the Austria site. */
  DE_AT = 'de_AT',

  /** This value indicates the content is localized for French speakers on the Belgium site. */
  FR_BE = 'fr_BE',

  /** This value indicates the content is localized for French speakers on the France site. */
  FR_FR = 'fr_FR',

  /** This value indicates the content is localized for German speakers on the Germany site. */
  DE_DE = 'de_DE',

  /** This value indicates the content is localized for Italian speakers on the Italy site. */
  IT_IT = 'it_IT',

  /** This value indicates the content is localized for Dutch speakers on the Belgium site. */
  NL_BE = 'nl_BE',

  /** This value indicates the content is localized for Dutch speakers on the Netherlands site. */
  NL_NL = 'nl_NL',

  /** This value indicates the content is localized for Spanish speakers on the Spain site. */
  ES_ES = 'es_ES',

  /** This value indicates the content is localized for Germany speakers on the Switzerland site. */
  DE_CH = 'de_CH',

  /** This value indicates the content is localized for Finnish speakers. */
  FI_FI = 'fi_FI',

  /** This value indicates the content is localized for Chinese speakers on the Hong Kong site. */
  ZH_HK = 'zh_HK',

  /** This value indicates the content is localized for Hungarian speakers. */
  HU_HU = 'hu_HU',

  /** This value indicates the content is localized for English speakers on the Philippines site. */
  EN_PH = 'en_PH',

  /** This value indicates the content is localized for Polish speakers on the Poland site. */
  PL_PL = 'pl_PL',

  /** This value indicates the content is localized for Portuguese speakers. */
  PT_PT = 'pt_PT',

  /** This value indicates the content is localized for Russian speakers. */
  RU_RU = 'ru_RU',

  /** This value indicates the content is localized for English on the Singapore site. */
  EN_SG = 'en_SG',

  /** This value indicates the content is localized for English on the Ireland site. */
  EN_IE = 'en_IE',

  /** This value indicates the content is localized for English on the Malaysia site. */
  EN_MY = 'en_MY',

  /** English (generic) */
  EN = 'en', // Keep generic 'en' for broader compatibility if needed

  /** German (generic) */
  DE = 'de', // Keep generic 'de' for broader compatibility if needed

  /** Chinese (Simplified) (generic) */
  ZH_CN = 'zh-CN',

  /** Chinese (Traditional) */
  ZH_TW = 'zh-TW',

  /** Japanese */
  JA = 'ja',

  /** Korean */
  KO = 'ko',
}

/**
 * Weight Units of Measure
 *
 * Units for weight measurements.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/inventory/types/slr:WeightUnitOfMeasureEnum
 */
export enum WeightUnit {
  /** Pound */
  POUND = 'POUND',

  /** Kilogram */
  KILOGRAM = 'KILOGRAM',

  /** Ounce */
  OUNCE = 'OUNCE',

  /** Gram */
  GRAM = 'GRAM',
}

/**
 * Length Units of Measure
 *
 * Units for length/dimension measurements.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/inventory/types/slr:LengthUnitOfMeasureEnum
 */
export enum LengthUnit {
  /** Inch */
  INCH = 'INCH',

  /** Feet */
  FEET = 'FEET',

  /** Centimeter */
  CENTIMETER = 'CENTIMETER',

  /** Meter */
  METER = 'METER',
}

/**
 * Currency Codes (ISO 4217)
 *
 * Three-letter currency codes.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/account/types/ba:CurrencyCodeEnum
 */
// This enumerated type lists the three-letter ISO 4217 codes representing the supported world currencies.
export enum CurrencyCode {
  /** US Dollar */
  USD = 'USD',
  /** Canadian Dollar */
  CAD = 'CAD',
  /** Euro */
  EUR = 'EUR',
  /** British Pound */
  GBP = 'GBP',
  /** Australian Dollar */
  AUD = 'AUD',
  /** Swiss Franc */
  CHF = 'CHF',
  /** Hong Kong Dollar */
  HKD = 'HKD',
  /** Malaysian Ringgit */
  MYR = 'MYR',
  /** Philippine Peso */
  PHP = 'PHP',
  /** Polish Zloty */
  PLN = 'PLN',
  /** Singapore Dollar */
  SGD = 'SGD',
  /** New Taiwan Dollar */
  TWD = 'TWD',
  /** Thai Baht */
  THB = 'THB',
  /** Japanese Yen */
  JPY = 'JPY',
  /** The currency is the United Arab Emirates dirham. */
  AED = 'AED',
  /** The currency is the Afghan afghani. */
  AFN = 'AFN',
  /** The currency is the Albanian lek. */
  ALL = 'ALL',
  /** The currency is the Armenian dram. */
  AMD = 'AMD',
  /** The currency is the Netherlands Antillean guilder. */
  ANG = 'ANG',
  /** The currency is the Angolan kwanza. */
  AOA = 'AOA',
  /** The currency is the Argentine peso. */
  ARS = 'ARS',
  /** The currency is the Aruban florin. */
  AWG = 'AWG',
  /** The currency is the Azerbaijani manat. */
  AZN = 'AZN',
  /** The currency is the Bosnia and Herzegovina convertible mark. */
  BAM = 'BAM',
  /** The currency is the Barbados dollar. */
  BBD = 'BBD',
  /** The currency is the Bangladeshi taka. */
  BDT = 'BDT',
  /** The currency is the Bulgarian lev. */
  BGN = 'BGN',
  /** The currency is the Bahraini dinar. */
  BHD = 'BHD',
  /** The currency is the Burundian franc. */
  BIF = 'BIF',
  /** The currency is the Bermudian dollar. */
  BMD = 'BMD',
  /** The currency is the Brunei dollar. */
  BND = 'BND',
  /** The currency is the Bolivian Boliviano. */
  BOB = 'BOB',
  /** The currency is the Brazilian real. */
  BRL = 'BRL',
  /** The currency is the Bahamian dollar. */
  BSD = 'BSD',
  /** The currency is the Bhutanese ngultrum. */
  BTN = 'BTN',
  /** The currency is the Botswana pula. */
  BWP = 'BWP',
  /** The currency is the Belarusian ruble. */
  BYR = 'BYR',
  /** The currency is the Belize dollar. */
  BZD = 'BZD',
  /** The currency is the Congolese franc. */
  CDF = 'CDF',
  /** The currency is the Chilean peso. */
  CLP = 'CLP',
  /** The currency is the Chinese yuan renminbi. */
  CNY = 'CNY',
  /** The currency is the Colombian peso. */
  COP = 'COP',
  /** The currency is the Costa Rican colon. */
  CRC = 'CRC',
  /** The currency is the Cuban peso. */
  CUP = 'CUP',
  /** The currency is the Cape Verde escudo. */
  CVE = 'CVE',
  /** The currency is the Czech koruna. */
  CZK = 'CZK',
  /** The currency is the Djiboutian franc. */
  DJF = 'DJF',
  /** The currency is the Danish krone. */
  DKK = 'DKK',
  /** The currency is the Dominican peso. */
  DOP = 'DOP',
  /** The currency is the Algerian dinar. */
  DZD = 'DZD',
  /** The currency is the Egyptian pound. */
  EGP = 'EGP',
  /** The currency is the Eritrean nakfa. */
  ERN = 'ERN',
  /** The currency is the Ethiopian birr. */
  ETB = 'ETB',
  /** The currency is the Fiji dollar. */
  FJD = 'FJD',
  /** The currency is the Falkland Islands pound. */
  FKP = 'FKP',
  /** The currency is the Georgian lari. */
  GEL = 'GEL',
  /** The currency is the Ghanaian cedi. */
  GHS = 'GHS',
  /** The currency is the Gibraltar pound. */
  GIP = 'GIP',
  /** The currency is the Gambian dalasi. */
  GMD = 'GMD',
  /** The currency is the Guinean franc. */
  GNF = 'GNF',
  /** The currency is the Guatemalan quetzal. */
  GTQ = 'GTQ',
  /** The currency is the Guyanese dollar. */
  GYD = 'GYD',
  /** The currency is the Honduran lempira. */
  HNL = 'HNL',
  /** The currency is the Croatian kuna. */
  HRK = 'HRK',
  /** The currency is the Haitian gourde. */
  HTG = 'HTG',
  /** The currency is the Hungarian forint. */
  HUF = 'HUF',
  /** The currency is the Indonesian rupiah. */
  IDR = 'IDR',
  /** The currency is the Israeli new shekel. */
  ILS = 'ILS',
  /** The currency is the Indian rupee. */
  INR = 'INR',
  /** The currency is the Iraqi dinar. */
  IQD = 'IQD',
  /** The currency is the Iranian rial. */
  IRR = 'IRR',
  /** The currency is the Icelandic krona. */
  ISK = 'ISK',
  /** The currency is the Jamaican dollar. */
  JMD = 'JMD',
  /** The currency is the Jordanian dinar. */
  JOD = 'JOD',
  /** The currency is the Kenyan shilling. */
  KES = 'KES',
  /** The currency is the Kyrgyzstani som. */
  KGS = 'KGS',
  /** The currency is the Cambodian riel. */
  KHR = 'KHR',
  /** The currency is the Comoro franc. */
  KMF = 'KMF',
  /** The currency is the North Korean won. */
  KPW = 'KPW',
  /** The currency is the South Korean won. */
  KRW = 'KRW',
  /** The currency is the Kuwaiti dinar. */
  KWD = 'KWD',
  /** The currency is the Cayman Islands dollar. */
  KYD = 'KYD',
  /** The currency is the Kazakhstani tenge. */
  KZT = 'KZT',
  /** The currency is the Lao kip. */
  LAK = 'LAK',
  /** The currency is the Lebanese pound. */
  LBP = 'LBP',
  /** The currency is the Sri Lankan rupee. */
  LKR = 'LKR',
  /** The currency is the Liberian dollar. */
  LRD = 'LRD',
  /** The currency is the Lesotho loti. */
  LSL = 'LSL',
  /** The currency is the Lithuanian litas. */
  LTL = 'LTL',
  /** The currency is the Libyan dinar. */
  LYD = 'LYD',
  /** The currency is the Moroccan dirham. */
  MAD = 'MAD',
  /** The currency is the Moldovan leu. */
  MDL = 'MDL',
  /** The currency is the Malagasy ariary. */
  MGA = 'MGA',
  /** The currency is the Macedonian denar. */
  MKD = 'MKD',
  /** The currency is the Myanmar kyat. */
  MMK = 'MMK',
  /** The currency is the Mongolian tugrik. */
  MNT = 'MNT',
  /** The currency is the Macanese pataca. */
  MOP = 'MOP',
  /** The currency is the Mauritanian ouguiya. */
  MRO = 'MRO',
  /** The currency is the Mauritian rupee. */
  MUR = 'MUR',
  /** The currency is the Maldivian rufiyaa. */
  MVR = 'MVR',
  /** The currency is the Malawian kwacha. */
  MWK = 'MWK',
  /** The currency is the Mexican peso. */
  MXN = 'MXN',
  /** The currency is the Mozambican metical. */
  MZN = 'MZN',
  /** The currency is the Namibian dollar. */
  NAD = 'NAD',
  /** The currency is the Nigerian naira. */
  NGN = 'NGN',
  /** The currency is the Nicaraguan cordoba oro. */
  NIO = 'NIO',
  /** The currency is the Norwegian krone. */
  NOK = 'NOK',
  /** The currency is the Nepalese rupee. */
  NPR = 'NPR',
  /** The currency is the New Zealand dollar. */
  NZD = 'NZD',
  /** The currency is the Omani rial. */
  OMR = 'OMR',
  /** The currency is the Panamanian balboa. */
  PAB = 'PAB',
  /** The currency is the Peruvian sol. */
  PEN = 'PEN',
  /** The currency is the Papua New Guinean kina. */
  PGK = 'PGK',
  /** The currency is the Pakistani rupee. */
  PKR = 'PKR',
  /** The currency is the Paraguayan guarani. */
  PYG = 'PYG',
  /** The currency is the Qatari riyal. */
  QAR = 'QAR',
  /** The currency is the Romanian leu. */
  RON = 'RON',
  /** The currency is the Serbian dinar. */
  RSD = 'RSD',
  /** The currency is the Russian ruble. */
  RUB = 'RUB',
  /** The currency is the Rwandan franc. */
  RWF = 'RWF',
  /** The currency is the Saudi riyal. */
  SAR = 'SAR',
  /** The currency is the Solomon Islands dollar. */
  SBD = 'SBD',
  /** The currency is the Seychelles rupee. */
  SCR = 'SCR',
  /** The currency is the Sudanese pound. */
  SDG = 'SDG',
  /** The currency is the Swedish krona. */
  SEK = 'SEK',
  /** The currency is the Saint Helena pound. */
  SHP = 'SHP',
  /** The currency is the Sierra Leonean leone. */
  SLL = 'SLL',
  /** The currency is the Somali shilling. */
  SOS = 'SOS',
  /** The currency is the Surinamese dollar. */
  SRD = 'SRD',
  /** The currency is the Sao Tome and Principe dobra. */
  STD = 'STD',
  /** The currency is the Syrian pound. */
  SYP = 'SYP',
  /** The currency is the Swazi lilangeni. */
  SZL = 'SZL',
  /** The currency is the Tajikistani somoni. */
  TJS = 'TJS',
  /** The currency is the Turkmenistani manat. */
  TMT = 'TMT',
  /** The currency is the Tunisian dinar. */
  TND = 'TND',
  /** The currency is the Tongan pa'anga. */
  TOP = 'TOP',
  /** The currency is the Turkish lira. */
  TRY = 'TRY',
  /** The currency is the Trinidad and Tobago dollar. */
  TTD = 'TTD',
  /** The currency is the Tanzanian shilling. */
  TZS = 'TZS',
  /** The currency is the Ukrainian hryvnia. */
  UAH = 'UAH',
  /** The currency is the Ugandan shilling. */
  UGX = 'UGX',
  /** The currency is the Uruguayan peso. */
  UYU = 'UYU',
  /** The currency is the Uzbekistani som. */
  UZS = 'UZS',
  /** The currency is the Venezuelan bolivar. */
  VEF = 'VEF',
  /** The currency is the Vietnamese dong. */
  VND = 'VND',
  /** The currency is the Vanuatu vatu. */
  VUV = 'VUV',
  /** The currency is the Samoan tala. */
  WST = 'WST',
  /** The currency is the CFA franc BEAC. */
  XAF = 'XAF',
  /** The currency is the East Caribbean dollar. */
  XCD = 'XCD',
  /** The currency is the CFA franc BCEAO. */
  XOF = 'XOF',
  /** The currency is the CFP franc. */
  XPF = 'XPF',
  /** The currency is the Yemeni rial. */
  YER = 'YER',
  /** The currency is the South African rand. */
  ZAR = 'ZAR',
  /** The currency is the Zambian kwacha. */
  ZMW = 'ZMW',
  /** The currency is the Zimbabwean dollar. */
  ZWL = 'ZWL',
}

/**
 * Region Type Enum
 *
 * Geographic region classification types.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/account/types/ba:RegionTypeEnum
 */
export enum RegionType {
  /** Country-level region */
  COUNTRY = 'COUNTRY',

  /** Sub-country region (state, province) */
  COUNTRY_REGION = 'COUNTRY_REGION',

  /** State or province */
  STATE_OR_PROVINCE = 'STATE_OR_PROVINCE',

  /** World region (e.g., Asia, Europe) */
  WORLD_REGION = 'WORLD_REGION',

  /** Worldwide */
  WORLDWIDE = 'WORLDWIDE',
}

/**
 * Deposit Type Enum
 *
 * Type of deposit for a payment policy.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/account/types/api:DepositTypeEnum
 */
export enum DepositType {
  /** Percentage of total price */
  PERCENTAGE = 'PERCENTAGE',

  /** Fixed amount */
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

/**
 * Pricing Visibility Enum
 *
 * When pricing information is displayed to buyers.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/inventory/types/slr:PricingVisibilityEnum
 */
export enum PricingVisibility {
  /** Price not visible */
  NONE = 'NONE',

  /** Price visible before checkout */
  PRE_CHECKOUT = 'PRE_CHECKOUT',

  /** Price visible during checkout */
  DURING_CHECKOUT = 'DURING_CHECKOUT',
}

/**
 * Location Type Enum
 *
 * Type of inventory location.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/inventory/types/api:LocationTypeEnum
 */
export enum LocationType {
  /** Retail store */
  STORE = 'STORE',

  /** Warehouse or storage facility */
  WAREHOUSE = 'WAREHOUSE',
}

/**
 * Merchant Location Status Enum
 *
 * Status of an inventory location.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/inventory/types/api:MerchantLocationStatusEnum
 */
export enum MerchantLocationStatus {
  /** Location is enabled and active */
  ENABLED = 'ENABLED',

  /** Location is disabled */
  DISABLED = 'DISABLED',
}

/**
 * Day of Week Enum
 *
 * Days of the week for operating hours.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/inventory/types/api:DayOfWeekEnum
 */
export enum DayOfWeek {
  /** This enumeration value indicates that the store is open on Monday for the hours specified through the operatingHours.intervals container, or that a fulfillment center has a cut-off time specified through the weeklySchedule.cutOffTime field on Monday. */
  MONDAY = 'MONDAY',

  /** This enumeration value indicates that the store is open on Tuesday for the hours specified through the operatingHours.intervals container, or that a fulfillment center has a cut-off time specified through the weeklySchedule.cutOffTime field on Tuesday. */
  TUESDAY = 'TUESDAY',

  /** This enumeration value indicates that the store is open on Wednesday for the hours specified through the operatingHours.intervals container, or that a fulfillment center has a cut-off time specified through the weeklySchedule.cutOffTime field on Wednesday. */
  WEDNESDAY = 'WEDNESDAY',

  /** This enumeration value indicates that the store is open on Thursday for the hours specified through the operatingHours.intervals container, or that a fulfillment center has a cut-off time specified through the weeklySchedule.cutOffTime field on Thursday. */
  THURSDAY = 'THURSDAY',

  /** This enumeration value indicates that the store is open on Friday for the hours specified through the operatingHours.intervals container, or that a fulfillment center has a cut-off time specified through the weeklySchedule.cutOffTime field on Friday. */
  FRIDAY = 'FRIDAY',

  /** This enumeration value indicates that the store is open on Saturday for the hours specified through the operatingHours.intervals container, or that a fulfillment center has a cut-off time specified through the weeklySchedule.cutOffTime field on Saturday. */
  SATURDAY = 'SATURDAY',

  /** This enumeration value indicates that the store is open on Sunday for the hours specified through the operatingHours.intervals container, or that a fulfillment center has a cut-off time specified through the weeklySchedule.cutOffTime field on Sunday. */
  SUNDAY = 'SUNDAY',
}

/**
 * Reason for Refund Enum
 *
 * Reason codes for issuing refunds.
 *
 * Reference: https://developer.ebay.com/api-docs/sell/fulfillment/types/api:ReasonForRefundEnum
 */
export enum ReasonForRefund {
  /** Buyer canceled the order */
  BUYER_CANCEL = 'BUYER_CANCEL',

  /** Item is out of stock */
  OUT_OF_STOCK = 'OUT_OF_STOCK',

  /** Buyer found a cheaper price elsewhere */
  FOUND_CHEAPER_PRICE = 'FOUND_CHEAPER_PRICE',

  /** Price was incorrect in listing */
  INCORRECT_PRICE = 'INCORRECT_PRICE',

  /** Item was damaged in transit or storage */
  ITEM_DAMAGED = 'ITEM_DAMAGED',

  /** Item is defective */
  ITEM_DEFECTIVE = 'ITEM_DEFECTIVE',

  /** Item was lost in transit */
  LOST_IN_TRANSIT = 'LOST_IN_TRANSIT',

  /** Buyer and seller mutually agreed to refund */
  MUTUALLY_AGREED = 'MUTUALLY_AGREED',

  /** Seller canceled the order */
  SELLER_CANCEL = 'SELLER_CANCEL',
}

/**
 * Funding Model Enum
 *
 * How campaigns are funded (cost per sale or cost per click).
 *
 * Reference: https://developer.ebay.com/api-docs/sell/marketing/types/pls:FundingModelEnum
 */
export enum FundingModel {
  /** Cost per sale - pay when item sells */
  COST_PER_SALE = 'COST_PER_SALE',

  /** Cost per click - pay when ad is clicked */
  COST_PER_CLICK = 'COST_PER_CLICK',
}

/**
 * Message Reference Type Enum
 *
 * Type of item the message references.
 *
 * Reference: https://developer.ebay.com/api-docs/commerce/message/types/api:ReferenceTypeEnum
 */
export enum MessageReferenceType {
  /** Message references a listing */
  LISTING = 'LISTING',

  /** Message references an order */
  ORDER = 'ORDER',
}

/**
 * Feedback Rating Enum
 *
 * Rating types for buyer/seller feedback.
 *
 * Reference: https://developer.ebay.com/api-docs/commerce/feedback/types/api:RatingEnum
 */
export enum FeedbackRating {
  /** Positive feedback */
  POSITIVE = 'POSITIVE',

  /** Neutral feedback */
  NEUTRAL = 'NEUTRAL',

  /** Negative feedback */
  NEGATIVE = 'NEGATIVE',
}

/**
 * Reported Item Type Enum
 *
 * Type of item being reported for VERO infringement.
 *
 * Reference: https://developer.ebay.com/api-docs/commerce/vero/types/api:ReportedItemTypeEnum
 */
export enum ReportedItemType {
  /** Entire listing */
  LISTING = 'LISTING',

  /** Image within a listing */
  IMAGE = 'IMAGE',
}

/**
 * Helper functions for working with enums
 */
export const EbayEnums = {
  /**
   * Check if a marketplace ID is valid
   */
  isValidMarketplaceId(id: string): id is MarketplaceId {
    return Object.values(MarketplaceId).includes(id as MarketplaceId);
  },

  /**
   * Check if a condition is valid
   */
  isValidCondition(condition: string): condition is Condition {
    return Object.values(Condition).includes(condition as Condition);
  },

  /**
   * Check if a format type is valid
   */
  isValidFormatType(format: string): format is FormatType {
    return Object.values(FormatType).includes(format as FormatType);
  },

  /**
   * Check if an order payment status is valid
   */
  isValidOrderPaymentStatus(status: string): status is OrderPaymentStatus {
    return Object.values(OrderPaymentStatus).includes(status as OrderPaymentStatus);
  },

  /**
   * Check if a campaign status is valid
   */
  isValidCampaignStatus(status: string): status is CampaignStatus {
    return Object.values(CampaignStatus).includes(status as CampaignStatus);
  },

  /**
   * Check if a refund method is valid
   */
  isValidRefundMethod(method: string): method is RefundMethod {
    return Object.values(RefundMethod).includes(method as RefundMethod);
  },

  /**
   * Check if a return method is valid
   */
  isValidReturnMethod(method: string): method is ReturnMethod {
    return Object.values(ReturnMethod).includes(method as ReturnMethod);
  },

  /**
   * Check if a return shipping cost payer is valid
   */
  isValidReturnShippingCostPayer(payer: string): payer is ReturnShippingCostPayer {
    return Object.values(ReturnShippingCostPayer).includes(payer as ReturnShippingCostPayer);
  },

  /**
   * Check if a time duration unit is valid
   */
  isValidTimeDurationUnit(unit: string): unit is TimeDurationUnit {
    return Object.values(TimeDurationUnit).includes(unit as TimeDurationUnit);
  },

  /**
   * Check if a shipping cost type is valid
   */
  isValidShippingCostType(type: string): type is ShippingCostType {
    return Object.values(ShippingCostType).includes(type as ShippingCostType);
  },

  /**
   * Check if a shipping option type is valid
   */
  isValidShippingOptionType(type: string): type is ShippingOptionType {
    return Object.values(ShippingOptionType).includes(type as ShippingOptionType);
  },

  /**
   * Check if a category type is valid
   */
  isValidCategoryType(type: string): type is CategoryType {
    return Object.values(CategoryType).includes(type as CategoryType);
  },

  /**
   * Check if a payment method type is valid
   */
  isValidPaymentMethodType(type: string): type is PaymentMethodType {
    return Object.values(PaymentMethodType).includes(type as PaymentMethodType);
  },

  /**
   * Check if a line item fulfillment status is valid
   */
  isValidLineItemFulfillmentStatus(status: string): status is LineItemFulfillmentStatus {
    return Object.values(LineItemFulfillmentStatus).includes(status as LineItemFulfillmentStatus);
  },

  /**
   * Check if an offer status is valid
   */
  isValidOfferStatus(status: string): status is OfferStatus {
    return Object.values(OfferStatus).includes(status as OfferStatus);
  },

  /**
   * Check if a listing status is valid
   */
  isValidListingStatus(status: string): status is ListingStatus {
    return Object.values(ListingStatus).includes(status as ListingStatus);
  },

  /**
   * Check if a compliance type is valid
   */
  isValidComplianceType(type: string): type is ComplianceType {
    return Object.values(ComplianceType).includes(type as ComplianceType);
  },

  /**
   * Check if a language code is valid
   */
  isValidLanguageCode(code: string): code is LanguageCode {
    return Object.values(LanguageCode).includes(code as LanguageCode);
  },

  /**
   * Check if a weight unit is valid
   */
  isValidWeightUnit(unit: string): unit is WeightUnit {
    return Object.values(WeightUnit).includes(unit as WeightUnit);
  },

  /**
   * Check if a length unit is valid
   */
  isValidLengthUnit(unit: string): unit is LengthUnit {
    return Object.values(LengthUnit).includes(unit as LengthUnit);
  },

  /**
   * Check if a currency code is valid
   */
  isValidCurrencyCode(code: string): code is CurrencyCode {
    return Object.values(CurrencyCode).includes(code as CurrencyCode);
  },

  /**
   * Check if a region type is valid
   */
  isValidRegionType(type: string): type is RegionType {
    return Object.values(RegionType).includes(type as RegionType);
  },

  /**
   * Check if a deposit type is valid
   */
  isValidDepositType(type: string): type is DepositType {
    return Object.values(DepositType).includes(type as DepositType);
  },

  /**
   * Check if a pricing visibility is valid
   */
  isValidPricingVisibility(visibility: string): visibility is PricingVisibility {
    return Object.values(PricingVisibility).includes(visibility as PricingVisibility);
  },

  /**
   * Check if a location type is valid
   */
  isValidLocationType(type: string): type is LocationType {
    return Object.values(LocationType).includes(type as LocationType);
  },

  /**
   * Check if a merchant location status is valid
   */
  isValidMerchantLocationStatus(status: string): status is MerchantLocationStatus {
    return Object.values(MerchantLocationStatus).includes(status as MerchantLocationStatus);
  },

  /**
   * Check if a day of week is valid
   */
  isValidDayOfWeek(day: string): day is DayOfWeek {
    return Object.values(DayOfWeek).includes(day as DayOfWeek);
  },

  /**
   * Check if a reason for refund is valid
   */
  isValidReasonForRefund(reason: string): reason is ReasonForRefund {
    return Object.values(ReasonForRefund).includes(reason as ReasonForRefund);
  },

  /**
   * Check if a funding model is valid
   */
  isValidFundingModel(model: string): model is FundingModel {
    return Object.values(FundingModel).includes(model as FundingModel);
  },

  /**
   * Check if a message reference type is valid
   */
  isValidMessageReferenceType(type: string): type is MessageReferenceType {
    return Object.values(MessageReferenceType).includes(type as MessageReferenceType);
  },

  /**
   * Check if a feedback rating is valid
   */
  isValidFeedbackRating(rating: string): rating is FeedbackRating {
    return Object.values(FeedbackRating).includes(rating as FeedbackRating);
  },

  /**
   * Check if a reported item type is valid
   */
  isValidReportedItemType(type: string): type is ReportedItemType {
    return Object.values(ReportedItemType).includes(type as ReportedItemType);
  },

  /**
   * Get all active marketplace IDs (excluding reserved/deprecated)
   */
  getActiveMarketplaces(): MarketplaceId[] {
    return [
      MarketplaceId.EBAY_AT,
      MarketplaceId.EBAY_AU,
      MarketplaceId.EBAY_BE,
      MarketplaceId.EBAY_CA,
      MarketplaceId.EBAY_CH,
      MarketplaceId.EBAY_DE,
      MarketplaceId.EBAY_ES,
      MarketplaceId.EBAY_FR,
      MarketplaceId.EBAY_GB,
      MarketplaceId.EBAY_HK,
      MarketplaceId.EBAY_IE,
      MarketplaceId.EBAY_IT,
      MarketplaceId.EBAY_MY,
      MarketplaceId.EBAY_NL,
      MarketplaceId.EBAY_PH,
      MarketplaceId.EBAY_PL,
      MarketplaceId.EBAY_SG,
      MarketplaceId.EBAY_TH,
      MarketplaceId.EBAY_TW,
      MarketplaceId.EBAY_US,
      MarketplaceId.EBAY_VN,
      MarketplaceId.EBAY_MOTORS_US,
    ];
  },
};
