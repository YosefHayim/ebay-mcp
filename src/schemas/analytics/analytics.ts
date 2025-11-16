import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

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

const getCustomerServiceMetricInputSchema = z.object({
  customer_service_metric_type: z.string(),
  evaluation_type: z.string(),
  evaluation_marketplace_id: z.string(),
});

const getSellerStandardsProfileInputSchema = z.object({
  program: z.string(),
  cycle: z.string(),
});

const getTrafficReportInputSchema = z.object({
  dimension: z.string().optional(),
  filter: z.string().optional(),
  metric: z.string().optional(),
  sort: z.string().optional(),
});

// ============================================================================
// JSON Schema Conversion Functions
// ============================================================================

/**
 * Convert Zod schemas to JSON Schema format for MCP tools
 */
export function getAnalyticsJsonSchemas() {
  return {
    // Customer Service Metrics
    getCustomerServiceMetricInput: zodToJsonSchema(getCustomerServiceMetricInputSchema, 'getCustomerServiceMetricInput'),
    getCustomerServiceMetricOutput: zodToJsonSchema(getCustomerServiceMetricResponseSchema, 'getCustomerServiceMetricOutput'),

    // Seller Standards Profiles
    findSellerStandardsProfilesOutput: zodToJsonSchema(findSellerStandardsProfilesResponseSchema, 'findSellerStandardsProfilesOutput'),
    getSellerStandardsProfileInput: zodToJsonSchema(getSellerStandardsProfileInputSchema, 'getSellerStandardsProfileInput'),
    getSellerStandardsProfileOutput: zodToJsonSchema(standardsProfileSchema, 'getSellerStandardsProfileOutput'),

    // Traffic Reports
    getTrafficReportInput: zodToJsonSchema(getTrafficReportInputSchema, 'getTrafficReportInput'),
    getTrafficReportOutput: zodToJsonSchema(reportSchema, 'getTrafficReportOutput'),

    // Common Types
    benchmarkMetadata: zodToJsonSchema(benchmarkMetadataSchema, 'benchmarkMetadata'),
    cycle: zodToJsonSchema(cycleSchema, 'cycle'),
    definition: zodToJsonSchema(definitionSchema, 'definition'),
    dimension: zodToJsonSchema(dimensionSchema, 'dimension'),
    dimensionMetric: zodToJsonSchema(dimensionMetricSchema, 'dimensionMetric'),
    distribution: zodToJsonSchema(distributionSchema, 'distribution'),
    error: zodToJsonSchema(errorSchema, 'error'),
    errorParameter: zodToJsonSchema(errorParameterSchema, 'errorParameter'),
    evaluationCycle: zodToJsonSchema(evaluationCycleSchema, 'evaluationCycle'),
    header: zodToJsonSchema(headerSchema, 'header'),
    metadata: zodToJsonSchema(metadataSchema, 'metadata'),
    metadataHeader: zodToJsonSchema(metadataHeaderSchema, 'metadataHeader'),
    metadataRecord: zodToJsonSchema(metadataRecordSchema, 'metadataRecord'),
    metric: zodToJsonSchema(metricSchema, 'metric'),
    metricBenchmark: zodToJsonSchema(metricBenchmarkSchema, 'metricBenchmark'),
    metricDistribution: zodToJsonSchema(metricDistributionSchema, 'metricDistribution'),
    record: zodToJsonSchema(recordSchema, 'record'),
    report: zodToJsonSchema(reportSchema, 'report'),
    standardsProfile: zodToJsonSchema(standardsProfileSchema, 'standardsProfile'),
    value: zodToJsonSchema(valueSchema, 'value'),
  };
}
