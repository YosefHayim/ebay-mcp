import { CheckIcon } from '@site/landing/check-icon.tsx';
import { CopyButton } from '@site/landing/copy-button.tsx';
import { HeroConsole } from '@site/landing/hero-console.tsx';
import type { ToolCatalog } from '../../scripts/buildToolCatalog.ts';

interface HeroProps {
  catalog: ToolCatalog;
}

const HEADLINE_WORDS = 'Run your eBay store from any AI assistant.'.split(' ');
const HERO_CHECKS = [
  'Runs on your machine, no cloud relay',
  'eBay OAuth built in, tokens refresh on their own',
  'Load every tool, or only the families you need',
];

export const Hero = ({ catalog }: HeroProps) => (
  <section id="top" class="block hero on">
    <div class="wrap herogrid">
      <div>
        <h1 class="h1">
          {HEADLINE_WORDS.map((headlineWord, wordIndex) => (
            <span class="word rise" style={`animation-delay:${120 + wordIndex * 90}ms`}>
              {headlineWord}
            </span>
          ))}
        </h1>
        <p class="lead rise" style="animation-delay:720ms;max-width:500px">
          {catalog.toolCount} typed tools across eBay's Sell, Buy, Commerce, Developer and Trading
          APIs. Ask for what you want in plain words. Your assistant does the eBay calls.
        </p>
        <div class="ctarow rise" style="animation-delay:820ms">
          <a class="btn btn-accent lift" href="#setup">
            Set it up
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <div class="npx">
            <span>
              <span class="sign">$</span> npx -y ebay-mcp
            </span>
            <CopyButton label="Copy install command" copyTarget="npx -y ebay-mcp" />
          </div>
        </div>
        <ul class="checks rise" style="animation-delay:920ms">
          {HERO_CHECKS.map((checkLine) => (
            <li>
              <CheckIcon size={16} color="#5fd39a" />
              {checkLine}
            </li>
          ))}
        </ul>
      </div>

      <HeroConsole />
    </div>
  </section>
);
