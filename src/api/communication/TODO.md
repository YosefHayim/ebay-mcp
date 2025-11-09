# Communication API - TODO

This file outlines the tasks for completing the implementation of the Communication API.

## Missing Endpoints

The following endpoints are defined in the OpenAPI specification but are not yet implemented in the server:

### Feedback
- `POST /feedback/{feedbackId}/respond` - Respond to feedback
- `POST /feedback/{feedbackId}/dispute` - Dispute feedback

### Message
- `POST /message` - Send a message
- `DELETE /message/{messageId}` - Delete a message

### Negotiation
- `GET /negotiation/{negotiationId}` - Get a negotiation
- `POST /negotiation/{negotiationId}/accept` - Accept a negotiation
- `POST /negotiation/{negotiationId}/decline` - Decline a negotiation
- `POST /negotiation/{negotiationId}/counteroffer` - Make a counteroffer

### Notification
- `GET /destination` - Get all destinations
- `POST /destination/{destinationId}/ping` - Ping a destination

## Improvements

- **Input Validation:** Add input validation to all endpoints to ensure that the data sent by the AI client is valid.
- **Error Handling:** Improve error handling to provide more detailed and structured error messages to the AI client.
- **Testing:** Add unit tests for all endpoints.
