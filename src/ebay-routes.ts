import type { EbayRoute } from './ebay-route.js';

export const ebayRoutes = [
  {
    "toolName": "ebay_get_rate_limits",
    "description": "This method retrieves the call limit and utilization data for an application. The data is retrieved for all RESTful APIs and the legacy Trading API. The response from getRateLimits includes a list of the applicable resources and the \"call limit\", or quota, that is set for each resource. In addition to quota information, the response also includes the number of remaining calls available before t...",
    "method": "GET",
    "host": "api",
    "path": "/developer/analytics/v1_beta/rate_limit/",
    "tokenKind": "application",
    "fields": [
      {
        "name": "api_context",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This optional query parameter filters the result to include only the specified API context. Valid values: buy sell commerce developer tradingapi"
      },
      {
        "name": "api_name",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This optional query parameter filters the result to include only the APIs specified. Example values: browse for the Buy APIs inventory for the Sell APIs taxo..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_user_rate_limits",
    "description": "This method retrieves the call limit and utilization data for an application user. The call-limit data is returned for all RESTful APIs and the legacy Trading API that limit calls on a per-user basis. The response from getUserRateLimits includes a list of the applicable resources and the \"call limit\", or quota, that is set for each resource. In addition to quota information, the response also i...",
    "method": "GET",
    "host": "api",
    "path": "/developer/analytics/v1_beta/user_rate_limit/",
    "tokenKind": "user",
    "fields": [
      {
        "name": "api_context",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This optional query parameter filters the result to include only the specified API context. Valid values: buy sell commerce developer tradingapi"
      },
      {
        "name": "api_name",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This optional query parameter filters the result to include only the APIs specified. Example values: browse for the Buy APIs inventory for the Sell APIs taxo..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_signing_keys",
    "description": "This method returns the Public Key , Public Key as JWE , and metadata for all keypairs associated with the application key making the call. Note: It is important to note that privateKey values are not returned. In order to further ensure the security of confidential client information, eBay does not store privateKey values in any system. If a developer loses their privateKey they must generate...",
    "method": "GET",
    "host": "apiz",
    "path": "/developer/key_management/v1/signing_key",
    "tokenKind": "application",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_signing_key",
    "description": "This method creates keypairs using one of the following ciphers: ED25519 (Edwards Curve) RSA Note: The recommended signature cipher is ED25519 (Edwards Curve) since it uses much shorter keys and therefore decreases the header size. However, for development frameworks that do not support ED25519, RSA is also supported. Following a successful completion, the following keys are returned: Private K...",
    "method": "POST",
    "host": "apiz",
    "path": "/developer/key_management/v1/signing_key",
    "tokenKind": "application",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_signing_key",
    "description": "This method returns the Public Key , Public Key as JWE , and metadata for a specified signingKeyId associated with the application key making the call. Note: It is important to note that the privateKey value is not returned. In order to further ensure the security of confidential client information, eBay does not store the privateKey value in any system. If a developer loses their privateKey th...",
    "method": "GET",
    "host": "apiz",
    "path": "/developer/key_management/v1/signing_key/{signing_key_id}",
    "tokenKind": "application",
    "fields": [
      {
        "name": "signing_key_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The system-generated eBay ID of the keypairs being requested."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_register_client",
    "description": "Note: The Client Registration API is not intended for use by developers who have previously registered for a Developer Account on the eBay platform. This call registers a new third party financial application with eBay. Important! When calling the registerClient method, Third Party Providers (TPPs) are required to pass their valid eIDAS certificate to eBay via Mutual Transport Layer Security (M...",
    "method": "POST",
    "host": "tppz",
    "path": "/developer/registration/v1/client/register",
    "tokenKind": "application",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_create_or_replace_inventory_item",
    "description": "Note: Please note that any eBay listing created using the Inventory API cannot be revised or relisted using the Trading API calls. Note: Each listing can be revised up to 250 times in one calendar day. If this revision threshold is reached, the seller will be blocked from revising the item until the next calendar day. This call can be used to create and/or update up to 25 new inventory item rec...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/bulk_create_or_replace_inventory_item",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_get_inventory_item",
    "description": "This call retrieves up to 25 inventory item records. The SKU value of each inventory item record to retrieve is specified in the request payload. Note: In addition to the authorization header, which is required for all Inventory API calls, this call also requires the Content-Type header. See the HTTP request headers for more information. For those who prefer to retrieve only one inventory item...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/bulk_get_inventory_item",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_update_price_quantity",
    "description": "This call is used by the seller to update the total ship-to-home quantity of one inventory item, and/or to update the price and/or quantity of one or more offers associated with one inventory item. Up to 25 offers associated with an inventory item may be updated with one bulkUpdatePriceQuantity call. Only one SKU (one product) can be updated per call. Note: Each listing can be revised up to 250...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/bulk_update_price_quantity",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_inventory_item",
    "description": "This call retrieves the inventory item record for a given SKU. The SKU value is passed in at the end of the call URI. There is no request payload for this call. The authorization header is the only required HTTP header for this call, and it is required for all Inventory API calls. See the HTTP request headers section for more information. For those who prefer to retrieve numerous inventory item...",
    "method": "GET",
    "host": "api",
    "path": "/sell/inventory/v1/inventory_item/{sku}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "sku",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the seller-defined SKU value of the product whose inventory item record you wish to retrieve. Use the getInventoryItems method..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_or_replace_inventory_item",
    "description": "Note: Please note that any eBay listing created using the Inventory API cannot be revised or relisted using the Trading API calls. Note: Each listing can be revised up to 250 times in one calendar day. If this revision threshold is reached, the seller will be blocked from revising the item until the next calendar day. This call creates a new inventory item record or replaces an existing invento...",
    "method": "PUT",
    "host": "api",
    "path": "/sell/inventory/v1/inventory_item/{sku}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "sku",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the seller-defined SKU value for the inventory item being created or updated. SKU values must be unique across the seller's inv..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_inventory_item",
    "description": "This call is used to delete an inventory item record associated with a specified SKU. A successful call will not only delete that inventory item record, but will also have the following effects: Delete any and all unpublished offers associated with that SKU; Delete any and all single-variation eBay listings associated with that SKU; Automatically remove that SKU from a multiple-variation listin...",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/inventory/v1/inventory_item/{sku}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "sku",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the seller-defined SKU value of the product whose inventory item record you wish to delete. Use the getInventoryItems method to..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_inventory_items",
    "description": "This call retrieves all inventory item records defined for the seller's account. The limit query parameter allows the seller to control how many records are returned per page, and the offset query parameter is used to retrieve a specific page of records. The seller can make multiple calls to scan through multiple pages of records. There is no request payload for this call. The authorization hea...",
    "method": "GET",
    "host": "api",
    "path": "/sell/inventory/v1/inventory_item",
    "tokenKind": "user",
    "fields": [
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The value passed in this query parameter sets the maximum number of records to return per page of data. Although this field is a string, the value passed in..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The value passed in this query parameter sets the page number to retrieve. The first page of records has a value of 0 , the second page of records has a valu..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_product_compatibility",
    "description": "This call is used by the seller to retrieve the list of products that are compatible with the inventory item. The SKU value for the inventory item is passed into the call URI, and a successful call with return the compatible vehicle list associated with this inventory item. Product compatibility is currently only applicable to motor vehicle parts and accessory categories, but more categories ma...",
    "method": "GET",
    "host": "api",
    "path": "/sell/inventory/v1/inventory_item/{sku}/product_compatibility",
    "tokenKind": "user",
    "fields": [
      {
        "name": "sku",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the SKU (stock keeping unit) of the inventory item associated with the product compatibility list being retrieved. Use the getI..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_or_replace_product_compatibility",
    "description": "This call is used by the seller to create or replace a list of products that are compatible with the inventory item. The inventory item is identified with a SKU value in the URI. Product compatibility is currently only applicable to motor vehicle parts and accessory categories, but more categories may be supported in the future. Note: In addition to the authorization header, which is required f...",
    "method": "PUT",
    "host": "api",
    "path": "/sell/inventory/v1/inventory_item/{sku}/product_compatibility",
    "tokenKind": "user",
    "fields": [
      {
        "name": "sku",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the SKU (stock keeping unit) of the inventory item associated with the compatibility list being created. Use the getInventoryIt..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_product_compatibility",
    "description": "This call is used by the seller to delete the list of products that are compatible with the inventory item that is associated with the compatible product list. The inventory item is identified with a SKU value in the URI. Product compatibility is currently only applicable to motor vehicle parts and accessory categories, but more categories may be supported in the future.",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/inventory/v1/inventory_item/{sku}/product_compatibility",
    "tokenKind": "user",
    "fields": [
      {
        "name": "sku",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the SKU (stock keeping unit) of the inventory item that is associated with the product compatibility list that is being deleted..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_inventory_item_group",
    "description": "This call retrieves the inventory item group for a given inventoryItemGroupKey value. The inventoryItemGroupKey value is passed in at the end of the call URI.",
    "method": "GET",
    "host": "api",
    "path": "/sell/inventory/v1/inventory_item_group/{inventoryItemGroupKey}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "inventoryItemGroupKey",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the inventory item group being retrieved. This value is assigned by the seller when an inventory item..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_or_replace_inventory_item_group",
    "description": "Note: Each listing can be revised up to 250 times in one calendar day. If this revision threshold is reached, the seller will be blocked from revising the item until the next calendar day. This call creates a new inventory item group or updates an existing inventory item group. It is up to sellers whether they want to create a complete inventory item group record right from the start, or seller...",
    "method": "PUT",
    "host": "api",
    "path": "/sell/inventory/v1/inventory_item_group/{inventoryItemGroupKey}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "inventoryItemGroupKey",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the inventory item group being created or updated. This identifier is defined by the seller. This valu..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_inventory_item_group",
    "description": "This call deletes the inventory item group for a given inventoryItemGroupKey value.",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/inventory/v1/inventory_item_group/{inventoryItemGroupKey}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "inventoryItemGroupKey",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the inventory item group being deleted. This value is assigned by the seller when an inventory item gr..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_bulk_migrate_listing",
    "description": "This call is used to convert existing eBay Listings to the corresponding Inventory API objects. If an eBay listing is successfully migrated to the Inventory API model, new Inventory Location, Inventory Item, and Offer objects are created. For a multiple-variation listing that is successfully migrated, in addition to the three new Inventory API objects just mentioned, an Inventory Item Group obj...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/bulk_migrate_listing",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_sku_location_mapping",
    "description": "This method allows sellers to retrieve the locations mapped to a specific SKU within a listing. The listingId and sku of the listing are passed in as path parameters. This method only retrieves location mappings for a single SKU value; if a seller wishes to retrieve the location mappings for all items in a multiple-variation listing, this method must be called for each variation in the listing....",
    "method": "GET",
    "host": "api",
    "path": "/sell/inventory/v1/listing/{listingId}/sku/{sku}/locations",
    "tokenKind": "user",
    "fields": [
      {
        "name": "listingId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the listing that the SKU belongs to for which all mapped locations will be retrieved. Use the getOffer..."
      },
      {
        "name": "sku",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the seller-defined SKU value of the item/variation for which location mappings will be retrieved. This SKU value must be define..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_or_replace_sku_location_mapping",
    "description": "This method allows sellers to map multiple fulfillment center locations to single-SKU listing, or to a single SKU within a multiple-variation listing. This allows eBay to leverage the location metadata associated with a seller’s fulfillment centers to calculate more accurate estimated delivery dates on their listing. Note: While location mappings can be created for listings on any eBay marketpl...",
    "method": "PUT",
    "host": "api",
    "path": "/sell/inventory/v1/listing/{listingId}/sku/{sku}/locations",
    "tokenKind": "user",
    "fields": [
      {
        "name": "listingId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the listing for which multiple fulfillment center locations will be mapped to a SKU within that listin..."
      },
      {
        "name": "sku",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the seller-defined SKU value of the item/variation for which multiple fulfillment center locations will be mapped. This SKU val..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_sku_location_mapping",
    "description": "This method allows sellers to remove all location mappings associated with a specific SKU within a listing. The listingId and sku of the listing are passed in as path parameters. Important! To remove all location mappings from a multiple-variation listing, this method must be used for each individual SKU in the listing.",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/inventory/v1/listing/{listingId}/sku/{sku}/locations",
    "tokenKind": "user",
    "fields": [
      {
        "name": "listingId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the listing that the SKU belongs to for which all mapped locations will be removed. Use the getOffers..."
      },
      {
        "name": "sku",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the seller-defined SKU value of the item/variation for which location mappings will be removed. This SKU value must be defined..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_bulk_create_offer",
    "description": "This call creates multiple offers (up to 25) for specific inventory items on a specific eBay marketplace. Although it is not a requirement for the seller to create complete offers (with all necessary details) right from the start, eBay recommends that the seller provide all necessary details with this call since there is currently no bulk operation available to update multiple offers with one c...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/bulk_create_offer",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_publish_offer",
    "description": "Note: Each listing can be revised up to 250 times in one calendar day. If this revision threshold is reached, the seller will be blocked from revising the item until the next calendar day. This call is used to convert unpublished offers (up to 25) into published offers, or live eBay listings. The unique identifier ( offerId ) of each offer to publish is passed into the request payload. It is po...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/bulk_publish_offer",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_offers",
    "description": "This call retrieves all existing offers for the specified SKU value. The seller has the option of limiting the offers that are retrieved to a specific eBay marketplace, or to a listing format. Note: At this time, the same SKU value can not be offered across multiple eBay marketplaces, so the marketplace_id query parameter currently does not have any practical use for this call. Note: The same S...",
    "method": "GET",
    "host": "api",
    "path": "/sell/inventory/v1/offer",
    "tokenKind": "user",
    "fields": [
      {
        "name": "format",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This enumeration value sets the listing format for the offers being retrieved. This query parameter will be passed in if the seller only wants to see offers..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The value passed in this query parameter sets the maximum number of records to return per page of data. Although this field is a string, the value passed in..."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The unique identifier of the eBay marketplace. This query parameter will be passed in if the seller only wants to see the product's offers on a specific eBay..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The value passed in this query parameter sets the page number to retrieve. Although this field is a string, the value passed in this field should be a intege..."
      },
      {
        "name": "sku",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The seller-defined SKU value is passed in as a query parameter. All offers associated with this product are returned in the response. Note: The same SKU can..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_offer",
    "description": "This call creates an offer for a specific inventory item on a specific eBay marketplace. It is up to the sellers whether they want to create a complete offer (with all necessary details) right from the start, or sellers can provide only some information with the initial createOffer call, and then make one or more subsequent updateOffer calls to complete the offer and prepare to publish the offe...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/offer",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_offer",
    "description": "This call retrieves a specific published or unpublished offer. The unique identifier of the offer ( offerId ) is passed in at the end of the call URI. The authorization header is the only required HTTP header for this call. See the HTTP request headers section for more information.",
    "method": "GET",
    "host": "api",
    "path": "/sell/inventory/v1/offer/{offerId}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "offerId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the offer that is to be retrieved. Use the getOffers method to retrieve offer IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_offer",
    "description": "This call updates an existing offer. An existing offer may be in published state (active eBay listing), or in an unpublished state and yet to be published with the publishOffer call. The unique identifier ( offerId ) for the offer to update is passed in at the end of the call URI. The updateOffer call does a complete replacement of the existing offer object, so all fields that make up the curre...",
    "method": "PUT",
    "host": "api",
    "path": "/sell/inventory/v1/offer/{offerId}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "offerId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the offer being updated. Use the getOffers method to retrieve offer IDs."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_offer",
    "description": "If used against an unpublished offer, this call will permanently delete that offer. In the case of a published offer (or live eBay listing), a successful call will either end the single-variation listing associated with the offer, or it will remove that product variation from the eBay listing and also automatically remove that product variation from the inventory item group. In the case of a mu...",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/inventory/v1/offer/{offerId}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "offerId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the offer being deleted. Use the getOffers method to retrieve offer IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_listing_fees",
    "description": "This call is used to retrieve the expected listing fees for up to 250 unpublished offers. An array of one or more offerId values are passed in under the offers container. In the response payload, all listing fees are grouped by eBay marketplace, and listing fees per offer are not shown. A fees container will be returned for each eBay marketplace where the seller is selling the products associat...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/offer/get_listing_fees",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_publish_offer",
    "description": "Note: Each listing can be revised up to 250 times in one calendar day. If this revision threshold is reached, the seller will be blocked from revising the item until the next calendar day. This call is used to convert an unpublished offer into a published offer, or live eBay listing. The unique identifier of the offer ( offerId ) is passed in at the end of the call URI. Important! Publish offer...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/offer/{offerId}/publish",
    "tokenKind": "user",
    "fields": [
      {
        "name": "offerId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the offer that is to be published. Use the getOffers method to retrieve offer IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_publish_offer_by_inventory_item_group",
    "description": "Note: Please note that any eBay listing created using the Inventory API cannot be revised or relisted using the Trading API calls. Note: Each listing can be revised up to 250 times in one calendar day. If this revision threshold is reached, the seller will be blocked from revising the item until the next calendar day. This call is used to convert all unpublished offers associated with an invent...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/offer/publish_by_inventory_item_group",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_withdraw_offer",
    "description": "This call is used to end a single-variation listing that is associated with the specified offer. This call is used in place of the deleteOffer call if the seller only wants to end the listing associated with the offer but does not want to delete the offer object. With this call, the offer object remains, but it goes into the unpublished state, and will require a publishOffer call to relist the...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/offer/{offerId}/withdraw",
    "tokenKind": "user",
    "fields": [
      {
        "name": "offerId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the offer that is to be withdrawn. Use the getOffers method to retrieve offer IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_withdraw_offer_by_inventory_item_group",
    "description": "This call is used to end a multiple-variation eBay listing that is associated with the specified inventory item group. This call only ends multiple-variation eBay listing associated with the inventory item group but does not delete the inventory item group object. Similarly, this call also does not delete any of the offers associated with the inventory item group, but instead all of these offer...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/offer/withdraw_by_inventory_item_group",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_inventory_location",
    "description": "This call retrieves all defined details of the inventory location that is specified by the merchantLocationKey path parameter. A successful call will return an HTTP status value of 200 OK .",
    "method": "GET",
    "host": "api",
    "path": "/sell/inventory/v1/location/{merchantLocationKey}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "merchantLocationKey",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique merchant-defined key (ID) for an inventory location that is being retrieved. Use the getInventoryLocations method to..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_inventory_location",
    "description": "Use this call to create a new inventory location. In order to create and publish an offer (and create an eBay listing), a seller must have at least one location, as every offer must be associated with at least one location. Important! Publish offer note: Fields may be optional or conditionally required when calling this method, but become required when publishing the offer to create an active l...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/location/{merchantLocationKey}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "merchantLocationKey",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique, seller-defined key (ID) for an inventory location. Max length : 36"
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_inventory_location",
    "description": "This call deletes the inventory location that is specified in the merchantLocationKey path parameter. Note that deleting a location will not affect any active eBay listings associated with the deleted location, but the seller will not be able modify the offers associated with the location once it is deleted. Note: Deletion is not currently supported for fulfillment center locations, as location...",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/inventory/v1/location/{merchantLocationKey}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "merchantLocationKey",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique merchant-defined key (ID) for the inventory location that is to be deleted. Use the getInventoryLocations method to..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_disable_inventory_location",
    "description": "This call disables the inventory location that is specified in the merchantLocationKey path parameter. Sellers can not load/modify inventory to disabled locations. Note that disabling a location will not affect any active eBay listings associated with the disabled location, but the seller will not be able modify the offers associated with a disabled location. A successful call will return an HT...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/location/{merchantLocationKey}/disable",
    "tokenKind": "user",
    "fields": [
      {
        "name": "merchantLocationKey",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique merchant-defined key (ID) for an inventory location that is to be disabled. Use the getInventoryLocations method to..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_enable_inventory_location",
    "description": "This call enables a disabled inventory location that is specified in the merchantLocationKey path parameter. Once a disabled location is enabled, sellers can start loading/modifying inventory to that location. A successful call will return an HTTP status value of 200 OK .",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/location/{merchantLocationKey}/enable",
    "tokenKind": "user",
    "fields": [
      {
        "name": "merchantLocationKey",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies unique merchant-defined key (ID) for a disabled inventory location that is to be enabled. Use the getInventoryLocations method..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_inventory_locations",
    "description": "This call retrieves all defined details for every inventory location associated with the seller's account. There are no required parameters for this call and no request payload. However, there are two optional query parameters, limit and offset . The limit query parameter sets the maximum number of locations returned on one page of data, and the offset query parameter specifies the page of data...",
    "method": "GET",
    "host": "api",
    "path": "/sell/inventory/v1/location",
    "tokenKind": "user",
    "fields": [
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The value passed in this query parameter sets the maximum number of records to return per page of data. Although this field is a string, the value passed in..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the number of locations to skip in the result set before returning the first location in the paginated response. Combine offset with the limit quer..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_inventory_location",
    "description": "Use this call to update location details for an existing inventory location. Specify the inventory location you want to update using the merchantLocationKey path parameter. You can update the following text-based fields: name , phone , timeZoneId , geoCoordinates , fulfillmentCenterSpecifications , locationTypes , locationWebUrl , locationInstructions and locationAdditionalInformation any numbe...",
    "method": "POST",
    "host": "api",
    "path": "/sell/inventory/v1/location/{merchantLocationKey}/update_location_details",
    "tokenKind": "user",
    "fields": [
      {
        "name": "merchantLocationKey",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique merchant-defined key (ID) for an inventory location that is to be updated. Use the getInventoryLocations method to r..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_order_tasks",
    "description": "This method returns the details and status for an array of order tasks based on a specified feed_type or schedule_id . Specifying both feed_type and schedule_id results in an error. Since schedules are based on feed types, you can specify a schedule ( schedule_id ) that returns the needed feed_type . If specifying the feed_type , limit which order tasks are returned by specifying filters such a...",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/order_task",
    "tokenKind": "user",
    "fields": [
      {
        "name": "date_range",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The order tasks creation date range. This range is used to filter the results. The filtered results are filtered to include only tasks with a creation date t..."
      },
      {
        "name": "feed_type",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The feed type associated with the order tasks being retrieved. The only presently supported value is LMS_ORDER_REPORT See Report download feed types for more..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The maximum number of order tasks that can be returned on each page of the paginated response. Use this parameter in conjunction with the offset parameter to..."
      },
      {
        "name": "look_back_days",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of previous days in which to search for tasks. Do not use with the date_range parameter. If both date_range and look_back_days are omitted, this p..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of order tasks to skip in the result set before returning the first order in the paginated response. Combine offset with the limit query parameter..."
      },
      {
        "name": "schedule_id",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The schedule ID associated with the order tasks being retrieved. A schedule periodically generates a report, and these schedules can be created with the crea..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_order_task",
    "description": "This method creates an order download task with filter criteria for the order report. When using this method, specify the feedType , schemaVersion , and filterCriteria for the report. The method returns the location response header containing the getOrderTask call URI to retrieve the order task you just created. The URL includes the eBay-assigned task ID, which you can use to reference the orde...",
    "method": "POST",
    "host": "api",
    "path": "/sell/feed/v1/order_task",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_order_task",
    "description": "This method retrieves the task details and status of the specified task. The input is task_id . For details about how this method is used, see Working with Order Feeds in the Selling Integration Guide.",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/order_task/{task_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "task_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the order task being retrieved. Use the getOrderTasks method to retrieve order task IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_inventory_tasks",
    "description": "This method searches for multiple tasks of a specific feed type, and includes date filters and pagination.",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/inventory_task",
    "tokenKind": "user",
    "fields": [
      {
        "name": "feed_type",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The feed type associated with the inventory tasks being retrieved. Presently, only one feed type is available: LMS_ACTIVE_INVENTORY_REPORT See Report value f..."
      },
      {
        "name": "schedule_id",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Note: Schedule functionality for ActiveInventoryReport is currently unavailable, so this field is not usable."
      },
      {
        "name": "look_back_days",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of previous days in which to search for tasks. Do not use with the date_range parameter. If both date_range and look_back_days are omitted, this p..."
      },
      {
        "name": "date_range",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the range of task creation dates used to filter the results. The results are filtered to include only tasks with a creation date that is equal to t..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The maximum number of tasks that can be returned on each page of the paginated response. Use this parameter in conjunction with the offset parameter to contr..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of tasks to skip in the result set before returning the first task in the paginated response. Combine offset with the limit query parameter to con..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_inventory_task",
    "description": "This method creates an inventory-related download task for a specified feed type with optional filter criteria. When using this method, specify the feedType . This method returns the location response header containing the getInventoryTask call URI to retrieve the inventory task you just created. The URL includes the eBay-assigned task ID, which you can use to reference the inventory task. To r...",
    "method": "POST",
    "host": "api",
    "path": "/sell/feed/v1/inventory_task",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_inventory_task",
    "description": "This method retrieves the task details and status of the specified inventory-related task. The input is task_id .",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/inventory_task/{task_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "task_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the inventory task being retrieved. Use the getInventoryTasks method to retrieve inventory task IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_schedules",
    "description": "This method retrieves an array containing the details and status of all schedules based on the specified feed_type . Use this method to find a schedule if you do not know the schedule_id .",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/schedule",
    "tokenKind": "user",
    "fields": [
      {
        "name": "feed_type",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "The feed type associated with the schedules being retrieved. Note: Schedules are currently only available for LMS_ORDER_REPORT ."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The maximum number of schedules that can be returned on each page of the paginated response. Use this parameter in conjunction with the offset parameter to c..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of schedules to skip in the result set before returning the first schedule in the paginated response. Combine offset with the limit query paramete..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_schedule",
    "description": "This method creates a schedule, which is a subscription to the specified schedule template. A schedule periodically generates a report for the feedType specified by the template. Specify the same feedType as the feedType of the associated schedule template. When creating the schedule, if available from the template, you can specify a preferred trigger hour, day of the week, or day of the month....",
    "method": "POST",
    "host": "api",
    "path": "/sell/feed/v1/schedule",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_schedule",
    "description": "This method retrieves schedule details and status of the specified schedule. Specify the schedule to retrieve using the schedule_id . Use the getSchedules method to find a schedule if you do not know the schedule_id .",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/schedule/{schedule_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "schedule_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the schedule for which to retrieve details. Use the getSchedules method to retrieve schedule IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_schedule",
    "description": "This method updates an existing schedule. Specify the schedule to update using the schedule_id path parameter. If the schedule template has changed after the schedule was created or updated, the input will be validated using the changed template. Note: Make sure to include all fields required by the schedule template ( scheduleTemplateId ). Call the getScheduleTemplate method (or the getSchedul...",
    "method": "PUT",
    "host": "api",
    "path": "/sell/feed/v1/schedule/{schedule_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "schedule_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the schedule being updated. Use the getSchedules method to retrieve schedule IDs."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_schedule",
    "description": "This method deletes an existing schedule. Specify the schedule to delete using the schedule_id path parameter.",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/feed/v1/schedule/{schedule_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "schedule_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the schedule being deleted. Use the getSchedules method to retrieve schedule IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_latest_result_file",
    "description": "This method downloads the latest Order Report generated by the schedule. The response of this call is a compressed or uncompressed CSV, XML, or JSON file, with the applicable file extension (for example: csv.gz). Specify the schedule_id path parameter to download its last generated file.",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/schedule/{schedule_id}/download_result_file",
    "tokenKind": "user",
    "fields": [
      {
        "name": "schedule_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the schedule for which to retrieve the latest Order Report. Use the getSchedules method to retrieve schedule..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_schedule_template",
    "description": "This method retrieves the details of the specified template. Specify the template to retrieve using the schedule_template_id path parameter. Use the getScheduleTemplates method to find a schedule template if you do not know the schedule_template_id .",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/schedule_template/{schedule_template_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "schedule_template_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the schedule template being retrieved. Use the getScheduleTemplates method to retrieve schedule template IDs...."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_schedule_templates",
    "description": "This method retrieves an array containing the details and status of all schedule templates based on the specified feed_type . Use this method to find a schedule template if you do not know the schedule_template_id .",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/schedule_template",
    "tokenKind": "user",
    "fields": [
      {
        "name": "feed_type",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "The feed type of the schedule templates to retrieve. Note: Schedules are currently only available for LMS_ORDER_REPORT ."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The maximum number of schedule templates that can be returned on each page of the paginated response. Use this parameter in conjunction with the offset param..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of schedule templates to skip in the result set before returning the first template in the paginated response. Combine offset with the limit query..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_tasks",
    "description": "This method returns the details and status for an array of tasks based on a specified feed_type or schedule_id . Specifying both feed_type and schedule_id results in an error. Since schedules are based on feed types, you can specify a schedule ( schedule_id ) that returns the needed feed_type . If specifying the feed_type , limit which tasks are returned by specifying filters, such as the creat...",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/task",
    "tokenKind": "user",
    "fields": [
      {
        "name": "date_range",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the range of task creation dates used to filter the results. The results are filtered to include only tasks with a creation date that is equal to t..."
      },
      {
        "name": "feed_type",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The feed type associated with the tasks to be returned. Only use a feedType that is available for your API: Order Feeds: LMS_ORDER_ACK, LMS_ORDER_REPORT Inve..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The maximum number of tasks that can be returned on each page of the paginated response. Use this parameter in conjunction with the offset parameter to contr..."
      },
      {
        "name": "look_back_days",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of previous days in which to search for tasks. Do not use with the date_range parameter. If both date_range and look_back_days are omitted, this p..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of tasks to skip in the result set before returning the first task in the paginated response. Combine offset with the limit query parameter to con..."
      },
      {
        "name": "schedule_id",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The unique identifier associated with the tasks being returned. A schedule periodically generates a report for the feed type specified by the schedule templa..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_task",
    "description": "This method creates an upload task or a download task without filter criteria. When using this method, specify the feedType and the feed file schemaVersion . The feed type specified sets the task as a download or an upload task. For details about the upload and download flows, see Working with Order Feeds in the Selling Integration Guide. Note: The scope depends on the feed type. An error messa...",
    "method": "POST",
    "host": "api",
    "path": "/sell/feed/v1/task",
    "tokenKind": "user",
    "fields": [
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "The Accept-Language header is required for listing items in the French Canada and French Belgium marketplaces. Set the following headers to list items on the..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_input_file",
    "description": "This method downloads the file previously uploaded using uploadFile . Specify the task_id from the uploadFile call. Note: With respect to LMS, this method applies to all feed types except LMS_ORDER_REPORT and LMS_ACTIVE_INVENTORY_REPORT . See LMS API Feeds in the Selling Integration Guide.",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/task/{task_id}/download_input_file",
    "tokenKind": "user",
    "fields": [
      {
        "name": "task_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the task associated with the input file to be downloaded. Use the getTasks method to retrieve task IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_result_file",
    "description": "This method retrieves the generated file that is associated with the specified task ID. The response of this call is a compressed or uncompressed CSV, XML, or JSON file, with the applicable file extension (for example: csv.gz). For details about how this method is used, see Working with Order Feeds in the Selling Integration Guide. Note: The status of the task to retrieve must be in the COMPLET...",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/task/{task_id}/download_result_file",
    "tokenKind": "user",
    "fields": [
      {
        "name": "task_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the task associated with the file to be downloaded. Use the getTasks method to retrieve task IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_task",
    "description": "This method retrieves the details and status of the specified task. The input is task_id . For details of how this method is used, see Working with Order Feeds in the Selling Integration Guide.",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/task/{task_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "task_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the task being retrieved. Use the getTasks method to retrieve task IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_upload_file",
    "description": "This method associates the specified file with the specified task ID and uploads the input file. After the file has been uploaded, the processing of the file begins. Reports often take time to generate and it's common for this method to return an HTTP status of 202, which indicates the report is being generated. Use the getTask with the task ID or getTasks to determine the status of a report. T...",
    "method": "POST",
    "host": "api",
    "path": "/sell/feed/v1/task/{task_id}/upload_file",
    "tokenKind": "user",
    "fields": [
      {
        "name": "task_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the task associated with the file that will be uploaded. Use the getTasks method to retrieve task IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_customer_service_metric_tasks",
    "description": "Use this method to return an array of customer service metric tasks. You can limit the tasks returned by specifying a date range. Note: You can pass in either the look_back_days or date_range , but not both.",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/customer_service_metric_task",
    "tokenKind": "user",
    "fields": [
      {
        "name": "date_range",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The task creation date range. The results are filtered to include only tasks with a creation date that is equal to the dates specified or is within the speci..."
      },
      {
        "name": "feed_type",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The feed type associated with the tasks being retrieved. The only presently supported value is CUSTOMER_SERVICE_METRICS_REPORT ."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of customer service metric tasks to return per page of the result set. Use this parameter in conjunction with the offset parameter to control the..."
      },
      {
        "name": "look_back_days",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of previous days in which to search for tasks. Do not use with the date_range parameter. If both date_range and look_back_days are omitted, this p..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of customer service metric tasks to skip in the result set before returning the first task in the paginated response. Combine offset with the limi..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_customer_service_metric_task",
    "description": "Use this method to create a customer service metrics download task with filter criteria for the customer service metrics report. When using this method, specify the feedType and filterCriteria including both evaluationMarketplaceId and customerServiceMetricType for the report. The method returns the location response header containing the call URI to use with getCustomerServiceMetricTask to ret...",
    "method": "POST",
    "host": "api",
    "path": "/sell/feed/v1/customer_service_metric_task",
    "tokenKind": "user",
    "fields": [
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": true,
        "description": "Use this header to specify the natural language in which the authenticated user desires the response. For example, en-US for English or de-DE for German."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_customer_service_metric_task",
    "description": "Use this method to retrieve customer service metric task details for the specified task. The input is task_id .",
    "method": "GET",
    "host": "api",
    "path": "/sell/feed/v1/customer_service_metric_task/{task_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "task_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the customer service metric task being retrieved. Use the getCustomerServiceMetricTasks method to retrieve ta..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_image_from_file",
    "description": "This method uploads a picture file to eBay Picture Services (EPS) using multipart/form-data. All images must comply with eBay's picture requirements, such as dimension and file size restrictions. For more information, see Picture policy . The image formats supported are JPG , GIF , PNG , BMP , TIFF , AVIF , HEIC , and WEBP . For more information, see Image requirements . Note: Animated GIF, and...",
    "method": "POST",
    "host": "apim",
    "path": "/commerce/media/v1_beta/image/create_image_from_file",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_image_from_url",
    "description": "This method uploads a picture to eBay Picture Services (EPS) from the specified URL. Specify the location of the picture on an external web server through the imageUrl field. All images must comply with eBay’s picture requirements, such as dimension and file size restrictions. For more information, see Picture policy . The image formats supported are JPG , GIF , PNG , BMP , TIFF , AVIF , HEIC ,...",
    "method": "POST",
    "host": "apim",
    "path": "/commerce/media/v1_beta/image/create_image_from_url",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_image",
    "description": "This method retrieves an EPS image URL and its expiration details for the unique identifier specified in the path parameter image_id . Use the retrieved EPS image URL to add the image to a listing through the Inventory API or the Trading API . See Managing images for additional details. Note: If a user inputs a valid image_id as a path parameter but the EPS image associated with that ID has exp...",
    "method": "GET",
    "host": "apim",
    "path": "/commerce/media/v1_beta/image/{image_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "image_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of a created image. Use the value returned in the location header of the method used to create the image ( creat..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_video",
    "description": "This method creates a video resource. When using this method, specify the title , size , and classification of the video resource to be created. Description is an optional field for this method. Tip: See Adding a video to your listing in the eBay Seller Center for details about video formatting requirements and restrictions, or visit the relevant eBay site help pages for the region in which the...",
    "method": "POST",
    "host": "apim",
    "path": "/commerce/media/v1_beta/video",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_video",
    "description": "This method retrieves a video's metadata and content given a specified video ID . The method returns the title , size , classification , description , video ID , playList , status , status message (if any), expiration date , and thumbnail image of the retrieved video. The video's title , size , classification , and description are set using the createVideo method. The video's playList contains...",
    "method": "GET",
    "host": "apim",
    "path": "/commerce/media/v1_beta/video/{video_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "video_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the video to be retrieved."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_upload_video",
    "description": "This method associates the specified file with the specified video ID and uploads the input file. After the file has been uploaded the processing of the file begins. Note: The size of the video to be uploaded must exactly match the size of the video's input stream that was set in the createVideo method. If the sizes do not match, the video will not upload successfully. When a video is successfu...",
    "method": "POST",
    "host": "apim",
    "path": "/commerce/media/v1_beta/video/{video_id}/upload",
    "tokenKind": "user",
    "fields": [
      {
        "name": "Content-Length",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "Use this header to specify the content length for the upload. Use Content-Range: bytes {1}-{2}/{3} and Content-Length:{4} headers. Note: This header is optio..."
      },
      {
        "name": "Content-Range",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "Use this header to specify the content range for the upload. The Content-Range should be of the following bytes ((?:[0-9]+-[0-9]+)|\\\\\\\\*)/([0-9]+|\\\\\\\\*) patt..."
      },
      {
        "name": "video_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the video to be uploaded."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_document",
    "description": "This method stages a document to be uploaded, and requires the type of document to be uploaded, and the language(s) that the document contains. A successful call returns a documentId value that is then used as a path parameter in an uploadDocument call. When a document is successfully created, the method returns the HTTP Status Code 201 Created. The method returns documentId in the response pay...",
    "method": "POST",
    "host": "apim",
    "path": "/commerce/media/v1_beta/document",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_create_document_from_url",
    "description": "This method downloads a document from the provided URL and adds that document to the user's account. This method requires the URL of the document, the type of document to be uploaded, and the language(s) that the document contains. When a document is successfully created, the method returns the HTTP Status Code 201 Created. The method returns documentId in the response payload, which you can us...",
    "method": "POST",
    "host": "apim",
    "path": "/commerce/media/v1_beta/document/create_document_from_url",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_document",
    "description": "This method retrieves the current status and metadata of the specified document. Important! The document ID value returned in the response payload of the createDocument method is a required input path parameter for this method. See Managing documents for additional information.",
    "method": "GET",
    "host": "apim",
    "path": "/commerce/media/v1_beta/document/{document_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "document_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the document for which status and metadata is being retrieved. This value is returned in the response of the createDocument method."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_upload_document",
    "description": "This method associates the specified file with the specified document ID and uploads the input file. After the file has been uploaded, the processing of the file begins. Supported file types include .PDF, .JPEG/.JPG, and .PNG, with a maximum file size of 10 MB (10485760 bytes). Note: Animated and multi-page PNG files are not currently supported. Note: The document ID value returned in the respo...",
    "method": "POST",
    "host": "apim",
    "path": "/commerce/media/v1_beta/document/{document_id}/upload",
    "tokenKind": "user",
    "fields": [
      {
        "name": "document_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the document to be uploaded. This value is returned in the response of the createDocument method."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_download_post_order_document",
    "description": "This method downloads the file associated with the specified document ID. Access depends on the document’s state: SUBMITTED: Only the document owner can download it PUBLISHED: The document is no longer restricted to the owner and can be downloaded by authorized parties involved in the specific post‑order flow based on the documentUsageType Note: After a document is uploaded (but not yet publish...",
    "method": "GET",
    "host": "apim",
    "path": "/commerce/media/v1_beta/post_order/document/{document_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "document_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the document associated with the file to be downloaded. This ID was returned in the Location response header..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_remove_post_order_document",
    "description": "This method deletes a previously uploaded document by its document ID. Only documents in SUBMITTED state can be removed; documents in the PUBLISHED state cannot be deleted. Note: After a document is uploaded (but not yet published), its status is SUBMITTED . When its identifier is associated with a post‑order entity through an eBay GraphQL mutation, the status changes to PUBLISHED . A post-orde...",
    "method": "DELETE",
    "host": "apim",
    "path": "/commerce/media/v1_beta/post_order/document/{document_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "document_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the document associated with the file to be deleted. This ID was returned in the Location response header whe..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_upload_post_order_document",
    "description": "This method uploads a document for post‑order processes (for example, a seller providing a return shipping label). Supported file types include .PDF, .JPEG/.JPG, .BMP, .GIF and .PNG, with a maximum file size of 5 MB (5,242,880 bytes). Note: Animated and multi-page PNG files are not currently supported. For multi-page content, use PDF. The maximum number of pages allowed varies by the documentUs...",
    "method": "POST",
    "host": "apim",
    "path": "/commerce/media/v1_beta/post_order/document",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_store_categories",
    "description": "This method is used to retrieve the category hierarchy for an eBay user's store. Note: Three levels of store categories are supported.",
    "method": "GET",
    "host": "api",
    "path": "/sell/stores/v1/store/categories",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_add_store_category",
    "description": "This method is used to add a single new custom category to a user's eBay store through an asynchronous request. A successful call returns the getStoreTask URI in the Location response header. Call getStoreTask (or getStoreTasks ) method to retrieve the status of the add category operation. Note: Three levels of store categories are supported. Important! If you initiate a category change, you ca...",
    "method": "POST",
    "host": "api",
    "path": "/sell/stores/v1/store/categories",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_rename_store_category",
    "description": "This method is used to rename the single category of a user's eBay store through an asynchronous request. A successful call returns the getStoreTask URI in the Location response header. The user calls getStoreTask to retrieve the status of the rename category operation. Important! If you initiate a category change, you cannot make additional category changes until the previous change request ha...",
    "method": "PUT",
    "host": "api",
    "path": "/sell/stores/v1/store/categories/{category_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "category_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of an eBay Store's custom category. eBay auto-generates this identifier when a seller establishes a custom store category. This categor..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_store_category",
    "description": "This method is used to delete one custom category of a user's eBay store through an asynchronous request. A successful call returns the getStoreTask URI in the Location response header. Call getStoreTask (or getStoreTasks ) method to retrieve the status of the delete category operation. Important! If you initiate a category change, you cannot make additional category changes until the previous...",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/stores/v1/store/categories/{category_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "category_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of an eBay Store's custom category. eBay auto-generates this identifier when a seller establishes a custom store category. This categor..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_store",
    "description": "This method is used to retrieve information for an eBay user's store such as store name, store URL, and description.",
    "method": "GET",
    "host": "api",
    "path": "/sell/stores/v1/store",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_store_task",
    "description": "This method retrieves the current status of a recent store operation. The unique identifier of the task is passed in as a path parameter.",
    "method": "GET",
    "host": "api",
    "path": "/sell/stores/v1/store/tasks/{task_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "task_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of an eBay Store async task. A taskId value is returned in the response of other successful calls. (e.g.addStoreCategory, moveStoreCate..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_store_tasks",
    "description": "This method retrieves the status of all async store tasks for a store. Every task is set as FAILED or COMPLETED once it's execution time reaches 24 hours.",
    "method": "GET",
    "host": "api",
    "path": "/sell/stores/v1/store/tasks",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_move_store_category",
    "description": "This method is used to move an existing user's eBay store custom category through an asynchronous request. A successful call returns the getStoreTask URI in the Location response header. The user calls getStoreTask to retrieve the status of the move category operation. Important! If you initiate a category change, you cannot make additional category changes until the previous change request has...",
    "method": "POST",
    "host": "api",
    "path": "/sell/stores/v1/store/categories/move_category",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_automotive_parts_compatibility_policies",
    "description": "This method returns the eBay policies that define how to list automotive parts compatibility items in the categories of the specified marketplace. By default, this method returns all categories that support parts compatibility. You can limit the size of the result set by using the filter query parameter to specify only the category IDs you want to review. Note: To return policy information for...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_automotive_parts_compatibility_policies",
    "tokenKind": "application",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter limits the response by returning policy information for only the selected sections of the category tree. Supply categoryId values for th..."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which policy information is retrieved. Note: Only the following eBay marketplaces support automotive p..."
      },
      {
        "name": "Accept-Encoding",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header indicates the compression-encoding algorithms the client accepts for the response. This value should be set to gzip . For more information, refer..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_category_policies",
    "description": "This method returns eBay category policy metadata for all leaf categories on the specified marketplace. By default, this method returns metadata on all leaf categories. You can limit the size of the result set by using the filter query parameter to specify only the leaf category IDs you want to review. If you specify a valid marketplace ID but that marketplace does not contain policy informatio...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_category_policies",
    "tokenKind": "application",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter limits the response by only returning metadata for the specified leaf categories. Supply the categoryId for one or more leaf categories...."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which policy information is retrieved. See HTTP Request Headers for a list of supported eBay marketpla..."
      },
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_classified_ad_policies",
    "description": "This method returns eBay classified ad policy metadata for all leaf categories on the specified marketplace. By default, this method returns metadata on all leaf categories. You can limit the size of the result set by using the filter query parameter to specify only the leaf category IDs you want to review. If you specify a valid marketplace ID but that marketplace does not contain policy infor...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_classified_ad_policies",
    "tokenKind": "application",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter limits the response by only returning metadata for the specified leaf categories. Supply the categoryId for one or more leaf categories...."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which policy information is retrieved. See MarketplaceIdEnum for a list of supported eBay marketplace..."
      },
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_currencies",
    "description": "This method returns the default currency used by the eBay marketplace specified in the request. This is the currency that the seller should use when providing price data for this marketplace through listing APIs.",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_currencies",
    "tokenKind": "application",
    "fields": [
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which currency information is retrieved. See the MarketplaceIdEnum type for a list of supported eBay m..."
      },
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada and French Belgium marketplaces. Follow the instructions below to retrieve metadata for th..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_extended_producer_responsibility_policies",
    "description": "This method returns the Extended Producer Responsibility policies for one, multiple, or all eBay categories in an eBay marketplace. The identifier of the eBay marketplace is passed in as a path parameter, and unless one or more eBay category IDs are passed in through the filter query parameter, this method will return metadata on every applicable category for the specified marketplace. Note: Cu...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_extended_producer_responsibility_policies",
    "tokenKind": "application",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A query parameter that can be used to limit the response by returning policy information for only the selected sections of the category tree. Supply category..."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which policy information shall be retrieved. See HTTP Request Headers for a list of supported eBay mar..."
      },
      {
        "name": "Accept-Encoding",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header indicates the compression-encoding algorithms the client accepts for the response. This value should be set to gzip . For more information, refer..."
      },
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_hazardous_materials_labels",
    "description": "This method returns hazardous materials label information for the specified eBay marketplace. The information includes IDs, descriptions, and URLs (as applicable) for the available signal words, statements, and pictograms. The returned statements are localized for the default language of the marketplace. If a marketplace does not support hazardous materials label information, no response payloa...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_hazardous_materials_labels",
    "tokenKind": "application",
    "fields": [
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which hazardous materials label information shall be retrieved. See HTTP Request Headers for a list of..."
      },
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_item_condition_policies",
    "description": "This method returns item condition metadata on one, multiple, or all eBay categories on an eBay marketplace. This metadata consists of the different item conditions (with IDs) that an eBay category supports, and a boolean to indicate if an eBay category requires an item condition. If applicable, this metadata also shows the different condition descriptors (with IDs) that an eBay category suppor...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_item_condition_policies",
    "tokenKind": "user",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter limits the response by returning policy information for only the selected sections of the category tree. Supply categoryId values for th..."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which policy information is retrieved. See HTTP Request Headers for a list of supported eBay marketpla..."
      },
      {
        "name": "Accept-Encoding",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header indicates the compression-encoding algorithms the client accepts for the response. This value should be set to gzip . For more information, refer..."
      },
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_listing_structure_policies",
    "description": "This method returns the eBay policies that define the allowed listing structures for the categories of a specific marketplace. The listing-structure policies currently pertain to whether or not you can list items with variations. By default, this method returns the entire category tree for the specified marketplace. You can limit the size of the result set by using the filter query parameter to...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_listing_structure_policies",
    "tokenKind": "application",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter limits the response by returning policy information for only the selected sections of the category tree. Supply categoryId values for th..."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which policy information is retrieved. See HTTP Request Headers for a list of supported eBay marketpla..."
      },
      {
        "name": "Accept-Encoding",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header indicates the compression-encoding algorithms the client accepts for the response. This value should be set to gzip . For more information, refer..."
      },
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_listing_type_policies",
    "description": "This method returns eBay listing type policy metadata for all leaf categories on the specified marketplace. By default, this method returns metadata on all leaf categories. You can limit the size of the result set by using the filter query parameter to specify only the leaf category IDs you want to review. If you specify a valid marketplace ID but that marketplace does not contain policy inform...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_listing_type_policies",
    "tokenKind": "application",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter limits the response by only returning metadata for the specified leaf categories. Supply the categoryId for one or more leaf categories...."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which policy information is retrieved. See HTTP Request Headers for a list of supported eBay marketpla..."
      },
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_motors_listing_policies",
    "description": "This method returns eBay Motors policy metadata for all leaf categories on the specified marketplace. By default, this method returns metadata on all leaf categories. You can limit the size of the result set by using the filter query parameter to specify only the leaf category IDs you want to review. If you specify a valid marketplace ID but that marketplace does not contain policy information,...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_motors_listing_policies",
    "tokenKind": "application",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter limits the response by only returning metadata for the specified leaf categories. Supply the categoryId for one or more leaf categories...."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which policy information is retrieved. See HTTP Request Headers for a list of supported eBay marketpla..."
      },
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_negotiated_price_policies",
    "description": "This method returns the eBay policies that define the supported negotiated price features (like \"best offer\") for the categories of a specific marketplace. By default, this method returns the entire category tree for the specified marketplace. You can limit the size of the result set by using the filter query parameter to specify only the category IDs you want to review. Tip: This method can po...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_negotiated_price_policies",
    "tokenKind": "application",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter limits the response by returning policy information for only the selected sections of the category tree. Supply categoryId values for th..."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which policy information is retrieved. See HTTP Request Headers for a list of supported eBay marketpla..."
      },
      {
        "name": "Accept-Encoding",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header indicates the compression-encoding algorithms the client accepts for the response. This value should be set to gzip . For more information, refer..."
      },
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_product_safety_labels",
    "description": "This method returns product safety label information for the specified eBay marketplace. The information includes IDs, descriptions, and URLs (as applicable) for the available statements and pictograms. The returned statements are localized for the default language of the marketplace. If a marketplace does not support product safety label information, no response payload is returned, but only a...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_product_safety_labels",
    "tokenKind": "application",
    "fields": [
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which policy information is retrieved. See HTTP Request Headers for a list of supported eBay marketpla..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_regulatory_policies",
    "description": "This method returns regulatory policies for one, multiple, or all eBay categories in an eBay marketplace. The identifier of the eBay marketplace is passed in as a path parameter, and unless one or more eBay category IDs are passed in through the filter query parameter, this method will return metadata for every listing category in the specified marketplace. Tip: This method can potentially retu...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_regulatory_policies",
    "tokenKind": "application",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A query parameter that can be used to limit the response by returning policy information for only the selected sections of the category tree. Supply category..."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which policy information shall be retrieved. See HTTP Request Headers for a list of supported eBay mar..."
      },
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_sell_metadata_get_return_policies",
    "description": "This method returns the eBay policies that define whether or not you must include a return policy for the items you list in the categories of a specific marketplace, plus the guidelines for creating domestic and international return policies in the different eBay categories. By default, this method returns the entire category tree for the specified marketplace. You can limit the size of the res...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_return_policies",
    "tokenKind": "application",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter limits the response by returning policy information for only the selected sections of the category tree. Supply categoryId values for th..."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which policy information is retrieved. See HTTP Request Headers for a list of supported eBay marketpla..."
      },
      {
        "name": "Accept-Encoding",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header indicates the compression-encoding algorithms the client accepts for the response. This value should be set to gzip . For more information, refer..."
      },
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_shipping_policies",
    "description": "This method returns eBay shipping policy metadata for all leaf categories on the specified marketplace. By default, this method returns metadata on all leaf categories. You can limit the size of the result set by using the filter query parameter to specify only the leaf category IDs you want to review. If you specify a valid marketplace ID but that marketplace does not contain policy informatio...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_shipping_policies",
    "tokenKind": "application",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter limits the response by only returning metadata for the specified leaf categories. Supply the categoryId for one or more leaf categories...."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which policy information is retrieved. See HTTP Request Headers for a list of supported eBay marketpla..."
      },
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_site_visibility_policies",
    "description": "This method returns eBay international site visibility policy metadata for all leaf categories on the specified marketplace. By default, this method returns metadata on all leaf categories. You can limit the size of the result set by using the filter query parameter to specify only the leaf category IDs you want to review. If you specify a valid marketplace ID but that marketplace does not cont...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/marketplace/{marketplace_id}/get_site_visibility_policies",
    "tokenKind": "application",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter limits the response by only returning metadata for the specified leaf categories. Supply the categoryId for one or more leaf categories...."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which policy information is retrieved. See HTTP Request Headers for a list of supported eBay marketpla..."
      },
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_compatibilities_by_specification",
    "description": "This method is used to retrieve all compatible application name-value pairs for a part based on the provided specification(s). The part's relevant dimensions and/or characteristics can be provided through the specifications container. For example, when retrieving compatible application name-value pairs for a tire, the tire's dimensions (such as the section width or rim diameter) should be provi...",
    "method": "POST",
    "host": "api",
    "path": "/sell/metadata/v1/compatibilities/get_compatibilities_by_specification",
    "tokenKind": "application",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_compatibility_property_names",
    "description": "This method is used to retrieve product compatibility property names for the specified compatibility-enabled category. Compatibility property names can be used alongside the corresponding compatibility property value (retrieved using the getCompatibilityPropertyValues method) to describe the assembly for which an item is compatible. The categoryId of the compatibility-enabled category for which...",
    "method": "POST",
    "host": "api",
    "path": "/sell/metadata/v1/compatibilities/get_compatibility_property_names",
    "tokenKind": "application",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_sell_metadata_get_compatibility_property_values",
    "description": "This method is used to retrieve product compatibility property values associated with a single property name, in the specified category. Compatibility property values can be used alongside the corresponding compatibility property name (retrieved using the getCompatibilityPropertyNames method) to describe the assembly for which an item is compatible. The categoryId of the compatibility-enabled c...",
    "method": "POST",
    "host": "api",
    "path": "/sell/metadata/v1/compatibilities/get_compatibility_property_values",
    "tokenKind": "application",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_multi_compatibility_property_values",
    "description": "This method is used to retrieve product compatibility property values associated with multiple property names, in the specified category. Compatibility property values can be used alongside the corresponding compatibility property name (retrieved using the getCompatibilityPropertyNames method) to describe the assembly for which an item is compatible. The categoryId of the compatibility-enabled...",
    "method": "POST",
    "host": "api",
    "path": "/sell/metadata/v1/compatibilities/get_multi_compatibility_property_values",
    "tokenKind": "application",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_product_compatibilities",
    "description": "This method is used to retrieve all available item compatibility details for the specified product. Item compatibility details can be used to see the properties for which an item is compatible. For example, if you are searching for a part for a specific vehicle, you can use this method to see the years, engine, and/or trim for which the part is compatible. Item compatibility details are returne...",
    "method": "POST",
    "host": "api",
    "path": "/sell/metadata/v1/compatibilities/get_product_compatibilities",
    "tokenKind": "application",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_exclude_shipping_locations",
    "description": "This method retrieves a list of locations that the seller can use as excluded shipping locations within their listings or in their fulfillment business policies for the specified marketplace. These are locations that a seller designates as areas where they will not ship items. Excluded shipping locations and ship-to locations are used in tandem at the listing level and in fulfillment business p...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/shipping/marketplace/{marketplace_id}/get_exclude_shipping_locations",
    "tokenKind": "application",
    "fields": [
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which excluded shipping locations information is retrieved. See MarketplaceIdEnum for supported eBay m..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_handling_times",
    "description": "This method retrieves a list of supported handling times for the specified marketplace. The handling time returned specifies the maximum number of business days the eBay site allows for shipping an item to domestic buyers after receiving a cleared payment. Handling times apply to both domestic and international orders. If the handling time is 1 day, the seller commits to dropping the item off f...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/shipping/marketplace/{marketplace_id}/get_handling_times",
    "tokenKind": "application",
    "fields": [
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which handling times information is retrieved. See MarketplaceIdEnum for supported eBay marketplace ID..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_shipping_carriers",
    "description": "This method retrieves a list of supported shipping carriers for the specified marketplace. It provides essential information for sellers to understand which shipping carriers are available for use when listing items on that eBay marketplace. Knowing the supported carriers can help sellers optimize their shipping options and ensure efficient delivery to buyers. The value returned in the shipping...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/shipping/marketplace/{marketplace_id}/get_shipping_carriers",
    "tokenKind": "application",
    "fields": [
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which shipping carriers information is retrieved. See MarketplaceIdEnum for supported eBay marketplace..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_shipping_locations",
    "description": "This method retrieves a list of supported shipping locations for the specified marketplace. It provides sellers with information on where they can ship their items. Sellers can use this information to configure their shipping settings. Tip: Use the getExcludeShippingLocations method to return locations where the seller does not ship. Manage shipping locations using business policies through the...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/shipping/marketplace/{marketplace_id}/get_shipping_locations",
    "tokenKind": "application",
    "fields": [
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which shipping locations information is retrieved. See MarketplaceIdEnum for supported eBay marketplac..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_shipping_services",
    "description": "This method retrieves a list of shipping services supported for the specified marketplace, including valid shipping services, shipping times, and package constraints such as size and weight. Manage shipping services using business policies through the fulfillment_policy resource of the Account v1 API .",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/shipping/marketplace/{marketplace_id}/get_shipping_services",
    "tokenKind": "application",
    "fields": [
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header is required to retrieve metadata for the French Canada, French Belgium, and Dutch Belgium marketplaces. Follow the instructions below to retrieve..."
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace for which shipping services information is retrieved. See MarketplaceIdEnum for supported eBay marketplace..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_sales_tax_jurisdictions",
    "description": "This method retrieves all sales-tax jurisdictions for the country specified in the countryCode path parameter. Countries with valid sales-tax jurisdictions are Canada and the US. The response from this call tells you the jurisdictions for which a seller can configure tax tables. Although setting up tax tables is optional, you can use the createOrReplaceSalesTax method in the Account API call to...",
    "method": "GET",
    "host": "api",
    "path": "/sell/metadata/v1/country/{countryCode}/sales_tax_jurisdiction",
    "tokenKind": "application",
    "fields": [
      {
        "name": "countryCode",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the two-letter ISO 3166 country code for the country whose jurisdictions you want to retrieve. Note: Sales-tax tables are avail..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_fetch_item_aspects",
    "description": "Get Aspects for All Leaf Categories in a Marketplace",
    "method": "GET",
    "host": "api",
    "path": "/commerce/taxonomy/v1/category_tree/{category_tree_id}/fetch_item_aspects",
    "tokenKind": "user",
    "fields": [
      {
        "name": "category_tree_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the eBay category tree. The category tree ID for an eBay marketplace can be retrieved using the getDefaultCategoryTreeId method."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_default_category_tree_id",
    "description": "Get a Default Category Tree ID",
    "method": "GET",
    "host": "api",
    "path": "/commerce/taxonomy/v1/get_default_category_tree_id",
    "tokenKind": "application",
    "fields": [
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "The unique identifier of the eBay marketplace for which the category tree ID is requested. For a list of supported marketplace IDs, see Marketplaces with Def..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_category_tree",
    "description": "Get a Category Tree",
    "method": "GET",
    "host": "api",
    "path": "/commerce/taxonomy/v1/category_tree/{category_tree_id}",
    "tokenKind": "application",
    "fields": [
      {
        "name": "category_tree_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the eBay category tree. The category tree ID for an eBay marketplace can be retrieved using the getDefaultCategoryTreeId method."
      },
      {
        "name": "Accept-Encoding",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header indicates the compression-encoding algorithms the client accepts for the response. This value should be set to gzip . For more information, refer..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_category_subtree",
    "description": "Get a Category Subtree",
    "method": "GET",
    "host": "api",
    "path": "/commerce/taxonomy/v1/category_tree/{category_tree_id}/get_category_subtree",
    "tokenKind": "application",
    "fields": [
      {
        "name": "category_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "The unique identifier of the category at the top of the subtree being requested. Metadata on this category and all its descendant categories are retrieved. N..."
      },
      {
        "name": "category_tree_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the eBay category tree. The category tree ID for an eBay marketplace can be retrieved using the getDefaultCategoryTreeId method."
      },
      {
        "name": "Accept-Encoding",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header indicates the compression-encoding algorithms the client accepts for the response. This value should be set to gzip . For more information, refer..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_category_suggestions",
    "description": "Get Suggested Categories",
    "method": "GET",
    "host": "api",
    "path": "/commerce/taxonomy/v1/category_tree/{category_tree_id}/get_category_suggestions",
    "tokenKind": "application",
    "fields": [
      {
        "name": "category_tree_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the eBay category tree. The category tree ID for an eBay marketplace can be retrieved using the getDefaultCategoryTreeId method."
      },
      {
        "name": "q",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "A quoted string that describes or characterizes the item being offered for sale. The string format is free form, and can contain any combination of phrases o..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_item_aspects_for_category",
    "description": "This call returns a list of aspects that are appropriate or necessary for accurately describing items in the specified leaf category. Each aspect identifies an item attribute (for example, color,) for which the seller will be required or encouraged to provide a value (or variation values) when offering an item in that category on eBay. For each aspect, getItemAspectsForCategory provides complet...",
    "method": "GET",
    "host": "api",
    "path": "/commerce/taxonomy/v1/category_tree/{category_tree_id}/get_item_aspects_for_category",
    "tokenKind": "user",
    "fields": [
      {
        "name": "category_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "The unique identifier of the leaf category for which aspects are being requested. Note: If the category_id submitted does not identify a leaf node of the tre..."
      },
      {
        "name": "category_tree_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the eBay category tree. The category tree ID for an eBay marketplace can be retrieved using the getDefaultCategoryTreeId method."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_compatibility_properties",
    "description": "Get Compatibility Properties",
    "method": "GET",
    "host": "api",
    "path": "/commerce/taxonomy/v1/category_tree/{category_tree_id}/get_compatibility_properties",
    "tokenKind": "application",
    "fields": [
      {
        "name": "category_tree_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This is the unique identifier of category tree. The following is the list of category_tree_id values and the eBay marketplaces that they represent. One of th..."
      },
      {
        "name": "category_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "The unique identifier of an eBay category. This eBay category must be a valid eBay category on the specified eBay marketplace, and the category must support..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_commerce_taxonomy_get_compatibility_property_values",
    "description": "Get Compatibility Property Values",
    "method": "GET",
    "host": "api",
    "path": "/commerce/taxonomy/v1/category_tree/{category_tree_id}/get_compatibility_property_values",
    "tokenKind": "application",
    "fields": [
      {
        "name": "category_tree_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This is the unique identifier of the category tree. The following is the list of category_tree_id values and the eBay marketplaces that they represent. One o..."
      },
      {
        "name": "compatibility_property",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "One compatible vehicle property applicable to the specified eBay marketplace and eBay category is specified in this required filter. Compatible vehicle prope..."
      },
      {
        "name": "category_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "The unique identifier of an eBay category. This eBay category must be a valid eBay category on the specified eBay marketplace, and the category must support..."
      },
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "One or more compatible vehicle property name/value pairs are passed in through this query parameter. The compatible vehicle property name and corresponding v..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_expired_categories",
    "description": "This method retrieves the mappings of expired leaf categories in the specified category tree to their corresponding active leaf categories. Note that in some cases, several expired categories are mapped to a single active category. Note: This method only returns information about categories that have been mapped (i.e., combined categories and split categories). It does not return information ab...",
    "method": "GET",
    "host": "api",
    "path": "/commerce/taxonomy/v1/category_tree/{category_tree_id}/get_expired_categories",
    "tokenKind": "application",
    "fields": [
      {
        "name": "category_tree_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the eBay category tree. The category tree ID for an eBay marketplace can be retrieved using the getDefaultCategoryTreeId method."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_charity_org",
    "description": "This call is used to retrieve detailed information about supported charitable organizations. It allows users to retrieve the details for a specific charitable organization using its charity organization ID.",
    "method": "GET",
    "host": "api",
    "path": "/commerce/charity/v1/charity_org/{charity_org_id}",
    "tokenKind": "application",
    "fields": [
      {
        "name": "charity_org_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique ID of the charitable organization."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_charity_orgs",
    "description": "This call is used to search for supported charitable organizations. It allows users to search for a specific charitable organization, or for multiple charitable organizations, from a particular charitable domain and/or geographical region, or by using search criteria. The call returns paginated search results containing the charitable organizations that match the specified criteria.",
    "method": "GET",
    "host": "api",
    "path": "/commerce/charity/v1/charity_org",
    "tokenKind": "application",
    "fields": [
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of items, from the result set, returned in a single page. Valid Values: 1-100 Default: 20"
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of items that will be skipped in the result set. This is used with the limit field to control the pagination of the output. For example, if the of..."
      },
      {
        "name": "q",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A query string that matches the keywords in name, mission statement, or description."
      },
      {
        "name": "registration_ids",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A comma-separated list of charitable organization registration IDs. Note: Do not specify this parameter for query-based searches. Specify either the q or reg..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_custom_policies",
    "description": "This method retrieves the list of custom policies defined for a seller's account. To limit the returned custom policies, specify the policy_types query parameter.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/custom_policy/",
    "tokenKind": "user",
    "fields": [
      {
        "name": "policy_types",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the type of custom policies to be returned. Multiple policy types may be requested in a single call by providing a comma-delim..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_custom_policy",
    "description": "This method creates a new custom policy that specifies the seller's terms for complying with local governmental regulations. Each Custom Policy targets a policyType . Multiple policies may be created as using the following custom policy types: PRODUCT_COMPLIANCE: Product Compliance policies disclose product information as required for regulatory compliance. Note: A maximum of 60 Product Complia...",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v1/custom_policy/",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_custom_policy",
    "description": "This method retrieves the custom policy specified by the custom_policy_id path parameter.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/custom_policy/{custom_policy_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "custom_policy_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the custom policy to retrieve. This ID can be retrieved for a custom policy by using the getCustomPolicies me..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_custom_policy",
    "description": "This method updates an existing custom policy specified by the custom_policy_id path parameter. Since this method overwrites the policy's name , label , and description fields, always include the complete and current text of all three policy fields in the request payload, even if they are not being updated. For example, the value for the label field is to be updated, but the name and descriptio...",
    "method": "PUT",
    "host": "api",
    "path": "/sell/account/v1/custom_policy/{custom_policy_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "custom_policy_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier of the custom policy to update. Note: A list of custom policies defined for a seller's account that includes thi..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_create_fulfillment_policy",
    "description": "This method creates a new fulfillment policy for an eBay marketplace where the policy encapsulates seller's terms for fulfilling item purchases. Fulfillment policies include the shipment options that the seller offers to buyers. A successful request returns the getFulfillmentPolicy URI to the new policy in the Location response header and the ID for the new policy is returned in the response pa...",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v1/fulfillment_policy/",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_fulfillment_policy",
    "description": "This method retrieves the complete details of a fulfillment policy. Supply the ID of the policy you want to retrieve using the fulfillmentPolicyId path parameter.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/fulfillment_policy/{fulfillmentPolicyId}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "fulfillmentPolicyId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the ID of the fulfillment policy you want to retrieve. This ID can be retrieved for a fulfillment policy by using the getFulfil..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_fulfillment_policy",
    "description": "This method updates an existing fulfillment policy. Specify the policy you want to update using the fulfillment_policy_id path parameter. Supply a complete policy payload with the updates you want to make; this call overwrites the existing policy with the new details specified in the payload.",
    "method": "PUT",
    "host": "api",
    "path": "/sell/account/v1/fulfillment_policy/{fulfillmentPolicyId}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "fulfillmentPolicyId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the ID of the fulfillment policy you want to update. This ID can be retrieved for a specific fulfillment policy by using the ge..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_fulfillment_policy",
    "description": "This method deletes a fulfillment policy. Supply the ID of the policy you want to delete in the fulfillmentPolicyId path parameter.",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/account/v1/fulfillment_policy/{fulfillmentPolicyId}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "fulfillmentPolicyId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the ID of the fulfillment policy to delete. This ID can be retrieved for a fulfillment policy by using the getFulfillmentPolici..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_fulfillment_policies",
    "description": "This method retrieves all the fulfillment policies configured for the marketplace you specify using the marketplace_id query parameter.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/fulfillment_policy",
    "tokenKind": "user",
    "fields": [
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies the eBay marketplace of the policies you want to retrieve. For implementation help, refer to eBay API documentation at https:/..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_fulfillment_policy_by_name",
    "description": "This method retrieves the details for a specific fulfillment policy. In the request, supply both the policy name and its associated marketplace_id as query parameters.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/fulfillment_policy/get_by_policy_name",
    "tokenKind": "user",
    "fields": [
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies the eBay marketplace of the policy you want to retrieve. For implementation help, refer to eBay API documentation at https://d..."
      },
      {
        "name": "name",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies the seller-defined name of the fulfillment policy you want to retrieve. This value can be retrieved for a fulfillment policy b..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_payment_policies",
    "description": "This method retrieves all the payment business policies configured for the marketplace you specify using the marketplace_id query parameter.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/payment_policy",
    "tokenKind": "user",
    "fields": [
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies the eBay marketplace of the policies you want to retrieve. For implementation help, refer to eBay API documentation at https:/..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_payment_policy",
    "description": "This method creates a new payment policy where the policy encapsulates seller's terms for order payments. A successful request returns the getPaymentPolicy URI to the new policy in the Location response header and the ID for the new policy is returned in the response payload. Tip: For details on creating and using the business policies supported by the Account API, see eBay business policies .",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v1/payment_policy",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_payment_policy",
    "description": "This method retrieves the complete details of a payment policy. Supply the ID of the policy you want to retrieve using the paymentPolicyId path parameter.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/payment_policy/{payment_policy_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "payment_policy_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the ID of the payment policy you want to retrieve. This ID can be retrieved for a payment policy by using the getPaymentPolices..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_payment_policy",
    "description": "This method updates an existing payment policy. Specify the policy you want to update using the payment_policy_id path parameter. Supply a complete policy payload with the updates you want to make; this call overwrites the existing policy with the new details specified in the payload.",
    "method": "PUT",
    "host": "api",
    "path": "/sell/account/v1/payment_policy/{payment_policy_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "payment_policy_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the ID of the payment policy you want to update. This ID can be retrieved for a payment policy by using the getPaymentPolices m..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_payment_policy",
    "description": "This method deletes a payment policy. Supply the ID of the policy you want to delete in the paymentPolicyId path parameter.",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/account/v1/payment_policy/{payment_policy_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "payment_policy_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the payment policy you want to delete. This ID can be retrieved for a payment policy by using the getP..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_payment_policy_by_name",
    "description": "This method retrieves the details of a specific payment policy. Supply both the policy name and its associated marketplace_id in the request query parameters.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/payment_policy/get_by_policy_name",
    "tokenKind": "user",
    "fields": [
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies the eBay marketplace of the policy you want to retrieve. For implementation help, refer to eBay API documentation at https://d..."
      },
      {
        "name": "name",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies the seller-defined name of the payment policy you want to retrieve. This value can be retrieved for a payment policy by using..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_payments_program",
    "description": "Note: This method is no longer applicable, as all seller accounts globally have been enabled for the new eBay payment and checkout flow. This method returns whether or not the user is opted-in to the specified payments program. Sellers opt-in to payments programs by marketplace and you use the marketplace_id path parameter to specify the marketplace of the status flag you want returned.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/payments_program/{marketplace_id}/{payments_program_type}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay marketplace of the payments program for which you want to retrieve the seller's status."
      },
      {
        "name": "payments_program_type",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the payments program whose status is returned by the call."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_payments_program_onboarding",
    "description": "Note: This method is no longer applicable, as all seller accounts globally have been enabled for the new eBay payment and checkout flow. This method retrieves a seller's onboarding status for a payments program for a specified marketplace. The overall onboarding status of the seller and the status of each onboarding step is returned.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/payments_program/{marketplace_id}/{payments_program_type}/onboarding",
    "tokenKind": "user",
    "fields": [
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The eBay marketplace ID associated with the onboarding status to retrieve."
      },
      {
        "name": "payments_program_type",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The type of payments program whose status is returned by the method."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_privileges",
    "description": "This method retrieves the seller's current set of privileges, including whether or not the seller's eBay registration has been completed, as well as the details of their site-wide sellingLimit (the amount and quantity they can sell on a given day).",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/privilege",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_opted_in_programs",
    "description": "This method gets a list of the seller programs that the seller has opted-in to.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/program/get_opted_in_programs",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_opt_in_to_program",
    "description": "This method opts the seller in to an eBay seller program. Refer to the Account API overview for information about available eBay seller programs. Note: It can take up to 24-hours for eBay to process your request to opt-in to a Seller Program. Use the getOptedInPrograms call to check the status of your request after the processing period has passed.",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v1/program/opt_in",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_opt_out_of_program",
    "description": "This method opts the seller out of a seller program in which they are currently opted in to. A seller can retrieve a list of the seller programs they are opted-in to using the getOptedInPrograms method.",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v1/program/opt_out",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_rate_tables",
    "description": "This method retrieves a seller's shipping rate tables for the country specified in the country_code query parameter. If you call this method without specifying a country code, the call returns all of the seller's shipping rate tables. The method's response includes a rateTableId for each table defined by the seller. This rateTableId value is used in add/revise item call or in create/update fulf...",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/rate_table",
    "tokenKind": "user",
    "fields": [
      {
        "name": "country_code",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the two-letter ISO 3166 code of country for which you want shipping rate table information. If you do not specify a country co..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_sell_account_get_return_policies",
    "description": "This method retrieves all the return policies configured for the marketplace you specify using the marketplace_id query parameter.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/return_policy",
    "tokenKind": "user",
    "fields": [
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies the ID of the eBay marketplace of the policies you want to retrieve. For implementation help, refer to eBay API documentation..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_return_policy",
    "description": "This method creates a new return policy where the policy encapsulates seller's terms for returning items. Each policy targets a specific marketplace, and you can create multiple policies for each marketplace. Return policies are not applicable to motor-vehicle listings. A successful request returns the getReturnPolicy URI to the new policy in the Location response header and the ID for the new...",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v1/return_policy",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_return_policy",
    "description": "This method retrieves the complete details of the return policy specified by the returnPolicyId path parameter.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/return_policy/{return_policy_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "return_policy_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the return policy you want to retrieve. This ID can be retrieved for a return policy by using the getR..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_return_policy",
    "description": "This method updates an existing return policy. Specify the policy you want to update using the return_policy_id path parameter. Supply a complete policy payload with the updates you want to make; this call overwrites the existing policy with the new details specified in the payload.",
    "method": "PUT",
    "host": "api",
    "path": "/sell/account/v1/return_policy/{return_policy_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "return_policy_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the ID of the return policy you want to update. This ID can be retrieved for a return policy by using the getReturnPolicies met..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_return_policy",
    "description": "This method deletes a return policy. Supply the ID of the policy you want to delete in the returnPolicyId path parameter.",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/account/v1/return_policy/{return_policy_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "return_policy_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the return policy you want to delete. This ID can be retrieved for a return policy by using the getRet..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_return_policy_by_name",
    "description": "This method retrieves the details of a specific return policy. Supply both the policy name and its associated marketplace_id in the request query parameters.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/return_policy/get_by_policy_name",
    "tokenKind": "user",
    "fields": [
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies the ID of the eBay marketplace of the policy you want to retrieve. For implementation help, refer to eBay API documentation at..."
      },
      {
        "name": "name",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies the seller-defined name of the return policy you want to retrieve. This value can be retrieved for a return policy by using th..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_bulk_create_or_replace_sales_tax",
    "description": "This method creates or updates multiple sales-tax table entries. Sales-tax tables can be set up for countries that support different tax jurisdictions . Note: Sales-tax tables are only available for the US (EBAY_US) and Canada (EBAY_CA) marketplaces. Each sales-tax table entry comprises the following parameters: countryCode jurisdictionId salesTaxPercentage shippingAndHandlingTaxed Valid jurisd...",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v1/bulk_create_or_replace_sales_tax",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_sales_tax",
    "description": "This call retrieves the current sales-tax table entry for a specific tax jurisdiction. Specify the jurisdiction to retrieve using the countryCode and jurisdictionId path parameters. All four response fields will be returned if a sales-tax entry exists for the tax jurisdiction. Otherwise, the response will be returned as empty. Note: Sales-tax tables are only available for the US (EBAY_US) and C...",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/sales_tax/{countryCode}/{jurisdictionId}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "countryCode",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the two-letter ISO 3166 code for the country whose sales tax table you want to retrieve. Note: Sales-tax tables are available o..."
      },
      {
        "name": "jurisdictionId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the ID of the sales tax jurisdiction for the tax table entry to be retrieved. Valid jurisdiction IDs can be retrieved using the..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_or_replace_sales_tax",
    "description": "This method creates or updates a sales-tax table entry for a jurisdiction. Specify the tax table entry you want to configure using the two path parameters: countryCode and jurisdictionId . A tax table entry for a jurisdiction is comprised of two fields: one for the jurisdiction's sales-tax rate and another that's a boolean value indicating whether or not shipping and handling are taxed in the j...",
    "method": "PUT",
    "host": "api",
    "path": "/sell/account/v1/sales_tax/{countryCode}/{jurisdictionId}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "countryCode",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the two-letter ISO 3166 code for the country for which you want to create a sales tax table entry. Note: Sales-tax tables are a..."
      },
      {
        "name": "jurisdictionId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the ID of the tax jurisdiction for the table entry to be created. Valid jurisdiction IDs can be retrieved using the getSalesTax..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_sales_tax",
    "description": "This call deletes a sales-tax table entry for a jurisdiction. Specify the jurisdiction to delete using the countryCode and jurisdictionId path parameters. Note: Sales-tax tables are only available for the US (EBAY_US) and Canada (EBAY_CA) marketplaces.",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/account/v1/sales_tax/{countryCode}/{jurisdictionId}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "countryCode",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the two-letter ISO 3166 code for the country whose sales tax table entry you want to delete. Note: Sales-tax tables are availab..."
      },
      {
        "name": "jurisdictionId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the ID of the sales tax jurisdiction whose table entry you want to delete. Valid jurisdiction IDs can be retrieved using the ge..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_sales_taxes",
    "description": "Use this call to retrieve all sales tax table entries that the seller has defined for a specific country. All four response fields will be returned for each tax jurisdiction that matches the search criteria. If no sales tax rates are defined for the specified, a 204 No Content status code is returned with no response payload. Note: Sales-tax tables are only available for the US (EBAY_US) and Ca...",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/sales_tax",
    "tokenKind": "user",
    "fields": [
      {
        "name": "country_code",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This path parameter specifies the two-letter ISO 3166 code for the country whose tax table you want to retrieve. Note: Sales-tax tables are available only fo..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_sell_account_get_subscription",
    "description": "This method retrieves a list of subscriptions associated with the seller account.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/subscription",
    "tokenKind": "user",
    "fields": [
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This field is for future use."
      },
      {
        "name": "continuation_token",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This field is for future use."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_kyc",
    "description": "Note: This method was originally created to see which onboarding requirements were still pending for sellers being onboarded for eBay managed payments, but now that all seller accounts are onboarded globally, this method should now just return an empty payload with a 204 No Content HTTP status code.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/kyc",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_advertising_eligibility",
    "description": "This method allows developers to check the seller eligibility status for eBay advertising programs.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v1/advertising_eligibility",
    "tokenKind": "user",
    "fields": [
      {
        "name": "program_types",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A comma-separated list of eBay advertising programs for which eligibility status will be returned. See the AdvertisingProgramEnum type for a list of supporte..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_rate_table",
    "description": "Retrieves details of a specific shipping rate table.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v2/rate_table/{rate_table_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "rate_table_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier for the shipping rate table to retrieve. Use the getRateTables method of the Account API v1 to retrieve rate tab..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_shipping_cost",
    "description": "Updates one or more shipping rates for a specific shipping rate table.",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v2/rate_table/{rate_table_id}/update_shipping_cost",
    "tokenKind": "user",
    "fields": [
      {
        "name": "rate_table_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is the unique identifier for the shipping rate table for which shipping costs will be updated. Use the getRateTables method of the Accoun..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_payout_settings",
    "description": "Retrieves payout percentages and unique IDs for accounts configured to receive seller payouts.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v2/payout_settings",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_payout_percentage",
    "description": "Updates the split-payout percentage for two payout instruments for sellers in mainland China.",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v2/payout_settings/update_percentage",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_create_calculated_shipping_rules",
    "description": "Creates calculated shipping rules that determine combined shipping costs based on item attributes, such as weight and dimensions, for the seller's account.",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v2/combined_shipping_rules/create_calculated_shipping_rules",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_create_flat_shipping_rules",
    "description": "Creates flat-rate rules that apply standard combined shipping costs for a seller's listings.",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v2/combined_shipping_rules/create_flat_shipping_rules",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_create_promotional_shipping_rule",
    "description": "Creates promotional shipping rules, such as discounts or free-shipping thresholds.",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v2/combined_shipping_rules/create_promotional_shipping_rule",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_combined_shipping_rules",
    "description": "Retrieves all combined shipping rule configurations defined for the seller.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v2/combined_shipping_rules",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_calculated_shipping_rules",
    "description": "Updates previously defined calculated shipping rules.",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v2/combined_shipping_rules/update_calculated_shipping_rules",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_update_combined_payments",
    "description": "Updates combined payment settings that determine how unpaid orders can be merged.",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v2/combined_shipping_rules/update_combined_payments",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_update_flat_shipping_rules",
    "description": "Updates existing flat-rate shipping rules.",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v2/combined_shipping_rules/update_flat_shipping_rules",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_update_promotional_shipping_rule",
    "description": "Updates a promotional shipping rule to adjust discount thresholds, eligibility criteria, or duration for the seller.",
    "method": "POST",
    "host": "api",
    "path": "/sell/account/v2/combined_shipping_rules/update_promotional_shipping_rule",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_user_preferences",
    "description": "Retrieves the seller's preferences for a specific eBay marketplace.",
    "method": "GET",
    "host": "api",
    "path": "/sell/account/v2/user_preferences",
    "tokenKind": "user",
    "fields": [
      {
        "name": "fieldgroups",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The fieldgroups query parameter specifies the type of seller preferences to retrieve. If fieldgroups = ALL or is omitted, all the supported seller preference..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_set_user_preferences",
    "description": "Modifies one or more preferences for a seller on a specific marketplace.",
    "method": "PATCH",
    "host": "api",
    "path": "/sell/account/v2/user_preferences",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_order_earnings",
    "description": "This method returns detailed order-level financial data for each order associated with a seller account. The returned order-level financial data includes order earnings, gross amount, expenses, and refunds. Order earnings includes earnings after deducting expenses and refunds from the gross amount. Note: Expenses include fees, shipping labels, and donations. Refunds include gross refunds, gross...",
    "method": "GET",
    "host": "apiz",
    "path": "/sell/finances/v1/order_earnings",
    "tokenKind": "user",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This parameter can be used to filter orders created within a specified date range. The filter uses the orderCreationDate field, which works similarly to the..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This parameter configures the number of orders to return per page of the result set. Use this parameter in conjunction with the offset parameter to control t..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This parameter can be used to specify the number of records to skip before returning results. This parameter is commonly used with the limit parameter to ret..."
      },
      {
        "name": "sort",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This parameter can be used to specify the sort order of the results. Currently, sorting is supported by order creation date. Default: Results returned in asc..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_order_earnings_by_id",
    "description": "This method returns detailed order-level financial data including order earnings, gross amount, expenses, and refunds. Order earnings includes earnings after deducting expenses and refunds from the gross amount. Note: Expenses include fees, shipping labels, and donations. Refunds include gross refunds, gross claims, and gross payment disputes. Note: Only charges and credits tied to the order ar...",
    "method": "GET",
    "host": "apiz",
    "path": "/sell/finances/v1/order_earnings/{order_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "order_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter identifies the specific order for which earnings information is requested."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_order_earnings_summary",
    "description": "This method returns a summarized view of order earnings information for one or more orders associated with a seller account. The method retrieves aggregated data for order earnings after deducting expenses and refunds from the gross amount. You can use this method for high-level financial reporting workflows. Note: Expenses include fees, shipping labels, and donations. Refunds include gross ref...",
    "method": "GET",
    "host": "apiz",
    "path": "/sell/finances/v1/order_earnings_summary",
    "tokenKind": "user",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This parameter can be used to filter orders created within a specified date range. The filter uses the orderCreationDate field, which works similarly to the..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_payout",
    "description": "Important! Due to EU & UK Payments regulatory requirements, an additional security verification via Digital Signatures is required for certain API calls that are made on behalf of EU/UK sellers, including all Finances API methods. Please refer to Digital Signatures for APIs to learn more on the impacted APIs and the process to create signatures to be included in the HTTP payload. Note: The Fina...",
    "method": "GET",
    "host": "apiz",
    "path": "/sell/finances/v1/payout/{payout_Id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "payout_Id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is used to specify the unique identifier of the payout being retrieved. Use the getPayouts method to retrieve payout IDs, or check Seller..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_payouts",
    "description": "Important! Due to EU & UK Payments regulatory requirements, an additional security verification via Digital Signatures is required for certain API calls that are made on behalf of EU/UK sellers, including all Finances API methods. Please refer to Digital Signatures for APIs to learn more on the impacted APIs and the process to create signatures to be included in the HTTP payload. Note: The Fina...",
    "method": "GET",
    "host": "apiz",
    "path": "/sell/finances/v1/payout",
    "tokenKind": "user",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The filter types that can be used here are discussed below. If none of these filters are used, all payouts in all states from within the last five years are..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of payouts to return per page of the result set. Use this parameter in conjunction with the offset parameter to control the pagination of the outp..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This integer value indicates the actual position that the first payout returned on the current page has in the results set. So, if you wanted to view the 11t..."
      },
      {
        "name": "sort",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "By default, payouts or failed payouts that match the input criteria are sorted in descending order according to the payout date/last attempted payout date (i..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_payout_summary",
    "description": "Important! Due to EU & UK Payments regulatory requirements, an additional security verification via Digital Signatures is required for certain API calls that are made on behalf of EU/UK sellers, including all Finances API methods. Please refer to Digital Signatures for APIs to learn more on the impacted APIs and the process to create signatures to be included in the HTTP payload. Note: The Fina...",
    "method": "GET",
    "host": "apiz",
    "path": "/sell/finances/v1/payout_summary",
    "tokenKind": "user",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The two filter types that can be used here are discussed below. One or both of these filter types can be used. If none of these filters are used, the data re..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_seller_funds_summary",
    "description": "Important! Due to EU & UK Payments regulatory requirements, an additional security verification via Digital Signatures is required for certain API calls that are made on behalf of EU/UK sellers, including all Finances API methods. Please refer to Digital Signatures for APIs to learn more on the impacted APIs and the process to create signatures to be included in the HTTP payload. Note: The Fina...",
    "method": "GET",
    "host": "apiz",
    "path": "/sell/finances/v1/seller_funds_summary",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_transactions",
    "description": "Important! Due to EU & UK Payments regulatory requirements, an additional security verification via Digital Signatures is required for certain API calls that are made on behalf of EU/UK sellers, including all Finances API methods. Please refer to Digital Signatures for APIs to learn more on the impacted APIs and the process to create signatures to be included in the HTTP payload. Note: The Fina...",
    "method": "GET",
    "host": "apiz",
    "path": "/sell/finances/v1/transaction",
    "tokenKind": "user",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Numerous filters are available for the getTransactions method, and these filters are discussed below. One or more of these filter types can be used. If none..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of monetary transactions to return per page of the result set. Use this parameter in conjunction with the offset parameter to control the paginati..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This integer value indicates the actual position that the first monetary transaction returned on the current page has in the results set. So, if you wanted t..."
      },
      {
        "name": "sort",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "By default, monetary transactions that match the input criteria are sorted in descending order according to the transaction date (i.e, most recent transactio..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_transaction_summary",
    "description": "Important! Due to EU & UK Payments regulatory requirements, an additional security verification via Digital Signatures is required for certain API calls that are made on behalf of EU/UK sellers, including all Finances API methods. Please refer to Digital Signatures for APIs to learn more on the impacted APIs and the process to create signatures to be included in the HTTP payload. Note: The Fina...",
    "method": "GET",
    "host": "apiz",
    "path": "/sell/finances/v1/transaction_summary",
    "tokenKind": "user",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Numerous filters are available for the getTransactionSummary method, and these filters are discussed below. One or more of these filter types can be used. Th..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_transfer",
    "description": "Important! Due to EU & UK Payments regulatory requirements, an additional security verification via Digital Signatures is required for certain API calls that are made on behalf of EU/UK sellers, including all Finances API methods. Please refer to Digital Signatures for APIs to learn more on the impacted APIs and the process to create signatures to be included in the HTTP payload. Note: The Fina...",
    "method": "GET",
    "host": "apiz",
    "path": "/sell/finances/v1/transfer/{transfer_Id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "transfer_Id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is used to specify the unique identifier of the TRANSFER transaction type you wish to retrieve. Use the getTransactions method to retriev..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_billing_activities",
    "description": "Important! Due to EU & UK Payments regulatory requirements, an additional security verification via Digital Signatures is required for certain API calls that are made on behalf of EU/UK sellers, including all Finances API methods. Please refer to Digital Signatures for APIs to learn more on the impacted APIs and the process to create signatures to be included in the HTTP payload. Note: The Fina...",
    "method": "GET",
    "host": "apiz",
    "path": "/sell/finances/v1/billing_activity",
    "tokenKind": "user",
    "fields": [
      {
        "name": "Accept-Language",
        "kind": "string",
        "place": "header",
        "required": false,
        "description": "This header indicates the natural language and locale preferred by the user for the response. For more information, see the Accept-Language header in HTTP re..."
      },
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This required field specifies which results to return in the response. Only one of the following four filter values must be used. A user can either retrieve..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Sets the maximum number of records to return per page of data. Use this parameter in conjunction with the offset parameter to control the pagination of the o..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the number of records to skip in the result set. This is used with the limit field to control the pagination of the output. For example: If offset..."
      },
      {
        "name": "sort",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "By default, transactions that match the input criteria are sorted in descending order according to the transaction date (most recent transactions returned fi..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_bulk_update_conversation",
    "description": "This method can be used to update the conversationStatus of up to 10 conversations. The conversationId , existing conversationType , and updated conversationStatus for each conversation to modify are required in the conversations array. Important! Though it cannot be updated, the conversationType field is required for each conversation being updated. If the updates were successful, the conversa...",
    "method": "POST",
    "host": "api",
    "path": "/commerce/message/v1/bulk_update_conversation",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_conversation",
    "description": "This method can be used to retrieve messages within a specific conversation. The conversation_id of the conversation for which to retrieve messages is required as path parameters, and the and conversation_type of the conversation is required as a query parameter.",
    "method": "GET",
    "host": "api",
    "path": "/commerce/message/v1/conversation/{conversation_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "conversation_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameters specifies the unique identifier of the conversation that is to be retrieved. Use the getConversations method to retrieve conversation ID..."
      },
      {
        "name": "conversation_type",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies the type of the conversation being retrieved. This parameter is always required when using the this method. Valid values: FROM..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The maximum number of entries that can be returned on each page of the paginated response. Use this parameter in conjunction with the offset parameter to con..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of reports to skip in the result set before returning the first entry in the paginated response. Use this parameter in conjunction with the limit..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_conversations",
    "description": "This method can be used to retrieve one or more conversations associated with a user. The conversation_type query parameter is required when using this method to specify if the retrieved conversations are from eBay or from members. The result set can also optionally be filtered by conversation status, reference, username, and/or time range. The limit and offset path parameters can be used to pa...",
    "method": "GET",
    "host": "api",
    "path": "/commerce/message/v1/conversation",
    "tokenKind": "user",
    "fields": [
      {
        "name": "conversation_status",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the status of the conversations being retrieved. Only conversations in the specified status will be returned. Valid values: AC..."
      },
      {
        "name": "conversation_type",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies the type of the conversations being retrieved. Only conversations of the specified type will be returned. This parameter is al..."
      },
      {
        "name": "end_time",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the end time (in ISO 8601 format) for which to stop retrieving conversations. For example, if set to 2024-11-06T10:00:00.000Z..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The maximum number of entries that can be returned on each page of the paginated response. Use this parameter in conjunction with the offset parameter to con..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of reports to skip in the result set before returning the first entry in the paginated response. Use this parameter in conjunction with the limit..."
      },
      {
        "name": "other_party_username",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the user name (login name) of an eBay user for which to retrieve conversations. If this filter is used, only conversation(s) f..."
      },
      {
        "name": "reference_id",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the unique identifier of the reference (specified by the corresponding reference_type value) associated with the conversation...."
      },
      {
        "name": "reference_type",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the type of reference associated with a conversation. The reference type is used to specify what the conversation is in refere..."
      },
      {
        "name": "start_time",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the start time (in ISO 8601 format) for which to start retrieving conversations. For example, if set to 2024-11-06T10:00:00.00..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_send_message",
    "description": "This method can be used to start a conversation with another user or send a message in an existing conversation with another user based on the information provided in the request. To send a message, one of the conversationId or otherPartyUsername request fields are required. The conversationId must be used when sending a message in an existing conversation and specifies the conversation for whi...",
    "method": "POST",
    "host": "api",
    "path": "/commerce/message/v1/send_message",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_update_conversation",
    "description": "This method can be used to update the conversationStatus or the read status of a specified conversation. Note: Only one of these statuses can be updated at a time using this method. If both fields are included, only the read status of the specified conversation will be updated and the conversationStatus field will be ignored. The conversationId of the conversation to modify, as well as the exis...",
    "method": "POST",
    "host": "api",
    "path": "/commerce/message/v1/update_conversation",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_config",
    "description": "This method allows applications to retrieve a previously created configuration.",
    "method": "GET",
    "host": "api",
    "path": "/commerce/notification/v1/config",
    "tokenKind": "application",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_config",
    "description": "This method allows applications to create a new configuration or update an existing configuration. This app-level configuration allows developers to set up alerts.",
    "method": "PUT",
    "host": "api",
    "path": "/commerce/notification/v1/config",
    "tokenKind": "application",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_destinations",
    "description": "This method allows applications to retrieve a paginated collection of destination resources and related details. The details include the destination names, statuses, and configurations, including the endpoints and verification tokens.",
    "method": "GET",
    "host": "api",
    "path": "/commerce/notification/v1/destination",
    "tokenKind": "application",
    "fields": [
      {
        "name": "continuation_token",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This string value can be used to return the next page in the result set. The string to use here is returned in the next field of the current page of results."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The maximum number of destinations to return per page from the result set. Min: 10 Max: 100 Default: 20"
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_destination",
    "description": "This method allows applications to create a destination. A destination is an endpoint that receives HTTP push notifications. A single destination for all topics is valid, as is individual destinations for each topic. To update a destination, use the updateDestination call. The destination created will need to be referenced while creating or updating a subscription to a topic. Note: The destinat...",
    "method": "POST",
    "host": "api",
    "path": "/commerce/notification/v1/destination",
    "tokenKind": "application",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_destination",
    "description": "This method allows applications to fetch the details for a destination. The details include the destination name, status, and configuration, including the endpoint and verification token.",
    "method": "GET",
    "host": "api",
    "path": "/commerce/notification/v1/destination/{destination_id}",
    "tokenKind": "application",
    "fields": [
      {
        "name": "destination_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the destination to retrieve. Use getDestinations to retrieve destination IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_destination",
    "description": "This method allows applications to update a destination. Note: The destination should be created and ready to respond with the expected challengeResponse for the endpoint to be registered successfully. Refer to the Notification API overview for more information.",
    "method": "PUT",
    "host": "api",
    "path": "/commerce/notification/v1/destination/{destination_id}",
    "tokenKind": "application",
    "fields": [
      {
        "name": "destination_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier for the destination."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_destination",
    "description": "This method provides applications a way to delete a destination. The same destination ID can be used by many destinations. Trying to delete an active destination results in an error. You can disable a subscription, and when the destination is no longer in use, you can delete it.",
    "method": "DELETE",
    "host": "api",
    "path": "/commerce/notification/v1/destination/{destination_id}",
    "tokenKind": "application",
    "fields": [
      {
        "name": "destination_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the destination to delete. Only disabled or marked down destinations can be deleted, and enabled destinations cannot be deleted. Use..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_public_key",
    "description": "This method allows users to retrieve a public key using a specified key ID. The public key that is returned in the response payload is used to process and validate eBay notifications. The public key ID, which is a required request parameter for this method, is retrieved from the Base64-encoded X-EBAY-SIGNATURE header that is included in the eBay notification. Important! The retrieved public key...",
    "method": "GET",
    "host": "api",
    "path": "/commerce/notification/v1/public_key/{public_key_id}",
    "tokenKind": "application",
    "fields": [
      {
        "name": "public_key_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique key ID that is used to retrieve the public key. Note: This is retrieved from the X-EBAY-SIGNATURE header that is included with the push notification."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_subscriptions",
    "description": "This method allows applications to retrieve a list of all subscriptions. The list returned is a paginated collection of subscription resources. Subscriptions allow applications to express interest in notifications and keep receiving the information relevant to their business.",
    "method": "GET",
    "host": "api",
    "path": "/commerce/notification/v1/subscription",
    "tokenKind": "user",
    "fields": [
      {
        "name": "continuation_token",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This string value can be used to return the next page in the result set. The string to use here is returned in the next field of the current page of results."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The maximum number of subscriptions to return per page from the result set. Min: 10 Max: 100 Default: 20"
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_subscription",
    "description": "This method allows applications to create a subscription for a topic and supported schema version. Subscriptions allow applications to express interest in notifications and keep receiving the information relevant to their business. Each application and topic-schema pairing to a subscription should have a 1:1 cardinality. You can create the subscription in disabled mode, test it (see the test me...",
    "method": "POST",
    "host": "api",
    "path": "/commerce/notification/v1/subscription",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_create_subscription_filter",
    "description": "This method allows applications to create a filter for a subscription. Filters allow applications to only be sent notifications that match a provided criteria. Notifications that do not match this criteria will not be sent to the destination. The filterSchema value must be a valid JSON Schema Core document (version 2020-12 or later). The filterSchema provided must describe the subscription's no...",
    "method": "POST",
    "host": "api",
    "path": "/commerce/notification/v1/subscription/{subscription_id}/filter",
    "tokenKind": "user",
    "fields": [
      {
        "name": "subscription_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the subscription for which a filter will be created."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_commerce_notification_get_subscription",
    "description": "This method allows applications to retrieve subscription details for the specified subscription. Specify the subscription to retrieve using the subscription_id . Use the getSubscriptions method to browse all subscriptions if you do not know the subscription_id . Subscriptions allow applications to express interest in notifications and keep receiving the information relevant to their business.",
    "method": "GET",
    "host": "api",
    "path": "/commerce/notification/v1/subscription/{subscription_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "subscription_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the subscription to retrieve. Use getSubscriptions to retrieve subscription IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_subscription",
    "description": "This method allows applications to update a subscription. Subscriptions allow applications to express interest in notifications and keep receiving the information relevant to their business. Note: This call returns an error if an application is not authorized to subscribe to a topic. You can pause and restart a subscription. See the disableSubscription and enableSubscription methods.",
    "method": "PUT",
    "host": "api",
    "path": "/commerce/notification/v1/subscription/{subscription_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "subscription_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier for the subscription to update. Use getSubscriptions to retrieve subscription IDs."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_subscription",
    "description": "This method allows applications to delete a subscription. Subscriptions can be deleted regardless of status.",
    "method": "DELETE",
    "host": "api",
    "path": "/commerce/notification/v1/subscription/{subscription_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "subscription_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the subscription to delete. Use getSubscriptions to retrieve subscription IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_subscription_filter",
    "description": "This method allows applications to retrieve the filter details for the specified subscription filter. Specify the subscription filter to retrieve by using the subscription_id and the filter_id associated with the subscription filter. The filter_id can be found in the response body for the getSubscription method, if there is a filter applied on the subscription. Filters allow applications to onl...",
    "method": "GET",
    "host": "api",
    "path": "/commerce/notification/v1/subscription/{subscription_id}/filter/{filter_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "filter_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the subscription filter. Filter ID values, if configured for a subscription, will be shown in the subscriptions.filterId field in ge..."
      },
      {
        "name": "subscription_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the subscription associated with the filter. Use getSubscriptions to retrieve subscription IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_delete_subscription_filter",
    "description": "This method allows applications to disable the active filter on a subscription, so that a new subscription filter may be added. Note: Subscription filters in PENDING status can not be disabled. However, a new filter can be created instead with the createSubscriptionFilter method and this new filter will override the PENDING filter.",
    "method": "DELETE",
    "host": "api",
    "path": "/commerce/notification/v1/subscription/{subscription_id}/filter/{filter_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "filter_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the subscription filter to delete. Filter ID values, if configured for a subscription, will be shown in the subscriptions.filterId f..."
      },
      {
        "name": "subscription_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the subscription associated with the filter to delete. Use getSubscriptions to retrieve subscription IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_disable_subscription",
    "description": "This method disables a subscription, which prevents the subscription from providing notifications. To restart a subscription, call enableSubscription .",
    "method": "POST",
    "host": "api",
    "path": "/commerce/notification/v1/subscription/{subscription_id}/disable",
    "tokenKind": "user",
    "fields": [
      {
        "name": "subscription_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of an enabled subscription that will be disabled. Use getSubscriptions to retrieve subscription IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_enable_subscription",
    "description": "This method allows applications to enable a disabled subscription. To pause (or disable) an enabled subscription, call disableSubscription .",
    "method": "POST",
    "host": "api",
    "path": "/commerce/notification/v1/subscription/{subscription_id}/enable",
    "tokenKind": "user",
    "fields": [
      {
        "name": "subscription_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of a disabled subscription that will be enabled. Use getSubscriptions to retrieve subscription IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_test_subscription",
    "description": "This method triggers a mocked test payload that includes a notification ID, publish date, and so on. Use this method to test your subscription end-to-end. You can create the subscription in disabled mode, test it using this method, and when everything is ready, you can enable the subscription (see the enableSubscription method). Note: Use the notificationId to tell the difference between a test...",
    "method": "POST",
    "host": "api",
    "path": "/commerce/notification/v1/subscription/{subscription_id}/test",
    "tokenKind": "user",
    "fields": [
      {
        "name": "subscription_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the subscription to test. Use getSubscriptions to retrieve subscription IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_topic",
    "description": "This method allows applications to retrieve details for the specified topic. This information includes supported schema versions, formats, and other metadata for the topic. Applications can subscribe to any of the topics for a supported schema version and format, limited by the authorization scopes required to subscribe to the topic. A topic specifies the type of information to be received and...",
    "method": "GET",
    "host": "api",
    "path": "/commerce/notification/v1/topic/{topic_id}",
    "tokenKind": "application",
    "fields": [
      {
        "name": "topic_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier of the notification topic for which the details are retrieved. Use getTopics to retrieve the topic ID."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_topics",
    "description": "This method returns a paginated collection of all supported topics, along with the details for the topics. This information includes supported schema versions, formats, and other metadata for the topics. Applications can subscribe to any of the topics for a supported schema version and format, limited by the authorization scopes required to subscribe to the topic. A topic specifies the type of...",
    "method": "GET",
    "host": "api",
    "path": "/commerce/notification/v1/topic",
    "tokenKind": "application",
    "fields": [
      {
        "name": "continuation_token",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This string value can be used to return the next page in the result set. The string to use here is returned in the next field of the current page of results."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The maximum number of notification topics to return per page from the result set. Min: 10 Max: 100 Default: 20"
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_find_eligible_items",
    "description": "This method evaluates a seller's current listings and returns the set of IDs that are eligible for a seller-initiated discount offer to a buyer. A listing ID is returned only when one or more buyers have shown an \"interest\" in the listing. If any buyers have shown interest in a listing, the seller can initiate a \"negotiation\" with them by calling sendOfferToInterestedBuyers , which sends all in...",
    "method": "GET",
    "host": "api",
    "path": "/sell/negotiation/v1/find_eligible_items",
    "tokenKind": "user",
    "fields": [
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the maximum number of items to return from the result set on a page in the paginated response. Minimum: 1 Maximum: 200 Default..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the number of results to skip in the result set before returning the first result in the paginated response. Combine offset wi..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_send_offer_to_interested_buyers",
    "description": "This method sends eligible buyers offers to purchase items in a listing at a discount. When a buyer has shown interest in a listing, they become \"eligible\" to receive a seller-initiated offer to purchase the item(s). Sellers use findEligibleItems to get the set of listings that have interested buyers. If a listing has interested buyers, sellers can use this method ( sendOfferToInterestedBuyers...",
    "method": "POST",
    "host": "api",
    "path": "/sell/negotiation/v1/send_offer_to_interested_buyers",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_items_awaiting_feedback",
    "description": "This method retrieves line items awaiting feedback from the user's order partner. You can refine the results using optional filter query parameters, such as item ID, user name, or user role in the transaction. Sorting and pagination features help organize and navigate returned items efficiently. For sellers, only sold items that have not yet received feedback are included. For buyers, only purc...",
    "method": "GET",
    "host": "api",
    "path": "/commerce/feedback/v1/awaiting_feedback",
    "tokenKind": "user",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Use this parameter to limit the response based on the specified filter parameters. Supported filter parameters include: listingId : Filter results by the spe..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This parameter sets the maximum number of line items to return per page of data. Use this parameter in conjunction with the offset parameter to control the p..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Use this parameter to specify the number of items to skip in the result set. This is used with the limit field to control the pagination of the output. For e..."
      },
      {
        "name": "sort",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Use this parameter to configure the order of the returned listings. The time is based on when the buyer paid for the line item. Acceptable values: END_TIME_A..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_feedback",
    "description": "This method enables users to retrieve feedback for any specified user ID and feedback type (sent or received). You can refine the results using optional query parameters such as its feedback ID, listing ID, or order line item ID, or applying one or more filters. Applying filters can narrow results using criteria such as comment type, photos, or topics identified through AI-based analysis. When...",
    "method": "GET",
    "host": "api",
    "path": "/commerce/feedback/v1/feedback",
    "tokenKind": "user",
    "fields": [
      {
        "name": "feedback_id",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Use this field to only return a specific feedback record by its feedback ID. Note: If this query parameter is used, no other filters will be applicable."
      },
      {
        "name": "feedback_type",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "Use this field to specify the type of feedback records to return. Acceptable values: FEEDBACK_RECEIVED : Retrieve feedback received by the specified user. FE..."
      },
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Use this parameter to limit the response based on the specified filter parameters as follows: commentType : Return only feedback with the set type of comment..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Use this parameter to set the maximum number of items to return per page of data. Use this parameter in conjunction with the offset parameter to control the..."
      },
      {
        "name": "listing_id",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Use this field to limit feedback entries to those associated with a specified listing."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Use this field to specify the number of line items to skip in the result set. This is used with the limit field to control the pagination of the output. For..."
      },
      {
        "name": "order_line_item_id",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Use this field to retrieve specific feedback entries related to an order line item ID. A maximum of two entries may be retrieved: feedback left by the buyer..."
      },
      {
        "name": "sort",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Use this parameter to configure the order of the returned items. The time is based on when the buyer paid for the line item. Acceptable values: RELEVANCE : S..."
      },
      {
        "name": "transaction_id",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Use this field to limit feedback entries to those associated with the specified transaction ID."
      },
      {
        "name": "user_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "Use this field to specify the unique identifier user ID (eBay username of the user) of the account for which feedback is being retrieved. Note: Both username..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_leave_feedback",
    "description": "This method creates and submits feedback to the user's order partner for a line item in the order. For each order, the order partner is the other participant in the transaction, either the buyer or seller, depending on the eBay user associated with the user token. This method allows users to provide detailed information about the transaction, including the feedback rating, comments, and seller...",
    "method": "POST",
    "host": "api",
    "path": "/commerce/feedback/v1/feedback",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_feedback_rating_summary",
    "description": "This method provides a detailed overview of feedback ratings associated with a user in the eBay marketplace. Specify a user ID and apply filters to retrieve summarized feedback data categorized by rating types and user roles. These returned metrics are aggregated, which offers insight into user experiences and performance. Tip: You can use this method to help sellers and buyers understand their...",
    "method": "GET",
    "host": "api",
    "path": "/commerce/feedback/v1/feedback_rating_summary",
    "tokenKind": "user",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "Use this parameter to limit the response based on specified filter values: ratingType : Specifies the type of rating being summarized and returned (Required)..."
      },
      {
        "name": "user_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "Use this parameter to specify the unique identifier (the eBay username associated with the account) for the eBay user whose feedback summary is being retrieved."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_respond_to_feedback",
    "description": "This method allows users to respond to feedback provided by the order partner for a specific line item in an order. For each order, the order partner is the other participant in the transaction, either the buyer or seller, depending on the eBay user associated with the user token. This method allows the user to provide additional context or address the order partner's feedback. Note: The feedba...",
    "method": "POST",
    "host": "api",
    "path": "/commerce/feedback/v1/respond_to_feedback",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_order",
    "description": "Use this call to retrieve the contents of an order based on its unique identifier, orderId . This value was returned in the getOrders call's orders.orderId field when you searched for orders by creation date, modification date, or fulfillment status. Include the optional fieldGroups query parameter set to TAX_BREAKDOWN to return a breakdown of the taxes and fees. The returned Order object conta...",
    "method": "GET",
    "host": "api",
    "path": "/sell/fulfillment/v1/order/{orderId}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "fieldGroups",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This parameter lets you control what is returned in the response. Note: The only presently supported value is TAX_BREAKDOWN . This field group adds addition..."
      },
      {
        "name": "orderId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is used to specify the unique identifier of the order being retrieved. Use the getOrders method to retrieve order IDs. Order ID values ar..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_orders",
    "description": "Use this method to search for and retrieve one or more orders based on their creation date, last modification date, or fulfillment status using the filter parameter. You can alternatively specify a list of orders using the orderIds parameter. Include the optional fieldGroups query parameter set to TAX_BREAKDOWN to return a breakdown of the taxes and fees. By default, when no filters are used th...",
    "method": "GET",
    "host": "api",
    "path": "/sell/fulfillment/v1/order",
    "tokenKind": "user",
    "fields": [
      {
        "name": "fieldGroups",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This parameter lets you control what is returned in the response. Note: The only presently supported value is TAX_BREAKDOWN . This field group adds addition..."
      },
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "One or more comma-separated criteria for narrowing down the collection of orders returned by this call. These criteria correspond to specific fields in the r..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of orders to return per page of the result set. Use this parameter in conjunction with the offset parameter to control the pagination of the outpu..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the number of orders to skip in the result set before returning the first order in the paginated response. Combine offset with the limit query para..."
      },
      {
        "name": "orderIds",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A comma-separated list of the unique identifiers of the orders to retrieve (maximum 50). If one or more order ID values are specified through the orderIds qu..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_issue_refund",
    "description": "Issue Refund",
    "method": "POST",
    "host": "api",
    "path": "/sell/fulfillment/v1/order/{order_id}/issue_refund",
    "tokenKind": "user",
    "fields": [
      {
        "name": "order_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is used to specify the unique identifier of the order associated with a refund. Use the getOrders method to retrieve order IDs."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_shipping_fulfillments",
    "description": "Use this call to retrieve the contents of all fulfillments currently defined for a specified order based on the order's unique identifier, orderId . This value is returned in the getOrders call's members.orderId field when you search for orders by creation date or shipment status.",
    "method": "GET",
    "host": "api",
    "path": "/sell/fulfillment/v1/order/{orderId}/shipping_fulfillment",
    "tokenKind": "user",
    "fields": [
      {
        "name": "orderId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is used to specify the unique identifier of the order associated with the shipping fulfillments being retrieved. Use the getOrders method..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_shipping_fulfillment",
    "description": "When you group an order's line items into one or more packages, each package requires a corresponding plan for handling, addressing, and shipping; this is a shipping fulfillment . For each package, execute this call once to generate a shipping fulfillment associated with that package. Note: A single line item in an order can consist of multiple units of a purchased item, and one unit can consis...",
    "method": "POST",
    "host": "api",
    "path": "/sell/fulfillment/v1/order/{orderId}/shipping_fulfillment",
    "tokenKind": "user",
    "fields": [
      {
        "name": "orderId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is used to specify the unique identifier of the order associated with the shipping fulfillment being created. Use the getOrders method to..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_shipping_fulfillment",
    "description": "Use this call to retrieve the contents of a fulfillment based on its unique identifier, fulfillmentId (combined with the associated order's orderId ). The fulfillmentId value was originally generated by the createShippingFulfillment call, and is returned by the getShippingFulfillments call in the members.fulfillmentId field.",
    "method": "GET",
    "host": "api",
    "path": "/sell/fulfillment/v1/order/{orderId}/shipping_fulfillment/{fulfillmentId}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "fulfillmentId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is used to specify the unique identifier of the shipping fulfillment being retrieved. Use the getShippingFulfillments method to retrieved..."
      },
      {
        "name": "orderId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is used to specify the unique identifier of the order associated with the shipping fulfillment being retrieved. Use the getOrders method..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_payment_dispute",
    "description": "Get Payment Dispute Details",
    "method": "GET",
    "host": "api",
    "path": "/sell/fulfillment/v1/payment_dispute/{payment_dispute_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "payment_dispute_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This parameter is used to specify the unique identifier of the payment dispute being retrieved. Use the getPaymentDisputeSummaries method to retrieve payment..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_fetch_evidence_content",
    "description": "Get Payment Dispute Evidence File",
    "method": "GET",
    "host": "api",
    "path": "/sell/fulfillment/v1/payment_dispute/{payment_dispute_id}/fetch_evidence_content",
    "tokenKind": "user",
    "fields": [
      {
        "name": "payment_dispute_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is used to specify the unique identifier of the payment dispute associated with the evidence file being retrieved. Use the getPaymentDisp..."
      },
      {
        "name": "evidence_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter is used to specify the unique identifier of the evidential file set. The identifier of an evidential file set for a payment dispute is r..."
      },
      {
        "name": "file_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter is used to specify the unique identifier of an evidential file. This file must belong to the evidential file set identified through the..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_activities",
    "description": "Get Payment Dispute Activity",
    "method": "GET",
    "host": "api",
    "path": "/sell/fulfillment/v1/payment_dispute/{payment_dispute_id}/activity",
    "tokenKind": "user",
    "fields": [
      {
        "name": "payment_dispute_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This parameter is used to specify the unique identifier of the payment dispute associated with the activity log being retrieved. Use the getPaymentDisputeSum..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_payment_dispute_summaries",
    "description": "Search Payment Dispute by Filters",
    "method": "GET",
    "host": "api",
    "path": "/sell/fulfillment/v1/payment_dispute_summary",
    "tokenKind": "user",
    "fields": [
      {
        "name": "order_id",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This filter is used if the seller wishes to retrieve one or more payment disputes filed against a specific order. It is possible that there can be more than..."
      },
      {
        "name": "buyer_username",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This filter is used if the seller wishes to retrieve one or more payment disputes opened by a specific buyer. The string that is passed in to this query para..."
      },
      {
        "name": "open_date_from",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The open_date_from and/or open_date_to date filters are used if the seller wishes to retrieve payment disputes opened within a specific date range. A maximum..."
      },
      {
        "name": "open_date_to",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The open_date_from and/or open_date_to date filters are used if the seller wishes to retrieve payment disputes opened within a specific date range. A maximum..."
      },
      {
        "name": "payment_dispute_status",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This filter is used if the seller wishes to only retrieve payment disputes in one or more specific states. To filter by more than one status value, a separat..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The value passed in this query parameter sets the maximum number of payment disputes to return per page of data. The value passed in this field should be an..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This field is used to specify the number of records to skip in the result set before returning the first payment dispute in the paginated response. A zero-ba..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_contest_payment_dispute",
    "description": "Contest Payment Dispute",
    "method": "POST",
    "host": "api",
    "path": "/sell/fulfillment/v1/payment_dispute/{payment_dispute_id}/contest",
    "tokenKind": "user",
    "fields": [
      {
        "name": "payment_dispute_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This parameter is used to specify the unique identifier of the payment dispute being contested. Use the getPaymentDisputeSummaries method to retrieve payment..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_accept_payment_dispute",
    "description": "Accept Payment Dispute",
    "method": "POST",
    "host": "api",
    "path": "/sell/fulfillment/v1/payment_dispute/{payment_dispute_id}/accept",
    "tokenKind": "user",
    "fields": [
      {
        "name": "payment_dispute_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This parameter is used to specify the unique identifier of the payment dispute being accepted. Use the getPaymentDisputeSummaries method to retrieve payment..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_upload_evidence_file",
    "description": "Upload an Evidence File",
    "method": "POST",
    "host": "api",
    "path": "/sell/fulfillment/v1/payment_dispute/{payment_dispute_id}/upload_evidence_file",
    "tokenKind": "user",
    "fields": [
      {
        "name": "payment_dispute_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This parameter is used to specify the unique identifier of the contested payment dispute for which the user intends to upload an evidence file. Use the getPa..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_add_evidence",
    "description": "Add an Evidence File",
    "method": "POST",
    "host": "api",
    "path": "/sell/fulfillment/v1/payment_dispute/{payment_dispute_id}/add_evidence",
    "tokenKind": "user",
    "fields": [
      {
        "name": "payment_dispute_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This parameter is used to specify the unique identifier of the contested payment dispute for which the seller wishes to add evidence files. Use the getPaymen..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_update_evidence",
    "description": "Update evidence",
    "method": "POST",
    "host": "api",
    "path": "/sell/fulfillment/v1/payment_dispute/{payment_dispute_id}/update_evidence",
    "tokenKind": "user",
    "fields": [
      {
        "name": "payment_dispute_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This parameter is used to specify the unique identifier of the contested payment dispute for which the user plans to update the evidence set. Use the getPaym..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_cancel_shipment",
    "description": "This method cancels the shipment associated with the specified shipment ID and the associated shipping label is deleted. When you cancel a shipment, the totalShippingCost of the canceled shipment is refunded to the account established by the user's billing agreement. Note that you cannot cancel a shipment if you have used the associated shipping label.",
    "method": "POST",
    "host": "api",
    "path": "/sell/logistics/v1_beta/shipment/{shipmentId}/cancel",
    "tokenKind": "user",
    "fields": [
      {
        "name": "shipmentId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned ID of the shipment to be canceled. The shipmentId value is generated and returned by the createFromShi..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_from_shipping_quote",
    "description": "This method creates a shipment based on the shippingQuoteId and rateId values supplied in the request. The rate identified by the rateId value specifies the carrier and service for the package shipment, and the rate ID must be contained in the shipping quote identified by the shippingQuoteId value. Call createShippingQuote to retrieve a set of live shipping rates. Note: The Logistics API only s...",
    "method": "POST",
    "host": "api",
    "path": "/sell/logistics/v1_beta/shipment/create_from_shipping_quote",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_download_label_file",
    "description": "This method returns the shipping label file that was generated for the shipmentId value specified in the request. Call createFromShippingQuote to generate a shipment ID. Note: The Logistics API only supports USPS shipping rates and labels. Use the Accept HTTP header to specify the format of the returned file. The default file format is a PDF file.",
    "method": "GET",
    "host": "api",
    "path": "/sell/logistics/v1_beta/shipment/{shipmentId}/download_label_file",
    "tokenKind": "user",
    "fields": [
      {
        "name": "shipmentId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the shipment associated with the shipping label you want to download. The shipmentId val..."
      },
      {
        "name": "Accept",
        "kind": "string",
        "place": "header",
        "required": true,
        "description": "This header specifies the format of the returned file. For this method, the value of the header should be Accept: application/pdf ."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_shipment",
    "description": "This method retrieves the shipment details for the specified shipment ID. Call createFromShippingQuote to generate a shipment ID.",
    "method": "GET",
    "host": "api",
    "path": "/sell/logistics/v1_beta/shipment/{shipmentId}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "shipmentId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the shipment you want to retrieve. The shipmentId value is generated and returned by the..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_shipping_quote",
    "description": "The createShippingQuote method returns a shipping quote that contains a list of live \"rates.\" Each rate represents an offer made by a shipping carrier for a specific service and each offer has a live quote for the base service cost. Rates have a time window in which they are \"live,\" and rates expire when their purchase window ends. If offered by the carrier, rates can include shipping options (...",
    "method": "POST",
    "host": "api",
    "path": "/sell/logistics/v1_beta/shipping_quote",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_shipping_quote",
    "description": "This method retrieves the complete details of the shipping quote associated with the specified shippingQuoteId value. A \"shipping quote\" pertains to a single specific package and contains a set of shipping \"rates\" that quote the cost to ship the package by different shipping carriers and services. The quotes are based on the package's origin, destination, and size. Call createShippingQuote to c...",
    "method": "GET",
    "host": "api",
    "path": "/sell/logistics/v1_beta/shipping_quote/{shippingQuoteId}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "shippingQuoteId",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned ID of the shipping quote you want to retrieve. The shippingQuoteId value is generated and returned by..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_bulk_create_ads_by_inventory_reference",
    "description": "This method adds multiple listings that are managed with the Inventory API to an existing Promoted Listings campaign. For general strategy campaigns using the Cost Per Sale (CPS) model, bulk ads may be directly created for the listing. For each listing specified in the request, this method: Creates an ad for the listing. Sets the bid percentage (also known as the ad rate ) for the ads created....",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/bulk_create_ads_by_inventory_reference",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which to associated the ads being created. Use the getCampaigns meth..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_create_ads_by_listing_id",
    "description": "This method adds multiple listings to an existing Promoted Listings campaign using listingId values generated by the Trading API or Inventory API , or using values generated by an ad group ID. For general strategy campaigns using the Cost Per Sale (CPS) funding model, bulk ads may be directly created for the listing. For each listing ID specified in the request, this method: Creates an ad for t...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/bulk_create_ads_by_listing_id",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which to associated the ads being created. Use the getCampaigns meth..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_delete_ads_by_inventory_reference",
    "description": "This method works with listings created with the Inventory API . The method deletes a set of ads, as specified by a list of inventory reference IDs, from the specified campaign. Inventory reference IDs are seller-defined IDs that are used with the Inventory API . Pass the campaign_id as a path parameter and populate the payload with a list of inventoryReferenceId and inventoryReferenceType pair...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/bulk_delete_ads_by_inventory_reference",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which to delete a set of ads. Use the getCampaigns method to retriev..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_delete_ads_by_listing_id",
    "description": "This method works with listing IDs created with either the Trading API or the Inventory API . The method deletes a set of ads, as specified by a list of listingID values from a Promoted Listings campaign. A listing ID value is generated by eBay when a seller creates a listing with either the Trading API and Inventory API. Pass the campaign_id as a path parameter and populate the payload with th...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/bulk_delete_ads_by_listing_id",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the eBay-assigned identifier of the ad campaign for which to delete a set of ads. Use the getCampaigns method to retrieve campa..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_update_ads_bid_by_inventory_reference",
    "description": "This method works with listings created with either the Trading API or the Inventory API . The method updates the bidPercentage values for a set of ads associated with the specified campaign. Specify the campaign_id as a path parameter and supply a set of listing IDs with their associated updated bidPercentage values in the request body. An eBay listing ID is generated when a listing is created...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/bulk_update_ads_bid_by_inventory_reference",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which to update the bid percentage for a set of ads. Use the getCamp..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_update_ads_bid_by_listing_id",
    "description": "This method works with listings created with either the Trading API or the Inventory API . The method updates the bidPercentage values for a set of ads associated with the specified campaign. Specify the campaign_id as a path parameter and supply a set of listing IDs with their associated updated bidPercentage values in the request body. An eBay listing ID is generated when a listing is created...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/bulk_update_ads_bid_by_listing_id",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which to update the bid percentage for a set of ads. Use the getCamp..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_update_ads_status",
    "description": "Note: This method is only available for select partners who have been approved for the priority strategy program. For information about how to request access to this program, refer to Priority Strategy Access Requests in the Promoted Listings Playbook. To determine if a seller qualifies for priority strategy, use the getAdvertisingEligibility method in Account API. This method works with listin...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/bulk_update_ads_status",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the ad statuses being updated. Use the getCampaigns meth..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_update_ads_status_by_listing_id",
    "description": "The method updates the status of ads in bulk, based on listing ID values. Specify the campaign_id as a path parameter and supply a set of listing IDs with their updated adStatus values in the request body. An eBay listing ID is generated when a listing is created with the Trading API. Get the campaign IDs for a seller by calling getCampaigns and call getAds to retrieve a list of seller inventor...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/bulk_update_ads_status_by_listing_id",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the ads being updated. Use the getCampaigns method to re..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_ads",
    "description": "This method retrieves Promoted Listings ads that are associated with listings created with either the Trading API or the Inventory API . The method retrieves ads related to the specified campaign. Specify the Promoted Listings campaign to target with the campaign_id path parameter. Because of the large number of possible results, you can use query parameters to paginate the result set by specif...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/ad",
    "tokenKind": "user",
    "fields": [
      {
        "name": "ad_group_ids",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A comma-separated list of ad group IDs. The results will be filtered to only include active ads for these ad groups. Use the getAdGroups method to retrieve t..."
      },
      {
        "name": "ad_status",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A comma-separated list of ad statuses. The results will be filtered to only include the given statuses of the ad. If none are provided, all ads are returned...."
      },
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the ads being retrieved. Use the getCampaigns method to..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the maximum number of ads to return on a page in the paginated response. Default: 10 Maximum: 500"
      },
      {
        "name": "listing_ids",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A comma-separated list of listing IDs. Note: The response includes only active ads. The results do not include listing IDs that are excluded by other conditi..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the number of ads to skip in the result set before returning the first ad in the paginated response. Combine offset with the limit query parameter..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_ad_by_listing_id",
    "description": "This method adds a listing to an existing Promoted Listings campaign using a listingId value generated by the Trading API or Inventory API , or using a value generated by an ad group ID. For general strategy campaigns using the Cost Per Sale (CPS) funding model, an ad may be directly created for the listing. For the listing ID specified in the request, this method: Creates an ad for the listing...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/ad",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which to associate the newly created ad. Use the getCampaigns method..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_create_ads_by_inventory_reference",
    "description": "This method adds a listing that is managed with the Inventory API to an existing Promoted Listings campaign. For general strategy campaigns using the Cost Per Sale (CPS) funding model, an ad may be directly created for the listing. For each listing specified in the request, this method: Creates an ad for the listing. Sets the bid percentage (also known as the ad rate ) for the ads created. Asso...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/create_ads_by_inventory_reference",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which to associate the newly created ads. Use the getCampaigns metho..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_ad",
    "description": "This method retrieves the specified ad from the specified campaign. In the request, supply the campaign_id and ad_id as path parameters. Call getCampaigns to retrieve a list of the seller's current campaign IDs and call getAds to retrieve their current ad IDs.",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/ad/{ad_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "ad_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the ad being retrieved. Use the getAds method to retrieve ad IDs."
      },
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the ad being retrieved. Use the getCampaigns method to r..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_delete_ad",
    "description": "This method removes the specified ad from the specified campaign. Pass the ID of the ad to delete with the ID of the campaign associated with the ad as path parameters to the call. Call getCampaigns to get the current list of the seller's campaign IDs. Note: This method only applies to the Cost Per Sale (CPS) funding model; it does not apply to the Cost Per Click (CPC) funding model. See Fundin...",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/ad/{ad_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "ad_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the ad being deleted. Use the getAds method to retrieve ad IDs."
      },
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the ad being deleted. Use the getCampaigns method to ret..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_delete_ads_by_inventory_reference",
    "description": "This method works with listings that are managed with the Inventory API . The method deletes ads using a list of seller-defined inventory reference IDs, used with the Inventory API, that are associated with the specified campaign ID. Specify the campaign ID (as a path parameter) and a list of inventoryReferenceId and inventoryReferenceType pairs to be deleted. Call getCampaigns to get a list of...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/delete_ads_by_inventory_reference",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the ads being deleted. Use the getCampaigns method to re..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_ads_by_inventory_reference",
    "description": "This method retrieves Promoted Listings ads associated with listings that are managed with the Inventory API from the specified campaign. Supply the campaign_id as a path parameter and use query parameters to specify the inventory_reference_id and inventory_reference_type pairs. In the Inventory API, an inventory reference ID is either a seller-defined SKU value or an inventoryItemGroupKey (a s...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/get_ads_by_inventory_reference",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the ads being retrieved. Use the getCampaigns method to..."
      },
      {
        "name": "inventory_reference_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies the unique identifier of a single-item listing or a multi-variation listing. To retrieve an ad for a single-item listing, set..."
      },
      {
        "name": "inventory_reference_type",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies the type of the item the inventory_reference_id references. See InventoryReferenceType for supported values."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_bid",
    "description": "This method updates the bid percentage (also known as the \"ad rate\") for the specified ad in the specified campaign. In the request, supply the campaign_id and ad_id as path parameters, and supply the new bidPercentage value in the payload of the call. Call getCampaigns to retrieve a seller's current campaign IDs and call getAds to get their ad IDs. Note: This method only applies to the Cost Pe...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/ad/{ad_id}/update_bid",
    "tokenKind": "user",
    "fields": [
      {
        "name": "ad_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the ad for which the bid percentage is being updated. Use the getAds method to retrieve ad IDs."
      },
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the ad being updated. Use the getCampaigns method to ret..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_ad_groups",
    "description": "This method retrieves ad groups for the specified campaigns. Each campaign can only have one ad group. In the request, supply the campaign_ids as path parameters. Call getCampaigns to retrieve a list of the current campaign IDs for a seller.",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/ad_group",
    "tokenKind": "user",
    "fields": [
      {
        "name": "ad_group_status",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A comma-separated list of ad group statuses. The results will be filtered to only include the given statuses of the ad group. See AdGroupStatusEnum for suppo..."
      },
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the ad groups being retrieved. Use the getCampaigns meth..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of results, from the current result set, to be returned in a single page."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of results that will be skipped in the result set. This is used with the limit field to control the pagination of the output. For example, if the..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_ad_group",
    "description": "This method adds an ad group to an existing priority strategy campaign that uses manual targeting. To create an ad group for a campaign, specify the defaultBid for the ad group in the payload of the request. Then specify the campaign to which the ad group should be associated using the campaign_id path parameter. Each campaign can have one or more associated ad groups.",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/ad_group",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign to associate with the ad group being created. Use the getCampaigns metho..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_ad_group",
    "description": "This method retrieves the details of a specified ad group, such as the ad group’s default bid and status. In the request, specify the campaign_id and ad_group_id as path parameters. Call getCampaigns to retrieve a list of the current campaign IDs for a seller and call getAdGroups for the ad group ID of the ad group you wish to retrieve.",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/ad_group/{ad_group_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "ad_group_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the ad group being retrieved. Use the getAdGroups method to retrieve ad group IDs."
      },
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the ad group being retrieved. Use the getCampaigns metho..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_ad_group",
    "description": "This method updates the ad group associated with a campaign. With this method, you can modify the default bid for the ad group, change the state of the ad group, or change the name of the ad group. Pass the ad_group_id you want to update as a URI parameter, and configure the adGroupStatus and defaultBid in the request payload. Call getAdGroup to retrieve the current default bid and status of th...",
    "method": "PUT",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/ad_group/{ad_group_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "ad_group_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the ad group that is being updated. Use the getAdGroups method to retrieve ad group IDs."
      },
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which the ad group is being updated. Use the getCampaigns method to..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_suggest_bids",
    "description": "This method allows sellers to retrieve the suggested bids for input keywords and match type.",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/ad_group/{ad_group_id}/suggest_bids",
    "tokenKind": "user",
    "fields": [
      {
        "name": "ad_group_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the ad group containing the keywords for which the bid suggestions will be provided. Use the getAdGrou..."
      },
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the keywords for which bid suggestions will be provided...."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_suggest_keywords",
    "description": "This method allows sellers to retrieve a list of keyword ideas to be targeted for Promoted Listings campaigns.",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/ad_group/{ad_group_id}/suggest_keywords",
    "tokenKind": "user",
    "fields": [
      {
        "name": "ad_group_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the ad group for which the keyword suggestions will be provided. Use the getAdGroups method to retriev..."
      },
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which keyword suggestions will be provided. Use the getCampaigns met..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_clone_campaign",
    "description": "This method clones (makes a copy of) the specified campaign's campaign criterion . The campaign criterion is a container for the fields that define the criteria for a rule-based campaign. To clone a campaign, supply the campaign_id as a path parameter in your call. There is no request payload. The ID of the newly-cloned campaign is returned in the Location response header. Call getCampaigns to...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/clone",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign being cloned. Use the getCampaigns method to retrieve campaign IDs."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_campaigns",
    "description": "This method retrieves the details for all of the seller's defined campaigns. Request parameters can be used to retrieve a specific campaign, such as the campaign's name, the start and end date, the channel, the status, and the funding model (i.e., Cost Per Sale (CPS) or Cost Per Click (CPC)). You can filter the result set by a campaign name, end date range, start date range, campaign channel, o...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_name",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the name of the campaign being retrieved. The results are filtered to include only the campaign by the specified name. Use the..."
      },
      {
        "name": "campaign_status",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the status of the campaign(s) being retrieved. Note: The results might not include all the campaigns with this status if other..."
      },
      {
        "name": "campaign_targeting_types",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the targeting type of the campaign(s) to be retrieved. The results will be filtered to only include campaigns with the specifi..."
      },
      {
        "name": "channels",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the channel for the campaign(s) being retrieved. The results will be filtered to only include campaigns with the specified cha..."
      },
      {
        "name": "end_date_range",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the range of a campaign's end date. The results are filtered to include only campaigns with an end date that is within specifi..."
      },
      {
        "name": "funding_strategy",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the funding strategy for the campaign(s) being retrieved. The results will be filtered to only include campaigns with the spec..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the maximum number of campaigns to return on a page in the paginated response. Default: 10 Maximum: 500"
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the number of campaigns to skip in the result set before returning the first report in the paginated response. Combine offset..."
      },
      {
        "name": "start_date_range",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the range of a campaign's start date in which to filter the results. The results are filtered to include only campaigns with a..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_campaign",
    "description": "This method can be used to create a Promoted Listings general, priority, or offsite campaign. A Promoted Listings campaign is the structure in which you place the ads or ad group for the listings you wish to promote. Note: Campaigns can only contain ads for a maximum of 50,000 items. General strategy campaigns utilize a Cost Per Sale (CPS) funding model. Sellers can set the ad rate and bidding...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_campaign",
    "description": "This method retrieves the details of a single campaign, as specified with the campaign_id query parameter. This method returns all the details of a campaign (including the campaign's the selection rules), except the for the listing IDs or inventory reference IDs included in the campaign. These IDs are returned by getAds . Call getCampaigns to retrieve a list of the seller's campaign IDs.",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign being retrieved. Use the getCampaigns method to retrieve campaign IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_delete_campaign",
    "description": "This method deletes the campaign specified by the campaign_id query parameter. Note: You can only delete campaigns that have ended. Call getCampaigns to retrieve the campaign_id and the campaign status ( RUNNING , PAUSED , ENDED , and so on) for all the seller's campaigns.",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign being deleted. Use the getCampaigns method to retrieve campaign IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_end_campaign",
    "description": "This method ends an active ( RUNNING ) or paused campaign. Specify the campaign you want to end by supplying its campaign ID in a query parameter. Call getCampaigns to retrieve the campaign_id and the campaign status ( RUNNING , PAUSED , ENDED , and so on) for all the seller's campaigns.",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/end",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the RUNNING or PAUSED ad campaign that is being ended. Use the getCampaigns method to re..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_find_campaign_by_ad_reference",
    "description": "This method retrieves the campaigns containing the listing that is specified using either a listing ID, or an inventory reference ID and inventory reference type pair. The request accepts either a listing_id , or an inventory_reference_id and inventory_reference_type pair, as used in the Inventory API. eBay listing IDs are generated by either the Trading API or the Inventory API when you create...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/find_campaign_by_ad_reference",
    "tokenKind": "user",
    "fields": [
      {
        "name": "inventory_reference_id",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the unique identifier of a single-item listing or a multi-variation listing associated with the campaign being retrieved. To r..."
      },
      {
        "name": "inventory_reference_type",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the type of the seller's inventory reference ID, which is a listing or group of items. See InventoryReferenceTypeEnum for supp..."
      },
      {
        "name": "listing_id",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the unique identifier of the eBay listing associated with the ad being used to retrieve the campaign. eBay listing IDs are gen..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_campaign_by_name",
    "description": "This method retrieves the details of a single campaign, as specified with the campaign_name query parameter. Note that the campaign name you specify must be an exact, case-sensitive match of the name of the campaign you want to retrieve. Call getCampaigns to retrieve a list of the seller's campaign names.",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/get_campaign_by_name",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_name",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies name of the campaign being retrieved. Use the getCampaigns method to retrieve a list of a seller's campaign names."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_pause_campaign",
    "description": "This method pauses an active (RUNNING) campaign. You can restart the campaign by calling resumeCampaign , as long as the campaign's end date is in the future. Note: The listings associated with a paused campaign cannot be added into another campaign. Call getCampaigns to retrieve the campaign_id and the campaign status ( RUNNING , PAUSED , ENDED , and so on) for all the seller's campaigns.",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/pause",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the RUNNING ad campaign being paused. Use the getCampaigns method to retrieve campaign IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_resume_campaign",
    "description": "This method resumes a paused campaign, as long as its end date is in the future. Supply the campaign_id for the campaign you want to restart as a query parameter in the request. Call getCampaigns to retrieve the campaign_id and the campaign status ( RUNNING , PAUSED , ENDED , and so on) for all the seller's campaigns.",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/resume",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the paused ad campaign that is being resumed. Use the getCampaigns method to retrieve ca..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_suggest_budget",
    "description": "Note: This method is only supported for Promoted Offsite campaigns. Sellers can use the getAdvertisingEligibility method of the Account API v1 to determine if they are eligible for offsite campaigns. This method allows sellers to retrieve the suggested budget for an offsite campaign.",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/suggest_budget",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_suggest_items",
    "description": "This method allows sellers to obtain ideas for listings, which can be targeted for Promoted Listings campaigns.",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/suggest_items",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which suggestions are being provided. Use the getCampaigns method to..."
      },
      {
        "name": "category_ids",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the category ID that is used to limit the results. This refers to an exact leaf category (the lowest level in that category and has no children). T..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the maximum number of campaigns to return on a page in the paginated response. If no value is specified, the default value is used. Default: 10 Min..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the number of campaigns to skip in the result set before returning the first report in the paginated response. Combine offset with the limit query..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_suggest_max_cpc",
    "description": "Note: This method is only supported for smart targeting priority strategy campaigns. Sellers can use the getAdvertisingEligibility method of the Account API v1 to determine if they are eligible for a priority strategy campaign. This method allows sellers to retrieve the suggested maximum cost-per-click value for a smart targeting campaign. This value is required when creating a smart targeting...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/suggest_max_cpc",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_update_ad_rate_strategy",
    "description": "This method updates the ad rate strategy for an existing rules-based general strategy ad campaign that uses the Cost Per Sale (CPS) funding model. Specify the campaign_id as a path parameter. You can retrieve the campaign IDs for a seller by calling the getCampaigns method. Note: This method only applies to the CPS funding model; it does not apply to the Cost Per Click (CPC) funding model. See...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/update_ad_rate_strategy",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which the ad rate strategy is being updated. Use the getCampaigns me..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_update_bidding_strategy",
    "description": "This method allows sellers to change the bidding strategy for a specified Cost Per Click (CPC) campaign that uses manual targeting. Available bidding strategies are: FIXED When using a fixed bidding strategy, sellers manually assign and adjust keyword bids for the CPC campaign. DYNAMIC When using a dynamic bidding strategy, eBay will manage a campaign's keyword bids and automatically update the...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/update_bidding_strategy",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which the keyword bidding strategy is being updated. Use the getCamp..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_update_campaign_budget",
    "description": "This method updates the daily budget for a priority strategy campaign that uses the Cost Per Click (CPC) funding model. A click occurs when an eBay user finds and clicks on the seller’s listing (within the search results) after using a keyword that the seller has created for the campaign. For each ad in an ad group in the campaign, each click triggers a cost, which gets subtracted from the camp...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/update_campaign_budget",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which the budget is being updated. Use the getCampaigns method to re..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_update_campaign_identification",
    "description": "This method can be used to change the name of a campaign, as well as modify the start or end dates. Specify the campaign_id you want to update as a URI parameter, and configure the campaignName and startDate in the request payload. If you want to change only the end date of the campaign, specify the current campaign name, set endDate as desired, and set startDate to the actual start date of the...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/update_campaign_identification",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign being updated. Use the getCampaigns method to retrieve campaign IDs."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_create_keyword",
    "description": "This method adds keywords, in bulk, to an existing priority strategy ad group in a campaign that uses manual targeting. This method also sets the CPC rate for each keyword, depending on the selected bidding strategy, as follows: FIXED : If the seller provides a keyword bid, that bid value will be used. If no bid is provided, the adgroup's default bid value will be used. DYNAMIC : The eBay sugge...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/bulk_create_keyword",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which a set of keywords is being created. Use the getCampaigns metho..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_update_keyword",
    "description": "This method updates the bids and statuses of keywords, in bulk, for an existing priority strategy campaign. In the request, supply the campaign_id as a path parameter. Call the getCampaigns method to retrieve a list of current campaign IDs for a specified seller.",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/bulk_update_keyword",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which a set of keywords is being updated. Use the getCampaigns metho..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_keywords",
    "description": "This method can be used to retrieve all of the keywords for ad groups in priority strategy campaigns that use the Cost Per Click (CPC) funding model. In the request, specify the campaign_id as a path parameter. If one or more ad_group_ids are passed in the request body, the keywords for those ad groups will be returned. If ad_group_ids are not passed in the response body, the call will return a...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/keyword",
    "tokenKind": "user",
    "fields": [
      {
        "name": "ad_group_ids",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A comma-separated list of ad group IDs. This query parameter is used if the seller wants to retrieve keywords from one or more specific ad groups. If this qu..."
      },
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the keyword(s) being retrieved. Use the getCampaigns met..."
      },
      {
        "name": "keyword_status",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A comma-separated list of keyword statuses. The results will be filtered to only include the given statuses of the keyword. If none are provided, all keyword..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the maximum number of results to return on a page in the paginated response. Default: 10 Maximum: 500"
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the number of results to skip in the result set before returning the first report in the paginated response. Combine offset with the limit query pa..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_keyword",
    "description": "This method creates keywords using a specified campaign ID for an existing priority strategy campaign that uses manual targeting. In the request, supply the campaign_id as a path parameter. Call the suggestKeywords method to retrieve a list of keyword ideas to be targeted for priority strategy campaigns, and call the getCampaigns method to retrieve a list of current campaign IDs for a seller.",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/keyword",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign for which a keyword is being created. Use the getCampaigns method to ret..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_keyword",
    "description": "This method retrieves details on a specific keyword from an ad group within a priority strategy campaign that uses the Cost Per Click (CPC) funding model. In the request, specify the campaign_id and keyword_id as path parameters. Call the getCampaigns method to retrieve a list of current campaign IDs for a seller and call the getKeywords method to retrieve their keyword IDs.",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/keyword/{keyword_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the keyword being retrieved. Use the getCampaigns method..."
      },
      {
        "name": "keyword_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the keyword being retrieved. Use the getKeywords method to retrieve keyword IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_keyword",
    "description": "This method updates keywords using a campaign ID and keyword ID for an existing priority strategy campaign. In the request, specify the campaign_id and keyword_id as path parameters. Call the getCampaigns method to retrieve a list of current campaign IDs for a seller and call the getKeywords method to retrieve their keyword IDs.",
    "method": "PUT",
    "host": "api",
    "path": "/sell/marketing/v1/ad_campaign/{campaign_id}/keyword/{keyword_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the keyword being updated. Use the getCampaigns method t..."
      },
      {
        "name": "keyword_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the keyword being updated. Use the getKeywords method to retrieve keyword IDs."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_create_negative_keyword",
    "description": "This method adds negative keywords, in bulk, to an existing ad group in a priority strategy campaign that uses manual targeting. Specify the campaignId and adGroupId in the request body, along with the negativeKeywordText and negativeKeywordMatchType . Call the getCampaigns method to retrieve a list of current campaign IDs for a specified seller.",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/bulk_create_negative_keyword",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_update_negative_keyword",
    "description": "This method updates the statuses of existing negative keywords, in bulk. Specify the negativeKeywordId and negativeKeywordStatus in the request body.",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/bulk_update_negative_keyword",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_negative_keywords",
    "description": "This method can be used to retrieve all of the negative keywords for ad groups in priority strategy campaigns that use the Cost Per Click (CPC) funding model. The results can be filtered using the campaign_ids , ad_group_ids , and negative_keyword_status query parameters. Call the getCampaigns method to retrieve a list of current campaign IDs for a seller.",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/negative_keyword",
    "tokenKind": "user",
    "fields": [
      {
        "name": "ad_group_ids",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A comma-separated list of ad group IDs. This query parameter is used if the seller wants to retrieve the negative keywords from one or more specific ad group..."
      },
      {
        "name": "campaign_ids",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the ad campaign associated with the negative keywords being retrieved. This query parame..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of results, from the current result set, to be returned in a single page."
      },
      {
        "name": "negative_keyword_status",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A comma-separated list of negative keyword statuses. This query parameter is used if the seller wants to filter the search results based on one or more negat..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of results that will be skipped in the result set. This is used with the limit field to control the pagination of the output. For example, if the..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_negative_keyword",
    "description": "This method adds a negative keyword to an existing ad group in a priority strategy campaign that uses manual targeting. Specify the campaignId and adGroupId in the request body, along with the negativeKeywordText and negativeKeywordMatchType . Call the getCampaigns method to retrieve a list of current campaign IDs for a specified seller.",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/negative_keyword",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_negative_keyword",
    "description": "This method retrieves details on a specific negative keyword. In the request, specify the negative_keyword_id as a path parameter.",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/negative_keyword/{negative_keyword_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "negative_keyword_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier for the negative keyword being retrieved. Use the getNegativeKeywords method to retrieve negative keyword..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_negative_keyword",
    "description": "This method updates the status of an existing negative keyword. Specify the negative_keyword_id as a path parameter, and specify the negativeKeywordStatus in the request body.",
    "method": "PUT",
    "host": "api",
    "path": "/sell/marketing/v1/negative_keyword/{negative_keyword_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "negative_keyword_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "The unique identifier for the negative keyword. This value is returned in the Location response header from the createNegativeKeyword method."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_report",
    "description": "This call downloads the report as specified by the report_id path parameter. Call createReportTask to schedule and generate a Promoted Listings report. All date values are returned in UTC format ( yyyy-MM-ddThh:mm:ss.sssZ ). Note: The reporting of some data related to sales and ad-fees may require a 72-hour ( maximum ) adjustment period which is often referred to as the Reconciliation Period ....",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_report/{report_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "report_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique ID of the Promoted Listings report being retrieved. Use the getReportTasks method to retrieve report IDs."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_report_metadata",
    "description": "This call retrieves information that details the fields used in each of the Promoted Listings reports. Use the returned information to configure the different types of Promoted Listings reports. You can retrieve metadata for all report types,funding models and channels, or you can filter based on funding model and/or channel. Note: The reporting of some data related to sales and ad-fees may req...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_report_metadata",
    "tokenKind": "application",
    "fields": [
      {
        "name": "funding_model",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter is used only if the user wants to see report metadata for a specific funding model. Refer to the FundingModelEnum type for supported val..."
      },
      {
        "name": "channel",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter is used only if the user wants to see COST_PER_CLICK report metadata for a specific channel. Refer to the ChannelEnum type for supported..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_report_metadata_for_report_type",
    "description": "This call retrieves metadata that details the fields used by a specific Promoted Listings report type. Use the report_type path parameter to indicate metadata to retrieve. This method does not use a request payload. Note: The reporting of some data related to sales and ad-fees may require a 72-hour ( maximum ) adjustment period which is often referred to as the Reconciliation Period . Such adju...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_report_metadata/{report_type}",
    "tokenKind": "application",
    "fields": [
      {
        "name": "report_type",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the name of the report type whose metadata you want to retrieve. For details about available report types and their description..."
      },
      {
        "name": "funding_model",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The funding model used in the report. The funding model must be compatible with the report type specified in the path parameter. Refer to the FundingModelEnu..."
      },
      {
        "name": "channel",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The channel used in the report. The channel must be compatible with the report type specified in the path parameter. Refer to the ChannelEnum type for suppor..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_report_tasks",
    "description": "This method returns information on all the existing report tasks related to a seller. Use the report_task_statuses query parameter to control which reports to return. You can paginate the result set by specifying a limit , which dictates how many report tasks to return on each page of the response. Use the offset parameter to specify how many reports to skip in the result set before returning t...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_report_task",
    "tokenKind": "user",
    "fields": [
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the maximum number of report tasks to return on a page in the paginated response. Default: 10 Maximum: 500"
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the number of report tasks to skip in the result set before returning the first report in the paginated response. Combine offset with the limit que..."
      },
      {
        "name": "report_task_statuses",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter filters the returned report tasks by their status. Supply a comma-separated list of the report statuses you want returned. The results a..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_report_task",
    "description": "This method creates a report task , which generates a Promoted Listings report based on the values specified in the call. The report is generated based on the criteria you specify, including the report type, the report's dimensions and metrics, the report's start and end dates, the listings to include in the report, and more. Metrics are the quantitative measurements in the report while dimensi...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/ad_report_task",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_report_task",
    "description": "This call returns the details of a specific Promoted Listings report task, as specified by the report_task_id path parameter. The report task includes the report criteria (such as the report dimensions, metrics, and included listing) and the report-generation rules (such as starting and ending dates for the specified report task). Report-task IDs are generated by eBay when you call createReport...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/ad_report_task/{report_task_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "report_task_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the report task being retrieved. Use the getReportTasks method to retrieve report task Ids."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_delete_report_task",
    "description": "This call deletes the report task specified by the report_task_id path parameter. This method also deletes any reports generated by the report task. Report task IDs are generated by eBay when you call createReportTask . Get a complete list of a seller's report-task IDs by calling getReportTasks . Important! For ad_report and ad_report_task methods, the API call limit is subject to a per user qu...",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/marketing/v1/ad_report_task/{report_task_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "report_task_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the report task being deleted. Use the getReportTasks method to retrieve report task Ids."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_item_price_markdown_promotion",
    "description": "Note: As of July 8th 2024, promotions are now being referred to as discounts on Seller Hub and eBay help pages. Sell Marketing API documentation has been updated to reflect this product name change, but note that no API interface changes have been made. This method creates an item price markdown discount (know simply as a \"markdown discount\") where a discount amount is applied directly to the i...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/item_price_markdown",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_item_price_markdown_promotion",
    "description": "Note: As of July 8th 2024, promotions are now being referred to as discounts on Seller Hub and eBay help pages. Sell Marketing API documentation has been updated to reflect this product name change, but note that no API interface changes have been made. This method returns the complete details of the item price markdown discount that's indicated by the promotion_id path parameter. Call getPromo...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/item_price_markdown/{promotion_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "promotion_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter takes a concatenation of the ID of the discount you want to retrieve plus the marketplace ID on which the discount is hosted. Concatenate..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_item_price_markdown_promotion",
    "description": "Note: As of July 8th 2024, promotions are now being referred to as discounts on Seller Hub and eBay help pages. Sell Marketing API documentation has been updated to reflect this product name change, but note that no API interface changes have been made. This method updates the specified item price markdown discount with the new configuration that you supply in the payload of the request. Specif...",
    "method": "PUT",
    "host": "api",
    "path": "/sell/marketing/v1/item_price_markdown/{promotion_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "promotion_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter takes a concatenation of the ID of the discount you want to update plus the marketplace ID on which the discount is hosted. Concatenate t..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_item_price_markdown_promotion",
    "description": "Note: As of July 8th 2024, promotions are now being referred to as discounts on Seller Hub and eBay help pages. Sell Marketing API documentation has been updated to reflect this product name change, but note that no API interface changes have been made. This method deletes the item price markdown discount specified by the promotion_id path parameter. Call getPromotions to retrieve the IDs of a...",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/marketing/v1/item_price_markdown/{promotion_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "promotion_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter takes a concatenation of the ID of the discount you want to delete plus the marketplace ID on which the discount is hosted. Concatenate t..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_item_promotion",
    "description": "Note: As of July 8th 2024, promotions are now being referred to as discounts on Seller Hub and eBay help pages. Sell Marketing API documentation has been updated to reflect this product name change, but note that no API interface changes have been made. This method creates an item discount , where the buyer receives a discount when they meet the specific buying criteria. Known here as \"threshol...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/item_promotion",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_item_promotion",
    "description": "Note: As of July 8th 2024, promotions are now being referred to as discounts on Seller Hub and eBay help pages. Sell Marketing API documentation has been updated to reflect this product name change, but note that no API interface changes have been made. This method returns the complete details of the threshold discount specified by the promotion_id path parameter. Call getPromotions to retrieve...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/item_promotion/{promotion_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "promotion_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter takes a concatenation of the ID of the discount you want to retrieve plus the marketplace ID on which the discount is hosted. Concatenate..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_item_promotion",
    "description": "Note: As of July 8th 2024, promotions are now being referred to as discounts on Seller Hub and eBay help pages. Sell Marketing API documentation has been updated to reflect this product name change, but note that no API interface changes have been made. This method updates the specified threshold discount with the new configuration that you supply in the request. Indicate the discount you want...",
    "method": "PUT",
    "host": "api",
    "path": "/sell/marketing/v1/item_promotion/{promotion_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "promotion_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter takes a concatenation of the ID of the discount you want to update plus the marketplace ID on which the discount is hosted. Concatenate t..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_item_promotion",
    "description": "Note: As of July 8th 2024, promotions are now being referred to as discounts on Seller Hub and eBay help pages. Sell Marketing API documentation has been updated to reflect this product name change, but note that no API interface changes have been made. This method deletes the threshold discount specified by the promotion_id path parameter. Call getPromotions to retrieve the IDs of a seller's d...",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/marketing/v1/item_promotion/{promotion_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "promotion_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter takes a concatenation of the ID of the discount you want to delete plus the marketplace ID on which the discount is hosted. Concatenate t..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_listing_set",
    "description": "Note: As of July 8th 2024, promotions are now being referred to as discounts on Seller Hub and eBay help pages. Sell Marketing API documentation has been updated to reflect this product name change, but note that no API interface changes have been made. This method returns the set of listings associated with the promotion_id specified in the path parameter. Call getPromotions to retrieve the ID...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/promotion/{promotion_id}/get_listing_set",
    "tokenKind": "user",
    "fields": [
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the maximum number of discounts returned on a page from the result set. Default: 200 Maximum: 200"
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the number of discounts to skip in the result set before returning the first discount in the paginated response. Combine offset with the limit quer..."
      },
      {
        "name": "promotion_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter takes a concatenation of the ID of the discount associated with the listing set plus the marketplace ID on which the discount is hosted...."
      },
      {
        "name": "q",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Reserved for future use."
      },
      {
        "name": "sort",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the order in which to sort the associated listings in the response. If you precede the supplied value with a dash, the response is sorted in revers..."
      },
      {
        "name": "status",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter applies only to markdown discounts. It filters the response based on the indicated status of the discount. Note: Currently, the only sup..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_promotions",
    "description": "Note: As of July 8th 2024, promotions are now being referred to as discounts on Seller Hub and eBay help pages. Sell Marketing API documentation has been updated to reflect this product name change, but note that no API interface changes have been made. This method returns a list of a seller's undeleted discounts. The call returns up to 200 currently-available discounts on the specified marketp...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/promotion",
    "tokenKind": "user",
    "fields": [
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the maximum number of discounts returned on a page from the result set. Default: 200 Maximum: 200"
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This parameter specifies eBay marketplace ID of the site where the discount is hosted. See MarketplaceIdEnum for supported Marketplace ID values."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the number of discounts to skip in the result set before returning the first discount in the paginated response. Combine offset with the limit quer..."
      },
      {
        "name": "promotion_status",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This parameter specifies the discount state by which you want to filter the results. The response contains only those discounts that match the state you spec..."
      },
      {
        "name": "promotion_type",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This parameter specifies the campaign discounts type by which you want to filter the results. See PromotionTypeEnum for supported values."
      },
      {
        "name": "q",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A string consisting of one or more keywords . eBay filters the response by returning only the discounts that contain the supplied keywords in the title. Exam..."
      },
      {
        "name": "sort",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the order for how to sort the response. If you precede the supplied value with a dash, the response is sorted in reverse order. Example: sort=END_D..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_pause_promotion",
    "description": "Note: As of July 8th 2024, promotions are now being referred to as discounts on Seller Hub and eBay help pages. Sell Marketing API documentation has been updated to reflect this product name change, but note that no API interface changes have been made. This method pauses a currently-active (RUNNING) threshold discount and changes the state of the discount from RUNNING to PAUSED . Pausing a dis...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/promotion/{promotion_id}/pause",
    "tokenKind": "user",
    "fields": [
      {
        "name": "promotion_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter takes a concatenation of the ID of the active discount being paused plus the marketplace ID on which the discount is hosted. Concatenate..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_resume_promotion",
    "description": "Note: As of July 8th 2024, promotions are now being referred to as discounts on Seller Hub and eBay help pages. Sell Marketing API documentation has been updated to reflect this product name change, but note that no API interface changes have been made. This method restarts a threshold discount that was previously paused and changes the state of the discount from PAUSED to RUNNING . Only discou...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/promotion/{promotion_id}/resume",
    "tokenKind": "user",
    "fields": [
      {
        "name": "promotion_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter takes a concatenation of the ID of the paused discount being resumed with the listing set plus the marketplace ID on which the discount i..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_promotion_reports",
    "description": "Note: As of July 8th 2024, promotions are now being referred to as discounts on Seller Hub and eBay help pages. Sell Marketing API documentation has been updated to reflect this product name change, but note that no API interface changes have been made. This method generates a report that lists the seller's running, paused, and ended discounts for the specified eBay marketplace. The result set...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/promotion_report",
    "tokenKind": "user",
    "fields": [
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the maximum number of discounts returned on a page from the result set. Default: 200 Maximum: 200"
      },
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This parameter specifies the eBay marketplace ID of the site for which you want the discounts report. See MarketplaceIdEnum for supported Marketplace ID values."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the number of discounts to skip in the result set before returning the first discount in the paginated response. Combine offset with the limit quer..."
      },
      {
        "name": "promotion_status",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This parameter specifies the discount state by which you want to filter the results. See PromotionStatusEnum for supported values. Maximum number of input va..."
      },
      {
        "name": "promotion_type",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This parameter specifies the campaign discount type by which you want to filter the results. See PromotionTypeEnum for supported values."
      },
      {
        "name": "q",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "A string consisting of one or more keywords . eBay filters the response by returning only the discounts that contain the supplied keywords in the discount ti..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_promotion_summary_report",
    "description": "Note: As of July 8th 2024, promotions are now being referred to as discounts on Seller Hub and eBay help pages. Sell Marketing API documentation has been updated to reflect this product name change, but note that no API interface changes have been made. This method generates a report that summarizes the seller's discounts for the specified eBay marketplace. The report returns information on RUN...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/promotion_summary_report",
    "tokenKind": "user",
    "fields": [
      {
        "name": "marketplace_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This parameter specifies the eBay marketplace ID of the site for which you want a discount summary report. See MarketplaceIdEnum for supported Marketplace ID..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_email_campaigns",
    "description": "This method retrieves a list of email campaigns from a seller's eBay store. Users can filter the results by email campaign type , email campaign status , and marketplace ID using the q query parameter.",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/email_campaign",
    "tokenKind": "user",
    "fields": [
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The maximum number of email campaigns returned in a page. Min value : 1 Max value : 200"
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of results to skip in a pagination query. This value cannot be less than zero. Default value : 0"
      },
      {
        "name": "q",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This field contains filter criteria for the results returned. Filter by email campaign type , email campaign status , and marketplace ID . For example, setti..."
      },
      {
        "name": "sort",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The criteria for sorting email campaign results. See ItemSortEnum for sorting options and their enum values. Default : NEWLY_LISTED"
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_email_campaign",
    "description": "This method creates a new email campaign. An eBay store owner can create six different types of email campaigns: Welcome, New products & collections, Coupon, Sale event + markdown, Order discount, and Volume pricing. A successful createEmailCampaign request returns the emailCampaignId assigned to the new email campaign. The fields emailCampaignType , audienceCodes , itemSelectMode , subject , a...",
    "method": "POST",
    "host": "api",
    "path": "/sell/marketing/v1/email_campaign",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_email_campaign",
    "description": "This method returns the details of a single email campaign specified by the email_campaign_id path parameter. Call getEmailCampaigns to retrieve a list of all email campaigns from a seller's eBay store.",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/email_campaign/{email_campaign_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "email_campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier of the email campaign being retrieved. Use the getEmailCampaigns method to retrieve a list..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_update_email_campaign",
    "description": "This method lets users update an existing email campaign. Pass the emailCampaignId in the request URL and specify the changes to field values in the request payload. Note: You can only update the custom fields of an email campaign. Fixed values, such as the emailCampaignType , cannot be changed. For full specifications of fixed values for each email campaign type, see the createEmailCampaign me...",
    "method": "PUT",
    "host": "api",
    "path": "/sell/marketing/v1/email_campaign/{email_campaign_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "email_campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay assigned identifier for the email campaign being updated. Use the getEmailCampaigns method to retrieve a list o..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_delete_email_campaign",
    "description": "This method deletes the email campaign specified by the email_campaign_id path parameter. Call getEmailCampaigns to retrieve all of the seller's email campaigns. Use the email_campaign_id of the desired email campaign in the response as the path parameter for this request.",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/marketing/v1/email_campaign/{email_campaign_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "email_campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay-assigned identifier for the email campaign being deleted. You can retrieve the email campaign IDs for a specifi..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_audiences",
    "description": "This method retrieves all available email newsletter audiences for the email campaign type specified by the emailCampaignType path parameter. Use the optional limit and offset path parameters to paginate the results and to control which records are returned, respectively.",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/email_campaign/audience",
    "tokenKind": "user",
    "fields": [
      {
        "name": "emailCampaignType",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "The email campaign type to search against. See CampaignTypeEnum for the full list of available email campaign types and associated enum values."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The maximum number of audience groups returned per page in the results set. Min value : 1 Max value : 200 Default value : 100"
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of results to skip in a pagination query. This value cannot be less than 0. Default value : 0"
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_email_preview",
    "description": "This method returns a preview of the email sent by the email campaign indicated by the email_campaign_id path parameter. Call getEmailCampaigns to obtain a list of email campaigns. Use the emailCampaignId value of the desired email campaign as the email_campaign_id path parameter value. If this call is executed successfully, the response returns a content field that contains the raw HTML code o...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/email_campaign/{email_campaign_id}/email_preview",
    "tokenKind": "user",
    "fields": [
      {
        "name": "email_campaign_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique eBay assigned identifier for the email campaign associated with the preview being retrieved. Use the getEmailCampaig..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_email_report",
    "description": "This method returns the seller's email campaign performance report for a time period specified by the startDate and endDate path parameters. The maximum date range for a report retrieved by this method is one year. Note: The startDate and endDate must be given in UTC format, as shown in the following example: sell/marketing/v1/email_campaign/report?startDate=2022-11-01T19:09:02.768Z&endDate=202...",
    "method": "GET",
    "host": "api",
    "path": "/sell/marketing/v1/email_campaign/report",
    "tokenKind": "user",
    "fields": [
      {
        "name": "endDate",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "The end date for the report, given in UTC format. The maximum date range for a report retrieved by this method is one year."
      },
      {
        "name": "startDate",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "The start date for the report, given in UTC format. The maximum date range for a report retrieved by this method is one year."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_find_listing_recommendations",
    "description": "The find method currently returns information for a single recommendation type ( AD ) which contains information that sellers can use to configure Promoted Listings ad campaigns. The response from this method includes an array of the seller's listing IDs, where each element in the array contains recommendations related to the associated listing ID. For details on how to use this method, see Usi...",
    "method": "POST",
    "host": "api",
    "path": "/sell/recommendation/v1/find",
    "tokenKind": "user",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Provide a list of key-value pairs to specify the criteria you want to use to filter the response. In the list, separate each filter key from its associated v..."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Use this query parameter to set the maximum number of ads to return on a page from the paginated response. Default: 10 Maximum: 500"
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Specifies the number of ads to skip in the result set before returning the first ad in the paginated response. Combine offset with the limit query parameter..."
      }
    ],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_customer_service_metric",
    "description": "Use this method to retrieve a seller's performance and rating for the customer service metric. Control the response from the getCustomerServiceMetric method using the following path and query parameters: customer_service_metric_type controls the type of customer service transactions evaluated for the metric rating. evaluation_type controls the period you want to review. evaluation_marketplace_i...",
    "method": "GET",
    "host": "api",
    "path": "/sell/analytics/v1/customer_service_metric/{customer_service_metric_type}/{evaluation_type}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "customer_service_metric_type",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "Use this path parameter to specify the type of customer service metrics and benchmark data you want returned for the seller. Supported types are: ITEM_NOT_AS..."
      },
      {
        "name": "evaluation_marketplace_id",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "Use this query parameter to specify the Marketplace ID to evaluate for the customer service metrics and benchmark data. For the list of supported marketplace..."
      },
      {
        "name": "evaluation_type",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "Use this path parameter to specify the evaluation period to use for the performance metrics. See EvaluationTypeEnum for more information on the supported val..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_find_seller_standards_profiles",
    "description": "This call retrieves all the standards profiles for the associated seller. A standards profile is a set of eBay seller metrics and the seller's associated compliance values (either TOP_RATED , ABOVE_STANDARD , or BELOW_STANDARD ). A seller's multiple profiles are distinguished by two criteria, a \"program\" and a \"cycle.\" A profile's program is one of three regions where the seller may have done b...",
    "method": "GET",
    "host": "api",
    "path": "/sell/analytics/v1/seller_standards_profile",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_seller_standards_profile",
    "description": "This call retrieves a single standards profile for the associated seller. A standards profile is a set of eBay seller metrics and the seller's associated compliance values (either TOP_RATED , ABOVE_STANDARD , or BELOW_STANDARD ). A seller can have multiple profiles distinguished by two criteria, a \"program\" and a \"cycle.\" A profile's program is one of three regions where the seller may have don...",
    "method": "GET",
    "host": "api",
    "path": "/sell/analytics/v1/seller_standards_profile/{program}/{cycle}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "cycle",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is used to specify the cycle for which metrics and metadata will be retrieved. See CycleTypeEnum for a list of supported values."
      },
      {
        "name": "program",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter is used to specify the seller standards program for which metrics and metadata will be retrieved. See ProgramEnum for a list of supported..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_traffic_report",
    "description": "This method returns a report that details the user traffic received by a seller's listings. A traffic report gives sellers the ability to review how often their listings appeared on eBay, how many times their listings are viewed, and how many purchases were made. The report also returns the report's start and end dates, and the date the information was last updated. For more information, see Tr...",
    "method": "GET",
    "host": "api",
    "path": "/sell/analytics/v1/traffic_report",
    "tokenKind": "user",
    "fields": [
      {
        "name": "dimension",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the dimension , or \"attribute,\" that is applied to the report metric . Valid values: DAY or LISTING Examples If you specify di..."
      },
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter refines the information returned in the traffic report. Note: URL encode all the values you supply in the filter parameter. See URL enco..."
      },
      {
        "name": "metric",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the metrics you want covered in the report. Note: Unlike names for parameters and enumerated values, metric values are not cas..."
      },
      {
        "name": "sort",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter sorts the report on the specified metric. You can only specify a single metric in the sort parameter and the specified metric must be in..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_translate",
    "description": "This method translates listing title and listing description text from one language into another. For a full list of supported language translations, see the table .",
    "method": "POST",
    "host": "api",
    "path": "/commerce/translation/v1_beta/translate",
    "tokenKind": "application",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": true,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_user",
    "description": "This method retrieves the account profile information for an authenticated user, which requires a User access token . What is returned is controlled by the scopes . For a business account you use the default scope commerce.identity.readonly , which returns all the fields in the businessAccount container. These are returned because this is all public information. For an individual account, the f...",
    "method": "GET",
    "host": "apiz",
    "path": "/commerce/identity/v1/user/",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_actual_costs",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method is used to retrieve the actual weight and cost for one or more packages based on the provided input criteria. Responses can be filtered by the tracking_numbers query parameter. If this parameter is used, actual costs for each package associated with the provided tracking numbers are...",
    "method": "GET",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/actual_costs",
    "tokenKind": "user",
    "fields": [
      {
        "name": "tracking_numbers",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the tracking number(s) of the package(s) for which to retrieve the actual weight and cost. Tracking numbers are returned when..."
      },
      {
        "name": "trans_begin_time",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the start time of a transaction in UTC format. If the the trans_begin_time and trans_end_time query parameters are used, the a..."
      },
      {
        "name": "trans_end_time",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies ending time of a transaction in UTC format. If the the trans_begin_time and trans_end_time query parameters are used, the actu..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_address_preferences",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to retrieve information about all the ship-from and/or return addresses associated with a seller's eDIS account.",
    "method": "GET",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/address_preference",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_address_preference",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to create an address on your eDIS account. The following types of addresses can be created through this method: SHIP_FROM_ADDRESS RETURN_ADDRESS The address information for the address, including location details, contact information, and address type, must be provided i...",
    "method": "POST",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/address_preference",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_agents",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to retrieve information about the EU Authorized Representative (AR) agent(s) associated with a seller's eDIS account. An EU AR agent acts as a liaison between non-EU manufacturers and European regulatory authorities to ensure compliance with EU regulations. This method r...",
    "method": "GET",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/agents",
    "tokenKind": "user",
    "fields": [
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter sets the maximum number of agents to return on each page of the paginated response. Use this parameter in conjunction with the offset pa..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the number of agents to skip in the result set before returning the first agent in the paginated response. Combine offset with..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_battery_qualifications",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method is used to retrieve all battery qualifications associated with your eDIS account. This includes the type, electronic qualification ID and name, and expiration date for each battery.",
    "method": "GET",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/battery_qualifications",
    "tokenKind": "user",
    "fields": [
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter sets the maximum number of qualifications to return on each page of the paginated response. Use this parameter in conjunction with the o..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the number of qualifications to skip in the result set before returning the first qualification in the paginated response. Com..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_cancel_bundle",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method is used to cancel a bundle. The bundleId value of the bundle to be canceled must be input as a path parameter in the request. Note: Bundles cannot be canceled if they are currently being processed.",
    "method": "POST",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/bundle/{bundle_id}/cancel",
    "tokenKind": "user",
    "fields": [
      {
        "name": "bundle_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the bundle being canceled. This ID value is returned when creating a bundle through the createBundle m..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_bundle",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method is used to create a bundle for multiple packages in an order. To create a bundle, the consign address to be associated with the bundle and the tracking numbers of the packages to be used in the bundle must be specified in the request. If the call is successful, the bundleId for the...",
    "method": "POST",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/bundle",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_bundle",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method is used to retrieved information about a specific bundle based on the provided bundle ID value. The bundle_id value of the bundle to be retrieved must be input as a path parameter in the request. If the call is successful, information about the bundle is returned, such as its associ...",
    "method": "GET",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/bundle/{bundle_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "bundle_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the bundle being retrieved. This ID value is returned when creating a bundle through the createBundle..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_bundle_label",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to retrieve the bundle label for a bundle of packages. The bundle for which to retrieve a bundle label is specified through the bundleId path parameter. Bundle labels will be returned as base64 string values which can be converted to PDF files.",
    "method": "GET",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/bundle/{bundle_id}/label",
    "tokenKind": "user",
    "fields": [
      {
        "name": "bundle_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the bundle for which to retrieve a label. This ID value is returned when creating a bundle through the..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_complaint",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to create a complaint about a shipment order. Complaints can be filed if there is a pickup delay on an order or if an item has been lost in transit. The complaint reason, complaint type, and the date the issue occurred must be specified in the request. If the complaint i...",
    "method": "POST",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/complaint",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_consign_preferences",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to retrieve information about all the pickup, drop-off, and/or forward deployment consign addresses associated with a seller's eDIS account.",
    "method": "GET",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/consign_preference",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_consign_preference",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to create a consign address. The following types of address preferences can be created via this method: PICK_UP DROP_OFF FORWARD_DEPLOYMENT RDC CN_POST_DROP_OFF CN_POST_PICK_UP HK_POST_DROP_OFF The address information for the consign address must be provided in the consi...",
    "method": "POST",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/consign_preference",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_dropoff_sites",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to retrieve metadata for one or more drop-off sites associated with a seller's eDIS account. Pagination query parameters are provided that allow users to control how many drop-off site locations are returned in the response.",
    "method": "GET",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/dropoff_sites",
    "tokenKind": "user",
    "fields": [
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter sets the maximum number of drop-off site locations to return on each page of the paginated response. Use this parameter in conjunction w..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the number of drop-off site locations to skip in the result set before returning the first location in the paginated response...."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_handover_sheet",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to retrieve the handover sheet for one or more packages in a pickup request. The tracking numbers for the packages for which to retrieve handover sheets are specified through the tracking_numbers query parameter. The retrieved handover sheet will be returned as a base64...",
    "method": "GET",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/handover_sheet",
    "tokenKind": "user",
    "fields": [
      {
        "name": "tracking_numbers",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies an array of tracking numbers for the packages for which to retrieve a handover sheet. Tracking numbers are returned when creat..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_labels",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to retrieve shipping labels for the one or more specified packages. The packages for which to retrieve shipping labels can be specified through the tracking_numbers query parameter. The page size and print preference settings for the shipping label(s) can also be specifi...",
    "method": "GET",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/labels",
    "tokenKind": "user",
    "fields": [
      {
        "name": "page_size",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the page size of the retrieved shipping labels. Valid values : A4 THERMAL_PAPER"
      },
      {
        "name": "print_preference",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies one or more printing preferences to be set when retrieving shipping labels. Multiple values can be delimited by a comma. Valid..."
      },
      {
        "name": "tracking_numbers",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies an array of tracking numbers of the packages for which to retrieve shipping labels. Tracking numbers are returned when creatin..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_bulk_cancel_packages",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to cancel multiple packages and their associated tracking numbers. The package ID values for the packages to be canceled must be input in the packageIds array of the request. Note: Packages cannot be cancelled if they are currently being processed.",
    "method": "POST",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/package/bulk_cancel_packages",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_confirm_packages",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to confirm the shipping order for multiple packages. The package ID values for the packages to be confirmed must be input in the packageIds array of the request. After a package is confirmed, the estimated cost will be frozen in your wallet and the pickup request will be...",
    "method": "POST",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/package/bulk_confirm_packages",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_bulk_delete_packages",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to delete multiple packages. The package ID values for the packages to be deleted must be input in the packageIds array of the request. Note: Packages can only be deleted once they have been cancelled through the cancelPackage or bulkCancelPackages methods and no longer...",
    "method": "POST",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/package/bulk_delete_packages",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_cancel_package",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to cancel a package and its associated tracking number. The packageId value of the package to be canceled must be input as a path parameter in the request. Note: Packages cannot be canceled if they are currently being processed.",
    "method": "POST",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/package/{package_id}/cancel",
    "tokenKind": "user",
    "fields": [
      {
        "name": "package_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the package being canceled. This ID value is returned when creating a package through the createPackag..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_clone_package",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to clone a package for redelivery, resending the package with the same information input during the createPackage call. The packageId value of the package to be cloned must be input as a path parameter in the request.",
    "method": "POST",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/package/{package_id}/clone",
    "tokenKind": "user",
    "fields": [
      {
        "name": "package_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the packageId value of the package to be cloned. This ID value is returned when creating a package through the createPackage me..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_confirm_package",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to confirm the shipping order for a package. The packageId value of the package to be confirmed must be input as a path parameter in the request. After confirmation the estimated cost will be frozen in your wallet and the pickup request will be submitted.",
    "method": "POST",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/package/{package_id}/confirm",
    "tokenKind": "user",
    "fields": [
      {
        "name": "package_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the package you wish to be confirmed. This ID value is returned when creating a package through the cr..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_package",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to create a package for an order. To create a package, the package's shipping information, such as the dimensions, weight, ship from, and ship to address, as well as information about the item(s) it contains must be specified in the request. If the call is successful, th...",
    "method": "POST",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/package",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_package",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to retrieve a package based on the provided package ID value. The packageId value of the package to be retrieved must be input as a path parameter in the request. If the call is successful, information about the package is returned, such as the package's shipping informa...",
    "method": "GET",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/package/{package_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "package_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the package being retrieved. This ID value is returned when creating a package through the createPacka..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_delete_package",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to delete a package. The packageId value of the package to be deleted must be input as a path parameter in the request. If the call is successful, HTTP status code 204 No Content will be returned, and the package will be deleted. Note: Packages can only be deleted once t...",
    "method": "DELETE",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/package/{package_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "package_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the package being deleted. This package must already be cancelled and have no tracking number associat..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_packages_by_line_item_id",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to retrieve one or more packages based on the provided order line item ID. This method can be followed up with getPackage call to retrieve more detailed information about a specific package.",
    "method": "GET",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/package/{order_line_item_id}/item",
    "tokenKind": "user",
    "fields": [
      {
        "name": "order_line_item_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter can be used to specify the unique identifier of the line item that is part of the package being retrieved. This value is returned in the..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_services",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to retrieve metadata on available shipping services, such as the name, description, and directions.",
    "method": "GET",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/services",
    "tokenKind": "user",
    "fields": [
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter sets the maximum number of shipping services to return on each page of the paginated response. Use this parameter in conjunction with th..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the number of shipping services to skip in the result set before returning the first shipping service in the paginated respons..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_tracking",
    "description": "Important! This method is only available for Greater-China based sellers with an active eDIS account. This method can be used to retrieve tracking event details for a package associated with the provided tracking number. Each tracking event is returned in the trackingDetails array and includes the description, location, time, and status of the event.",
    "method": "GET",
    "host": "api",
    "path": "/sell/edelivery_international_shipping/v1/tracking",
    "tokenKind": "user",
    "fields": [
      {
        "name": "tracking_number",
        "kind": "string",
        "place": "query",
        "required": true,
        "description": "This query parameter specifies the tracking number for which to retrieve current tracking event details. This value is returned when creating a package throu..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_vero_reason_code",
    "description": "Important! You must be a member of the Verified Rights Owner (VeRO) Program to use this call. This method is used to retrieve the details of a specific VeRO reason code, including a description of the code and the marketplace associated with the code. The vero_reason_code_id of the VeRO reason code for which to retrieve details is required as a path parameter.",
    "method": "GET",
    "host": "api",
    "path": "/commerce/vero/v1/vero_reason_code/{vero_reason_code_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "vero_reason_code_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the VeRO reason code that is to be retrieved. Use the getVeroReasonCodes method to retrieve supported..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_vero_reason_codes",
    "description": "Important! You must be a member of the Verified Rights Owner (VeRO) Program to use this call. This method is used to retrieve the details of an array of VeRO reason codes. This information includes the descriptions of each code, as well as the marketplace associated with each code. If the X-EBAY-C-MARKETPLACE-ID header is present, only VeRO reason codes for that specific site will be returned....",
    "method": "GET",
    "host": "api",
    "path": "/commerce/vero/v1/vero_reason_code",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_create_vero_report",
    "description": "Important! You must be a member of the Verified Rights Owner (VeRO) Program to use this call. This method can be used to create a VeRO report for a listing. VeRO reports can be used to report items that your copyright, trademark, or other intellectual property rights. The itemId of the item being reported must be provided in the request, as well as the veroReasonCodeId of the claimed infringeme...",
    "method": "POST",
    "host": "api",
    "path": "/commerce/vero/v1/vero_report",
    "tokenKind": "user",
    "fields": [],
    "sendsDocument": true,
    "documentRequired": false,
    "contentType": "application/json"
  },
  {
    "toolName": "ebay_get_vero_report",
    "description": "Important! You must be a member of the Verified Rights Owner (VeRO) Program to use this call. This method can be used to retrieve status information about a VeRO report you have submitted to eBay for copyright, trademark, or other intellectual property rights infringement. The vero_report_id path parameter is used to specify the eBay report for which to retrieve status information.",
    "method": "GET",
    "host": "api",
    "path": "/commerce/vero/v1/vero_report/{vero_report_id}",
    "tokenKind": "user",
    "fields": [
      {
        "name": "includeItemDetails",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "Include this query and set it to true if you want to retrieve the reportedItemDetails container in the response, which contains item-level status information..."
      },
      {
        "name": "vero_report_id",
        "kind": "string",
        "place": "path",
        "required": true,
        "description": "This path parameter specifies the unique identifier of the VeRO report being retrieved. This value is returned when creating a VeRO report through the create..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  },
  {
    "toolName": "ebay_get_vero_report_items",
    "description": "Retrieves status for VERO infringement reports by Brand.",
    "method": "GET",
    "host": "api",
    "path": "/commerce/vero/v1/vero_report_items",
    "tokenKind": "user",
    "fields": [
      {
        "name": "filter",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter can be used to filter the result set by a date range. Only items reported within the specified time period will be returned. This parame..."
      },
      {
        "name": "itemId",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "This query parameter specifies the unique identifier of an eBay listing. Only the specified reported item will be returned."
      },
      {
        "name": "limit",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The maximum number of entries that can be returned on each page of the paginated response. Use this parameter in conjunction with the offset parameter to con..."
      },
      {
        "name": "offset",
        "kind": "string",
        "place": "query",
        "required": false,
        "description": "The number of reports to skip in the result set before returning the first report in the paginated response. Combine offset with the limit query parameter to..."
      }
    ],
    "sendsDocument": false,
    "documentRequired": false,
    "contentType": null
  }
] satisfies EbayRoute[];
