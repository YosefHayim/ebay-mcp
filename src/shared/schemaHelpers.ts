import { z } from "zod";

export function idSchema(name: string, description: string) {
	const normalized = name.toLowerCase().replace(/\s+/g, "_");

	return z.string({
		message: `${name} is required`,
		required_error: `${normalized} is required`,
		invalid_type_error: `${normalized} must be a string`,
		description,
	});
}
