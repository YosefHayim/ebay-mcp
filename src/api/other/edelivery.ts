import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import {
  buildEndpointParams,
  type EbayApiError,
  type EndpointInputError,
  optionalNonNegativeNumberEffect,
  optionalPositiveNumberEffect,
  optionalStringEffect,
  requestDeleteEffect,
  requestGetEffect,
  requestPostEffect,
  requireObjectEffect,
  requireStringEffect,
} from '@/api/shared/request.js';
import type {
  components,
  operations,
} from '@/types/sell-apps/other-apis/sellEdeliveryInternationalShippingOas3.js';
import { Effect } from 'effect';

/** Input accepted by getAddressPreferences. */
export type GetAddressPreferencesInput = Record<string, never>;

/** Input accepted by getConsignPreferences. */
export type GetConsignPreferencesInput = Record<string, never>;

/** Input accepted by getActualCosts. */
export interface GetActualCostsInput {
  /** Tracking numbers sent as tracking_numbers. */
  readonly trackingNumbers?: string;
  /** UTC transaction start time sent as trans_begin_time. */
  readonly transactionBeginTime?: string;
  /** UTC transaction end time sent as trans_end_time. */
  readonly transactionEndTime?: string;
}

/** Input accepted by paginated eDelivery metadata endpoints. */
export interface EDeliveryPaginationInput {
  /** Number of results to return. */
  readonly limit?: number;
  /** Number of results to skip. */
  readonly offset?: number;
}

/** Input accepted by createAddressPreference. */
export interface CreateAddressPreferenceInput {
  /** Generated CreateAddressPreferenceRequest body. */
  readonly body: CreateAddressPreferenceRequest;
}

/** Input accepted by createConsignPreference. */
export interface CreateConsignPreferenceInput {
  /** Generated CreateConsignPreferenceRequest body. */
  readonly body: CreateConsignPreferenceRequest;
}

/** Input accepted by bundle ID endpoints. */
export interface BundleIdInput {
  /** eDelivery bundle identifier. */
  readonly bundleId: string;
}

/** Input accepted by createBundle. */
export interface CreateBundleInput {
  /** Generated CreateBundleRequest body. */
  readonly body: CreateBundleRequest;
}

/** Input accepted by createComplaint. */
export interface CreateComplaintInput {
  /** Generated AddComplaintRequest body. */
  readonly body: CreateComplaintRequest;
}

/** Input accepted by package ID endpoints. */
export interface PackageIdInput {
  /** eDelivery package identifier. */
  readonly packageId: string;
}

/** Input accepted by createPackage. */
export interface CreatePackageInput {
  /** Generated AddPackageRequest body. */
  readonly body: CreatePackageRequest;
}

/** Input accepted by getPackagesByLineItemId. */
export interface GetPackagesByLineItemIdInput {
  /** Fulfillment order line item identifier sent as order_line_item_id. */
  readonly orderLineItemId: string;
}

/** Input accepted by bulkCancelPackages. */
export interface BulkCancelPackagesInput {
  /** Generated CancelPackagesRequest body. */
  readonly body: BulkCancelPackagesRequest;
}

/** Input accepted by bulkConfirmPackages. */
export interface BulkConfirmPackagesInput {
  /** Generated ConfirmPackagesRequest body. */
  readonly body: BulkConfirmPackagesRequest;
}

/** Input accepted by bulkDeletePackages. */
export interface BulkDeletePackagesInput {
  /** Generated DeletePackagesRequest body. */
  readonly body: BulkDeletePackagesRequest;
}

/** Input accepted by getLabels. */
export interface GetLabelsInput {
  /** Page size preference sent as page_size. */
  readonly pageSize?: string;
  /** Print preferences sent as print_preference. */
  readonly printPreference?: string;
  /** Tracking numbers sent as tracking_numbers. */
  readonly trackingNumbers: string;
}

/** Input accepted by getHandoverSheet. */
export interface GetHandoverSheetInput {
  /** Tracking numbers sent as tracking_numbers. */
  readonly trackingNumbers: string;
}

/** Input accepted by getTracking. */
export interface GetTrackingInput {
  /** Tracking number sent as tracking_number. */
  readonly trackingNumber: string;
}

/**
 * Response returned by getActualCosts.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/actual_costs/methods/getActualCosts
 */
export type GetActualCostsResponse = components['schemas']['GetActualCostResponses'];

/**
 * Response returned by getAddressPreferences.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/address_preference/methods/getAddressPreferences
 */
export type GetAddressPreferencesResponse =
  components['schemas']['GetAddressPreferenceListResponses'];

/**
 * Request body accepted by createAddressPreference.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/address_preference/methods/createAddressPreference
 */
export type CreateAddressPreferenceRequest =
  components['schemas']['CreateAddressPreferenceRequest'];

/**
 * Response returned by createAddressPreference.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/address_preference/methods/createAddressPreference
 */
export type CreateAddressPreferenceResponse =
  components['schemas']['CreateAddressPreferenceResponses'];

/**
 * Response returned by getConsignPreferences.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/consign_preference/methods/getConsignPreferences
 */
export type GetConsignPreferencesResponse =
  components['schemas']['GetConsignPreferenceListResponses'];

/**
 * Request body accepted by createConsignPreference.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/consign_preference/methods/createConsignPreference
 */
export type CreateConsignPreferenceRequest =
  components['schemas']['CreateConsignPreferenceRequest'];

/**
 * Response returned by createConsignPreference.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/consign_preference/methods/createConsignPreference
 */
export type CreateConsignPreferenceResponse =
  components['schemas']['CreateConsignPreferenceResponses'];

/**
 * Response returned by getAgents.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/agents/methods/getAgents
 */
export type GetAgentsResponse = components['schemas']['GetAgentListResponses'];

/**
 * Response returned by getBatteryQualifications.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/battery_qualifications/methods/getBatteryQualifications
 */
export type GetBatteryQualificationsResponse = components['schemas']['GetBatteryQualListResponses'];

/**
 * Response returned by getDropoffSites.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/dropoff_sites/methods/getDropoffSites
 */
export type GetDropoffSitesResponse = components['schemas']['GetDropoffSiteListResponses'];

/**
 * Response returned by getServices.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/services/methods/getServices
 */
export type GetServicesResponse = components['schemas']['GetServiceListResponses'];

/**
 * Request body accepted by createBundle.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/createBundle
 */
export type CreateBundleRequest = components['schemas']['CreateBundleRequest'];

/**
 * Response returned by createBundle.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/createBundle
 */
export type CreateBundleResponse = components['schemas']['CreateBundleResponse'];

/**
 * Response returned by getBundle.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/getBundle
 */
export type GetBundleResponse = components['schemas']['BundleDetailResponse'];

/**
 * No-content response returned by cancelBundle.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/cancelBundle
 */
export type CancelBundleResponse = void;

/**
 * Response returned by getBundleLabel.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/getBundleLabel
 */
export type GetBundleLabelResponse = components['schemas']['BundleLabelResponse'];

/**
 * Request body accepted by createPackage.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/createPackage
 */
export type CreatePackageRequest = components['schemas']['AddPackageRequest'];

/**
 * Response returned by createPackage.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/createPackage
 */
export type CreatePackageResponse = components['schemas']['AddPackageResponses'];

/**
 * Response returned by getPackage.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/getPackage
 */
export type GetPackageResponse = components['schemas']['GetPackageDetailResponses'];

/**
 * No-content response returned by deletePackage.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/deletePackage
 */
export type DeletePackageResponse = void;

/**
 * Response returned by getPackagesByLineItemID.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/getPackagesByLineItemID
 */
export type GetPackagesByLineItemIdResponse = components['schemas']['GetItemPackageIdResponses'];

/**
 * No-content response returned by cancelPackage.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/cancelPackage
 */
export type CancelPackageResponse = void;

/**
 * Response returned by clonePackage.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/clonePackage
 */
export type ClonePackageResponse = components['schemas']['ClonePackageResponses'];

/**
 * No-content response returned by confirmPackage.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/confirmPackage
 */
export type ConfirmPackageResponse = void;

/**
 * Request body accepted by bulkCancelPackages.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkCancelPackages
 */
export type BulkCancelPackagesRequest = components['schemas']['CancelPackagesRequest'];

/**
 * Response returned by bulkCancelPackages.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkCancelPackages
 */
export type BulkCancelPackagesResponse = components['schemas']['CancelPackagesResponses'];

/**
 * Request body accepted by bulkConfirmPackages.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkConfirmPackages
 */
export type BulkConfirmPackagesRequest = components['schemas']['ConfirmPackagesRequest'];

/**
 * Response returned by bulkConfirmPackages.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkConfirmPackages
 */
export type BulkConfirmPackagesResponse = components['schemas']['ConfirmPackagesResponses'];

/**
 * Request body accepted by bulkDeletePackages.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkDeletePackages
 */
export type BulkDeletePackagesRequest = components['schemas']['DeletePackagesRequest'];

/**
 * Response returned by bulkDeletePackages.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkDeletePackages
 */
export type BulkDeletePackagesResponse = components['schemas']['DeletePackagesResponses'];

/**
 * Response returned by getLabels.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/labels/methods/getLabels
 */
export type GetLabelsResponse = components['schemas']['GetLabelListResponses'];

/**
 * Response returned by getHandoverSheet.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/handover_sheet/methods/getHandoverSheet
 */
export type GetHandoverSheetResponse = components['schemas']['GetHandoverSheetResponses'];

/**
 * Response returned by getTracking.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/tracking/methods/getTracking
 */
export type GetTrackingResponse = components['schemas']['GetTrackingDetailResponses'];

/**
 * Request body accepted by createComplaint.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/complaint/methods/createComplaint
 */
export type CreateComplaintRequest = components['schemas']['AddComplaintRequest'];

/**
 * Response returned by createComplaint.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/complaint/methods/createComplaint
 */
export type CreateComplaintResponse =
  operations['createComplaint']['responses'][201]['content']['application/json'];

/** eDelivery International Shipping API endpoints. */
export class EDeliveryApi {
  private readonly basePath = '/sell/logistics/v1';

  public constructor(private readonly client: EbayApiClient) {}

  /**
   * Retrieves actual package weights and costs by tracking numbers or transaction time range.
   *
   * @param input - Optional tracking-number or transaction-time filters.
   * @returns An Effect that succeeds with eBay's GetActualCostResponses.
   *
   * @example
   * ```ts
   * const costs = await Effect.runPromise(
   *   edeliveryApi.getActualCosts({ trackingNumbers: 'ES000000001' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/actual_costs/methods/getActualCosts
   */
  public getActualCosts = (
    input: GetActualCostsInput = {},
  ): Effect.Effect<GetActualCostsResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/actual_costs`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetActualCostsInput>(input, 'input');
      const trackingNumbers = yield* optionalStringEffect(
        validatedInput.trackingNumbers,
        'trackingNumbers',
      );
      const transactionBeginTime = yield* optionalStringEffect(
        validatedInput.transactionBeginTime,
        'transactionBeginTime',
      );
      const transactionEndTime = yield* optionalStringEffect(
        validatedInput.transactionEndTime,
        'transactionEndTime',
      );
      const params = buildEndpointParams({
        trackingNumbers: { wireName: 'tracking_numbers', value: trackingNumbers },
        transactionBeginTime: { wireName: 'trans_begin_time', value: transactionBeginTime },
        transactionEndTime: { wireName: 'trans_end_time', value: transactionEndTime },
      });

      return yield* requestGetEffect<GetActualCostsResponse>(client, path, params);
    });
  };

  /**
   * Retrieves saved ship-from address preferences.
   *
   * @param input - Empty endpoint input object.
   * @returns An Effect that succeeds with eBay's GetAddressPreferenceListResponses.
   *
   * @example
   * ```ts
   * const preferences = await Effect.runPromise(edeliveryApi.getAddressPreferences({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/address_preference/methods/getAddressPreferences
   */
  public getAddressPreferences = (
    input: GetAddressPreferencesInput = {},
  ): Effect.Effect<GetAddressPreferencesResponse, EbayApiError> => {
    void input;
    return requestGetEffect<GetAddressPreferencesResponse>(
      this.client,
      `${this.basePath}/address_preference`,
    );
  };

  /**
   * Creates a ship-from address preference.
   *
   * @param input - Generated CreateAddressPreferenceRequest body.
   * @returns An Effect that succeeds with eBay's CreateAddressPreferenceResponses.
   *
   * @example
   * ```ts
   * const address = await Effect.runPromise(
   *   edeliveryApi.createAddressPreference({ body: { shipFromAddress: {} } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/address_preference/methods/createAddressPreference
   */
  public createAddressPreference = (
    input: CreateAddressPreferenceInput,
  ): Effect.Effect<CreateAddressPreferenceResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/address_preference`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<CreateAddressPreferenceInput>(
        input,
        'input',
      );
      const addressPreference = yield* requireObjectEffect<CreateAddressPreferenceRequest>(
        validatedInput.body,
        'body',
      );

      return yield* requestPostEffect<CreateAddressPreferenceResponse>(
        client,
        path,
        addressPreference,
      );
    });
  };

  /**
   * Retrieves saved consign preferences.
   *
   * @param input - Empty endpoint input object.
   * @returns An Effect that succeeds with eBay's GetConsignPreferenceListResponses.
   *
   * @example
   * ```ts
   * const preferences = await Effect.runPromise(edeliveryApi.getConsignPreferences({}));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/consign_preference/methods/getConsignPreferences
   */
  public getConsignPreferences = (
    input: GetConsignPreferencesInput = {},
  ): Effect.Effect<GetConsignPreferencesResponse, EbayApiError> => {
    void input;
    return requestGetEffect<GetConsignPreferencesResponse>(
      this.client,
      `${this.basePath}/consign_preference`,
    );
  };

  /**
   * Creates a consign preference.
   *
   * @param input - Generated CreateConsignPreferenceRequest body.
   * @returns An Effect that succeeds with eBay's CreateConsignPreferenceResponses.
   *
   * @example
   * ```ts
   * const preference = await Effect.runPromise(
   *   edeliveryApi.createConsignPreference({ body: { consignAddress: {} } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/consign_preference/methods/createConsignPreference
   */
  public createConsignPreference = (
    input: CreateConsignPreferenceInput,
  ): Effect.Effect<CreateConsignPreferenceResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/consign_preference`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<CreateConsignPreferenceInput>(
        input,
        'input',
      );
      const consignPreference = yield* requireObjectEffect<CreateConsignPreferenceRequest>(
        validatedInput.body,
        'body',
      );

      return yield* requestPostEffect<CreateConsignPreferenceResponse>(
        client,
        path,
        consignPreference,
      );
    });
  };

  /**
   * Retrieves available shipping agents.
   *
   * @param input - Optional pagination controls.
   * @returns An Effect that succeeds with eBay's GetAgentListResponses.
   *
   * @example
   * ```ts
   * const agents = await Effect.runPromise(edeliveryApi.getAgents({ limit: 50 }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/agents/methods/getAgents
   */
  public getAgents = (
    input: EDeliveryPaginationInput = {},
  ): Effect.Effect<GetAgentsResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/agents`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<EDeliveryPaginationInput>(input, 'input');
      const limit = yield* optionalPositiveNumberEffect(validatedInput.limit, 'limit');
      const offset = yield* optionalNonNegativeNumberEffect(validatedInput.offset, 'offset');
      const params = buildEndpointParams({
        limit: { wireName: 'limit', value: limit === undefined ? undefined : String(limit) },
        offset: { wireName: 'offset', value: offset === undefined ? undefined : String(offset) },
      });

      return yield* requestGetEffect<GetAgentsResponse>(client, path, params);
    });
  };

  /**
   * Retrieves available lithium battery qualifications.
   *
   * @param input - Optional pagination controls.
   * @returns An Effect that succeeds with eBay's GetBatteryQualListResponses.
   *
   * @example
   * ```ts
   * const qualifications = await Effect.runPromise(
   *   edeliveryApi.getBatteryQualifications({ limit: 25 }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/battery_qualifications/methods/getBatteryQualifications
   */
  public getBatteryQualifications = (
    input: EDeliveryPaginationInput = {},
  ): Effect.Effect<GetBatteryQualificationsResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/battery_qualifications`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<EDeliveryPaginationInput>(input, 'input');
      const limit = yield* optionalPositiveNumberEffect(validatedInput.limit, 'limit');
      const offset = yield* optionalNonNegativeNumberEffect(validatedInput.offset, 'offset');
      const params = buildEndpointParams({
        limit: { wireName: 'limit', value: limit === undefined ? undefined : String(limit) },
        offset: { wireName: 'offset', value: offset === undefined ? undefined : String(offset) },
      });

      return yield* requestGetEffect<GetBatteryQualificationsResponse>(client, path, params);
    });
  };

  /**
   * Retrieves available drop-off sites.
   *
   * @param input - Optional pagination controls.
   * @returns An Effect that succeeds with eBay's GetDropoffSiteListResponses.
   *
   * @example
   * ```ts
   * const sites = await Effect.runPromise(edeliveryApi.getDropoffSites({ offset: 10 }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/dropoff_sites/methods/getDropoffSites
   */
  public getDropoffSites = (
    input: EDeliveryPaginationInput = {},
  ): Effect.Effect<GetDropoffSitesResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/dropoff_sites`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<EDeliveryPaginationInput>(input, 'input');
      const limit = yield* optionalPositiveNumberEffect(validatedInput.limit, 'limit');
      const offset = yield* optionalNonNegativeNumberEffect(validatedInput.offset, 'offset');
      const params = buildEndpointParams({
        limit: { wireName: 'limit', value: limit === undefined ? undefined : String(limit) },
        offset: { wireName: 'offset', value: offset === undefined ? undefined : String(offset) },
      });

      return yield* requestGetEffect<GetDropoffSitesResponse>(client, path, params);
    });
  };

  /**
   * Retrieves available shipping services.
   *
   * @param input - Optional pagination controls.
   * @returns An Effect that succeeds with eBay's GetServiceListResponses.
   *
   * @example
   * ```ts
   * const services = await Effect.runPromise(edeliveryApi.getServices({ limit: 25 }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/services/methods/getServices
   */
  public getServices = (
    input: EDeliveryPaginationInput = {},
  ): Effect.Effect<GetServicesResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/services`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<EDeliveryPaginationInput>(input, 'input');
      const limit = yield* optionalPositiveNumberEffect(validatedInput.limit, 'limit');
      const offset = yield* optionalNonNegativeNumberEffect(validatedInput.offset, 'offset');
      const params = buildEndpointParams({
        limit: { wireName: 'limit', value: limit === undefined ? undefined : String(limit) },
        offset: { wireName: 'offset', value: offset === undefined ? undefined : String(offset) },
      });

      return yield* requestGetEffect<GetServicesResponse>(client, path, params);
    });
  };

  /**
   * Creates a bundle from package tracking numbers.
   *
   * @param input - Generated CreateBundleRequest body.
   * @returns An Effect that succeeds with eBay's CreateBundleResponse.
   *
   * @example
   * ```ts
   * const bundle = await Effect.runPromise(
   *   edeliveryApi.createBundle({ body: { bundle: { trackingNumbers: 'ES000000001' } } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/createBundle
   */
  public createBundle = (
    input: CreateBundleInput,
  ): Effect.Effect<CreateBundleResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/bundle`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<CreateBundleInput>(input, 'input');
      const bundleRequest = yield* requireObjectEffect<CreateBundleRequest>(
        validatedInput.body,
        'body',
      );

      return yield* requestPostEffect<CreateBundleResponse>(client, path, bundleRequest);
    });
  };

  /**
   * Retrieves a bundle by ID.
   *
   * @param input - Bundle identifier.
   * @returns An Effect that succeeds with eBay's BundleDetailResponse.
   *
   * @example
   * ```ts
   * const bundle = await Effect.runPromise(edeliveryApi.getBundle({ bundleId: 'BUNDLE123' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/getBundle
   */
  public getBundle = (
    input: BundleIdInput,
  ): Effect.Effect<GetBundleResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<BundleIdInput>(input, 'input');
      const bundleId = yield* requireStringEffect(validatedInput.bundleId, 'bundleId');

      return yield* requestGetEffect<GetBundleResponse>(client, `${basePath}/bundle/${bundleId}`);
    });
  };

  /**
   * Cancels a bundle by ID.
   *
   * @param input - Bundle identifier.
   * @returns An Effect that succeeds when eBay returns no content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(edeliveryApi.cancelBundle({ bundleId: 'BUNDLE123' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/cancelBundle
   */
  public cancelBundle = (
    input: BundleIdInput,
  ): Effect.Effect<CancelBundleResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<BundleIdInput>(input, 'input');
      const bundleId = yield* requireStringEffect(validatedInput.bundleId, 'bundleId');

      return yield* requestPostEffect<CancelBundleResponse>(
        client,
        `${basePath}/bundle/${bundleId}/cancel`,
      );
    });
  };

  /**
   * Retrieves the label for a bundle.
   *
   * @param input - Bundle identifier.
   * @returns An Effect that succeeds with eBay's BundleLabelResponse.
   *
   * @example
   * ```ts
   * const label = await Effect.runPromise(edeliveryApi.getBundleLabel({ bundleId: 'BUNDLE123' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/getBundleLabel
   */
  public getBundleLabel = (
    input: BundleIdInput,
  ): Effect.Effect<GetBundleLabelResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<BundleIdInput>(input, 'input');
      const bundleId = yield* requireStringEffect(validatedInput.bundleId, 'bundleId');

      return yield* requestGetEffect<GetBundleLabelResponse>(
        client,
        `${basePath}/bundle/${bundleId}/label`,
      );
    });
  };

  /**
   * Creates a package.
   *
   * @param input - Generated AddPackageRequest body.
   * @returns An Effect that succeeds with eBay's AddPackageResponses.
   *
   * @example
   * ```ts
   * const createdPackage = await Effect.runPromise(
   *   edeliveryApi.createPackage({ body: { packageInfo: {} } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/createPackage
   */
  public createPackage = (
    input: CreatePackageInput,
  ): Effect.Effect<CreatePackageResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/package`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<CreatePackageInput>(input, 'input');
      const packageRequest = yield* requireObjectEffect<CreatePackageRequest>(
        validatedInput.body,
        'body',
      );

      return yield* requestPostEffect<CreatePackageResponse>(client, path, packageRequest);
    });
  };

  /**
   * Retrieves a package by ID.
   *
   * @param input - Package identifier.
   * @returns An Effect that succeeds with eBay's GetPackageDetailResponses.
   *
   * @example
   * ```ts
   * const packageDetail = await Effect.runPromise(
   *   edeliveryApi.getPackage({ packageId: 'PKG123' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/getPackage
   */
  public getPackage = (
    input: PackageIdInput,
  ): Effect.Effect<GetPackageResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<PackageIdInput>(input, 'input');
      const packageId = yield* requireStringEffect(validatedInput.packageId, 'packageId');

      return yield* requestGetEffect<GetPackageResponse>(
        client,
        `${basePath}/package/${packageId}`,
      );
    });
  };

  /**
   * Deletes a package by ID.
   *
   * @param input - Package identifier.
   * @returns An Effect that succeeds when eBay returns no content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(edeliveryApi.deletePackage({ packageId: 'PKG123' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/deletePackage
   */
  public deletePackage = (
    input: PackageIdInput,
  ): Effect.Effect<DeletePackageResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<PackageIdInput>(input, 'input');
      const packageId = yield* requireStringEffect(validatedInput.packageId, 'packageId');

      return yield* requestDeleteEffect<DeletePackageResponse>(
        client,
        `${basePath}/package/${packageId}`,
      );
    });
  };

  /**
   * Retrieves packages by fulfillment order line item ID.
   *
   * @param input - Fulfillment order line item identifier.
   * @returns An Effect that succeeds with eBay's GetItemPackageIdResponses.
   *
   * @example
   * ```ts
   * const packages = await Effect.runPromise(
   *   edeliveryApi.getPackagesByLineItemId({ orderLineItemId: 'LINE123' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/getPackagesByLineItemID
   */
  public getPackagesByLineItemId = (
    input: GetPackagesByLineItemIdInput,
  ): Effect.Effect<GetPackagesByLineItemIdResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetPackagesByLineItemIdInput>(
        input,
        'input',
      );
      const orderLineItemId = yield* requireStringEffect(
        validatedInput.orderLineItemId,
        'orderLineItemId',
      );

      return yield* requestGetEffect<GetPackagesByLineItemIdResponse>(
        client,
        `${basePath}/package/${orderLineItemId}/item`,
      );
    });
  };

  /**
   * Cancels a package by ID.
   *
   * @param input - Package identifier.
   * @returns An Effect that succeeds when eBay returns no content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(edeliveryApi.cancelPackage({ packageId: 'PKG123' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/cancelPackage
   */
  public cancelPackage = (
    input: PackageIdInput,
  ): Effect.Effect<CancelPackageResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<PackageIdInput>(input, 'input');
      const packageId = yield* requireStringEffect(validatedInput.packageId, 'packageId');

      return yield* requestPostEffect<CancelPackageResponse>(
        client,
        `${basePath}/package/${packageId}/cancel`,
      );
    });
  };

  /**
   * Clones a package by ID.
   *
   * @param input - Package identifier.
   * @returns An Effect that succeeds with eBay's ClonePackageResponses.
   *
   * @example
   * ```ts
   * const clone = await Effect.runPromise(edeliveryApi.clonePackage({ packageId: 'PKG123' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/clonePackage
   */
  public clonePackage = (
    input: PackageIdInput,
  ): Effect.Effect<ClonePackageResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<PackageIdInput>(input, 'input');
      const packageId = yield* requireStringEffect(validatedInput.packageId, 'packageId');

      return yield* requestPostEffect<ClonePackageResponse>(
        client,
        `${basePath}/package/${packageId}/clone`,
      );
    });
  };

  /**
   * Confirms a package by ID.
   *
   * @param input - Package identifier.
   * @returns An Effect that succeeds when eBay returns no content.
   *
   * @example
   * ```ts
   * await Effect.runPromise(edeliveryApi.confirmPackage({ packageId: 'PKG123' }));
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/confirmPackage
   */
  public confirmPackage = (
    input: PackageIdInput,
  ): Effect.Effect<ConfirmPackageResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const basePath = this.basePath;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<PackageIdInput>(input, 'input');
      const packageId = yield* requireStringEffect(validatedInput.packageId, 'packageId');

      return yield* requestPostEffect<ConfirmPackageResponse>(
        client,
        `${basePath}/package/${packageId}/confirm`,
      );
    });
  };

  /**
   * Cancels multiple packages.
   *
   * @param input - Generated CancelPackagesRequest body.
   * @returns An Effect that succeeds with eBay's CancelPackagesResponses.
   *
   * @example
   * ```ts
   * const cancelledPackages = await Effect.runPromise(
   *   edeliveryApi.bulkCancelPackages({ body: { requests: { packageIds: 'PKG123' } } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkCancelPackages
   */
  public bulkCancelPackages = (
    input: BulkCancelPackagesInput,
  ): Effect.Effect<BulkCancelPackagesResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/package/bulk_cancel_packages`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<BulkCancelPackagesInput>(input, 'input');
      const cancelPackagesRequest = yield* requireObjectEffect<BulkCancelPackagesRequest>(
        validatedInput.body,
        'body',
      );

      return yield* requestPostEffect<BulkCancelPackagesResponse>(
        client,
        path,
        cancelPackagesRequest,
      );
    });
  };

  /**
   * Confirms multiple packages.
   *
   * @param input - Generated ConfirmPackagesRequest body.
   * @returns An Effect that succeeds with eBay's ConfirmPackagesResponses.
   *
   * @example
   * ```ts
   * const confirmedPackages = await Effect.runPromise(
   *   edeliveryApi.bulkConfirmPackages({ body: { requests: { packageIds: 'PKG123' } } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkConfirmPackages
   */
  public bulkConfirmPackages = (
    input: BulkConfirmPackagesInput,
  ): Effect.Effect<BulkConfirmPackagesResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/package/bulk_confirm_packages`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<BulkConfirmPackagesInput>(input, 'input');
      const confirmPackagesRequest = yield* requireObjectEffect<BulkConfirmPackagesRequest>(
        validatedInput.body,
        'body',
      );

      return yield* requestPostEffect<BulkConfirmPackagesResponse>(
        client,
        path,
        confirmPackagesRequest,
      );
    });
  };

  /**
   * Deletes multiple packages.
   *
   * @param input - Generated DeletePackagesRequest body.
   * @returns An Effect that succeeds with eBay's DeletePackagesResponses.
   *
   * @example
   * ```ts
   * const deletedPackages = await Effect.runPromise(
   *   edeliveryApi.bulkDeletePackages({ body: { requests: { packageIds: 'PKG123' } } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkDeletePackages
   */
  public bulkDeletePackages = (
    input: BulkDeletePackagesInput,
  ): Effect.Effect<BulkDeletePackagesResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/package/bulk_delete_packages`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<BulkDeletePackagesInput>(input, 'input');
      const deletePackagesRequest = yield* requireObjectEffect<BulkDeletePackagesRequest>(
        validatedInput.body,
        'body',
      );

      return yield* requestPostEffect<BulkDeletePackagesResponse>(
        client,
        path,
        deletePackagesRequest,
      );
    });
  };

  /**
   * Retrieves labels by tracking numbers.
   *
   * @param input - Required tracking numbers and optional label formatting preferences.
   * @returns An Effect that succeeds with eBay's GetLabelListResponses.
   *
   * @example
   * ```ts
   * const labels = await Effect.runPromise(
   *   edeliveryApi.getLabels({ trackingNumbers: 'ES000000001', pageSize: 'A4' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/labels/methods/getLabels
   */
  public getLabels = (
    input: GetLabelsInput,
  ): Effect.Effect<GetLabelsResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/labels`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetLabelsInput>(input, 'input');
      const trackingNumbers = yield* requireStringEffect(
        validatedInput.trackingNumbers,
        'trackingNumbers',
      );
      const pageSize = yield* optionalStringEffect(validatedInput.pageSize, 'pageSize');
      const printPreference = yield* optionalStringEffect(
        validatedInput.printPreference,
        'printPreference',
      );
      const params = buildEndpointParams({
        pageSize: { wireName: 'page_size', value: pageSize },
        printPreference: { wireName: 'print_preference', value: printPreference },
        trackingNumbers: { wireName: 'tracking_numbers', value: trackingNumbers },
      });

      return yield* requestGetEffect<GetLabelsResponse>(client, path, params);
    });
  };

  /**
   * Retrieves a handover sheet by tracking numbers.
   *
   * @param input - Required tracking numbers.
   * @returns An Effect that succeeds with eBay's GetHandoverSheetResponses.
   *
   * @example
   * ```ts
   * const sheet = await Effect.runPromise(
   *   edeliveryApi.getHandoverSheet({ trackingNumbers: 'ES000000001' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/handover_sheet/methods/getHandoverSheet
   */
  public getHandoverSheet = (
    input: GetHandoverSheetInput,
  ): Effect.Effect<GetHandoverSheetResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/handover_sheet`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetHandoverSheetInput>(input, 'input');
      const trackingNumbers = yield* requireStringEffect(
        validatedInput.trackingNumbers,
        'trackingNumbers',
      );
      const params = buildEndpointParams({
        trackingNumbers: { wireName: 'tracking_numbers', value: trackingNumbers },
      });

      return yield* requestGetEffect<GetHandoverSheetResponse>(client, path, params);
    });
  };

  /**
   * Retrieves tracking details for one tracking number.
   *
   * @param input - Required tracking number.
   * @returns An Effect that succeeds with eBay's GetTrackingDetailResponses.
   *
   * @example
   * ```ts
   * const tracking = await Effect.runPromise(
   *   edeliveryApi.getTracking({ trackingNumber: 'ES000000001' }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/tracking/methods/getTracking
   */
  public getTracking = (
    input: GetTrackingInput,
  ): Effect.Effect<GetTrackingResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/tracking`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<GetTrackingInput>(input, 'input');
      const trackingNumber = yield* requireStringEffect(
        validatedInput.trackingNumber,
        'trackingNumber',
      );
      const params = buildEndpointParams({
        trackingNumber: { wireName: 'tracking_number', value: trackingNumber },
      });

      return yield* requestGetEffect<GetTrackingResponse>(client, path, params);
    });
  };

  /**
   * Creates a complaint for shipment issues.
   *
   * @param input - Generated AddComplaintRequest body.
   * @returns An Effect that succeeds with eBay's empty createComplaint response.
   *
   * @example
   * ```ts
   * const complaint = await Effect.runPromise(
   *   edeliveryApi.createComplaint({ body: { complaintRequest: {} } }),
   * );
   * ```
   *
   * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/complaint/methods/createComplaint
   */
  public createComplaint = (
    input: CreateComplaintInput,
  ): Effect.Effect<CreateComplaintResponse, EbayApiError | EndpointInputError> => {
    const client = this.client;
    const path = `${this.basePath}/complaint`;

    return Effect.gen(function* () {
      const validatedInput = yield* requireObjectEffect<CreateComplaintInput>(input, 'input');
      const complaintRequest = yield* requireObjectEffect<CreateComplaintRequest>(
        validatedInput.body,
        'body',
      );

      return yield* requestPostEffect<CreateComplaintResponse>(client, path, complaintRequest);
    });
  };
}
