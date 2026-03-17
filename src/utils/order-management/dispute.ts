import { z } from 'zod';

/**
 * Zod schemas for Dispute API input validation
 * Based on: src/api/order-management/dispute.ts
 * OpenAPI spec: docs/sell-apps/order-management/sell_fulfillment_v1_oas3.json
 * Types from: src/types/sell_fulfillment_v1_oas3.ts
 */

// Reusable schema for payment dispute ID
const paymentDisputeIdSchema = z.string({
  message: 'Payment dispute ID is required',
  error: 'payment_dispute_id is required',
});

// Reusable schema for evidence ID
const evidenceIdSchema = z.string({
  message: 'Evidence ID is required',
  error: 'evidence_id is required',
});

// Reusable schema for file ID
const fileIdSchema = z.string({
  message: 'File ID is required',
  error: 'file_id is required',
});

// Reusable schema for limit parameter (number in API)
const limitSchema = z
  .number({
    error: 'limit must be a number',
  })
  .optional();

// Reusable schema for offset parameter (number in API)
const offsetSchema = z
  .number({
    error: 'offset must be a number',
  })
  .optional();

/**
 * Schema for getPaymentDispute method
 * Endpoint: GET /payment_dispute/{payment_dispute_id}
 * Path: payment_dispute_id (required)
 */
export const getPaymentDisputeSchema = z.object({
  payment_dispute_id: paymentDisputeIdSchema,
});

/**
 * Schema for fetchEvidenceContent method
 * Endpoint: GET /payment_dispute/{payment_dispute_id}/fetch_evidence_content
 * Path: payment_dispute_id (required)
 * Query: evidence_id (required), file_id (required)
 */
export const fetchEvidenceContentSchema = z.object({
  payment_dispute_id: paymentDisputeIdSchema,
  evidence_id: evidenceIdSchema,
  file_id: fileIdSchema,
});

/**
 * Schema for getActivities method
 * Endpoint: GET /payment_dispute/{payment_dispute_id}/activity
 * Path: payment_dispute_id (required)
 */
export const getActivitiesSchema = z.object({
  payment_dispute_id: paymentDisputeIdSchema,
});

/**
 * Schema for getPaymentDisputeSummaries method
 * Endpoint: GET /payment_dispute_summary
 * Query: order_id, buyer_username, open_date_from, open_date_to, payment_dispute_status, limit, offset
 */
export const getPaymentDisputeSummariesSchema = z.object({
  order_id: z
    .string({
      error: 'order_id must be a string',
    })
    .optional(),
  buyer_username: z
    .string({
      error: 'buyer_username must be a string',
    })
    .optional(),
  open_date_from: z
    .string({
      error: 'open_date_from must be a string',
    })
    .optional(),
  open_date_to: z
    .string({
      error: 'open_date_to must be a string',
    })
    .optional(),
  payment_dispute_status: z
    .string({
      error: 'payment_dispute_status must be a string',
    })
    .optional(),
  limit: limitSchema,
  offset: offsetSchema,
});

/**
 * Schema for contestPaymentDispute method
 * Endpoint: POST /payment_dispute/{payment_dispute_id}/contest
 * Path: payment_dispute_id (required)
 * Body: ContestPaymentDisputeRequest (optional) - note, returnAddress, revision
 */
export const contestPaymentDisputeSchema = z.object({
  payment_dispute_id: paymentDisputeIdSchema,
  note: z
    .string({
      error: 'note must be a string',
    })
    .max(1000, 'Note must not exceed 1000 characters')
    .optional(),
  return_address: z
    .object({
      full_name: z
        .string({
          error: 'full_name must be a string',
        })
        .optional(),
      primary_phone: z
        .object({
          phone_number: z
            .string({
              error: 'phone_number must be a string',
            })
            .optional(),
        })
        .optional(),
      address_line1: z
        .string({
          error: 'address_line1 must be a string',
        })
        .optional(),
      address_line2: z
        .string({
          error: 'address_line2 must be a string',
        })
        .optional(),
      city: z
        .string({
          error: 'city must be a string',
        })
        .optional(),
      state_or_province: z
        .string({
          error: 'state_or_province must be a string',
        })
        .optional(),
      postal_code: z
        .string({
          error: 'postal_code must be a string',
        })
        .optional(),
      country_code: z
        .string({
          error: 'country_code must be a string',
        })
        .optional(),
    })
    .optional(),
  revision: z
    .number({
      error: 'revision must be a number',
    })
    .optional(),
});

/**
 * Schema for acceptPaymentDispute method
 * Endpoint: POST /payment_dispute/{payment_dispute_id}/accept
 * Path: payment_dispute_id (required)
 * Body: AcceptPaymentDisputeRequest (optional) - returnAddress, revision
 */
export const acceptPaymentDisputeSchema = z.object({
  payment_dispute_id: paymentDisputeIdSchema,
  return_address: z
    .object({
      full_name: z
        .string({
          error: 'full_name must be a string',
        })
        .optional(),
      primary_phone: z
        .object({
          phone_number: z
            .string({
              error: 'phone_number must be a string',
            })
            .optional(),
        })
        .optional(),
      address_line1: z
        .string({
          error: 'address_line1 must be a string',
        })
        .optional(),
      address_line2: z
        .string({
          error: 'address_line2 must be a string',
        })
        .optional(),
      city: z
        .string({
          error: 'city must be a string',
        })
        .optional(),
      state_or_province: z
        .string({
          error: 'state_or_province must be a string',
        })
        .optional(),
      postal_code: z
        .string({
          error: 'postal_code must be a string',
        })
        .optional(),
      country_code: z
        .string({
          error: 'country_code must be a string',
        })
        .optional(),
    })
    .optional(),
  revision: z
    .number({
      error: 'revision must be a number',
    })
    .optional(),
});

/**
 * Schema for uploadEvidenceFile method
 * Endpoint: POST /payment_dispute/{payment_dispute_id}/upload_evidence_file
 * Path: payment_dispute_id (required)
 * Body: ArrayBuffer (binary file data)
 */
export const uploadEvidenceFileSchema = z.object({
  payment_dispute_id: paymentDisputeIdSchema,
  file_data: z.instanceof(ArrayBuffer, {
    message: 'File data must be an ArrayBuffer',
  }),
});

/**
 * Schema for addEvidence method
 * Endpoint: POST /payment_dispute/{payment_dispute_id}/add_evidence
 * Path: payment_dispute_id (required)
 * Body: AddEvidencePaymentDisputeRequest - evidenceType, files, lineItems
 */
export const addEvidenceSchema = z.object({
  payment_dispute_id: paymentDisputeIdSchema,
  evidence_type: z
    .string({
      error: 'evidence_type must be a string',
    })
    .optional(),
  files: z
    .array(
      z.object({
        file_id: z
          .string({
            error: 'file_id must be a string',
          })
          .optional(),
      }),
      {
        error: 'files must be an array',
      }
    )
    .optional(),
  line_items: z
    .array(
      z.object({
        item_id: z
          .string({
            error: 'item_id must be a string',
          })
          .optional(),
        line_item_id: z
          .string({
            error: 'line_item_id must be a string',
          })
          .optional(),
      }),
      {
        error: 'line_items must be an array',
      }
    )
    .optional(),
});

/**
 * Schema for updateEvidence method
 * Endpoint: POST /payment_dispute/{payment_dispute_id}/update_evidence
 * Path: payment_dispute_id (required)
 * Body: UpdateEvidencePaymentDisputeRequest - evidenceId, evidenceType, files, lineItems
 */
export const updateEvidenceSchema = z.object({
  payment_dispute_id: paymentDisputeIdSchema,
  evidence_id: z
    .string({
      error: 'evidence_id must be a string',
    })
    .optional(),
  evidence_type: z
    .string({
      error: 'evidence_type must be a string',
    })
    .optional(),
  files: z
    .array(
      z.object({
        file_id: z
          .string({
            error: 'file_id must be a string',
          })
          .optional(),
      }),
      {
        error: 'files must be an array',
      }
    )
    .optional(),
  line_items: z
    .array(
      z.object({
        item_id: z
          .string({
            error: 'item_id must be a string',
          })
          .optional(),
        line_item_id: z
          .string({
            error: 'line_item_id must be a string',
          })
          .optional(),
      }),
      {
        error: 'line_items must be an array',
      }
    )
    .optional(),
});
