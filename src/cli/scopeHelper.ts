import { writeCliLine } from "@/shared/cliOutput.js";
import { getDefaultScopes } from "@/shared/environment.js";
import { paint } from "@/shared/paint.js";

export interface ScopeCategory {
	name: string;
	description: string;
	scopes: string[];
	required: boolean;
}

export interface ScopeCoverageVerification {
	hasAllRequired: boolean;
	missingScopes: string[];
	extraScopes: string[];
}

export function getScopeCategories(): ScopeCategory[] {
	return [
		{
			name: "Inventory Management",
			description: "Create, read, update, and delete inventory items",
			scopes: ["https://api.ebay.com/oauth/api_scope/sell.inventory"],
			required: true,
		},
		{
			name: "Order Fulfillment",
			description: "View and manage orders, shipping, and fulfillment",
			scopes: [
				"https://api.ebay.com/oauth/api_scope/sell.fulfillment",
				"https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
			],
			required: true,
		},
		{
			name: "Account Management",
			description: "Manage account settings, policies, and preferences",
			scopes: [
				"https://api.ebay.com/oauth/api_scope/sell.account",
				"https://api.ebay.com/oauth/api_scope/sell.account.readonly",
			],
			required: true,
		},
		{
			name: "Analytics & Reports",
			description: "Access sales analytics and performance reports",
			scopes: [
				"https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
				"https://api.ebay.com/oauth/api_scope/sell.marketplace.insights.readonly",
			],
			required: false,
		},
		{
			name: "Marketing & Promotions",
			description: "Create and manage marketing campaigns and promotions",
			scopes: [
				"https://api.ebay.com/oauth/api_scope/sell.marketing",
				"https://api.ebay.com/oauth/api_scope/sell.marketing.readonly",
			],
			required: false,
		},
		{
			name: "Finance & Payments",
			description: "Access financial data and payment information",
			scopes: ["https://api.ebay.com/oauth/api_scope/sell.finances"],
			required: false,
		},
		{
			name: "Reputation & Feedback",
			description: "Manage seller reputation and customer feedback",
			scopes: ["https://api.ebay.com/oauth/api_scope/sell.reputation"],
			required: false,
		},
		{
			name: "Commerce Services",
			description: "Identity verification, notifications, and messaging",
			scopes: [
				"https://api.ebay.com/oauth/api_scope/commerce.identity.readonly",
				"https://api.ebay.com/oauth/api_scope/commerce.notification.subscription",
				"https://api.ebay.com/oauth/api_scope/sell.stores",
			],
			required: false,
		},
	];
}

export function getRecommendedScopes(
	environment: "sandbox" | "production",
): string[] {
	return getDefaultScopes(environment);
}

export function displayScopeCategories(): void {
	writeCliLine(paint.bold.cyan("\n📋 Available OAuth Scopes\n"));

	const categories = getScopeCategories();

	for (const category of categories) {
		const badge = category.required
			? paint.green("[Required]")
			: paint.gray("[Optional]");
		writeCliLine(`${badge} ${paint.bold.white(category.name)}`);
		writeCliLine(`  ${paint.gray(category.description)}`);
		writeCliLine(paint.gray(`  Scopes: ${category.scopes.length}`));
		writeCliLine("");
	}
}

export function verifyScopesCoverage(
	tokenScopes: string[],
	requiredScopes: string[],
): ScopeCoverageVerification {
	const tokenScopeSet = new Set(tokenScopes);
	const requiredScopeSet = new Set(requiredScopes);

	const missingScopes = requiredScopes.filter(
		(scope) => !tokenScopeSet.has(scope),
	);
	const extraScopes = tokenScopes.filter(
		(scope) => !requiredScopeSet.has(scope),
	);

	return {
		hasAllRequired: missingScopes.length == 0,
		missingScopes,
		extraScopes,
	};
}

export function displayScopeVerification(
	tokenScopes: string[],
	environment: "sandbox" | "production",
): void {
	writeCliLine(paint.bold.cyan("\n🔍 Scope Verification\n"));

	const recommendedScopes = getRecommendedScopes(environment);
	const verification = verifyScopesCoverage(tokenScopes, recommendedScopes);

	writeCliLine(paint.bold.white("Token Scopes:"));
	writeCliLine(paint.gray(`  Total: ${tokenScopes.length}\n`));

	if (verification.hasAllRequired) {
		writeCliLine(paint.green("✓ Token has all recommended scopes\n"));
	} else {
		writeCliLine(paint.yellow("⚠️  Token is missing some recommended scopes\n"));

		writeCliLine(paint.bold.white("Missing Scopes:"));
		for (const scope of verification.missingScopes) {
			writeCliLine(paint.yellow(`  • ${scope}`));
		}
		writeCliLine("");
	}

	if (verification.extraScopes.length > 0) {
		writeCliLine(paint.gray("Additional Scopes (not in recommended list):"));
		for (const scope of verification.extraScopes) {
			writeCliLine(paint.gray(`  • ${scope}`));
		}
		writeCliLine("");
	}

	// Display scope categories and their status
	const categories = getScopeCategories();
	const tokenScopeSet = new Set(tokenScopes);

	writeCliLine(paint.bold.white("Coverage by Category:\n"));

	for (const category of categories) {
		const hasAllCategoryScopes = category.scopes.every((scope) =>
			tokenScopeSet.has(scope),
		);
		const hasSomeCategoryScopes = category.scopes.some((scope) =>
			tokenScopeSet.has(scope),
		);

		let status: string;
		if (hasAllCategoryScopes) {
			status = paint.green("✓ Full");
		} else if (hasSomeCategoryScopes) {
			status = paint.yellow("◐ Partial");
		} else {
			status = paint.red("✗ None");
		}

		const badge = category.required
			? paint.red("[Required]")
			: paint.gray("[Optional]");
		writeCliLine(`${status} ${badge} ${category.name}`);
	}

	writeCliLine("");
}

export function describeScopeFromOAuthUrl(scope: string): string {
	const descriptions: Record<string, string> = {
		"https://api.ebay.com/oauth/api_scope/sell.inventory":
			"Manage inventory items and offers",
		"https://api.ebay.com/oauth/api_scope/sell.fulfillment":
			"Manage orders and shipping",
		"https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly":
			"View orders and shipping",
		"https://api.ebay.com/oauth/api_scope/sell.account":
			"Manage account settings",
		"https://api.ebay.com/oauth/api_scope/sell.account.readonly":
			"View account settings",
		"https://api.ebay.com/oauth/api_scope/sell.analytics.readonly":
			"View analytics and reports",
		"https://api.ebay.com/oauth/api_scope/sell.marketing":
			"Manage marketing campaigns",
		"https://api.ebay.com/oauth/api_scope/sell.marketing.readonly":
			"View marketing campaigns",
		"https://api.ebay.com/oauth/api_scope/sell.finances": "View financial data",
		"https://api.ebay.com/oauth/api_scope/sell.reputation":
			"Manage seller reputation",
		"https://api.ebay.com/oauth/api_scope/commerce.identity.readonly":
			"View user identity",
		"https://api.ebay.com/oauth/api_scope/sell.stores": "Manage eBay Stores",
		"https://api.ebay.com/oauth/api_scope/commerce.notification.subscription":
			"Manage notification subscriptions",
		"https://api.ebay.com/oauth/api_scope/sell.marketplace.insights.readonly":
			"View marketplace insights",
	};

	return descriptions[scope] || "No description available";
}

export function formatScopesForDisplay(scopes: string[]): string {
	return scopes
		.map((scope) => {
			const shortName = scope.split("/").pop() || scope;
			return `  • ${shortName}`;
		})
		.join("\n");
}

export function getAllScopesString(
	environment: "sandbox" | "production",
): string {
	return getRecommendedScopes(environment).join(" ");
}

export function parseScopeString(scopeString: string): string[] {
	return scopeString
		.split(/\s+/)
		.map((scope) => scope.trim())
		.filter((scope) => scope.length > 0);
}
