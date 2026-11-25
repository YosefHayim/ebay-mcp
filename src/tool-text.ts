/** One MCP text block. Stdout stays reserved for the protocol, so tools return this object. */
export function textContent(text: string) {
  return {
    content: [{ type: 'text' as const, text }],
  };
}

/** The same block, with a JSON document a person can read. */
export function jsonText(document: unknown) {
  const text = JSON.stringify(document, null, 2);
  return textContent(text);
}
