import type { SetupClientId } from "@site/data/client-list.ts";

export type SetupEnvironment = "sandbox" | "production";
export type SetupToolsMode = "families" | "all" | "dynamic";

export interface SetupChoices {
	clientId: SetupClientId;
	environment: SetupEnvironment;
	toolsMode: SetupToolsMode;
	pickedFamilyKeys: string[];
}

export interface SetupConfig {
	filePath: string;
	configText: string;
	note: string;
	isShell: boolean;
}

const createToolsValue = (choices: SetupChoices): string => {
	if (choices.toolsMode === "all") return "all";
	if (choices.toolsMode === "dynamic") return "dynamic";

	return choices.pickedFamilyKeys.length > 0
		? choices.pickedFamilyKeys.join(",")
		: "inventory";
};

const createEnvironmentVariables = (
	choices: SetupChoices,
): Record<string, string> => {
	const variables: Record<string, string> = {
		EBAY_CLIENT_ID: "your_client_id",
		EBAY_CLIENT_SECRET: "your_client_secret",
		EBAY_ENVIRONMENT: choices.environment,
		EBAY_REDIRECT_URI: "your_ru_name",
		EBAY_MCP_TOOLS: createToolsValue(choices),
	};
	if (choices.environment === "production")
		variables["EBAY_USER_REFRESH_TOKEN"] = "your_refresh_token";

	return variables;
};

const JSON_CLIENT_DETAILS: Record<string, { filePath: string; note: string }> =
	{
		desktop: {
			filePath:
				"~/Library/Application Support/Claude/claude_desktop_config.json",
			note: "Restart Claude Desktop after saving. On Windows the file is in %APPDATA%\\Claude.",
		},
		cursor: {
			filePath: "~/.cursor/mcp.json",
			note: "Cursor picks the change up on its own. Check Settings, MCP, for a green dot.",
		},
		cline: {
			filePath: "cline_mcp_settings.json",
			note: "Open Cline, MCP Servers, Configure, and paste this in.",
		},
	};

/** The config text, file path and note for the client, environment and tools the visitor picked. */
export const createSetupConfig = (choices: SetupChoices): SetupConfig => {
	const environmentVariables = createEnvironmentVariables(choices);
	if (choices.clientId === "code") {
		const commandLines = ["claude mcp add ebay \\"];
		for (const [variableName, variableValue] of Object.entries(
			environmentVariables,
		)) {
			commandLines.push(`  --env ${variableName}=${variableValue} \\`);
		}
		commandLines.push("  -- npx -y ebay-mcp");

		return {
			filePath: "Terminal",
			configText: commandLines.join("\n"),
			note: "Adds the server to Claude Code for this project. Add --scope user to use it everywhere.",
			isShell: true,
		};
	}
	const serverEntry = {
		command: "npx",
		args: ["-y", "ebay-mcp"],
		env: environmentVariables,
	};
	if (choices.clientId === "vscode") {
		return {
			filePath: ".vscode/mcp.json",
			configText: JSON.stringify(
				{ servers: { ebay: { type: "stdio", ...serverEntry } } },
				null,
				2,
			),
			note: 'VS Code uses a "servers" key. Reload the window after saving.',
			isShell: false,
		};
	}
	const clientDetails =
		JSON_CLIENT_DETAILS[choices.clientId] ?? JSON_CLIENT_DETAILS["desktop"];

	return {
		filePath: clientDetails?.filePath ?? "",
		configText: JSON.stringify({ mcpServers: { ebay: serverEntry } }, null, 2),
		note: clientDetails?.note ?? "",
		isShell: false,
	};
};

/** The one line under the Tools buttons that says how many tools will load. */
export const createToolsHint = (
	toolsMode: SetupToolsMode,
	pickedToolCount: number,
): string => {
	if (toolsMode === "families") {
		return `Loads ${pickedToolCount} tools from the families picked under Coverage below.`;
	}
	if (toolsMode === "all")
		return "Loads every tool. Some clients cap the tool count, so check yours.";

	return "Starts small and loads tool families when the assistant asks for them.";
};
