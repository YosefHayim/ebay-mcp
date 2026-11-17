import { SECTION_ANCHORS } from '@site/page/section-anchors.ts';
import { BrandIcon } from '@site/icons/brand-icons.tsx';
import { FamilyIcon } from '@site/icons/family-icons.tsx';
import { PRICE_CHANGE_ROWS } from '@site/data/price-rows.ts';
import type { ToolCatalog } from '../../scripts/build-tool-catalog.ts';

interface PipelineIllustrationProps {
  catalog: ToolCatalog;
}

const CHECK_PATH = 'M5 12l5 5L20 7';
const USED_FAMILY_KEYS = ['inventory', 'marketing'];

const SERVER_ROWS = [
  { label: 'Pick tool from', litAt: 1700, showsFamilyCount: true },
  { label: 'Validate input (Zod)', litAt: 2500, showsFamilyCount: false },
  { label: 'Respect EBAY_READ_ONLY', litAt: 3000, showsFamilyCount: false },
];

const EBAY_ROWS = [
  { name: 'Sell', isUsed: true },
  { name: 'Buy', isUsed: false },
  { name: 'Commerce', isUsed: false },
  { name: 'Developer', isUsed: false },
  { name: 'Trading', isUsed: false },
];

const SELL_LINES = [
  {
    litAt: 5500,
    method: 'GET',
    path: '/sell/inventory/v1/inventory_item',
    note: 'Inventory: find items with no views',
  },
  {
    litAt: 5900,
    method: 'GET',
    path: '/sell/marketing/v1/ad_campaign',
    note: 'Marketing: check running promotions',
  },
  {
    litAt: 6300,
    method: 'POST',
    path: '/sell/inventory/v1/bulk_update_price_quantity',
    note: 'Inventory: write the new prices',
  },
];

const CLIENT_MARKS = ['claude', 'cursor', 'vscode'] as const;

const TickIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="3.2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d={CHECK_PATH} />
  </svg>
);

export const PipelineIllustration = ({ catalog }: PipelineIllustrationProps) => {
  const priceRows = PRICE_CHANGE_ROWS.slice(0, 3);
  const caption =
    'One request, start to finish. The tool names and endpoint paths are real; the prices are an example.';

  return (
    <section id={SECTION_ANCHORS.flow} class="wrap section">
      <div class="head reveal">
        <div>
          <h2 class="h2">Follow one request from chat to eBay and back.</h2>
        </div>
        <p class="lead">
          Your assistant picks a tool, ebay-mcp checks it and calls eBay, and the answer comes back
          as a card you can approve.
        </p>
      </div>

      <div class="pipe reveal" data-pipeline={true} data-client="0">
        <div class="st st-client">
          <h3 class="st-title">
            <span class="num">1</span>
            <span class="marks">
              {CLIENT_MARKS.map((clientMark, markIndex) => (
                <span key={clientMark} class={`mark mark-${markIndex}`}>
                  <BrandIcon brand={clientMark} size={20} />
                </span>
              ))}
            </span>
            AI client
          </h3>
          <div class="chatwin">
            <div class="ubub is-lit" data-lit-at="300">
              Lower the price 10% on listings with no views in 30 days
            </div>
            <div class="mcard is-lit" data-lit-at="8800">
              <div class="top">
                <span>Price changes</span>
                <span class="k">MCP App</span>
              </div>
              <div class="rows">
                {priceRows.map((priceRow) => (
                  <div key={priceRow.title} class="row">
                    <span>{priceRow.title}</span>
                    <span class="old">{priceRow.oldPrice}</span>
                    <span class="new">{priceRow.newPrice}</span>
                  </div>
                ))}
              </div>
              <div class="appfoot">
                <span class="apply is-lit" data-lit-at="9400">
                  <span class="when-open">Approve</span>
                  <span class="when-done">
                    <TickIcon />
                    Approved
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="st-wire">
          <h3 class="st-title">
            <span class="num">2</span>
            MCP transport
          </h3>
          <div class="rail is-lit" data-lit-at="900">
            <span class="pkt pkt-fwd" data-fly-at="900">
              tools/call
            </span>
            <span class="pkt pkt-res pkt-back" data-fly-at="8000">
              result
            </span>
          </div>
          <p class="st-note">JSON-RPC over stdio or local HTTP</p>
        </div>

        <div class="st">
          <h3 class="st-title">
            <span class="num">3</span>
            ebay-mcp server
          </h3>
          <div class="srows">
            {SERVER_ROWS.map((serverRow) => (
              <div key={serverRow.label}>
                <div class="srow is-lit" data-lit-at={serverRow.litAt}>
                  <span class="tick">
                    <TickIcon />
                  </span>
                  {serverRow.showsFamilyCount
                    ? `${serverRow.label} ${catalog.familyCount} families`
                    : serverRow.label}
                </div>
                {serverRow.showsFamilyCount ? (
                  <div class="fchips" style="margin-top:8px">
                    {catalog.families.map((family) => {
                      const isUsedFamily = USED_FAMILY_KEYS.includes(family.key);
                      const usedIndex = USED_FAMILY_KEYS.indexOf(family.key);
                      const litAt = 1800 + usedIndex * 350;

                      return isUsedFamily ? (
                        <span
                          key={family.key}
                          class="fchip is-lit"
                          data-lit-at={litAt}
                          title={family.title}
                        >
                          <FamilyIcon familyKey={family.key} size={16} />
                        </span>
                      ) : (
                        <span key={family.key} class="fchip" title={family.title}>
                          <FamilyIcon familyKey={family.key} size={16} />
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div class="hop">
          <div class="rail is-lit" data-lit-at="3500">
            <span class="pkt pkt-dot pkt-fwd" data-fly-at="3500" />
            <span class="pkt pkt-dot pkt-res pkt-back" data-fly-at="7300" />
          </div>
        </div>

        <div class="st">
          <h3 class="st-title">
            <span class="num">4</span>
            OAuth
          </h3>
          <span class="keychip is-lit" data-lit-at="4200">
            <FamilyIcon familyKey="token-management" size={16} />
            Access token refreshed
          </span>
          <div class="meter is-lit" data-lit-at="4200">
            <i />
          </div>
          <div class="meterlbl">
            <span>Rate limit</span>
          </div>
        </div>

        <div class="hop">
          <div class="rail is-lit" data-lit-at="4700">
            <span class="pkt pkt-dot pkt-fwd" data-fly-at="4700" />
            <span class="pkt pkt-dot pkt-res pkt-back" data-fly-at="6600" />
          </div>
        </div>

        <div class="st">
          <h3 class="st-title">
            <span class="num">5</span>
            <BrandIcon brand="ebay" size={22} />
            eBay APIs
          </h3>
          <div class="erows">
            {EBAY_ROWS.map((ebayRow) => (
              <div
                key={ebayRow.name}
                class={ebayRow.isUsed ? 'erow is-lit' : 'erow'}
                data-lit-at={ebayRow.isUsed ? 5400 : undefined}
              >
                {ebayRow.name}
                {ebayRow.isUsed
                  ? SELL_LINES.map((sellLine) => (
                      <div key={sellLine.path} class="eline is-lit" data-lit-at={sellLine.litAt}>
                        <b>{sellLine.method}</b>
                        {sellLine.path}
                        <span class="sub">{sellLine.note}</span>
                      </div>
                    ))
                  : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p class="pipe-cap">{caption}</p>
    </section>
  );
};
