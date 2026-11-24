import type { SetupToolsMode } from "@site/shared/setup-config.ts";
import { DEFAULT_SETUP_CHOICES } from "@site/shared/setup-defaults.ts";

export interface SetupSelection {
	toolsMode: SetupToolsMode;
	pickedFamilyKeys: string[];
}

let currentSelection: SetupSelection = {
	toolsMode: DEFAULT_SETUP_CHOICES.toolsMode,
	pickedFamilyKeys: DEFAULT_SETUP_CHOICES.pickedFamilyKeys,
};
const selectionListeners: Array<() => void> = [];

export const readSetupSelection = (): SetupSelection => currentSelection;

export const writeSetupSelection = (nextSelection: SetupSelection) => {
	currentSelection = nextSelection;
	for (const selectionListener of selectionListeners) selectionListener();
};

export const listenToSetupSelection = (selectionListener: () => void) => {
	selectionListeners.push(selectionListener);
};
