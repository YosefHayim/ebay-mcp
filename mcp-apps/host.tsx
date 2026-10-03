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
import type { App } from '@modelcontextprotocol/ext-apps/react';
import { useApp, useHostStyles } from '@modelcontextprotocol/ext-apps/react';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { type ReactNode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { ToolCallRef, ViewArchetype, ViewModelByArchetype } from '@/tools/ui/viewModels.js';

/**
 * Narrows a raw tool result to the view model for `archetype`, or `null` if the
 * payload is missing or for a different archetype. This is the one trust
 * boundary where untyped wire data (`structuredContent`) becomes a typed
 * {@link ViewModel}; the discriminant check guards the single cast.
 */
const extractView = <A extends ViewArchetype>(
  result: CallToolResult,
  archetype: A,
): ViewModelByArchetype[A] | null => {
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
};

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
 *
 * @param archetype - View archetype this app instance renders.
 * @returns Connection state, app handle, and typed view model for the archetype.
 *
 * @example
 * ```tsx
 * const { view, app, isConnected, error } = useViewModel('table');
 * ```
 */
export const useViewModel = <A extends ViewArchetype>(archetype: A): ViewState<A> => {
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
};

/** Props for the shared app state wrapper. */
interface AppShellProps {
  /** Whether the MCP Apps host handshake completed. */
  isConnected: boolean;
  /** Connection error reported by the host app hook. */
  error: Error | null;
  /** Rendered app contents once connected. */
  children: ReactNode;
}

/**
 * Renders the shared connecting / error chrome and shows `children` only once
 * the handshake has completed successfully.
 *
 * @param props - Connection state and child content for the app shell.
 * @returns Error, connecting, or child content node.
 *
 * @example
 * ```tsx
 * <AppShell isConnected={isConnected} error={error}>{children}</AppShell>
 * ```
 */
export const AppShell = ({ isConnected, error, children }: AppShellProps): ReactNode => {
  if (error) {
    return <div className="state state--error">Unable to load view: {error.message}</div>;
  }
  if (!isConnected) {
    return <div className="state">Connecting…</div>;
  }
  return children;
};

/** Props for the connected-but-empty placeholder. */
interface EmptyStateProps {
  /** Placeholder text shown inside the empty state. */
  label: string;
}

/**
 * Placeholder shown when the app is connected but no view model has arrived yet.
 *
 * @param props - Empty-state label.
 * @returns Placeholder node.
 *
 * @example
 * ```tsx
 * <EmptyState label="No results" />
 * ```
 */
export const EmptyState = ({ label }: EmptyStateProps): ReactNode => (
  <div className="state">{label}</div>
);

/** Turns a {@link ToolCallRef} into a concise natural-language instruction. */
const describeRef = (ref: ToolCallRef): string => {
  const args = Object.entries(ref.arguments)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(', ');
  return `Run the ${ref.tool} tool${args ? ` with ${args}` : ''}.`;
};

/**
 * Drills from a list into a detail view. Because a different archetype cannot
 * render in place, this hands off to the host conversation via `sendMessage` —
 * the host's model then calls the referenced read-only tool, which opens the
 * detail card as its own app.
 *
 * @param app - Connected MCP Apps host instance, or null before connection.
 * @param ref - Tool call reference attached to the clicked row.
 * @returns Nothing; sends a host message when connected.
 *
 * @example
 * ```ts
 * drill(app, row.drill);
 * ```
 */
export const drill = (app: App | null, ref: ToolCallRef): void => {
  if (!app) {
    return;
  }
  void app.sendMessage({
    role: 'user',
    content: [{ type: 'text', text: describeRef(ref) }],
  });
};

/**
 * Runs a same-archetype read-only call (paging / refresh) and returns the
 * resulting view model, or `null` if it came back empty or for another
 * archetype. Unlike {@link drill}, the result returns to this app to update in
 * place.
 *
 * @param app - Connected MCP Apps host instance, or null before connection.
 * @param ref - Tool call reference to invoke through the host.
 * @param archetype - Expected archetype of the returned structured content.
 * @returns The next typed view model, or null when unavailable or mismatched.
 *
 * @example
 * ```ts
 * const next = await runServerTool(app, loadMore, 'table');
 * ```
 */
export const runServerTool = async <A extends ViewArchetype>(
  app: App | null,
  ref: ToolCallRef,
  archetype: A,
): Promise<ViewModelByArchetype[A] | null> => {
  if (!app) {
    return null;
  }
  const result = await app.callServerTool({ name: ref.tool, arguments: ref.arguments });
  return extractView(result, archetype);
};

/**
 * Mounts an archetype app into the page's `#root`, shared by all three entries.
 *
 * @param node - React node to render into the root container.
 * @returns Nothing; mutates the DOM by mounting the React root.
 *
 * @example
 * ```tsx
 * mount(<TableApp />);
 * ```
 */
export const mount = (node: ReactNode): void => {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Missing #root container');
  }
  createRoot(container).render(node);
};
