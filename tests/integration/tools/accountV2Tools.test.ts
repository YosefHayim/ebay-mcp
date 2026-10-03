import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { EbaySellerApi } from '@/api/ebaySellerApi.js';
import { createEbayMcpRuntime } from '@/mcp/runtime.js';
import type { EbayConfig } from '@/types/ebay.js';
import { Effect } from 'effect';
import nock from 'nock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockOAuthClient = {
  hasUserTokens: vi.fn(),
  getAccessToken: vi.fn(),
  setUserTokens: vi.fn(),
  initialize: vi.fn(),
  getTokenInfo: vi.fn(),
  isAuthenticated: vi.fn(),
};

vi.mock('../../../src/auth/oauth.js', () => ({
  EbayOAuthClient: vi.fn(function (this: unknown) {
    return mockOAuthClient;
  }),
}));

const HOST = 'https://api.sandbox.ebay.com';
const BASE = '/sell/account/v2';
const RULES = `${BASE}/combined_shipping_rules`;
const JSON_CONTENT_TYPE = /application\/json/;
// The client default is EBAY_US; marketplace-scoped tools must send their own per call.
const config: EbayConfig = {
  clientId: 'test_client_id',
  clientSecret: 'test_client_secret',
  environment: 'sandbox',
  redirectUri: 'https://localhost/callback',
  marketplaceId: 'EBAY_US',
};

const eur = (value: string) => ({ currency: 'EUR', value });
const calculatedRules = {
  calculatedShippingRule: {
    combinedShippingRuleType: 'WEIGHT_OFF',
    combinedShippingRules: [{ weightOffTotalWeight: { unit: 'POUND', value: '2' } }],
  },
  calculatedHandlingRule: {
    combinedShippingRuleType: 'COMBINED_HANDLING_FEE',
    orderHandlingAmount: eur('1.50'),
  },
  combinedDuration: 'DAYS_7',
};
const flatRules = {
  flatShippingRule: {
    combinedShippingRuleType: 'EACH_ADDITIONAL_AMOUNT_OFF',
    combinedShippingRules: [
      { combinedShippingRuleId: 'C-1', eachAdditionalAmountOffShippingCost: eur('0.50') },
    ],
  },
  combinedDuration: 'DAYS_14',
};
const promotionalRule = {
  promotionalShippingRule: {
    combinedShippingRuleType: 'SHIPPING_COST_X_FOR_AMOUNT_Y',
    orderAmount: eur('50.00'),
    shippingCost: eur('0.00'),
  },
};
const preferences = {
  combinedPaymentPreferences: { combinedPaymentOption: 'DISCOUNT_SPECIFIED' },
  dispatchCutoffTimePreference: { cutoffTime: '14:00:00.000Z' },
  itemsAwaitingPaymentPreferences: { optInStatus: true, delayBeforeCancellingCommitment: 4 },
  outOfStockControlPreference: true,
};
const rateTableUpdate = { rates: [{ rateId: 'R1', shippingCost: eur('4.99') }] };
const payoutSplit = {
  payoutInstruments: [
    { instrumentId: 'BANK-1', payoutPercentage: '70' },
    { instrumentId: 'PAYONEER-1', payoutPercentage: '30' },
  ],
};
const rulesRequired = ['marketplaceId', 'shippingRules'];

/** Every Account v2 write tool: its MCP contract and the exact eBay request it must send. */
const writeCases = [
  {
    tool: 'ebay_update_rate_table_shipping_cost',
    required: ['rateTableId', 'rateTableUpdate'],
    args: { rateTableId: 'RT/1', rateTableUpdate },
    method: 'POST',
    path: `${BASE}/rate_table/RT%2F1/update_shipping_cost`,
    body: rateTableUpdate,
    marketplace: 'EBAY_US',
  },
  {
    tool: 'ebay_update_payout_percentage',
    required: ['payoutSplit'],
    args: { payoutSplit },
    method: 'POST',
    path: `${BASE}/payout_settings/update_percentage`,
    body: payoutSplit,
    marketplace: 'EBAY_US',
  },
  ...(
    [
      ['create_calculated_shipping_rules', calculatedRules],
      ['update_calculated_shipping_rules', calculatedRules],
      ['create_flat_shipping_rules', flatRules],
      ['update_flat_shipping_rules', flatRules],
      ['create_promotional_shipping_rule', promotionalRule],
      ['update_promotional_shipping_rule', promotionalRule],
    ] as const
  ).map(([operation, shippingRules]) => ({
    tool: `ebay_${operation}`,
    required: rulesRequired,
    args: { marketplaceId: 'EBAY_DE', shippingRules },
    method: 'POST',
    path: `${RULES}/${operation}`,
    body: shippingRules,
    marketplace: 'EBAY_DE',
  })),
  {
    tool: 'ebay_update_combined_payments',
    required: ['marketplaceId', 'combinedPayments'],
    args: { marketplaceId: 'EBAY_DE', combinedPayments: { combinedDuration: 'DAYS_30' } },
    method: 'POST',
    path: `${RULES}/update_combined_payments`,
    body: { combinedDuration: 'DAYS_30' },
    marketplace: 'EBAY_DE',
  },
  {
    tool: 'ebay_set_user_preferences',
    required: ['marketplaceId', 'preferences'],
    args: { marketplaceId: 'EBAY_GB', preferences },
    method: 'PATCH',
    path: `${BASE}/user_preferences`,
    body: preferences,
    marketplace: 'EBAY_GB',
  },
];

/** Every Account v2 read tool: its MCP contract and the eBay GET it must relay. */
const readCases = [
  {
    tool: 'ebay_get_rate_table',
    required: ['rateTableId'],
    args: { rateTableId: 'RT/1' },
    path: `${BASE}/rate_table/RT%2F1`,
    query: {},
    marketplace: 'EBAY_US',
    response: { rateTableId: 'RT/1', rates: [{ rateId: 'R1', shippingCost: eur('4.99') }] },
  },
  {
    tool: 'ebay_get_payout_settings',
    required: [],
    args: {},
    path: `${BASE}/payout_settings`,
    query: {},
    marketplace: 'EBAY_US',
    response: { payoutInstruments: [{ instrumentId: 'BANK-1', instrumentStatus: 'ACTIVE' }] },
  },
  {
    tool: 'ebay_get_combined_shipping_rules',
    required: ['marketplaceId'],
    args: { marketplaceId: 'EBAY_DE' },
    path: RULES,
    query: {},
    marketplace: 'EBAY_DE',
    response: { ...flatRules, ...promotionalRule },
  },
  {
    tool: 'ebay_get_user_preferences',
    required: ['marketplaceId'],
    args: { marketplaceId: 'EBAY_GB', fieldgroups: 'COMBINED_PAYMENT,SELLER_PROFILE' },
    path: `${BASE}/user_preferences`,
    query: { fieldgroups: 'COMBINED_PAYMENT,SELLER_PROFILE' },
    marketplace: 'EBAY_GB',
    response: { sellerProfilePreferences: { sellerProfileOptedIn: true } },
  },
];

let client: Client;
let runtime: ReturnType<typeof createEbayMcpRuntime>;

const callTool = async (name: string, args: Record<string, unknown>) => {
  const result = await client.callTool({ name, arguments: args });
  const [block] = result.content as { type: string; text: string }[];
  return { isError: result.isError === true, payload: JSON.parse(block.text) as unknown };
};

beforeEach(async () => {
  vi.clearAllMocks();
  vi.stubEnv('EBAY_MCP_TOOLS', 'account');
  nock.cleanAll();
  nock.disableNetConnect();

  mockOAuthClient.hasUserTokens.mockReturnValue(true);
  mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed('mock_access_token'));
  mockOAuthClient.initialize.mockReturnValue(Effect.succeed(undefined));

  const api = new EbaySellerApi(config);
  await Effect.runPromise(api.initialize());
  runtime = createEbayMcpRuntime({
    api,
    serverConfig: { name: 'account-v2-test', version: '0.0.0' },
  });

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: 'integration-client', version: '0.0.0' });
  await runtime.server.connect(serverTransport);
  await client.connect(clientTransport);
});

afterEach(async () => {
  await client.close();
  await runtime.server.close();
  nock.cleanAll();
  nock.enableNetConnect();
  vi.unstubAllEnvs();
});

it('advertises all 14 Account v2 tools with their required inputs and annotations', async () => {
  const { tools } = await client.listTools();
  const byName = new Map(tools.map((tool) => [tool.name, tool]));
  const contracts = [
    ...writeCases.map((entry) => ({ ...entry, readOnly: false })),
    ...readCases.map((entry) => ({ ...entry, readOnly: true })),
  ];

  expect(new Set(contracts.map((entry) => entry.tool)).size).toBe(14);
  for (const { tool: name, required, readOnly } of contracts) {
    const tool = byName.get(name);
    expect(tool, name).toBeDefined();
    expect(tool?.inputSchema.required ?? [], name).toEqual(required);
    expect(tool?.annotations?.readOnlyHint, name).toBe(readOnly);
  }
});

describe('write tools', () => {
  it.each(
    writeCases,
  )('$tool sends $method $path with body and marketplace header', async (entry) => {
    const endpoint = nock(HOST)
      .intercept(entry.path, entry.method, entry.body)
      .matchHeader('x-ebay-c-marketplace-id', entry.marketplace)
      .matchHeader('content-type', JSON_CONTENT_TYPE)
      .reply(204);

    const result = await callTool(entry.tool, entry.args);

    expect(endpoint.isDone()).toBe(true);
    expect(result).toEqual({ isError: false, payload: { status: 'success' } });
  });
});

describe('read tools', () => {
  it.each(readCases)('$tool relays the eBay response from GET $path', async (entry) => {
    const endpoint = nock(HOST)
      .get(entry.path)
      .query(entry.query)
      .matchHeader('x-ebay-c-marketplace-id', entry.marketplace)
      .reply(200, entry.response);

    const result = await callTool(entry.tool, entry.args);

    expect(endpoint.isDone()).toBe(true);
    expect(result).toEqual({ isError: false, payload: entry.response });
  });
});

it('surfaces an eBay validation error as isError with the eBay error detail', async () => {
  const errors = [{ errorId: 20_500, domain: 'API_ACCOUNT', message: 'Must add up to 100.' }];
  nock(HOST).post(`${BASE}/payout_settings/update_percentage`).reply(400, { errors });

  const result = await callTool('ebay_update_payout_percentage', {
    payoutSplit: { payoutInstruments: [{ instrumentId: 'BANK-1', payoutPercentage: '90' }] },
  });

  expect(result.isError).toBe(true);
  expect(result.payload).toMatchObject({ status: 400, details: errors });
});

it('rejects a combined shipping call without a marketplace before contacting eBay', async () => {
  const endpoint = nock(HOST).post(`${RULES}/update_combined_payments`).reply(204);

  const result = await client.callTool({
    name: 'ebay_update_combined_payments',
    arguments: { combinedPayments: { combinedDuration: 'DAYS_30' } },
  });

  expect(result.isError).toBe(true);
  expect(endpoint.isDone()).toBe(false);
});

it('rejects a payout percentage outside 0-100 before contacting eBay', async () => {
  const endpoint = nock(HOST).post(`${BASE}/payout_settings/update_percentage`).reply(204);

  const result = await client.callTool({
    name: 'ebay_update_payout_percentage',
    arguments: {
      payoutSplit: {
        payoutInstruments: [
          { instrumentId: 'BANK-1', payoutPercentage: '101' },
          { instrumentId: 'PAYONEER-1', payoutPercentage: '-1' },
        ],
      },
    },
  });

  expect(result.isError).toBe(true);
  expect(endpoint.isDone()).toBe(false);
});
