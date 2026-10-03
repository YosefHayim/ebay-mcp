import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeedbackApi } from '@/api/communication/feedback.js';
import { invalidInput } from '@tests/helpers/invalidInput.js';
import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { Effect } from 'effect';

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

describe('getAwaitingFeedback', () => {
  it('get awaiting feedback with parameters', async () => {
    const mockResponse = { feedback: [] };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(
      api.getAwaitingFeedback({ filter: 'filter:test', limit: 10, offset: 0 }),
    );

    expect(client.get).toHaveBeenCalledWith('/commerce/feedback/v1/awaiting_feedback', {
      filter: 'filter:test',
      limit: 10,
      offset: 0,
    });
  });

  it('handle missing optional parameters', async () => {
    const mockResponse = { feedback: [] };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.getAwaitingFeedback());

    expect(client.get).toHaveBeenCalledWith('/commerce/feedback/v1/awaiting_feedback');
  });
});

describe('getFeedback', () => {
  it('get feedback for transaction', async () => {
    const mockResponse = { feedback: [] };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(
      api.getFeedback({
        userId: 'seller123',
        feedbackType: 'FEEDBACK_RECEIVED',
        transactionId: 'txn123',
      }),
    );

    expect(client.get).toHaveBeenCalledWith('/commerce/feedback/v1/feedback', {
      user_id: 'seller123',
      feedback_type: 'FEEDBACK_RECEIVED',
      transaction_id: 'txn123',
    });
  });

  it('fail when userId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.getFeedback({ userId: '', feedbackType: 'FEEDBACK_RECEIVED' })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('userId is required');
  });
});

describe('getFeedbackRatingSummary', () => {
  it('get feedback rating summary', async () => {
    const mockResponse = { positive: 100, negative: 0, neutral: 5 };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(
      api.getFeedbackRatingSummary({
        userId: 'seller123',
        filter: 'ratingType:OVERALL_EXPERIENCE',
      }),
    );

    expect(client.get).toHaveBeenCalledWith('/commerce/feedback/v1/feedback_rating_summary', {
      user_id: 'seller123',
      filter: 'ratingType:OVERALL_EXPERIENCE',
    });
  });
});

describe('leaveFeedbackForBuyer', () => {
  it('leave feedback for buyer', async () => {
    const mockResponse = { feedbackId: '123' };
    const feedbackData = {
      orderLineItemId: 'order123',
      commentType: 'POSITIVE' as const,
      commentText: 'Great buyer!',
    };
    vi.mocked(client.post).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.leaveFeedbackForBuyer(feedbackData));

    expect(client.post).toHaveBeenCalledWith('/commerce/feedback/v1/feedback', feedbackData);
  });

  it('fail when feedbackData is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.leaveFeedbackForBuyer(invalidInput(undefined))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('feedbackData is required');
  });
});

describe('respondToFeedback', () => {
  it('respond to feedback', async () => {
    const mockResponse = { success: true };
    vi.mocked(client.post).mockResolvedValue(mockResponse);

    await Effect.runPromise(
      api.respondToFeedback({
        feedbackId: 'feedback123',
        responseText: 'Thank you for the feedback!',
      }),
    );

    expect(client.post).toHaveBeenCalledWith('/commerce/feedback/v1/respond_to_feedback', {
      feedbackId: 'feedback123',
      responseText: 'Thank you for the feedback!',
    });
  });

  it('fail when response body is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.respondToFeedback(invalidInput(undefined))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('response is required');
  });
});
