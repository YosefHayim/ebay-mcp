/**
 * Marketing API schemas — reports slice.
 *
 * Zod schemas for Marketing endpoints. The barrel `marketing.ts` re-exports all slices.
 */

import { z } from 'zod';
import { amountSchema, inventoryReferenceSchema } from './common.js';

// ============================================================================
// Reporting Schemas
// ============================================================================

/**
 * Validates the Marketing API dimension model.
 */
export const dimensionSchema = z.object({
  dimensionKey: z.string().optional(),
  dimensionValues: z.array(z.string()).optional(),
});

/**
 * Validates the Marketing API dimension key annotation model.
 */
export const dimensionKeyAnnotationSchema = z.object({
  annotationKey: z.string().optional(),
  value: z.string().optional(),
});

/**
 * Validates the Marketing API dimension metadata model.
 */
export const dimensionMetadataSchema = z.object({
  annotations: z.array(dimensionKeyAnnotationSchema).optional(),
  dataType: z.string().optional(),
  dimensionKey: z.string().optional(),
});

/**
 * Validates the Marketing API metric metadata model.
 */
export const metricMetadataSchema = z.object({
  dataType: z.string().optional(),
  metricKey: z.string().optional(),
});

/**
 * Validates the Marketing API report metadata model.
 */
export const reportMetadataSchema = z.object({
  dimensionMetadata: z.array(dimensionMetadataSchema).optional(),
  maxNumberOfDimensionsToRequest: z.number().optional(),
  maxNumberOfMetricsToRequest: z.number().optional(),
  channel: z.string().optional(),
  metricMetadata: z.array(metricMetadataSchema).optional(),
  reportType: z.string().optional(),
});

/**
 * Validates the Marketing API report metadatas model.
 */
export const reportMetadatasSchema = z.object({
  reportMetadata: z.array(reportMetadataSchema).optional(),
});

/**
 * Validates the Marketing API create report task model.
 */
export const createReportTaskSchema = z.object({
  campaignIds: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional(),
  dateFrom: z.string(),
  dateTo: z.string(),
  dimensions: z.array(dimensionSchema).optional(),
  fundingModels: z.array(z.string()).optional(),
  inventoryReferences: z.array(inventoryReferenceSchema).optional(),
  listingIds: z.array(z.string()).optional(),
  marketplaceId: z.string(),
  metricKeys: z.array(z.string()).optional(),
  reportFormat: z.string().optional(),
  reportType: z.string(),
});

/**
 * Validates the Marketing API report task model.
 */
export const reportTaskSchema = z.object({
  campaignIds: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  dimensions: z.array(dimensionSchema).optional(),
  fundingModels: z.array(z.string()).optional(),
  inventoryReferences: z.array(inventoryReferenceSchema).optional(),
  listingIds: z.array(z.string()).optional(),
  marketplaceId: z.string().optional(),
  metricKeys: z.array(z.string()).optional(),
  reportExpirationDate: z.string().optional(),
  reportFormat: z.string().optional(),
  reportHref: z.string().optional(),
  reportId: z.string().optional(),
  reportName: z.string().optional(),
  reportTaskCompletionDate: z.string().optional(),
  reportTaskCreationDate: z.string().optional(),
  reportTaskExpectedCompletionDate: z.string().optional(),
  reportTaskId: z.string().optional(),
  reportTaskStatus: z.string().optional(),
  reportTaskStatusMessage: z.string().optional(),
  reportType: z.string().optional(),
});

/**
 * Validates the Marketing API report task paged collection model.
 */
export const reportTaskPagedCollectionSchema = z.object({
  href: z.string().optional(),
  limit: z.number().optional(),
  next: z.string().optional(),
  offset: z.number().optional(),
  prev: z.string().optional(),
  total: z.number().optional(),
  reportTasks: z.array(reportTaskSchema).optional(),
});

/**
 * Validates the Marketing API summary report response payload.
 */
export const summaryReportResponseSchema = z.object({
  baseSale: amountSchema.optional(),
  lastUpdated: z.string().optional(),
  percentageSalesLift: z.string().optional(),
  promotionHref: z.string().optional(),
  promotionId: z.string().optional(),
  promotionReportId: z.string().optional(),
  promotionSale: amountSchema.optional(),
  totalDiscount: amountSchema.optional(),
  totalSale: amountSchema.optional(),
});

export const getReportInputSchema = z.object({
  reportId: z.string().describe('reportId required endpoint parameter'),
});

/** Validates the Marketing API getReportMetadata endpoint input. */

export const getReportMetadataInputSchema = z.object({
  fundingModel: z.string().describe('fundingModel optional endpoint parameter').optional(),
  channel: z.string().describe('channel optional endpoint parameter').optional(),
});

/** Validates the Marketing API getReportMetadataForReportType endpoint input. */

export const getReportMetadataForReportTypeInputSchema = z.object({
  reportType: z.string().describe('reportType required endpoint parameter'),
  fundingModel: z.string().describe('fundingModel optional endpoint parameter').optional(),
  channel: z.string().describe('channel optional endpoint parameter').optional(),
});

/** Validates the Marketing API getReportTasks endpoint input. */

export const getReportTasksInputSchema = z.object({
  limit: z.number().describe('limit optional endpoint parameter').optional(),
  offset: z.number().describe('offset optional endpoint parameter').optional(),
  reportTaskStatuses: z
    .string()
    .describe('reportTaskStatuses optional endpoint parameter')
    .optional(),
});

/** Validates the Marketing API createReportTask endpoint input. */

export const createReportTaskInputSchema = z.object({
  request: createReportTaskSchema.describe('Create report task request body'),
});

/** Validates the Marketing API getReportTask endpoint input. */

export const getReportTaskInputSchema = z.object({
  reportTaskId: z.string().describe('reportTaskId required endpoint parameter'),
});

/** Validates the Marketing API deleteReportTask endpoint input. */

export const deleteReportTaskInputSchema = z.object({
  reportTaskId: z.string().describe('reportTaskId required endpoint parameter'),
});

/** Validates the Marketing API createItemPriceMarkdownPromotion endpoint input. */
