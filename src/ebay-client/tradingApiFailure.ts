/** Tagged cause attached to `EbayApiError` for Trading XML failures. */
export class TradingApiFailure extends Error {
	readonly _tag = "TradingApiFailure";
	/** Trading API call name, such as GetItem. */
	readonly callName: string;
	/** Absolute Trading API request URL. */
	readonly path: string;

	constructor(failure: {
		/** Trading API call name, such as GetItem. */
		readonly callName: string;
		/** Absolute Trading API request URL. */
		readonly path: string;
		/** Human-readable Trading API failure message. */
		readonly message: string;
		/** Lower-level parser, HTTP, or response payload cause. */
		readonly cause?: unknown;
	}) {
		super(
			failure.message,
			failure.cause === undefined ? undefined : { cause: failure.cause },
		);
		this.name = "TradingApiFailure";
		this.callName = failure.callName;
		this.path = failure.path;
	}
}
