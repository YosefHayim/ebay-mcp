#!/usr/bin/env node
import process from "node:process";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { runDiagnostics } from "@/cli/diagnostics.js";
import { runSetup } from "@/cli/setup.js";
import { runSkillsWizard } from "@/cli/skills.js";
import { createEbayMcpRuntime, type EbayMcpRuntime } from "@/server/runtime.js";
import { validateEnvironmentConfig } from "@/shared/environment.js";
import { getErrorMessage } from "@/shared/errors.js";
import {
	getLogPaths,
	isFileLoggingEnabled,
	serverLogger,
} from "@/shared/logger.js";

const args = process.argv.slice(2);

async function runCliCommand(
	label: string,
	command: () => Promise<void>,
): Promise<void> {
	try {
		await command();
	} catch (error) {
		serverLogger.error(`${label} failed`, {
			error: getErrorMessage(error, String(error)),
		});
		process.exit(1);
	}

	process.exit(0);
}

if (args.includes("setup")) {
	await runCliCommand("Setup", runSetup);
}

if (args.includes("skills")) {
	await runCliCommand("Skills install", runSkillsWizard);
}

if (args.includes("diagnose")) {
	const exportReport = args.includes("--export") || args.includes("-e");
	await runCliCommand("Diagnostics", () => runDiagnostics(exportReport));
}

class EbayMcpServer {
	private runtime: EbayMcpRuntime;

	constructor() {
		this.runtime = createEbayMcpRuntime({ logToolExecution: true });
		this.setupErrorHandling();
	}

	private initialize = async (): Promise<void> => {
		await this.runtime.initializeApi();
	};

	private setupErrorHandling = (): void => {
		process.on("SIGINT", async () => {
			serverLogger.info("Received SIGINT, shutting down...");
			await this.runtime.server.close();
			process.exit(0);
		});
	};

	run = async (): Promise<void> => {
		serverLogger.info("Starting eBay API MCP Server");

		// Validate environment configuration
		const validation = validateEnvironmentConfig();

		// Log informational notices (e.g. proxy auth mode)
		validation.infos.forEach((notice) => {
			serverLogger.info(notice);
		});

		// Log warnings
		if (validation.warnings.length > 0) {
			validation.warnings.forEach((warning) => {
				serverLogger.warn(warning);
			});
		}

		// Log errors and exit if configuration is invalid
		if (!validation.isValid) {
			validation.errors.forEach((error) => {
				serverLogger.error(error);
			});
			serverLogger.error(
				"Please fix the configuration errors and restart the server.",
			);
			process.exit(1);
		}

		// Initialize API (load tokens from storage)
		serverLogger.info("Initializing API client");
		await this.initialize();

		// Log log file locations if file logging is enabled
		if (isFileLoggingEnabled()) {
			const paths = getLogPaths();
			serverLogger.info("File logging enabled", {
				logDir: paths.logDir,
				errorLog: paths.errorLog,
				combinedLog: paths.combinedLog,
			});
		}

		const transport = new StdioServerTransport();
		await this.runtime.server.connect(transport);
		serverLogger.info("eBay API MCP Server running on stdio");
	};
}

// Start the server
const server = new EbayMcpServer();
try {
	await server.run();
} catch (error) {
	serverLogger.error("Fatal error running server", {
		error: getErrorMessage(error, String(error)),
		stack: error instanceof Error ? error.stack : undefined,
	});
	process.exit(1);
}
