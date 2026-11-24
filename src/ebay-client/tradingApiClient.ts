import XmlBuilder, {
	type XMLBuilder as XmlBuilderInstance,
} from "fast-xml-builder";
import { XMLParser } from "fast-xml-parser";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import { getBaseUrl, getTradingSiteId } from "@/shared/environment.js";
import { getErrorMessage } from "@/shared/errors.js";
import { httpRequest } from "@/shared/http.js";
import { apiLogger } from "@/shared/logger.js";
import { isRecord } from "@/shared/typeGuards.js";

const COMPAT_LEVEL = "1451";
const TRADING_ENDPOINT_PATH = "/ws/api.dll";
const TRADING_XMLNS = "urn:ebay:apis:eBLBaseComponents";

/** Context required to report a failed Trading API call. */
interface TradingFailureContext {
	/** Trading API call name, such as GetItem. */
	readonly callName: string;
	/** Absolute Trading API request URL. */
	readonly path: string;
}

/** Values required to create an authorized Trading API header set. */
interface TradingAuthContext extends TradingFailureContext {
	/** REST client that owns OAuth configuration for the seller account. */
	readonly restClient: EbayApiClient;
	/** Base Trading API headers before optional OAuth injection. */
	readonly headers: Record<string, string>;
}

/** Values required to send one Trading API XML request. */
interface TradingPostContext extends TradingFailureContext {
	/** Request headers sent to the Trading API endpoint. */
	readonly headers: Record<string, string>;
	/** XML request body. */
	readonly xmlBody: string;
}

/** Values required to parse a Trading API XML response. */
interface TradingParseContext extends TradingFailureContext {
	/** XML parser configured for Trading API response shapes. */
	readonly parser: XMLParser;
	/** XML response body returned by the Trading API endpoint. */
	readonly responseText: string;
}

const buildTradingPath = (baseUrl: string): string =>
	`${baseUrl}${TRADING_ENDPOINT_PATH}`;

const buildTradingHeaders = (callName: string): Record<string, string> => ({
	"X-EBAY-API-SITEID": getTradingSiteId(),
	"X-EBAY-API-COMPATIBILITY-LEVEL": COMPAT_LEVEL,
	"X-EBAY-API-CALL-NAME": callName,
	"Content-Type": "text/xml",
});

const buildTradingXmlBody = (
	builder: XmlBuilderInstance,
	requestTag: string,
	params: Record<string, unknown>,
): string => {
	const xmlObject: Record<string, unknown> = {
		[requestTag]: {
			"@_xmlns": TRADING_XMLNS,
			...params,
		},
	};

	return `<?xml version="1.0" encoding="utf-8"?>\n${builder.build(xmlObject)}`;
};

function createTradingApiError(
	{ callName, path }: TradingFailureContext,
	message: string,
	cause?: unknown,
): Error {
	const detail = `Trading API ${callName} ${message}`;
	const wrapped = `eBay POST ${path} failed: ${detail}`;

	if (cause === undefined) {
		return new Error(wrapped);
	}

	return new Error(wrapped, { cause });
}

async function authorizeTradingHeaders({
	restClient,
	headers,
	callName,
	path,
}: TradingAuthContext): Promise<Record<string, string>> {
	if (restClient.getConfig().disableAuthHeader) {
		return headers;
	}

	try {
		const token = await restClient.getOAuthClient().getAccessToken();
		return { ...headers, "X-EBAY-API-IAF-TOKEN": token };
	} catch (error) {
		throw createTradingApiError(
			{ callName, path },
			`token acquisition failed: ${getErrorMessage(error)}`,
		);
	}
}

async function postTradingXml({
	path,
	headers,
	xmlBody,
	callName,
}: TradingPostContext): Promise<{ readonly data: string }> {
	try {
		return await httpRequest<string>({
			method: "POST",
			url: path,
			headers,
			body: xmlBody,
			timeoutMs: 30_000,
			responseType: "text",
		});
	} catch (error) {
		throw createTradingApiError(
			{ callName, path },
			`request failed: ${getErrorMessage(error)}`,
		);
	}
}

function parseTradingXml({
	parser,
	responseText,
	callName,
	path,
}: TradingParseContext): Record<string, unknown> {
	let parsedValue: unknown;

	try {
		parsedValue = parser.parse(responseText);
	} catch (error) {
		throw new Error(
			`eBay POST ${path} failed: Failed to parse Trading API ${callName} response: ${getErrorMessage(error)}`,
			{ cause: error },
		);
	}

	if (isRecord(parsedValue)) {
		return parsedValue;
	}

	throw createTradingApiError({ callName, path }, "response must be an object");
}

function readTradingPayload(
	parsed: Record<string, unknown>,
	responseTag: string,
	{ callName, path }: TradingFailureContext,
): Record<string, unknown> {
	const responsePayload =
		parsed[responseTag] === undefined ? parsed : parsed[responseTag];

	if (isRecord(responsePayload)) {
		return responsePayload;
	}

	throw createTradingApiError(
		{ callName, path },
		"response payload is not an object",
	);
}

const extractTradingErrorMessage = (errors: unknown): string => {
	const firstError = Array.isArray(errors) ? errors[0] : errors;

	if (!isRecord(firstError)) {
		return "Trading API returned a failure without an error message";
	}

	const shortMessage = firstError["ShortMessage"];
	if (typeof shortMessage === "string" && shortMessage !== "") {
		return shortMessage;
	}

	const longMessage = firstError["LongMessage"];
	if (typeof longMessage === "string" && longMessage !== "") {
		return longMessage;
	}

	return "Trading API returned a failure without an error message";
};

function tradingCallFailure(path: string, cause: unknown): Error {
	if (cause instanceof Error) {
		const isAlreadyEbay = cause.message.startsWith("eBay ");

		if (isAlreadyEbay) {
			return cause;
		}
	}

	return new Error(`eBay POST ${path} failed: ${getErrorMessage(cause)}`, {
		cause,
	});
}

function isTradingFailureAck(ack: unknown): boolean {
	if (ack === "Failure") {
		return true;
	}

	if (ack === "PartialFailure") {
		return true;
	}

	return false;
}

function validateTradingAck(
	tradingPayload: Record<string, unknown>,
	{ callName, path }: TradingFailureContext,
): Record<string, unknown> {
	if (tradingPayload["Ack"] === "Warning") {
		apiLogger.warn(`Trading API ${callName} returned warnings`, {
			errors: tradingPayload["Errors"],
		});
	}

	const isFailed = isTradingFailureAck(tradingPayload["Ack"]);

	if (isFailed) {
		throw new Error(
			`eBay POST ${path} failed: ${extractTradingErrorMessage(tradingPayload["Errors"])}`,
			{ cause: tradingPayload["Errors"] },
		);
	}

	return tradingPayload;
}

/**
 * XML-based client for eBay Trading API calls that are not covered by REST APIs.
 */
export class TradingApiClient {
	private readonly restClient: EbayApiClient;
	private readonly baseUrl: string;
	private readonly parser: XMLParser;
	private readonly builder: XmlBuilderInstance;

	constructor(restClient: EbayApiClient) {
		this.restClient = restClient;
		const config = restClient.getConfig();
		this.baseUrl = getBaseUrl(config.environment, config.apiBaseUrl);

		this.parser = new XMLParser({
			ignoreAttributes: false,
			removeNSPrefix: true,
			parseTagValue: true,
			isArray: (_name: string) => {
				const arrayTags = [
					"Item",
					"Errors",
					"Error",
					"NameValueList",
					"Value",
					"ShippingServiceOptions",
					"InternationalShippingServiceOption",
					"PaymentMethods",
					"PictureURL",
					"CompatibilityList",
					"Variation",
				];
				return arrayTags.includes(_name);
			},
		});

		this.builder = new XmlBuilder({
			ignoreAttributes: false,
			format: true,
			suppressEmptyNode: true,
		});
	}

	/**
	 * Return the Trading API base URL for the configured eBay environment.
	 *
	 * @returns The Trading API base URL derived from the configured environment.
	 *
	 * @example
	 * ```ts
	 * const baseUrl = tradingClient.getTradingBaseUrl();
	 * ```
	 */
	getTradingBaseUrl = (): string => this.baseUrl;

	/**
	 * Execute a named Trading API call with XML request/response conversion.
	 *
	 * @param callName - Trading API call name, such as GetItem or AddFixedPriceItem.
	 * @param params - XML request payload fields nested under the generated request tag.
	 * @returns The parsed response payload.
	 *
	 * @example
	 * ```ts
	 * const tradingReply = await tradingClient.execute("GetItem", {
	 *   ItemID: "12345",
	 * });
	 * ```
	 */
	private async runCall(
		callName: string,
		params: Record<string, unknown>,
	): Promise<Record<string, unknown>> {
		const requestTag = `${callName}Request`;
		const responseTag = `${callName}Response`;
		const path = buildTradingPath(this.baseUrl);
		const headers = buildTradingHeaders(callName);
		const xmlBody = buildTradingXmlBody(this.builder, requestTag, params);

		apiLogger.debug(`Trading API ${callName}`, { xmlBody });

		const authorizedHeaders = await authorizeTradingHeaders({
			restClient: this.restClient,
			headers,
			callName,
			path,
		});
		const xmlResponse = await postTradingXml({
			path,
			headers: authorizedHeaders,
			xmlBody,
			callName,
		});
		const parsed = parseTradingXml({
			parser: this.parser,
			responseText: xmlResponse.data,
			callName,
			path,
		});
		const tradingPayload = readTradingPayload(parsed, responseTag, {
			callName,
			path,
		});

		return validateTradingAck(tradingPayload, { callName, path });
	}

	execute = async (
		callName: string,
		params: Record<string, unknown>,
	): Promise<Record<string, unknown>> => {
		const path = buildTradingPath(this.baseUrl);

		try {
			return await this.runCall(callName, params);
		} catch (cause) {
			throw tradingCallFailure(path, cause);
		}
	};
}
