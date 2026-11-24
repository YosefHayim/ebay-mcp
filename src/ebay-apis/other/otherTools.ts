import {
	bundleIdInputSchema,
	createVeroReportInputSchema,
	edeliveryBodyInputSchema,
	edeliveryPaginationInputSchema,
	getActualCostsInputSchema,
	getAddressPreferencesInputSchema,
	getConsignPreferencesInputSchema,
	getHandoverSheetInputSchema,
	getLabelsInputSchema,
	getPackagesByLineItemIDInputSchema,
	getTrackingInputSchema,
	getUserInputSchema,
	getVeroReasonCodeInputSchema,
	getVeroReasonCodesInputSchema,
	getVeroReportInputSchema,
	getVeroReportItemsInputSchema,
	packageIdInputSchema,
	translateInputSchema,
} from "@/ebay-apis/other/otherApisSchemas.js";
import { defined } from "@/shared/objects.js";
import { defineTool } from "@/tool-registry/defineTool.js";
import type { ToolEntry } from "@/tool-registry/registry.js";

export const otherEntries: ToolEntry[] = [
	// Identity API
	defineTool({
		name: "ebay_get_user",
		description: "Get user identity information",
		inputSchema: getUserInputSchema.shape,
		handler: (api, args) => api.identity.getUser(args),
	}),
	// VERO API
	defineTool({
		name: "ebay_create_vero_report",
		description:
			"Create a VERO report to report intellectual property infringement. This endpoint is part of the Verified Rights Owner (VeRO) Program and allows rights owners to report listings that infringe on their intellectual property.",
		inputSchema: createVeroReportInputSchema.shape,
		handler: (api, args) => api.vero.createVeroReport(args),
	}),
	defineTool({
		name: "ebay_get_vero_report",
		description: "Get a specific VERO report by ID",
		inputSchema: getVeroReportInputSchema.shape,
		handler: (api, args) => api.vero.getVeroReport(args),
	}),
	defineTool({
		name: "ebay_get_vero_report_items",
		description:
			"Get VERO report items (listings reported for intellectual property infringement). Supports filtering, pagination via limit and offset parameters.",
		inputSchema: getVeroReportItemsInputSchema.shape,
		handler: (api, args) => api.vero.getVeroReportItems(args),
	}),
	defineTool({
		name: "ebay_get_vero_reason_code",
		description:
			"Get a specific VERO reason code by ID. Reason codes categorize the types of intellectual property violations.",
		inputSchema: getVeroReasonCodeInputSchema.shape,
		handler: (api, args) => api.vero.getVeroReasonCode(args),
	}),
	defineTool({
		name: "ebay_get_vero_reason_codes",
		description:
			"Get all available VERO reason codes. These codes are used when creating VERO reports to specify the type of intellectual property violation.",
		inputSchema: getVeroReasonCodesInputSchema.shape,
		handler: (api, args) => api.vero.getVeroReasonCodes(args),
	}),
	// Translation API
	defineTool({
		name: "ebay_translate",
		description: "Translate listing text",
		inputSchema: translateInputSchema.shape,
		handler: (api, args) =>
			api.translation.translate({
				text: args.text,
				to: args.to,
				...defined({
					from: args.from,
					translationContext: args.translationContext,
				}),
			}),
	}),
	// eDelivery API - Cost & Preferences
	defineTool({
		name: "ebay_get_actual_costs",
		description: "Get actual costs for shipped packages",
		inputSchema: getActualCostsInputSchema.shape,
		handler: (api, args) =>
			api.edelivery.getActualCosts(
				defined({
					trackingNumbers: args.trackingNumbers,
					transactionBeginTime: args.transactionBeginTime,
					transactionEndTime: args.transactionEndTime,
				}),
			),
	}),
	defineTool({
		name: "ebay_get_address_preferences",
		description: "Get address preferences for international shipping",
		inputSchema: getAddressPreferencesInputSchema.shape,
		handler: (api, args) => api.edelivery.getAddressPreferences(args),
	}),
	defineTool({
		name: "ebay_create_address_preference",
		description: "Create an address preference for international shipping",
		inputSchema: edeliveryBodyInputSchema.shape,
		handler: (api, args) => api.edelivery.createAddressPreference(args),
	}),
	defineTool({
		name: "ebay_get_consign_preferences",
		description: "Get consign preferences for international shipping",
		inputSchema: getConsignPreferencesInputSchema.shape,
		handler: (api, args) => api.edelivery.getConsignPreferences(args),
	}),
	defineTool({
		name: "ebay_create_consign_preference",
		description: "Create a consign preference for international shipping",
		inputSchema: edeliveryBodyInputSchema.shape,
		handler: (api, args) => api.edelivery.createConsignPreference(args),
	}),
	// eDelivery API - Agents & Services
	defineTool({
		name: "ebay_get_agents",
		description: "Get available shipping agents for international shipping",
		inputSchema: edeliveryPaginationInputSchema.shape,
		handler: (api, args) =>
			api.edelivery.getAgents(
				defined({ limit: args.limit, offset: args.offset }),
			),
	}),
	defineTool({
		name: "ebay_get_battery_qualifications",
		description: "Get battery qualifications for international shipping",
		inputSchema: edeliveryPaginationInputSchema.shape,
		handler: (api, args) =>
			api.edelivery.getBatteryQualifications(
				defined({ limit: args.limit, offset: args.offset }),
			),
	}),
	defineTool({
		name: "ebay_get_dropoff_sites",
		description: "Get available dropoff sites for international shipping",
		inputSchema: edeliveryPaginationInputSchema.shape,
		handler: (api, args) =>
			api.edelivery.getDropoffSites(
				defined({ limit: args.limit, offset: args.offset }),
			),
	}),
	defineTool({
		name: "ebay_get_services",
		description: "Get available shipping services for international shipping",
		inputSchema: edeliveryPaginationInputSchema.shape,
		handler: (api, args) =>
			api.edelivery.getServices(
				defined({ limit: args.limit, offset: args.offset }),
			),
	}),
	// eDelivery API - Bundles
	defineTool({
		name: "ebay_create_bundle",
		description: "Create a bundle of packages for international shipping",
		inputSchema: edeliveryBodyInputSchema.shape,
		handler: (api, args) => api.edelivery.createBundle(args),
	}),
	defineTool({
		name: "ebay_get_bundle",
		description: "Get bundle details by ID",
		inputSchema: bundleIdInputSchema.shape,
		handler: (api, args) => api.edelivery.getBundle(args),
	}),
	defineTool({
		name: "ebay_cancel_bundle",
		description: "Cancel a bundle by ID",
		inputSchema: bundleIdInputSchema.shape,
		handler: (api, args) => api.edelivery.cancelBundle(args),
	}),
	defineTool({
		name: "ebay_get_bundle_label",
		description: "Get shipping label for a bundle",
		inputSchema: bundleIdInputSchema.shape,
		handler: (api, args) => api.edelivery.getBundleLabel(args),
	}),
	// eDelivery API - Packages (Single)
	defineTool({
		name: "ebay_create_package",
		description: "Create a package for international shipping",
		inputSchema: edeliveryBodyInputSchema.shape,
		handler: (api, args) => api.edelivery.createPackage(args),
	}),
	defineTool({
		name: "ebay_get_package",
		description: "Get package details by ID",
		inputSchema: packageIdInputSchema.shape,
		handler: (api, args) => api.edelivery.getPackage(args),
	}),
	defineTool({
		name: "ebay_delete_package",
		description: "Delete a package by ID",
		inputSchema: packageIdInputSchema.shape,
		handler: (api, args) => api.edelivery.deletePackage(args),
	}),
	defineTool({
		name: "ebay_get_packages_by_line_item_id",
		description: "Get package details by order line item ID",
		inputSchema: getPackagesByLineItemIDInputSchema.shape,
		handler: (api, args) => api.edelivery.getPackagesByLineItemID(args),
	}),
	defineTool({
		name: "ebay_cancel_package",
		description: "Cancel a package by ID",
		inputSchema: packageIdInputSchema.shape,
		handler: (api, args) => api.edelivery.cancelPackage(args),
	}),
	defineTool({
		name: "ebay_clone_package",
		description: "Clone a package to create a duplicate",
		inputSchema: packageIdInputSchema.shape,
		handler: (api, args) => api.edelivery.clonePackage(args),
	}),
	defineTool({
		name: "ebay_confirm_package",
		description: "Confirm a package for shipping",
		inputSchema: packageIdInputSchema.shape,
		handler: (api, args) => api.edelivery.confirmPackage(args),
	}),
	// eDelivery API - Packages (Bulk)
	defineTool({
		name: "ebay_bulk_cancel_packages",
		description: "Cancel multiple packages in one request",
		inputSchema: edeliveryBodyInputSchema.shape,
		handler: (api, args) => api.edelivery.bulkCancelPackages(args),
	}),
	defineTool({
		name: "ebay_bulk_confirm_packages",
		description: "Confirm multiple packages in one request",
		inputSchema: edeliveryBodyInputSchema.shape,
		handler: (api, args) => api.edelivery.bulkConfirmPackages(args),
	}),
	defineTool({
		name: "ebay_bulk_delete_packages",
		description: "Delete multiple packages in one request",
		inputSchema: edeliveryBodyInputSchema.shape,
		handler: (api, args) => api.edelivery.bulkDeletePackages(args),
	}),
	// eDelivery API - Labels & Tracking
	defineTool({
		name: "ebay_get_labels",
		description: "Get shipping labels for packages",
		inputSchema: getLabelsInputSchema.shape,
		handler: (api, args) =>
			api.edelivery.getLabels({
				trackingNumbers: args.trackingNumbers,
				...defined({
					pageSize: args.pageSize,
					printPreference: args.printPreference,
				}),
			}),
	}),
	defineTool({
		name: "ebay_get_handover_sheet",
		description: "Get handover sheet for packages",
		inputSchema: getHandoverSheetInputSchema.shape,
		handler: (api, args) => api.edelivery.getHandoverSheet(args),
	}),
	defineTool({
		name: "ebay_get_tracking",
		description: "Get tracking information for packages",
		inputSchema: getTrackingInputSchema.shape,
		handler: (api, args) => api.edelivery.getTracking(args),
	}),
	// eDelivery API - Other
	defineTool({
		name: "ebay_create_complaint",
		description: "Create a complaint for international shipping issues",
		inputSchema: edeliveryBodyInputSchema.shape,
		outputSchema: {
			type: "object",
			properties: {},
			description: "Success response",
		},
		handler: (api, args) => api.edelivery.createComplaint(args),
	}),
];
