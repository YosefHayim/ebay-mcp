import {
	HERO_CONSOLE_FINAL_TICK,
	renderHeroConsoleBody,
	renderHeroConsoleComposer,
} from "@site/shared/hero-console-markup.ts";

export const HeroConsole = () => (
	<div
		class="console blurin"
		style="animation-delay:400ms"
		data-hero-console={true}
		role="img"
		aria-label="Replay of an assistant using ebay-mcp"
	>
		<div class="conbar">
			<div class="l">
				<span class="lights">
					<i />
					<i />
					<i />
				</span>
				<span class="dot" />
				ebay-mcp connected
			</div>
			<span class="badge badge-live">Sandbox replay</span>
		</div>
		<div
			class="conbody"
			data-console-body={true}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: markup comes from this site
			dangerouslySetInnerHTML={{
				__html: renderHeroConsoleBody(HERO_CONSOLE_FINAL_TICK),
			}}
		/>
		<div class="composer">
			<span
				data-console-composer={true}
				style="display:contents"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: markup comes from this site
				dangerouslySetInnerHTML={{
					__html: renderHeroConsoleComposer(HERO_CONSOLE_FINAL_TICK),
				}}
			/>
			<span class="send" aria-hidden="true">
				<svg
					aria-hidden="true"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#1a0d07"
					stroke-width="2.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M12 19V5M6 11l6-6 6 6" />
				</svg>
			</span>
		</div>
	</div>
);
