import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';
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
  uploadSiteHostedPicturesSchema,
} from '@/utils/trading/trading.js';
import { getErrorMessage } from '@/utils/errors.js';
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
/** Input accepted by uploadSiteHostedPictures. */
type UploadSiteHostedPicturesInput = InferEffectSchema<typeof uploadSiteHostedPicturesSchema>;

const asRecordArray = (value: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord);
};

/** Map a file extension to the image MIME type eBay Picture Services expects. */
const IMAGE_CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.webp': 'image/webp',
};

/** Resolve an image MIME type from a file name, defaulting to JPEG. */
const imageContentTypeFor = (fileName: string): string =>
  IMAGE_CONTENT_TYPES[extname(fileName).toLowerCase()] ?? 'image/jpeg';

/** Read the FullURL of the eBay-hosted picture from an UploadSiteHostedPictures response. */
const readFullUrl = (result: Record<string, unknown>): string | undefined => {
  const details = result.SiteHostedPictureDetails;
  if (isRecord(details) && typeof details.FullURL === 'string') {
    return details.FullURL;
  }
  return undefined;
};

/** Fields used to resolve the binary image for an UploadSiteHostedPictures call. */
interface UploadImageSource {
  readonly filePath?: string;
  readonly imageBase64?: string;
  readonly pictureName?: string;
}

/** Resolve the multipart image bytes from a local file path or inline base64 data. */
const resolveUploadImage = ({
  filePath,
  imageBase64,
  pictureName,
}: UploadImageSource): Effect.Effect<TradingUploadImage, EndpointInputError> => {
  if (filePath !== undefined) {
    const fileName = basename(filePath);
    return Effect.tryPromise({
      try: () => readFile(filePath),
      catch: (error) =>
        new EndpointInputError({
          parameter: 'filePath',
          message: `Failed to read image file "${filePath}": ${getErrorMessage(error)}`,
        }),
    }).pipe(Effect.map((data) => ({ data, contentType: imageContentTypeFor(fileName), fileName })));
  }

  if (imageBase64 !== undefined) {
    // `Buffer.from(..., 'base64')` silently drops invalid characters and never
    // throws, so malformed input would upload truncated/empty bytes and fail
    // remotely with a confusing eBay error. Validate the base64 shape and the
    // decoded length locally so callers get an actionable input error instead.
    const normalized = imageBase64.replace(/\s+/g, '');
    const data = Buffer.from(normalized, 'base64');
    if (
      normalized.length === 0 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(normalized) ||
      data.length === 0
    ) {
      return Effect.fail(
        new EndpointInputError({
          parameter: 'imageBase64',
          message: 'imageBase64 is not valid base64-encoded image data',
        }),
      );
    }
    const fileName = pictureName === undefined ? 'image.jpg' : `${pictureName}.jpg`;
    return Effect.succeed({
      data,
      contentType: imageContentTypeFor(fileName),
      fileName,
    });
  }

  return Effect.fail(
    new EndpointInputError({
      parameter: 'filePath',
      message: 'Provide one of filePath, imageBase64, or externalPictureUrl to upload a picture',
    }),
  );
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
   * Wraps the Trading API `UploadSiteHostedPictures` call. Supply the image as a
   * local `filePath`, inline `imageBase64`, or an `externalPictureUrl` for eBay to
   * fetch. The returned `fullUrl` (also `SiteHostedPictureDetails.FullURL`) is a
   * public EPS URL usable in `PictureDetails.PictureURL` for create/revise listing.
   *
   * @param input - Image source (one of filePath/imageBase64/externalPictureUrl) and EPS options.
   * @returns An Effect that succeeds with the hosted picture URL and EPS details.
   *
   * @example
   * ```ts
   * const uploaded = await Effect.runPromise(
   *   tradingApi.uploadSiteHostedPictures({ filePath: '/tmp/front.jpg', pictureName: 'front' }),
   * );
   * // uploaded.fullUrl -> https://i.ebayimg.com/...
   * ```
   *
   * @see https://developer.ebay.com/devzone/xml/docs/reference/ebay/uploadsitehostedpictures.html
   */
  uploadSiteHostedPictures = (
    input: UploadSiteHostedPicturesInput,
  ): Effect.Effect<TradingRecordResponse, EbayApiError | EndpointInputError> => {
    const tradingClient = this.client;

    return Effect.gen(function* () {
      const request = yield* requireObjectEffect<UploadSiteHostedPicturesInput>(input, 'input');
      const pictureName = yield* optionalStringEffect(request.pictureName, 'pictureName');
      const pictureSet = yield* optionalStringEffect(request.pictureSet, 'pictureSet');
      const externalPictureUrl = yield* optionalStringEffect(
        request.externalPictureUrl,
        'externalPictureUrl',
      );
      const filePath = yield* optionalStringEffect(request.filePath, 'filePath');
      const imageBase64 = yield* optionalStringEffect(request.imageBase64, 'imageBase64');

      const params: Record<string, unknown> = {
        ...(pictureName === undefined ? {} : { PictureName: pictureName }),
        ...(pictureSet === undefined ? {} : { PictureSet: pictureSet }),
      };

      // ExternalPictureURL is a pure-XML call (eBay fetches the URL); local bytes
      // and base64 go through the multipart uploader.
      const result =
        externalPictureUrl === undefined
          ? yield* tradingClient.uploadPicture(
              'UploadSiteHostedPictures',
              params,
              yield* resolveUploadImage({ filePath, imageBase64, pictureName }),
            )
          : yield* tradingClient.execute('UploadSiteHostedPictures', {
              ...params,
              ExternalPictureURL: externalPictureUrl,
            });

      // The tool's contract is to return a usable hosted URL. eBay returns
      // SiteHostedPictureDetails.FullURL on success; if it is missing, treat it
      // as a response-contract failure rather than reporting a success with an
      // unusable `fullUrl: undefined`.
      const fullUrl = readFullUrl(result);
      if (fullUrl === undefined) {
        const path = tradingClient.getTradingBaseUrl();
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
