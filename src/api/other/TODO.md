# Other APIs

## Completed

### VERO API (`vero.ts`) - ✅ All endpoints implemented (v1.1.5)

- [x] `createVeroReport` - Create VERO report for IP infringement
- [x] `getVeroReport` - Get specific VERO report by ID
- [x] `getVeroReportItems` - Get all report items with pagination
- [x] `getVeroReasonCode` - Get specific reason code by ID
- [x] `getVeroReasonCodes` - Get all available reason codes
- [x] Unit tests added
- [x] MCP tools added (5 tools)
- [x] Zod schemas added

## Missing Endpoints

### eDelivery API (`edelivery.ts`)

The following 24 endpoint methods need to be implemented based on the OpenAPI spec at `docs/sell-apps/other-apis/sell_edelivery_international_shipping_oas3.json`:

**Cost & Preferences:**

- [ ] `getActualCosts` - GET /actual_costs
- [ ] `getAddressPreferences` - GET /address_preference
- [ ] `createAddressPreference` - POST /address_preference
- [ ] `getConsignPreferences` - GET /consign_preference
- [ ] `createConsignPreference` - POST /consign_preference

**Agents & Services:**

- [ ] `getAgents` - GET /agents
- [ ] `getBatteryQualifications` - GET /battery_qualifications
- [ ] `getDropoffSites` - GET /dropoff_sites
- [ ] `getShippingServices` - GET /services

**Bundles:**

- [ ] `createBundle` - POST /bundle
- [ ] `getBundle` - GET /bundle/{bundle_id}
- [ ] `cancelBundle` - POST /bundle/{bundle_id}/cancel
- [ ] `getBundleLabel` - GET /bundle/{bundle_id}/label

**Packages (Single):**

- [ ] `createPackage` - POST /package
- [ ] `getPackage` - GET /package/{package_id}
- [ ] `deletePackage` - DELETE /package/{package_id}
- [ ] `getPackageByOrderLineItem` - GET /package/{order_line_item_id}/item
- [ ] `cancelPackage` - POST /package/{package_id}/cancel
- [ ] `clonePackage` - POST /package/{package_id}/clone
- [ ] `confirmPackage` - POST /package/{package_id}/confirm

**Packages (Bulk):**

- [ ] `bulkCancelPackages` - POST /package/bulk_cancel_packages
- [ ] `bulkConfirmPackages` - POST /package/bulk_confirm_packages
- [ ] `bulkDeletePackages` - POST /package/bulk_delete_packages

**Labels & Tracking:**

- [ ] `getLabels` - GET /labels
- [ ] `getHandoverSheet` - GET /handover_sheet
- [ ] `getTracking` - GET /tracking

**Other:**

- [ ] `createComplaint` - POST /complaint

**Note:** Existing `createShippingQuote` and `getShippingQuote` are NOT part of the eDelivery spec above. They appear to be from a different API version or spec file.

## Future Improvements

- **eDelivery Implementation:** Complete the 24 missing endpoints listed above
- **Testing:** Add unit tests for all eDelivery endpoints
- **MCP Tools:** Add tool definitions and Zod schemas for eDelivery endpoints
