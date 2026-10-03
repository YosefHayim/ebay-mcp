import type { z } from 'zod';

/**
 * Formats Zod validation issues as one readable line for tool and endpoint errors.
 *
 * @param error - Zod error returned by a failed `safeParse`.
 * @returns Issues joined by `; `, each prefixed with its dotted field path when it has one.
 *
 * @example
 * ```ts
 * formatZodIssues(schema.safeParse({}).error); // "sku: Required"
 * ```
 */
export const formatZodIssues = (error: z.ZodError): string =>
  error.issues
    .map((issue) =>
      issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message,
    )
    .join('; ');
