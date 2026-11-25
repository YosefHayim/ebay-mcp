import { Data } from 'effect';

/** Tagged cause attached to `EbayApiError` for Trading XML failures. */
export class TradingApiFailure extends Data.TaggedError('TradingApiFailure')<{
  /** Trading API call name, such as GetItem. */
  readonly callName: string;
  /** Absolute Trading API request URL. */
  readonly path: string;
  /** Human-readable Trading API failure message. */
  readonly message: string;
  /** Lower-level parser, HTTP, or response payload cause. */
  readonly cause?: unknown;
}> {}
