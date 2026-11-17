import { Hono } from 'hono';
import { jsxRenderer } from 'hono/jsx-renderer';
import { Closing } from '@site/landing/closing.tsx';
import { CoverageBoard } from '@site/landing/coverage-board.tsx';
import { FactsRow } from '@site/landing/facts-row.tsx';
import { FaqList } from '@site/landing/faq-list.tsx';
import { Hero } from '@site/landing/hero.tsx';
import { HowItWorks } from '@site/landing/how-it-works.tsx';
import { PipelineIllustration } from '@site/landing/pipeline-illustration.tsx';
import { SetupBuilder } from '@site/landing/setup-builder.tsx';
import { SiteFooter } from '@site/landing/site-footer.tsx';
import { ToolExplorer } from '@site/landing/tool-explorer.tsx';
import { WorksWith } from '@site/landing/works-with.tsx';
import { PageShell } from '@site/page/page-shell.tsx';
import { TopBar } from '@site/page/top-bar.tsx';
import type { SiteAssets } from '@site/site-assets.ts';
import type { ToolCatalog } from '../scripts/build-tool-catalog.ts';

export const createSiteApp = (catalog: ToolCatalog, siteAssets: SiteAssets) => {
  const siteApp = new Hono();

  siteApp.use(
    '*',
    jsxRenderer(({ children }) => <PageShell siteAssets={siteAssets}>{children}</PageShell>),
  );

  siteApp.get('/', (context) =>
    context.render(
      <>
        <TopBar />
        <Hero catalog={catalog} />
        <PipelineIllustration catalog={catalog} />
        <WorksWith />
        <HowItWorks catalog={catalog} />
        <SetupBuilder catalog={catalog} />
        <ToolExplorer catalogFile={siteAssets.catalogFile} toolCount={catalog.toolCount} />
        <CoverageBoard catalog={catalog} />
        <FactsRow catalog={catalog} />
        <FaqList />
        <Closing />
        <SiteFooter />
      </>,
    ),
  );

  return siteApp;
};
