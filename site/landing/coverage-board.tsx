import { FamilyIcon } from "@site/icons/family-icons.tsx";
import { SECTION_ANCHORS } from "@site/page/section-anchors.ts";
import { createPickedFamilies } from "@site/shared/picked-families.ts";
import { DEFAULT_SETUP_CHOICES } from "@site/shared/setup-defaults.ts";
import type { ToolCatalog } from "../../scripts/buildToolCatalog.ts";

interface CoverageBoardProps {
	catalog: ToolCatalog;
}

export const CoverageBoard = ({ catalog }: CoverageBoardProps) => {
	const pickedFamilies = createPickedFamilies(
		catalog,
		DEFAULT_SETUP_CHOICES.pickedFamilyKeys,
	);
	const biggestFamilyToolCount = Math.max(
		...catalog.families.map((family) => family.toolCount),
	);
	const toolsLineValue = pickedFamilies.orderedKeys.join(",");

	return (
		<section id={SECTION_ANCHORS.coverage} class="wrap section">
			<div class="head reveal">
				<div>
					<h2 class="h2">
						{catalog.familyCount} tool families. Load only the ones you use.
					</h2>
				</div>
				<p class="lead">
					Some clients cap how many tools they accept. Click families to build
					your{" "}
					<span class="mono" style="font-size:15px">
						EBAY_MCP_TOOLS
					</span>{" "}
					value and see how many tools it loads.
				</p>
			</div>

			<div
				class="cov reveal"
				data-coverage-board={true}
				data-tool-total={catalog.toolCount}
				data-family-total={catalog.familyCount}
			>
				<div class="tiles">
					{catalog.families.map((family) => {
						const isPicked = pickedFamilies.orderedKeys.includes(family.key);
						const barPercent = Math.max(
							4,
							Math.round((family.toolCount / biggestFamilyToolCount) * 100),
						);

						return (
							<button
								key={family.key}
								class={isPicked ? "tile is-on" : "tile"}
								type="button"
								data-family={family.key}
								data-count={family.toolCount}
								aria-pressed={String(isPicked)}
							>
								<span class="top">
									<span class="k">
										<FamilyIcon familyKey={family.key} size={16} />
										{family.key}
									</span>
									<span class="c">{family.toolCount}</span>
								</span>
								<span class="bar">
									<i style={`width:${barPercent}%`} />
								</span>
							</button>
						);
					})}
				</div>

				<div class="card covside">
					<div>
						<div class="optlbl mono">Tools loaded</div>
						<div class="bign" data-picked-total={true}>
							{pickedFamilies.toolTotal}
						</div>
						<div class="hint" style="margin-top:8px">
							of {catalog.toolCount} tools, from{" "}
							<span data-picked-count={true}>
								{pickedFamilies.orderedKeys.length}
							</span>{" "}
							of {catalog.familyCount} families
						</div>
					</div>
					<div class="envline">
						<span class="k">EBAY_MCP_TOOLS</span>=
						<span data-picked-line={true}>{toolsLineValue}</span>
					</div>
					<div class="minibtns">
						<button class="minibtn" type="button" data-pick-all={true}>
							Select all
						</button>
						<button class="minibtn" type="button" data-pick-none={true}>
							Clear
						</button>
						<button class="minibtn" type="button" data-use-in-setup={true}>
							Use in setup
						</button>
					</div>
				</div>
			</div>
		</section>
	);
};
