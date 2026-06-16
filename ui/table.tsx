/**
 * Table archetype view: a sortable, optionally paginated list whose rows can
 * drill into a detail card. Backs `ui://ebay/table.html` and renders orders,
 * offers, inventory items, locations, fulfillments, and dispute summaries.
 */

import type { App } from '@modelcontextprotocol/ext-apps/react';
import { useEffect, useState, type ReactNode } from 'react';
import type { TableViewModel } from '../src/tools/ui/view-models';
import { AppShell, drill, EmptyState, mount, runServerTool, useViewModel } from './host';

/** Renders the live table, owning the rows so "Load more" can append in place. */
function Table({ view, app }: { view: TableViewModel; app: App | null }): ReactNode {
  const [rows, setRows] = useState(view.rows);
  const [loadMore, setLoadMore] = useState(view.loadMore);
  const [isLoading, setIsLoading] = useState(false);

  // Re-seed when a fresh result arrives (e.g. a server-side refresh).
  useEffect(() => {
    setRows(view.rows);
    setLoadMore(view.loadMore);
  }, [view]);

  async function appendNextPage(): Promise<void> {
    if (!loadMore) {
      return;
    }
    setIsLoading(true);
    const next = await runServerTool(app, loadMore, 'table');
    setIsLoading(false);
    if (next) {
      setRows((current) => [...current, ...next.rows]);
      setLoadMore(next.loadMore);
    }
  }

  return (
    <div className="table-view">
      {view.title ? <h1 className="view-title">{view.title}</h1> : null}
      <table className="table">
        <thead>
          <tr>
            {view.columns.map((column) => (
              <th key={column.key} className={column.align === 'right' ? 'align-right' : undefined}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowDrill = row.drill;
            return (
              <tr
                key={row.id}
                className={rowDrill ? 'is-drillable' : undefined}
                onClick={rowDrill ? () => drill(app, rowDrill) : undefined}
              >
                {view.columns.map((column) => (
                  <td
                    key={column.key}
                    className={column.align === 'right' ? 'align-right' : undefined}
                  >
                    {formatCell(row.cells[column.key])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {loadMore ? (
        <button type="button" className="load-more" disabled={isLoading} onClick={appendNextPage}>
          {isLoading ? 'Loading…' : (loadMore.label ?? 'Load more')}
        </button>
      ) : null}
      {view.footnote ? <p className="view-footnote">{view.footnote}</p> : null}
    </div>
  );
}

/** Renders a pre-formatted cell value, showing an em dash for empty cells. */
function formatCell(value: string | number | null): ReactNode {
  if (value === null || value === '') {
    return '—';
  }
  return value;
}

/** Top-level table app: handshake state plus the rendered table. */
function TableApp(): ReactNode {
  const { view, app, isConnected, error } = useViewModel('table');
  return (
    <AppShell isConnected={isConnected} error={error}>
      {view ? <Table view={view} app={app} /> : <EmptyState label="No results" />}
    </AppShell>
  );
}

mount(<TableApp />);
