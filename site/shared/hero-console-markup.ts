import { PRICE_CHANGE_ROWS } from "@site/data/price-rows.ts";
import { escapeHtml } from "@site/shared/html-escape.ts";

export const HERO_CONSOLE_FINAL_TICK = 90;
export const HERO_CONSOLE_LOOP_TICKS = 110;
export const HERO_CONSOLE_TICK_MILLISECONDS = 100;

const HERO_PROMPT = "Drop prices 10% on listings with no sales in 60 days";
const TYPING_END_TICK = 28;
const CARD_TICK = 51;
const APPROVED_TICK = 62;
const REPLY_TICK = 74;

interface ConsoleToolCall {
	toolName: string;
	argumentsText: string;
	resultText: string;
	showTick: number;
	doneTick: number;
}

const TOOL_CALLS: ConsoleToolCall[] = [
	{
		toolName: "ebay_get_inventory_items",
		argumentsText: "{ limit: 200 }",
		resultText: "142 items",
		showTick: 31,
		doneTick: 38,
	},
	{
		toolName: "ebay_get_traffic_report",
		argumentsText: "{ dimension: LISTING, last 60 days }",
		resultText: "38 with 0 sales",
		showTick: 40,
		doneTick: 48,
	},
	{
		toolName: "ebay_bulk_update_price_quantity",
		argumentsText: "{ 38 offers, price x 0.9 }",
		resultText: "38 updated",
		showTick: 64,
		doneTick: 71,
	},
];

const CHECK_ICON =
	'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';

const popClass = (tick: number, appearTick: number): string =>
	tick === appearTick ? " pop" : "";

const renderToolCall = (toolCall: ConsoleToolCall, tick: number): string => {
	const isDone = tick >= toolCall.doneTick;
	const status = isDone
		? `<span class="badge badge-ok">${escapeHtml(toolCall.resultText)}</span>`
		: '<span class="spin" aria-label="Running"></span>';

	return `<div class="call${popClass(tick, toolCall.showTick)}"><div class="meta"><span class="n">${escapeHtml(toolCall.toolName)}</span><span class="a">${escapeHtml(toolCall.argumentsText)}</span></div>${status}</div>`;
};

const renderPriceCard = (tick: number): string => {
	const isApproved = tick >= APPROVED_TICK;
	const rowsHtml = PRICE_CHANGE_ROWS.map(
		(row) =>
			`<div class="row"><span>${escapeHtml(row.title)}</span><span class="old">${row.oldPrice}</span><span class="new">${row.newPrice}</span></div>`,
	).join("");
	const applyHtml = isApproved
		? `<span class="apply done">${CHECK_ICON}Approved</span>`
		: '<span class="apply">Approve changes</span>';

	return `<div class="appcard${popClass(tick, CARD_TICK)}"><div class="top"><span class="t">Price changes · 38 listings</span><span class="k">MCP App</span></div><div class="rows">${rowsHtml}</div><div class="appfoot"><span>+34 more · minus 10%</span>${applyHtml}</div></div>`;
};

/** Everything inside the console body at one tick of the replay. */
export const renderHeroConsoleBody = (tick: number): string => {
	let bodyHtml = "";
	if (tick >= TYPING_END_TICK) {
		bodyHtml += `<div class="ubub${popClass(tick, TYPING_END_TICK)}">${escapeHtml(HERO_PROMPT)}</div>`;
	}
	for (const toolCall of TOOL_CALLS) {
		if (tick >= toolCall.showTick) bodyHtml += renderToolCall(toolCall, tick);
	}
	if (tick >= CARD_TICK) bodyHtml += renderPriceCard(tick);
	if (tick >= REPLY_TICK) {
		bodyHtml += `<div class="areply${popClass(tick, REPLY_TICK)}">Done. 38 offers are 10% cheaper in the sandbox store. Want me to check their views again in two weeks?</div>`;
	}

	return bodyHtml;
};

/** The text line at the bottom of the console: typing, then the empty prompt. */
export const renderHeroConsoleComposer = (tick: number): string => {
	if (tick < TYPING_END_TICK) {
		const typedText = HERO_PROMPT.slice(
			0,
			Math.min(HERO_PROMPT.length, tick * 2),
		);

		return `<span>${escapeHtml(typedText)}<span class="caret"></span></span>`;
	}

	return '<span class="ph">Ask about your store...</span>';
};
