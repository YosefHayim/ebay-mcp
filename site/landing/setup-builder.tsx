import { SETUP_CLIENT_TABS } from "@site/data/client-list.ts";
import { BrandIcon } from "@site/icons/brand-icons.tsx";
import { CopyButton } from "@site/landing/copy-button.tsx";
import { SECTION_ANCHORS } from "@site/page/section-anchors.ts";
import { highlightJson, highlightShell } from "@site/shared/code-highlight.ts";
import { createPickedFamilies } from "@site/shared/picked-families.ts";
import {
	createSetupConfig,
	createToolsHint,
} from "@site/shared/setup-config.ts";
import { DEFAULT_SETUP_CHOICES } from "@site/shared/setup-defaults.ts";
import type { ToolCatalog } from "../../scripts/buildToolCatalog.ts";

interface SetupBuilderProps {
	catalog: ToolCatalog;
}

const ENVIRONMENT_TABS = [
	{ environment: "sandbox", label: "Sandbox" },
	{ environment: "production", label: "Production" },
];

export const SetupBuilder = ({ catalog }: SetupBuilderProps) => {
	const setupConfig = createSetupConfig(DEFAULT_SETUP_CHOICES);
	const pickedFamilies = createPickedFamilies(
		catalog,
		DEFAULT_SETUP_CHOICES.pickedFamilyKeys,
	);
	const toolsHint = createToolsHint(
		DEFAULT_SETUP_CHOICES.toolsMode,
		pickedFamilies.toolTotal,
	);
	const configHtml = setupConfig.isShell
		? highlightShell(setupConfig.configText)
		: highlightJson(setupConfig.configText);
	const toolsTabs = [
		{ toolsMode: "families", label: "My families" },
		{ toolsMode: "all", label: `All ${catalog.toolCount}` },
		{ toolsMode: "dynamic", label: "Dynamic" },
	];

	return (
		<section id={SECTION_ANCHORS.setup} class="wrap section">
			<div class="head reveal">
				<div>
					<h2 class="h2">Build your config, then paste it in.</h2>
				</div>
				<p class="lead">
					Pick your client and options. The config updates as you go, ready to
					copy into the right file.
				</p>
			</div>

			<div class="builder reveal" data-setup-builder={true}>
				<div class="card opts">
					<div>
						<div class="optlbl mono">Client</div>
						<fieldset class="seg" aria-label="Client">
							{SETUP_CLIENT_TABS.map((clientTab) => (
								<button
									key={clientTab.clientId}
									class={
										clientTab.clientId === DEFAULT_SETUP_CHOICES.clientId
											? "segbtn is-on"
											: "segbtn"
									}
									type="button"
									data-client-id={clientTab.clientId}
									aria-pressed={String(
										clientTab.clientId === DEFAULT_SETUP_CHOICES.clientId,
									)}
								>
									<BrandIcon brand={clientTab.brand} size={16} />
									{clientTab.label}
								</button>
							))}
						</fieldset>
					</div>

					<div>
						<div class="optlbl mono">Environment</div>
						<fieldset class="seg" aria-label="Environment">
							{ENVIRONMENT_TABS.map((environmentTab) => (
								<button
									key={environmentTab.environment}
									class={
										environmentTab.environment ===
										DEFAULT_SETUP_CHOICES.environment
											? "segbtn is-on"
											: "segbtn"
									}
									type="button"
									data-environment={environmentTab.environment}
									aria-pressed={String(
										environmentTab.environment ===
											DEFAULT_SETUP_CHOICES.environment,
									)}
								>
									{environmentTab.label}
								</button>
							))}
						</fieldset>
					</div>

					<div>
						<div class="optlbl mono">Tools</div>
						<fieldset class="seg" aria-label="Tools">
							{toolsTabs.map((toolsTab) => (
								<button
									key={toolsTab.toolsMode}
									class={
										toolsTab.toolsMode === DEFAULT_SETUP_CHOICES.toolsMode
											? "segbtn is-on"
											: "segbtn"
									}
									type="button"
									data-tools-mode={toolsTab.toolsMode}
									aria-pressed={String(
										toolsTab.toolsMode === DEFAULT_SETUP_CHOICES.toolsMode,
									)}
								>
									{toolsTab.label}
								</button>
							))}
						</fieldset>
					</div>

					<p class="hint" data-tools-hint={true}>
						{toolsHint}
					</p>
				</div>

				<div class="output">
					<div class="outbar">
						<span class="path" data-config-path={true}>
							{setupConfig.filePath}
						</span>
						<CopyButton label="Copy config" copyTarget="" />
					</div>
					<div class="code">
						<pre
							data-config-code={true}
							dangerouslySetInnerHTML={{ __html: configHtml }}
						/>
					</div>
					<div class="outfoot">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<circle cx="12" cy="12" r="9" />
							<path d="M12 8v5M12 16h.01" />
						</svg>
						<span data-config-note={true}>{setupConfig.note}</span>
					</div>
				</div>
			</div>
		</section>
	);
};
