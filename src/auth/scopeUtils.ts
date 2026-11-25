import {
	FINANCES_EARNINGS_SCOPE,
	getDefaultScopes,
	getKnownScopes,
	LOGISTICS_SCOPE,
	POST_ORDER_DOCUMENT_SCOPE,
	validateScopes,
} from "@/shared/environment.js";

const FINANCES_EARNINGS_TOOLS = [
	"ebay_get_order_earnings",
	"ebay_get_order_earnings_by_id",
	"ebay_get_order_earnings_summary",
];

const LOGISTICS_TOOLS = [
	"ebay_create_shipping_quote",
	"ebay_get_shipping_quote",
	"ebay_create_shipment_from_shipping_quote",
	"ebay_get_shipment",
	"ebay_cancel_shipment",
	"ebay_download_shipping_label_file",
];

function optionalConsent(
	tools: readonly string[],
	scope: string,
	description: string,
): Record<string, ScopeRequirement> {
	return Object.fromEntries(
		tools.map((tool) => [
			tool,
			{ requiredScopes: [scope], minimumScope: scope, description },
		]),
	);
}

export interface ScopeValidationResult {
	isValid: boolean;
	warnings: string[];
	validScopes: string[];
	invalidScopes: string[];
}

export interface ScopeDifference {
	inBothEnvironments: string[];
	productionOnly: string[];
	sandboxOnly: string[];
}

export interface ScopeRequirement {
	requiredScopes: string[];
	optionalScopes?: string[];
	minimumScope: string;
	description: string;
}

export function validateScopesDetailed(
	scopes: string[],
	environment: "production" | "sandbox",
): ScopeValidationResult {
	const validation = validateScopes(scopes, environment);
	const validScopeSet = new Set(getKnownScopes(environment));

	const validScopes: string[] = [];
	const invalidScopes: string[] = [];

	scopes.forEach((scope) => {
		if (validScopeSet.has(scope)) {
			validScopes.push(scope);
		} else {
			invalidScopes.push(scope);
		}
	});

	return {
		isValid: invalidScopes.length == 0,
		warnings: validation.warnings,
		validScopes,
		invalidScopes,
	};
}

export function getRequiredScopesForTool(
	toolName: string,
): ScopeRequirement | null {
	const postOrderTools = [
		"ebay_upload_post_order_document",
		"ebay_download_post_order_document",
		"ebay_remove_post_order_document",
	];
	const documentTools = [
		"ebay_create_image_from_url",
		"ebay_create_document",
		"ebay_create_document_from_url",
		"ebay_get_document",
		"ebay_upload_document",
	];
	const mediaConsentDescription =
		"Requires user consent for the Media API scope; post-order access also requires an eligible keyset";

	const isPostOrderTool = postOrderTools.includes(toolName);

	if (isPostOrderTool) {
		return {
			requiredScopes: [POST_ORDER_DOCUMENT_SCOPE],
			minimumScope: POST_ORDER_DOCUMENT_SCOPE,
			description: mediaConsentDescription,
		};
	}

	const isDocumentTool = documentTools.includes(toolName);

	if (isDocumentTool) {
		return {
			requiredScopes: ["https://api.ebay.com/oauth/api_scope/sell.inventory"],
			minimumScope: "https://api.ebay.com/oauth/api_scope/sell.inventory",
			description: mediaConsentDescription,
		};
	}

	// Scope requirements mapping based on eBay API documentation
	const scopeMap: Record<string, ScopeRequirement> = {
		...optionalConsent(
			FINANCES_EARNINGS_TOOLS,
			FINANCES_EARNINGS_SCOPE,
			"Requires the optional sell.finances.earnings.read scope; add it to EBAY_OAUTH_SCOPES and repeat user consent",
		),
		...optionalConsent(
			LOGISTICS_TOOLS,
			LOGISTICS_SCOPE,
			"Requires the limited-release sell.logistics scope; eligible keysets add it to EBAY_OAUTH_SCOPES and repeat user consent",
		),

		// Inventory Management Tools
		ebay_get_inventory_items: {
			requiredScopes: [
				"https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
				"https://api.ebay.com/oauth/api_scope/sell.inventory",
			],
			minimumScope:
				"https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
			description: "Requires read access to inventory",
		},
		ebay_get_inventory_item: {
			requiredScopes: [
				"https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
				"https://api.ebay.com/oauth/api_scope/sell.inventory",
			],
			minimumScope:
				"https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
			description: "Requires read access to inventory",
		},
		ebay_create_or_replace_inventory_item: {
			requiredScopes: ["https://api.ebay.com/oauth/api_scope/sell.inventory"],
			minimumScope: "https://api.ebay.com/oauth/api_scope/sell.inventory",
			description: "Requires write access to inventory",
		},
		ebay_create_offer: {
			requiredScopes: ["https://api.ebay.com/oauth/api_scope/sell.inventory"],
			minimumScope: "https://api.ebay.com/oauth/api_scope/sell.inventory",
			description: "Requires write access to inventory",
		},
		ebay_publish_offer: {
			requiredScopes: ["https://api.ebay.com/oauth/api_scope/sell.inventory"],
			optionalScopes: [
				"https://api.ebay.com/oauth/api_scope/sell.account",
				"https://api.ebay.com/oauth/api_scope/sell.fulfillment",
			],
			minimumScope: "https://api.ebay.com/oauth/api_scope/sell.inventory",
			description:
				"Requires write access to inventory; policies must exist (sell.account)",
		},

		// Order Management Tools
		ebay_get_orders: {
			requiredScopes: [
				"https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
				"https://api.ebay.com/oauth/api_scope/sell.fulfillment",
			],
			minimumScope:
				"https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
			description: "Requires read access to order fulfillment",
		},
		ebay_get_order: {
			requiredScopes: [
				"https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
				"https://api.ebay.com/oauth/api_scope/sell.fulfillment",
			],
			minimumScope:
				"https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
			description: "Requires read access to order fulfillment",
		},
		ebay_create_shipping_fulfillment: {
			requiredScopes: ["https://api.ebay.com/oauth/api_scope/sell.fulfillment"],
			minimumScope: "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
			description: "Requires write access to order fulfillment",
		},
		ebay_issue_refund: {
			requiredScopes: ["https://api.ebay.com/oauth/api_scope/sell.fulfillment"],
			minimumScope: "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
			description: "Requires write access to order fulfillment",
		},

		// Account Management Tools
		ebay_get_fulfillment_policies: {
			requiredScopes: [
				"https://api.ebay.com/oauth/api_scope/sell.account.readonly",
				"https://api.ebay.com/oauth/api_scope/sell.account",
			],
			minimumScope:
				"https://api.ebay.com/oauth/api_scope/sell.account.readonly",
			description: "Requires read access to account settings",
		},
		ebay_create_fulfillment_policy: {
			requiredScopes: ["https://api.ebay.com/oauth/api_scope/sell.account"],
			minimumScope: "https://api.ebay.com/oauth/api_scope/sell.account",
			description: "Requires write access to account settings",
		},
		ebay_update_fulfillment_policy: {
			requiredScopes: ["https://api.ebay.com/oauth/api_scope/sell.account"],
			minimumScope: "https://api.ebay.com/oauth/api_scope/sell.account",
			description: "Requires write access to account settings",
		},

		// Marketing Tools
		ebay_get_campaigns: {
			requiredScopes: [
				"https://api.ebay.com/oauth/api_scope/sell.marketing.readonly",
				"https://api.ebay.com/oauth/api_scope/sell.marketing",
			],
			minimumScope:
				"https://api.ebay.com/oauth/api_scope/sell.marketing.readonly",
			description: "Requires read access to marketing campaigns",
		},
		ebay_create_campaign: {
			requiredScopes: ["https://api.ebay.com/oauth/api_scope/sell.marketing"],
			optionalScopes: [
				"https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
			],
			minimumScope: "https://api.ebay.com/oauth/api_scope/sell.marketing",
			description: "Requires write access to marketing campaigns",
		},

		// Analytics Tools
		ebay_get_traffic_report: {
			requiredScopes: [
				"https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
			],
			minimumScope:
				"https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
			description: "Requires read access to analytics",
		},

		// Messaging Tools
		ebay_send_message: {
			requiredScopes: ["https://api.ebay.com/oauth/api_scope/commerce.message"],
			minimumScope: "https://api.ebay.com/oauth/api_scope/commerce.message",
			description: "Requires access to messaging (production only)",
		},

		// Feedback Tools
		ebay_leave_feedback_for_buyer: {
			requiredScopes: [
				"https://api.ebay.com/oauth/api_scope/commerce.feedback",
			],
			minimumScope: "https://api.ebay.com/oauth/api_scope/commerce.feedback",
			description: "Requires write access to feedback",
		},

		// Identity Tools
		ebay_get_user: {
			requiredScopes: [
				"https://api.ebay.com/oauth/api_scope/commerce.identity.readonly",
			],
			minimumScope:
				"https://api.ebay.com/oauth/api_scope/commerce.identity.readonly",
			description: "Requires read access to user identity",
		},
	};

	return scopeMap[toolName] || null;
}

export function hasRequiredScopes(
	tokenScopes: string[],
	requiredScopes: string[],
): boolean {
	const tokenScopeSet = new Set(tokenScopes);

	// Check if at least one of the required scopes is present
	// (Some tools accept either readonly or write scope)
	return requiredScopes.some((scope) => tokenScopeSet.has(scope));
}

export function getScopeDifferences(): ScopeDifference {
	const productionScopes = getDefaultScopes("production");
	const sandboxScopes = getDefaultScopes("sandbox");

	const productionSet = new Set(productionScopes);
	const sandboxSet = new Set(sandboxScopes);

	const inBothEnvironments: string[] = [];
	const productionOnly: string[] = [];
	const sandboxOnly: string[] = [];

	// Find scopes in both
	productionScopes.forEach((scope) => {
		if (sandboxSet.has(scope)) {
			inBothEnvironments.push(scope);
		} else {
			productionOnly.push(scope);
		}
	});

	// Find sandbox-only scopes
	sandboxScopes.forEach((scope) => {
		if (!productionSet.has(scope)) {
			sandboxOnly.push(scope);
		}
	});

	return {
		inBothEnvironments,
		productionOnly,
		sandboxOnly,
	};
}

export function formatScopeForDisplay(scope: string): string {
	const prefix = "https://api.ebay.com/oauth/";
	if (scope.startsWith(prefix)) {
		return scope.substring(prefix.length);
	}
	return scope;
}

export function groupScopesByCategory(
	scopes: string[],
): Record<string, string[]> {
	const sell: string[] = [];
	const buy: string[] = [];
	const commerce: string[] = [];
	const other: string[] = [];

	scopes.forEach((scope) => {
		if (scope.includes("/sell.")) {
			sell.push(scope);
		} else if (scope.includes("/buy.")) {
			buy.push(scope);
		} else if (scope.includes("/commerce.")) {
			commerce.push(scope);
		} else {
			other.push(scope);
		}
	});

	return { sell, buy, commerce, other };
}

export function isScopeReadonly(scope: string): boolean {
	return scope.includes(".readonly");
}

export function getWriteScope(readonlyScope: string): string | null {
	if (!isScopeReadonly(readonlyScope)) {
		return null; // Already a write scope
	}

	return readonlyScope.replace(".readonly", "");
}

export function getReadonlyScope(writeScope: string): string | null {
	if (isScopeReadonly(writeScope)) {
		return null; // Already a readonly scope
	}

	// Not all write scopes have readonly equivalents
	const hasReadonly = [
		"sell.inventory",
		"sell.fulfillment",
		"sell.account",
		"sell.marketing",
		"sell.analytics",
		"sell.reputation",
		"sell.stores",
		"commerce.identity",
		"commerce.notification.subscription",
		"commerce.feedback",
	];

	const scopeType = writeScope.split("/").pop() ?? "";
	const hasNoScopeType = scopeType == "";

	if (hasNoScopeType) {
		return null;
	}

	function includesReadonlyMarker(readonlyMarker: string): boolean {
		return scopeType.includes(readonlyMarker);
	}

	const hasReadonlyMarker = hasReadonly.some(includesReadonlyMarker);

	if (hasReadonlyMarker) {
		return `${writeScope}.readonly`;
	}

	return null;
}

export function getScopeTypeDescription(scope: string): string {
	// Extract the last part of the scope
	const parts = scope.split("/");
	const scopeType = parts[parts.length - 1];
	const isScopeTypeMissing = scopeType == null;

	if (isScopeTypeMissing) {
		return `Access to ${scope}`;
	}

	const descriptions: Record<string, string> = {
		api_scope: "View public data from eBay",
		"commerce.post_order.document":
			"Upload, download and remove post-order documents",
		"sell.inventory": "View and manage your inventory and offers",
		"sell.inventory.readonly": "View your inventory and offers",
		"sell.fulfillment": "View and manage your order fulfillments",
		"sell.fulfillment.readonly": "View your order fulfillments",
		"sell.account": "View and manage your account settings",
		"sell.account.readonly": "View your account settings",
		"sell.marketing": "View and manage your eBay marketing activities",
		"sell.marketing.readonly": "View your eBay marketing activities",
		"sell.analytics.readonly": "View your selling analytics data",
		"sell.finances": "View and manage your payment and order information",
		"sell.finances.earnings.read": "View your order earnings",
		"sell.logistics": "Create shipping quotes and purchase shipping labels",
		"sell.payment.dispute": "View and manage disputes and related details",
		"commerce.identity.readonly":
			"View basic user information from eBay account",
		"sell.reputation": "View and manage your reputation data",
		"sell.reputation.readonly": "View your reputation data",
		"commerce.notification.subscription":
			"View and manage event notification subscriptions",
		"commerce.notification.subscription.readonly":
			"View event notification subscriptions",
		"commerce.feedback": "View and manage feedback",
		"commerce.feedback.readonly": "View feedback",
		"commerce.message": "Send and receive messages with buyers/sellers",
		"sell.stores": "View and manage eBay stores",
		"sell.stores.readonly": "View eBay stores",
	};

	const description = descriptions[scopeType];
	return description ?? `Access to ${scopeType}`;
}
