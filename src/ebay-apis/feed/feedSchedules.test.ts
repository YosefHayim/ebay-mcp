import { beforeEach, describe, expect, it, vi } from "vitest";
import { FeedApi } from "@/ebay-apis/feed/feedApi.js";
import { createFeedScheduleMethods } from "@/ebay-apis/feed/feedSchedulesApi.js";
import { MAX_INLINE_DOWNLOAD_BYTES } from "@/ebay-client/download.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";

async function caughtError(call: Promise<unknown>): Promise<{
	readonly _tag: string;
	readonly message: string;
	readonly parameter?: string;
	readonly method?: string;
	readonly path?: string;
	readonly cause?: unknown;
}> {
	try {
		await call;
	} catch (error) {
		return error as {
			readonly _tag: string;
			readonly message: string;
			readonly parameter?: string;
			readonly method?: string;
			readonly path?: string;
			readonly cause?: unknown;
		};
	}

	throw new Error("expected the call to fail");
}

const BASE = "/sell/feed/v1";
/**
 * Sell Feed v1 operationIds as of the 2026-10-01 spec, pinning the FeedApi facade to them.
 * Spec coverage itself is checked by `pnpm sync --report`, which reads the downloaded spec.
 */
const FEED_OPERATION_IDS = [
	"getOrderTasks",
	"createOrderTask",
	"getOrderTask",
	"getInventoryTasks",
	"createInventoryTask",
	"getInventoryTask",
	"getSchedules",
	"createSchedule",
	"getSchedule",
	"updateSchedule",
	"deleteSchedule",
	"getLatestResultFile",
	"getScheduleTemplate",
	"getScheduleTemplates",
	"getTasks",
	"createTask",
	"getInputFile",
	"getResultFile",
	"getTask",
	"uploadFile",
	"getCustomerServiceMetricTasks",
	"createCustomerServiceMetricTask",
	"getCustomerServiceMetricTask",
];
const LOCATION_HOST = "https://api.ebay.com";
const schedule = {
	feedType: "LMS_ORDER_REPORT",
	scheduleTemplateId: "TPL-1",
	scheduleName: "Daily orders",
	preferredTriggerHour: "11Z",
	scheduleStartDate: "2026-10-03T11:00:00.000Z",
	schemaVersion: "1235",
};
const client = {
	get: vi.fn(),
	postForResponse: vi.fn(),
	put: vi.fn(),
	delete: vi.fn(),
	getForResponse: vi.fn(),
};
// The endpoint factory only uses these mocked client methods.
const feed = createFeedScheduleMethods(client as unknown as EbayApiClient);

beforeEach(() => {
	vi.resetAllMocks();
});

describe("FeedApi", () => {
	it("exposes every Feed API operationId as an endpoint method", () => {
		const api = new FeedApi(
			client as unknown as EbayApiClient,
		) as unknown as Record<string, unknown>;

		expect(
			FEED_OPERATION_IDS.filter(
				(operationId) => typeof api[operationId] !== "function",
			),
		).toEqual([]);
	});
});

describe("Feed schedule resource", () => {
	it("lists schedules and templates by feed type with paging", async () => {
		const page = { schedules: [], total: 0 };
		client.get.mockResolvedValue(page);

		expect(
			await feed.getSchedules({
				feedType: "LMS_ORDER_REPORT",
				limit: 20,
				offset: 40,
			}),
		).toBe(page);
		await feed.getScheduleTemplates({ feedType: "LMS_ORDER_REPORT" });

		expect(client.get.mock.calls).toEqual([
			[
				`${BASE}/schedule`,
				{ feed_type: "LMS_ORDER_REPORT", limit: 20, offset: 40 },
			],
			[`${BASE}/schedule_template`, { feed_type: "LMS_ORDER_REPORT" }],
		]);
	});

	it("creates a schedule and reads the schedule ID from Location", async () => {
		const location = `${LOCATION_HOST}${BASE}/schedule/S%201`;
		client.postForResponse.mockResolvedValue({
			data: {},
			status: 201,
			headers: { location },
		});

		expect(await feed.createSchedule({ schedule })).toEqual({
			scheduleId: "S 1",
			location,
		});
		expect(client.postForResponse).toHaveBeenCalledWith(
			`${BASE}/schedule`,
			schedule,
			undefined,
		);
	});

	it("gets a schedule and a template with encoded IDs", async () => {
		client.get.mockResolvedValue({ scheduleId: "S/1" });

		await feed.getSchedule({ scheduleId: "S/1" });
		await feed.getScheduleTemplate({ scheduleTemplateId: "TPL/1" });

		expect(client.get.mock.calls).toEqual([
			[`${BASE}/schedule/S%2F1`],
			[`${BASE}/schedule_template/TPL%2F1`],
		]);
	});
});

describe("Feed schedule changes and files", () => {
	it("updates a schedule with only the update fields and completes on 204", async () => {
		client.put.mockResolvedValue(undefined);
		const update = {
			scheduleName: "Hourly orders",
			preferredTriggerDayOfMonth: 15,
		};

		expect(
			await feed.updateSchedule({
				scheduleId: "S/1",
				schedule: { ...update, feedType: "X" } as never,
			}),
		).toBeUndefined();
		expect(client.put).toHaveBeenCalledWith(`${BASE}/schedule/S%2F1`, update);
	});

	it("deletes a schedule and completes on 204", async () => {
		client.delete.mockResolvedValue(undefined);

		expect(await feed.deleteSchedule({ scheduleId: "S/1" })).toBeUndefined();
		expect(client.delete).toHaveBeenCalledWith(`${BASE}/schedule/S%2F1`);
	});

	it("downloads the latest schedule result as binary", async () => {
		const bytes = Buffer.from("order-id,total\n1,10\n");
		client.getForResponse.mockResolvedValue({
			data: bytes,
			status: 200,
			headers: {
				"content-type": "text/csv",
				"content-disposition": "attachment; filename=r.csv",
			},
		});

		expect(await feed.getLatestResultFile({ scheduleId: "S/1" })).toEqual({
			bytes,
			contentType: "text/csv",
			fileName: "r.csv",
		});
		expect(client.getForResponse).toHaveBeenCalledWith(
			`${BASE}/schedule/S%2F1/download_result_file`,
			undefined,
			{
				headers: { Accept: "application/octet-stream" },
				responseType: "arraybuffer",
				maxBytes: MAX_INLINE_DOWNLOAD_BYTES,
			},
		);
	});
});

describe("Feed schedule failures", () => {
	it("rejects invalid input before any request", async () => {
		const programs: Promise<unknown>[] = [
			feed.getSchedules({ feedType: "" }),
			feed.getScheduleTemplates({ feedType: "LMS_ORDER_REPORT", limit: 0 }),
			feed.createSchedule({
				schedule: { ...schedule, scheduleTemplateId: "" },
			}),
			feed.createSchedule({
				schedule: { ...schedule, preferredTriggerDayOfMonth: 32 },
			}),
			feed.getSchedule({ scheduleId: " " }),
			feed.updateSchedule({
				scheduleId: "",
				schedule: { scheduleName: "Daily" },
			}),
			feed.updateSchedule({ scheduleId: "S-1", schedule: {} }),
			feed.deleteSchedule({ scheduleId: "" }),
			feed.getLatestResultFile({ scheduleId: "" }),
			feed.getScheduleTemplate({ scheduleTemplateId: "" }),
		];

		const errors = await Promise.all(
			programs.map((program) => caughtError(program)),
		);

		expect(errors.map((error) => error._tag)).toEqual(
			new Array(programs.length).fill("EndpointInputError"),
		);
		for (const mock of Object.values(client)) {
			expect(mock).not.toHaveBeenCalled();
		}
	});

	it("wraps transport failures on every schedule endpoint with the request context", async () => {
		const cause = new Error("remote failure");
		for (const mock of Object.values(client)) {
			mock.mockRejectedValue(cause);
		}
		const page = { feedType: "LMS_ORDER_REPORT" };
		const cases = [
			[feed.getSchedules(page), "GET", "/schedule"],
			[feed.createSchedule({ schedule }), "POST", "/schedule"],
			[feed.getSchedule({ scheduleId: "S-1" }), "GET", "/schedule/S-1"],
			[
				feed.updateSchedule({
					scheduleId: "S-1",
					schedule: { scheduleName: "Daily" },
				}),
				"PUT",
				"/schedule/S-1",
			],
			[feed.deleteSchedule({ scheduleId: "S-1" }), "DELETE", "/schedule/S-1"],
			[
				feed.getLatestResultFile({ scheduleId: "S-1" }),
				"GET",
				"/schedule/S-1/download_result_file",
			],
			[
				feed.getScheduleTemplate({ scheduleTemplateId: "T-1" }),
				"GET",
				"/schedule_template/T-1",
			],
			[feed.getScheduleTemplates(page), "GET", "/schedule_template"],
		] as const;

		const errors = await Promise.all(
			cases.map(([program]) => caughtError(program)),
		);

		cases.forEach(([, method, path], index) => {
			expect(errors[index]).toMatchObject({
				_tag: "EbayApiError",
				method,
				path: `${BASE}${path}`,
				cause,
			});
		});
	});
});
