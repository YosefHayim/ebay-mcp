import type { EbayApiClient, EbayRequestConfig } from '@/api/client.js';
import {
  buildEndpointParams,
  EbayApiError,
  EndpointInputError,
  type QueryParams,
  requestGetEffect,
} from '@/api/shared/request.js';
import { getIdentityBaseUrl } from '@/config/environment.js';
import {
  getBillingActivitiesInputSchema,
  getOrderEarningsByIdInputSchema,
  getOrderEarningsInputSchema,
  getOrderEarningsSummaryInputSchema,
  getPayoutInputSchema,
  getPayoutSummaryInputSchema,
  getPayoutsInputSchema,
  getSellerFundsSummaryInputSchema,
  getTransactionSummaryInputSchema,
  getTransactionsInputSchema,
  getTransferInputSchema,
} from '@/schemas/account-management/finances.js';
import type { components } from '@/types/sell-apps/account-management/sellFinancesV1Oas3.js';
import { decodeEffectSchema } from '@/utils/effectSchema.js';
import type { EffectBackedSchema, InferEffectSchema } from '@/utils/effectSchemaTypes.js';
import { Effect } from 'effect';

const BASE_PATH = '/sell/finances/v1';

type GetOrderEarningsInput = InferEffectSchema<typeof getOrderEarningsInputSchema>;
type GetOrderEarningsByIdInput = InferEffectSchema<typeof getOrderEarningsByIdInputSchema>;
type GetOrderEarningsSummaryInput = InferEffectSchema<typeof getOrderEarningsSummaryInputSchema>;
type GetPayoutInput = InferEffectSchema<typeof getPayoutInputSchema>;
type GetPayoutsInput = InferEffectSchema<typeof getPayoutsInputSchema>;
type GetPayoutSummaryInput = InferEffectSchema<typeof getPayoutSummaryInputSchema>;
type GetSellerFundsSummaryInput = InferEffectSchema<typeof getSellerFundsSummaryInputSchema>;
type GetTransactionsInput = InferEffectSchema<typeof getTransactionsInputSchema>;
type GetTransactionSummaryInput = InferEffectSchema<typeof getTransactionSummaryInputSchema>;
type GetTransferInput = InferEffectSchema<typeof getTransferInputSchema>;
type GetBillingActivitiesInput = InferEffectSchema<typeof getBillingActivitiesInputSchema>;
/** Query fields shared by the paginated Finances collections. */
type FinancesPageQuery = Pick<GetTransactionsInput, 'filter' | 'limit' | 'offset' | 'sort'>;

/** Decodes endpoint input through its schema, reporting failures as EndpointInputError. */
const decodeInput = <TSchema extends EffectBackedSchema>(
  schema: TSchema,
  input: unknown,
): Effect.Effect<InferEffectSchema<TSchema>, EndpointInputError> =>
  decodeEffectSchema(schema, input).pipe(
    Effect.mapError(
      (cause) => new EndpointInputError({ parameter: 'input', message: cause.message }),
    ),
  );

/** Maps the shared filter/limit/offset/sort fields to their eBay query names. */
const pageQuery = (input: FinancesPageQuery): QueryParams | undefined =>
  buildEndpointParams({
    filter: { wireName: 'filter', value: input.filter },
    limit: { wireName: 'limit', value: input.limit },
    offset: { wireName: 'offset', value: input.offset },
    sort: { wireName: 'sort', value: input.sort },
  });

/** Maps the single filter field accepted by the Finances summary endpoints. */
const filterQuery = (filter: string | undefined): QueryParams | undefined =>
  buildEndpointParams({ filter: { wireName: 'filter', value: filter } });

/**
 * Response returned by getOrderEarnings.
 *
 * @see https://developer.ebay.com/api-docs/sell/finances/resources/order_earnings/methods/getOrderEarnings
 */
export type OrderEarningsResponse = components['schemas']['OrderEarnings'];

/**
 * Response returned by getOrderEarningsById.
 *
 * @see https://developer.ebay.com/api-docs/sell/finances/resources/order_earnings/methods/getOrderEarningsById
 */
export type OrderEarningResponse = components['schemas']['OrderEarning'];

/**
 * Response returned by getOrderEarningsSummary.
 *
 * @see https://developer.ebay.com/api-docs/sell/finances/resources/order_earnings/methods/getOrderEarningsSummary
 */
export type OrderEarningsSummaryResponse = components['schemas']['OrderEarningsSummary'];

/**
 * Response returned by getPayout.
 *
 * @see https://developer.ebay.com/api-docs/sell/finances/resources/payout/methods/getPayout
 */
export type PayoutResponse = components['schemas']['Payout'];

/**
 * Response returned by getPayouts; eBay may answer 204 with no body when nothing matches.
 *
 * @see https://developer.ebay.com/api-docs/sell/finances/resources/payout/methods/getPayouts
 */
export type PayoutsResponse = components['schemas']['Payouts'];

/**
 * Response returned by getPayoutSummary.
 *
 * @see https://developer.ebay.com/api-docs/sell/finances/resources/payout/methods/getPayoutSummary
 */
export type PayoutSummaryResponse = components['schemas']['PayoutSummaryResponse'];

/**
 * Response returned by getSellerFundsSummary; eBay answers 204 with no body when no funds are pending.
 *
 * @see https://developer.ebay.com/api-docs/sell/finances/resources/seller_funds_summary/methods/getSellerFundsSummary
 */
export type SellerFundsSummaryResponse = components['schemas']['SellerFundsSummaryResponse'];

/**
 * Response returned by getTransactions; eBay answers 204 with no body when nothing matches.
 *
 * @see https://developer.ebay.com/api-docs/sell/finances/resources/transaction/methods/getTransactions
 */
export type TransactionsResponse = components['schemas']['Transactions'];

/**
 * Response returned by getTransactionSummary.
 *
 * @see https://developer.ebay.com/api-docs/sell/finances/resources/transaction/methods/getTransactionSummary
 */
export type TransactionSummaryResponse = components['schemas']['TransactionSummaryResponse'];

/**
 * Response returned by getTransfer.
 *
 * @see https://developer.ebay.com/api-docs/sell/finances/resources/transfer/methods/getTransfer
 */
export type TransferResponse = components['schemas']['Transfer'];

/**
 * Response returned by getBillingActivities.
 *
 * @see https://developer.ebay.com/api-docs/sell/finances/resources/billing_activity/methods/getBillingActivities
 */
export type BillingActivityResponse = components['schemas']['BillingActivityResponse'];

/**
 * Finances API - payouts, transactions, transfers, seller funds, billing activity, and order
 * earnings. Every operation except getBillingActivities is served from the apiz host.
 */
export class FinancesApi {
  public constructor(private readonly client: EbayApiClient) {}

  /**
   * Sends a GET to the apiz host (or EBAY_MCP_API_BASE_URL) with an optional marketplace
   * header, keeping the relative eBay path in the typed error.
   */
  private readonly getFromApiz = <T>(
    path: string,
    params: QueryParams | undefined,
    marketplaceId: string | undefined,
  ): Effect.Effect<T, EbayApiError> => {
    const client = this.client;
    const config: EbayRequestConfig =
      marketplaceId === undefined
        ? { absolute: true }
        : { absolute: true, headers: { 'X-EBAY-C-MARKETPLACE-ID': marketplaceId } };

    return Effect.tryPromise({
      try: () => {
        const { environment, apiBaseUrl } = client.getConfig();
        const url = `${getIdentityBaseUrl(environment, apiBaseUrl)}${path}`;
        return client.get<T>(url, params, config);
      },
      catch: (cause) => new EbayApiError({ method: 'GET', path, cause }), // allow-duplicate
    });
  };

  /**
   * Retrieves order-level earnings (gross amount, expenses, refunds, net earnings) for the
   * seller's orders. Requires the optional sell.finances.earnings.read scope.
   *
   * @param input - Optional orderCreationDate filter, pagination, sort, and marketplace override.
   * @returns An Effect that succeeds with eBay's OrderEarnings page.
   *
   * @example
   * ```ts
   * const earnings = await Effect.runPromise(
   *   financesApi.getOrderEarnings({
   *     filter: 'orderCreationDate:[2024-10-23T00:00:01.000Z..2024-11-09T00:00:01.000Z]',
   *     limit: 50,
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/finances/resources/order_earnings/methods/getOrderEarnings
   */
  public getOrderEarnings = (
    input: GetOrderEarningsInput = {},
  ): Effect.Effect<OrderEarningsResponse, EbayApiError | EndpointInputError> => {
    const getFromApiz = this.getFromApiz;

    return Effect.gen(function* () {
      const request = yield* decodeInput(getOrderEarningsInputSchema, input);

      return yield* getFromApiz<OrderEarningsResponse>(
        `${BASE_PATH}/order_earnings`,
        pageQuery(request),
        request.marketplaceId,
      );
    });
  };

  /**
   * Retrieves earnings for one order. Requires the optional sell.finances.earnings.read scope.
   *
   * @param input - eBay order ID plus optional marketplace override.
   * @returns An Effect that succeeds with eBay's OrderEarning.
   *
   * @example
   * ```ts
   * const earning = await Effect.runPromise(
   *   financesApi.getOrderEarningsById({ orderId: '12-12345-12345' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/finances/resources/order_earnings/methods/getOrderEarningsById
   */
  public getOrderEarningsById = (
    input: GetOrderEarningsByIdInput,
  ): Effect.Effect<OrderEarningResponse, EbayApiError | EndpointInputError> => {
    const getFromApiz = this.getFromApiz;

    return Effect.gen(function* () {
      const { orderId, marketplaceId } = yield* decodeInput(getOrderEarningsByIdInputSchema, input);

      return yield* getFromApiz<OrderEarningResponse>(
        `${BASE_PATH}/order_earnings/${encodeURIComponent(orderId)}`,
        undefined,
        marketplaceId,
      );
    });
  };

  /**
   * Retrieves aggregated order earnings for orders created in a date range. Requires the
   * optional sell.finances.earnings.read scope.
   *
   * @param input - Optional orderCreationDate filter and marketplace override.
   * @returns An Effect that succeeds with eBay's OrderEarningsSummary.
   *
   * @example
   * ```ts
   * const summary = await Effect.runPromise(financesApi.getOrderEarningsSummary({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/finances/resources/order_earnings/methods/getOrderEarningsSummary
   */
  public getOrderEarningsSummary = (
    input: GetOrderEarningsSummaryInput = {},
  ): Effect.Effect<OrderEarningsSummaryResponse, EbayApiError | EndpointInputError> => {
    const getFromApiz = this.getFromApiz;

    return Effect.gen(function* () {
      const { filter, marketplaceId } = yield* decodeInput(
        getOrderEarningsSummaryInputSchema,
        input,
      );

      return yield* getFromApiz<OrderEarningsSummaryResponse>(
        `${BASE_PATH}/order_earnings_summary`,
        filterQuery(filter),
        marketplaceId,
      );
    });
  };

  /**
   * Retrieves one seller payout by ID.
   *
   * @param input - Payout ID (not a split-payout payoutReference) plus optional marketplace override.
   * @returns An Effect that succeeds with eBay's Payout.
   *
   * @example
   * ```ts
   * const payout = await Effect.runPromise(financesApi.getPayout({ payoutId: '5000000001' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/finances/resources/payout/methods/getPayout
   */
  public getPayout = (
    input: GetPayoutInput,
  ): Effect.Effect<PayoutResponse, EbayApiError | EndpointInputError> => {
    const getFromApiz = this.getFromApiz;

    return Effect.gen(function* () {
      const { payoutId, marketplaceId } = yield* decodeInput(getPayoutInputSchema, input);

      return yield* getFromApiz<PayoutResponse>(
        `${BASE_PATH}/payout/${encodeURIComponent(payoutId)}`,
        undefined,
        marketplaceId,
      );
    });
  };

  /**
   * Retrieves seller payouts with optional date/status filtering, pagination, and sorting.
   *
   * @param input - Optional payout filter, pagination, sort, and marketplace override.
   * @returns An Effect that succeeds with eBay's Payouts page, or undefined on HTTP 204.
   *
   * @example
   * ```ts
   * const payouts = await Effect.runPromise(
   *   financesApi.getPayouts({ filter: 'payoutStatus:{SUCCEEDED}', limit: 20 }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/finances/resources/payout/methods/getPayouts
   */
  public getPayouts = (
    input: GetPayoutsInput = {},
  ): Effect.Effect<PayoutsResponse | undefined, EbayApiError | EndpointInputError> => {
    const getFromApiz = this.getFromApiz;

    return Effect.gen(function* () {
      const request = yield* decodeInput(getPayoutsInputSchema, input);

      return yield* getFromApiz<PayoutsResponse | undefined>(
        `${BASE_PATH}/payout`,
        pageQuery(request),
        request.marketplaceId,
      );
    });
  };

  /**
   * Retrieves cumulative payout counts and amounts, optionally filtered by date and status.
   *
   * @param input - Optional payoutDate/payoutStatus filter and marketplace override.
   * @returns An Effect that succeeds with eBay's PayoutSummaryResponse.
   *
   * @example
   * ```ts
   * const summary = await Effect.runPromise(
   *   financesApi.getPayoutSummary({ filter: 'payoutStatus:{SUCCEEDED}' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/finances/resources/payout/methods/getPayoutSummary
   */
  public getPayoutSummary = (
    input: GetPayoutSummaryInput = {},
  ): Effect.Effect<PayoutSummaryResponse, EbayApiError | EndpointInputError> => {
    const getFromApiz = this.getFromApiz;

    return Effect.gen(function* () {
      const { filter, marketplaceId } = yield* decodeInput(getPayoutSummaryInputSchema, input);

      return yield* getFromApiz<PayoutSummaryResponse>(
        `${BASE_PATH}/payout_summary`,
        filterQuery(filter),
        marketplaceId,
      );
    });
  };

  /**
   * Retrieves funds not yet paid out: available, processing, and on-hold amounts.
   *
   * @param input - Optional marketplace override.
   * @returns An Effect that succeeds with eBay's SellerFundsSummaryResponse, or undefined on
   * HTTP 204 when no funds are pending.
   *
   * @example
   * ```ts
   * const funds = await Effect.runPromise(financesApi.getSellerFundsSummary({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/finances/resources/seller_funds_summary/methods/getSellerFundsSummary
   */
  public getSellerFundsSummary = (
    input: GetSellerFundsSummaryInput = {},
  ): Effect.Effect<SellerFundsSummaryResponse | undefined, EbayApiError | EndpointInputError> => {
    const getFromApiz = this.getFromApiz;

    return Effect.gen(function* () {
      const { marketplaceId } = yield* decodeInput(getSellerFundsSummaryInputSchema, input);

      return yield* getFromApiz<SellerFundsSummaryResponse | undefined>(
        `${BASE_PATH}/seller_funds_summary`,
        undefined,
        marketplaceId,
      );
    });
  };

  /**
   * Retrieves monetary transactions (sales, refunds, credits, fees, transfers, and more).
   *
   * @param input - Optional transaction filter, pagination, sort, and marketplace override.
   * @returns An Effect that succeeds with eBay's Transactions page, or undefined on HTTP 204.
   *
   * @example
   * ```ts
   * const sales = await Effect.runPromise(
   *   financesApi.getTransactions({ filter: 'transactionType:{SALE}', limit: 100 }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/finances/resources/transaction/methods/getTransactions
   */
  public getTransactions = (
    input: GetTransactionsInput = {},
  ): Effect.Effect<TransactionsResponse | undefined, EbayApiError | EndpointInputError> => {
    const getFromApiz = this.getFromApiz;

    return Effect.gen(function* () {
      const request = yield* decodeInput(getTransactionsInputSchema, input);

      return yield* getFromApiz<TransactionsResponse | undefined>(
        `${BASE_PATH}/transaction`,
        pageQuery(request),
        request.marketplaceId,
      );
    });
  };

  /**
   * Retrieves cumulative counts and amounts for monetary transactions, including on-hold funds.
   *
   * @param input - Transaction filter (eBay requires a transactionStatus criterion) and optional
   * marketplace override.
   * @returns An Effect that succeeds with eBay's TransactionSummaryResponse.
   *
   * @example
   * ```ts
   * const summary = await Effect.runPromise(
   *   financesApi.getTransactionSummary({ filter: 'transactionStatus:{PAYOUT}' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/finances/resources/transaction/methods/getTransactionSummary
   */
  public getTransactionSummary = (
    input: GetTransactionSummaryInput = {},
  ): Effect.Effect<TransactionSummaryResponse, EbayApiError | EndpointInputError> => {
    const getFromApiz = this.getFromApiz;

    return Effect.gen(function* () {
      const { filter, marketplaceId } = yield* decodeInput(getTransactionSummaryInputSchema, input);

      return yield* getFromApiz<TransactionSummaryResponse>(
        `${BASE_PATH}/transaction_summary`,
        filterQuery(filter),
        marketplaceId,
      );
    });
  };

  /**
   * Retrieves one TRANSFER transaction (a seller reimbursing eBay for charges such as refunds).
   *
   * @param input - TRANSFER transaction ID plus optional marketplace override.
   * @returns An Effect that succeeds with eBay's Transfer.
   *
   * @example
   * ```ts
   * const transfer = await Effect.runPromise(
   *   financesApi.getTransfer({ transferId: '0-00000-00000' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/finances/resources/transfer/methods/getTransfer
   */
  public getTransfer = (
    input: GetTransferInput,
  ): Effect.Effect<TransferResponse, EbayApiError | EndpointInputError> => {
    const getFromApiz = this.getFromApiz;

    return Effect.gen(function* () {
      const { transferId, marketplaceId } = yield* decodeInput(getTransferInputSchema, input);

      return yield* getFromApiz<TransferResponse>(
        `${BASE_PATH}/transfer/${encodeURIComponent(transferId)}`,
        undefined,
        marketplaceId,
      );
    });
  };

  /**
   * Retrieves the seller's billing activities (fees and credits) for one activity, listing,
   * order, or date range. Unlike the rest of the Finances API this is served from the api host.
   *
   * @param input - Billing filter, pagination, sort, and optional Accept-Language override.
   * @returns An Effect that succeeds with eBay's BillingActivityResponse.
   *
   * @example
   * ```ts
   * const activities = await Effect.runPromise(
   *   financesApi.getBillingActivities({ filter: 'orderId:{12-12345-12345}' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/finances/resources/billing_activity/methods/getBillingActivities
   */
  public getBillingActivities = (
    input: GetBillingActivitiesInput = {},
  ): Effect.Effect<BillingActivityResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;

    return Effect.gen(function* () {
      const request = yield* decodeInput(getBillingActivitiesInputSchema, input);
      const config: EbayRequestConfig | undefined =
        request.acceptLanguage === undefined
          ? undefined
          : { headers: { 'Accept-Language': request.acceptLanguage } };

      return yield* requestGetEffect<BillingActivityResponse>(
        client,
        `${BASE_PATH}/billing_activity`,
        pageQuery(request),
        config,
      );
    });
  };
}
