import type { TradingApiClient, TradingUploadImage } from '@/api/clientTrading.js';
import { TradingApiFailure } from '@/api/clientTradingError.js';
import {
  EbayApiError,
  EndpointInputError,
  optionalPositiveNumberEffect,
  optionalStringEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type {
  createListingSchema,
  endListingSchema,
  getActiveListingsSchema,
  getListingSchema,
  relistItemSchema,
  reviseListingSchema,
} from '@/utils/trading/trading.js';
import { isRecord } from '@/utils/typeGuards.js';
import { Effect } from 'effect';
import type { InferEffectSchema } from '@/utils/effectSchemaTypes.js';

/** Input accepted by getActiveListings. */
type GetActiveListingsInput = InferEffectSchema<typeof getActiveListingsSchema>;
/** Input accepted by getListing. */
type GetListingInput = InferEffectSchema<typeof getListingSchema>;
/** Input accepted by createListing. */
type CreateListingInput = InferEffectSchema<typeof createListingSchema>;
/** Input accepted by reviseListing. */
type ReviseListingInput = InferEffectSchema<typeof reviseListingSchema>;
/** Input accepted by endListing. */
type EndListingInput = InferEffectSchema<typeof endListingSchema>;
/** Input accepted by relistItem. */
type RelistItemInput = InferEffectSchema<typeof relistItemSchema>;

/**
 * Image payload accepted by {@link TradingApi.uploadSiteHostedPictures}, resolved
 * to bytes by the tool handler. The API layer never touches the filesystem: local
 * files and base64 are read/validated at the MCP tool boundary and passed here as
 * `imageBytes`, mirroring how {@link https://developer.ebay.com/api-docs/sell/fulfillment/resources/payment_dispute/methods/uploadEvidenceFile uploadEvidenceFile} receives bytes.
 */
export interface UploadSiteHostedPicturesApiInput {
  /** Decoded image bytes for a direct EPS upload (multipart). Mutually exclusive with `externalPictureUrl`. */
  readonly imageBytes?: Buffer;
  /** Original file name, used only as a fallback when the content type cannot be sniffed. */
  readonly fileName?: string;
  /** Public image URL for eBay to fetch instead of a direct byte upload. */
  readonly externalPictureUrl?: string;
  /** Optional EPS picture name. */
  readonly pictureName?: string;
  /** Optional EPS picture set (`Standard` | `Supersize`). */
  readonly pictureSet?: string;
}

const asRecordArray = (value: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord);
};

/**
 * Detect the image MIME type from the decoded bytes' magic numbers. The base64
 * upload path carries no file name, so relying on the extension would mislabel
 * every payload as JPEG; sniffing the real format keeps the multipart
 * `Content-Type` accurate so eBay does not reject or mis-handle PNG/GIF/WebP.
 * Returns `undefined` for bytes that match none of the recognized signatures so
 * the caller can fall back to a default MIME type.
 */
export const sniffImageContentType = (data: Buffer): string | undefined => {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    data.length >= 8 &&
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47
  ) {
    return 'image/png';
  }
  if (data.length >= 4 && data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) {
    return 'image/gif';
  }
  if (
    data.length >= 12 &&
    data.toString('ascii', 0, 4) === 'RIFF' &&
    data.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  if (data.length >= 2 && data[0] === 0x42 && data[1] === 0x4d) {
    return 'image/bmp';
  }
  if (
    data.length >= 4 &&
    ((data[0] === 0x49 && data[1] === 0x49 && data[2] === 0x2a && data[3] === 0x00) ||
      (data[0] === 0x4d && data[1] === 0x4d && data[2] === 0x00 && data[3] === 0x2a))
  ) {
    return 'image/tiff';
  }
};

/**
 * Build the multipart image part, sniffing the content type from the bytes'
 * magic numbers. When the format is unrecognized we default to `image/jpeg`
 * rather than guessing from the (often absent) file extension — eBay Picture
 * Services accepts JPEG for the common case and the sniffer already covers the
 * formats worth distinguishing.
 */
const buildUploadImage = (bytes: Buffer, fileName: string | undefined): TradingUploadImage => ({
  data: bytes,
  contentType: sniffImageContentType(bytes) ?? 'image/jpeg',
  fileName: fileName ?? 'image.jpg',
});

/** Read the FullURL of the eBay-hosted picture from an UploadSiteHostedPictures response. */
const readFullUrl = (result: Record<string, unknown>): string | undefined => {
  const details = result.SiteHostedPictureDetails;
  if (isRecord(details) && typeof details.FullURL === 'string') {
    return details.FullURL;
  }
};

/**
 * Parsed Trading API object payload returned unchanged from XML calls.
 *
 * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/index.html
 */
export type TradingRecordResponse = Record<string, unknown>;

/**
 * High-level wrapper for seller listing operations backed by eBay Trading API calls.
 */
export class TradingApi {
  private readonly client: TradingApiClient;

  constructor(client: TradingApiClient) {
    this.client = client;
  }

  /**
   * Fetches active seller listings with Trading API pagination metadata.
   *
   * @param input - Optional page number and entries-per-page values.
   * @returns An Effect that succeeds with the parsed GetMyeBaySelling response payload.
   *
   * @example
   * ```ts
   * const response = await Effect.runPromise(
   *   tradingApi.getActiveListings({ page: 2, entriesPerPage: 25 }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/getmyebayselling.html
   */
  getActiveListings = (
    input: GetActiveListingsInput = {},
  ): Effect.Effect<TradingRecordResponse, EbayApiError | EndpointInputError> => {
    const tradingClient = this.client;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetActiveListingsInput>(input, 'input');
      const inputPage = yield* optionalPositiveNumberEffect(request.page, 'page');
      const inputEntriesPerPage = yield* optionalPositiveNumberEffect(
        request.entriesPerPage,
        'entriesPerPage',
      );
      const page = inputPage === undefined ? 1 : inputPage;
      const entriesPerPage = inputEntriesPerPage === undefined ? 50 : inputEntriesPerPage;

      return yield* tradingClient.execute('GetMyeBaySelling', {
        ActiveList: {
          Sort: 'TimeLeft',
          Pagination: {
            EntriesPerPage: entriesPerPage,
            PageNumber: page,
          },
        },
      });
    });
  };

  /**
   * Fetches a single listing by eBay item ID with full Trading API detail.
   *
   * @param input - eBay item identifier.
   * @returns An Effect that succeeds with the parsed Trading API item payload.
   *
   * @example
   * ```ts
   * const listing = await Effect.runPromise(tradingApi.getListing({ itemId: '12345' }));
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/getitem.html
   */
  getListing = (
    input: GetListingInput,
  ): Effect.Effect<TradingRecordResponse, EbayApiError | EndpointInputError> => {
    const tradingClient = this.client;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<GetListingInput>(input, 'input');
      const itemId = yield* requireStringEffect(request.itemId, 'itemId');
      const result = yield* tradingClient.execute('GetItem', {
        ItemID: itemId,
        DetailLevel: 'ReturnAll',
      });
      const items = asRecordArray(result.Item);

      return items.length > 0 ? items[0] : result;
    });
  };

  /**
   * Creates a fixed-price listing using the supplied Trading API item payload.
   *
   * @param input - Trading API Item payload nested under `item`.
   * @returns An Effect that succeeds with the parsed AddFixedPriceItem response.
   *
   * @example
   * ```ts
   * const listing = await Effect.runPromise(
   *   tradingApi.createListing({ item: { Title: 'New item', StartPrice: 9.99 } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/AddFixedPriceItem.html
   */
  createListing = (
    input: CreateListingInput,
  ): Effect.Effect<TradingRecordResponse, EbayApiError | EndpointInputError> => {
    const tradingClient = this.client;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<CreateListingInput>(input, 'input');
      const item = yield* requireObjectEffect<Record<string, unknown>>(request.item, 'item');

      return yield* tradingClient.execute('AddFixedPriceItem', { Item: item });
    });
  };

  /**
   * Revises a fixed-price listing by merging changes with the eBay item ID.
   *
   * @param input - eBay item identifier plus Trading API Item fields to update.
   * @returns An Effect that succeeds with the parsed ReviseFixedPriceItem response.
   *
   * @example
   * ```ts
   * const listing = await Effect.runPromise(
   *   tradingApi.reviseListing({ itemId: '12345', fields: { Quantity: 10 } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/ReviseFixedPriceItem.html
   */
  reviseListing = (
    input: ReviseListingInput,
  ): Effect.Effect<TradingRecordResponse, EbayApiError | EndpointInputError> => {
    const tradingClient = this.client;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<ReviseListingInput>(input, 'input');
      const itemId = yield* requireStringEffect(request.itemId, 'itemId');
      const fields = yield* requireObjectEffect<Record<string, unknown>>(request.fields, 'fields');

      return yield* tradingClient.execute('ReviseFixedPriceItem', {
        Item: { ...fields, ItemID: itemId },
      });
    });
  };

  /**
   * Ends a fixed-price listing with the provided Trading API ending reason.
   *
   * @param input - eBay item identifier plus optional Trading API ending reason.
   * @returns An Effect that succeeds with the parsed EndFixedPriceItem response.
   *
   * @example
   * ```ts
   * await Effect.runPromise(
   *   tradingApi.endListing({ itemId: '12345', reason: 'NotAvailable' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/endfixedpriceitem.html
   */
  endListing = (
    input: EndListingInput,
  ): Effect.Effect<TradingRecordResponse, EbayApiError | EndpointInputError> => {
    const tradingClient = this.client;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<EndListingInput>(input, 'input');
      const itemId = yield* requireStringEffect(request.itemId, 'itemId');
      const inputReason = yield* optionalStringEffect(request.reason, 'reason');
      const reason = inputReason === undefined ? 'NotAvailable' : inputReason;

      return yield* tradingClient.execute('EndFixedPriceItem', {
        ItemID: itemId,
        EndingReason: reason,
      });
    });
  };

  /**
   * Relists an ended fixed-price item with optional listing modifications.
   *
   * @param input - eBay item identifier plus optional Trading API Item modifications.
   * @returns An Effect that succeeds with the parsed RelistFixedPriceItem response.
   *
   * @example
   * ```ts
   * const listing = await Effect.runPromise(
   *   tradingApi.relistItem({ itemId: '12345', modifications: { Quantity: 20 } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/relistfixedpriceitem.html
   */
  relistItem = (
    input: RelistItemInput,
  ): Effect.Effect<TradingRecordResponse, EbayApiError | EndpointInputError> => {
    const tradingClient = this.client;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<RelistItemInput>(input, 'input');
      const itemId = yield* requireStringEffect(request.itemId, 'itemId');
      let modifications: Record<string, unknown> = {};

      if (request.modifications !== undefined) {
        modifications = yield* requireObjectEffect<Record<string, unknown>>(
          request.modifications,
          'modifications',
        );
      }

      return yield* tradingClient.execute('RelistFixedPriceItem', {
        Item: { ...modifications, ItemID: itemId },
      });
    });
  };

  /**
   * Uploads an image to eBay Picture Services (EPS) and returns its hosted URL.
   *
   * Wraps the Trading API `UploadSiteHostedPictures` call. The image is supplied
   * either as already-resolved `imageBytes` (the MCP tool handler reads a local
   * file or decodes base64 at the I/O boundary) or as an `externalPictureUrl` for
   * eBay to fetch. The returned `fullUrl` (also `SiteHostedPictureDetails.FullURL`)
   * is a public EPS URL usable in `PictureDetails.PictureURL` for create/revise.
   *
   * @param input - Resolved image bytes or an external URL, plus EPS options.
   * @returns An Effect that succeeds with the hosted picture URL and EPS details.
   *
   * @example
   * ```ts
   * const uploaded = await Effect.runPromise(
   *   tradingApi.uploadSiteHostedPictures({ imageBytes, fileName: 'front.jpg', pictureName: 'front' }),
   * );
   * // uploaded.fullUrl -> https://i.ebayimg.com/...
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/uploadsitehostedpictures.html
   */
  uploadSiteHostedPictures = (
    input: UploadSiteHostedPicturesApiInput,
  ): Effect.Effect<TradingRecordResponse, EbayApiError | EndpointInputError> => {
    const tradingClient = this.client;

    return Effect.gen(function* () {
      const params: Record<string, unknown> = {
        ...(input.pictureName === undefined ? {} : { PictureName: input.pictureName }),
        ...(input.pictureSet === undefined ? {} : { PictureSet: input.pictureSet }),
      };

      // ExternalPictureURL is a pure-XML call (eBay fetches the URL); resolved
      // bytes go through the multipart uploader.
      let result: TradingRecordResponse;
      if (input.externalPictureUrl !== undefined) {
        result = yield* tradingClient.execute('UploadSiteHostedPictures', {
          ...params,
          ExternalPictureURL: input.externalPictureUrl,
        });
      } else if (input.imageBytes === undefined) {
        return yield* Effect.fail(
          new EndpointInputError({
            parameter: 'imageBytes',
            message:
              'Provide one of filePath, imageBase64, or externalPictureUrl to upload a picture',
          }),
        );
      } else {
        result = yield* tradingClient.uploadPicture(
          'UploadSiteHostedPictures',
          params,
          buildUploadImage(input.imageBytes, input.fileName),
        );
      }

      // The tool's contract is to return a usable hosted URL. eBay returns
      // SiteHostedPictureDetails.FullURL on success; if it is missing, treat it
      // as a response-contract failure rather than reporting a success with an
      // unusable `fullUrl: undefined`.
      const fullUrl = readFullUrl(result);
      if (fullUrl === undefined) {
        const path = tradingClient.getTradingEndpoint();
        return yield* Effect.fail(
          new EbayApiError({
            method: 'POST',
            path,
            cause: new TradingApiFailure({
              callName: 'UploadSiteHostedPictures',
              path,
              message:
                'Trading API UploadSiteHostedPictures succeeded but returned no SiteHostedPictureDetails.FullURL',
              cause: result,
            }),
          }),
        );
      }

      return { fullUrl, ...result };
    });
  };
}
