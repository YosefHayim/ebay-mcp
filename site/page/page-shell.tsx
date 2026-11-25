import type { SiteAssets } from '@site/site-assets.ts';
import type { Child } from 'hono/jsx';

interface PageShellProps {
  siteAssets: SiteAssets;
  children?: Child;
}

const PAGE_TITLE = 'ebay-mcp - run your eBay store from any AI assistant';
const PAGE_DESCRIPTION =
  'Open source MCP server with typed tools for eBay Sell, Buy, Commerce, Developer and Trading APIs. Works with Claude, Cursor, VS Code and any MCP client.';
const PAGE_URL = 'https://yosefhayim.github.io/ebay-mcp/';
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600&family=JetBrains+Mono:wght@500&display=swap';

export const PageShell = ({ siteAssets, children }: PageShellProps) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{PAGE_TITLE}</title>
      <meta name="description" content={PAGE_DESCRIPTION} />
      <meta name="theme-color" content="#0f2b22" />
      <link rel="canonical" href={PAGE_URL} />
      <link rel="icon" type="image/png" sizes="32x32" href="./favicon-32.png" />
      <link rel="apple-touch-icon" href="./icon-512.png" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={PAGE_TITLE} />
      <meta property="og:description" content={PAGE_DESCRIPTION} />
      <meta property="og:url" content={PAGE_URL} />
      <meta property="og:image" content={`${PAGE_URL}icon-512.png`} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={PAGE_TITLE} />
      <meta name="twitter:description" content={PAGE_DESCRIPTION} />
      <meta name="twitter:image" content={`${PAGE_URL}icon-512.png`} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
      <link rel="stylesheet" href={FONTS_URL} />
      <link rel="stylesheet" href={`./${siteAssets.stylesFile}`} />
      <script type="module" src={`./${siteAssets.scriptFile}`} />
    </head>
    <body>{children}</body>
  </html>
);
