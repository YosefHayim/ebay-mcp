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

export type GetAddressPreferencesInput = Record<string, never>;

export type GetConsignPreferencesInput = Record<string, never>;

export interface GetActualCostsInput {
	readonly trackingNumbers?: string;
	readonly transactionBeginTime?: string;
	readonly transactionEndTime?: string;
}

export interface EDeliveryPaginationInput {
	readonly limit?: number;
	readonly offset?: number;
}

export interface CreateAddressPreferenceInput {
	readonly body: CreateAddressPreferenceRequest;
}

export interface CreateConsignPreferenceInput {
	readonly body: CreateConsignPreferenceRequest;
}

export interface BundleIdInput {
	readonly bundleId: string;
}

export interface CreateBundleInput {
	readonly body: CreateBundleRequest;
}

export interface CreateComplaintInput {
	readonly body: CreateComplaintRequest;
}

export interface PackageIdInput {
	readonly packageId: string;
}

export interface CreatePackageInput {
	readonly body: CreatePackageRequest;
}

export interface GetPackagesByLineItemIDInput {
	readonly orderLineItemId: string;
}

export interface BulkCancelPackagesInput {
	readonly body: BulkCancelPackagesRequest;
}

export interface BulkConfirmPackagesInput {
	readonly body: BulkConfirmPackagesRequest;
}

export interface BulkDeletePackagesInput {
	readonly body: BulkDeletePackagesRequest;
}

export interface GetLabelsInput {
	readonly pageSize?: string;
	readonly printPreference?: string;
	readonly trackingNumbers: string;
}

export interface GetHandoverSheetInput {
	readonly trackingNumbers: string;
}

export interface GetTrackingInput {
	readonly trackingNumber: string;
}

export type GetActualCostsResponse =
	components["schemas"]["GetActualCostResponses"];

export type GetAddressPreferencesResponse =
	components["schemas"]["GetAddressPreferenceListResponses"];

export type CreateAddressPreferenceRequest =
	components["schemas"]["CreateAddressPreferenceRequest"];

export type CreateAddressPreferenceResponse =
	components["schemas"]["CreateAddressPreferenceResponses"];

export type GetConsignPreferencesResponse =
	components["schemas"]["GetConsignPreferenceListResponses"];

export type CreateConsignPreferenceRequest =
	components["schemas"]["CreateConsignPreferenceRequest"];

export type CreateConsignPreferenceResponse =
	components["schemas"]["CreateConsignPreferenceResponses"];

export type GetAgentsResponse = components["schemas"]["GetAgentListResponses"];

export type GetBatteryQualificationsResponse =
	components["schemas"]["GetBatteryQualListResponses"];

export type GetDropoffSitesResponse =
	components["schemas"]["GetDropoffSiteListResponses"];

export type GetServicesResponse =
	components["schemas"]["GetServiceListResponses"];

export type CreateBundleRequest = components["schemas"]["CreateBundleRequest"];

export type CreateBundleResponse =
	components["schemas"]["CreateBundleResponse"];

export type GetBundleResponse = components["schemas"]["BundleDetailResponse"];

export type CancelBundleResponse = void;

export type GetBundleLabelResponse =
	components["schemas"]["BundleLabelResponse"];

export type CreatePackageRequest = components["schemas"]["AddPackageRequest"];

export type CreatePackageResponse =
	components["schemas"]["AddPackageResponses"];

export type GetPackageResponse =
	components["schemas"]["GetPackageDetailResponses"];

export type DeletePackageResponse = void;

export type GetPackagesByLineItemIDResponse =
	components["schemas"]["GetItemPackageIdResponses"];

export type CancelPackageResponse = void;

export type ClonePackageResponse =
	components["schemas"]["ClonePackageResponses"];

export type ConfirmPackageResponse = void;

export type BulkCancelPackagesRequest =
	components["schemas"]["CancelPackagesRequest"];

export type BulkCancelPackagesResponse =
	components["schemas"]["CancelPackagesResponses"];

export type BulkConfirmPackagesRequest =
	components["schemas"]["ConfirmPackagesRequest"];

export type BulkConfirmPackagesResponse =
	components["schemas"]["ConfirmPackagesResponses"];

export type BulkDeletePackagesRequest =
	components["schemas"]["DeletePackagesRequest"];

export type BulkDeletePackagesResponse =
	components["schemas"]["DeletePackagesResponses"];

export type GetLabelsResponse = components["schemas"]["GetLabelListResponses"];

export type GetHandoverSheetResponse =
	components["schemas"]["GetHandoverSheetResponses"];

export type GetTrackingResponse =
	components["schemas"]["GetTrackingDetailResponses"];

export type CreateComplaintRequest =
	components["schemas"]["AddComplaintRequest"];

export type CreateComplaintResponse =
	operations["createComplaint"]["responses"][201]["content"]["application/json"];

export class EDeliveryApi {
	private readonly basePath = "/sell/edelivery_international_shipping/v1";

	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

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

	public getAddressPreferences = async (
		input: GetAddressPreferencesInput = {},
	): Promise<GetAddressPreferencesResponse> => {
		void input;
		return requestGetEffect<GetAddressPreferencesResponse>(
			this.client,
			`${this.basePath}/address_preference`,
		);
	};

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

	public getConsignPreferences = async (
		input: GetConsignPreferencesInput = {},
	): Promise<GetConsignPreferencesResponse> => {
		void input;
		return requestGetEffect<GetConsignPreferencesResponse>(
			this.client,
			`${this.basePath}/consign_preference`,
		);
	};

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
