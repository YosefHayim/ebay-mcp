import { z } from 'zod';

/**
 * Zod schemas for Translation API input validation
 * Based on: src/api/other/translation.ts
 * OpenAPI spec: docs/sell-apps/other-apis/commerce_translation_v1_beta_oas3.json
 */

/**
 * Schema for translate method
 * Endpoint: POST /translate
 * Body: TranslateRequest - from, to, translationContext, text
 */
export const translateSchema = z.object({
  from: z
    .string({ error: 'from must be a string' })
    .optional(),
  to: z
    .string({ error: 'to must be a string' })
    .optional(),
  translation_context: z
    .string({ error: 'translation_context must be a string' })
    .optional(),
  text: z
    .array(
      z.string({ error: 'text array items must be strings' }),
      { error: 'text must be an array' }
    )
    .optional(),
});
