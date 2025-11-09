# Listing Management API - TODO

This file outlines the tasks for completing the implementation of the Listing Management API.

## Missing Endpoints

The following endpoints are defined in the OpenAPI specification but are not yet implemented in the server:

### Inventory Item
- `POST /bulk_create_or_replace_inventory_item` - Bulk create or replace inventory items
- `POST /bulk_get_inventory_item` - Bulk get inventory items
- `POST /bulk_update_price_quantity` - Bulk update price and quantity

### Inventory Item Group
- `PUT /inventory_item_group/{inventoryItemGroupKey}` - Create or replace an inventory item group
- `DELETE /inventory_item_group/{inventoryItemGroupKey}` - Delete an inventory item group
- `GET /inventory_item_group/{inventoryItemGroupKey}` - Get an inventory item group

### Location
- `POST /location` - Create an inventory location
- `DELETE /location/{merchantLocationKey}` - Delete an inventory location
- `POST /location/{merchantLocationKey}/disable` - Disable an inventory location
- `POST /location/{merchantLocationKey}/enable` - Enable an inventory location
- `GET /location` - Get all inventory locations
- `GET /location/{merchantLocationKey}` - Get an inventory location
- `PUT /location/{merchantLocationKey}` - Update an inventory location

### Offer
- `POST /bulk_create_offer` - Bulk create offers
- `POST /bulk_publish_offer` - Bulk publish offers
- `GET /offer/{offerId}` - Get a specific offer
- `PUT /offer/{offerId}` - Update an offer
- `DELETE /offer/{offerId}` - Delete an offer
- `POST /offer/{offerId}/withdraw` - Withdraw an offer
- `POST /publish_by_inventory_item_group` - Publish offers by inventory item group
- `POST /withdraw_by_inventory_item_group` - Withdraw offers by inventory item group
- `POST /get_listing_fees` - Get listing fees

### Product Compatibility
- `PUT /inventory_item/{sku}/product_compatibility` - Create or replace product compatibility
- `DELETE /inventory_item/{sku}/product_compatibility` - Delete product compatibility
- `GET /inventory_item/{sku}/product_compatibility` - Get product compatibility

### Other
- `POST /bulk_migrate_listing` - Bulk migrate listings
- `GET /listing/{listing_id}/get_listing_by_legacy_id` - Get listing by legacy ID

## Improvements

- **Input Validation:** Add input validation to all endpoints to ensure that the data sent by the AI client is valid.
- **Error Handling:** Improve error handling to provide more detailed and structured error messages to the AI client.
- **Testing:** Add unit tests for all endpoints.
- **Placeholder APIs:** The `feedAPI`, `mediaAPI`, `merchantIntegrationPlatform`, `storesAPI`, and `traditionalListingAPI` are all placeholders. These APIs need to be fully implemented.
