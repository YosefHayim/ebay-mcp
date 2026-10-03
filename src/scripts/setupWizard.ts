import { platform } from 'os';
import { spawn } from 'child_process';
import prompts from 'prompts';
import { writeCliLine } from '@/utils/cliOutput.js';

type PromptValue = string | string[] | undefined;
type MaybePromise<T> = T | Promise<T>;

interface BaseStep {
  id: string;
  type: 'select' | 'text' | 'password' | 'multiselect' | 'note';
  message: string;
  description?: string;
  required?: boolean;
  default?: string;
  when?: { field: string; equals: string };
}

interface SelectStep extends BaseStep {
  type: 'select';
  options: { value: string; label: string }[];
}

interface TextStep extends BaseStep {
  type: 'text' | 'password';
  validate?: { rule: 'required' }[];
}

interface MultiselectStep extends BaseStep {
  type: 'multiselect';
  options: { value: string; label: string }[];
}

interface NoteStep extends BaseStep {
  type: 'note';
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
  asyncValidate?: (stepId: string, answer: unknown) => MaybePromise<string | null>;
  onAfterStep?: (stepId: string, answer: unknown, context: WizardContext) => MaybePromise<void>;
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
  let command = '';
  let args: string[] = [];

  switch (currentPlatform) {
    case 'darwin':
      command = 'open';
      args = [url];
      break;
    case 'win32':
      command = 'cmd';
      args = ['/c', 'start', '', url];
      break;
    default:
      command = 'xdg-open';
      args = [url];
      break;
  }

  const child = spawn(command, args, {
    stdio: 'ignore',
    detached: true,
  });

  // A missing opener (e.g. no xdg-open) emits 'error'; swallow it so the wizard keeps running.
  child.on('error', () => undefined);
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

const promptStep = async (
  step: WizardStep,
  optionsOverride: { value: string; label: string }[] | undefined,
  onCancel?: () => void,
): Promise<{ cancelled: boolean; value: PromptValue }> => {
  if (step.type === 'note') {
    if (step.message) writeCliLine(`\n  ${step.message}`);
    if (step.description) writeCliLine(`  ${step.description}\n`);
    return { cancelled: false, value: undefined };
  }

  let cancelled = false;
  const promptOptions = optionsOverride ?? ('options' in step ? step.options : undefined);

  const promptControl = {
    onCancel: () => {
      cancelled = true;
      return false;
    },
  };

  let promptAnswers: Record<string, unknown>;
  switch (step.type) {
    case 'select':
      promptAnswers = await prompts(
        {
          type: 'select',
          name: 'value',
          message: step.message,
          initial: getSelectDefaultIndex(promptOptions ?? [], step.default),
          choices: (promptOptions ?? []).map((option) => ({
            title: option.label,
            value: option.value,
          })),
          instructions: false,
        },
        promptControl,
      );
      break;
    case 'multiselect':
      promptAnswers = await prompts(
        {
          type: 'multiselect',
          name: 'value',
          message: step.message,
          choices: (promptOptions ?? []).map((option) => ({
            title: option.label,
            value: option.value,
          })),
          instructions: false,
        },
        promptControl,
      );
      break;
    default:
      promptAnswers = await prompts(
        {
          type: step.type,
          name: 'value',
          message: step.message,
          initial: step.default ?? '',
          validate: (input: string) => {
            const requiredRule = step.validate?.some((rule) => rule.rule === 'required');
            const isRequired = requiredRule || step.required === true;
            if (!isRequired && input.trim().length === 0) return true;
            if (isRequired && input.trim().length === 0) return 'This field is required';
            return true;
          },
        },
        promptControl,
      );
      break;
  }

  if (cancelled) {
    onCancel?.();
    return { cancelled: true, value: undefined };
  }

  const answer = promptAnswers.value;
  if (typeof answer === 'string' || answer === undefined) {
    return { cancelled: false, value: answer };
  }
  if (Array.isArray(answer) && answer.every((choice) => typeof choice === 'string')) {
    return { cancelled: false, value: answer };
  }
  return { cancelled: false, value: undefined };
};

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
  const indexByStepId = new Map(config.steps.map((step, index) => [step.id, index]));
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
    const attempt = await promptStep(step, optionsOverride, runOptions.onCancel);

    if (attempt.cancelled) {
      return answers;
    }

    if (step.type !== 'note') {
      let validationError =
        runOptions.asyncValidate && attempt.value !== undefined
          ? await runOptions.asyncValidate(step.id, attempt.value)
          : null;

      while (validationError) {
        writeCliLine(`\n  ${validationError}\n`);
        const retry = await promptStep(step, optionsOverride, runOptions.onCancel);
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
