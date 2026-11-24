import { appendFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { getLoggingConfig } from "@/shared/environment.js";
import { redactSecretFields, redactSecrets } from "@/shared/logRedaction.js";

const homeDirectory = homedir();
const LOG_DIR = join(homeDirectory, ".ebay-mcp", "logs");
const ERROR_LOG_PATH = join(LOG_DIR, "error.log");
const COMBINED_LOG_PATH = join(LOG_DIR, "combined.log");
const DEBUG_LOG_PATH = join(LOG_DIR, "debug.log");

const NPM_LEVEL_RANK = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	verbose: 4,
	debug: 5,
	silly: 6,
} as const;

type LogLevelName = keyof typeof NPM_LEVEL_RANK;

export interface ComponentLogger {
	error: (message: string, meta?: Record<string, unknown>) => void;
	warn: (message: string, meta?: Record<string, unknown>) => void;
	info: (message: string, meta?: Record<string, unknown>) => void;
	http: (message: string, meta?: Record<string, unknown>) => void;
	debug: (message: string, meta?: Record<string, unknown>) => void;
	verbose: (message: string, meta?: Record<string, unknown>) => void;
}

export interface LogPaths {
	logDir: string;
	errorLog: string;
	combinedLog: string;
	debugLog: string;
}

interface PendingLog {
	component: string;
	level: LogLevelName;
	message: string;
	meta?: Record<string, unknown>;
}

let hasEnsuredLogDirectory = false;

function isKnownLevel(level: string): level is LogLevelName {
	return Object.hasOwn(NPM_LEVEL_RANK, level);
}

function readLevelRank(level: string): number | undefined {
	if (isKnownLevel(level)) {
		return NPM_LEVEL_RANK[level];
	}

	return undefined;
}

function isLevelEnabled(level: LogLevelName): boolean {
	const configuredRank = readLevelRank(getLoggingConfig().logLevel);

	if (configuredRank === undefined) {
		return false;
	}

	return NPM_LEVEL_RANK[level] <= configuredRank;
}

function formatLogLine(
	level: LogLevelName,
	labeledMessage: string,
	redactedMeta: unknown,
): string {
	if (redactedMeta === undefined) {
		return `[${level}] ${labeledMessage}`;
	}

	const metaText = JSON.stringify(redactedMeta);
	return `[${level}] ${labeledMessage} ${metaText}`;
}

function logFilePaths(level: LogLevelName): string[] {
	if (level == "error") {
		return [COMBINED_LOG_PATH, ERROR_LOG_PATH, DEBUG_LOG_PATH];
	}

	if (NPM_LEVEL_RANK[level] <= NPM_LEVEL_RANK.debug) {
		return [COMBINED_LOG_PATH, DEBUG_LOG_PATH];
	}

	return [COMBINED_LOG_PATH];
}

function ensureLogDirectory(): void {
	if (hasEnsuredLogDirectory) {
		return;
	}

	mkdirSync(LOG_DIR, { recursive: true });
	hasEnsuredLogDirectory = true;
}

function appendLogLine(level: LogLevelName, line: string): void {
	const isFileLoggingOff = !getLoggingConfig().enableFileLogging;

	if (isFileLoggingOff) {
		return;
	}

	const storedLine = `${line}\n`;

	try {
		ensureLogDirectory();

		for (const logPath of logFilePaths(level)) {
			appendFileSync(logPath, storedLine);
		}
	} catch (error) {
		console.error({ error });
	}
}

function writeLevel(pendingLog: PendingLog): void {
	const isEnabled = isLevelEnabled(pendingLog.level);

	if (!isEnabled) {
		return;
	}

	const redactedMessage = redactSecrets(pendingLog.message);
	const labeledMessage = `[${pendingLog.component}] ${redactedMessage}`;
	const redactedMeta = redactSecretFields(pendingLog.meta);
	const line = formatLogLine(pendingLog.level, labeledMessage, redactedMeta);

	console.error(line);
	appendLogLine(pendingLog.level, line);
}

export function createLogger(component: string): ComponentLogger {
	function write(
		level: LogLevelName,
		message: string,
		meta?: Record<string, unknown>,
	): void {
		if (meta === undefined) {
			writeLevel({ component, level, message });
			return;
		}

		writeLevel({ component, level, message, meta });
	}

	function error(message: string, meta?: Record<string, unknown>): void {
		write("error", message, meta);
	}

	function warn(message: string, meta?: Record<string, unknown>): void {
		write("warn", message, meta);
	}

	function info(message: string, meta?: Record<string, unknown>): void {
		write("info", message, meta);
	}

	function http(message: string, meta?: Record<string, unknown>): void {
		write("http", message, meta);
	}

	function debug(message: string, meta?: Record<string, unknown>): void {
		write("debug", message, meta);
	}

	function verbose(message: string, meta?: Record<string, unknown>): void {
		write("verbose", message, meta);
	}

	return { error, warn, info, http, debug, verbose };
}

export const serverLogger = createLogger("Server");
export const apiLogger = createLogger("API");
export const authLogger = createLogger("Auth");
export const toolLogger = createLogger("Tool");
export const setupLogger = createLogger("Setup");

function listedParams(
	params: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
	if (params === undefined) {
		return undefined;
	}

	if (Object.keys(params).length == 0) {
		return undefined;
	}

	return params;
}

function loggedField(field: unknown): unknown {
	if (!field) {
		return undefined;
	}

	return truncateData(field);
}

function rateLimitLabel(
	rateLimitRemaining: string | undefined,
	rateLimitTotal: string | undefined,
): string | undefined {
	if (!rateLimitRemaining) {
		return undefined;
	}

	if (!rateLimitTotal) {
		return undefined;
	}

	return `${rateLimitRemaining}/${rateLimitTotal}`;
}

function truncateData(logged: unknown): unknown {
	if (logged instanceof Uint8Array) {
		return `[binary ${logged.byteLength} bytes]`;
	}

	const redacted = redactSecretFields(logged);
	const serialized = JSON.stringify(redacted);
	const maxLoggedLength = 1000;

	if (serialized.length <= maxLoggedLength) {
		return redacted;
	}

	return `${serialized.substring(0, maxLoggedLength)}... [truncated]`;
}

export function logRequest(
	method: string,
	url: string,
	params?: Record<string, unknown>,
	requestBody?: unknown,
): void {
	apiLogger.http(`Request: ${method.toUpperCase()} ${url}`, {
		params: listedParams(params),
		body: loggedField(requestBody),
	});
}

export function logResponse(
	status: number,
	statusText: string,
	responseBody?: unknown,
	rateLimitRemaining?: string,
	rateLimitTotal?: string,
): void {
	const meta: Record<string, unknown> = {};
	const limitLabel = rateLimitLabel(rateLimitRemaining, rateLimitTotal);
	const loggedBody = loggedField(responseBody);

	if (limitLabel !== undefined) {
		meta["rateLimit"] = limitLabel;
	}

	if (loggedBody !== undefined) {
		meta["data"] = loggedBody;
	}

	apiLogger.http(`Response: ${status} ${statusText}`, meta);
}

export function logErrorResponse(
	status: number | undefined,
	statusText: string | undefined,
	url: string,
	errorData?: unknown,
): void {
	const statusLabel = status === undefined ? "No status" : String(status);
	const statusTextLabel = statusText ?? "No response";

	apiLogger.error(`Error Response: ${statusLabel} ${statusTextLabel}`, {
		url,
		error: loggedField(errorData),
	});
}

export function getLogPaths(): LogPaths {
	return {
		logDir: LOG_DIR,
		errorLog: ERROR_LOG_PATH,
		combinedLog: COMBINED_LOG_PATH,
		debugLog: DEBUG_LOG_PATH,
	};
}

export function isFileLoggingEnabled(): boolean {
	return getLoggingConfig().enableFileLogging;
}
