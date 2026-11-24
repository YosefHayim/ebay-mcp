function invalidDateInput(message: string): never {
	throw new Error(message);
}

export function convertToTimestamp(dateInput: string | Date | number): number {
	// If already a number, handle as timestamp
	if (typeof dateInput == "number") {
		// If appears to be seconds (less than year 2100 in milliseconds)
		if (dateInput < 4_102_444_800_000) {
			// Could be seconds, check if reasonable
			const now = Date.now();
			const asSeconds = dateInput * 1000;

			// If multiplying by 1000 gives reasonable future date, it's seconds
			if (asSeconds > now - 100 * 365 * 24 * 60 * 60 * 1000) {
				return Math.floor(asSeconds);
			}
		}

		// Already milliseconds
		return Math.floor(dateInput);
	}

	// If Date object
	if (dateInput instanceof Date) {
		const timestamp = dateInput.getTime();
		if (Number.isNaN(timestamp)) {
			return invalidDateInput("Invalid Date object");
		}
		return timestamp;
	}

	// If string, try parsing
	if (typeof dateInput == "string") {
		// Handle relative time: "in X hours/minutes/seconds"
		const relativeMatch =
			/^in\s+(\d+)\s+(hours?|minutes?|seconds?|days?)$/i.exec(dateInput);
		if (relativeMatch) {
			const amountText = relativeMatch[1];
			const unitText = relativeMatch[2];
			const isAmountMissing = amountText == null;

			if (isAmountMissing) {
				return invalidDateInput("Invalid relative time");
			}

			const isUnitMissing = unitText == null;

			if (isUnitMissing) {
				return invalidDateInput("Invalid relative time");
			}

			const amount = Number.parseInt(amountText, 10);
			const unit = unitText.toLowerCase();

			let multiplier = 1000; // Default to seconds
			if (unit.startsWith("minute")) multiplier = 60 * 1000;
			else if (unit.startsWith("hour")) multiplier = 60 * 60 * 1000;
			else if (unit.startsWith("day")) multiplier = 24 * 60 * 60 * 1000;

			return Date.now() + amount * multiplier;
		}

		// Try parsing as ISO date or other standard format
		const parsed = Date.parse(dateInput);
		if (Number.isNaN(parsed)) {
			return invalidDateInput(
				`Invalid date format: ${dateInput}. Supported formats: ISO 8601, Unix timestamp, or relative time (e.g., "in 2 hours")`,
			);
		}

		return parsed;
	}

	return invalidDateInput(`Unsupported date input type: ${typeof dateInput}`);
}

export function calculateExpiry(
	expiresInSeconds: number,
	fromTimestamp?: number,
): number {
	const baseTime = fromTimestamp ?? Date.now();
	return baseTime + expiresInSeconds * 1000;
}

export function isExpired(
	expiryTimestamp: number,
	bufferSeconds = 60,
): boolean {
	const now = Date.now();
	const buffer = bufferSeconds * 1000;
	return now + buffer >= expiryTimestamp;
}

export function getTimeRemaining(expiryTimestamp: number): string {
	const now = Date.now();
	const diff = expiryTimestamp - now;

	if (diff <= 0) {
		return "Expired";
	}

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) {
		const remainingHours = hours % 24;
		return `${days} day${days > 1 ? "s" : ""}${remainingHours > 0 ? ` ${remainingHours} hour${remainingHours > 1 ? "s" : ""}` : ""}`;
	}

	if (hours > 0) {
		const remainingMinutes = minutes % 60;
		return `${hours} hour${hours > 1 ? "s" : ""}${remainingMinutes > 0 ? ` ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}` : ""}`;
	}

	if (minutes > 0) {
		const remainingSeconds = seconds % 60;
		return `${minutes} minute${minutes > 1 ? "s" : ""}${remainingSeconds > 0 ? ` ${remainingSeconds} second${remainingSeconds > 1 ? "s" : ""}` : ""}`;
	}

	return `${seconds} second${seconds > 1 ? "s" : ""}`;
}

export interface TokenExpiryValidation {
	valid: boolean;
	accessTokenStatus: "valid" | "expiring-soon" | "expired";
	refreshTokenStatus: "valid" | "expiring-soon" | "expired";
	accessTokenRemaining: string;
	refreshTokenRemaining: string;
	warnings: string[];
	recommendations: string[];
}

export function validateTokenExpiry(
	accessTokenExpiry: number,
	refreshTokenExpiry: number,
): TokenExpiryValidation {
	const warnings: string[] = [];
	const recommendations: string[] = [];

	const accessExpired = isExpired(accessTokenExpiry, 0);
	const accessExpiringSoon = isExpired(accessTokenExpiry, 300); // 5 minutes
	const refreshExpired = isExpired(refreshTokenExpiry, 0);
	const refreshExpiringSoon = isExpired(refreshTokenExpiry, 86_400); // 1 day

	let accessTokenStatus: "valid" | "expiring-soon" | "expired" = "valid";
	let refreshTokenStatus: "valid" | "expiring-soon" | "expired" = "valid";

	if (accessExpired) {
		accessTokenStatus = "expired";
		warnings.push("Access token has expired");
		if (!refreshExpired) {
			recommendations.push(
				"Use the refresh token to obtain a new access token",
			);
		}
	} else if (accessExpiringSoon) {
		accessTokenStatus = "expiring-soon";
		warnings.push("Access token will expire soon");
	}

	if (refreshExpired) {
		refreshTokenStatus = "expired";
		warnings.push("Refresh token has expired");
		recommendations.push(
			"User needs to re-authorize the application to get new tokens",
		);
	} else if (refreshExpiringSoon) {
		refreshTokenStatus = "expiring-soon";
		warnings.push("Refresh token will expire soon (within 24 hours)");
		recommendations.push(
			"Consider prompting user to re-authorize before refresh token expires",
		);
	}

	return {
		valid: !(accessExpired || refreshExpired),
		accessTokenStatus,
		refreshTokenStatus,
		accessTokenRemaining: getTimeRemaining(accessTokenExpiry),
		refreshTokenRemaining: getTimeRemaining(refreshTokenExpiry),
		warnings,
		recommendations,
	};
}
