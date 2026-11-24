import {
	findElement,
	isReducedMotionPreferred,
} from "@site/browser/find-element.ts";

const PIPELINE_LOOP_MILLISECONDS = 11_000;
const CLIENT_MARK_COUNT = 3;

export const startPipelineTimeline = () => {
	const pipeline = findElement(document, "[data-pipeline]");
	const stepElements = [
		...pipeline.querySelectorAll<HTMLElement>("[data-lit-at]"),
	];
	const packetElements = [
		...pipeline.querySelectorAll<HTMLElement>("[data-fly-at]"),
	];
	let timerIds: number[] = [];
	let clientIndex = 0;
	let isRunning = false;

	const resetSteps = () => {
		pipeline.classList.add("is-resetting");
		for (const stepElement of stepElements)
			stepElement.classList.remove("is-lit");
		for (const packetElement of packetElements)
			packetElement.classList.remove("is-flying");
		pipeline.offsetWidth;
		pipeline.classList.remove("is-resetting");
	};

	const planAt = (milliseconds: number, action: () => void) => {
		timerIds.push(window.setTimeout(action, milliseconds));
	};

	const runLoop = () => {
		resetSteps();
		pipeline.dataset.client = String(clientIndex);

		for (const stepElement of stepElements) {
			planAt(Number(stepElement.dataset.litAt), () =>
				stepElement.classList.add("is-lit"),
			);
		}
		for (const packetElement of packetElements) {
			planAt(Number(packetElement.dataset.flyAt), () => {
				packetElement.classList.add("is-flying");
				packetElement.addEventListener(
					"animationend",
					() => packetElement.classList.remove("is-flying"),
					{ once: true },
				);
			});
		}
		planAt(PIPELINE_LOOP_MILLISECONDS, () => {
			clientIndex = (clientIndex + 1) % CLIENT_MARK_COUNT;
			timerIds = [];
			runLoop();
		});
	};

	const stopLoop = () => {
		for (const timerId of timerIds) window.clearTimeout(timerId);
		timerIds = [];
		isRunning = false;
	};

	if (isReducedMotionPreferred()) return;

	const visibilityObserver = new IntersectionObserver((observedEntries) => {
		const isVisible = observedEntries.some(
			(observedEntry) => observedEntry.isIntersecting,
		);
		const isStarting = isVisible && !isRunning;
		const isStopping = !isVisible && isRunning;

		if (isStarting) {
			isRunning = true;
			runLoop();
		}
		if (isStopping) stopLoop();
	});
	visibilityObserver.observe(pipeline);
};
