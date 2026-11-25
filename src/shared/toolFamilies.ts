import process from "node:process";

export const TOOL_FAMILY_KEYS = [
	"connector",
	"token-management",
	"account",
	"finances",
	"inventory",
	"feed",
	"stores",
	"fulfillment",
	"logistics",
	"marketing",
	"analytics",
	"metadata",
	"taxonomy",
	"communication",
	"browse",
	"other",
	"developer",
	"trading",
] as const;

export type ToolFamilyKey = (typeof TOOL_FAMILY_KEYS)[number];

const FAMILY_KEY_SET: ReadonlySet<string> = new Set(TOOL_FAMILY_KEYS);

export type ToolGatingMode =
	| { kind: "all" }
	| { kind: "dynamic" }
	| { kind: "static"; families: string[] };

function parseFamilyTokens(raw: string): string[] {
	return raw
		.split(",")
		.map((token) => token.trim().toLowerCase())
		.filter(Boolean);
}

export function resolveToolGatingMode(
	env: NodeJS.ProcessEnv = process.env,
): ToolGatingMode {
	const configuredTools = env["EBAY_MCP_TOOLS"]?.trim();
	const isMissing = configuredTools == null;

	if (isMissing) {
		return { kind: "all" };
	}

	const isEmpty = configuredTools == "";

	if (isEmpty) {
		return { kind: "all" };
	}

	const normalizedTools = configuredTools.toLowerCase();
	const isAll = normalizedTools == "all";

	if (isAll) {
		return { kind: "all" };
	}

	const isDynamic = normalizedTools == "dynamic";

	if (isDynamic) {
		return { kind: "dynamic" };
	}

	return { kind: "static", families: parseFamilyTokens(configuredTools) };
}

export function getToolGatingConfigError(
	env: NodeJS.ProcessEnv = process.env,
): string | undefined {
	const mode = resolveToolGatingMode(env);
	if (mode.kind != "static") {
		return;
	}

	if (mode.families.length == 0) {
		return `EBAY_MCP_TOOLS is set but lists no tool families. Use "all", "dynamic", or a comma-separated list of: ${TOOL_FAMILY_KEYS.join(", ")}.`;
	}

	const unknown = mode.families.filter((family) => !FAMILY_KEY_SET.has(family));
	if (unknown.length == 0) {
		return;
	}

	const noun = unknown.length == 1 ? "family" : "families";
	return `EBAY_MCP_TOOLS contains unknown tool ${noun}: ${unknown.join(", ")}. Valid families: ${TOOL_FAMILY_KEYS.join(", ")}.`;
}
