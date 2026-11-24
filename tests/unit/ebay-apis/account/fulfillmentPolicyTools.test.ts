import { describe, expect, it } from "vitest";
import { getRequiredScopesForTool } from "@/auth/scopeUtils.js";
import { getToolDefinitions } from "@/tool-registry/index.js";

const policyToolNames = [
	"ebay_create_fulfillment_policy",
	"ebay_update_fulfillment_policy",
] as const;

describe("fulfillment policy write tools", () => {
	it("advertises create and update with their required input contracts", () => {
		const definitions = new Map(
			getToolDefinitions().map((definition) => [definition.name, definition]),
		);

		const createTool = definitions.get(policyToolNames[0]);
		const updateTool = definitions.get(policyToolNames[1]);

		expect(Object.keys(createTool?.inputSchema ?? {})).toEqual(["policy"]);
		expect(Object.keys(updateTool?.inputSchema ?? {})).toEqual([
			"fulfillmentPolicyId",
			"policy",
		]);
		expect(createTool?.description).toContain("sell.account");
		expect(updateTool?.description).toContain("sell.account");
	});

	it.each(
		policyToolNames,
	)("%s requires the account write scope", (toolName) => {
		expect(getRequiredScopesForTool(toolName)).toMatchObject({
			requiredScopes: ["https://api.ebay.com/oauth/api_scope/sell.account"],
			minimumScope: "https://api.ebay.com/oauth/api_scope/sell.account",
		});
	});
});
