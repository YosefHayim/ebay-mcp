import type { z } from "zod";
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
} from "@/ebay-apis/finances/financesSchemas.js";
import type {
	EbayApiClient,
	EbayRequestConfig,
} from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	createEbayRequestFailure,
	decodeEndpointInputEffect,
	type QueryParams,
	requestGetEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/sellFinancesV1Oas3.js";
import { getIdentityBaseUrl } from "@/shared/environment.js";

const BASE_PATH = "/sell/finances/v1";

type GetOrderEarningsInput = z.infer<typeof getOrderEarningsInputSchema>;
type GetOrderEarningsByIdInput = z.infer<
	typeof getOrderEarningsByIdInputSchema
>;
type GetOrderEarningsSummaryInput = z.infer<
	typeof getOrderEarningsSummaryInputSchema
>;
type GetPayoutInput = z.infer<typeof getPayoutInputSchema>;
type GetPayoutsInput = z.infer<typeof getPayoutsInputSchema>;
type GetPayoutSummaryInput = z.infer<typeof getPayoutSummaryInputSchema>;
type GetSellerFundsSummaryInput = z.infer<
	typeof getSellerFundsSummaryInputSchema
>;
type GetTransactionsInput = z.infer<typeof getTransactionsInputSchema>;
type GetTransactionSummaryInput = z.infer<
	typeof getTransactionSummaryInputSchema
>;
type GetTransferInput = z.infer<typeof getTransferInputSchema>;
type GetBillingActivitiesInput = z.infer<
	typeof getBillingActivitiesInputSchema
>;
type FinancesPageQuery = Pick<
	GetTransactionsInput,
	"filter" | "limit" | "offset" | "sort"
>;

function pageQuery(input: FinancesPageQuery): QueryParams | undefined {
	return buildEndpointParams({
		filter: { wireName: "filter", value: input.filter },
		limit: { wireName: "limit", value: input.limit },
		offset: { wireName: "offset", value: input.offset },
		sort: { wireName: "sort", value: input.sort },
	});
}

function filterQuery(filter: string | undefined): QueryParams | undefined {
	return buildEndpointParams({ filter: { wireName: "filter", value: filter } });
}

export type OrderEarningsResponse = components["schemas"]["OrderEarnings"];

export type OrderEarningResponse = components["schemas"]["OrderEarning"];

export type OrderEarningsSummaryResponse =
	components["schemas"]["OrderEarningsSummary"];

export type PayoutResponse = components["schemas"]["Payout"];

export type PayoutsResponse = components["schemas"]["Payouts"];

export type PayoutSummaryResponse =
	components["schemas"]["PayoutSummaryResponse"];

export type SellerFundsSummaryResponse =
	components["schemas"]["SellerFundsSummaryResponse"];

export type TransactionsResponse = components["schemas"]["Transactions"];

export type TransactionSummaryResponse =
	components["schemas"]["TransactionSummaryResponse"];

export type TransferResponse = components["schemas"]["Transfer"];

export type BillingActivityResponse =
	components["schemas"]["BillingActivityResponse"];

export class FinancesApi {
	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	private readonly getFromApiz = async <T>(
		path: string,
		params: QueryParams | undefined,
		marketplaceId: string | undefined,
	): Promise<T> => {
		const client = this.client;
		const config: EbayRequestConfig =
			marketplaceId === undefined
				? { absolute: true, signed: true }
				: {
						absolute: true,
						signed: true,
						headers: { "X-EBAY-C-MARKETPLACE-ID": marketplaceId },
					};

		try {
			const { environment, apiBaseUrl } = client.getConfig();
			const url = `${getIdentityBaseUrl(environment, apiBaseUrl)}${path}`;
			return await client.get<T>(url, params, config);
		} catch (cause) {
			throw createEbayRequestFailure("GET", path, cause); // allow-duplicate
		}
	};

	public getOrderEarnings = async (
		input: GetOrderEarningsInput = {},
	): Promise<OrderEarningsResponse> => {
		const getFromApiz = this.getFromApiz;

		const validatedInput = decodeEndpointInputEffect(
			getOrderEarningsInputSchema,
			input,
		);

		return await getFromApiz<OrderEarningsResponse>(
			`${BASE_PATH}/order_earnings`,
			pageQuery(validatedInput),
			validatedInput.marketplaceId,
		);
	};

	public getOrderEarningsById = async (
		input: GetOrderEarningsByIdInput,
	): Promise<OrderEarningResponse> => {
		const getFromApiz = this.getFromApiz;

		const { orderId, marketplaceId } = decodeEndpointInputEffect(
			getOrderEarningsByIdInputSchema,
			input,
		);

		return await getFromApiz<OrderEarningResponse>(
			`${BASE_PATH}/order_earnings/${encodeURIComponent(orderId)}`,
			undefined,
			marketplaceId,
		);
	};

	public getOrderEarningsSummary = async (
		input: GetOrderEarningsSummaryInput = {},
	): Promise<OrderEarningsSummaryResponse> => {
		const getFromApiz = this.getFromApiz;

		const { filter, marketplaceId } = decodeEndpointInputEffect(
			getOrderEarningsSummaryInputSchema,
			input,
		);

		return await getFromApiz<OrderEarningsSummaryResponse>(
			`${BASE_PATH}/order_earnings_summary`,
			filterQuery(filter),
			marketplaceId,
		);
	};

	public getPayout = async (input: GetPayoutInput): Promise<PayoutResponse> => {
		const getFromApiz = this.getFromApiz;

		const { payoutId, marketplaceId } = decodeEndpointInputEffect(
			getPayoutInputSchema,
			input,
		);

		return await getFromApiz<PayoutResponse>(
			`${BASE_PATH}/payout/${encodeURIComponent(payoutId)}`,
			undefined,
			marketplaceId,
		);
	};

	public getPayouts = async (
		input: GetPayoutsInput = {},
	): Promise<PayoutsResponse | undefined> => {
		const getFromApiz = this.getFromApiz;

		const validatedInput = decodeEndpointInputEffect(
			getPayoutsInputSchema,
			input,
		);

		return await getFromApiz<PayoutsResponse | undefined>(
			`${BASE_PATH}/payout`,
			pageQuery(validatedInput),
			validatedInput.marketplaceId,
		);
	};

	public getPayoutSummary = async (
		input: GetPayoutSummaryInput = {},
	): Promise<PayoutSummaryResponse> => {
		const getFromApiz = this.getFromApiz;

		const { filter, marketplaceId } = decodeEndpointInputEffect(
			getPayoutSummaryInputSchema,
			input,
		);

		return await getFromApiz<PayoutSummaryResponse>(
			`${BASE_PATH}/payout_summary`,
			filterQuery(filter),
			marketplaceId,
		);
	};

	public getSellerFundsSummary = async (
		input: GetSellerFundsSummaryInput = {},
	): Promise<SellerFundsSummaryResponse | undefined> => {
		const getFromApiz = this.getFromApiz;

		const { marketplaceId } = decodeEndpointInputEffect(
			getSellerFundsSummaryInputSchema,
			input,
		);

		return await getFromApiz<SellerFundsSummaryResponse | undefined>(
			`${BASE_PATH}/seller_funds_summary`,
			undefined,
			marketplaceId,
		);
	};

	public getTransactions = async (
		input: GetTransactionsInput = {},
	): Promise<TransactionsResponse | undefined> => {
		const getFromApiz = this.getFromApiz;

		const validatedInput = decodeEndpointInputEffect(
			getTransactionsInputSchema,
			input,
		);

		return await getFromApiz<TransactionsResponse | undefined>(
			`${BASE_PATH}/transaction`,
			pageQuery(validatedInput),
			validatedInput.marketplaceId,
		);
	};

	public getTransactionSummary = async (
		input: GetTransactionSummaryInput,
	): Promise<TransactionSummaryResponse> => {
		const getFromApiz = this.getFromApiz;

		const { filter, marketplaceId } = decodeEndpointInputEffect(
			getTransactionSummaryInputSchema,
			input,
		);

		return await getFromApiz<TransactionSummaryResponse>(
			`${BASE_PATH}/transaction_summary`,
			filterQuery(filter),
			marketplaceId,
		);
	};

	public getTransfer = async (
		input: GetTransferInput,
	): Promise<TransferResponse> => {
		const getFromApiz = this.getFromApiz;

		const { transferId, marketplaceId } = decodeEndpointInputEffect(
			getTransferInputSchema,
			input,
		);

		return await getFromApiz<TransferResponse>(
			`${BASE_PATH}/transfer/${encodeURIComponent(transferId)}`,
			undefined,
			marketplaceId,
		);
	};

	public getBillingActivities = async (
		input: GetBillingActivitiesInput,
	): Promise<BillingActivityResponse> => {
		const client = this.client;

		const validatedInput = decodeEndpointInputEffect(
			getBillingActivitiesInputSchema,
			input,
		);
		const config: EbayRequestConfig =
			validatedInput.acceptLanguage === undefined
				? { signed: true }
				: {
						signed: true,
						headers: { "Accept-Language": validatedInput.acceptLanguage },
					};

		return await requestGetEffect<BillingActivityResponse>(
			client,
			`${BASE_PATH}/billing_activity`,
			pageQuery(validatedInput),
			config,
		);
	};
}
