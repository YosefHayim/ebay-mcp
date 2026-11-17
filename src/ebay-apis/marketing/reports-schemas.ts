/**
 * Marketing API schemas — reports slice.
 *
 * Zod schemas for Marketing endpoints. The barrel `marketing.ts` re-exports all slices.
 */

import { z } from 'zod';
import { inventoryReferenceSchema } from './marketing-common-schemas.js';

// ============================================================================
// Reporting Schemas
// ============================================================================

/**
 * Validates the Marketing API dimension model.
 */
const dimensionSchema = z.object({
  dimensionKey: z.string().optional(),
  dimensionValues: z.array(z.string()).optional(),
});

/**
 * Validates the Marketing API create report task model.
 */
const createReportTaskSchema = z.object({
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
