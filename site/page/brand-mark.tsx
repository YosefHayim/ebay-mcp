interface BrandMarkProps {
  label?: string;
}

export const BrandMark = ({ label = 'ebay-mcp' }: BrandMarkProps) => (
  <a href="#top" class="brand" aria-label="ebay-mcp home">
    <span class="glyph">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#f4f2ec"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M4 7h16" />
        <path d="M4 12h10" />
        <path d="M4 17h6" />
        <circle cx="18" cy="16" r="3" stroke="#ff5a2c" />
      </svg>
    </span>
    {label}
  </a>
);
