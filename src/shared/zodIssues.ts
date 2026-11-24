import type { z } from "zod";

export function formatZodIssues(error: z.ZodError): string {
	return error.issues
		.map((issue) =>
			issue.path.length > 0
				? `${issue.path.join(".")}: ${issue.message}`
				: issue.message,
		)
		.join("; ");
}
