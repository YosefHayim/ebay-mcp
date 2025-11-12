import { z } from 'zod';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
}
export const analyticsTools: ToolDefinition[] = [
  {
    name: 'ebay_get_traffic_report',
    description: 'Get traffic report for listings',
    inputSchema: {
      dimension: z.string().describe('Dimension for the report (e.g., LISTING, DAY)'),
      filter: z.string().describe('Filter criteria'),
      metric: z.string().describe('Metrics to retrieve (e.g., CLICK_THROUGH_RATE, IMPRESSION)'),
      sort: z.string().optional().describe('Sort order'),
    },
  },
  {
    name: 'ebay_find_seller_standards_profiles',
    description: 'Find all seller standards profiles',
    inputSchema: {},
  },
  {
    name: 'ebay_get_seller_standards_profile',
    description: 'Get a specific seller standards profile',
    inputSchema: {
      program: z.string().describe('The program (e.g., CUSTOMER_SERVICE)'),
      cycle: z.string().describe('The cycle (e.g., CURRENT)'),
    },
  },
  {
    name: 'ebay_get_customer_service_metric',
    description: 'Get customer service metrics',
    inputSchema: {
      customerServiceMetricType: z.string().describe('Type of metric'),
      evaluationType: z.string().describe('Evaluation type'),
      evaluationMarketplaceId: z.string().describe('Marketplace ID for evaluation'),
    },
  },
];
