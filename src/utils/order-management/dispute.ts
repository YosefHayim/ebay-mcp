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
  required_error: 'payment_dispute_id is required',
  invalid_type_error: 'payment_dispute_id must be a string',
  description: 'The unique identifier of the payment dispute',
});

// Reusable schema for evidence ID
const evidenceIdSchema = z.string({
  message: 'Evidence ID is required',
  required_error: 'evidence_id is required',
  invalid_type_error: 'evidence_id must be a string',
  description: 'The unique identifier of the evidence file set',
});

// Reusable schema for file ID
const fileIdSchema = z.string({
  message: 'File ID is required',
  required_error: 'file_id is required',
  invalid_type_error: 'file_id must be a string',
  description: 'The unique identifier of an evidential file',
});

// Reusable schema for limit parameter (number in API)
const limitSchema = z
  .number({
    invalid_type_error: 'limit must be a number',
    description: 'Maximum number of payment disputes to return (default: 200, max: 200)',
  })
  .optional();

// Reusable schema for offset parameter (number in API)
const offsetSchema = z
  .number({
    invalid_type_error: 'offset must be a number',
    description: 'Number of payment disputes to skip (zero-based index)',
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
      invalid_type_error: 'order_id must be a string',
      description: 'Filter by a specific order ID',
    })
    .optional(),
  buyer_username: z
    .string({
      invalid_type_error: 'buyer_username must be a string',
      description: "Filter by buyer's eBay username",
    })
    .optional(),
  open_date_from: z
    .string({
      invalid_type_error: 'open_date_from must be a string',
      description: 'Filter disputes opened on or after this date (ISO 8601 format)',
    })
    .optional(),
  open_date_to: z
    .string({
      invalid_type_error: 'open_date_to must be a string',
      description: 'Filter disputes opened on or before this date (ISO 8601 format)',
    })
    .optional(),
  payment_dispute_status: z
    .string({
      invalid_type_error: 'payment_dispute_status must be a string',
      description: 'Filter by dispute status (e.g., OPEN, ACTION_NEEDED, CLOSED)',
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
      invalid_type_error: 'note must be a string',
      description: 'Information about the dispute (max 1000 characters)',
    })
    .max(1000, 'Note must not exceed 1000 characters')
    .optional(),
  return_address: z
    .object({
      full_name: z
        .string({
          invalid_type_error: 'full_name must be a string',
          description: 'Full name of the person at the return address',
        })
        .optional(),
      primary_phone: z
        .object({
          phone_number: z
            .string({
              invalid_type_error: 'phone_number must be a string',
              description: 'Primary phone number',
            })
            .optional(),
        })
        .optional(),
      address_line1: z
        .string({
          invalid_type_error: 'address_line1 must be a string',
          description: 'First line of the street address',
        })
        .optional(),
      address_line2: z
        .string({
          invalid_type_error: 'address_line2 must be a string',
          description: 'Second line of the street address',
        })
        .optional(),
      city: z
        .string({
          invalid_type_error: 'city must be a string',
          description: 'City',
        })
        .optional(),
      state_or_province: z
        .string({
          invalid_type_error: 'state_or_province must be a string',
          description: 'State or province',
        })
        .optional(),
      postal_code: z
        .string({
          invalid_type_error: 'postal_code must be a string',
          description: 'Postal code',
        })
        .optional(),
      country_code: z
        .string({
          invalid_type_error: 'country_code must be a string',
          description: 'Two-letter ISO 3166-1 alpha-2 country code',
        })
        .optional(),
    })
    .optional(),
  revision: z
    .number({
      invalid_type_error: 'revision must be a number',
      description: 'Revision number of the payment dispute (required)',
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
          invalid_type_error: 'full_name must be a string',
          description: 'Full name of the person at the return address',
        })
        .optional(),
      primary_phone: z
        .object({
          phone_number: z
            .string({
              invalid_type_error: 'phone_number must be a string',
              description: 'Primary phone number',
            })
            .optional(),
        })
        .optional(),
      address_line1: z
        .string({
          invalid_type_error: 'address_line1 must be a string',
          description: 'First line of the street address',
        })
        .optional(),
      address_line2: z
        .string({
          invalid_type_error: 'address_line2 must be a string',
          description: 'Second line of the street address',
        })
        .optional(),
      city: z
        .string({
          invalid_type_error: 'city must be a string',
          description: 'City',
        })
        .optional(),
      state_or_province: z
        .string({
          invalid_type_error: 'state_or_province must be a string',
          description: 'State or province',
        })
        .optional(),
      postal_code: z
        .string({
          invalid_type_error: 'postal_code must be a string',
          description: 'Postal code',
        })
        .optional(),
      country_code: z
        .string({
          invalid_type_error: 'country_code must be a string',
          description: 'Two-letter ISO 3166-1 alpha-2 country code',
        })
        .optional(),
    })
    .optional(),
  revision: z
    .number({
      invalid_type_error: 'revision must be a number',
      description: 'Revision number of the payment dispute (required)',
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
      invalid_type_error: 'evidence_type must be a string',
      description: 'Type of evidence (e.g., PROOF_OF_DELIVERY, PROOF_OF_AUTHENTICATION)',
    })
    .optional(),
  files: z
    .array(
      z.object({
        file_id: z
          .string({
            invalid_type_error: 'file_id must be a string',
            description: 'Unique identifier of the evidence file',
          })
          .optional(),
      }),
      {
        invalid_type_error: 'files must be an array',
        description: 'Array of evidence files',
      }
    )
    .optional(),
  line_items: z
    .array(
      z.object({
        item_id: z
          .string({
            invalid_type_error: 'item_id must be a string',
            description: 'eBay listing ID',
          })
          .optional(),
        line_item_id: z
          .string({
            invalid_type_error: 'line_item_id must be a string',
            description: 'Unique identifier of the line item',
          })
          .optional(),
      }),
      {
        invalid_type_error: 'line_items must be an array',
        description: 'Array of order line items',
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
      invalid_type_error: 'evidence_id must be a string',
      description: 'Unique identifier of the evidence set to update',
    })
    .optional(),
  evidence_type: z
    .string({
      invalid_type_error: 'evidence_type must be a string',
      description: 'Type of evidence (e.g., PROOF_OF_DELIVERY, PROOF_OF_AUTHENTICATION)',
    })
    .optional(),
  files: z
    .array(
      z.object({
        file_id: z
          .string({
            invalid_type_error: 'file_id must be a string',
            description: 'Unique identifier of the evidence file',
          })
          .optional(),
      }),
      {
        invalid_type_error: 'files must be an array',
        description: 'Array of evidence files',
      }
    )
    .optional(),
  line_items: z
    .array(
      z.object({
        item_id: z
          .string({
            invalid_type_error: 'item_id must be a string',
            description: 'eBay listing ID',
          })
          .optional(),
        line_item_id: z
          .string({
            invalid_type_error: 'line_item_id must be a string',
            description: 'Unique identifier of the line item',
          })
          .optional(),
      }),
      {
        invalid_type_error: 'line_items must be an array',
        description: 'Array of order line items',
      }
    )
    .optional(),
});
