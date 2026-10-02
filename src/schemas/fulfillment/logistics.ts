import { LengthUnit, MarketplaceId, WeightUnit } from '@/types/ebayEnums.js';
import { z } from '@/utils/effectSchema.js';

/**
 * Logistics API input schemas. The request bodies mirror the generated
 * `ShippingQuoteRequest` and `CreateShipmentFromQuoteRequest` DTOs in
 * `@/types/sell-apps/order-management/sellLogisticsV1Oas3.js`.
 */

const nonempty = z.string().min(1).regex(/\S/, 'Must contain a non-whitespace character');
const decimalString = z.string().regex(/^\d*\.?\d+$/, 'Must be a decimal number string');

const amountSchema = z.object({
  currency: z
    .string()
    .optional()
    .describe('ISO 4217 currency code, e.g. USD; defaults to the marketplace currency'),
  value: decimalString.describe('Monetary amount as a decimal string, e.g. "3.50"'),
});

const contactAddressSchema = z.object({
  addressLine1: nonempty.describe('First line of the street address'),
  addressLine2: z.string().optional().describe('Second address line, e.g. suite or apartment'),
  city: nonempty.describe('City of the address'),
  stateOrProvince: z.string().optional().describe('State or province, e.g. CA'),
  postalCode: nonempty.describe('Postal code of the address'),
  countryCode: nonempty.describe('Two-letter ISO 3166 country code, e.g. US'),
  county: z.string().optional().describe('County (not country) of the address'),
});

const contactSchema = z.object({
  fullName: z.string().optional().describe("Contact's full name, printed on the label"),
  companyName: z.string().optional().describe('Company the contact is associated with'),
  contactAddress: contactAddressSchema.describe("Contact's street address"),
  primaryPhone: z
    .object({ phoneNumber: nonempty.describe('Telephone number') })
    .optional()
    .describe("Contact's primary telephone number"),
});

const additionalOptionSchema = z.object({
  optionType: nonempty.describe(
    'Shipping option name exactly as offered in the selected rate, e.g. INSURANCE or SIGNATURE',
  ),
  additionalCost: amountSchema.optional().describe('Cost of the option as quoted in the rate'),
});

const marketplaceId = z
  .nativeEnum(MarketplaceId)
  .optional()
  .describe(
    'X-EBAY-C-MARKETPLACE-ID for the request, e.g. EBAY_US; defaults to the configured EBAY_MARKETPLACE_ID',
  );

/** ShippingQuoteRequest body for createShippingQuote. */
export const shippingQuoteRequestSchema = z.object({
  orders: z
    .array(
      z.object({
        orderId: nonempty.describe('eBay order ID, e.g. from ebay_get_orders'),
        channel: z
          .string()
          .optional()
          .describe('Marketplace of the order; use EBAY for eBay orders'),
      }),
    )
    .min(1)
    .max(10)
    .describe('One to ten orders whose line items ship together in this package'),
  packageSpecification: z
    .object({
      weight: z
        .object({
          value: decimalString.describe('Package weight as a decimal string, e.g. "2.5"'),
          unit: z.nativeEnum(WeightUnit).describe('POUND, OUNCE, KILOGRAM, or GRAM'),
        })
        .describe('Package weight'),
      dimensions: z
        .object({
          length: decimalString.describe('Package length as a decimal string'),
          width: decimalString.describe('Package width as a decimal string'),
          height: decimalString.describe('Package height as a decimal string'),
          unit: z.nativeEnum(LengthUnit).describe('INCH, FEET, CENTIMETER, or METER'),
        })
        .optional()
        .describe('Package length, width, height, and unit'),
    })
    .describe('Package weight and dimensions'),
  shipFrom: contactSchema.describe('Origin address and contact of the shipment'),
  shipTo: contactSchema.describe('Destination address and contact of the shipment'),
});

/** CreateShipmentFromQuoteRequest body for createFromShippingQuote. */
export const createShipmentFromQuoteRequestSchema = z.object({
  shippingQuoteId: nonempty.describe('Shipping quote ID returned by ebay_create_shipping_quote'),
  rateId: nonempty.describe('rates[].rateId of the chosen rate within that shipping quote'),
  additionalOptions: z
    .array(additionalOptionSchema)
    .optional()
    .describe('Extra shipping options offered by the chosen rate to purchase with it'),
  labelSize: z
    .string()
    .optional()
    .describe(
      'Desired label size when the carrier supports several; the only valid value is 4"x6"',
    ),
  labelCustomMessage: z
    .string()
    .optional()
    .describe('Text printed on the label when the carrier supports custom messages'),
  returnTo: contactSchema
    .optional()
    .describe('Return address printed on the label; defaults to the quote shipFrom address'),
});

/** Input for Logistics API createShippingQuote. */
export const createShippingQuoteInputSchema = z.object({
  shippingQuoteRequest: shippingQuoteRequestSchema.describe(
    'Generated ShippingQuoteRequest body: orders, package, and from/to addresses',
  ),
  marketplaceId,
});

/** Input for Logistics API createFromShippingQuote. */
export const createFromShippingQuoteInputSchema = z.object({
  shipmentRequest: createShipmentFromQuoteRequestSchema.describe(
    'Generated CreateShipmentFromQuoteRequest body: the quote and rate to purchase',
  ),
  marketplaceId,
});

/** Input for Logistics API getShippingQuote. */
export const shippingQuoteIdInputSchema = z.object({
  shippingQuoteId: nonempty.describe('Shipping quote ID returned by ebay_create_shipping_quote'),
});

/** Input for Logistics API getShipment, cancelShipment, and downloadLabelFile. */
export const shipmentIdInputSchema = z.object({
  shipmentId: nonempty.describe('Shipment ID returned by ebay_create_shipment_from_shipping_quote'),
});
