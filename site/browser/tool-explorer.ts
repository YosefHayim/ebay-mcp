import { findElement } from '@site/browser/find-element.ts';
import {
  renderExplorerEndpoint,
  renderExplorerFields,
  renderExplorerList,
  renderExplorerRequest,
  renderExplorerResponse,
  renderExplorerTitle,
} from '@site/shared/tool-explorer-markup.ts';
import {
  type ExplorerTool,
  createDefaultFieldValues,
  createExplorerToolGroups,
  listAllExplorerTools,
} from '@site/shared/tool-explorer-model.ts';
import type { ToolCatalog } from '../../scripts/buildToolCatalog.ts';

const CATALOG_NEAR_VIEWPORT_MARGIN = '800px';

export const startToolExplorer = () => {
  const explorer = findElement(document, '[data-tool-explorer]');
  const listElement = findElement(explorer, '[data-explorer-list]');
  const searchInput = findElement<HTMLInputElement>(explorer, '[data-explorer-search]');
  const statusElement = findElement(explorer, '[data-explorer-status]');
  const runButton = findElement(explorer, '[data-explorer-run]');
  const responseElement = findElement(explorer, '[data-explorer-response]');
  let loadedCatalog: ToolCatalog | undefined;
  let selectedToolName = explorer.dataset.selectedTool ?? '';
  let fieldValues: Record<string, string> = {};
  let isCatalogRequested = false;

  const findSelectedTool = (): ExplorerTool => {
    const selectedTool = listAllExplorerTools(loadedCatalog).find(
      (explorerTool) => explorerTool.toolName === selectedToolName,
    );
    if (selectedTool == null) throw new Error(`Unknown tool ${selectedToolName}`);

    return selectedTool;
  };

  const showList = () => {
    const toolGroups = createExplorerToolGroups(loadedCatalog, searchInput.value);
    listElement.innerHTML = renderExplorerList(toolGroups, selectedToolName);
  };

  const showRequest = () => {
    const selectedTool = findSelectedTool();
    findElement(explorer, '[data-explorer-request]').innerHTML = renderExplorerRequest(
      selectedTool,
      fieldValues,
    );
    findElement(explorer, '[data-explorer-endpoint]').innerHTML = renderExplorerEndpoint(
      selectedTool,
      fieldValues,
    );
  };

  const showSelectedTool = () => {
    const selectedTool = findSelectedTool();
    const hasExample = selectedTool.exampleResponse != null;
    fieldValues = createDefaultFieldValues(selectedTool);

    findElement(explorer, '[data-explorer-title]').innerHTML = renderExplorerTitle(selectedTool);
    findElement(explorer, '[data-explorer-family]').textContent = selectedTool.familyKey;
    findElement(explorer, '[data-explorer-fields]').innerHTML = renderExplorerFields(
      selectedTool,
      fieldValues,
    );
    runButton.hidden = !hasExample;
    responseElement.hidden = !hasExample;
    responseElement.innerHTML = renderExplorerResponse(selectedTool, false);
    showRequest();
    showList();
  };

  const loadCatalog = async () => {
    if (isCatalogRequested) return;
    isCatalogRequested = true;

    try {
      const catalogReply = await fetch(explorer.dataset.catalogUrl ?? '');
      const isReplyBad = !catalogReply.ok;
      if (isReplyBad) throw new Error(`Catalog request failed with ${catalogReply.status}`);
      loadedCatalog = (await catalogReply.json()) as ToolCatalog;
    } catch (error) {
      console.error({ error });
      statusElement.textContent = 'The full tool list could not be loaded. Showing featured tools.';

      return;
    }
    statusElement.hidden = true;
    showList();
  };

  listElement.addEventListener('click', (event) => {
    const clickedElement = event.target instanceof Element ? event.target : null;
    const toolButton = clickedElement?.closest<HTMLElement>('[data-tool]');
    const isToolClick = toolButton != null;
    if (!isToolClick) return;

    selectedToolName = toolButton.dataset.tool ?? '';
    showSelectedTool();
  });

  searchInput.addEventListener('input', () => {
    void loadCatalog();
    showList();
  });

  explorer.addEventListener('input', (event) => {
    const typedInput = event.target instanceof HTMLInputElement ? event.target : null;
    const fieldName = typedInput?.dataset.field;
    const isFieldInput = typedInput != null && fieldName != null;
    if (!isFieldInput) return;

    fieldValues = { ...fieldValues, [fieldName]: typedInput.value };
    showRequest();
  });

  runButton.addEventListener('click', () => {
    responseElement.innerHTML = renderExplorerResponse(findSelectedTool(), true);
  });

  fieldValues = createDefaultFieldValues(findSelectedTool());

  const nearViewportObserver = new IntersectionObserver(
    (observedEntries) => {
      const isNear = observedEntries.some((observedEntry) => observedEntry.isIntersecting);
      if (isNear) void loadCatalog();
    },
    { rootMargin: CATALOG_NEAR_VIEWPORT_MARGIN },
  );
  nearViewportObserver.observe(explorer);
};
