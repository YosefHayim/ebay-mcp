import { MarketingApi } from '@/api/marketing-and-promotions/marketing.js';
import type { EbayApiClient } from '@/api/client/ebayApiClient.js';
import { Effect } from 'effect';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('MarketingApi', () => {
  let marketingApi: MarketingApi;
  let mockClient: EbayApiClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as EbayApiClient;

    marketingApi = new MarketingApi(mockClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('gets campaigns with endpoint-owned query params', async () => {
    const response = { campaigns: [{ campaignId: 'campaign-1' }] };
    vi.mocked(mockClient.get).mockResolvedValue(response);

    const result = await Effect.runPromise(
      marketingApi.getCampaigns({
        campaignStatus: 'RUNNING',
        campaignTargetingTypes: 'AUTO',
        limit: 10,
        offset: 0,
      }),
    );

    expect(mockClient.get).toHaveBeenCalledWith('/sell/marketing/v1/ad_campaign', {
      campaign_status: 'RUNNING',
      campaign_targeting_types: 'AUTO',
      limit: 10,
      offset: 0,
    });
    expect(result).toBe(response);
  });

  it('omits query params when every optional value is unset', async () => {
    const response = { campaigns: [] };
    vi.mocked(mockClient.get).mockResolvedValue(response);

    await Effect.runPromise(marketingApi.getCampaigns());

    expect(mockClient.get).toHaveBeenCalledWith('/sell/marketing/v1/ad_campaign');
  });

  it('creates a campaign from the request body without rebuilding it', async () => {
    const request = {
      campaignName: 'Summer campaign',
      marketplaceId: 'EBAY_US',
      startDate: '2026-07-06T00:00:00Z',
    };
    const response = {};
    vi.mocked(mockClient.post).mockResolvedValue(response);

    const result = await Effect.runPromise(marketingApi.createCampaign({ request }));

    expect(mockClient.post).toHaveBeenCalledWith('/sell/marketing/v1/ad_campaign', request);
    expect(result).toBe(response);
  });

  it('uses the current createAdByListingId operation name and path', async () => {
    const request = { listingId: 'listing-1', bidPercentage: '5.0' };
    const response = {};
    vi.mocked(mockClient.post).mockResolvedValue(response);

    await Effect.runPromise(
      marketingApi.createAdByListingId({
        campaignId: 'campaign-1',
        request,
      }),
    );

    expect(mockClient.post).toHaveBeenCalledWith(
      '/sell/marketing/v1/ad_campaign/campaign-1/ad',
      request,
    );
  });

  it('updates campaign identification through the OpenAPI POST endpoint', async () => {
    const request = { campaignName: 'Renamed campaign' };
    vi.mocked(mockClient.post).mockResolvedValue(undefined);

    await Effect.runPromise(
      marketingApi.updateCampaignIdentification({
        campaignId: 'campaign-1',
        request,
      }),
    );

    expect(mockClient.post).toHaveBeenCalledWith(
      '/sell/marketing/v1/ad_campaign/campaign-1/update_campaign_identification',
      request,
    );
    expect(mockClient.put).not.toHaveBeenCalled();
  });

  it('sends marketplace headers for header-owned endpoints', async () => {
    const response = { suggestedBudget: [] };
    vi.mocked(mockClient.get).mockResolvedValue(response);

    await Effect.runPromise(marketingApi.suggestBudget({ marketplaceId: 'EBAY_US' }));

    expect(mockClient.get).toHaveBeenCalledWith(
      '/sell/marketing/v1/ad_campaign/suggest_budget',
      undefined,
      {
        headers: { 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' },
      },
    );
  });

  it('gets promotions with the required marketplace query param', async () => {
    const response = { promotions: [] };
    vi.mocked(mockClient.get).mockResolvedValue(response);

    await Effect.runPromise(
      marketingApi.getPromotions({
        marketplaceId: 'EBAY_US',
        limit: 25,
        promotionStatus: 'RUNNING',
        promotionType: 'ORDER_DISCOUNT',
      }),
    );

    expect(mockClient.get).toHaveBeenCalledWith('/sell/marketing/v1/promotion', {
      limit: 25,
      marketplace_id: 'EBAY_US',
      promotion_status: 'RUNNING',
      promotion_type: 'ORDER_DISCOUNT',
    });
  });

  it('uses the current getReportMetadata operation name', async () => {
    const response = { reportMetadata: [] };
    vi.mocked(mockClient.get).mockResolvedValue(response);

    const result = await Effect.runPromise(
      marketingApi.getReportMetadata({
        fundingModel: 'COST_PER_CLICK',
        channel: 'ON_SITE',
      }),
    );

    expect(mockClient.get).toHaveBeenCalledWith('/sell/marketing/v1/ad_report_metadata', {
      funding_model: 'COST_PER_CLICK',
      channel: 'ON_SITE',
    });
    expect(result).toBe(response);
  });

  it('gets email audiences with the required emailCampaignType query param', async () => {
    const response = { audiences: [] };
    vi.mocked(mockClient.get).mockResolvedValue(response);

    await Effect.runPromise(
      marketingApi.getAudiences({
        emailCampaignType: 'NEWSLETTER',
        limit: 10,
      }),
    );

    expect(mockClient.get).toHaveBeenCalledWith('/sell/marketing/v1/email_campaign/audience', {
      emailCampaignType: 'NEWSLETTER',
      limit: 10,
    });
  });

  it('returns a tagged API error when the request adapter fails', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new Error('network down'));

    const error = await Effect.runPromise(
      Effect.flip(marketingApi.getCampaign({ campaignId: '1' })),
    );

    expect(error._tag).toBe('EbayApiError');
    expect(error.method).toBe('GET');
    expect(error.path).toBe('/sell/marketing/v1/ad_campaign/1');
  });
});
