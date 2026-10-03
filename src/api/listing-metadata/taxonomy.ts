import type { EbayApiClient, EbayRequestConfig } from '@/api/client/ebayApiClient.js';
import {
  type DownloadedFile,
  type DownloadTooLargeError,
  requestDownloadEffect,
} from '@/api/shared/download.js';
import {
  buildEndpointParams,
  decodeEndpointInputEffect,
  type EbayApiError,
  type EndpointInputError,
  requestGetEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import { categoryTreeIdInputSchema } from '@/schemas/taxonomy/categoryTree.js';
import type { components } from '@/types/sell-apps/listing-metadata/commerceTaxonomyV1Oas3.js';
import type { InferEffectSchema } from '@/utils/effectSchemaTypes.js';
import { Effect } from 'effect';

/**
 * fetchItemAspects streams a whole marketplace's aspect file before the inline-size check,
 * so it gets more than the client's 30 s default; larger trees still end in a bounded failure.
 */
const ITEM_ASPECTS_DOWNLOAD: EbayRequestConfig = { timeoutMs: 120_000 };

/** Category tree identifier accepted by fetchItemAspects and getExpiredCategories. */
export type CategoryTreeIdInput = InferEffectSchema<typeof categoryTreeIdInputSchema>;

/** Input accepted by getDefaultCategoryTreeId. */
export interface GetDefaultCategoryTreeIdInput {
  /** eBay marketplace identifier, such as EBAY_US. */
  readonly marketplaceId: string;
}

/** Input accepted by getCategoryTree. */
export interface GetCategoryTreeInput {
  /** Category tree identifier returned by getDefaultCategoryTreeId. */
  readonly categoryTreeId: string;
}

/** Input accepted by getCategorySubtree. */
export interface GetCategorySubtreeInput {
  /** Category tree identifier returned by getDefaultCategoryTreeId. */
  readonly categoryTreeId: string;
  /** Category identifier that anchors the requested subtree. */
  readonly categoryId: string;
}

/** Input accepted by getCategorySuggestions. */
export interface GetCategorySuggestionsInput {
  /** Category tree identifier returned by getDefaultCategoryTreeId. */
  readonly categoryTreeId: string;
  /** Search text used by eBay to suggest matching categories. */
  readonly query: string;
}

/** Input accepted by getItemAspectsForCategory. */
export interface GetItemAspectsForCategoryInput {
  /** Category tree identifier returned by getDefaultCategoryTreeId. */
  readonly categoryTreeId: string;
  /** Category identifier whose item aspects should be returned. */
  readonly categoryId: string;
}

/** Input accepted by getCompatibilityProperties. */
export interface GetCompatibilityPropertiesInput {
  /** Category tree identifier returned by getDefaultCategoryTreeId. */
  readonly categoryTreeId: string;
  /** Compatibility-enabled category identifier. */
  readonly categoryId: string;
}

/** Input accepted by getCompatibilityPropertyValues. */
export interface GetCompatibilityPropertyValuesInput {
  /** Category tree identifier returned by getDefaultCategoryTreeId. */
  readonly categoryTreeId: string;
  /** Compatibility-enabled category identifier. */
  readonly categoryId: string;
  /** Compatibility property name, such as Make, Model, or Year. */
  readonly compatibilityProperty: string;
}

/**
 * Response returned by eBay Taxonomy API getDefaultCategoryTreeId; `undefined` when eBay answers HTTP 204
 * with no content.
 *
 * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getDefaultCategoryTreeId
 */
export type GetDefaultCategoryTreeIdResponse =
  | components['schemas']['BaseCategoryTree']
  | undefined;

/**
 * Response returned by eBay Taxonomy API getCategoryTree.
 *
 * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getCategoryTree
 */
export type GetCategoryTreeResponse = components['schemas']['CategoryTree'];

/**
 * Response returned by eBay Taxonomy API getCategorySubtree.
 *
 * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getCategorySubtree
 */
export type GetCategorySubtreeResponse = components['schemas']['CategorySubtree'];

/**
 * Response returned by eBay Taxonomy API getCategorySuggestions; `undefined` when eBay answers HTTP 204
 * with no content.
 *
 * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getCategorySuggestions
 */
export type GetCategorySuggestionsResponse =
  | components['schemas']['CategorySuggestionResponse']
  | undefined;

/**
 * Response returned by eBay Taxonomy API getItemAspectsForCategory; `undefined` when eBay answers HTTP 204
 * with no content.
 *
 * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getItemAspectsForCategory
 */
export type GetItemAspectsForCategoryResponse = components['schemas']['AspectMetadata'] | undefined;

/**
 * Response returned by eBay Taxonomy API getCompatibilityProperties; `undefined` when eBay answers HTTP 204
 * with no content.
 *
 * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getCompatibilityProperties
 */
export type GetCompatibilityPropertiesResponse =
  | components['schemas']['GetCompatibilityMetadataResponse']
  | undefined;

/**
 * Response returned by eBay Taxonomy API getCompatibilityPropertyValues; `undefined` when eBay answers HTTP 204
 * with no content.
 *
 * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getCompatibilityPropertyValues
 */
export type GetCompatibilityPropertyValuesResponse =
  | components['schemas']['GetCompatibilityPropertyValuesResponse']
  | undefined;

/**
 * Response returned by eBay Taxonomy API getExpiredCategories; `undefined` when eBay answers
 * HTTP 204 because the tree has no mapped expired categories.
 *
 * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getExpiredCategories
 */
export type GetExpiredCategoriesResponse = components['schemas']['ExpiredCategories'] | undefined;

/**
 * Taxonomy API - category trees, category suggestions, item aspects, expired-category
 * mappings, and compatibility metadata.
 */
export class TaxonomyApi {
  private readonly basePath = '/commerce/taxonomy/v1';

  public constructor(private readonly client: EbayApiClient) {}

  /**
   * Retrieves the default category tree ID for a marketplace.
   *
   * @param input - Marketplace identifier used to select the default tree.
   * @returns An Effect that succeeds with eBay's getDefaultCategoryTreeId response, or undefined on HTTP 204.
   *
   * @example
   * ```ts
   * const tree = await Effect.runPromise(
   *   taxonomyApi.getDefaultCategoryTreeId({ marketplaceId: 'EBAY_US' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getDefaultCategoryTreeId
   */
  public getDefaultCategoryTreeId = (
    input: GetDefaultCategoryTreeIdInput,
  ): Effect.Effect<GetDefaultCategoryTreeIdResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/get_default_category_tree_id`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetDefaultCategoryTreeIdInput>(
        input,
        'input',
      );
      const marketplaceId = yield* requireStringEffect(
        validatedInput.marketplaceId,
        'marketplaceId',
      );
      const params = buildEndpointParams({
        marketplaceId: { wireName: 'marketplace_id', value: marketplaceId },
      });

      return yield* requestGetEffect<GetDefaultCategoryTreeIdResponse>(client, path, params);
    });
  };

  /**
   * Retrieves a full category tree.
   *
   * @param input - Category tree identifier.
   * @returns An Effect that succeeds with eBay's getCategoryTree response.
   *
   * @example
   * ```ts
   * const tree = await Effect.runPromise(taxonomyApi.getCategoryTree({ categoryTreeId: '0' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getCategoryTree
   */
  public getCategoryTree = (
    input: GetCategoryTreeInput,
  ): Effect.Effect<GetCategoryTreeResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetCategoryTreeInput>(input, 'input');
      const categoryTreeId = yield* requireStringEffect(
        validatedInput.categoryTreeId,
        'categoryTreeId',
      );

      return yield* requestGetEffect<GetCategoryTreeResponse>(
        client,
        `${basePath}/category_tree/${categoryTreeId}`,
      );
    });
  };

  /**
   * Retrieves a category subtree beneath one category.
   *
   * @param input - Category tree and category identifiers.
   * @returns An Effect that succeeds with eBay's getCategorySubtree response.
   *
   * @example
   * ```ts
   * const subtree = await Effect.runPromise(
   *   taxonomyApi.getCategorySubtree({ categoryTreeId: '0', categoryId: '123' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getCategorySubtree
   */
  public getCategorySubtree = (
    input: GetCategorySubtreeInput,
  ): Effect.Effect<GetCategorySubtreeResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetCategorySubtreeInput>(input, 'input');
      const categoryTreeId = yield* requireStringEffect(
        validatedInput.categoryTreeId,
        'categoryTreeId',
      );
      const categoryId = yield* requireStringEffect(validatedInput.categoryId, 'categoryId');
      const params = buildEndpointParams({
        categoryId: { wireName: 'category_id', value: categoryId },
      });

      return yield* requestGetEffect<GetCategorySubtreeResponse>(
        client,
        `${basePath}/category_tree/${categoryTreeId}/get_category_subtree`,
        params,
      );
    });
  };

  /**
   * Retrieves category suggestions for listing search text.
   *
   * @param input - Category tree identifier and query text.
   * @returns An Effect that succeeds with eBay's getCategorySuggestions response, or undefined on HTTP 204.
   *
   * @example
   * ```ts
   * const suggestions = await Effect.runPromise(
   *   taxonomyApi.getCategorySuggestions({ categoryTreeId: '0', query: 'iPhone' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getCategorySuggestions
   */
  public getCategorySuggestions = (
    input: GetCategorySuggestionsInput,
  ): Effect.Effect<GetCategorySuggestionsResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetCategorySuggestionsInput>(
        input,
        'input',
      );
      const categoryTreeId = yield* requireStringEffect(
        validatedInput.categoryTreeId,
        'categoryTreeId',
      );
      const query = yield* requireStringEffect(validatedInput.query, 'query');
      const params = buildEndpointParams({
        query: { wireName: 'q', value: query },
      });

      return yield* requestGetEffect<GetCategorySuggestionsResponse>(
        client,
        `${basePath}/category_tree/${categoryTreeId}/get_category_suggestions`,
        params,
      );
    });
  };

  /**
   * Retrieves item aspects for a category.
   *
   * @param input - Category tree and category identifiers.
   * @returns An Effect that succeeds with eBay's getItemAspectsForCategory response, or undefined on HTTP 204.
   *
   * @example
   * ```ts
   * const aspects = await Effect.runPromise(
   *   taxonomyApi.getItemAspectsForCategory({ categoryTreeId: '0', categoryId: '123' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getItemAspectsForCategory
   */
  public getItemAspectsForCategory = (
    input: GetItemAspectsForCategoryInput,
  ): Effect.Effect<GetItemAspectsForCategoryResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetItemAspectsForCategoryInput>(
        input,
        'input',
      );
      const categoryTreeId = yield* requireStringEffect(
        validatedInput.categoryTreeId,
        'categoryTreeId',
      );
      const categoryId = yield* requireStringEffect(validatedInput.categoryId, 'categoryId');
      const params = buildEndpointParams({
        categoryId: { wireName: 'category_id', value: categoryId },
      });

      return yield* requestGetEffect<GetItemAspectsForCategoryResponse>(
        client,
        `${basePath}/category_tree/${categoryTreeId}/get_item_aspects_for_category`,
        params,
      );
    });
  };

  /**
   * Retrieves compatibility property names for a category.
   *
   * @param input - Category tree and compatibility-enabled category identifiers.
   * @returns An Effect that succeeds with eBay's getCompatibilityProperties response, or undefined on HTTP 204.
   *
   * @example
   * ```ts
   * const properties = await Effect.runPromise(
   *   taxonomyApi.getCompatibilityProperties({ categoryTreeId: '0', categoryId: '123' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getCompatibilityProperties
   */
  public getCompatibilityProperties = (
    input: GetCompatibilityPropertiesInput,
  ): Effect.Effect<GetCompatibilityPropertiesResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetCompatibilityPropertiesInput>(
        input,
        'input',
      );
      const categoryTreeId = yield* requireStringEffect(
        validatedInput.categoryTreeId,
        'categoryTreeId',
      );
      const categoryId = yield* requireStringEffect(validatedInput.categoryId, 'categoryId');
      const params = buildEndpointParams({
        categoryId: { wireName: 'category_id', value: categoryId },
      });

      return yield* requestGetEffect<GetCompatibilityPropertiesResponse>(
        client,
        `${basePath}/category_tree/${categoryTreeId}/get_compatibility_properties`,
        params,
      );
    });
  };

  /**
   * Retrieves compatibility values for one property within a category.
   *
   * @param input - Category tree, category, and compatibility property identifiers.
   * @returns An Effect that succeeds with eBay's getCompatibilityPropertyValues response, or undefined on HTTP 204.
   *
   * @example
   * ```ts
   * const values = await Effect.runPromise(
   *   taxonomyApi.getCompatibilityPropertyValues({
   *     categoryTreeId: '0',
   *     categoryId: '123',
   *     compatibilityProperty: 'Make',
   *   }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getCompatibilityPropertyValues
   */
  public getCompatibilityPropertyValues = (
    input: GetCompatibilityPropertyValuesInput,
  ): Effect.Effect<GetCompatibilityPropertyValuesResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetCompatibilityPropertyValuesInput>(
        input,
        'input',
      );
      const categoryTreeId = yield* requireStringEffect(
        validatedInput.categoryTreeId,
        'categoryTreeId',
      );
      const categoryId = yield* requireStringEffect(validatedInput.categoryId, 'categoryId');
      const compatibilityProperty = yield* requireStringEffect(
        validatedInput.compatibilityProperty,
        'compatibilityProperty',
      );
      const params = buildEndpointParams({
        categoryId: { wireName: 'category_id', value: categoryId },
        compatibilityProperty: {
          wireName: 'compatibility_property',
          value: compatibilityProperty,
        },
      });

      return yield* requestGetEffect<GetCompatibilityPropertyValuesResponse>(
        client,
        `${basePath}/category_tree/${categoryTreeId}/get_compatibility_property_values`,
        params,
      );
    });
  };

  /**
   * Downloads the aspects of every leaf category in a category tree as eBay's gzipped JSON file.
   *
   * eBay documents the file as possibly over 100 MB compressed; files above
   * MAX_INLINE_DOWNLOAD_BYTES (25 MiB) fail with DownloadTooLargeError, so use
   * getItemAspectsForCategory for per-category lookups.
   *
   * @param input - Category tree identifier.
   * @returns An Effect with the gzipped bytes, eBay's content type, and its file name.
   *
   * @example
   * ```ts
   * const file = await Effect.runPromise(taxonomyApi.fetchItemAspects({ categoryTreeId: '3' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/fetchItemAspects
   */
  public fetchItemAspects = (
    input: CategoryTreeIdInput,
  ): Effect.Effect<DownloadedFile, EbayApiError | EndpointInputError | DownloadTooLargeError> =>
    this.categoryTreeResourcePath(input, 'fetch_item_aspects').pipe(
      Effect.flatMap((path) => requestDownloadEffect(this.client, path, ITEM_ASPECTS_DOWNLOAD)),
    );

  /**
   * Retrieves the mappings of expired leaf categories to the active categories replacing them.
   *
   * @param input - Category tree identifier.
   * @returns An Effect that succeeds with eBay's ExpiredCategories, or undefined on HTTP 204.
   *
   * @example
   * ```ts
   * const expired = await Effect.runPromise(
   *   taxonomyApi.getExpiredCategories({ categoryTreeId: '0' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getExpiredCategories
   */
  public getExpiredCategories = (
    input: CategoryTreeIdInput,
  ): Effect.Effect<GetExpiredCategoriesResponse, EbayApiError | EndpointInputError> =>
    this.categoryTreeResourcePath(input, 'get_expired_categories').pipe(
      Effect.flatMap((path) => requestGetEffect<GetExpiredCategoriesResponse>(this.client, path)),
    );

  private categoryTreeResourcePath = (
    input: CategoryTreeIdInput,
    resource: string,
  ): Effect.Effect<string, EndpointInputError> =>
    decodeEndpointInputEffect(categoryTreeIdInputSchema, input, 'categoryTreeId').pipe(
      Effect.map(
        ({ categoryTreeId }) =>
          `${this.basePath}/category_tree/${encodeURIComponent(categoryTreeId)}/${resource}`,
      ),
    );
}
