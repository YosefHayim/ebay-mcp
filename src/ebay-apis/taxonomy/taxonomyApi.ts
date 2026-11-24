import type { z } from "zod";
import { categoryTreeIdInputSchema } from "@/ebay-apis/taxonomy/categoryTreeSchemas.js";
import {
	type DownloadedFile,
	requestDownloadEffect,
} from "@/ebay-client/download.js";
import type {
	EbayApiClient,
	EbayRequestConfig,
} from "@/ebay-client/ebayApiClient.js";
import {
	buildEndpointParams,
	decodeEndpointInputEffect,
	requestGetEffect,
	requireObjectEffect,
	requireStringEffect,
} from "@/ebay-client/request.js";
import type { components } from "@/ebay-openapi-types/commerceTaxonomyV1Oas3.js";

const ITEM_ASPECTS_DOWNLOAD: EbayRequestConfig = { timeoutMs: 120_000 };

export type CategoryTreeIdInput = z.infer<typeof categoryTreeIdInputSchema>;

export interface GetDefaultCategoryTreeIdInput {
	readonly marketplaceId: string;
}

export interface GetCategoryTreeInput {
	readonly categoryTreeId: string;
}

export interface GetCategorySubtreeInput {
	readonly categoryTreeId: string;
	readonly categoryId: string;
}

export interface GetCategorySuggestionsInput {
	readonly categoryTreeId: string;
	readonly query: string;
}

export interface GetItemAspectsForCategoryInput {
	readonly categoryTreeId: string;
	readonly categoryId: string;
}

export interface GetCompatibilityPropertiesInput {
	readonly categoryTreeId: string;
	readonly categoryId: string;
}

export interface GetCompatibilityPropertyValuesInput {
	readonly categoryTreeId: string;
	readonly categoryId: string;
	readonly compatibilityProperty: string;
}

export type GetDefaultCategoryTreeIdResponse =
	| components["schemas"]["BaseCategoryTree"]
	| undefined;

export type GetCategoryTreeResponse = components["schemas"]["CategoryTree"];

export type GetCategorySubtreeResponse =
	components["schemas"]["CategorySubtree"];

export type GetCategorySuggestionsResponse =
	| components["schemas"]["CategorySuggestionResponse"]
	| undefined;

export type GetItemAspectsForCategoryResponse =
	| components["schemas"]["AspectMetadata"]
	| undefined;

export type GetCompatibilityPropertiesResponse =
	| components["schemas"]["GetCompatibilityMetadataResponse"]
	| undefined;

export type GetCompatibilityPropertyValuesResponse =
	| components["schemas"]["GetCompatibilityPropertyValuesResponse"]
	| undefined;

export type GetExpiredCategoriesResponse =
	| components["schemas"]["ExpiredCategories"]
	| undefined;

export class TaxonomyApi {
	private readonly basePath = "/commerce/taxonomy/v1";

	private readonly client: EbayApiClient;

	public constructor(client: EbayApiClient) {
		this.client = client;
	}

	public getDefaultCategoryTreeId = async (
		input: GetDefaultCategoryTreeIdInput,
	): Promise<GetDefaultCategoryTreeIdResponse> => {
		const validatedInput = requireObjectEffect<GetDefaultCategoryTreeIdInput>(
			input,
			"input",
		);
		const marketplaceId = requireStringEffect(
			validatedInput.marketplaceId,
			"marketplaceId",
		);
		const params = buildEndpointParams({
			marketplaceId: { wireName: "marketplace_id", value: marketplaceId },
		});

		return requestGetEffect<GetDefaultCategoryTreeIdResponse>(
			this.client,
			`${this.basePath}/get_default_category_tree_id`,
			params,
		);
	};

	public getCategoryTree = async (
		input: GetCategoryTreeInput,
	): Promise<GetCategoryTreeResponse> => {
		const validatedInput = requireObjectEffect<GetCategoryTreeInput>(
			input,
			"input",
		);
		const categoryTreeId = requireStringEffect(
			validatedInput.categoryTreeId,
			"categoryTreeId",
		);

		return requestGetEffect<GetCategoryTreeResponse>(
			this.client,
			`${this.basePath}/category_tree/${categoryTreeId}`,
		);
	};

	public getCategorySubtree = async (
		input: GetCategorySubtreeInput,
	): Promise<GetCategorySubtreeResponse> => {
		const validatedInput = requireObjectEffect<GetCategorySubtreeInput>(
			input,
			"input",
		);
		const categoryTreeId = requireStringEffect(
			validatedInput.categoryTreeId,
			"categoryTreeId",
		);
		const categoryId = requireStringEffect(
			validatedInput.categoryId,
			"categoryId",
		);
		const params = buildEndpointParams({
			categoryId: { wireName: "category_id", value: categoryId },
		});

		return requestGetEffect<GetCategorySubtreeResponse>(
			this.client,
			`${this.basePath}/category_tree/${categoryTreeId}/get_category_subtree`,
			params,
		);
	};

	public getCategorySuggestions = async (
		input: GetCategorySuggestionsInput,
	): Promise<GetCategorySuggestionsResponse> => {
		const validatedInput = requireObjectEffect<GetCategorySuggestionsInput>(
			input,
			"input",
		);
		const categoryTreeId = requireStringEffect(
			validatedInput.categoryTreeId,
			"categoryTreeId",
		);
		const query = requireStringEffect(validatedInput.query, "query");
		const params = buildEndpointParams({
			query: { wireName: "q", value: query },
		});

		return requestGetEffect<GetCategorySuggestionsResponse>(
			this.client,
			`${this.basePath}/category_tree/${categoryTreeId}/get_category_suggestions`,
			params,
		);
	};

	public getItemAspectsForCategory = async (
		input: GetItemAspectsForCategoryInput,
	): Promise<GetItemAspectsForCategoryResponse> => {
		const validatedInput = requireObjectEffect<GetItemAspectsForCategoryInput>(
			input,
			"input",
		);
		const categoryTreeId = requireStringEffect(
			validatedInput.categoryTreeId,
			"categoryTreeId",
		);
		const categoryId = requireStringEffect(
			validatedInput.categoryId,
			"categoryId",
		);
		const params = buildEndpointParams({
			categoryId: { wireName: "category_id", value: categoryId },
		});

		return requestGetEffect<GetItemAspectsForCategoryResponse>(
			this.client,
			`${this.basePath}/category_tree/${categoryTreeId}/get_item_aspects_for_category`,
			params,
		);
	};

	public getCompatibilityProperties = async (
		input: GetCompatibilityPropertiesInput,
	): Promise<GetCompatibilityPropertiesResponse> => {
		const validatedInput = requireObjectEffect<GetCompatibilityPropertiesInput>(
			input,
			"input",
		);
		const categoryTreeId = requireStringEffect(
			validatedInput.categoryTreeId,
			"categoryTreeId",
		);
		const categoryId = requireStringEffect(
			validatedInput.categoryId,
			"categoryId",
		);
		const params = buildEndpointParams({
			categoryId: { wireName: "category_id", value: categoryId },
		});

		return requestGetEffect<GetCompatibilityPropertiesResponse>(
			this.client,
			`${this.basePath}/category_tree/${categoryTreeId}/get_compatibility_properties`,
			params,
		);
	};

	public getCompatibilityPropertyValues = async (
		input: GetCompatibilityPropertyValuesInput,
	): Promise<GetCompatibilityPropertyValuesResponse> => {
		const validatedInput =
			requireObjectEffect<GetCompatibilityPropertyValuesInput>(input, "input");
		const categoryTreeId = requireStringEffect(
			validatedInput.categoryTreeId,
			"categoryTreeId",
		);
		const categoryId = requireStringEffect(
			validatedInput.categoryId,
			"categoryId",
		);
		const compatibilityProperty = requireStringEffect(
			validatedInput.compatibilityProperty,
			"compatibilityProperty",
		);
		const params = buildEndpointParams({
			categoryId: { wireName: "category_id", value: categoryId },
			compatibilityProperty: {
				wireName: "compatibility_property",
				value: compatibilityProperty,
			},
		});

		return requestGetEffect<GetCompatibilityPropertyValuesResponse>(
			this.client,
			`${this.basePath}/category_tree/${categoryTreeId}/get_compatibility_property_values`,
			params,
		);
	};

	public fetchItemAspects = async (
		input: CategoryTreeIdInput,
	): Promise<DownloadedFile> => {
		const path = this.categoryTreeResourcePath(input, "fetch_item_aspects");

		return requestDownloadEffect(this.client, path, ITEM_ASPECTS_DOWNLOAD);
	};

	public getExpiredCategories = async (
		input: CategoryTreeIdInput,
	): Promise<GetExpiredCategoriesResponse> => {
		const path = this.categoryTreeResourcePath(input, "get_expired_categories");

		return requestGetEffect<GetExpiredCategoriesResponse>(this.client, path);
	};

	private categoryTreeResourcePath = (
		input: CategoryTreeIdInput,
		resource: string,
	): string => {
		const { categoryTreeId } = decodeEndpointInputEffect(
			categoryTreeIdInputSchema,
			input,
		);

		return `${this.basePath}/category_tree/${encodeURIComponent(categoryTreeId)}/${resource}`;
	};
}
