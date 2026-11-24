import { z } from "zod";

// Reusable schema for filter parameter
const filterSchema = z
	.string({
		message: "Filter must be a string",
		invalid_type_error: "filter must be a string",
		description: "Filter criteria for the query (e.g., date range)",
	})
	.optional();

// Reusable schema for limit parameter
const limitSchema = z
	.number({
		invalid_type_error: "limit must be a number",
		description: "Maximum number of items to return",
	})
	.int()
	.positive()
	.optional();

// Reusable schema for offset parameter
const offsetSchema = z
	.number({
		invalid_type_error: "offset must be a number",
		description: "Number of items to skip",
	})
	.int()
	.nonnegative()
	.optional();

const reportItemSchema = z
	.object({
		brand: z.string().optional(),
		copyEmailToRightsOwner: z.boolean().optional(),
		countries: z.array(z.string()).optional(),
		detailedMessage: z.string().optional(),
		itemId: z.string().optional(),
		messageToSeller: z.string().optional(),
		patent: z.string().optional(),
		regions: z.array(z.string()).optional(),
		veroReasonCodeId: z.string().optional(),
	})
	.passthrough();

export const createVeroReportSchema = z.object({
	reportData: z
		.object({
			reportItems: z.array(reportItemSchema).optional(),
		})
		.passthrough(),
});

export const getVeroReportSchema = z.object({
	veroReportId: z
		.string({
			message: "VERO report ID is required",
			required_error: "veroReportId is required",
			invalid_type_error: "veroReportId must be a string",
			description: "The unique identifier of the VERO report",
		})
		.min(1, "VERO report ID cannot be empty"),
});

export const getVeroReportItemsSchema = z.object({
	filter: filterSchema,
	limit: limitSchema,
	offset: offsetSchema,
});

export const getVeroReasonCodeSchema = z.object({
	veroReasonCodeId: z
		.string({
			message: "VERO reason code ID is required",
			required_error: "veroReasonCodeId is required",
			invalid_type_error: "veroReasonCodeId must be a string",
			description: "The unique identifier of the VERO reason code",
		})
		.min(1, "VERO reason code ID cannot be empty"),
});

export const getVeroReasonCodesSchema = z.object({});
