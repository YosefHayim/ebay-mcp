import { renderFamilyIconSvg } from '@site/icons/family-icon-markup.ts';
import { highlightJson } from '@site/shared/code-highlight.ts';
import { escapeHtml } from '@site/shared/html-escape.ts';
import {
  type ExplorerTool,
  type ExplorerToolGroup,
  createToolCallRequest,
} from '@site/shared/tool-explorer-model.ts';

const EXPLORER_SHOWN_FIELD_LIMIT = 10;
const LIST_SUMMARY_LENGTH = 64;
const FIELD_HINT_LENGTH = 140;

const shortenText = (fullText: string, maxLength: number): string => {
  const isShortEnough = fullText.length <= maxLength;
  if (isShortEnough) return fullText;

  return `${fullText.slice(0, maxLength - 1).trimEnd()}…`;
};

/** The fields shown as inputs: required ones first, capped so a huge schema stays usable. */
const listShownFields = (tool: ExplorerTool) =>
  [...tool.fields]
    .sort((firstField, secondField) => Number(secondField.required) - Number(firstField.required))
    .slice(0, EXPLORER_SHOWN_FIELD_LIMIT);

const renderToolItem = (tool: ExplorerTool, isSelected: boolean): string => {
  const summary = escapeHtml(shortenText(tool.description, LIST_SUMMARY_LENGTH));
  const pressedClass = isSelected ? ' is-on' : '';

  return `<button class="xitem${pressedClass}" type="button" data-tool="${escapeHtml(tool.toolName)}" aria-pressed="${isSelected}"><span class="nm">${escapeHtml(tool.toolName)}</span><span class="fm">${escapeHtml(tool.familyKey)} · ${summary}</span></button>`;
};

/** The scrolling list: a heading with the family icon, then one button per tool. */
export const renderExplorerList = (
  groups: ExplorerToolGroup[],
  selectedToolName: string,
): string => {
  const hasNoGroups = groups.length === 0;
  if (hasNoGroups) return '<div class="xempty">No tool matches that search.</div>';

  return groups
    .map((group) => {
      const iconHtml = renderFamilyIconSvg(group.groupKey, 14);
      const toolsHtml = group.tools
        .map((tool) => renderToolItem(tool, tool.toolName === selectedToolName))
        .join('');

      return `<div class="xgroup">${iconHtml}${escapeHtml(group.groupTitle)} · ${group.tools.length}</div>${toolsHtml}`;
    })
    .join('');
};

/** The tool name and description above the inputs. */
export const renderExplorerTitle = (tool: ExplorerTool): string => {
  const flagsHtml = tool.isReadOnly
    ? '<span class="xflag">read only</span>'
    : `<span class="xflag is-write">${tool.isDestructive ? 'deletes data' : 'writes to eBay'}</span>`;

  return `<div><div class="nm">${escapeHtml(tool.toolName)}</div><div class="d">${escapeHtml(tool.description)}</div><div class="xflags">${flagsHtml}</div></div>`;
};

/** The eBay endpoint chip. Only tools with a known endpoint show one. */
export const renderExplorerEndpoint = (
  tool: ExplorerTool,
  fieldValues: Record<string, string>,
): string => {
  const endpoint = tool.endpoint;
  const hasNoEndpoint = endpoint == null;
  if (hasNoEndpoint) return '';
  const queryString = endpoint.createQueryString(fieldValues);

  return `<span class="endpoint"><span class="verb">${escapeHtml(endpoint.method)}</span>${escapeHtml(endpoint.path + queryString)}</span>`;
};

/** The input boxes of a tool. Drawn once per tool so typing never loses focus. */
export const renderExplorerFields = (
  tool: ExplorerTool,
  fieldValues: Record<string, string>,
): string => {
  const shownFields = listShownFields(tool);
  const hiddenFieldCount = tool.fields.length - shownFields.length;
  const hasNoFields = tool.fields.length === 0;
  if (hasNoFields) return '<div class="waiting">This tool takes no inputs.</div>';

  const fieldsHtml = shownFields
    .map((field) => {
      const inputId = `x-${tool.toolName}-${field.name}`;
      const requiredMark = field.required ? ' *' : '';
      const hintHtml =
        field.description === ''
          ? ''
          : `<span class="hintline">${escapeHtml(shortenText(field.description, FIELD_HINT_LENGTH))}</span>`;

      return `<div class="field"><label for="${escapeHtml(inputId)}">${escapeHtml(field.name)}${requiredMark}<span>${escapeHtml(field.type)}</span></label><input id="${escapeHtml(inputId)}" data-field="${escapeHtml(field.name)}" value="${escapeHtml(fieldValues[field.name] ?? '')}" spellcheck="false" autocomplete="off">${hintHtml}</div>`;
    })
    .join('');
  const moreHtml =
    hiddenFieldCount > 0
      ? `<div class="hintline">${hiddenFieldCount} more optional inputs are left out here. The server accepts them all.</div>`
      : '';

  return fieldsHtml + moreHtml;
};

/** The live JSON-RPC request, highlighted. */
export const renderExplorerRequest = (
  tool: ExplorerTool,
  fieldValues: Record<string, string>,
): string => {
  const requestText = JSON.stringify(createToolCallRequest(tool, fieldValues), null, 2);

  return `<pre>${highlightJson(requestText)}</pre>`;
};

/** The recorded example response, or nothing for a tool without one. */
export const renderExplorerResponse = (tool: ExplorerTool, isShown: boolean): string => {
  const hasNoExample = tool.exampleResponse == null;
  if (hasNoExample) return '';
  const labelHtml = isShown
    ? '<span class="badge badge-ok"><span class="dot"></span>200 OK · recorded example</span>'
    : '';
  const bodyHtml = isShown
    ? `<div class="code pop"><pre>${highlightJson(JSON.stringify(tool.exampleResponse, null, 2))}</pre></div>`
    : '<div class="waiting">Press the button to show a recorded example response for this tool.</div>';

  return `<div class="panel-lbl"><span class="mono">Example response</span>${labelHtml}</div>${bodyHtml}`;
};
