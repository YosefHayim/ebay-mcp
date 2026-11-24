import path from "node:path";
import { defineConfig } from "vitest/config";

const vitestConfig = defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
			"@tests": path.resolve(import.meta.dirname, "./tests"),
		},
	},
	test: {
		globals: true,
		environment: "node",
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			exclude: [
				"node_modules/**",
				"build/**",
				"dist/**",
				"**/*.d.ts",
				"**/*.config.*",
				"**/types/**",
				"tests/**",
				// Exclude schema definition files (no logic to test)
				"src/shared/apiStatusFeed.ts",
				"src/shared/cliOutput.ts",
				"src/shared/cliUi.ts",
				"src/shared/dateConverter.ts",
				"src/shared/entryModule.ts",
				"src/shared/envFile.ts",
				"src/shared/envParser.ts",
				"src/shared/errors.ts",
				"src/shared/http.ts",
				"src/shared/llmClientDetector.ts",
				"src/shared/localFeedFiles.ts",
				"src/shared/localMedia.ts",
				"src/shared/logRedaction.ts",
				"src/shared/logger.ts",
				"src/shared/objects.ts",
				"src/shared/schemaHelpers.ts",
				"src/shared/tokenUtils.ts",
				"src/shared/typeGuards.ts",
				"src/shared/version.ts",
				"src/shared/zodIssues.ts",
				"src/ebay-apis/trading/tradingHelpers.ts",
				"src/ebay-apis/communication/feedbackHelpers.ts",
				"src/ebay-apis/communication/messageHelpers.ts",
				"src/ebay-apis/communication/negotiationHelpers.ts",
				"src/ebay-apis/communication/notificationHelpers.ts",
				"src/ebay-apis/other/identity/identityHelpers.ts",
				"src/ebay-apis/other/translation/translationHelpers.ts",
				"src/ebay-apis/other/vero/veroHelpers.ts",
				"src/shared/ebay.ts",
				"src/shared/ebayEnums.ts",
				"src/shared/index.ts",
				"src/ebay-openapi-types/**",
				"src/ebay-apis/**/*Schemas.ts",
				// Exclude server entry points (tested via integration)
				"src/index.ts",
				"src/serverHttp.ts",
				// Exclude script files
				"scripts/**",
				"src/cli/**",
			],
			include: ["src/**/*.ts"],
			// Floors at the measured baseline: coverage may rise, never drop.
			thresholds: {
				lines: 86,
				functions: 76,
				branches: 82,
				statements: 86,
			},
		},
		// Unit suite only. The hermetic integration suite runs via its own config —
		// `pnpm run test:integration` (vitest.integration.config.cts) and CI's test.yml.
		include: ["tests/unit/**/*.test.ts"],
		exclude: ["node_modules", "build", "dist", "tests/integration/**"],
		testTimeout: 10_000,
		hookTimeout: 10_000,
	},
});

module.exports = vitestConfig;
