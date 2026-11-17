import { SECTION_ANCHORS } from '@site/page/section-anchors.ts';
import { highlightShell } from '@site/shared/code-highlight.ts';
import type { ToolCatalog } from '../../scripts/build-tool-catalog.ts';

interface HowItWorksProps {
  catalog: ToolCatalog;
}

const ENV_LINES = [
  'EBAY_CLIENT_ID=your_client_id',
  'EBAY_CLIENT_SECRET=your_client_secret',
  'EBAY_ENVIRONMENT=sandbox',
  'EBAY_REDIRECT_URI=your_ru_name',
];
const STEP_FAMILY_KEYS = [
  'inventory',
  'fulfillment',
  'marketing',
  'analytics',
  'account',
  'finances',
  'feed',
  'taxonomy',
];

export const HowItWorks = ({ catalog }: HowItWorksProps) => {
  const stepFamilies = catalog.families.filter((family) => STEP_FAMILY_KEYS.includes(family.key));
  const envHtml = ENV_LINES.map((envLine) => `<span>${highlightShell(envLine)}\n</span>`).join('');

  return (
    <section id={SECTION_ANCHORS.how} class="wrap section">
      <div class="head reveal">
        <div>
          <h2 class="h2">From eBay keys to a working assistant in three steps.</h2>
        </div>
        <p class="lead">
          No code to write. You add the server to your client once, then talk to your store like you
          would to a colleague who knows eBay's API by heart.
        </p>
      </div>

      <div class="steps">
        <div class="card step lift reveal">
          <h3 class="h3">
            <span class="num">01</span> Add your eBay app keys
          </h3>
          <p>
            Create an app on eBay's developer portal. Sandbox keys are enough to try every tool.
          </p>
          <div class="art code">
            <pre dangerouslySetInnerHTML={{ __html: envHtml }} />
          </div>
        </div>

        <div class="card step lift reveal">
          <h3 class="h3">
            <span class="num">02</span> Pick what loads
          </h3>
          <p>
            Load all {catalog.toolCount} tools, only the families you need, or let the server load
            tools on demand.
          </p>
          <div class="art famchips">
            {stepFamilies.map((family) => (
              <span key={family.key} class="famchip">
                {family.key}
                <span style="opacity:.6">{family.toolCount}</span>
              </span>
            ))}
          </div>
        </div>

        <div class="card step lift reveal">
          <h3 class="h3">
            <span class="num">03</span> Ask in plain words
          </h3>
          <p>
            Your assistant picks the right tool, fills in its typed inputs and shows you the result.
          </p>
          <div class="art chatline">
            <span class="u">Which orders still need to ship today?</span>
            <span class="tool mono">ebay_get_orders · filter: NOT_STARTED</span>
            <span>Four orders are waiting. The oldest was paid yesterday at 4:12 PM.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
