import { describe, expect, it } from "vitest";
import { locatedResourceId } from "@/ebay-client/location.js";

describe("locatedResourceId", () => {
	it("reads the decoded ID from a Location under the expected collection", () => {
		const location = "https://api.ebay.com/sell/feed/v1/order_task/task-1%2B2";

		const resource = locatedResourceId(location, "/sell/feed/v1/order_task");

		expect(resource).toEqual({ location, id: "task-1+2" });
	});

	it.each([
		[undefined],
		["not a url"],
		["https://api.ebay.com/sell/feed/v1/order_task/task-%"],
		["http://api.ebay.com/sell/feed/v1/order_task/1"],
		["https://api.ebay.com/sell/feed/v1/schedule/1"],
		["https://api.ebay.com/sell/feed/v1/order_task/"],
		["https://api.ebay.com/sell/feed/v1/order_task/1/extra"],
	])("fails with a tagged EbayApiError for %s", (location) => {
		let thrown: unknown;

		try {
			locatedResourceId(location, "/sell/feed/v1/order_task");
		} catch (error) {
			thrown = error;
		}

		expect(thrown).toMatchObject({
			_tag: "EbayApiError",
			path: "/sell/feed/v1/order_task",
		});
	});
});
