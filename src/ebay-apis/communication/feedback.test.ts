import { invalidInput } from "@tests/helpers/invalidInput.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FeedbackApi } from "@/ebay-apis/communication/feedbackApi.js";
import type { EbayApiClient } from "@/ebay-client/ebayApiClient.js";

let client: EbayApiClient;
let api: FeedbackApi;

beforeEach(() => {
	client = {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	} as unknown as EbayApiClient;
	api = new FeedbackApi(client);
});

describe("getItemsAwaitingFeedback", () => {
	it("get awaiting feedback with parameters", async () => {
		const mockResponse = { feedback: [] };
		vi.mocked(client.get).mockResolvedValue(mockResponse);

		await api.getItemsAwaitingFeedback({
			filter: "filter:test",
			limit: 10,
			offset: 0,
		});

		expect(client.get).toHaveBeenCalledWith(
			"/commerce/feedback/v1/awaiting_feedback",
			{
				filter: "filter:test",
				limit: 10,
				offset: 0,
			},
		);
	});

	it("handle missing optional parameters", async () => {
		const mockResponse = { feedback: [] };
		vi.mocked(client.get).mockResolvedValue(mockResponse);

		await api.getItemsAwaitingFeedback();

		expect(client.get).toHaveBeenCalledWith(
			"/commerce/feedback/v1/awaiting_feedback",
		);
	});
});

describe("getFeedback", () => {
	it("get feedback for transaction", async () => {
		const mockResponse = { feedback: [] };
		vi.mocked(client.get).mockResolvedValue(mockResponse);

		await api.getFeedback({
			userId: "seller123",
			feedbackType: "FEEDBACK_RECEIVED",
			transactionId: "txn123",
		});

		expect(client.get).toHaveBeenCalledWith("/commerce/feedback/v1/feedback", {
			user_id: "seller123",
			feedback_type: "FEEDBACK_RECEIVED",
			transaction_id: "txn123",
		});
	});

	it("fail when userId is missing", async () => {
		const error = await (async () => {
			try {
				await api.getFeedback({
					userId: "",
					feedbackType: "FEEDBACK_RECEIVED",
				});
			} catch (error) {
				return error;
			}

			throw new Error("expected failure");
		})();

		expect(error._tag).toBe("EndpointInputError");
		expect(error.message).toContain("userId is required");
	});
});

describe("getFeedbackRatingSummary", () => {
	it("get feedback rating summary", async () => {
		const mockResponse = { positive: 100, negative: 0, neutral: 5 };
		vi.mocked(client.get).mockResolvedValue(mockResponse);

		await api.getFeedbackRatingSummary({
			userId: "seller123",
			filter: "ratingType:OVERALL_EXPERIENCE",
		});

		expect(client.get).toHaveBeenCalledWith(
			"/commerce/feedback/v1/feedback_rating_summary",
			{
				user_id: "seller123",
				filter: "ratingType:OVERALL_EXPERIENCE",
			},
		);
	});
});

describe("leaveFeedback", () => {
	it("leave feedback for buyer", async () => {
		const mockResponse = { feedbackId: "123" };
		const feedbackData = {
			orderLineItemId: "order123",
			commentType: "POSITIVE" as const,
			commentText: "Great buyer!",
		};
		vi.mocked(client.post).mockResolvedValue(mockResponse);

		await api.leaveFeedback(feedbackData);

		expect(client.post).toHaveBeenCalledWith(
			"/commerce/feedback/v1/feedback",
			feedbackData,
		);
	});

	it("fail when feedbackData is missing", async () => {
		const error = await (async () => {
			try {
				await api.leaveFeedback(invalidInput(undefined));
			} catch (error) {
				return error;
			}

			throw new Error("expected failure");
		})();

		expect(error._tag).toBe("EndpointInputError");
		expect(error.message).toContain("feedbackData is required");
	});
});

describe("respondToFeedback", () => {
	it("respond to feedback", async () => {
		const mockResponse = { success: true };
		vi.mocked(client.post).mockResolvedValue(mockResponse);

		await api.respondToFeedback({
			feedbackId: "feedback123",
			responseText: "Thank you for the feedback!",
		});

		expect(client.post).toHaveBeenCalledWith(
			"/commerce/feedback/v1/respond_to_feedback",
			{
				feedbackId: "feedback123",
				responseText: "Thank you for the feedback!",
			},
		);
	});

	it("fail when response body is missing", async () => {
		const error = await (async () => {
			try {
				await api.respondToFeedback(invalidInput(undefined));
			} catch (error) {
				return error;
			}

			throw new Error("expected failure");
		})();

		expect(error._tag).toBe("EndpointInputError");
		expect(error.message).toContain("feedbackReply is required");
	});
});
