/**
 * Utility functions for working with eBay OAuth scopes
 */

import {
  getDefaultScopes,
  getKnownScopes,
  POST_ORDER_DOCUMENT_SCOPE,
  validateScopes,
} from '@/config/environment.js';

/**
 * Result of scope validation
 */
export interface ScopeValidationResult {
  /** True when every provided scope is valid for the environment. */
  isValid: boolean;
  /** Warnings emitted by environment scope validation. */
  warnings: string[];
  /** Input scopes accepted by the selected environment. */
  validScopes: string[];
  /** Input scopes rejected by the selected environment. */
  invalidScopes: string[];
}

/**
 * Comparison between two sets of scopes
 */
export interface ScopeDifference {
  /** Scopes available in both production and sandbox. */
  inBothEnvironments: string[];
  /** Scopes available only in production. */
  productionOnly: string[];
  /** Scopes available only in sandbox. */
  sandboxOnly: string[];
}

/**
 * Scope requirement information for a tool
 */
export interface ScopeRequirement {
  /** Scopes that can satisfy the tool requirement. */
  requiredScopes: string[];
  /** Helpful extra scopes for related workflow dependencies. */
  optionalScopes?: string[];
  /** Smallest scope that satisfies the tool requirement. */
  minimumScope: string;
  /** Human explanation of why the tool needs this scope. */
  description: string;
}

/**
 * Validate scopes and provide detailed validation results
 *
 * @param scopes - OAuth scopes to validate.
 * @param environment - eBay environment whose scope catalogue should be used.
 * @returns Validity flag plus accepted and rejected scope lists.
 *
 * @example
 * ```ts
 * const result = validateScopesDetailed(scopes, 'production');
 * ```
 */
export const validateScopesDetailed = (
  scopes: string[],
  environment: 'production' | 'sandbox',
): ScopeValidationResult => {
  const validation = validateScopes(scopes, environment);
  const validScopeSet = new Set(getKnownScopes(environment));

  const validScopes: string[] = [];
  const invalidScopes: string[] = [];

  scopes.forEach((scope) => {
    if (validScopeSet.has(scope)) {
      validScopes.push(scope);
    } else {
      invalidScopes.push(scope);
    }
  });

  return {
    isValid: invalidScopes.length === 0,
    warnings: validation.warnings,
    validScopes,
    invalidScopes,
  };
};

/**
 * Get required scopes for a specific tool
 * This maps tool names to their required eBay OAuth scopes
 *
 * @param toolName - MCP tool name to look up.
 * @returns Scope requirement for the tool, or null when unknown.
 *
 * @example
 * ```ts
 * const requirement = getRequiredScopesForTool('ebay_get_inventory_items');
 * ```
 */
export const getRequiredScopesForTool = (toolName: string): ScopeRequirement | null => {
  const postOrderTools = [
    'ebay_upload_post_order_document',
    'ebay_download_post_order_document',
    'ebay_remove_post_order_document',
  ];
  const documentTools = [
    'ebay_create_image_from_url',
    'ebay_create_document',
    'ebay_create_document_from_url',
    'ebay_get_document',
    'ebay_upload_document',
  ];
  if (postOrderTools.includes(toolName) || documentTools.includes(toolName)) {
    const scope = postOrderTools.includes(toolName)
      ? POST_ORDER_DOCUMENT_SCOPE
      : 'https://api.ebay.com/oauth/api_scope/sell.inventory';
    return {
      requiredScopes: [scope],
      minimumScope: scope,
      description:
        'Requires user consent for the Media API scope; post-order access also requires an eligible keyset',
    };
  }
  // Scope requirements mapping based on eBay API documentation
  const scopeMap: Record<string, ScopeRequirement> = {
    // Inventory Management Tools
    ebay_get_inventory_items: {
      requiredScopes: [
        'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
      ],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
      description: 'Requires read access to inventory',
    },
    ebay_get_inventory_item: {
      requiredScopes: [
        'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
      ],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
      description: 'Requires read access to inventory',
    },
    ebay_create_or_replace_inventory_item: {
      requiredScopes: ['https://api.ebay.com/oauth/api_scope/sell.inventory'],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.inventory',
      description: 'Requires write access to inventory',
    },
    ebay_create_offer: {
      requiredScopes: ['https://api.ebay.com/oauth/api_scope/sell.inventory'],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.inventory',
      description: 'Requires write access to inventory',
    },
    ebay_publish_offer: {
      requiredScopes: ['https://api.ebay.com/oauth/api_scope/sell.inventory'],
      optionalScopes: [
        'https://api.ebay.com/oauth/api_scope/sell.account',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      ],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.inventory',
      description: 'Requires write access to inventory; policies must exist (sell.account)',
    },

    // Order Management Tools
    ebay_get_orders: {
      requiredScopes: [
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      ],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
      description: 'Requires read access to order fulfillment',
    },
    ebay_get_order: {
      requiredScopes: [
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      ],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
      description: 'Requires read access to order fulfillment',
    },
    ebay_create_shipping_fulfillment: {
      requiredScopes: ['https://api.ebay.com/oauth/api_scope/sell.fulfillment'],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      description: 'Requires write access to order fulfillment',
    },
    ebay_issue_refund: {
      requiredScopes: ['https://api.ebay.com/oauth/api_scope/sell.fulfillment'],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      description: 'Requires write access to order fulfillment',
    },

    // Account Management Tools
    ebay_get_fulfillment_policies: {
      requiredScopes: [
        'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.account',
      ],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
      description: 'Requires read access to account settings',
    },
    ebay_create_fulfillment_policy: {
      requiredScopes: ['https://api.ebay.com/oauth/api_scope/sell.account'],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.account',
      description: 'Requires write access to account settings',
    },
    ebay_update_fulfillment_policy: {
      requiredScopes: ['https://api.ebay.com/oauth/api_scope/sell.account'],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.account',
      description: 'Requires write access to account settings',
    },

    // Marketing Tools
    ebay_get_campaigns: {
      requiredScopes: [
        'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.marketing',
      ],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
      description: 'Requires read access to marketing campaigns',
    },
    ebay_create_campaign: {
      requiredScopes: ['https://api.ebay.com/oauth/api_scope/sell.marketing'],
      optionalScopes: ['https://api.ebay.com/oauth/api_scope/sell.inventory.readonly'],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.marketing',
      description: 'Requires write access to marketing campaigns',
    },

    // Analytics Tools
    ebay_get_traffic_report: {
      requiredScopes: ['https://api.ebay.com/oauth/api_scope/sell.analytics.readonly'],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
      description: 'Requires read access to analytics',
    },

    // Messaging Tools
    ebay_send_message: {
      requiredScopes: ['https://api.ebay.com/oauth/api_scope/commerce.message'],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/commerce.message',
      description: 'Requires access to messaging (production only)',
    },

    // Feedback Tools
    ebay_leave_feedback_for_buyer: {
      requiredScopes: ['https://api.ebay.com/oauth/api_scope/commerce.feedback'],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/commerce.feedback',
      description: 'Requires write access to feedback',
    },

    // Identity Tools
    ebay_get_user: {
      requiredScopes: ['https://api.ebay.com/oauth/api_scope/commerce.identity.readonly'],
      minimumScope: 'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly',
      description: 'Requires read access to user identity',
    },
  };

  return scopeMap[toolName] || null;
};

/**
 * Check if a token has all required scopes for a tool
 *
 * @param tokenScopes - OAuth scopes present on the token.
 * @param requiredScopes - Alternative scopes that can satisfy the requirement.
 * @returns True when the token has at least one required scope.
 *
 * @example
 * ```ts
 * const allowed = hasRequiredScopes(tokenScopes, requirement.requiredScopes);
 * ```
 */
export const hasRequiredScopes = (tokenScopes: string[], requiredScopes: string[]): boolean => {
  const tokenScopeSet = new Set(tokenScopes);

  // Check if at least one of the required scopes is present
  // (Some tools accept either readonly or write scope)
  return requiredScopes.some((scope) => tokenScopeSet.has(scope));
};

/**
 * Get the differences between production and sandbox scopes
 *
 * @returns Scopes grouped by production/sandbox availability.
 *
 * @example
 * ```ts
 * const diff = getScopeDifferences();
 * ```
 */
export const getScopeDifferences = (): ScopeDifference => {
  const productionScopes = getDefaultScopes('production');
  const sandboxScopes = getDefaultScopes('sandbox');

  const productionSet = new Set(productionScopes);
  const sandboxSet = new Set(sandboxScopes);

  const inBothEnvironments: string[] = [];
  const productionOnly: string[] = [];
  const sandboxOnly: string[] = [];

  // Find scopes in both
  productionScopes.forEach((scope) => {
    if (sandboxSet.has(scope)) {
      inBothEnvironments.push(scope);
    } else {
      productionOnly.push(scope);
    }
  });

  // Find sandbox-only scopes
  sandboxScopes.forEach((scope) => {
    if (!productionSet.has(scope)) {
      sandboxOnly.push(scope);
    }
  });

  return {
    inBothEnvironments,
    productionOnly,
    sandboxOnly,
  };
};

/**
 * Format scope for display (remove common prefix for readability)
 *
 * @param scope - OAuth scope URL or custom scope string.
 * @returns Scope without the common eBay OAuth URL prefix when present.
 *
 * @example
 * ```ts
 * const label = formatScopeForDisplay('https://api.ebay.com/oauth/api_scope/sell.inventory');
 * ```
 */
export const formatScopeForDisplay = (scope: string): string => {
  const prefix = 'https://api.ebay.com/oauth/';
  if (scope.startsWith(prefix)) {
    return scope.substring(prefix.length);
  }
  return scope;
};

/**
 * Group scopes by API category
 *
 * @param scopes - OAuth scopes to group.
 * @returns Scopes grouped into sell, buy, commerce, and other buckets.
 *
 * @example
 * ```ts
 * const grouped = groupScopesByCategory(scopes);
 * ```
 */
export const groupScopesByCategory = (scopes: string[]): Record<string, string[]> => {
  const categories: Record<string, string[]> = {
    sell: [],
    buy: [],
    commerce: [],
    other: [],
  };

  scopes.forEach((scope) => {
    if (scope.includes('/sell.')) {
      categories.sell.push(scope);
    } else if (scope.includes('/buy.')) {
      categories.buy.push(scope);
    } else if (scope.includes('/commerce.')) {
      categories.commerce.push(scope);
    } else {
      categories.other.push(scope);
    }
  });

  return categories;
};

/**
 * Check if a scope is readonly
 *
 * @param scope - OAuth scope to inspect.
 * @returns True when the scope name includes `.readonly`.
 *
 * @example
 * ```ts
 * const readonly = isScopeReadonly(scope);
 * ```
 */
export const isScopeReadonly = (scope: string): boolean => scope.includes('.readonly');

/**
 * Get the write version of a readonly scope
 *
 * @param readonlyScope - Readonly OAuth scope to convert.
 * @returns Write scope equivalent, or null when the input is already write-capable.
 *
 * @example
 * ```ts
 * const writeScope = getWriteScope('https://api.ebay.com/oauth/api_scope/sell.inventory.readonly');
 * ```
 */
export const getWriteScope = (readonlyScope: string): string | null => {
  if (!isScopeReadonly(readonlyScope)) {
    return null; // Already a write scope
  }

  return readonlyScope.replace('.readonly', '');
};

/**
 * Get the readonly version of a write scope
 *
 * @param writeScope - Write-capable OAuth scope to convert.
 * @returns Readonly scope equivalent when eBay exposes one, otherwise null.
 *
 * @example
 * ```ts
 * const readonlyScope = getReadonlyScope('https://api.ebay.com/oauth/api_scope/sell.inventory');
 * ```
 */
export const getReadonlyScope = (writeScope: string): string | null => {
  if (isScopeReadonly(writeScope)) {
    return null; // Already a readonly scope
  }

  // Not all write scopes have readonly equivalents
  const hasReadonly = [
    'sell.inventory',
    'sell.fulfillment',
    'sell.account',
    'sell.marketing',
    'sell.analytics',
    'sell.reputation',
    'sell.stores',
    'commerce.identity',
    'commerce.notification.subscription',
    'commerce.feedback',
  ];

  const scopeType = writeScope.split('/').pop();
  if (scopeType && hasReadonly.some((s) => scopeType.includes(s))) {
    return `${writeScope}.readonly`;
  }

  return null;
};

/**
 * Get scope description from scope name
 *
 * @param scope - OAuth scope URL or scope type string.
 * @returns Human description for the scope.
 *
 * @example
 * ```ts
 * const description = getScopeTypeDescription('https://api.ebay.com/oauth/api_scope/sell.inventory');
 * ```
 */
export const getScopeTypeDescription = (scope: string): string => {
  // Extract the last part of the scope
  const parts = scope.split('/');
  const scopeType = parts[parts.length - 1];

  const descriptions: Record<string, string> = {
    api_scope: 'View public data from eBay',
    'commerce.post_order.document': 'Upload, download and remove post-order documents',
    'sell.inventory': 'View and manage your inventory and offers',
    'sell.inventory.readonly': 'View your inventory and offers',
    'sell.fulfillment': 'View and manage your order fulfillments',
    'sell.fulfillment.readonly': 'View your order fulfillments',
    'sell.account': 'View and manage your account settings',
    'sell.account.readonly': 'View your account settings',
    'sell.marketing': 'View and manage your eBay marketing activities',
    'sell.marketing.readonly': 'View your eBay marketing activities',
    'sell.analytics.readonly': 'View your selling analytics data',
    'sell.finances': 'View and manage your payment and order information',
    'sell.payment.dispute': 'View and manage disputes and related details',
    'commerce.identity.readonly': 'View basic user information from eBay account',
    'sell.reputation': 'View and manage your reputation data',
    'sell.reputation.readonly': 'View your reputation data',
    'commerce.notification.subscription': 'View and manage event notification subscriptions',
    'commerce.notification.subscription.readonly': 'View event notification subscriptions',
    'commerce.feedback': 'View and manage feedback',
    'commerce.feedback.readonly': 'View feedback',
    'commerce.message': 'Send and receive messages with buyers/sellers',
    'sell.stores': 'View and manage eBay stores',
    'sell.stores.readonly': 'View eBay stores',
  };

  return descriptions[scopeType] || `Access to ${scopeType}`;
};
