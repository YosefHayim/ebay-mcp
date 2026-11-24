import { BrandIcon } from "@site/icons/brand-icons.tsx";
import { BrandMark } from "@site/page/brand-mark.tsx";

const MENU_PANEL_ID = "menu-panel";
const NAV_LINKS = [
	{ href: "#how", label: "How it works" },
	{ href: "#setup", label: "Setup" },
	{ href: "#tools", label: "Tools" },
	{ href: "#coverage", label: "Coverage" },
	{ href: "#faq", label: "FAQ" },
];

export const TopBar = () => (
	<header class="wrap">
		<nav class="nav" aria-label="Main">
			<BrandMark />

			<div class="navlinks">
				{NAV_LINKS.map((navLink) => (
					<a key={navLink.href} href={navLink.href}>
						{navLink.label}
					</a>
				))}
			</div>

			<div class="navright">
				<a
					class="chip lift"
					href="https://github.com/YosefHayim/ebay-mcp"
					aria-label="ebay-mcp on GitHub"
				>
					<BrandIcon brand="github" size={14} />
					GitHub
				</a>

				<a
					class="chip lift"
					href="https://www.npmjs.com/package/ebay-mcp"
					aria-label="ebay-mcp on npm"
				>
					<BrandIcon brand="npm" size={14} />
					npm
				</a>

				<a class="btn btn-ink navcta lift" href="#setup">
					Add to your client
				</a>

				<button
					class="menubtn"
					type="button"
					aria-label="Open menu"
					aria-expanded="false"
					aria-controls={MENU_PANEL_ID}
					data-menu-button={true}
				>
					<svg
						aria-hidden="true"
						class="ico-open"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					>
						<path d="M4 7h16M4 12h16M4 17h16" />
					</svg>
					<svg
						aria-hidden="true"
						class="ico-close"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					>
						<path d="M6 6l12 12M18 6L6 18" />
					</svg>
				</button>
			</div>
		</nav>

		<div class="menupanel" id={MENU_PANEL_ID} hidden={true}>
			{NAV_LINKS.map((navLink) => (
				<a key={navLink.href} href={navLink.href}>
					{navLink.label}
				</a>
			))}
			<a class="btn btn-accent" href="#setup" style="margin-top:12px;border:0">
				Add to your client
			</a>
		</div>
	</header>
);
