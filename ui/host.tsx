/**
 * Shared bootstrap for the three MCP Apps archetype views (table / card / chart).
 *
 * Each archetype entry (`table.tsx`, `card.tsx`, `chart.tsx`) is a self-contained
 * app that the host loads out of band from a `ui://` resource. They all connect
 * the same way — handshake with the host, receive the tool result, apply host
 * theming — so that logic lives here once:
 *
 *  - {@link useViewModel} wires the MCP Apps handshake and captures the tool
 *    result's `structuredContent` (the typed {@link ViewModel}) into React state;
 *  - {@link AppShell} renders the connecting / error states uniformly;
 *  - {@link drill} and {@link runServerTool} implement the two interaction modes
 *    the design allows: cross-archetype drill-down hands off to the host
 *    conversation via `sendMessage`, while same-archetype paging/refresh round
 *    trips through `callServerTool`. Both only ever invoke read-only tools.
 *
 * The view-model types are imported from the server's single source of truth, so
 * a shape change is a compile error here too — the same anti-drift guarantee the
 * server side has.
 */

import './styles.css';
import { useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { App } from '@modelcontextprotocol/ext-apps/react';
import { useApp, useHostStyles } from '@modelcontextprotocol/ext-apps/react';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ToolCallRef, ViewArchetype, ViewModelByArchetype } from '../src/tools/ui/view-models';

/**
 * Narrows a raw tool result to the view model for `archetype`, or `null` if the
 * payload is missing or for a different archetype. This is the one trust
 * boundary where untyped wire data (`structuredContent`) becomes a typed
 * {@link ViewModel}; the discriminant check guards the single cast.
 */
function extractView<A extends ViewArchetype>(
  result: CallToolResult,
  archetype: A
): ViewModelByArchetype[A] | null {
  const structured = result.structuredContent;
  if (
    structured &&
    typeof structured === 'object' &&
    'archetype' in structured &&
    structured.archetype === archetype
  ) {
    // Wire data is an open record; the discriminant check above confirms the
    // archetype, so the `unknown` hop is the safe bridge to the concrete model.
    return structured as unknown as ViewModelByArchetype[A];
  }
  return null;
}

/**
 * Connection + data state for an archetype view.
 *
 * @typeParam A - The archetype this view renders, fixing `view`'s concrete type.
 */
export interface ViewState<A extends ViewArchetype> {
  /** The latest view model the host delivered, or `null` before the first result. */
  view: ViewModelByArchetype[A] | null;
  /** The connected app instance, used to drive interactions. `null` until connected. */
  app: App | null;
  /** Whether the MCP Apps handshake has completed. */
  isConnected: boolean;
  /** Connection error, if the handshake failed. */
  error: Error | null;
}

/**
 * Connects to the host, applies host theming, and tracks the delivered view
 * model for the given archetype. The tool-result handler is registered in
 * `onAppCreated` (before the handshake completes) so the first result is never
 * missed.
 */
export function useViewModel<A extends ViewArchetype>(archetype: A): ViewState<A> {
  const [view, setView] = useState<ViewModelByArchetype[A] | null>(null);
  const { app, isConnected, error } = useApp({
    appInfo: { name: `ebay-${archetype}-view`, version: '1.0.0' },
    capabilities: {},
    onAppCreated: (created) => {
      created.ontoolresult = (result: CallToolResult) => {
        const next = extractView(result, archetype);
        if (next) {
          setView(next);
        }
      };
    },
  });

  useHostStyles(app, app?.getHostContext());

  return { view, app, isConnected, error };
}

/**
 * Renders the shared connecting / error chrome and shows `children` only once
 * the handshake has completed successfully.
 */
export function AppShell({
  isConnected,
  error,
  children,
}: {
  isConnected: boolean;
  error: Error | null;
  children: ReactNode;
}): ReactNode {
  if (error) {
    return <div className="state state--error">Unable to load view: {error.message}</div>;
  }
  if (!isConnected) {
    return <div className="state">Connecting…</div>;
  }
  return children;
}

/** Placeholder shown when the app is connected but no view model has arrived yet. */
export function EmptyState({ label }: { label: string }): ReactNode {
  return <div className="state">{label}</div>;
}

/** Turns a {@link ToolCallRef} into a concise natural-language instruction. */
function describeRef(ref: ToolCallRef): string {
  const args = Object.entries(ref.arguments)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(', ');
  return `Run the ${ref.tool} tool${args ? ` with ${args}` : ''}.`;
}

/**
 * Drills from a list into a detail view. Because a different archetype cannot
 * render in place, this hands off to the host conversation via `sendMessage` —
 * the host's model then calls the referenced read-only tool, which opens the
 * detail card as its own app.
 */
export function drill(app: App | null, ref: ToolCallRef): void {
  if (!app) {
    return;
  }
  void app.sendMessage({
    role: 'user',
    content: [{ type: 'text', text: describeRef(ref) }],
  });
}

/**
 * Runs a same-archetype read-only call (paging / refresh) and returns the
 * resulting view model, or `null` if it came back empty or for another
 * archetype. Unlike {@link drill}, the result returns to this app to update in
 * place.
 */
export async function runServerTool<A extends ViewArchetype>(
  app: App | null,
  ref: ToolCallRef,
  archetype: A
): Promise<ViewModelByArchetype[A] | null> {
  if (!app) {
    return null;
  }
  const result = await app.callServerTool({ name: ref.tool, arguments: ref.arguments });
  return extractView(result, archetype);
}

/** Mounts an archetype app into the page's `#root`, shared by all three entries. */
export function mount(node: ReactNode): void {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Missing #root container');
  }
  createRoot(container).render(node);
}
