import { z } from 'zod';

// ============================================================================
// Input Schemas for Operations
// ============================================================================

/** Input accepted by Analytics API findSellerStandardsProfiles. */
export const findSellerStandardsProfilesInputSchema = z.object({});

/** Input accepted by Analytics API getCustomerServiceMetric. */
export const getCustomerServiceMetricInputSchema = z.object({
  customerServiceMetricType: z
    .string()
    .describe('Customer service metric type, e.g., ITEM_NOT_AS_DESCRIBED'),
  evaluationType: z.string().describe('Evaluation type, e.g., CURRENT or PROJECTED'),
  evaluationMarketplaceId: z.string().describe('Marketplace ID used for the evaluation'),
});

/** Input accepted by Analytics API getSellerStandardsProfile. */
export const getSellerStandardsProfileInputSchema = z.object({
  program: z.string().describe('Seller standards program identifier'),
  cycle: z.string().describe('Seller standards cycle, e.g., CURRENT or PROJECTED'),
});

/** Input accepted by Analytics API getTrafficReport. */
export const getTrafficReportInputSchema = z.object({
  dimension: z.string().describe('Report dimension, e.g., LISTING or DAY'),
  filter: z.string().describe('eBay traffic report filter expression'),
  metric: z.string().describe('Comma-delimited report metrics to retrieve'),
  sort: z.string().optional().describe('Optional metric sort expression'),
});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================
