import { raw } from 'hono/html';
import {
  siClaude,
  siCline,
  siCursor,
  siEbay,
  siGithub,
  siNpm,
  siWindsurf,
  siZedindustries,
} from 'simple-icons';

export type BrandName =
  | 'ebay'
  | 'github'
  | 'npm'
  | 'claude'
  | 'cursor'
  | 'windsurf'
  | 'zed'
  | 'cline'
  | 'vscode'
  | 'continue'
  | 'roocode'
  | 'amazonq';

/** A brand mark is either an official filled path from simple-icons or a custom line drawing. */
type BrandMark = { kind: 'fill'; path: string } | { kind: 'line'; markup: string };

const brandMarks: Record<BrandName, BrandMark> = {
  ebay: { kind: 'fill', path: siEbay.path },
  github: { kind: 'fill', path: siGithub.path },
  npm: { kind: 'fill', path: siNpm.path },
  claude: { kind: 'fill', path: siClaude.path },
  cursor: { kind: 'fill', path: siCursor.path },
  windsurf: { kind: 'fill', path: siWindsurf.path },
  zed: { kind: 'fill', path: siZedindustries.path },
  cline: { kind: 'fill', path: siCline.path },
  // simple-icons does not ship these four, so they are drawn here in the same one-color style.
  vscode: {
    kind: 'line',
    markup:
      '<path d="M16.5 3 21 5.5v13L16.5 21 8 13.5 4 16.5 2.5 15.5v-7L4 7.5l4 3z"/><path d="M16.5 8v8L11.5 12z"/>',
  },
  continue: { kind: 'line', markup: '<path d="M5 5l7 7-7 7M12 5l7 7-7 7"/>' },
  roocode: { kind: 'line', markup: '<path d="M8 20V4h5.5a4 4 0 0 1 0 8H8m5.5 0L17 20"/>' },
  amazonq: {
    kind: 'line',
    markup: '<circle cx="11" cy="11" r="6.5"/><path d="M14.5 14.5 19 19"/><path d="M8.5 11h5"/>',
  },
};

interface BrandIconProps {
  brand: BrandName;
  size?: number;
}

/** A one-color brand mark that takes the text color. */
export const BrandIcon = ({ brand, size = 18 }: BrandIconProps) => {
  const brandMark = brandMarks[brand];

  if (brandMark.kind === 'fill') {
    return (
      <svg
        class="brand-icon"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={brandMark.path} />
      </svg>
    );
  }

  return (
    <svg
      class="brand-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {raw(brandMark.markup)}
    </svg>
  );
};
