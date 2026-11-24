import { z } from "zod";

export const categoryTreeIdInputSchema = z.object({
	categoryTreeId: z
		.string()
		.min(1)
		.describe(
			"Category tree ID from ebay_get_default_category_tree_id, e.g. 0 for EBAY_US",
		),
});
