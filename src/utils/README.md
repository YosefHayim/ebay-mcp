# Zod Schemas for Tool Input Validation

This directory contains Zod schemas for validating the inputs of the MCP tools. The schemas are organized in subdirectories that mirror the structure of the `src/api` directory.

## Workflow for Creating Zod Schemas

To create a new Zod schema for a tool, follow these steps:

1.  **Identify the corresponding API operation:** Find the file in the `src/api` directory that implements the tool's functionality.
2.  **Locate the TypeScript types:** In the `src/types` directory, find the file that contains the type definitions for the API operation. The file names in `src/types` correspond to the OpenAPI specification files in the `docs` directory.
3.  **Create the Zod schema:** In the appropriate subdirectory within `src/utils`, create a new TypeScript file for the Zod schema. The schema should be generated based on the TypeScript types identified in the previous step. Use Zod's features to define the validation rules for each field.
4.  **Export the schema:** Export the Zod schema from the newly created file.
5.  **Update the tool definition:** In the `src/tools/tool-definitions.ts` file, import the Zod schema and add it to the `input` property of the corresponding tool definition.
6.  **Enhance Schema Fields with Validation Details:** For each field in your Zod schema, ensure you provide comprehensive validation details. This includes:
    *   `description`: A clear explanation of the field's purpose.
    *   `message`: A custom error message for type mismatches.
    *   `required_error`: A custom error message if a required field is missing.
    *   `invalid_type_error`: A custom error message for invalid data types.
    *   `coerce`: Use `z.coerce` for type coercion where appropriate (e.g., `z.coerce.number()`).

    **Example:**
    ```typescript
    export const getPaymentPoliciesSchema = z.object({
      marketplace_id: z.string({
        message: 'Marketplace ID is required',
        required_error: 'marketplace_id is required',
        invalid_type_error: 'marketplace_id must be a string',
        description: 'The unique identifier for the eBay marketplace.'
      }).optional(),
    });
    ```
7.  **Create Reusable Schemas for Common Fields:** If multiple schemas share common required fields (e.g., `marketplace_id`), create generic and dynamic reusable schemas for these fields to promote consistency and reduce redundancy.

## Missing Zod Schemas

The following is a list of Zod schemas that need to be created. The list is based on the API implementation files in the `src/api` directory.

### Account Management
- [ ] `account.ts`

### Analytics and Report
- [ ] `analytics.ts`

### Communication
- [x] `feedback.ts`
- [x] `message.ts`
- [x] `negotiation.ts`
- [x] `notification.ts`

### Listing Management
- [ ] `inventory.ts`

### Listing Metadata
- [ ] `metadata.ts`
- [ ] `taxonomy.ts`

### Marketing and Promotions
- [ ] `marketing.ts`
- [ ] `recommendation.ts`

### Order Management
- [ ] `dispute.ts`
- [ ] `fulfillment.ts`

### Other
- [ ] `compliance.ts`
- [ ] `edelivery.ts`
- [ ] `identity.ts`
- [ ] `translation.ts`
- [ ] `vero.ts`