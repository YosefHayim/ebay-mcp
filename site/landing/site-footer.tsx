import { BrandIcon } from '@site/icons/brand-icons.tsx';
import { BrandMark } from '@site/page/brand-mark.tsx';

const DOC_LINKS = [
  { href: '#setup', label: 'Setup' },
  { href: '#tools', label: 'Tool explorer' },
  { href: '#coverage', label: 'Tool families' },
  { href: '#faq', label: 'FAQ' },
];
const CLIENT_LINKS = ['Claude Desktop', 'Claude Code', 'Cursor', 'VS Code'];

export const SiteFooter = () => (
  <footer class="wrap">
    <div class="foot">
      <div>
        <BrandMark />
        <p class="note">
          Unofficial, not affiliated with or endorsed by eBay Inc.; eBay is a trademark of eBay Inc.
        </p>
      </div>

      <div>
        <h4>Project</h4>
        <ul>
          <li>
            <a href="https://github.com/YosefHayim/ebay-mcp">
              <BrandIcon brand="github" size={16} />
              GitHub
            </a>
          </li>
          <li>
            <a href="https://www.npmjs.com/package/ebay-mcp">
              <BrandIcon brand="npm" size={16} />
              npm
            </a>
          </li>
          <li>
            <a href="https://github.com/YosefHayim/ebay-mcp/releases">Releases</a>
          </li>
          <li>
            <a href="https://github.com/YosefHayim/ebay-mcp/blob/main/LICENSE">MIT license</a>
          </li>
        </ul>
      </div>

      <div>
        <h4>Docs</h4>
        <ul>
          {DOC_LINKS.map((docLink) => (
            <li>
              <a href={docLink.href}>{docLink.label}</a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4>Clients</h4>
        <ul>
          {CLIENT_LINKS.map((clientName) => (
            <li>
              <a href="#setup">{clientName}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div class="legal">
      <span>MIT licensed open source</span>
      <span class="mono">npx -y ebay-mcp</span>
    </div>
  </footer>
);
