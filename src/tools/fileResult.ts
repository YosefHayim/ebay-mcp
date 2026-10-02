import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { DownloadedFile } from '@/api/shared/download.js';

/**
 * Formats a downloaded eBay file as MCP content: a one-line summary plus the bytes as an
 * embedded resource, so no file is written to the local disk.
 *
 * @param file - Downloaded bytes with their content type and optional file name.
 * @param uri - Stable resource URI naming the file, e.g. `ebay-feed://task/TASK-1/result`.
 * @param label - Summary prefix, e.g. `Feed task TASK-1 result file`.
 * @returns A tool result with a text summary and a base64 blob resource.
 *
 * @example
 * ```ts
 * formatResult: (file, args) =>
 *   formatFileResult(file, `ebay-feed://task/${encodeURIComponent(args.taskId)}/result`, `Feed task ${args.taskId} result file`),
 * ```
 */
export const formatFileResult = (
  file: DownloadedFile,
  uri: string,
  label: string,
): CallToolResult => {
  const name = file.fileName ? ` ${file.fileName}` : '';
  return {
    content: [
      {
        type: 'text',
        text: `${label}${name} (${file.contentType}, ${file.bytes.length} bytes)`,
      },
      {
        type: 'resource',
        resource: { uri, mimeType: file.contentType, blob: file.bytes.toString('base64') },
      },
    ],
  };
};
