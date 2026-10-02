import type { operations } from '@/types/sell-apps/marketing-and-promotions/sellMarketingV1Oas3.js';

export const MARKETING_BASE_PATH = '/sell/marketing/v1';

type JsonContent<Response> = Response extends { content: { 'application/json': infer Body } }
  ? Body
  : void;

export type MarketingOperationResponse<Operation extends keyof operations> =
  200 extends keyof operations[Operation]['responses']
    ? JsonContent<operations[Operation]['responses'][200]>
    : 201 extends keyof operations[Operation]['responses']
      ? JsonContent<operations[Operation]['responses'][201]>
      : 202 extends keyof operations[Operation]['responses']
        ? JsonContent<operations[Operation]['responses'][202]>
        : 204 extends keyof operations[Operation]['responses']
          ? JsonContent<operations[Operation]['responses'][204]>
          : void;
