import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Effect } from 'effect';
import { DisputeApi } from '@/api/order-management/dispute.js';
import type { EbayApiClient } from '@/api/client/ebayApiClient.js';

describe('DisputeApi', () => {
  let disputeApi: DisputeApi;
  let mockClient: EbayApiClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as EbayApiClient;

    disputeApi = new DisputeApi(mockClient);
  });

  describe('getPaymentDispute', () => {
    it('gets payment dispute details', async () => {
      const mockDispute = {
        paymentDisputeId: 'DISPUTE-123',
        paymentDisputeStatus: 'OPEN',
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockDispute);

      const result = await Effect.runPromise(
        disputeApi.getPaymentDispute({ paymentDisputeId: 'DISPUTE-123' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/payment_dispute/DISPUTE-123',
      );
      expect(result).toEqual(mockDispute);
    });

    it('fails with a tagged input error when paymentDisputeId is missing', async () => {
      const error = await Effect.runPromise(
        Effect.flip(disputeApi.getPaymentDispute({ paymentDisputeId: '' })),
      );

      expect(error._tag).toBe('EndpointInputError');
      expect(error.parameter).toBe('paymentDisputeId');
    });
  });

  describe('fetchEvidenceContent', () => {
    it('fetches evidence file content as binary data', async () => {
      const mockBuffer = Buffer.from('evidence');
      vi.mocked(mockClient.get).mockResolvedValue(mockBuffer);

      const result = await Effect.runPromise(
        disputeApi.fetchEvidenceContent({
          paymentDisputeId: 'DISPUTE-123',
          evidenceId: 'EVIDENCE-456',
          fileId: 'FILE-789',
        }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/payment_dispute/DISPUTE-123/fetch_evidence_content',
        {
          evidence_id: 'EVIDENCE-456',
          file_id: 'FILE-789',
        },
        {
          headers: { Accept: 'application/octet-stream' },
          responseType: 'arraybuffer',
        },
      );
      expect(result).toEqual(mockBuffer);
    });
  });

  describe('getActivities', () => {
    it('gets payment dispute activity history', async () => {
      const mockActivity = {
        activity: [{ activityType: 'DISPUTE_OPENED', activityDate: '2025-01-01T00:00:00Z' }],
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockActivity);

      const result = await Effect.runPromise(
        disputeApi.getActivities({ paymentDisputeId: 'DISPUTE-123' }),
      );

      expect(mockClient.get).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/payment_dispute/DISPUTE-123/activity',
      );
      expect(result).toEqual(mockActivity);
    });
  });

  describe('getPaymentDisputeSummaries', () => {
    it('searches for payment disputes with no params', async () => {
      const mockSummaries = {
        paymentDisputeSummaries: [{ paymentDisputeId: 'DISPUTE-123' }],
        total: 1,
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockSummaries);

      const result = await Effect.runPromise(disputeApi.getPaymentDisputeSummaries());

      expect(mockClient.get).toHaveBeenCalledWith('/sell/fulfillment/v1/payment_dispute_summary');
      expect(result).toEqual(mockSummaries);
    });

    it('maps camelCase filters to eBay query names', async () => {
      const mockSummaries = {
        paymentDisputeSummaries: [],
        total: 0,
      };

      vi.mocked(mockClient.get).mockResolvedValue(mockSummaries);

      const result = await Effect.runPromise(
        disputeApi.getPaymentDisputeSummaries({
          orderId: 'ORDER-123',
          buyerUsername: 'buyer-one',
          openDateFrom: '2025-01-01T00:00:00.000Z',
          openDateTo: '2025-01-31T00:00:00.000Z',
          paymentDisputeStatus: 'OPEN',
          limit: 10,
          offset: 0,
        }),
      );

      expect(mockClient.get).toHaveBeenCalledWith('/sell/fulfillment/v1/payment_dispute_summary', {
        order_id: 'ORDER-123',
        buyer_username: 'buyer-one',
        open_date_from: '2025-01-01T00:00:00.000Z',
        open_date_to: '2025-01-31T00:00:00.000Z',
        payment_dispute_status: 'OPEN',
        limit: '10',
        offset: '0',
      });
      expect(result).toEqual(mockSummaries);
    });
  });

  describe('contestPaymentDispute', () => {
    it('contests a payment dispute without body', async () => {
      vi.mocked(mockClient.post).mockResolvedValue(undefined);

      await Effect.runPromise(
        disputeApi.contestPaymentDispute({ paymentDisputeId: 'DISPUTE-123' }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/payment_dispute/DISPUTE-123/contest',
      );
    });

    it('contests a payment dispute with a generated request body', async () => {
      vi.mocked(mockClient.post).mockResolvedValue(undefined);

      const body = {
        returnAddress: {
          addressLine1: '123 Main St',
          city: 'San Francisco',
          stateOrProvince: 'CA',
          postalCode: '94105',
          country: 'US',
        },
        revision: 2,
      };

      await Effect.runPromise(
        disputeApi.contestPaymentDispute({ paymentDisputeId: 'DISPUTE-123', body }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/payment_dispute/DISPUTE-123/contest',
        body,
      );
    });
  });

  describe('acceptPaymentDispute', () => {
    it('accepts a payment dispute without body', async () => {
      vi.mocked(mockClient.post).mockResolvedValue(undefined);

      await Effect.runPromise(disputeApi.acceptPaymentDispute({ paymentDisputeId: 'DISPUTE-123' }));

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/payment_dispute/DISPUTE-123/accept',
      );
    });

    it('accepts a payment dispute with a generated request body', async () => {
      vi.mocked(mockClient.post).mockResolvedValue(undefined);

      const body = {
        returnAddress: {
          addressLine1: '123 Main St',
          city: 'San Francisco',
          stateOrProvince: 'CA',
          postalCode: '94105',
          country: 'US',
        },
        revision: 2,
      };

      await Effect.runPromise(
        disputeApi.acceptPaymentDispute({ paymentDisputeId: 'DISPUTE-123', body }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/payment_dispute/DISPUTE-123/accept',
        body,
      );
    });
  });

  describe('uploadEvidenceFile', () => {
    it('uploads an evidence file', async () => {
      const mockFileEvidence = {
        fileId: 'FILE-456',
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockFileEvidence);

      const body = new ArrayBuffer(8);
      const result = await Effect.runPromise(
        disputeApi.uploadEvidenceFile({ paymentDisputeId: 'DISPUTE-123', body }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/payment_dispute/DISPUTE-123/upload_evidence_file',
        body,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      expect(result).toEqual(mockFileEvidence);
    });
  });

  describe('addEvidence', () => {
    it('adds evidence to a dispute', async () => {
      const mockResponse = {
        evidenceId: 'EVIDENCE-123',
      };

      vi.mocked(mockClient.post).mockResolvedValue(mockResponse);

      const body = {
        evidenceType: 'PROOF_OF_DELIVERY',
        files: [{ fileId: 'FILE-456' }],
        lineItems: [{ itemId: 'ITEM-789', quantity: 1 }],
      };

      const result = await Effect.runPromise(
        disputeApi.addEvidence({ paymentDisputeId: 'DISPUTE-123', body }),
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/payment_dispute/DISPUTE-123/add_evidence',
        body,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateEvidence', () => {
    it('updates evidence for a dispute', async () => {
      vi.mocked(mockClient.post).mockResolvedValue(undefined);

      const body = {
        evidenceId: 'EVIDENCE-123',
        lineItems: [{ itemId: 'ITEM-789', quantity: 2 }],
      };

      await Effect.runPromise(disputeApi.updateEvidence({ paymentDisputeId: 'DISPUTE-123', body }));

      expect(mockClient.post).toHaveBeenCalledWith(
        '/sell/fulfillment/v1/payment_dispute/DISPUTE-123/update_evidence',
        body,
      );
    });
  });
});
