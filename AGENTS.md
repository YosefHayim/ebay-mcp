# Agent notes

Exceptions to the personal code rules:

- `src/ebay-openapi-types` is generated. Do not edit it by hand.
- eBay JSON and XML field names, MCP tool names, and Zod or SDK names stay as the outside API spells them.
- When `PORT` is set, the HTTP server listens on `0.0.0.0` so Docker can reach it.
- This package is published, so its version stays `1.18.0`.
- `erasableSyntaxOnly` is on, so class dependencies are fields assigned in the constructor, not parameter properties.
- Getters, setters, generators, and abstract methods stay methods. Other class methods are arrow properties so `this` survives being passed around.
