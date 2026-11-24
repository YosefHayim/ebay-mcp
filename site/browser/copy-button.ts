const COPIED_SHOWN_MILLISECONDS = 1600;

export const copyTextAndShowCopied = async (
	button: HTMLElement,
	copiedText: string,
) => {
	try {
		await navigator.clipboard.writeText(copiedText);
	} catch (error) {
		console.error({ error });

		return;
	}
	button.classList.add("is-copied");
	window.setTimeout(
		() => button.classList.remove("is-copied"),
		COPIED_SHOWN_MILLISECONDS,
	);
};

export const startCopyButtons = () => {
	const fixedTextButtons = document.querySelectorAll<HTMLElement>(
		'[data-copy-target]:not([data-copy-target=""])',
	);

	for (const fixedTextButton of fixedTextButtons) {
		fixedTextButton.addEventListener("click", () => {
			void copyTextAndShowCopied(
				fixedTextButton,
				fixedTextButton.dataset.copyTarget ?? "",
			);
		});
	}
};
