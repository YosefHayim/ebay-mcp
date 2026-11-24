export const MarketplaceId = {
	EBAY_AT: "EBAY_AT",

	EBAY_AU: "EBAY_AU",

	EBAY_BE: "EBAY_BE",

	EBAY_CA: "EBAY_CA",

	EBAY_CH: "EBAY_CH",

	EBAY_CN: "EBAY_CN",

	EBAY_CZ: "EBAY_CZ",

	EBAY_DE: "EBAY_DE",

	EBAY_DK: "EBAY_DK",

	EBAY_ES: "EBAY_ES",

	EBAY_FI: "EBAY_FI",

	EBAY_FR: "EBAY_FR",

	EBAY_GB: "EBAY_GB",

	EBAY_GR: "EBAY_GR",

	EBAY_HK: "EBAY_HK",

	EBAY_HU: "EBAY_HU",

	EBAY_ID: "EBAY_ID",

	EBAY_IE: "EBAY_IE",

	EBAY_IL: "EBAY_IL",

	EBAY_IN: "EBAY_IN",

	EBAY_IT: "EBAY_IT",

	EBAY_JP: "EBAY_JP",

	EBAY_MY: "EBAY_MY",

	EBAY_NL: "EBAY_NL",

	EBAY_NO: "EBAY_NO",

	EBAY_NZ: "EBAY_NZ",

	EBAY_PE: "EBAY_PE",

	EBAY_PH: "EBAY_PH",

	EBAY_PL: "EBAY_PL",

	EBAY_PR: "EBAY_PR",

	EBAY_PT: "EBAY_PT",

	EBAY_RU: "EBAY_RU",

	EBAY_SE: "EBAY_SE",

	EBAY_SG: "EBAY_SG",

	EBAY_TH: "EBAY_TH",

	EBAY_TW: "EBAY_TW",

	EBAY_US: "EBAY_US",

	EBAY_VN: "EBAY_VN",

	EBAY_ZA: "EBAY_ZA",

	EBAY_HALF_US: "EBAY_HALF_US",

	EBAY_MOTORS_US: "EBAY_MOTORS_US",
} as const;

export type MarketplaceId = (typeof MarketplaceId)[keyof typeof MarketplaceId];

export const Condition = {
	NEW: "NEW",

	LIKE_NEW: "LIKE_NEW",

	NEW_OTHER: "NEW_OTHER",

	NEW_WITH_DEFECTS: "NEW_WITH_DEFECTS",

	MANUFACTURER_REFURBISHED: "MANUFACTURER_REFURBISHED",

	CERTIFIED_REFURBISHED: "CERTIFIED_REFURBISHED",

	EXCELLENT_REFURBISHED: "EXCELLENT_REFURBISHED",

	VERY_GOOD_REFURBISHED: "VERY_GOOD_REFURBISHED",

	GOOD_REFURBISHED: "GOOD_REFURBISHED",

	SELLER_REFURBISHED: "SELLER_REFURBISHED",

	USED_EXCELLENT: "USED_EXCELLENT",

	USED_VERY_GOOD: "USED_VERY_GOOD",

	USED_GOOD: "USED_GOOD",

	USED_ACCEPTABLE: "USED_ACCEPTABLE",

	FOR_PARTS_OR_NOT_WORKING: "FOR_PARTS_OR_NOT_WORKING",

	PRE_OWNED_EXCELLENT: "PRE_OWNED_EXCELLENT",

	PRE_OWNED_FAIR: "PRE_OWNED_FAIR",
} as const;

export type Condition = (typeof Condition)[keyof typeof Condition];

export const LocaleEnum = {
	en_US: "en-US",
	en_CA: "en-CA",
	fr_CA: "fr-CA",
	en_GB: "en-GB",
	en_AU: "en-AU",
	en_IN: "en-IN",
	de_AT: "de-AT",
	fr_BE: "fr-BE",
	fr_FR: "fr-FR",
	de_DE: "de-DE",
	it_IT: "it-IT",
	nl_BE: "nl-BE",
	nl_NL: "nl-NL",
	es_ES: "es-ES",
	de_CH: "de-CH",
	fi_FI: "fi-FI",
	zh_HK: "zh-HK",
	hu_HU: "hu-HU",
	en_PH: "en-PH",
	pl_PL: "pl-PL",
	pt_PT: "pt-PT",
	ru_RU: "ru-RU",
	en_SG: "en-SG",
	en_IE: "en-IE",
	en_MY: "en-MY",
} as const;

export type LocaleEnum = (typeof LocaleEnum)[keyof typeof LocaleEnum];

export const FormatType = {
	AUCTION: "AUCTION",

	FIXED_PRICE: "FIXED_PRICE",
} as const;

export type FormatType = (typeof FormatType)[keyof typeof FormatType];

export const ListingDuration = {
	DAYS_1: "DAYS_1",

	DAYS_3: "DAYS_3",

	DAYS_5: "DAYS_5",

	DAYS_7: "DAYS_7",

	DAYS_10: "DAYS_10",

	DAYS_14: "DAYS_14",

	DAYS_21: "DAYS_21",

	DAYS_30: "DAYS_30",

	GTC: "GTC",
} as const;

export type ListingDuration =
	(typeof ListingDuration)[keyof typeof ListingDuration];

export const OrderPaymentStatus = {
	FAILED: "FAILED",

	FULLY_REFUNDED: "FULLY_REFUNDED",

	PAID: "PAID",

	PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",

	PENDING: "PENDING",
} as const;

export type OrderPaymentStatus =
	(typeof OrderPaymentStatus)[keyof typeof OrderPaymentStatus];

export const CampaignStatus = {
	DELETED: "DELETED",

	DRAFT: "DRAFT",

	ENDED: "ENDED",

	ENDING_SOON: "ENDING_SOON",

	PAUSED: "PAUSED",

	PENDING: "PENDING",

	RUNNING: "RUNNING",

	SCHEDULED: "SCHEDULED",

	SYSTEM_PAUSED: "SYSTEM_PAUSED",
} as const;

export type CampaignStatus =
	(typeof CampaignStatus)[keyof typeof CampaignStatus];

export const RefundMethod = {
	MONEY_BACK: "MONEY_BACK",

	MERCHANDISE_CREDIT: "MERCHANDISE_CREDIT",
} as const;

export type RefundMethod = (typeof RefundMethod)[keyof typeof RefundMethod];

export const ReturnMethod = {
	REPLACEMENT: "REPLACEMENT",

	EXCHANGE: "EXCHANGE",
} as const;

export type ReturnMethod = (typeof ReturnMethod)[keyof typeof ReturnMethod];

export const ReturnShippingCostPayer = {
	BUYER: "BUYER",

	SELLER: "SELLER",
} as const;

export type ReturnShippingCostPayer =
	(typeof ReturnShippingCostPayer)[keyof typeof ReturnShippingCostPayer];

export const TimeDurationUnit = {
	YEAR: "YEAR",

	MONTH: "MONTH",

	DAY: "DAY",

	HOUR: "HOUR",

	CALENDAR_DAY: "CALENDAR_DAY",

	BUSINESS_DAY: "BUSINESS_DAY",

	MINUTE: "MINUTE",

	SECOND: "SECOND",

	MILLISECOND: "MILLISECOND",
} as const;

export type TimeDurationUnit =
	(typeof TimeDurationUnit)[keyof typeof TimeDurationUnit];

export const ShippingCostType = {
	FLAT_RATE: "FLAT_RATE",

	CALCULATED: "CALCULATED",

	NOT_SPECIFIED: "NOT_SPECIFIED",
} as const;

export type ShippingCostType =
	(typeof ShippingCostType)[keyof typeof ShippingCostType];

export const ShippingOptionType = {
	DOMESTIC: "DOMESTIC",

	INTERNATIONAL: "INTERNATIONAL",
} as const;

export type ShippingOptionType =
	(typeof ShippingOptionType)[keyof typeof ShippingOptionType];

export const CategoryType = {
	ALL_EXCLUDING_MOTORS_VEHICLES: "ALL_EXCLUDING_MOTORS_VEHICLES",

	MOTORS_VEHICLES: "MOTORS_VEHICLES",
} as const;

export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];

export const PaymentMethodType = {
	CREDIT_CARD: "CREDIT_CARD", // This payment method is no longer valid.

	PAYPAL: "PAYPAL", // This payment method is no longer valid.

	PERSONAL_CHECK: "PERSONAL_CHECK", // This enumeration value indicates that the payment method will be a Personal check.

	MONEY_ORDER_CASHIERS_CHECK: "MONEY_ORDER_CASHIERS_CHECK", // This enumeration value indicates that the payment method will be a Cashier Check.

	CASH_ON_DELIVERY: "CASH_ON_DELIVERY", // This enumeration value indicates that the payment method will be cash, and the transaction will occur after the item is delivered to the buyer.

	CASH_ON_PICKUP: "CASH_ON_PICKUP", // This enumeration value indicates that the payment method will be cash, and the transaction will occur when the buyer picks up the item.

	CASH_IN_PERSON: "CASH_IN_PERSON",

	ESCROW: "ESCROW",

	INTEGRATED_MERCHANT_CREDIT_CARD: "INTEGRATED_MERCHANT_CREDIT_CARD",

	LOAN_CHECK: "LOAN_CHECK",

	MONEY_ORDER: "MONEY_ORDER",

	PAISA_PAY: "PAISA_PAY",

	PAISA_PAY_ESCROW: "PAISA_PAY_ESCROW",

	PAISA_PAY_ESCROW_EMI: "PAISA_PAY_ESCROW_EMI",

	OTHER: "OTHER",
} as const;

export type PaymentMethodType =
	(typeof PaymentMethodType)[keyof typeof PaymentMethodType];

export const LineItemFulfillmentStatus = {
	FULFILLED: "FULFILLED",

	IN_PROGRESS: "IN_PROGRESS",

	NOT_STARTED: "NOT_STARTED",
} as const;

export type LineItemFulfillmentStatus =
	(typeof LineItemFulfillmentStatus)[keyof typeof LineItemFulfillmentStatus];

export const OfferStatus = {
	PUBLISHED: "PUBLISHED",

	UNPUBLISHED: "UNPUBLISHED",
} as const;

export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];

export const ListingStatus = {
	ACTIVE: "ACTIVE", // This enumeration value indicates that the eBay listing associated with the offer is active.

	OUT_OF_STOCK: "OUT_OF_STOCK", // This enumeration value indicates that the eBay listing associated with the offer is still active, but that the product is currently out-of-stock. If a single-variation listing is out-of-stock, that listing will be kept alive but hidden from search. If a variation inside a multiple-variation listing is out-of-stock, only that variation is hidden, but the listing remains active and discoverable.

	ENDED: "ENDED", // This enumeration value indicates that the eBay listing associated with the offer has ended.

	INACTIVE: "INACTIVE", // This enumeration value indicates that the eBay listing associated with the offer is currently inactive.

	EBAY_ENDED: "EBAY_ENDED",

	NOT_LISTED: "NOT_LISTED",

	/** This enumeration value indicates that the eBay listing associated with the offer has ended. */
	// ENDED = 'ENDED', // Duplicate, already defined above
} as const;

export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];

// This enumeration type contains the different locales that can be used. The locale value indicates the language that is used to express the inventory item details.
export const LanguageCode = {
	EN_US: "en_US",

	EN_CA: "en_CA",

	FR_CA: "fr_CA",

	EN_GB: "en_GB",

	EN_AU: "en_AU",

	EN_IN: "en_IN",

	DE_AT: "de_AT",

	FR_BE: "fr_BE",

	FR_FR: "fr_FR",

	DE_DE: "de_DE",

	IT_IT: "it_IT",

	NL_BE: "nl_BE",

	NL_NL: "nl_NL",

	ES_ES: "es_ES",

	DE_CH: "de_CH",

	FI_FI: "fi_FI",

	ZH_HK: "zh_HK",

	HU_HU: "hu_HU",

	EN_PH: "en_PH",

	PL_PL: "pl_PL",

	PT_PT: "pt_PT",

	RU_RU: "ru_RU",

	EN_SG: "en_SG",

	EN_IE: "en_IE",

	EN_MY: "en_MY",

	EN: "en", // Keep generic 'en' for broader compatibility if needed

	DE: "de", // Keep generic 'de' for broader compatibility if needed

	FR: "fr", // Keep generic 'fr' for broader compatibility if needed

	ES: "es", // Keep generic 'es' for broader compatibility if needed

	IT: "it", // Keep generic 'it' for broader compatibility if needed

	NL: "nl", // Keep generic 'nl' for broader compatibility if needed

	ZH_CN: "zh-CN",

	ZH_TW: "zh-TW",

	JA: "ja",

	KO: "ko",
} as const;

export type LanguageCode = (typeof LanguageCode)[keyof typeof LanguageCode];

export const WeightUnit = {
	POUND: "POUND",

	KILOGRAM: "KILOGRAM",

	OUNCE: "OUNCE",

	GRAM: "GRAM",
} as const;

export type WeightUnit = (typeof WeightUnit)[keyof typeof WeightUnit];

export const LengthUnit = {
	INCH: "INCH",

	FEET: "FEET",

	CENTIMETER: "CENTIMETER",

	METER: "METER",
} as const;

export type LengthUnit = (typeof LengthUnit)[keyof typeof LengthUnit];

// This enumerated type lists the three-letter ISO 4217 codes representing the supported world currencies.
export const CurrencyCode = {
	USD: "USD",
	CAD: "CAD",
	EUR: "EUR",
	GBP: "GBP",
	AUD: "AUD",
	CHF: "CHF",
	HKD: "HKD",
	MYR: "MYR",
	PHP: "PHP",
	PLN: "PLN",
	SGD: "SGD",
	TWD: "TWD",
	THB: "THB",
	JPY: "JPY",
	AED: "AED",
	AFN: "AFN",
	ALL: "ALL",
	AMD: "AMD",
	ANG: "ANG",
	AOA: "AOA",
	ARS: "ARS",
	AWG: "AWG",
	AZN: "AZN",
	BAM: "BAM",
	BBD: "BBD",
	BDT: "BDT",
	BGN: "BGN",
	BHD: "BHD",
	BIF: "BIF",
	BMD: "BMD",
	BND: "BND",
	BOB: "BOB",
	BRL: "BRL",
	BSD: "BSD",
	BTN: "BTN",
	BWP: "BWP",
	BYR: "BYR",
	BZD: "BZD",
	CDF: "CDF",
	CLP: "CLP",
	CNY: "CNY",
	COP: "COP",
	CRC: "CRC",
	CUP: "CUP",
	CVE: "CVE",
	CZK: "CZK",
	DJF: "DJF",
	DKK: "DKK",
	DOP: "DOP",
	DZD: "DZD",
	EGP: "EGP",
	ERN: "ERN",
	ETB: "ETB",
	FJD: "FJD",
	FKP: "FKP",
	GEL: "GEL",
	GHS: "GHS",
	GIP: "GIP",
	GMD: "GMD",
	GNF: "GNF",
	GTQ: "GTQ",
	GYD: "GYD",
	HNL: "HNL",
	HRK: "HRK",
	HTG: "HTG",
	HUF: "HUF",
	IDR: "IDR",
	ILS: "ILS",
	INR: "INR",
	IQD: "IQD",
	IRR: "IRR",
	ISK: "ISK",
	JMD: "JMD",
	JOD: "JOD",
	KES: "KES",
	KGS: "KGS",
	KHR: "KHR",
	KMF: "KMF",
	KPW: "KPW",
	KRW: "KRW",
	KWD: "KWD",
	KYD: "KYD",
	KZT: "KZT",
	LAK: "LAK",
	LBP: "LBP",
	LKR: "LKR",
	LRD: "LRD",
	LSL: "LSL",
	LTL: "LTL",
	LYD: "LYD",
	MAD: "MAD",
	MDL: "MDL",
	MGA: "MGA",
	MKD: "MKD",
	MMK: "MMK",
	MNT: "MNT",
	MOP: "MOP",
	MRO: "MRO",
	MUR: "MUR",
	MVR: "MVR",
	MWK: "MWK",
	MXN: "MXN",
	MZN: "MZN",
	NAD: "NAD",
	NGN: "NGN",
	NIO: "NIO",
	NOK: "NOK",
	NPR: "NPR",
	NZD: "NZD",
	OMR: "OMR",
	PAB: "PAB",
	PEN: "PEN",
	PGK: "PGK",
	PKR: "PKR",
	PYG: "PYG",
	QAR: "QAR",
	RON: "RON",
	RSD: "RSD",
	RUB: "RUB",
	RWF: "RWF",
	SAR: "SAR",
	SBD: "SBD",
	SCR: "SCR",
	SDG: "SDG",
	SEK: "SEK",
	SHP: "SHP",
	SLL: "SLL",
	SOS: "SOS",
	SRD: "SRD",
	STD: "STD",
	SYP: "SYP",
	SZL: "SZL",
	TJS: "TJS",
	TMT: "TMT",
	TND: "TND",
	TOP: "TOP",
	TRY: "TRY",
	TTD: "TTD",
	TZS: "TZS",
	UAH: "UAH",
	UGX: "UGX",
	UYU: "UYU",
	UZS: "UZS",
	VEF: "VEF",
	VND: "VND",
	VUV: "VUV",
	WST: "WST",
	XAF: "XAF",
	XCD: "XCD",
	XOF: "XOF",
	XPF: "XPF",
	YER: "YER",
	ZAR: "ZAR",
	ZMW: "ZMW",
	ZWL: "ZWL",
} as const;

export type CurrencyCode = (typeof CurrencyCode)[keyof typeof CurrencyCode];

export const RegionType = {
	COUNTRY: "COUNTRY",

	COUNTRY_REGION: "COUNTRY_REGION",

	STATE_OR_PROVINCE: "STATE_OR_PROVINCE",

	WORLD_REGION: "WORLD_REGION",

	WORLDWIDE: "WORLDWIDE",
} as const;

export type RegionType = (typeof RegionType)[keyof typeof RegionType];

export const DepositType = {
	PERCENTAGE: "PERCENTAGE",

	FIXED_AMOUNT: "FIXED_AMOUNT",
} as const;

export type DepositType = (typeof DepositType)[keyof typeof DepositType];

export const PricingVisibility = {
	NONE: "NONE",

	PRE_CHECKOUT: "PRE_CHECKOUT",

	DURING_CHECKOUT: "DURING_CHECKOUT",
} as const;

export type PricingVisibility =
	(typeof PricingVisibility)[keyof typeof PricingVisibility];

export const LocationType = {
	STORE: "STORE",

	WAREHOUSE: "WAREHOUSE",
} as const;

export type LocationType = (typeof LocationType)[keyof typeof LocationType];

export const MerchantLocationStatus = {
	ENABLED: "ENABLED",

	DISABLED: "DISABLED",
} as const;

export type MerchantLocationStatus =
	(typeof MerchantLocationStatus)[keyof typeof MerchantLocationStatus];

export const DayOfWeek = {
	MONDAY: "MONDAY",

	TUESDAY: "TUESDAY",

	WEDNESDAY: "WEDNESDAY",

	THURSDAY: "THURSDAY",

	FRIDAY: "FRIDAY",

	SATURDAY: "SATURDAY",

	SUNDAY: "SUNDAY",
} as const;

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

export const ReasonForRefund = {
	BUYER_CANCEL: "BUYER_CANCEL",

	OUT_OF_STOCK: "OUT_OF_STOCK",

	FOUND_CHEAPER_PRICE: "FOUND_CHEAPER_PRICE",

	INCORRECT_PRICE: "INCORRECT_PRICE",

	ITEM_DAMAGED: "ITEM_DAMAGED",

	ITEM_DEFECTIVE: "ITEM_DEFECTIVE",

	LOST_IN_TRANSIT: "LOST_IN_TRANSIT",

	MUTUALLY_AGREED: "MUTUALLY_AGREED",

	SELLER_CANCEL: "SELLER_CANCEL",
} as const;

export type ReasonForRefund =
	(typeof ReasonForRefund)[keyof typeof ReasonForRefund];

export const FundingModel = {
	COST_PER_SALE: "COST_PER_SALE",

	COST_PER_CLICK: "COST_PER_CLICK",
} as const;

export type FundingModel = (typeof FundingModel)[keyof typeof FundingModel];

export const MessageReferenceType = {
	LISTING: "LISTING",

	ORDER: "ORDER",
} as const;

export type MessageReferenceType =
	(typeof MessageReferenceType)[keyof typeof MessageReferenceType];

export const FeedbackRating = {
	POSITIVE: "POSITIVE",

	NEUTRAL: "NEUTRAL",

	NEGATIVE: "NEGATIVE",
} as const;

export type FeedbackRating =
	(typeof FeedbackRating)[keyof typeof FeedbackRating];

export const ReportedItemType = {
	LISTING: "LISTING",

	IMAGE: "IMAGE",
} as const;

export type ReportedItemType =
	(typeof ReportedItemType)[keyof typeof ReportedItemType];

export const EbayEnums = {
	isValidMarketplaceId(id: string): id is MarketplaceId {
		return Object.values(MarketplaceId).includes(id as MarketplaceId);
	},

	isValidCondition(condition: string): condition is Condition {
		return Object.values(Condition).includes(condition as Condition);
	},

	isValidFormatType(format: string): format is FormatType {
		return Object.values(FormatType).includes(format as FormatType);
	},

	isValidOrderPaymentStatus(status: string): status is OrderPaymentStatus {
		return Object.values(OrderPaymentStatus).includes(
			status as OrderPaymentStatus,
		);
	},

	isValidCampaignStatus(status: string): status is CampaignStatus {
		return Object.values(CampaignStatus).includes(status as CampaignStatus);
	},

	isValidRefundMethod(method: string): method is RefundMethod {
		return Object.values(RefundMethod).includes(method as RefundMethod);
	},

	isValidReturnMethod(method: string): method is ReturnMethod {
		return Object.values(ReturnMethod).includes(method as ReturnMethod);
	},

	isValidReturnShippingCostPayer(
		payer: string,
	): payer is ReturnShippingCostPayer {
		return Object.values(ReturnShippingCostPayer).includes(
			payer as ReturnShippingCostPayer,
		);
	},

	isValidTimeDurationUnit(unit: string): unit is TimeDurationUnit {
		return Object.values(TimeDurationUnit).includes(unit as TimeDurationUnit);
	},

	isValidShippingCostType(type: string): type is ShippingCostType {
		return Object.values(ShippingCostType).includes(type as ShippingCostType);
	},

	isValidShippingOptionType(type: string): type is ShippingOptionType {
		return Object.values(ShippingOptionType).includes(
			type as ShippingOptionType,
		);
	},

	isValidCategoryType(type: string): type is CategoryType {
		return Object.values(CategoryType).includes(type as CategoryType);
	},

	isValidPaymentMethodType(type: string): type is PaymentMethodType {
		return Object.values(PaymentMethodType).includes(type as PaymentMethodType);
	},

	isValidLineItemFulfillmentStatus(
		status: string,
	): status is LineItemFulfillmentStatus {
		return Object.values(LineItemFulfillmentStatus).includes(
			status as LineItemFulfillmentStatus,
		);
	},

	isValidOfferStatus(status: string): status is OfferStatus {
		return Object.values(OfferStatus).includes(status as OfferStatus);
	},

	isValidListingStatus(status: string): status is ListingStatus {
		return Object.values(ListingStatus).includes(status as ListingStatus);
	},

	isValidLanguageCode(code: string): code is LanguageCode {
		return Object.values(LanguageCode).includes(code as LanguageCode);
	},

	isValidWeightUnit(unit: string): unit is WeightUnit {
		return Object.values(WeightUnit).includes(unit as WeightUnit);
	},

	isValidLengthUnit(unit: string): unit is LengthUnit {
		return Object.values(LengthUnit).includes(unit as LengthUnit);
	},

	isValidCurrencyCode(code: string): code is CurrencyCode {
		return Object.values(CurrencyCode).includes(code as CurrencyCode);
	},

	isValidRegionType(type: string): type is RegionType {
		return Object.values(RegionType).includes(type as RegionType);
	},

	isValidDepositType(type: string): type is DepositType {
		return Object.values(DepositType).includes(type as DepositType);
	},

	isValidPricingVisibility(
		visibility: string,
	): visibility is PricingVisibility {
		return Object.values(PricingVisibility).includes(
			visibility as PricingVisibility,
		);
	},

	isValidLocationType(type: string): type is LocationType {
		return Object.values(LocationType).includes(type as LocationType);
	},

	isValidMerchantLocationStatus(
		status: string,
	): status is MerchantLocationStatus {
		return Object.values(MerchantLocationStatus).includes(
			status as MerchantLocationStatus,
		);
	},

	isValidDayOfWeek(day: string): day is DayOfWeek {
		return Object.values(DayOfWeek).includes(day as DayOfWeek);
	},

	isValidReasonForRefund(reason: string): reason is ReasonForRefund {
		return Object.values(ReasonForRefund).includes(reason as ReasonForRefund);
	},

	isValidFundingModel(model: string): model is FundingModel {
		return Object.values(FundingModel).includes(model as FundingModel);
	},

	isValidMessageReferenceType(type: string): type is MessageReferenceType {
		return Object.values(MessageReferenceType).includes(
			type as MessageReferenceType,
		);
	},

	isValidFeedbackRating(rating: string): rating is FeedbackRating {
		return Object.values(FeedbackRating).includes(rating as FeedbackRating);
	},

	isValidReportedItemType(type: string): type is ReportedItemType {
		return Object.values(ReportedItemType).includes(type as ReportedItemType);
	},

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
