import { z } from 'zod';
import { defineTool } from '@/tools/define-tool.js';
import type { ToolEntry } from '@/tools/registry.js';
import {
  mapCustomerServiceMetricToChart,
  mapStandardsProfileToCard,
  mapTrafficReportToChart,
} from '@/tools/ui/maps.js';

/** Analytics API tools for seller traffic and performance reporting. */
export const analyticsEntries: ToolEntry[] = [
  defineTool({
    name: 'ebay_get_traffic_report',
    description: 'Get traffic report for listings',
    inputSchema: {
      dimension: z.string().describe('Dimension for the report (e.g., LISTING, DAY)'),
      filter: z.string().describe('Filter criteria'),
      metric: z.string().describe('Metrics to retrieve (e.g., CLICK_THROUGH_RATE, IMPRESSION)'),
      sort: z.string().optional().describe('Sort order'),
    },
    outputSchema: {
      type: 'object',
      properties: {
        records: { type: 'array' },
        warnings: { type: 'array' },
      },
      description: 'Traffic report data',
    },
    handler: (api, args) =>
      api.analytics.getTrafficReport(args.dimension, args.filter, args.metric, args.sort),
    ui: { archetype: 'chart', map: mapTrafficReportToChart },
  }),
  defineTool({
    name: 'ebay_find_seller_standards_profiles',
    description: 'Find all seller standards profiles',
    inputSchema: {},
    outputSchema: {
      type: 'object',
      properties: {
        standards: { type: 'array' },
      },
      description: 'Seller standards profiles',
    },
    handler: (api) => api.analytics.findSellerStandardsProfiles(),
  }),
  defineTool({
    name: 'ebay_get_seller_standards_profile',
    description: 'Get a specific seller standards profile',
    inputSchema: {
      program: z.string().describe('The program (e.g., CUSTOMER_SERVICE)'),
      cycle: z.string().describe('The cycle (e.g., CURRENT)'),
    },
    outputSchema: {
      type: 'object',
      properties: {
        program: { type: 'string' },
        cycle: { type: 'object' },
        metrics: { type: 'array' },
      },
      description: 'Seller standards profile data',
    },
    handler: (api, args) => api.analytics.getSellerStandardsProfile(args.program, args.cycle),
    ui: { archetype: 'card', map: mapStandardsProfileToCard },
  }),
  defineTool({
    name: 'ebay_get_customer_service_metric',
    description: 'Get customer service metrics',
    inputSchema: {
      customerServiceMetricType: z.string().describe('Type of metric'),
      evaluationType: z.string().describe('Evaluation type'),
      evaluationMarketplaceId: z.string().describe('Marketplace ID for evaluation'),
    },
    outputSchema: {
      type: 'object',
      properties: {
        metrics: { type: 'array' },
      },
      description: 'Customer service metric data',
    },
    handler: (api, args) =>
      api.analytics.getCustomerServiceMetric(
        args.customerServiceMetricType,
        args.evaluationType,
        args.evaluationMarketplaceId
      ),
    ui: { archetype: 'chart', map: mapCustomerServiceMetricToChart },
  }),
];
