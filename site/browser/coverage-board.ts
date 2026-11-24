import { findElement } from "@site/browser/find-element.ts";
import {
	listenToSetupSelection,
	readSetupSelection,
	writeSetupSelection,
} from "@site/browser/setup-choices-store.ts";

export const startCoverageBoard = () => {
	const coverageBoard = findElement(document, "[data-coverage-board]");
	const familyTiles = [
		...coverageBoard.querySelectorAll<HTMLElement>("[data-family]"),
	];
	const pickedTotalElement = findElement(coverageBoard, "[data-picked-total]");
	const pickedCountElement = findElement(coverageBoard, "[data-picked-count]");
	const pickedLineElement = findElement(coverageBoard, "[data-picked-line]");

	const showPickedFamilies = () => {
		const { pickedFamilyKeys } = readSetupSelection();
		let toolTotal = 0;

		for (const familyTile of familyTiles) {
			const isPicked = pickedFamilyKeys.includes(
				familyTile.dataset["family"] ?? "",
			);
			familyTile.classList.toggle("is-on", isPicked);
			familyTile.setAttribute("aria-pressed", String(isPicked));
			if (isPicked) toolTotal += Number(familyTile.dataset["count"]);
		}
		pickedTotalElement.textContent = String(toolTotal);
		pickedCountElement.textContent = String(pickedFamilyKeys.length);
		pickedLineElement.textContent = pickedFamilyKeys.join(",");
	};

	const pickFamilies = (pickedFamilyKeys: string[]) => {
		writeSetupSelection({ ...readSetupSelection(), pickedFamilyKeys });
	};
	const listAllFamilyKeys = () =>
		familyTiles.map((familyTile) => familyTile.dataset["family"] ?? "");

	coverageBoard.addEventListener("click", (event) => {
		const clickedElement =
			event.target instanceof Element ? event.target : null;
		const clickedTile = clickedElement?.closest<HTMLElement>("[data-family]");
		const isTileClick = clickedTile != null;
		if (!isTileClick) return;

		const { pickedFamilyKeys } = readSetupSelection();
		const clickedKey = clickedTile.dataset["family"] ?? "";
		const isAlreadyPicked = pickedFamilyKeys.includes(clickedKey);
		const nextKeys = isAlreadyPicked
			? pickedFamilyKeys.filter((pickedKey) => pickedKey !== clickedKey)
			: [...pickedFamilyKeys, clickedKey];
		const orderedKeys = listAllFamilyKeys().filter((familyKey) =>
			nextKeys.includes(familyKey),
		);
		pickFamilies(orderedKeys);
	});

	findElement(coverageBoard, "[data-pick-all]").addEventListener(
		"click",
		() => {
			pickFamilies(listAllFamilyKeys());
		},
	);
	findElement(coverageBoard, "[data-pick-none]").addEventListener(
		"click",
		() => {
			pickFamilies([]);
		},
	);
	findElement(coverageBoard, "[data-use-in-setup]").addEventListener(
		"click",
		() => {
			writeSetupSelection({ ...readSetupSelection(), toolsMode: "families" });
			findElement(document, "#setup").scrollIntoView({ behavior: "smooth" });
		},
	);

	listenToSetupSelection(showPickedFamilies);
	showPickedFamilies();
};
