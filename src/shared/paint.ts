import { type InspectColor, styleText } from "node:util";

const TEXT_STYLES = [
	"bold",
	"dim",
	"underline",
	"cyan",
	"green",
	"yellow",
	"red",
	"white",
	"gray",
	"blue",
] as const;

type TextStyle = (typeof TEXT_STYLES)[number];

type HexColor = `#${string}`;

type TextFormat = TextStyle | HexColor;

export interface TerminalText {
	(text: string): string;
	bold: TerminalText;
	dim: TerminalText;
	underline: TerminalText;
	cyan: TerminalText;
	green: TerminalText;
	yellow: TerminalText;
	red: TerminalText;
	white: TerminalText;
	gray: TerminalText;
	blue: TerminalText;
	hex: (color: HexColor) => TerminalText;
}

function style(format: readonly TextFormat[], text: string): string {
	// @types/node omits the #RRGGBB formats added to styleText in v24.16.
	return styleText(format as readonly InspectColor[], text);
}

function createPaint(formats: readonly TextFormat[]): TerminalText {
	function paint(text: string): string {
		const hasNoFormat = formats.length == 0;

		if (hasNoFormat) {
			return text;
		}

		return style(formats, text);
	}

	for (const styleName of TEXT_STYLES) {
		Object.defineProperty(paint, styleName, {
			enumerable: true,
			get(): TerminalText {
				return createPaint([...formats, styleName]);
			},
		});
	}

	function paintHex(color: HexColor): TerminalText {
		return createPaint([...formats, color]);
	}

	Object.defineProperty(paint, "hex", {
		enumerable: true,
		value: paintHex,
	});

	return paint as TerminalText;
}

export const paint = createPaint([]);
