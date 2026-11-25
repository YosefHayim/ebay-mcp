export interface FaqEntry {
  question: string;
  answer: string;
}

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    question: 'Do I need an eBay developer account?',
    answer:
      'Yes. Create an app on developer.ebay.com to get a client ID and secret. Sandbox keys are enough to try every tool before you touch a real store.',
  },
  {
    question: 'Does it work with a real, live store?',
    answer:
      'Yes. Set EBAY_ENVIRONMENT to production and add your user refresh token. The server refreshes access tokens on its own.',
  },
  {
    question: 'My client says I have too many tools.',
    answer:
      'Set EBAY_MCP_TOOLS to the families you need, for example inventory,fulfillment, or to dynamic so tools load on demand.',
  },
  {
    question: 'Can my assistant change listings by mistake?',
    answer:
      'Set EBAY_READ_ONLY to true and every tool that writes to eBay is turned off. The MCP App views are always read-only.',
  },
  {
    question: 'Is this an official eBay project?',
    answer:
      'No. ebay-mcp is an independent open-source project. It is not affiliated with, endorsed by or sponsored by eBay Inc.',
  },
  {
    question: 'Where do my credentials go?',
    answer:
      'Nowhere but your machine. The server runs locally over STDIO or local HTTP and calls eBay directly. There is no cloud relay.',
  },
  {
    question: 'Is it free?',
    answer:
      'Yes, it is MIT licensed. eBay’s own rate limits apply: about 1,000 calls a day with client credentials, and 10,000 to 50,000 with a user token.',
  },
];
