export class RateLimitTracker {
	private requestTimestamps: number[] = [];
	private readonly windowMs = 60_000;
	private readonly maxRequests = 5000;

	canMakeRequest = (): boolean => {
		const now = Date.now();
		this.requestTimestamps = this.requestTimestamps.filter(
			(timestamp) => now - timestamp < this.windowMs,
		);
		return this.requestTimestamps.length < this.maxRequests;
	};

	recordRequest = (): void => {
		this.requestTimestamps.push(Date.now());
	};

	getStats = (): { current: number; max: number; windowMs: number } => {
		const now = Date.now();
		this.requestTimestamps = this.requestTimestamps.filter(
			(timestamp) => now - timestamp < this.windowMs,
		);
		return {
			current: this.requestTimestamps.length,
			max: this.maxRequests,
			windowMs: this.windowMs,
		};
	};
}
