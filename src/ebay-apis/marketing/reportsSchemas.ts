import { z } from "zod";
import {
	amountSchema,
	inventoryReferenceSchema,
} from "./marketingCommonSchemas.js";

// ============================================================================
// Reporting Schemas
// ============================================================================

export const dimensionSchema = z.object({
	dimensionKey: z.string().optional(),
	dimensionValues: z.array(z.string()).optional(),
});

export const dimensionKeyAnnotationSchema = z.object({
	annotationKey: z.string().optional(),
	value: z.string().optional(),
});

export const dimensionMetadataSchema = z.object({
	annotations: z.array(dimensionKeyAnnotationSchema).optional(),
	dataType: z.string().optional(),
	dimensionKey: z.string().optional(),
});

export const metricMetadataSchema = z.object({
	dataType: z.string().optional(),
	metricKey: z.string().optional(),
});

export const reportMetadataSchema = z.object({
	dimensionMetadata: z.array(dimensionMetadataSchema).optional(),
	maxNumberOfDimensionsToRequest: z.number().optional(),
	maxNumberOfMetricsToRequest: z.number().optional(),
	channel: z.string().optional(),
	metricMetadata: z.array(metricMetadataSchema).optional(),
	reportType: z.string().optional(),
});

export const reportMetadatasSchema = z.object({
	reportMetadata: z.array(reportMetadataSchema).optional(),
});

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

export const reportTaskPagedCollectionSchema = z.object({
	href: z.string().optional(),
	limit: z.number().optional(),
	next: z.string().optional(),
	offset: z.number().optional(),
	prev: z.string().optional(),
	total: z.number().optional(),
	reportTasks: z.array(reportTaskSchema).optional(),
});

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
	reportId: z.string().describe("reportId required endpoint parameter"),
});

export const getReportMetadataInputSchema = z.object({
	fundingModel: z
		.string()
		.describe("fundingModel optional endpoint parameter")
		.optional(),
	channel: z
		.string()
		.describe("channel optional endpoint parameter")
		.optional(),
});

export const getReportMetadataForReportTypeInputSchema = z.object({
	reportType: z.string().describe("reportType required endpoint parameter"),
	fundingModel: z
		.string()
		.describe("fundingModel optional endpoint parameter")
		.optional(),
	channel: z
		.string()
		.describe("channel optional endpoint parameter")
		.optional(),
});

export const getReportTasksInputSchema = z.object({
	limit: z.number().describe("limit optional endpoint parameter").optional(),
	offset: z.number().describe("offset optional endpoint parameter").optional(),
	reportTaskStatuses: z
		.string()
		.describe("reportTaskStatuses optional endpoint parameter")
		.optional(),
});

export const createReportTaskInputSchema = z.object({
	request: createReportTaskSchema.describe("Create report task request body"),
});

export const getReportTaskInputSchema = z.object({
	reportTaskId: z.string().describe("reportTaskId required endpoint parameter"),
});

export const deleteReportTaskInputSchema = z.object({
	reportTaskId: z.string().describe("reportTaskId required endpoint parameter"),
});
