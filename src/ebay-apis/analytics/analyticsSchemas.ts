import { z } from 'zod';

/**
 * Analytics API Schemas
 *
 * This file contains Zod schemas for the Sell Analytics API.
 * Schemas are organized by type and include all analytics-related endpoints.
 */

// ============================================================================
// Common Schemas
// ============================================================================

const errorParameterSchema = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
});

const errorSchema = z.object({
  category: z.string().optional(),
  domain: z.string().optional(),
  errorId: z.number().int().optional(),
  inputRefIds: z.array(z.string()).optional(),
  longMessage: z.string().optional(),
  message: z.string().optional(),
  outputRefIds: z.array(z.string()).optional(),
  parameters: z.array(errorParameterSchema).optional(),
  subdomain: z.string().optional(),
});

const valueSchema = z.object({
  applicable: z.boolean().optional(),
  value: z.record(z.never()).optional(),
});

// ============================================================================
// Customer Service Metric Schemas
// ============================================================================

const benchmarkMetadataSchema = z.object({
  average: z.string().optional(),
});

const metricBenchmarkSchema = z.object({
  adjustment: z.string().optional(),
  basis: z.string().optional(),
  metadata: benchmarkMetadataSchema.optional(),
  rating: z.string().optional(),
});

const distributionSchema = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
});

const metricDistributionSchema = z.object({
  basis: z.string().optional(),
  data: z.array(distributionSchema).optional(),
});

const metricSchema = z.object({
  benchmark: metricBenchmarkSchema.optional(),
  distributions: z.array(metricDistributionSchema).optional(),
  metricKey: z.string().optional(),
  value: z.string().optional(),
});

const dimensionSchema = z.object({
  dimensionKey: z.string().optional(),
  name: z.string().optional(),
  value: z.string().optional(),
});

const dimensionMetricSchema = z.object({
  dimension: dimensionSchema.optional(),
  metrics: z.array(metricSchema).optional(),
});

const evaluationCycleSchema = z.object({
  endDate: z.string().optional(),
  evaluationDate: z.string().optional(),
  evaluationType: z.string().optional(),
  startDate: z.string().optional(),
});

const getCustomerServiceMetricResponseSchema = z.object({
  dimensionMetrics: z.array(dimensionMetricSchema).optional(),
  evaluationCycle: evaluationCycleSchema.optional(),
  marketplaceId: z.string().optional(),
});

// ============================================================================
// Seller Standards Profile Schemas
// ============================================================================

const cycleSchema = z.object({
  cycleType: z.string().optional(),
  evaluationDate: z.string().optional(),
  evaluationMonth: z.string().optional(),
});

const standardsProfileSchema = z.object({
  cycle: cycleSchema.optional(),
  defaultProgram: z.boolean().optional(),
  evaluationReason: z.string().optional(),
  metrics: z.array(metricSchema).optional(),
  program: z.string().optional(),
  standardsLevel: z.string().optional(),
});

const findSellerStandardsProfilesResponseSchema = z.object({
  standardsProfiles: z.array(standardsProfileSchema).optional(),
});

// ============================================================================
// Traffic Report Schemas
// ============================================================================

const definitionSchema = z.object({
  dataType: z.string().optional(),
  key: z.string().optional(),
  localizedName: z.string().optional(),
});

const headerSchema = z.object({
  dimensionKeys: z.array(definitionSchema).optional(),
  metrics: z.array(definitionSchema).optional(),
});

const recordSchema = z.object({
  dimensionValues: z.array(valueSchema).optional(),
  metricValues: z.array(valueSchema).optional(),
});

const metadataHeaderSchema = z.object({
  key: z.string().optional(),
  metadataKeys: z.array(definitionSchema).optional(),
});

const metadataRecordSchema = z.object({
  metadataValues: z.array(valueSchema).optional(),
  value: valueSchema.optional(),
});

const metadataSchema = z.object({
  metadataHeader: metadataHeaderSchema.optional(),
  metadataRecords: z.array(metadataRecordSchema).optional(),
});

const reportSchema = z.object({
  dimensionMetadata: z.array(metadataSchema).optional(),
  endDate: z.string().optional(),
  header: headerSchema.optional(),
  lastUpdatedDate: z.string().optional(),
  records: z.array(recordSchema).optional(),
  startDate: z.string().optional(),
  warnings: z.array(errorSchema).optional(),
});

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
