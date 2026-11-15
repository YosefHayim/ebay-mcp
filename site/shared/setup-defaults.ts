import type { SetupChoices } from '@site/shared/setup-config.ts';

export const DEFAULT_SETUP_CHOICES: SetupChoices = {
  clientId: 'desktop',
  environment: 'sandbox',
  toolsMode: 'families',
  pickedFamilyKeys: ['inventory', 'fulfillment', 'account'],
};
