import { Effect } from 'effect';
import {
  findSellerStandardsProfilesInputSchema,
  getCustomerServiceMetricInputSchema,
  getSellerStandardsProfileInputSchema,
  getTrafficReportInputSchema,
} from '@/ebay-apis/analytics/analytics-schemas.js';
import { defineTool } from '@/tool-registry/define-tool.js';
import type { ToolEntry } from '@/tool-registry/registry.js';
import {
  mapCustomerServiceMetricToChart,
  mapStandardsProfileToCard,
  mapTrafficReportToChart,
} from '@/tool-registry/ui/maps.js';

/** Analytics API tools for seller traffic and performance reporting. */
export const analyticsEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_traffic_report',
    description: 'Get traffic report for listings',
    inputSchema: getTrafficReportInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.analytics.getTrafficReport(args)),
    ui: { archetype: 'chart', map: mapTrafficReportToChart },
  }),
  defineTool({
    name: 'ebay_find_seller_standards_profiles',
    description: 'Find all seller standards profiles',
    inputSchema: findSellerStandardsProfilesInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.analytics.findSellerStandardsProfiles(args)),
  }),
  defineTool({
    name: 'ebay_get_seller_standards_profile',
    description: 'Get a specific seller standards profile',
    inputSchema: getSellerStandardsProfileInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.analytics.getSellerStandardsProfile(args)),
    ui: { archetype: 'card', map: mapStandardsProfileToCard },
  }),
  defineTool({
    name: 'ebay_get_customer_service_metric',
    description: 'Get customer service metrics',
    inputSchema: getCustomerServiceMetricInputSchema.shape,
    handler: (api, args) => Effect.runPromise(api.analytics.getCustomerServiceMetric(args)),
    ui: { archetype: 'chart', map: mapCustomerServiceMetricToChart },
  }),
];
