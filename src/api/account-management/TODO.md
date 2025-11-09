# Account Management API - TODO

This file outlines the tasks for completing the implementation of the Account Management API.

## Missing Endpoints

The following endpoints are defined in the OpenAPI specification but are not yet implemented in the server:

### Fulfillment Policy
- `POST /fulfillment_policy` - Create Fulfillment Policy
- `DELETE /fulfillment_policy/{fulfillmentPolicyId}` - Delete Fulfillment Policy
- `GET /fulfillment_policy/{fulfillmentPolicyId}` - Get Fulfillment Policy
- `GET /fulfillment_policy` - Get Fulfillment Policies
- `GET /fulfillment_policy_by_name` - Get Fulfillment Policy by Name
- `PUT /fulfillment_policy/{fulfillmentPolicyId}` - Update Fulfillment Policy

### Payment Policy
- `POST /payment_policy` - Create Payment Policy
- `DELETE /payment_policy/{paymentPolicyId}` - Delete Payment Policy
- `GET /payment_policy/{paymentPolicyId}` - Get Payment Policy
- `GET /payment_policy` - Get Payment Policies
- `GET /payment_policy_by_name` - Get Payment Policy by Name
- `PUT /payment_policy/{paymentPolicyId}` - Update Payment Policy

### Return Policy
- `POST /return_policy` - Create Return Policy
- `DELETE /return_policy/{returnPolicyId}` - Delete Return Policy
- `GET /return_policy/{returnPolicyId}` - Get Return Policy
- `GET /return_policy` - Get Return Policies
- `GET /return_policy_by_name` - Get Return Policy by Name
- `PUT /return_policy/{returnPolicyId}` - Update Return Policy

### Custom Policy
- `POST /custom_policy` - Create Custom Policy
- `PUT /custom_policy/{custom_policy_id}` - Update Custom Policy
- `DELETE /custom_policy/{custom_policy_id}` - Delete Custom Policy

### Other
- `GET /kyc` - Get KYC status
- `POST /payments_program/{marketplace_id}/{payments_program_type}` - Opt-in to a payments program
- `GET /payments_program/{marketplace_id}/{payments_program_type}` - Get payments program status
- `GET /rate_table` - Get rate tables
- `POST /sales_tax` - Create or replace sales tax table
- `POST /sales_tax/bulk_create_or_replace` - Bulk create or replace sales tax tables
- `DELETE /sales_tax/{country_code}/{jurisdiction_id}` - Delete sales tax table
- `GET /sales_tax/{country_code}/{jurisdiction_id}` - Get sales tax table
- `GET /sales_tax` - Get all sales tax tables
- `GET /subscription` - Get subscription information
- `POST /program/opt_in` - Opt-in to a program
- `POST /program/opt_out` - Opt-out of a program
- `GET /program` - Get opted-in programs

## Improvements

- **Input Validation:** Add input validation to all endpoints to ensure that the data sent by the AI client is valid.
- **Error Handling:** Improve error handling to provide more detailed and structured error messages to the AI client.
- **Testing:** Add unit tests for all endpoints.
