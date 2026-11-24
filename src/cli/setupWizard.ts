import { spawn } from "node:child_process";
import { platform } from "node:os";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { StringDecoder } from "node:string_decoder";
import { writeCliLine } from "@/shared/cliOutput.js";

type PromptValue = string | string[] | undefined;
type MaybePromise<T> = T | Promise<T>;

interface BaseStep {
	id: string;
	type: "select" | "text" | "password" | "multiselect" | "note";
	message: string;
	description?: string;
	required?: boolean;
	default?: string;
	when?: { field: string; equals: string };
}

interface SelectStep extends BaseStep {
	type: "select";
	options: { value: string; label: string }[];
}

interface TextStep extends BaseStep {
	type: "text" | "password";
	validate?: { rule: "required" }[];
}

interface MultiselectStep extends BaseStep {
	type: "multiselect";
	options: { value: string; label: string }[];
}

interface NoteStep extends BaseStep {
	type: "note";
}

type WizardStep = SelectStep | TextStep | MultiselectStep | NoteStep;

interface WizardConfig {
	meta?: { name?: string; description?: string };
	theme?: unknown;
	steps: WizardStep[];
}

interface WizardContext {
	answers: Record<string, unknown>;
	setNextStep: (stepId: string) => void;
	showNote: (title: string, message: string) => void;
	openBrowser: (url: string) => Promise<void>;
}

interface RunWizardOptions {
	optionsProvider?: (
		stepId: string,
	) => MaybePromise<{ value: string; label: string }[] | undefined>;
	asyncValidate?: (
		stepId: string,
		answer: unknown,
	) => MaybePromise<string | null>;
	onAfterStep?: (
		stepId: string,
		answer: unknown,
		context: WizardContext,
	) => MaybePromise<void>;
	onCancel?: () => void;
}

/**
 * Preserves wizard configuration typing without transforming the config.
 *
 * @param config - Wizard configuration to preserve as a typed literal.
 * @returns The same config object.
 *
 * @example
 * ```ts
 * const wizard = defineWizard({ steps: [] });
 * ```
 */
export const defineWizard = <T extends WizardConfig>(config: T): T => config;

const openUrl = async (url: string): Promise<void> => {
	const currentPlatform = platform();
	let command = "";
	let args: string[] = [];

	switch (currentPlatform) {
		case "darwin":
			command = "open";
			args = [url];
			break;
		case "win32":
			command = "cmd";
			args = ["/c", "start", "", url];
			break;
		default:
			command = "xdg-open";
			args = [url];
			break;
	}

	const child = spawn(command, args, {
		stdio: "ignore",
		detached: true,
	});

	// A missing opener (e.g. no xdg-open) emits 'error'; swallow it so the wizard keeps running.
	child.on("error", () => undefined);
	child.unref();
};

const getSelectDefaultIndex = (
	options: { value: string; label: string }[],
	stepDefault?: string,
): number => {
	if (!stepDefault) return 0;
	const index = options.findIndex((option) => option.value === stepDefault);
	return index >= 0 ? index : 0;
};

export interface Asked<ChoiceValue> {
	cancelled: boolean;
	value: ChoiceValue | undefined;
}

export interface AskChoice<ChoiceValue extends string = string> {
	value: ChoiceValue;
	label: string;
	selected?: boolean;
}

export interface AskTextQuestion {
	message: string;
	initial?: string;
	validate?: (typedLine: string) => boolean | string;
}

export interface AskSelectQuestion<ChoiceValue extends string = string> {
	message: string;
	choices: AskChoice<ChoiceValue>[];
	initial?: number;
}

export interface AskMultiselectQuestion<ChoiceValue extends string = string> {
	message: string;
	choices: AskChoice<ChoiceValue>[];
}

export interface AskConfirmQuestion {
	message: string;
	initial?: boolean;
}

interface LineAnswer {
	cancelled: boolean;
	line: string;
}

function isCancelError(error: unknown): boolean {
	const isError = error instanceof Error;

	if (!isError) {
		return false;
	}

	return error.name === "AbortError";
}

async function readLine(query: string): Promise<LineAnswer> {
	const lineReader = createInterface({ input: stdin, output: stdout });
	const abortController = new AbortController();

	function cancelOnClose(): void {
		abortController.abort();
	}

	lineReader.once("close", cancelOnClose);

	try {
		const typedLine = await lineReader.question(query, {
			signal: abortController.signal,
		});
		return { cancelled: false, line: typedLine };
	} catch (error) {
		const isCancelled = isCancelError(error);

		if (isCancelled) {
			return { cancelled: true, line: "" };
		}

		throw error;
	} finally {
		lineReader.off("close", cancelOnClose);
		lineReader.close();
	}
}

function readMutedLine(query: string): Promise<LineAnswer> {
	const muted = new Promise(function settleMutedLine(
		resolve: (answer: LineAnswer) => void,
		reject: (error: unknown) => void,
	) {
		const wasRaw = stdin.isRaw === true;

		try {
			stdin.setRawMode(true);
		} catch (error) {
			reject(error);
			return;
		}

		stdin.resume();
		stdout.write(query);

		const decoder = new StringDecoder("utf8");
		let entered = "";
		let isDone = false;
		let isSkippingEscape = false;
		const escapeFinalMin = 64;
		const escapeFinalMax = 126;
		const firstPrintableCodePoint = 32;

		function cleanup(): void {
			stdin.off("data", onData);
			stdin.off("error", onStreamError);
			stdin.setRawMode(wasRaw);
			stdin.pause();
		}

		function finish(answer: LineAnswer): void {
			const isAlreadyDone = isDone;

			if (isAlreadyDone) {
				return;
			}

			isDone = true;
			cleanup();
			stdout.write("\n");
			resolve(answer);
		}

		function onStreamError(error: Error): void {
			const isAlreadyDone = isDone;

			if (isAlreadyDone) {
				return;
			}

			isDone = true;
			cleanup();
			stdout.write("\n");
			reject(error);
		}

		function decodeChunk(chunk: Buffer | string): string {
			const isTextChunk = typeof chunk === "string";

			if (isTextChunk) {
				return chunk;
			}

			return decoder.write(chunk);
		}

		function onData(chunk: Buffer | string): void {
			const typedChunk = decodeChunk(chunk);

			for (const character of typedChunk) {
				const isAlreadyDone = isDone;

				if (isAlreadyDone) {
					return;
				}

				takePasswordCharacter(character);
			}
		}

		function takePasswordCharacter(character: string): void {
			const isEscapeSequence = isSkippingEscape;

			if (isEscapeSequence) {
				const codePoint = character.codePointAt(0) ?? 0;
				const isBeforeFinal = codePoint < escapeFinalMin;

				if (isBeforeFinal) {
					return;
				}

				const isAfterFinal = codePoint > escapeFinalMax;

				if (isAfterFinal) {
					return;
				}

				isSkippingEscape = false;
				return;
			}

			const isEscape = character === "\u001b";

			if (isEscape) {
				isSkippingEscape = true;
				return;
			}

			const isCancel = character === "\u0003";

			if (isCancel) {
				finish({ cancelled: true, line: "" });
				return;
			}

			const isEof = character === "\u0004";

			if (isEof) {
				const isEmpty = entered.length === 0;

				if (isEmpty) {
					finish({ cancelled: true, line: "" });
				}

				return;
			}

			const isCarriageReturn = character === "\r";

			if (isCarriageReturn) {
				finish({ cancelled: false, line: entered });
				return;
			}

			const isLineFeed = character === "\n";

			if (isLineFeed) {
				finish({ cancelled: false, line: entered });
				return;
			}

			const isDelete = character === "\u007f";

			if (isDelete) {
				entered = entered.slice(0, -1);
				return;
			}

			const isBackspace = character === "\b";

			if (isBackspace) {
				entered = entered.slice(0, -1);
				return;
			}

			const codePoint = character.codePointAt(0) ?? 0;
			const isControl = codePoint < firstPrintableCodePoint;

			if (isControl) {
				return;
			}

			entered += character;
		}

		stdin.on("data", onData);
		stdin.on("error", onStreamError);
	});

	return muted;
}

async function readSecretLine(query: string): Promise<LineAnswer> {
	const isTty = stdin.isTTY === true;

	if (isTty) {
		return readMutedLine(query);
	}

	return readLine(query);
}

function pickSubmittedLine(typedLine: string, initial: string): string {
	const isEmpty = typedLine === "";

	if (isEmpty) {
		return initial;
	}

	return typedLine;
}

function readRejection(
	validate: ((typedLine: string) => boolean | string) | undefined,
	submitted: string,
): string | null {
	const isThereNoValidate = validate === undefined;

	if (isThereNoValidate) {
		return null;
	}

	const verdict = validate(submitted);
	const isAccepted = verdict === true;

	if (isAccepted) {
		return null;
	}

	const isMessage = typeof verdict === "string";

	if (isMessage) {
		return verdict;
	}

	return "This field is required";
}

function createTextQuery(
	message: string,
	initial: string,
	isSecret: boolean,
): string {
	const hidesInitial = isSecret;

	if (hidesInitial) {
		return `${message} `;
	}

	const isInitialEmpty = initial === "";

	if (isInitialEmpty) {
		return `${message} `;
	}

	return `${message} [${initial}] `;
}

async function askValidatedLine(
	question: AskTextQuestion,
	readAnswer: (query: string) => Promise<LineAnswer>,
	isSecret: boolean,
): Promise<Asked<string>> {
	const initial = question.initial ?? "";
	const query = createTextQuery(question.message, initial, isSecret);
	var typed: LineAnswer;

	while (true) {
		try {
			typed = await readAnswer(query);
		} catch (error) {
			throw new Error("Could not read an answer", { cause: error });
		}

		const isCancelled = typed.cancelled;

		if (isCancelled) {
			return { cancelled: true, value: undefined };
		}

		const submitted = pickSubmittedLine(typed.line, initial);
		const rejection = readRejection(question.validate, submitted);
		const isRejected = rejection !== null;

		if (isRejected) {
			writeCliLine(rejection);
			continue;
		}

		return { cancelled: false, value: submitted };
	}
}

export async function askText(
	question: AskTextQuestion,
): Promise<Asked<string>> {
	return askValidatedLine(question, readLine, false);
}

export async function askPassword(
	question: AskTextQuestion,
): Promise<Asked<string>> {
	return askValidatedLine(question, readSecretLine, true);
}

function formatChoiceLine<ChoiceValue extends string>(
	choice: AskChoice<ChoiceValue>,
	index: number,
): string {
	const choiceNumber = index + 1;
	const isSelected = choice.selected === true;

	if (isSelected) {
		return `  ${choiceNumber}) ${choice.label} (selected)`;
	}

	return `  ${choiceNumber}) ${choice.label}`;
}

function showChoiceNumber(index: number): string {
	const choiceNumber = index + 1;
	return String(choiceNumber);
}

function listSelectedIndexes<ChoiceValue extends string>(
	choices: AskChoice<ChoiceValue>[],
): number[] {
	const indexes: number[] = [];

	for (const [index, choice] of choices.entries()) {
		const isSelected = choice.selected === true;

		if (isSelected) {
			indexes.push(index);
		}
	}

	return indexes;
}

function readWholeNumber(piece: string): number | undefined {
	const parsed = Number(piece);
	const isWhole = Number.isInteger(parsed);

	if (!isWhole) {
		return undefined;
	}

	const reprintsTheSame = String(parsed) === piece;

	if (!reprintsTheSame) {
		return undefined;
	}

	const isNegative = parsed < 0;

	if (isNegative) {
		return undefined;
	}

	return parsed;
}

function readChoiceIndex(
	typedLine: string,
	choiceCount: number,
	initialIndex: number,
): number | null {
	const trimmed = typedLine.trim();
	const isEmpty = trimmed === "";

	if (isEmpty) {
		const isNegative = initialIndex < 0;

		if (isNegative) {
			return null;
		}

		const isPastEnd = initialIndex >= choiceCount;

		if (isPastEnd) {
			return null;
		}

		return initialIndex;
	}

	const parsed = readWholeNumber(trimmed);
	const isNotWhole = parsed === undefined;

	if (isNotWhole) {
		return null;
	}

	const index = parsed - 1;
	const isNegative = index < 0;

	if (isNegative) {
		return null;
	}

	const isPastEnd = index >= choiceCount;

	if (isPastEnd) {
		return null;
	}

	return index;
}

function readChoiceIndexes(
	typedLine: string,
	choiceCount: number,
	selectedIndexes: number[],
): number[] | null {
	const trimmed = typedLine.trim();
	const isEmpty = trimmed === "";

	if (isEmpty) {
		return selectedIndexes.slice();
	}

	const pieces = trimmed.split(",");
	const indexes: number[] = [];

	for (const piece of pieces) {
		const choiceNumber = piece.trim();
		const isPieceEmpty = choiceNumber === "";

		if (isPieceEmpty) {
			return null;
		}

		const index = readChoiceIndex(choiceNumber, choiceCount, -1);
		const isInvalid = index === null;

		if (isInvalid) {
			return null;
		}

		indexes.push(index);
	}

	return indexes;
}

function listChoiceValues<ChoiceValue extends string>(
	choices: AskChoice<ChoiceValue>[],
	indexes: number[],
): ChoiceValue[] {
	const chosen: ChoiceValue[] = [];

	for (const index of indexes) {
		const choice = choices[index];
		const isMissing = choice === undefined;

		if (isMissing) {
			continue;
		}

		const alreadyIncluded = chosen.includes(choice.value);

		if (alreadyIncluded) {
			continue;
		}

		chosen.push(choice.value);
	}

	return chosen;
}

function createNumberQuery(defaultNumber: number | undefined): string {
	const isThereNoDefault = defaultNumber === undefined;

	if (isThereNoDefault) {
		return "Number: ";
	}

	return `Number [${defaultNumber}]: `;
}

function readDefaultNumber(
	initialIndex: number,
	choiceCount: number,
): number | undefined {
	const isNegative = initialIndex < 0;

	if (isNegative) {
		return undefined;
	}

	const isPastEnd = initialIndex >= choiceCount;

	if (isPastEnd) {
		return undefined;
	}

	return initialIndex + 1;
}

function printChoices<ChoiceValue extends string>(
	message: string,
	choices: AskChoice<ChoiceValue>[],
): void {
	writeCliLine(message);

	for (const [index, choice] of choices.entries()) {
		writeCliLine(formatChoiceLine(choice, index));
	}
}

export async function askSelect<ChoiceValue extends string>(
	question: AskSelectQuestion<ChoiceValue>,
): Promise<Asked<ChoiceValue>> {
	const choices = question.choices;
	const hasNoChoices = choices.length === 0;

	if (hasNoChoices) {
		return { cancelled: false, value: undefined };
	}

	printChoices(question.message, choices);

	const initialIndex = question.initial ?? 0;
	const defaultNumber = readDefaultNumber(initialIndex, choices.length);
	const query = createNumberQuery(defaultNumber);
	const hasDefault = defaultNumber !== undefined;
	const fallbackIndex = hasDefault ? initialIndex : -1;
	var typed: LineAnswer;

	while (true) {
		try {
			typed = await readLine(query);
		} catch (error) {
			throw new Error("Could not read an answer", { cause: error });
		}

		const isCancelled = typed.cancelled;

		if (isCancelled) {
			return { cancelled: true, value: undefined };
		}

		const index = readChoiceIndex(typed.line, choices.length, fallbackIndex);
		const isInvalid = index === null;

		if (isInvalid) {
			writeCliLine("Enter a number from the list");
			continue;
		}

		const choice = choices[index];
		const isMissing = choice === undefined;

		if (isMissing) {
			writeCliLine("Enter a number from the list");
			continue;
		}

		return { cancelled: false, value: choice.value };
	}
}

function createNumbersQuery(selectedIndexes: number[]): string {
	const hasNoneSelected = selectedIndexes.length === 0;

	if (hasNoneSelected) {
		return "Numbers (comma-separated): ";
	}

	const labels = selectedIndexes.map(showChoiceNumber);
	return `Numbers (comma-separated) [${labels.join(", ")}]: `;
}

export async function askMultiselect<ChoiceValue extends string>(
	question: AskMultiselectQuestion<ChoiceValue>,
): Promise<Asked<ChoiceValue[]>> {
	const choices = question.choices;
	const hasNoChoices = choices.length === 0;

	if (hasNoChoices) {
		return { cancelled: false, value: [] };
	}

	printChoices(question.message, choices);

	const selectedIndexes = listSelectedIndexes(choices);
	const query = createNumbersQuery(selectedIndexes);
	var typed: LineAnswer;

	while (true) {
		try {
			typed = await readLine(query);
		} catch (error) {
			throw new Error("Could not read an answer", { cause: error });
		}

		const isCancelled = typed.cancelled;

		if (isCancelled) {
			return { cancelled: true, value: undefined };
		}

		const indexes = readChoiceIndexes(
			typed.line,
			choices.length,
			selectedIndexes,
		);
		const isInvalid = indexes === null;

		if (isInvalid) {
			writeCliLine("Enter numbers from the list, separated by commas");
			continue;
		}

		return { cancelled: false, value: listChoiceValues(choices, indexes) };
	}
}

function readConfirmAnswer(
	typedLine: string,
	initial: boolean,
): boolean | null {
	const trimmed = typedLine.trim().toLowerCase();
	const isEmpty = trimmed === "";

	if (isEmpty) {
		return initial;
	}

	const isY = trimmed === "y";

	if (isY) {
		return true;
	}

	const isYes = trimmed === "yes";

	if (isYes) {
		return true;
	}

	const isN = trimmed === "n";

	if (isN) {
		return false;
	}

	const isNo = trimmed === "no";

	if (isNo) {
		return false;
	}

	return null;
}

export async function askConfirm(
	question: AskConfirmQuestion,
): Promise<Asked<boolean>> {
	const initial = question.initial === true;
	const hint = initial ? "(Y/n)" : "(y/N)";
	const query = `${question.message} ${hint} `;
	var typed: LineAnswer;

	while (true) {
		try {
			typed = await readLine(query);
		} catch (error) {
			throw new Error("Could not read an answer", { cause: error });
		}

		const isCancelled = typed.cancelled;

		if (isCancelled) {
			return { cancelled: true, value: undefined };
		}

		const verdict = readConfirmAnswer(typed.line, initial);
		const isUnrecognized = verdict === null;

		if (isUnrecognized) {
			writeCliLine("Enter y or n");
			continue;
		}

		return { cancelled: false, value: verdict };
	}
}

function stepHasChoices(
	step: WizardStep,
): step is SelectStep | MultiselectStep {
	return "options" in step;
}

function listStepChoices(
	step: WizardStep,
	optionsOverride: { value: string; label: string }[] | undefined,
): { value: string; label: string }[] {
	const hasOverride = optionsOverride !== undefined;

	if (hasOverride) {
		return optionsOverride;
	}

	if (stepHasChoices(step)) {
		return step.options;
	}

	return [];
}

function hasRequiredRule(step: TextStep): boolean {
	const rules = step.validate;
	const isThereNoRules = rules === undefined;

	if (isThereNoRules) {
		return false;
	}

	for (const rule of rules) {
		const isRequiredRule = rule.rule === "required";

		if (isRequiredRule) {
			return true;
		}
	}

	return false;
}

function validateWizardText(step: TextStep, typedLine: string): true | string {
	const isBlank = typedLine.trim().length === 0;

	if (!isBlank) {
		return true;
	}

	const hasRule = hasRequiredRule(step);

	if (hasRule) {
		return "This field is required";
	}

	const isRequiredFlag = step.required === true;

	if (isRequiredFlag) {
		return "This field is required";
	}

	return true;
}

async function askWizardText(
	step: TextStep,
	isPassword: boolean,
): Promise<Asked<string>> {
	function validateInput(typedLine: string): true | string {
		return validateWizardText(step, typedLine);
	}

	const question: AskTextQuestion = {
		message: step.message,
		initial: step.default ?? "",
		validate: validateInput,
	};

	if (isPassword) {
		return askPassword(question);
	}

	return askText(question);
}

function finishStep<ChoiceValue>(
	asked: Asked<ChoiceValue>,
	onCancel: (() => void) | undefined,
): { cancelled: boolean; value: ChoiceValue | undefined } {
	const isCancelled = asked.cancelled === true;

	if (isCancelled) {
		onCancel?.();
		return { cancelled: true, value: undefined };
	}

	return { cancelled: false, value: asked.value };
}

async function promptStep(
	step: WizardStep,
	optionsOverride: { value: string; label: string }[] | undefined,
	onCancel?: () => void,
): Promise<{ cancelled: boolean; value: PromptValue }> {
	if (step.type === "note") {
		if (step.message) writeCliLine(`\n  ${step.message}`);
		if (step.description) writeCliLine(`  ${step.description}\n`);
		return { cancelled: false, value: undefined };
	}

	const listed = listStepChoices(step, optionsOverride);

	if (step.type === "select") {
		const selected = await askSelect({
			message: step.message,
			choices: listed,
			initial: getSelectDefaultIndex(listed, step.default),
		});
		return finishStep(selected, onCancel);
	}

	if (step.type === "multiselect") {
		const selected = await askMultiselect({
			message: step.message,
			choices: listed,
		});
		return finishStep(selected, onCancel);
	}

	if (step.type === "password") {
		const secret = await askWizardText(step, true);
		return finishStep(secret, onCancel);
	}

	const typed = await askWizardText(step, false);
	return finishStep(typed, onCancel);
}

/**
 * Runs an interactive setup wizard and returns answers keyed by step id.
 *
 * @param config - Wizard steps and optional metadata.
 * @param runOptions - Optional callbacks and providers for rendering/validation.
 * @returns Answers keyed by step id; returns partial answers when cancelled.
 *
 * @example
 * ```ts
 * const answers = await runWizard(wizardConfig, {
 *   optionsProvider: (stepId) => (stepId === 'environment' ? environments : undefined),
 * });
 * ```
 */
export const runWizard = async (
	config: WizardConfig,
	runOptions: RunWizardOptions = {},
): Promise<Record<string, unknown>> => {
	const answers: Record<string, unknown> = {};
	const indexByStepId = new Map(
		config.steps.map((step, index) => [step.id, index]),
	);
	let currentIndex = 0;
	let forcedNextStep: string | undefined;

	const context: WizardContext = {
		answers,
		setNextStep(stepId: string) {
			forcedNextStep = stepId;
		},
		showNote(title: string, message: string) {
			writeCliLine(`\n  ${title}`);
			writeCliLine(`  ${message}\n`);
		},
		openBrowser(url: string) {
			return openUrl(url);
		},
	};

	while (currentIndex < config.steps.length) {
		const step = config.steps[currentIndex];
		const isStepMissing = step == null;

		if (isStepMissing) {
			break;
		}

		if (step.when) {
			const expected = answers[step.when.field];
			if (expected !== step.when.equals) {
				currentIndex += 1;
				continue;
			}
		}

		const optionsOverride = runOptions.optionsProvider
			? await runOptions.optionsProvider(step.id)
			: undefined;
		const attempt = await promptStep(
			step,
			optionsOverride,
			runOptions.onCancel,
		);

		if (attempt.cancelled) {
			return answers;
		}

		if (step.type !== "note") {
			let validationError =
				runOptions.asyncValidate && attempt.value !== undefined
					? await runOptions.asyncValidate(step.id, attempt.value)
					: null;

			while (validationError) {
				writeCliLine(`\n  ${validationError}\n`);
				const retry = await promptStep(
					step,
					optionsOverride,
					runOptions.onCancel,
				);
				if (retry.cancelled) return answers;
				validationError =
					runOptions.asyncValidate && retry.value !== undefined
						? await runOptions.asyncValidate(step.id, retry.value)
						: null;
				answers[step.id] = retry.value;
			}

			answers[step.id] = attempt.value;
		}

		if (runOptions.onAfterStep) {
			await runOptions.onAfterStep(step.id, answers[step.id], context);
		}

		if (forcedNextStep) {
			const nextIndex = indexByStepId.get(forcedNextStep);
			forcedNextStep = undefined;
			if (nextIndex !== undefined) {
				currentIndex = nextIndex;
				continue;
			}
		}

		currentIndex += 1;
	}

	return answers;
};
