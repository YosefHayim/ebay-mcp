import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	optionalNonNegativeNumberEffect,
	optionalPositiveNumberEffect,
	optionalStringEffect,
	requestDeleteEffect,
	requestGetEffect,
	requestPostEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type {
	components,
	operations,
} from "@/ebay-openapi-types/sellEdeliveryInternationalShippingOas3.js";

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

/** Input accepted by getPackagesByLineItemID. */
export interface GetPackagesByLineItemIDInput {
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
export type GetActualCostsResponse =
	components["schemas"]["GetActualCostResponses"];

/**
 * Response returned by getAddressPreferences.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/address_preference/methods/getAddressPreferences
 */
export type GetAddressPreferencesResponse =
	components["schemas"]["GetAddressPreferenceListResponses"];

/**
 * Request body accepted by createAddressPreference.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/address_preference/methods/createAddressPreference
 */
export type CreateAddressPreferenceRequest =
	components["schemas"]["CreateAddressPreferenceRequest"];

/**
 * Response returned by createAddressPreference.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/address_preference/methods/createAddressPreference
 */
export type CreateAddressPreferenceResponse =
	components["schemas"]["CreateAddressPreferenceResponses"];

/**
 * Response returned by getConsignPreferences.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/consign_preference/methods/getConsignPreferences
 */
export type GetConsignPreferencesResponse =
	components["schemas"]["GetConsignPreferenceListResponses"];

/**
 * Request body accepted by createConsignPreference.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/consign_preference/methods/createConsignPreference
 */
export type CreateConsignPreferenceRequest =
	components["schemas"]["CreateConsignPreferenceRequest"];

/**
 * Response returned by createConsignPreference.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/consign_preference/methods/createConsignPreference
 */
export type CreateConsignPreferenceResponse =
	components["schemas"]["CreateConsignPreferenceResponses"];

/**
 * Response returned by getAgents.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/agents/methods/getAgents
 */
export type GetAgentsResponse = components["schemas"]["GetAgentListResponses"];

/**
 * Response returned by getBatteryQualifications.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/battery_qualifications/methods/getBatteryQualifications
 */
export type GetBatteryQualificationsResponse =
	components["schemas"]["GetBatteryQualListResponses"];

/**
 * Response returned by getDropoffSites.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/dropoff_sites/methods/getDropoffSites
 */
export type GetDropoffSitesResponse =
	components["schemas"]["GetDropoffSiteListResponses"];

/**
 * Response returned by getServices.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/services/methods/getServices
 */
export type GetServicesResponse =
	components["schemas"]["GetServiceListResponses"];

/**
 * Request body accepted by createBundle.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/createBundle
 */
export type CreateBundleRequest = components["schemas"]["CreateBundleRequest"];

/**
 * Response returned by createBundle.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/createBundle
 */
export type CreateBundleResponse =
	components["schemas"]["CreateBundleResponse"];

/**
 * Response returned by getBundle.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/getBundle
 */
export type GetBundleResponse = components["schemas"]["BundleDetailResponse"];

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
export type GetBundleLabelResponse =
	components["schemas"]["BundleLabelResponse"];

/**
 * Request body accepted by createPackage.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/createPackage
 */
export type CreatePackageRequest = components["schemas"]["AddPackageRequest"];

/**
 * Response returned by createPackage.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/createPackage
 */
export type CreatePackageResponse =
	components["schemas"]["AddPackageResponses"];

/**
 * Response returned by getPackage.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/getPackage
 */
export type GetPackageResponse =
	components["schemas"]["GetPackageDetailResponses"];

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
export type GetPackagesByLineItemIDResponse =
	components["schemas"]["GetItemPackageIdResponses"];

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
export type ClonePackageResponse =
	components["schemas"]["ClonePackageResponses"];

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
export type BulkCancelPackagesRequest =
	components["schemas"]["CancelPackagesRequest"];

/**
 * Response returned by bulkCancelPackages.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkCancelPackages
 */
export type BulkCancelPackagesResponse =
	components["schemas"]["CancelPackagesResponses"];

/**
 * Request body accepted by bulkConfirmPackages.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkConfirmPackages
 */
export type BulkConfirmPackagesRequest =
	components["schemas"]["ConfirmPackagesRequest"];

/**
 * Response returned by bulkConfirmPackages.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkConfirmPackages
 */
export type BulkConfirmPackagesResponse =
	components["schemas"]["ConfirmPackagesResponses"];

/**
 * Request body accepted by bulkDeletePackages.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkDeletePackages
 */
export type BulkDeletePackagesRequest =
	components["schemas"]["DeletePackagesRequest"];

/**
 * Response returned by bulkDeletePackages.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkDeletePackages
 */
export type BulkDeletePackagesResponse =
	components["schemas"]["DeletePackagesResponses"];

/**
 * Response returned by getLabels.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/labels/methods/getLabels
 */
export type GetLabelsResponse = components["schemas"]["GetLabelListResponses"];

/**
 * Response returned by getHandoverSheet.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/handover_sheet/methods/getHandoverSheet
 */
export type GetHandoverSheetResponse =
	components["schemas"]["GetHandoverSheetResponses"];

/**
 * Response returned by getTracking.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/tracking/methods/getTracking
 */
export type GetTrackingResponse =
	components["schemas"]["GetTrackingDetailResponses"];

/**
 * Request body accepted by createComplaint.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/complaint/methods/createComplaint
 */
export type CreateComplaintRequest =
	components["schemas"]["AddComplaintRequest"];

/**
 * Response returned by createComplaint.
 *
 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/complaint/methods/createComplaint
 */
export type CreateComplaintResponse =
	operations["createComplaint"]["responses"][201]["content"]["application/json"];

/** eDelivery International Shipping API endpoints. */
export class EDeliveryApi {
	private readonly basePath = "/sell/edelivery_international_shipping/v1";

	public constructor(private readonly client: EbayApiClient) {}

	/**
	 * Retrieves actual package weights and costs by tracking numbers or transaction time range.
	 *
	 * @param input - Optional tracking-number or transaction-time filters.
	 * @returns A promise of eBay's GetActualCostResponses.
	 *
	 * @example
	 * ```ts
	 * const costs = await edeliveryApi.getActualCosts({ trackingNumbers: 'ES000000001' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/actual_costs/methods/getActualCosts
	 */
	public getActualCosts = async (
		input: GetActualCostsInput = {},
	): Promise<GetActualCostsResponse> => {
		const client = this.client;
		const path = `${this.basePath}/actual_costs`;

		const validatedInput = requireObjectEffect<GetActualCostsInput>(
			input,
			"input",
		);
		const trackingNumbers = optionalStringEffect(
			validatedInput.trackingNumbers,
			"trackingNumbers",
		);
		const transactionBeginTime = optionalStringEffect(
			validatedInput.transactionBeginTime,
			"transactionBeginTime",
		);
		const transactionEndTime = optionalStringEffect(
			validatedInput.transactionEndTime,
			"transactionEndTime",
		);
		const params = buildEndpointParams({
			trackingNumbers: {
				wireName: "tracking_numbers",
				value: trackingNumbers,
			},
			transactionBeginTime: {
				wireName: "trans_begin_time",
				value: transactionBeginTime,
			},
			transactionEndTime: {
				wireName: "trans_end_time",
				value: transactionEndTime,
			},
		});

		return requestGetEffect<GetActualCostsResponse>(client, path, params);
	};

	/**
	 * Retrieves saved ship-from address preferences.
	 *
	 * @param input - Empty endpoint input object.
	 * @returns A promise of eBay's GetAddressPreferenceListResponses.
	 *
	 * @example
	 * ```ts
	 * const preferences = await edeliveryApi.getAddressPreferences({});
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/address_preference/methods/getAddressPreferences
	 */
	public getAddressPreferences = async (
		input: GetAddressPreferencesInput = {},
	): Promise<GetAddressPreferencesResponse> => {
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
	 * @returns A promise of eBay's CreateAddressPreferenceResponses.
	 *
	 * @example
	 * ```ts
	 * const address = await edeliveryApi.createAddressPreference({ body: { shipFromAddress: {} } });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/address_preference/methods/createAddressPreference
	 */
	public createAddressPreference = async (
		input: CreateAddressPreferenceInput,
	): Promise<CreateAddressPreferenceResponse> => {
		const client = this.client;
		const path = `${this.basePath}/address_preference`;

		const validatedInput = requireObjectEffect<CreateAddressPreferenceInput>(
			input,
			"input",
		);
		const addressPreference =
			requireObjectEffect<CreateAddressPreferenceRequest>(
				validatedInput.body,
				"body",
			);

		return requestPostEffect<CreateAddressPreferenceResponse>(
			client,
			path,
			addressPreference,
		);
	};

	/**
	 * Retrieves saved consign preferences.
	 *
	 * @param input - Empty endpoint input object.
	 * @returns A promise of eBay's GetConsignPreferenceListResponses.
	 *
	 * @example
	 * ```ts
	 * const preferences = await edeliveryApi.getConsignPreferences({});
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/consign_preference/methods/getConsignPreferences
	 */
	public getConsignPreferences = async (
		input: GetConsignPreferencesInput = {},
	): Promise<GetConsignPreferencesResponse> => {
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
	 * @returns A promise of eBay's CreateConsignPreferenceResponses.
	 *
	 * @example
	 * ```ts
	 * const preference = await edeliveryApi.createConsignPreference({ body: { consignAddress: {} } });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/consign_preference/methods/createConsignPreference
	 */
	public createConsignPreference = async (
		input: CreateConsignPreferenceInput,
	): Promise<CreateConsignPreferenceResponse> => {
		const client = this.client;
		const path = `${this.basePath}/consign_preference`;

		const validatedInput = requireObjectEffect<CreateConsignPreferenceInput>(
			input,
			"input",
		);
		const consignPreference =
			requireObjectEffect<CreateConsignPreferenceRequest>(
				validatedInput.body,
				"body",
			);

		return requestPostEffect<CreateConsignPreferenceResponse>(
			client,
			path,
			consignPreference,
		);
	};

	/**
	 * Retrieves available shipping agents.
	 *
	 * @param input - Optional pagination controls.
	 * @returns A promise of eBay's GetAgentListResponses.
	 *
	 * @example
	 * ```ts
	 * const agents = await edeliveryApi.getAgents({ limit: 50 });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/agents/methods/getAgents
	 */
	public getAgents = async (
		input: EDeliveryPaginationInput = {},
	): Promise<GetAgentsResponse> => {
		const client = this.client;
		const path = `${this.basePath}/agents`;

		const validatedInput = requireObjectEffect<EDeliveryPaginationInput>(
			input,
			"input",
		);
		const limit = optionalPositiveNumberEffect(validatedInput.limit, "limit");
		const offset = optionalNonNegativeNumberEffect(
			validatedInput.offset,
			"offset",
		);
		const params = buildEndpointParams({
			limit: {
				wireName: "limit",
				value: limit === undefined ? undefined : String(limit),
			},
			offset: {
				wireName: "offset",
				value: offset === undefined ? undefined : String(offset),
			},
		});

		return requestGetEffect<GetAgentsResponse>(client, path, params);
	};

	/**
	 * Retrieves available lithium battery qualifications.
	 *
	 * @param input - Optional pagination controls.
	 * @returns A promise of eBay's GetBatteryQualListResponses.
	 *
	 * @example
	 * ```ts
	 * const qualifications = await edeliveryApi.getBatteryQualifications({ limit: 25 });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/battery_qualifications/methods/getBatteryQualifications
	 */
	public getBatteryQualifications = async (
		input: EDeliveryPaginationInput = {},
	): Promise<GetBatteryQualificationsResponse> => {
		const client = this.client;
		const path = `${this.basePath}/battery_qualifications`;

		const validatedInput = requireObjectEffect<EDeliveryPaginationInput>(
			input,
			"input",
		);
		const limit = optionalPositiveNumberEffect(validatedInput.limit, "limit");
		const offset = optionalNonNegativeNumberEffect(
			validatedInput.offset,
			"offset",
		);
		const params = buildEndpointParams({
			limit: {
				wireName: "limit",
				value: limit === undefined ? undefined : String(limit),
			},
			offset: {
				wireName: "offset",
				value: offset === undefined ? undefined : String(offset),
			},
		});

		return requestGetEffect<GetBatteryQualificationsResponse>(
			client,
			path,
			params,
		);
	};

	/**
	 * Retrieves available drop-off sites.
	 *
	 * @param input - Optional pagination controls.
	 * @returns A promise of eBay's GetDropoffSiteListResponses.
	 *
	 * @example
	 * ```ts
	 * const sites = await edeliveryApi.getDropoffSites({ offset: 10 });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/dropoff_sites/methods/getDropoffSites
	 */
	public getDropoffSites = async (
		input: EDeliveryPaginationInput = {},
	): Promise<GetDropoffSitesResponse> => {
		const client = this.client;
		const path = `${this.basePath}/dropoff_sites`;

		const validatedInput = requireObjectEffect<EDeliveryPaginationInput>(
			input,
			"input",
		);
		const limit = optionalPositiveNumberEffect(validatedInput.limit, "limit");
		const offset = optionalNonNegativeNumberEffect(
			validatedInput.offset,
			"offset",
		);
		const params = buildEndpointParams({
			limit: {
				wireName: "limit",
				value: limit === undefined ? undefined : String(limit),
			},
			offset: {
				wireName: "offset",
				value: offset === undefined ? undefined : String(offset),
			},
		});

		return requestGetEffect<GetDropoffSitesResponse>(client, path, params);
	};

	/**
	 * Retrieves available shipping services.
	 *
	 * @param input - Optional pagination controls.
	 * @returns A promise of eBay's GetServiceListResponses.
	 *
	 * @example
	 * ```ts
	 * const services = await edeliveryApi.getServices({ limit: 25 });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/services/methods/getServices
	 */
	public getServices = async (
		input: EDeliveryPaginationInput = {},
	): Promise<GetServicesResponse> => {
		const client = this.client;
		const path = `${this.basePath}/services`;

		const validatedInput = requireObjectEffect<EDeliveryPaginationInput>(
			input,
			"input",
		);
		const limit = optionalPositiveNumberEffect(validatedInput.limit, "limit");
		const offset = optionalNonNegativeNumberEffect(
			validatedInput.offset,
			"offset",
		);
		const params = buildEndpointParams({
			limit: {
				wireName: "limit",
				value: limit === undefined ? undefined : String(limit),
			},
			offset: {
				wireName: "offset",
				value: offset === undefined ? undefined : String(offset),
			},
		});

		return requestGetEffect<GetServicesResponse>(client, path, params);
	};

	/**
	 * Creates a bundle from package tracking numbers.
	 *
	 * @param input - Generated CreateBundleRequest body.
	 * @returns A promise of eBay's CreateBundleResponse.
	 *
	 * @example
	 * ```ts
	 * const bundle = await edeliveryApi.createBundle({ body: { bundle: { trackingNumbers: 'ES000000001' } } });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/createBundle
	 */
	public createBundle = async (
		input: CreateBundleInput,
	): Promise<CreateBundleResponse> => {
		const client = this.client;
		const path = `${this.basePath}/bundle`;

		const validatedInput = requireObjectEffect<CreateBundleInput>(
			input,
			"input",
		);
		const bundleRequest = requireObjectEffect<CreateBundleRequest>(
			validatedInput.body,
			"body",
		);

		return requestPostEffect<CreateBundleResponse>(client, path, bundleRequest);
	};

	/**
	 * Retrieves a bundle by ID.
	 *
	 * @param input - Bundle identifier.
	 * @returns A promise of eBay's BundleDetailResponse.
	 *
	 * @example
	 * ```ts
	 * const bundle = await edeliveryApi.getBundle({ bundleId: 'BUNDLE123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/getBundle
	 */
	public getBundle = async (
		input: BundleIdInput,
	): Promise<GetBundleResponse> => {
		const client = this.client;
		const basePath = this.basePath;

		const validatedInput = requireObjectEffect<BundleIdInput>(input, "input");
		const bundleId = requireStringEffect(validatedInput.bundleId, "bundleId");

		return requestGetEffect<GetBundleResponse>(
			client,
			`${basePath}/bundle/${bundleId}`,
		);
	};

	/**
	 * Cancels a bundle by ID.
	 *
	 * @param input - Bundle identifier.
	 * @returns A promise that resolves when eBay returns no content.
	 *
	 * @example
	 * ```ts
	 * await edeliveryApi.cancelBundle({ bundleId: 'BUNDLE123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/cancelBundle
	 */
	public cancelBundle = async (
		input: BundleIdInput,
	): Promise<CancelBundleResponse> => {
		const client = this.client;
		const basePath = this.basePath;

		const validatedInput = requireObjectEffect<BundleIdInput>(input, "input");
		const bundleId = requireStringEffect(validatedInput.bundleId, "bundleId");

		return requestPostEffect<CancelBundleResponse>(
			client,
			`${basePath}/bundle/${bundleId}/cancel`,
		);
	};

	/**
	 * Retrieves the label for a bundle.
	 *
	 * @param input - Bundle identifier.
	 * @returns A promise of eBay's BundleLabelResponse.
	 *
	 * @example
	 * ```ts
	 * const label = await edeliveryApi.getBundleLabel({ bundleId: 'BUNDLE123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/bundle/methods/getBundleLabel
	 */
	public getBundleLabel = async (
		input: BundleIdInput,
	): Promise<GetBundleLabelResponse> => {
		const client = this.client;
		const basePath = this.basePath;

		const validatedInput = requireObjectEffect<BundleIdInput>(input, "input");
		const bundleId = requireStringEffect(validatedInput.bundleId, "bundleId");

		return requestGetEffect<GetBundleLabelResponse>(
			client,
			`${basePath}/bundle/${bundleId}/label`,
		);
	};

	/**
	 * Creates a package.
	 *
	 * @param input - Generated AddPackageRequest body.
	 * @returns A promise of eBay's AddPackageResponses.
	 *
	 * @example
	 * ```ts
	 * const createdPackage = await edeliveryApi.createPackage({ body: { packageInfo: {} } });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/createPackage
	 */
	public createPackage = async (
		input: CreatePackageInput,
	): Promise<CreatePackageResponse> => {
		const client = this.client;
		const path = `${this.basePath}/package`;

		const validatedInput = requireObjectEffect<CreatePackageInput>(
			input,
			"input",
		);
		const packageRequest = requireObjectEffect<CreatePackageRequest>(
			validatedInput.body,
			"body",
		);

		return requestPostEffect<CreatePackageResponse>(
			client,
			path,
			packageRequest,
		);
	};

	/**
	 * Retrieves a package by ID.
	 *
	 * @param input - Package identifier.
	 * @returns A promise of eBay's GetPackageDetailResponses.
	 *
	 * @example
	 * ```ts
	 * const packageDetail = await edeliveryApi.getPackage({ packageId: 'PKG123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/getPackage
	 */
	public getPackage = async (
		input: PackageIdInput,
	): Promise<GetPackageResponse> => {
		const client = this.client;
		const basePath = this.basePath;

		const validatedInput = requireObjectEffect<PackageIdInput>(input, "input");
		const packageId = requireStringEffect(
			validatedInput.packageId,
			"packageId",
		);

		return requestGetEffect<GetPackageResponse>(
			client,
			`${basePath}/package/${packageId}`,
		);
	};

	/**
	 * Deletes a package by ID.
	 *
	 * @param input - Package identifier.
	 * @returns A promise that resolves when eBay returns no content.
	 *
	 * @example
	 * ```ts
	 * await edeliveryApi.deletePackage({ packageId: 'PKG123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/deletePackage
	 */
	public deletePackage = async (
		input: PackageIdInput,
	): Promise<DeletePackageResponse> => {
		const client = this.client;
		const basePath = this.basePath;

		const validatedInput = requireObjectEffect<PackageIdInput>(input, "input");
		const packageId = requireStringEffect(
			validatedInput.packageId,
			"packageId",
		);

		return requestDeleteEffect<DeletePackageResponse>(
			client,
			`${basePath}/package/${packageId}`,
		);
	};

	/**
	 * Retrieves packages by fulfillment order line item ID.
	 *
	 * @param input - Fulfillment order line item identifier.
	 * @returns A promise of eBay's GetItemPackageIdResponses.
	 *
	 * @example
	 * ```ts
	 * const packages = await edeliveryApi.getPackagesByLineItemID({ orderLineItemId: 'LINE123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/getPackagesByLineItemID
	 */
	public getPackagesByLineItemID = async (
		input: GetPackagesByLineItemIDInput,
	): Promise<GetPackagesByLineItemIDResponse> => {
		const client = this.client;
		const basePath = this.basePath;

		const validatedInput = requireObjectEffect<GetPackagesByLineItemIDInput>(
			input,
			"input",
		);
		const orderLineItemId = requireStringEffect(
			validatedInput.orderLineItemId,
			"orderLineItemId",
		);

		return requestGetEffect<GetPackagesByLineItemIDResponse>(
			client,
			`${basePath}/package/${orderLineItemId}/item`,
		);
	};

	/**
	 * Cancels a package by ID.
	 *
	 * @param input - Package identifier.
	 * @returns A promise that resolves when eBay returns no content.
	 *
	 * @example
	 * ```ts
	 * await edeliveryApi.cancelPackage({ packageId: 'PKG123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/cancelPackage
	 */
	public cancelPackage = async (
		input: PackageIdInput,
	): Promise<CancelPackageResponse> => {
		const client = this.client;
		const basePath = this.basePath;

		const validatedInput = requireObjectEffect<PackageIdInput>(input, "input");
		const packageId = requireStringEffect(
			validatedInput.packageId,
			"packageId",
		);

		return requestPostEffect<CancelPackageResponse>(
			client,
			`${basePath}/package/${packageId}/cancel`,
		);
	};

	/**
	 * Clones a package by ID.
	 *
	 * @param input - Package identifier.
	 * @returns A promise of eBay's ClonePackageResponses.
	 *
	 * @example
	 * ```ts
	 * const clone = await edeliveryApi.clonePackage({ packageId: 'PKG123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/clonePackage
	 */
	public clonePackage = async (
		input: PackageIdInput,
	): Promise<ClonePackageResponse> => {
		const client = this.client;
		const basePath = this.basePath;

		const validatedInput = requireObjectEffect<PackageIdInput>(input, "input");
		const packageId = requireStringEffect(
			validatedInput.packageId,
			"packageId",
		);

		return requestPostEffect<ClonePackageResponse>(
			client,
			`${basePath}/package/${packageId}/clone`,
		);
	};

	/**
	 * Confirms a package by ID.
	 *
	 * @param input - Package identifier.
	 * @returns A promise that resolves when eBay returns no content.
	 *
	 * @example
	 * ```ts
	 * await edeliveryApi.confirmPackage({ packageId: 'PKG123' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/confirmPackage
	 */
	public confirmPackage = async (
		input: PackageIdInput,
	): Promise<ConfirmPackageResponse> => {
		const client = this.client;
		const basePath = this.basePath;

		const validatedInput = requireObjectEffect<PackageIdInput>(input, "input");
		const packageId = requireStringEffect(
			validatedInput.packageId,
			"packageId",
		);

		return requestPostEffect<ConfirmPackageResponse>(
			client,
			`${basePath}/package/${packageId}/confirm`,
		);
	};

	/**
	 * Cancels multiple packages.
	 *
	 * @param input - Generated CancelPackagesRequest body.
	 * @returns A promise of eBay's CancelPackagesResponses.
	 *
	 * @example
	 * ```ts
	 * const cancelledPackages = await edeliveryApi.bulkCancelPackages({ body: { requests: { packageIds: 'PKG123' } } });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkCancelPackages
	 */
	public bulkCancelPackages = async (
		input: BulkCancelPackagesInput,
	): Promise<BulkCancelPackagesResponse> => {
		const client = this.client;
		const path = `${this.basePath}/package/bulk_cancel_packages`;

		const validatedInput = requireObjectEffect<BulkCancelPackagesInput>(
			input,
			"input",
		);
		const cancelPackagesRequest =
			requireObjectEffect<BulkCancelPackagesRequest>(
				validatedInput.body,
				"body",
			);

		return requestPostEffect<BulkCancelPackagesResponse>(
			client,
			path,
			cancelPackagesRequest,
		);
	};

	/**
	 * Confirms multiple packages.
	 *
	 * @param input - Generated ConfirmPackagesRequest body.
	 * @returns A promise of eBay's ConfirmPackagesResponses.
	 *
	 * @example
	 * ```ts
	 * const confirmedPackages = await edeliveryApi.bulkConfirmPackages({ body: { requests: { packageIds: 'PKG123' } } });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkConfirmPackages
	 */
	public bulkConfirmPackages = async (
		input: BulkConfirmPackagesInput,
	): Promise<BulkConfirmPackagesResponse> => {
		const client = this.client;
		const path = `${this.basePath}/package/bulk_confirm_packages`;

		const validatedInput = requireObjectEffect<BulkConfirmPackagesInput>(
			input,
			"input",
		);
		const confirmPackagesRequest =
			requireObjectEffect<BulkConfirmPackagesRequest>(
				validatedInput.body,
				"body",
			);

		return requestPostEffect<BulkConfirmPackagesResponse>(
			client,
			path,
			confirmPackagesRequest,
		);
	};

	/**
	 * Deletes multiple packages.
	 *
	 * @param input - Generated DeletePackagesRequest body.
	 * @returns A promise of eBay's DeletePackagesResponses.
	 *
	 * @example
	 * ```ts
	 * const deletedPackages = await edeliveryApi.bulkDeletePackages({ body: { requests: { packageIds: 'PKG123' } } });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/package/methods/bulkDeletePackages
	 */
	public bulkDeletePackages = async (
		input: BulkDeletePackagesInput,
	): Promise<BulkDeletePackagesResponse> => {
		const client = this.client;
		const path = `${this.basePath}/package/bulk_delete_packages`;

		const validatedInput = requireObjectEffect<BulkDeletePackagesInput>(
			input,
			"input",
		);
		const deletePackagesRequest =
			requireObjectEffect<BulkDeletePackagesRequest>(
				validatedInput.body,
				"body",
			);

		return requestPostEffect<BulkDeletePackagesResponse>(
			client,
			path,
			deletePackagesRequest,
		);
	};

	/**
	 * Retrieves labels by tracking numbers.
	 *
	 * @param input - Required tracking numbers and optional label formatting preferences.
	 * @returns A promise of eBay's GetLabelListResponses.
	 *
	 * @example
	 * ```ts
	 * const labels = await edeliveryApi.getLabels({ trackingNumbers: 'ES000000001', pageSize: 'A4' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/labels/methods/getLabels
	 */
	public getLabels = async (
		input: GetLabelsInput,
	): Promise<GetLabelsResponse> => {
		const client = this.client;
		const path = `${this.basePath}/labels`;

		const validatedInput = requireObjectEffect<GetLabelsInput>(input, "input");
		const trackingNumbers = requireStringEffect(
			validatedInput.trackingNumbers,
			"trackingNumbers",
		);
		const pageSize = optionalStringEffect(validatedInput.pageSize, "pageSize");
		const printPreference = optionalStringEffect(
			validatedInput.printPreference,
			"printPreference",
		);
		const params = buildEndpointParams({
			pageSize: { wireName: "page_size", value: pageSize },
			printPreference: {
				wireName: "print_preference",
				value: printPreference,
			},
			trackingNumbers: {
				wireName: "tracking_numbers",
				value: trackingNumbers,
			},
		});

		return requestGetEffect<GetLabelsResponse>(client, path, params);
	};

	/**
	 * Retrieves a handover sheet by tracking numbers.
	 *
	 * @param input - Required tracking numbers.
	 * @returns A promise of eBay's GetHandoverSheetResponses.
	 *
	 * @example
	 * ```ts
	 * const sheet = await edeliveryApi.getHandoverSheet({ trackingNumbers: 'ES000000001' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/handover_sheet/methods/getHandoverSheet
	 */
	public getHandoverSheet = async (
		input: GetHandoverSheetInput,
	): Promise<GetHandoverSheetResponse> => {
		const client = this.client;
		const path = `${this.basePath}/handover_sheet`;

		const validatedInput = requireObjectEffect<GetHandoverSheetInput>(
			input,
			"input",
		);
		const trackingNumbers = requireStringEffect(
			validatedInput.trackingNumbers,
			"trackingNumbers",
		);
		const params = buildEndpointParams({
			trackingNumbers: {
				wireName: "tracking_numbers",
				value: trackingNumbers,
			},
		});

		return requestGetEffect<GetHandoverSheetResponse>(client, path, params);
	};

	/**
	 * Retrieves tracking details for one tracking number.
	 *
	 * @param input - Required tracking number.
	 * @returns A promise of eBay's GetTrackingDetailResponses.
	 *
	 * @example
	 * ```ts
	 * const tracking = await edeliveryApi.getTracking({ trackingNumber: 'ES000000001' });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/tracking/methods/getTracking
	 */
	public getTracking = async (
		input: GetTrackingInput,
	): Promise<GetTrackingResponse> => {
		const client = this.client;
		const path = `${this.basePath}/tracking`;

		const validatedInput = requireObjectEffect<GetTrackingInput>(
			input,
			"input",
		);
		const trackingNumber = requireStringEffect(
			validatedInput.trackingNumber,
			"trackingNumber",
		);
		const params = buildEndpointParams({
			trackingNumber: { wireName: "tracking_number", value: trackingNumber },
		});

		return requestGetEffect<GetTrackingResponse>(client, path, params);
	};

	/**
	 * Creates a complaint for shipment issues.
	 *
	 * @param input - Generated AddComplaintRequest body.
	 * @returns A promise of eBay's empty createComplaint response.
	 *
	 * @example
	 * ```ts
	 * const complaint = await edeliveryApi.createComplaint({ body: { complaintRequest: {} } });
	 * ```
	 *
	 * @see https://developer.ebay.com/api-docs/sell/edelivery_international_shipping/resources/complaint/methods/createComplaint
	 */
	public createComplaint = async (
		input: CreateComplaintInput,
	): Promise<CreateComplaintResponse> => {
		const client = this.client;
		const path = `${this.basePath}/complaint`;

		const validatedInput = requireObjectEffect<CreateComplaintInput>(
			input,
			"input",
		);
		const complaintRequest = requireObjectEffect<CreateComplaintRequest>(
			validatedInput.body,
			"body",
		);

		return requestPostEffect<CreateComplaintResponse>(
			client,
			path,
			complaintRequest,
		);
	};
}
