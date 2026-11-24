const HTML_ESCAPES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};
const HTML_SPECIAL_CHARACTERS = /[&<>"']/g;

/** Makes text safe to place inside HTML markup or an attribute value. */
export const escapeHtml = (text: string): string =>
	text.replace(
		HTML_SPECIAL_CHARACTERS,
		(character) => HTML_ESCAPES[character] ?? character,
	);
