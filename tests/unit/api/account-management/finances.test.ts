import type { EbayApiClient } from '@/api/client.js';
import { FinancesApi } from '@/api/account-management/finances.js';
import type { EbayApiError, EndpointInputError } from '@/api/shared/request.js';
import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const APIZ = 'https://apiz.sandbox.ebay.com/sell/finances/v1';
const client = {
  get: vi.fn(),
  getConfig: vi.fn(),
};
// FinancesApi only uses these mocked client methods.
const finances = new FinancesApi(client as unknown as EbayApiClient);
const summaryFilter = { filter: 'transactionStatus:{PAYOUT}' };

/** One FinancesApi endpoint invocation, erased to a common Effect type for table tests. */
type FinancesCall = () => Effect.Effect<unknown, EbayApiError | EndpointInputError>;

beforeEach(() => {
  vi.resetAllMocks();
  client.get.mockResolvedValue({ ok: true });
  client.getConfig.mockReturnValue({ environment: 'sandbox' });
});

describe('FinancesApi apiz collections', () => {
  const page = {
    filter: 'transactionType:{SALE}',
    limit: 50,
    offset: 100,
    sort: 'transactionDate',
  };

  it.each<[string, string, FinancesCall]>([
    ['getOrderEarnings', '/order_earnings', () => finances.getOrderEarnings(page)],
    ['getPayouts', '/payout', () => finances.getPayouts(page)],
    ['getTransactions', '/transaction', () => finances.getTransactions(page)],
  ])('%s sends filter, limit, offset and sort to the apiz host', async (_, path, run) => {
    const response = { total: 1 };
    client.get.mockResolvedValue(response);

    expect(await Effect.runPromise(run())).toBe(response);
    expect(client.get).toHaveBeenCalledWith(`${APIZ}${path}`, page, { absolute: true });
  });

  it.each<[string, string, FinancesCall]>([
    [
      'getOrderEarningsSummary',
      '/order_earnings_summary',
      () => finances.getOrderEarningsSummary(summaryFilter),
    ],
    ['getPayoutSummary', '/payout_summary', () => finances.getPayoutSummary(summaryFilter)],
    [
      'getTransactionSummary',
      '/transaction_summary',
      () => finances.getTransactionSummary(summaryFilter),
    ],
  ])('%s sends only the filter query to the apiz host', async (_, path, run) => {
    await Effect.runPromise(run());

    expect(client.get).toHaveBeenCalledWith(`${APIZ}${path}`, summaryFilter, { absolute: true });
  });

  it('omits the query entirely when no paging or filter input is given', async () => {
    await Effect.runPromise(finances.getPayouts());
    await Effect.runPromise(finances.getSellerFundsSummary());

    expect(client.get).toHaveBeenNthCalledWith(1, `${APIZ}/payout`, undefined, { absolute: true });
    expect(client.get).toHaveBeenNthCalledWith(2, `${APIZ}/seller_funds_summary`, undefined, {
      absolute: true,
    });
  });

  it('passes through the empty body of an HTTP 204 response', async () => {
    client.get.mockResolvedValue(undefined);

    expect(await Effect.runPromise(finances.getTransactions({}))).toBeUndefined();
  });
});

describe('FinancesApi apiz resources by ID', () => {
  it.each<[string, FinancesCall, string]>([
    [
      'getOrderEarningsById',
      () => finances.getOrderEarningsById({ orderId: '12-345/67' }),
      '/order_earnings/12-345%2F67',
    ],
    ['getPayout', () => finances.getPayout({ payoutId: '5 000' }), '/payout/5%20000'],
    ['getTransfer', () => finances.getTransfer({ transferId: 'T#1' }), '/transfer/T%231'],
  ])('%s encodes the ID in the path', async (_, run, path) => {
    await Effect.runPromise(run());

    expect(client.get).toHaveBeenCalledWith(`${APIZ}${path}`, undefined, { absolute: true });
  });

  it('sends a per-call marketplace header when marketplaceId is given', async () => {
    await Effect.runPromise(finances.getPayout({ payoutId: 'P1', marketplaceId: 'EBAY_DE' }));

    expect(client.get).toHaveBeenCalledWith(`${APIZ}/payout/P1`, undefined, {
      absolute: true,
      headers: { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_DE' },
    });
  });
});

describe('FinancesApi hosts', () => {
  it('uses the production apiz host in production', async () => {
    client.getConfig.mockReturnValue({ environment: 'production' });

    await Effect.runPromise(finances.getSellerFundsSummary({}));

    expect(client.get).toHaveBeenCalledWith(
      'https://apiz.ebay.com/sell/finances/v1/seller_funds_summary',
      undefined,
      { absolute: true },
    );
  });

  it('routes apiz calls through EBAY_MCP_API_BASE_URL when configured', async () => {
    client.getConfig.mockReturnValue({
      environment: 'production',
      apiBaseUrl: 'https://proxy.example.com',
    });

    await Effect.runPromise(finances.getTransfer({ transferId: 'T1' }));

    expect(client.get).toHaveBeenCalledWith(
      'https://proxy.example.com/sell/finances/v1/transfer/T1',
      undefined,
      { absolute: true },
    );
  });

  it('calls getBillingActivities on the default api host with its query', async () => {
    const response = { billingActivities: [] };
    client.get.mockResolvedValue(response);

    expect(
      await Effect.runPromise(
        finances.getBillingActivities({ filter: 'orderId:{12-34}', limit: 10, offset: 0 }),
      ),
    ).toBe(response);
    expect(client.get).toHaveBeenCalledWith('/sell/finances/v1/billing_activity', {
      filter: 'orderId:{12-34}',
      limit: 10,
      offset: 0,
    });
    expect(client.getConfig).not.toHaveBeenCalled();
  });

  it('sends a per-call Accept-Language header for getBillingActivities', async () => {
    await Effect.runPromise(
      finances.getBillingActivities({ acceptLanguage: 'de-DE', filter: 'orderId:{12-34}' }),
    );

    expect(client.get).toHaveBeenCalledWith(
      '/sell/finances/v1/billing_activity',
      { filter: 'orderId:{12-34}' },
      {
        headers: { 'Accept-Language': 'de-DE' },
      },
    );
  });
});

describe('FinancesApi failures', () => {
  it('fails with EbayApiError carrying the relative eBay path', async () => {
    client.get.mockRejectedValue(new Error('eBay API Error: Not found'));

    const error = await Effect.runPromise(Effect.flip(finances.getPayout({ payoutId: 'P1' })));

    expect(error._tag).toBe('EbayApiError');
    expect(error).toMatchObject({ method: 'GET', path: '/sell/finances/v1/payout/P1' });
  });

  it('fails with EbayApiError when billing activity is rejected', async () => {
    client.get.mockRejectedValue(new Error('eBay API Error: filter required'));

    const error = await Effect.runPromise(
      Effect.flip(finances.getBillingActivities({ filter: 'orderId:{12-34}' })),
    );

    expect(error).toMatchObject({
      _tag: 'EbayApiError',
      path: '/sell/finances/v1/billing_activity',
    });
  });

  it.each<[string, FinancesCall]>([
    ['blank payoutId', () => finances.getPayout({ payoutId: '  ' })],
    ['empty transferId', () => finances.getTransfer({ transferId: '' })],
    ['negative offset', () => finances.getTransactions({ offset: -1 })],
    ['zero limit', () => finances.getOrderEarnings({ limit: 0 })],
    [
      'fractional limit',
      () => finances.getBillingActivities({ filter: 'orderId:{1}', limit: 1.5 }),
    ],
    ['limit above the documented maximum', () => finances.getTransactions({ limit: 1001 })],
    ['billing activity without a filter', () => finances.getBillingActivities({} as never)],
    [
      'transaction summary without transactionStatus',
      () => finances.getTransactionSummary({ filter: 'transactionType:{SALE}' }),
    ],
  ])('rejects a %s with EndpointInputError before calling eBay', async (_, run) => {
    const error = await Effect.runPromise(Effect.flip(run()));

    expect(error._tag).toBe('EndpointInputError');
    expect(client.get).not.toHaveBeenCalled();
  });
});
