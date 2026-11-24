import { FamilyIcon } from "@site/icons/family-icons.tsx";
import { SECTION_ANCHORS } from "@site/page/section-anchors.ts";
import {
	renderExplorerEndpoint,
	renderExplorerFields,
	renderExplorerList,
	renderExplorerRequest,
	renderExplorerResponse,
	renderExplorerTitle,
} from "@site/shared/tool-explorer-markup.ts";
import {
	createDefaultFieldValues,
	createExplorerToolGroups,
	listFeaturedExplorerTools,
} from "@site/shared/tool-explorer-model.ts";

interface ToolExplorerProps {
	catalogFile: string;
	toolCount: number;
}

export const ToolExplorer = ({ catalogFile, toolCount }: ToolExplorerProps) => {
	const firstTool = listFeaturedExplorerTools()[0];
	if (firstTool == null) throw new Error("The featured tool list is empty");
	const fieldValues = createDefaultFieldValues(firstTool);
	const startingGroups = createExplorerToolGroups(undefined, "");
	const hasExample = firstTool.exampleResponse != null;

	return (
		<section id={SECTION_ANCHORS.tools} class="section">
			<div class="block explorer on">
				<div class="wrap">
					<div class="head reveal" style="margin-bottom:0">
						<div>
							<h2 class="h2" style="color:var(--on)">
								See exactly what your assistant sends.
							</h2>
						</div>
						<p class="lead">
							Every one of the {toolCount} tools has a typed input schema. Pick
							one, change its inputs, and see the MCP request and the eBay
							endpoint it calls.
						</p>
					</div>

					<div
						class="xgrid reveal"
						data-tool-explorer={true}
						data-catalog-url={`./${catalogFile}`}
						data-selected-tool={firstTool.toolName}
					>
						<div class="xlist">
							<label class="search">
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#a9bdb2"
									stroke-width="2"
									stroke-linecap="round"
									aria-hidden="true"
								>
									<circle cx="11" cy="11" r="7" />
									<path d="M20 20l-4-4" />
								</svg>
								<input
									type="search"
									placeholder={`Search ${toolCount} tools`}
									aria-label="Search tools"
									data-explorer-search={true}
								/>
							</label>
							<div
								class="xscroll"
								data-explorer-list={true}
								dangerouslySetInnerHTML={{
									__html: renderExplorerList(
										startingGroups,
										firstTool.toolName,
									),
								}}
							/>
							<div class="xloading" data-explorer-status={true}>
								<FamilyIcon familyKey="other" size={14} /> Loading all{" "}
								{toolCount} tools...
							</div>
						</div>

						<div class="xmain">
							<div class="xtitle">
								<div
									data-explorer-title={true}
									style="display:contents"
									dangerouslySetInnerHTML={{
										__html: renderExplorerTitle(firstTool),
									}}
								/>
								<div
									data-explorer-endpoint={true}
									style="display:contents"
									dangerouslySetInnerHTML={{
										__html: renderExplorerEndpoint(firstTool, fieldValues),
									}}
								/>
							</div>

							<div class="xcols">
								<div>
									<div class="panel-lbl">
										<span class="mono">Inputs</span>
										<span class="mono" data-explorer-family={true}>
											{firstTool.familyKey}
										</span>
									</div>
									<div class="form">
										<div
											data-explorer-fields={true}
											style="display:contents"
											dangerouslySetInnerHTML={{
												__html: renderExplorerFields(firstTool, fieldValues),
											}}
										/>
										<button
											class="btn btn-accent lift"
											type="button"
											style="margin-top:4px;height:48px"
											data-explorer-run={true}
											hidden={!hasExample}
										>
											<svg
												width="14"
												height="14"
												viewBox="0 0 24 24"
												fill="currentColor"
												aria-hidden="true"
											>
												<path d="M7 4.5v15l13-7.5z" />
											</svg>
											Show example response
										</button>
									</div>
								</div>

								<div style="min-width:0">
									<div class="panel-lbl">
										<span class="mono">MCP request · tools/call</span>
									</div>
									<div
										class="code"
										data-explorer-request={true}
										dangerouslySetInnerHTML={{
											__html: renderExplorerRequest(firstTool, fieldValues),
										}}
									/>
								</div>
							</div>

							<div
								class="resp"
								data-explorer-response={true}
								hidden={!hasExample}
								dangerouslySetInnerHTML={{
									__html: renderExplorerResponse(firstTool, false),
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
