import type {
	IncomingMessage,
	RequestListener,
	ServerResponse,
} from "node:http";
import type {
	OAuthServerMetadata,
	ProtectedResourceMetadata,
} from "./oauthTypes.js";

const JSON_CONTENT_TYPE = "application/json; charset=utf-8";

export interface MetadataConfig {
	resourceServerUrl: string;

	authServerMetadata: string | OAuthServerMetadata;

	scopesSupported: string[];

	resourceDocumentation?: string;

	resourceName?: string;

	ebayEnvironment?: "production" | "sandbox";

	ebayScopes?: string[];
}

interface McpServerInfo {
	name: string;
	version: string;
	resource_url: string;
	authorization_required: boolean;
	scopes_supported: string[];
	documentation?: string;
	ebay?: {
		environment: "production" | "sandbox";
		base_url: string;
		scopes: string[];
		note: string;
	};
}

function writeJson(
	response: ServerResponse,
	statusCode: number,
	document: unknown,
): void {
	response.statusCode = statusCode;
	response.setHeader("Content-Type", JSON_CONTENT_TYPE);
	response.end(JSON.stringify(document));
}

function readRequestPath(requestUrl: string | undefined): string {
	const pathToRead = requestUrl ?? "/";

	try {
		const parsedUrl = new URL(pathToRead, "http://127.0.0.1");
		return parsedUrl.pathname;
	} catch {
		return "/";
	}
}

function listAuthorizationServers(metadataConfig: MetadataConfig): string[] {
	const authServerMetadata = metadataConfig.authServerMetadata;

	if (typeof authServerMetadata == "string") {
		return [authServerMetadata];
	}

	return [authServerMetadata.issuer];
}

function createProtectedResourceMetadata(
	metadataConfig: MetadataConfig,
): ProtectedResourceMetadata {
	const metadata: ProtectedResourceMetadata = {
		resource: metadataConfig.resourceServerUrl,
		authorization_servers: listAuthorizationServers(metadataConfig),
		scopes_supported: metadataConfig.scopesSupported,
	};
	const documentation = metadataConfig.resourceDocumentation ?? "";
	const hasDocumentation = documentation != "";

	if (hasDocumentation) {
		metadata.resource_documentation = documentation;
	}

	return metadata;
}

function readEbayBaseUrl(ebayEnvironment: "production" | "sandbox"): string {
	if (ebayEnvironment == "production") {
		return "https://api.ebay.com";
	}

	return "https://api.sandbox.ebay.com";
}

function createMcpServerInfo(metadataConfig: MetadataConfig): McpServerInfo {
	const serverInfo: McpServerInfo = {
		name: metadataConfig.resourceName || "MCP Resource Server",
		version: "1.0.0",
		resource_url: metadataConfig.resourceServerUrl,
		authorization_required: true,
		scopes_supported: metadataConfig.scopesSupported,
	};
	const documentation = metadataConfig.resourceDocumentation ?? "";
	const hasDocumentation = documentation != "";

	if (hasDocumentation) {
		serverInfo.documentation = documentation;
	}

	const ebayEnvironment = metadataConfig.ebayEnvironment;

	if (ebayEnvironment === undefined) {
		return serverInfo;
	}

	const baseUrl = readEbayBaseUrl(ebayEnvironment);

	serverInfo.ebay = {
		environment: ebayEnvironment,
		base_url: baseUrl,
		scopes: metadataConfig.ebayScopes ?? [],
		note: "MCP OAuth scopes (scopes_supported) are separate from eBay API OAuth scopes (ebay.scopes)",
	};

	return serverInfo;
}

export function serveMetadataRoute(
	request: IncomingMessage,
	response: ServerResponse,
	metadataConfig: MetadataConfig,
): boolean {
	const isGet = request.method == "GET";

	if (!isGet) {
		return false;
	}

	const pathname = readRequestPath(request.url);
	const isProtectedResource =
		pathname == "/.well-known/oauth-protected-resource";

	if (isProtectedResource) {
		writeJson(response, 200, createProtectedResourceMetadata(metadataConfig));
		return true;
	}

	const isServerInfo = pathname == "/.well-known/mcp-server-info";

	if (isServerInfo) {
		writeJson(response, 200, createMcpServerInfo(metadataConfig));
		return true;
	}

	return false;
}

export function createMetadataRouter(
	metadataConfig: MetadataConfig,
): RequestListener {
	function serveMetadata(
		request: IncomingMessage,
		response: ServerResponse,
	): void {
		const served = serveMetadataRoute(request, response, metadataConfig);

		if (served) {
			return;
		}

		response.statusCode = 404;
		response.end();
	}

	return serveMetadata;
}

export function getProtectedResourceMetadataUrl(serverUrl: string): string {
	const url = new URL(serverUrl);
	url.pathname = "/.well-known/oauth-protected-resource";
	return url.toString();
}
