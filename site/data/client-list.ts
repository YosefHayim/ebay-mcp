import type { BrandName } from '@site/icons/brand-icons.tsx';

export interface ClientEntry {
  name: string;
  brand: BrandName;
}

export const WORKS_WITH_CLIENTS: ClientEntry[] = [
  { name: 'Claude Desktop', brand: 'claude' },
  { name: 'Claude Code', brand: 'claude' },
  { name: 'Cursor', brand: 'cursor' },
  { name: 'VS Code', brand: 'vscode' },
  { name: 'Cline', brand: 'cline' },
  { name: 'Windsurf', brand: 'windsurf' },
  { name: 'Zed', brand: 'zed' },
  { name: 'Continue', brand: 'continue' },
  { name: 'Roo Code', brand: 'roocode' },
  { name: 'Amazon Q Developer', brand: 'amazonq' },
];

export type SetupClientId = 'desktop' | 'code' | 'cursor' | 'cline' | 'vscode';

export interface SetupClientTab {
  clientId: SetupClientId;
  label: string;
  brand: BrandName;
}

export const SETUP_CLIENT_TABS: SetupClientTab[] = [
  { clientId: 'desktop', label: 'Claude Desktop', brand: 'claude' },
  { clientId: 'code', label: 'Claude Code', brand: 'claude' },
  { clientId: 'cursor', label: 'Cursor', brand: 'cursor' },
  { clientId: 'cline', label: 'Cline', brand: 'cline' },
  { clientId: 'vscode', label: 'VS Code', brand: 'vscode' },
];
