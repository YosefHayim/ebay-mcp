import process from "node:process";
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { writeCliLine } from "@/shared/cliOutput.js";
import { paint } from "@/shared/paint.js";

export interface SecurityCheckResult {
	check: string;
	passed: boolean;
	message: string;
	severity: "critical" | "warning" | "info";
	fix?: string;
}

export function checkNodeVersion(): SecurityCheckResult {
	const requiredVersion = 18;
	const majorText = process.version.slice(1).split(".")[0];
	const isMajorMissing = majorText == null;

	if (isMajorMissing) {
		return {
			check: "Node.js Version",
			passed: false,
			message: `Node.js ${process.version} is below required version ${requiredVersion}`,
			severity: "critical",
			fix: `Install Node.js ${requiredVersion} or higher from https://nodejs.org/`,
		};
	}

	const currentVersion = Number.parseInt(majorText, 10);

	if (currentVersion >= requiredVersion) {
		return {
			check: "Node.js Version",
			passed: true,
			message: `Node.js ${process.version} meets requirements (>= ${requiredVersion})`,
			severity: "info",
		};
	}

	return {
		check: "Node.js Version",
		passed: false,
		message: `Node.js ${process.version} is below required version ${requiredVersion}`,
		severity: "critical",
		fix: `Install Node.js ${requiredVersion} or higher from https://nodejs.org/`,
	};
}

export function checkGitignore(projectRoot: string): SecurityCheckResult {
	const gitignorePath = join(projectRoot, ".gitignore");

	if (!existsSync(gitignorePath)) {
		return {
			check: ".gitignore Security",
			passed: false,
			message: "No .gitignore file found",
			severity: "warning",
			fix: "Create a .gitignore file and add .env to it",
		};
	}

	const gitignoreContent = readFileSync(gitignorePath, "utf-8");

	function ignoresEnvLine(line: string): boolean {
		const trimmed = line.trim();
		const isDotEnv = trimmed == ".env";

		if (isDotEnv) return true;

		const isEnvGlob = trimmed == "*.env";

		if (isEnvGlob) return true;

		const startsWithEnv = trimmed.startsWith(".env");

		if (startsWithEnv) return true;

		return false;
	}

	const hasEnv = gitignoreContent.split("\n").some(ignoresEnvLine);

	if (hasEnv) {
		return {
			check: ".gitignore Security",
			passed: true,
			message: ".env files are properly ignored by git",
			severity: "info",
		};
	}

	return {
		check: ".gitignore Security",
		passed: false,
		message: ".env is not in .gitignore - credentials could be committed!",
		severity: "critical",
		fix: 'Add ".env" to your .gitignore file immediately',
	};
}

function reachedEbayApi(healthResponse: Response): boolean {
	const isHealthy = healthResponse.ok;

	if (isHealthy) return true;

	const isMissingRoute = healthResponse.status == 404;

	if (isMissingRoute) return true;

	return false;
}

export async function checkNetworkConnectivity(): Promise<SecurityCheckResult> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 5000);

	let healthResponse: Response;

	try {
		healthResponse = await fetch("https://api.ebay.com/health", {
			signal: controller.signal,
		});
	} catch {
		return {
			check: "Network Connectivity",
			passed: false,
			message: "Cannot reach eBay API servers",
			severity: "critical",
			fix: "Check your internet connection, proxy settings, and firewall",
		};
	} finally {
		clearTimeout(timeout);
	}

	const reachedEbay = reachedEbayApi(healthResponse);

	if (reachedEbay) {
		// 404 is fine, means we can reach eBay servers
		return {
			check: "Network Connectivity",
			passed: true,
			message: "Successfully connected to eBay API servers",
			severity: "info",
		};
	}

	return {
		check: "Network Connectivity",
		passed: false,
		message: `Unexpected response from eBay API: ${healthResponse.status}`,
		severity: "warning",
		fix: "Check your internet connection and firewall settings",
	};
}

export function checkProjectBuild(projectRoot: string): SecurityCheckResult {
	const buildPath = join(projectRoot, "build", "index.js");

	if (existsSync(buildPath)) {
		return {
			check: "Project Build",
			passed: true,
			message: "Project is built and ready",
			severity: "info",
		};
	}

	return {
		check: "Project Build",
		passed: false,
		message: "Project has not been built yet",
		severity: "warning",
		fix: 'Run "npm run build" to build the project',
	};
}

export function checkDependencies(projectRoot: string): SecurityCheckResult {
	const nodeModulesPath = join(projectRoot, "node_modules");

	if (existsSync(nodeModulesPath)) {
		return {
			check: "Dependencies",
			passed: true,
			message: "Dependencies are installed",
			severity: "info",
		};
	}

	return {
		check: "Project Dependencies",
		passed: false,
		message: "Dependencies not installed",
		severity: "critical",
		fix: 'Run "npm install" to install dependencies',
	};
}

export function checkGitTracking(projectRoot: string): SecurityCheckResult {
	const gitPath = join(projectRoot, ".git");
	const envPath = join(projectRoot, ".env");

	if (!existsSync(gitPath)) {
		return {
			check: "Git Repository",
			passed: true,
			message: "Not a git repository (no tracking risk)",
			severity: "info",
		};
	}

	if (!existsSync(envPath)) {
		return {
			check: "Git Tracking",
			passed: true,
			message: ".env file does not exist yet",
			severity: "info",
		};
	}

	let trackedFiles: string;

	try {
		trackedFiles = execSync("git ls-files .env", {
			cwd: projectRoot,
			encoding: "utf-8",
		}).trim();
	} catch {
		return {
			check: "Git Tracking",
			passed: true,
			message: "Unable to check git tracking (likely not tracked)",
			severity: "info",
		};
	}

	if (trackedFiles == "") {
		return {
			check: "Git Tracking",
			passed: true,
			message: ".env is not tracked by git",
			severity: "info",
		};
	}

	return {
		check: "Git Tracking",
		passed: false,
		message: ".env is tracked by git - SECURITY RISK!",
		severity: "critical",
		fix: 'Run: git rm --cached .env && git commit -m "Remove .env from tracking"',
	};
}

export async function runSecurityChecks(
	projectRoot: string,
): Promise<SecurityCheckResult[]> {
	const results: SecurityCheckResult[] = [];

	// Synchronous checks
	results.push(checkNodeVersion());
	results.push(checkGitignore(projectRoot));
	results.push(checkProjectBuild(projectRoot));
	results.push(checkDependencies(projectRoot));
	results.push(checkGitTracking(projectRoot));

	// Asynchronous checks
	results.push(await checkNetworkConnectivity());

	return results;
}

export function displaySecurityResults(results: SecurityCheckResult[]): void {
	writeCliLine(paint.bold.cyan("\n🔒 Security & Environment Checks\n"));

	for (const checkResult of results) {
		const icon = checkResult.passed ? paint.green("✓") : paint.red("✗");
		let severity = paint.gray("[INFO]");
		if (checkResult.severity == "critical") {
			severity = paint.red("[CRITICAL]");
		} else if (checkResult.severity == "warning") {
			severity = paint.yellow("[WARNING]");
		}

		writeCliLine(`${icon} ${paint.bold(checkResult.check)}: ${severity}`);
		writeCliLine(`  ${paint.gray(checkResult.message)}`);

		if (checkResult.fix) {
			writeCliLine(`  ${paint.yellow("→ Fix:")} ${checkResult.fix}`);
		}
		writeCliLine("");
	}

	const critical = results.filter(isCriticalFailure);
	const warnings = results.filter(isWarningFailure);

	if (critical.length > 0) {
		writeCliLine(
			paint.red.bold(
				`⚠️  ${critical.length} critical issue(s) found. Please fix before continuing.\n`,
			),
		);
	} else if (warnings.length > 0) {
		writeCliLine(
			paint.yellow.bold(
				`⚠️  ${warnings.length} warning(s) found. Recommended to fix.\n`,
			),
		);
	} else {
		writeCliLine(paint.green.bold("✅ All security checks passed!\n"));
	}
}

function isCriticalFailure(checkResult: SecurityCheckResult): boolean {
	const isPassed = checkResult.passed;

	if (isPassed) return false;

	const isCritical = checkResult.severity == "critical";

	if (isCritical) return true;

	return false;
}

function isWarningFailure(checkResult: SecurityCheckResult): boolean {
	const isPassed = checkResult.passed;

	if (isPassed) return false;

	const isWarning = checkResult.severity == "warning";

	if (isWarning) return true;

	return false;
}

export function hasCriticalFailures(results: SecurityCheckResult[]): boolean {
	return results.some(isCriticalFailure);
}
