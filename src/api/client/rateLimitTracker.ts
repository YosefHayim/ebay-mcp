/**
 * Sliding-window request counter used by the REST client before sending eBay requests.
 */
export class RateLimitTracker {
  private requestTimestamps: number[] = [];
  private readonly windowMs = 60_000;
  private readonly maxRequests = 5000;

  /**
   * Checks whether another request fits inside the current local rate window.
   *
   * @returns True when the request can be sent without exceeding the local guard.
   *
   * @example
   * ```ts
   * if (rateLimitTracker.canMakeRequest()) rateLimitTracker.recordRequest();
   * ```
   */
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );
    return this.requestTimestamps.length < this.maxRequests;
  }

  /**
   * Records one request timestamp in the current local rate window.
   *
   * @returns Nothing.
   *
   * @example
   * ```ts
   * rateLimitTracker.recordRequest();
   * ```
   */
  recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Returns current local rate-window counts.
   *
   * @returns Current request count, maximum request count, and window length in milliseconds.
   *
   * @example
   * ```ts
   * const stats = rateLimitTracker.getStats();
   * ```
   */
  getStats(): { current: number; max: number; windowMs: number } {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );
    return {
      current: this.requestTimestamps.length,
      max: this.maxRequests,
      windowMs: this.windowMs,
    };
  }
}
