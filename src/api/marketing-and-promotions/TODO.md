# Marketing and Promotions API - TODO

This file outlines the tasks for completing the implementation of the Marketing and Promotions API.

## Missing Endpoints

The following endpoints are defined in the OpenAPI specification but are not yet implemented in the server:

### Marketing
- `POST /ad_campaign/{campaign_id}/bulk_create_ads_by_inventory_reference`
- `POST /ad_campaign/{campaign_id}/bulk_create_ads_by_listing_id`
- `POST /ad_campaign/{campaign_id}/bulk_delete_ads_by_inventory_reference`
- `POST /ad_campaign/{campaign_id}/bulk_delete_ads_by_listing_id`
- `POST /ad_campaign/{campaign_id}/bulk_update_ads_bid_by_inventory_reference`
- `POST /ad_campaign/{campaign_id}/bulk_update_ads_bid_by_listing_id`
- `POST /ad_campaign/{campaign_id}/bulk_update_ads_status`
- `POST /ad_campaign/{campaign_id}/bulk_update_ads_status_by_listing_id`
- `GET /ad_campaign/{campaign_id}/ad` - **IMPLEMENTED**
- `POST /ad_campaign/{campaign_id}/ad` - **IMPLEMENTED**
- `POST /ad_campaign/{campaign_id}/create_ads_by_inventory_reference` - **IMPLEMENTED**
- `GET /ad_campaign/{campaign_id}/ad/{ad_id}` - **IMPLEMENTED**
- `DELETE /ad_campaign/{campaign_id}/ad/{ad_id}` - **IMPLEMENTED**
- `POST /ad_campaign/{campaign_id}/ad/{ad_id}/clone` - **IMPLEMENTED**
- `GET /ad_campaign/get_ads_by_inventory_reference` - **IMPLEMENTED**
- `GET /ad_campaign/get_ads_by_listing_id` - **IMPLEMENTED**
- `POST /ad_campaign/{campaign_id}/update_bid` - **IMPLEMENTED**
- `POST /ad_campaign/clone` - **IMPLEMENTED**
- `POST /ad_campaign/{campaign_id}/end` - **IMPLEMENTED**
- `GET /ad_campaign_by_name` - **IMPLEMENTED**
- `POST /ad_campaign/{campaign_id}/pause`
- `POST /ad_campaign/{campaign_id}/resume`
- `PUT /ad_campaign/{campaign_id}/update_campaign_identification`
- `POST /ad_group`
- `POST /ad_group/{ad_group_id}/clone_ad_group`
- `GET /ad_group`
- `GET /ad_group/{ad_group_id}`
- `POST /ad_group/{ad_group_id}/suggest_bids`
- `POST /ad_group/{ad_group_id}/update_ad_group_bids`
- `POST /ad_group/{ad_group_id}/update_ad_group_keywords`
- `POST /ad_group/{ad_group_id}/suggest_keywords`
- `GET /ad_group/{ad_group_id}/keyword`
- `POST /ad_group/{ad_group_id}/bulk_create_keywords`
- `POST /ad_group/{ad_group_id}/bulk_delete_keywords`
- `POST /ad_group/{ad_group_id}/bulk_update_keyword_bids`
- `POST /ad_group/{ad_group_id}/create_keyword`
- `GET /ad_group/{ad_group_id}/keyword/{keyword_id}`
- `DELETE /ad_group/{ad_group_id}/keyword/{keyword_id}`
- `POST /ad_group/{ad_group_id}/keyword/{keyword_id}/update_bid`
- `GET /ad_report`
- `GET /ad_report_metadata`
- `GET /ad_report_metadata/{report_type}`
- `POST /ad_report_task`
- `GET /ad_report_task`
- `GET /ad_report_task/{report_task_id}`
- `GET /item_promotion/{promotion_id}`
- `DELETE /item_promotion/{promotion_id}`
- `POST /item_promotion/{promotion_id}/pause`
- `POST /item_promotion/{promotion_id}/resume`
- `PUT /item_promotion/{promotion_id}`
- `GET /promotion_report`
- `GET /promotion_summary_report`
- `GET /ad_campaign/{campaign_id}/targeting`
- `POST /ad_campaign/{campaign_id}/targeting`
- `PUT /ad_campaign/{campaign_id}/targeting`
- `GET /ad_campaign/{campaign_id}/negative_keyword`
- `POST /ad_campaign/{campaign_id}/negative_keyword`
- `POST /ad_campaign/{campaign_id}/bulk_create_negative_keywords`
- `POST /ad_campaign/{campaign_id}/bulk_delete_negative_keywords`
- `POST /ad_campaign/{campaign_id}/bulk_update_negative_keywords`
- `GET /ad_campaign/{campaign_id}/negative_keyword/{negative_keyword_id}`
- `DELETE /ad_campaign/{campaign_id}/negative_keyword/{negative_keyword_id}`
- `PUT /ad_campaign/{campaign_id}/negative_keyword/{negative_keyword_id}`
- `GET /ad_group/{ad_group_id}/negative_keyword`
- `POST /ad_group/{ad_group_id}/negative_keyword`
- `POST /ad_group/{ad_group_id}/bulk_create_negative_keywords`
- `POST /ad_group/{ad_group_id}/bulk_delete_negative_keywords`
- `POST /ad_group/{ad_group_id}/bulk_update_negative_keywords`
- `GET /ad_group/{ad_group_id}/negative_keyword/{negative_keyword_id}`
- `DELETE /ad_group/{ad_group_id}/negative_keyword/{negative_keyword_id}`
- `PUT /ad_group/{ad_group_id}/negative_keyword/{negative_keyword_id}`

### Recommendation
- All endpoints are implemented.

## Improvements

- **Input Validation:** Add input validation to all endpoints to ensure that the data sent by the AI client is valid.
- **Error Handling:** Improve error handling to provide more detailed and structured error messages to the AI client.
- **Testing:** Add unit tests for all endpoints.
