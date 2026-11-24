import { z } from "zod";
import { idSchema } from "@/shared/schemaHelpers.js";

const limitSchema = z
	.number({
		invalid_type_error: "limit must be a number",
		description: "Maximum number of items to return per page (10-100)",
	})
	.positive("limit must be a positive number")
	.optional();

const continuationTokenSchema = z
	.string({
		message: "Continuation token must be a string",
		invalid_type_error: "continuationToken must be a string",
		description: "Token for pagination",
	})
	.optional();

const deliveryConfigSchema = z
	.object({
		endpoint: z
			.string({
				invalid_type_error: "endpoint must be a string",
				description: "HTTPS endpoint URL",
			})
			.url({
				message: "endpoint must be a valid URL",
			})
			.optional(),
		verificationToken: z
			.string({
				invalid_type_error: "verificationToken must be a string",
				description:
					"Verification token (32-80 alphanumeric, underscore, hyphen characters)",
			})
			.min(32, "verificationToken must be at least 32 characters")
			.max(80, "verificationToken must be at most 80 characters")
			.regex(
				/^[a-zA-Z0-9_-]+$/,
				"verificationToken can only contain alphanumeric, underscore, and hyphen characters",
			)
			.optional(),
	})
	.optional();

const payloadSchema = z
	.object({
		deliveryProtocol: z
			.string({
				invalid_type_error: "deliveryProtocol must be a string",
				description: "Delivery protocol",
			})
			.optional(),
		format: z
			.string({
				invalid_type_error: "format must be a string",
				description: "Payload format",
			})
			.optional(),
		schemaVersion: z
			.string({
				invalid_type_error: "schemaVersion must be a string",
				description: "Schema version for the notification topic",
			})
			.optional(),
	})
	.optional();

export const getPublicKeySchema = z.object({
	publicKeyId: idSchema(
		"Public key ID",
		"The unique identifier for the public key",
	),
});

export const getConfigSchema = z.object({});

export const updateConfigSchema = z.object({
	alertEmail: z
		.string({
			invalid_type_error: "alertEmail must be a string",
			description: "Email address for Notification API alerts",
		})
		.email({
			message: "alertEmail must be a valid email address",
		})
		.optional(),
});

export const getDestinationsSchema = z.object({
	continuationToken: continuationTokenSchema,
	limit: limitSchema,
});

export const getDestinationSchema = z.object({
	destinationId: idSchema(
		"Destination ID",
		"The unique identifier for the destination",
	),
});

export const createDestinationSchema = z.object({
	deliveryConfig: deliveryConfigSchema,
	name: z
		.string({
			invalid_type_error: "name must be a string",
			description: "Seller-specified name for the destination",
		})
		.optional(),
	status: z
		.string({
			invalid_type_error: "status must be a string",
			description: "Status: ENABLED or DISABLED",
		})
		.optional(),
});

export const updateDestinationSchema = z.object({
	destinationId: idSchema(
		"Destination ID",
		"The unique identifier for the destination",
	),
	deliveryConfig: deliveryConfigSchema,
	name: z
		.string({
			invalid_type_error: "name must be a string",
			description: "Destination name",
		})
		.optional(),
	status: z
		.string({
			invalid_type_error: "status must be a string",
			description: "Status: ENABLED or DISABLED",
		})
		.optional(),
});

export const deleteDestinationSchema = z.object({
	destinationId: idSchema(
		"Destination ID",
		"The unique identifier for the destination",
	),
});

export const getSubscriptionsSchema = z.object({
	limit: limitSchema,
	continuationToken: continuationTokenSchema,
});

export const createSubscriptionSchema = z.object({
	destinationId: z
		.string({
			invalid_type_error: "destinationId must be a string",
			description: "The unique identifier of the destination endpoint",
		})
		.optional(),
	payload: payloadSchema,
	status: z
		.string({
			invalid_type_error: "status must be a string",
			description: "Status: ENABLED or DISABLED",
		})
		.optional(),
	topicId: z
		.string({
			invalid_type_error: "topicId must be a string",
			description: "The unique identifier of the notification topic",
		})
		.optional(),
});

export const getSubscriptionSchema = z.object({
	subscriptionId: idSchema(
		"Subscription ID",
		"The unique identifier for the subscription",
	),
});

export const updateSubscriptionSchema = z.object({
	subscriptionId: idSchema(
		"Subscription ID",
		"The unique identifier for the subscription",
	),
	destinationId: z
		.string({
			invalid_type_error: "destinationId must be a string",
			description: "The unique identifier of the destination",
		})
		.optional(),
	payload: payloadSchema,
	status: z
		.string({
			invalid_type_error: "status must be a string",
			description: "Status: ENABLED or DISABLED",
		})
		.optional(),
});

export const deleteSubscriptionSchema = z.object({
	subscriptionId: idSchema(
		"Subscription ID",
		"The unique identifier for the subscription",
	),
});

export const disableSubscriptionSchema = z.object({
	subscriptionId: idSchema(
		"Subscription ID",
		"The unique identifier for the subscription",
	),
});

export const enableSubscriptionSchema = z.object({
	subscriptionId: idSchema(
		"Subscription ID",
		"The unique identifier for the subscription",
	),
});

export const testSubscriptionSchema = z.object({
	subscriptionId: idSchema(
		"Subscription ID",
		"The unique identifier for the subscription",
	),
});

export const getTopicSchema = z.object({
	topicId: idSchema("Topic ID", "The unique identifier for the topic"),
});

export const getTopicsSchema = z.object({
	limit: limitSchema,
	continuationToken: continuationTokenSchema,
});

export const createSubscriptionFilterSchema = z.object({
	subscriptionId: idSchema(
		"Subscription ID",
		"The unique identifier for the subscription",
	),
	filterSchema: z
		.record(z.string(), z.unknown())
		.optional()
		.describe(
			"Valid JSON Schema Core document (version 2020-12 or later) to filter notifications",
		),
});

export const getSubscriptionFilterSchema = z.object({
	subscriptionId: idSchema(
		"Subscription ID",
		"The unique identifier for the subscription",
	),
	filterId: idSchema("Filter ID", "The unique identifier for the filter"),
});

export const deleteSubscriptionFilterSchema = z.object({
	subscriptionId: idSchema(
		"Subscription ID",
		"The unique identifier for the subscription",
	),
	filterId: idSchema("Filter ID", "The unique identifier for the filter"),
});
