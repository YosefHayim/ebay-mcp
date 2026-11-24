import {
	findSellerStandardsProfilesInputSchema,
	getCustomerServiceMetricInputSchema,
	getSellerStandardsProfileInputSchema,
	getTrafficReportInputSchema,
} from "@/ebay-apis/analytics/analyticsSchemas.js";
import { defineTool } from "@/tool-registry/defineTool.js";
import type { ToolEntry } from "@/tool-registry/registry.js";
import {
	mapCustomerServiceMetricToChart,
	mapStandardsProfileToCard,
	mapTrafficReportToChart,
} from "@/tool-registry/ui/maps.js";

export const analyticsEntries: ToolEntry[] = [
	defineTool({
		name: "ebay_get_traffic_report",
		description: "Get traffic report for listings",
		inputSchema: getTrafficReportInputSchema.shape,
		outputSchema: {
			type: "object",
			properties: {
				records: { type: "array" },
				warnings: { type: "array" },
			},
			description: "Traffic report data",
		},
		handler: (api, args) => api.analytics.getTrafficReport(args),
		ui: { archetype: "chart", map: mapTrafficReportToChart },
	}),
	defineTool({
		name: "ebay_find_seller_standards_profiles",
		description: "Find all seller standards profiles",
		inputSchema: findSellerStandardsProfilesInputSchema.shape,
		outputSchema: {
			type: "object",
			properties: {
				standards: { type: "array" },
			},
			description: "Seller standards profiles",
		},
		handler: (api, args) => api.analytics.findSellerStandardsProfiles(args),
	}),
	defineTool({
		name: "ebay_get_seller_standards_profile",
		description: "Get a specific seller standards profile",
		inputSchema: getSellerStandardsProfileInputSchema.shape,
		outputSchema: {
			type: "object",
			properties: {
				program: { type: "string" },
				cycle: { type: "object" },
				metrics: { type: "array" },
			},
			description: "Seller standards profile data",
		},
		handler: (api, args) => api.analytics.getSellerStandardsProfile(args),
		ui: { archetype: "card", map: mapStandardsProfileToCard },
	}),
	defineTool({
		name: "ebay_get_customer_service_metric",
		description: "Get customer service metrics",
		inputSchema: getCustomerServiceMetricInputSchema.shape,
		outputSchema: {
			type: "object",
			properties: {
				metrics: { type: "array" },
			},
			description: "Customer service metric data",
		},
		handler: (api, args) => api.analytics.getCustomerServiceMetric(args),
		ui: { archetype: "chart", map: mapCustomerServiceMetricToChart },
	}),
];
