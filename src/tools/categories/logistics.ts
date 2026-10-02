import { LOGISTICS_SCOPE, OAUTH_SCOPES_ENV } from '@/config/environment.js';
import {
  createFromShippingQuoteInputSchema,
  createShippingQuoteInputSchema,
  shipmentIdInputSchema,
  shippingQuoteIdInputSchema,
} from '@/schemas/fulfillment/logistics.js';
import { defineTool } from '@/tools/defineTool.js';
import { formatFileResult } from '@/tools/fileResult.js';
import type { ToolEntry } from '@/tools/registry.js';
import { Effect } from 'effect';

const LOGISTICS_ACCESS_NOTE = `Logistics API is limited release (eBay-approved developers only, USPS rates and labels only) and needs the ${LOGISTICS_SCOPE} scope, which is not requested by default: eligible keysets add it to ${OAUTH_SCOPES_ENV} and re-consent.`;

/** Logistics API tools for shipping quotes, shipments, and shipping labels. */
export const logisticsEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_create_shipping_quote',
    description: `Get live shipping rates for one package (Logistics API createShippingQuote). Pass shippingQuoteRequest with orders (1-10 eBay order IDs shipping together), packageSpecification (weight, optional dimensions), shipFrom and shipTo. Returns a shippingQuoteId plus rates[] with rateId, carrier/service, base cost, optional add-ons, and an expirationDate; buy one with ebay_create_shipment_from_shipping_quote before it expires. ${LOGISTICS_ACCESS_NOTE}`,
    inputSchema: createShippingQuoteInputSchema.shape,
    annotations: { readOnlyHint: false },
    handler: (api, args) => Effect.runPromise(api.logistics.createShippingQuote(args)),
  }),
  defineTool({
    name: 'ebay_get_shipping_quote',
    description: `Get a shipping quote by shippingQuoteId with its rates, package, addresses, and expiry (Logistics API getShippingQuote). ${LOGISTICS_ACCESS_NOTE}`,
    inputSchema: shippingQuoteIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.logistics.getShippingQuote(args)),
  }),
  defineTool({
    name: 'ebay_create_shipment_from_shipping_quote',
    description: `Purchase postage: create a shipment and its shipping label from one rate of a shipping quote (Logistics API createFromShippingQuote). This charges the seller's billing agreement the rate's base cost plus any additionalOptions (eBay error 90030 means no billing agreement is set up). Pass shipmentRequest with shippingQuoteId and rateId from ebay_create_shipping_quote, optionally additionalOptions, labelSize, labelCustomMessage, and returnTo. Returns the shipment with shipmentId, tracking number, totalShippingCost, and labelDownloadUrl; get the PDF with ebay_download_shipping_label_file. ${LOGISTICS_ACCESS_NOTE}`,
    inputSchema: createFromShippingQuoteInputSchema.shape,
    annotations: { readOnlyHint: false, idempotentHint: false },
    handler: (api, args) => Effect.runPromise(api.logistics.createFromShippingQuote(args)),
  }),
  defineTool({
    name: 'ebay_get_shipment',
    description: `Get a shipment by shipmentId: purchased rate, costs, addresses, tracking number, label URL, and cancellation status (Logistics API getShipment). ${LOGISTICS_ACCESS_NOTE}`,
    inputSchema: shipmentIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.logistics.getShipment(args)),
  }),
  defineTool({
    name: 'ebay_cancel_shipment',
    description: `Cancel a shipment and delete its shipping label; eBay refunds the totalShippingCost to the billing agreement (Logistics API cancelShipment). Fails once the label has been used. Returns the shipment with its cancellation status. ${LOGISTICS_ACCESS_NOTE}`,
    inputSchema: shipmentIdInputSchema.shape,
    annotations: { readOnlyHint: false, destructiveHint: true },
    handler: (api, args) => Effect.runPromise(api.logistics.cancelShipment(args)),
  }),
  defineTool({
    name: 'ebay_download_shipping_label_file',
    description: `Download the shipping label of a shipment as an embedded PDF resource (Logistics API downloadLabelFile). Pass the shipmentId from ebay_create_shipment_from_shipping_quote. ${LOGISTICS_ACCESS_NOTE}`,
    inputSchema: shipmentIdInputSchema.shape,
    annotations: { readOnlyHint: true },
    handler: (api, args) => Effect.runPromise(api.logistics.downloadLabelFile(args)),
    formatResult: (file, args) =>
      formatFileResult(
        file,
        `ebay-logistics://shipment/${encodeURIComponent(args.shipmentId)}/label`,
        `Shipping label for shipment ${args.shipmentId}`,
      ),
  }),
];
