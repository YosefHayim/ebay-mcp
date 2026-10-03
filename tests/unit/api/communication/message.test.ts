import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageApi } from '@/api/communication/message.js';
import { invalidInput } from '@tests/helpers/invalidInput.js';
import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { Effect } from 'effect';

let client: EbayApiClient;
let api: MessageApi;

beforeEach(() => {
  client = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  } as unknown as EbayApiClient;
  api = new MessageApi(client);
});

describe('getConversations', () => {
  it('get conversations with parameters', async () => {
    const mockResponse = { conversations: [] };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(
      api.getConversations({
        conversationType: 'FROM_MEMBERS',
        conversationStatus: 'ACTIVE',
        limit: 10,
        offset: 0,
      }),
    );

    expect(client.get).toHaveBeenCalledWith('/commerce/message/v1/conversation', {
      conversation_type: 'FROM_MEMBERS',
      conversation_status: 'ACTIVE',
      limit: 10,
      offset: 0,
    });
  });

  it('handle missing optional filters', async () => {
    const mockResponse = { conversations: [] };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.getConversations({ conversationType: 'FROM_EBAY' }));

    expect(client.get).toHaveBeenCalledWith('/commerce/message/v1/conversation', {
      conversation_type: 'FROM_EBAY',
    });
  });
});

describe('getConversation', () => {
  it('get conversation by ID', async () => {
    const mockResponse = { conversationId: '123' };
    vi.mocked(client.get).mockResolvedValue(mockResponse);

    await Effect.runPromise(
      api.getConversation({ conversationId: 'conv123', conversationType: 'FROM_MEMBERS' }),
    );

    expect(client.get).toHaveBeenCalledWith('/commerce/message/v1/conversation/conv123', {
      conversation_type: 'FROM_MEMBERS',
    });
  });

  it('fail when conversationId is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.getConversation({ conversationId: '', conversationType: 'FROM_MEMBERS' })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('conversationId is required');
  });
});

describe('sendMessage', () => {
  it('send message', async () => {
    const mockResponse = { messageId: '123' };
    const messageData = { messageText: 'Hello', otherPartyUsername: 'buyer123' };
    vi.mocked(client.post).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.sendMessage(messageData));

    expect(client.post).toHaveBeenCalledWith('/commerce/message/v1/send_message', messageData);
  });

  it('fail when messageData is missing', async () => {
    const error = await Effect.runPromise(Effect.flip(api.sendMessage(invalidInput(undefined))));

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('messageData is required');
  });
});

describe('updateConversation', () => {
  it('update conversation', async () => {
    const mockResponse = { success: true };
    const updateData = { read: true };
    vi.mocked(client.post).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.updateConversation(updateData));

    expect(client.post).toHaveBeenCalledWith(
      '/commerce/message/v1/update_conversation',
      updateData,
    );
  });

  it('fail when updateData is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.updateConversation(invalidInput(undefined))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('updateData is required');
  });
});

describe('bulkUpdateConversation', () => {
  it('bulk update conversations', async () => {
    const mockResponse = { success: true };
    const updateData = {
      conversations: [
        { conversationId: '123', conversationStatus: 'READ', conversationType: 'FROM_MEMBERS' },
        { conversationId: '456', conversationStatus: 'READ', conversationType: 'FROM_MEMBERS' },
      ],
    };
    vi.mocked(client.post).mockResolvedValue(mockResponse);

    await Effect.runPromise(api.bulkUpdateConversation(updateData));

    expect(client.post).toHaveBeenCalledWith(
      '/commerce/message/v1/bulk_update_conversation',
      updateData,
    );
  });

  it('fail when updateData is missing', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.bulkUpdateConversation(invalidInput(undefined))),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('updateData is required');
  });
});

describe('error handling', () => {
  it('handle API errors in getConversations', async () => {
    vi.mocked(client.get).mockRejectedValue(new Error('API Error'));

    const error = await Effect.runPromise(
      Effect.flip(api.getConversations({ conversationType: 'FROM_MEMBERS' })),
    );

    expect(error._tag).toBe('EbayApiError');
  });

  it('handle API errors in getConversation', async () => {
    vi.mocked(client.get).mockRejectedValue(new Error('API Error'));

    const error = await Effect.runPromise(
      Effect.flip(api.getConversation({ conversationId: '123', conversationType: 'FROM_MEMBERS' })),
    );

    expect(error._tag).toBe('EbayApiError');
  });

  it('handle API errors in sendMessage', async () => {
    vi.mocked(client.post).mockRejectedValue(new Error('API Error'));

    const error = await Effect.runPromise(Effect.flip(api.sendMessage({ messageText: 'test' })));

    expect(error._tag).toBe('EbayApiError');
  });

  it('handle API errors in updateConversation', async () => {
    vi.mocked(client.post).mockRejectedValue(new Error('API Error'));

    const error = await Effect.runPromise(Effect.flip(api.updateConversation({ read: true })));

    expect(error._tag).toBe('EbayApiError');
  });

  it('handle API errors in bulkUpdateConversation', async () => {
    vi.mocked(client.post).mockRejectedValue(new Error('API Error'));

    const error = await Effect.runPromise(
      Effect.flip(api.bulkUpdateConversation({ conversations: [] })),
    );

    expect(error._tag).toBe('EbayApiError');
  });
});

describe('getConversations validation', () => {
  it('validate filter parameter type', async () => {
    const error = await Effect.runPromise(
      Effect.flip(
        api.getConversations({
          conversationType: 'FROM_MEMBERS',
          conversationStatus: invalidInput(123),
        }),
      ),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('conversationStatus must be a string');
  });

  it('validate limit parameter type', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.getConversations({ conversationType: 'FROM_MEMBERS', limit: 0 })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('limit must be a positive number');
  });

  it('validate offset parameter type', async () => {
    const error = await Effect.runPromise(
      Effect.flip(api.getConversations({ conversationType: 'FROM_MEMBERS', offset: -1 })),
    );

    expect(error._tag).toBe('EndpointInputError');
    expect(error.message).toContain('offset must be a non-negative number');
  });
});
