# Last Modified: Monday, November 10, 2025

# eBay API MCP Server

Model Context Protocol (MCP) server for eBay Sell APIs. Provides AI assistants with access to eBay's seller functionality including inventory management, order fulfillment, marketing campaigns, and account configuration.

## Features

This MCP server provides comprehensive access to eBay Sell APIs:

- **Account Management**: Configure seller policies, payment/return/fulfillment policies
- **Inventory Management**: Create and manage inventory items and offers
- **Order Management**: Process orders, create shipping fulfillments, issue refunds
- **Marketing**: Manage marketing campaigns and promotions
- **Analytics**: Access sales and traffic reports, seller standards profiles
- **And more**: See the "Available Tools" section below for a complete list.

## Prerequisites

- **Node.js 18 or higher**
- **eBay Developer account** with API credentials from the [eBay Developer Portal](https://developer.ebay.com/my/keys)

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd ebay-api-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### 2. Configuration

Create a `.env` file with your eBay API credentials:

```env
EBAY_CLIENT_ID=your_client_id_here
EBAY_CLIENT_SECRET=your_client_secret_here
EBAY_ENVIRONMENT=sandbox  # or 'production'
```

### 3. Run the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

## Available Tools

This MCP server exposes the following tools:

### General Tools

| Tool | Supported AI |
|---|---|
| `search` | ChatGPT, Claude, Claude Code |
| `fetch` | ChatGPT, Claude, Claude Code |
| `ebay_get_oauth_url` | Claude, Claude Code |
| `ebay_set_user_tokens` | Claude, Claude Code |
| `ebay_get_token_status` | Claude, Claude Code |
| `ebay_clear_tokens` | Claude, Claude Code |

### Account API
- `ebay_get_custom_policies`
- `ebay_get_fulfillment_policies`
- `ebay_get_payment_policies`
- `ebay_get_return_policies`
- `ebay_create_fulfillment_policy`
- `ebay_get_fulfillment_policy`
- `ebay_get_fulfillment_policy_by_name`
- `ebay_update_fulfillment_policy`
- `ebay_delete_fulfillment_policy`
- `ebay_create_payment_policy`
- `ebay_get_payment_policy`
- `ebay_get_payment_policy_by_name`
- `ebay_update_payment_policy`
- `ebay_delete_payment_policy`
- `ebay_create_return_policy`
- `ebay_get_return_policy`
- `ebay_get_return_policy_by_name`
- `ebay_update_return_policy`
- `ebay_delete_return_policy`
- `ebay_create_custom_policy`
- `ebay_get_custom_policy`
- `ebay_update_custom_policy`
- `ebay_delete_custom_policy`
- `ebay_get_kyc`
- `ebay_opt_in_to_payments_program`
- `ebay_get_payments_program_status`
- `ebay_get_rate_tables`
- `ebay_create_or_replace_sales_tax`
- `ebay_bulk_create_or_replace_sales_tax`
- `ebay_delete_sales_tax`
- `ebay_get_sales_tax`
- `ebay_get_sales_taxes`
- `ebay_get_subscription`
- `ebay_opt_in_to_program`
- `ebay_opt_out_of_program`
- `ebay_get_opted_in_programs`

### Inventory API
- `ebay_get_inventory_items`
- `ebay_get_inventory_item`
- `ebay_create_inventory_item`
- `ebay_get_offers`
- `ebay_create_offer`
- `ebay_publish_offer`
- `ebay_bulk_create_or_replace_inventory_item`
- `ebay_bulk_get_inventory_item`
- `ebay_bulk_update_price_quantity`
- `ebay_get_product_compatibility`
- `ebay_create_or_replace_product_compatibility`
- `ebay_delete_product_compatibility`
- `ebay_get_inventory_item_group`
- `ebay_create_or_replace_inventory_item_group`
- `ebay_delete_inventory_item_group`
- `ebay_get_inventory_locations`
- `ebay_get_inventory_location`
- `ebay_create_or_replace_inventory_location`
- `ebay_delete_inventory_location`
- `ebay_disable_inventory_location`
- `ebay_enable_inventory_location`
- `ebay_update_location_details`
- `ebay_get_offer`
- `ebay_update_offer`
- `ebay_delete_offer`
- `ebay_withdraw_offer`
- `ebay_bulk_create_offer`
- `ebay_bulk_publish_offer`
- `ebay_get_listing_fees`
- `ebay_bulk_migrate_listing`

### Fulfillment API
- `ebay_get_orders`
- `ebay_get_order`
- `ebay_create_shipping_fulfillment`
- `ebay_issue_refund`

### Marketing API
- `ebay_get_campaigns`
- `ebay_get_campaign`
- `ebay_pause_campaign`
- `ebay_resume_campaign`
- `ebay_end_campaign`
- `ebay_update_campaign_identification`
- `ebay_clone_campaign`
- `ebay_get_promotions`
- `ebay_find_listing_recommendations`

### Analytics API
- `ebay_get_traffic_report`
- `ebay_find_seller_standards_profiles`
- `ebay_get_seller_standards_profile`
- `ebay_get_customer_service_metric`

### Metadata API
- `ebay_get_automotive_parts_compatibility_policies`
- `ebay_get_category_policies`
- `ebay_get_extended_producer_responsibility_policies`
- `ebay_get_hazardous_materials_labels`
- `ebay_get_item_condition_policies`
- `ebay_get_listing_structure_policies`
- `ebay_get_negotiated_price_policies`
- `ebay_get_product_safety_labels`
- `ebay_get_regulatory_policies`
- `ebay_get_shipping_cost_type_policies`
- `ebay_get_classified_ad_policies`
- `ebay_get_currencies`
- `ebay_get_listing_type_policies`
- `ebay_get_motors_listing_policies`
- `ebay_get_shipping_policies`
- `ebay_get_site_visibility_policies`
- `ebay_get_compatibilities_by_specification`
- `ebay_get_compatibility_property_names`
- `ebay_get_compatibility_property_values`
- `ebay_get_multi_compatibility_property_values`
- `ebay_get_product_compatibilities`
- `ebay_get_sales_tax_jurisdictions`

### Taxonomy API
- `ebay_get_default_category_tree_id`
- `ebay_get_category_tree`
- `ebay_get_category_suggestions`
- `ebay_get_item_aspects_for_category`

### Communication API
- `ebay_get_offers_to_buyers`
- `ebay_send_offer_to_interested_buyers`
- `ebay_search_messages`

## Endpoint Status

| Endpoint | Last Updated | Production Ready | Tested |
|---|---|---|---|
| Account | 2025-11-10 | Yes | No |
| Inventory | 2025-11-10 | Yes | No |
| Fulfillment | 2025-11-10 | Yes | No |
| Marketing | 2025-11-10 | Yes | No |
| Analytics | 2025-11-10 | Yes | No |
| Metadata | 2025-11-10 | Yes | No |
| Taxonomy | 2025-11-10 | Yes | No |
| Communication | 2025-11-10 | Yes | No |

## Development

```bash
# Type check
npm run typecheck

# Watch mode for development
npm run watch

# Clean build artifacts
npm run clean

# Rebuild
npm run build
```

## Project Structure

```
src/
├── api/                          # eBay API client implementations
├── auth/                         # OAuth authentication
├── config/                       # Configuration management
├── tools/                        # MCP tool definitions
├── types/                        # TypeScript type definitions
└── index.ts                      # MCP server entrypoint
```

## Resources

- **eBay Developer Program**: https://developer.ebay.com/
- **eBay API Documentation**: https://developer.ebay.com/docs
- **Model Context Protocol**: https://modelcontextprotocol.io/

## Contributing

Contributions are welcome! Please ensure:
- All API implementations match OpenAPI specifications in `docs/` folder
- TypeScript strict mode compliance
- Proper error handling
- Tool definitions follow MCP specification

## Gemini CLI Setup

To add a custom Model Context Protocol (MCP) server to Gemini CLI, follow these steps:

### 1. Locate or Create the `settings.json` file:

The Gemini CLI uses a `settings.json` file for configuration. This file is typically located in your home directory within a hidden `.gemini` folder: `~/.gemini/settings.json`.
If the `.gemini` directory or `settings.json` file does not exist, create them.

### 2. Edit `settings.json` to configure the MCP server:

Open the `settings.json` file in a text editor.
Add or modify the `mcpServers` object within this JSON file. Each custom MCP server will be an entry within this object.
The configuration for each server will vary depending on the server's requirements, but generally includes details like the server's `command`, `args`, and any necessary authentication tokens or specific parameters.

```json
{
  "mcpServers": {
    "myCustomServerName": {
      "command": "path/to/your/server/executable",
      "args": ["--arg1", "value1", "--arg2", "value2"],
      "env": {
        "API_KEY": "your_api_key"
      }
    },
    "anotherMCPserver": {
      "command": "npx",
      "args": ["-y", "some-mcp-package@latest", "mcp-command"]
    }
  }
}
```

Replace `"myCustomServerName"` with a descriptive name for your server.
Adjust the `command`, `args`, and `env` (for environment variables) according to your specific MCP server's documentation and requirements.

### 3. Install any dependencies:

Ensure that any required dependencies for your custom MCP server are installed on your system.

### 4. Restart Gemini CLI or refresh MCP servers:

After saving the `settings.json` file, restart the Gemini CLI session for the changes to take effect.
Alternatively, if Gemini CLI is already running, you can use the `/mcp refresh` command within the CLI to reload the server configurations.

### 5. Verify the server connection:

Once Gemini CLI has restarted or the MCP servers have been refreshed, use the `/mcp` command within the CLI to list the configured servers and verify that your custom server is recognized and available.
You can also use `/mcp desc <serverName>` to see detailed information about the tools provided by your custom server.

## License

MIT
