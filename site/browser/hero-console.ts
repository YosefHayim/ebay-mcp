import {
	findElement,
	isReducedMotionPreferred,
} from "@site/browser/find-element.ts";
import {
	HERO_CONSOLE_LOOP_TICKS,
	HERO_CONSOLE_TICK_MILLISECONDS,
	renderHeroConsoleBody,
	renderHeroConsoleComposer,
} from "@site/shared/hero-console-markup.ts";

export const startHeroConsole = () => {
	if (isReducedMotionPreferred()) return;

	const heroConsole = findElement(document, "[data-hero-console]");
	const consoleBody = findElement(heroConsole, "[data-console-body]");
	const consoleComposer = findElement(heroConsole, "[data-console-composer]");
	let tick = 0;
	let intervalId: number | null = null;

	const showTick = () => {
		consoleBody.innerHTML = renderHeroConsoleBody(tick);
		consoleComposer.innerHTML = renderHeroConsoleComposer(tick);
		consoleBody.scrollTop = consoleBody.scrollHeight;
		tick = (tick + 1) % HERO_CONSOLE_LOOP_TICKS;
	};

	const visibilityObserver = new IntersectionObserver((observedEntries) => {
		const isVisible = observedEntries.some(
			(observedEntry) => observedEntry.isIntersecting,
		);
		const isStarting = isVisible && intervalId == null;
		const isStopping = !isVisible && intervalId != null;

		if (isStarting)
			intervalId = window.setInterval(showTick, HERO_CONSOLE_TICK_MILLISECONDS);
		if (isStopping) {
			window.clearInterval(intervalId ?? undefined);
			intervalId = null;
		}
	});
	visibilityObserver.observe(heroConsole);
};
