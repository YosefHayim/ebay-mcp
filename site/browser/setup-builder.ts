import { copyTextAndShowCopied } from '@site/browser/copy-button.ts';
import { findElement } from '@site/browser/find-element.ts';
import {
  listenToSetupSelection,
  readSetupSelection,
  writeSetupSelection,
} from '@site/browser/setup-choices-store.ts';
import type { SetupClientId } from '@site/data/client-list.ts';
import { highlightJson, highlightShell } from '@site/shared/code-highlight.ts';
import {
  type SetupEnvironment,
  type SetupToolsMode,
  createSetupConfig,
  createToolsHint,
} from '@site/shared/setup-config.ts';
import { DEFAULT_SETUP_CHOICES } from '@site/shared/setup-defaults.ts';

export const startSetupBuilder = () => {
  const setupBuilder = findElement(document, '[data-setup-builder]');
  const coverageBoard = findElement(document, '[data-coverage-board]');
  const familyTiles = [...coverageBoard.querySelectorAll<HTMLElement>('[data-family]')];
  const allToolsTotal = Number(coverageBoard.dataset.toolTotal);
  let pickedClientId: SetupClientId = DEFAULT_SETUP_CHOICES.clientId;
  let pickedEnvironment: SetupEnvironment = DEFAULT_SETUP_CHOICES.environment;
  let latestConfigText = '';

  const showPressedButton = (attributeName: string, pickedAttributeValue: string) => {
    const choiceButtons = setupBuilder.querySelectorAll<HTMLElement>(`[${attributeName}]`);

    for (const choiceButton of choiceButtons) {
      const isPressed = choiceButton.getAttribute(attributeName) === pickedAttributeValue;
      choiceButton.classList.toggle('is-on', isPressed);
      choiceButton.setAttribute('aria-pressed', String(isPressed));
    }
  };

  const showConfig = () => {
    const { toolsMode, pickedFamilyKeys } = readSetupSelection();
    const pickedToolTotal = familyTiles
      .filter((familyTile) => pickedFamilyKeys.includes(familyTile.dataset.family ?? ''))
      .reduce((total, familyTile) => total + Number(familyTile.dataset.count), 0);
    const setupConfig = createSetupConfig({
      clientId: pickedClientId,
      environment: pickedEnvironment,
      toolsMode,
      pickedFamilyKeys,
    });
    const configHtml = setupConfig.isShell
      ? highlightShell(setupConfig.configText)
      : highlightJson(setupConfig.configText);
    latestConfigText = setupConfig.configText;

    findElement(setupBuilder, '[data-config-path]').textContent = setupConfig.filePath;
    findElement(setupBuilder, '[data-config-code]').innerHTML = configHtml;
    findElement(setupBuilder, '[data-config-note]').textContent = setupConfig.note;
    findElement(setupBuilder, '[data-tools-hint]').textContent = createToolsHint(
      toolsMode,
      toolsMode === 'all' ? allToolsTotal : pickedToolTotal,
    );
    showPressedButton('data-client-id', pickedClientId);
    showPressedButton('data-environment', pickedEnvironment);
    showPressedButton('data-tools-mode', toolsMode);
  };

  setupBuilder.addEventListener('click', (event) => {
    const clickedElement = event.target instanceof Element ? event.target : null;
    const clientButton = clickedElement?.closest<HTMLElement>('[data-client-id]');
    const environmentButton = clickedElement?.closest<HTMLElement>('[data-environment]');
    const toolsButton = clickedElement?.closest<HTMLElement>('[data-tools-mode]');
    const copyButton = clickedElement?.closest<HTMLElement>('.copybtn');

    if (clientButton != null) {
      pickedClientId = clientButton.dataset.clientId as SetupClientId;
      showConfig();
    }
    if (environmentButton != null) {
      pickedEnvironment = environmentButton.dataset.environment as SetupEnvironment;
      showConfig();
    }
    if (toolsButton != null) {
      const toolsMode = toolsButton.dataset.toolsMode as SetupToolsMode;
      writeSetupSelection({ ...readSetupSelection(), toolsMode });
    }
    if (copyButton != null) void copyTextAndShowCopied(copyButton, latestConfigText);
  });

  listenToSetupSelection(showConfig);
  showConfig();
};
