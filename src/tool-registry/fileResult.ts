import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { DownloadedFile } from "@/ebay-client/download.js";

export function formatFileResult(
	file: DownloadedFile,
	uri: string,
	label: string,
): CallToolResult {
	const name = file.fileName ? ` ${file.fileName}` : "";
	return {
		content: [
			{
				type: "text",
				text: `${label}${name} (${file.contentType}, ${file.bytes.length} bytes)`,
			},
			{
				type: "resource",
				resource: {
					uri,
					mimeType: file.contentType,
					blob: file.bytes.toString("base64"),
				},
			},
		],
	};
}
