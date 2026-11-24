import { findElement } from "@site/browser/find-element.ts";

export const startMobileMenu = () => {
	const menuButton = findElement(document, "[data-menu-button]");
	const menuPanel = findElement(document, "#menu-panel");

	const setMenuOpen = (isOpen: boolean) => {
		menuButton.setAttribute("aria-expanded", String(isOpen));
		menuPanel.hidden = !isOpen;
	};

	menuButton.addEventListener("click", () => {
		const isOpen = menuButton.getAttribute("aria-expanded") === "true";
		setMenuOpen(!isOpen);
	});
	menuPanel.addEventListener("click", (event) => {
		const isLinkClick =
			event.target instanceof Element && event.target.closest("a") != null;
		if (isLinkClick) setMenuOpen(false);
	});
};
