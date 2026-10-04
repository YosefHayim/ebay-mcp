/**
 * Scope Helper - Manages eBay OAuth scopes
 */

import chalk from 'chalk';
import { getDefaultScopes } from '@/config/environment.js';
import { writeCliLine } from '@/utils/cliOutput.js';

/**
 * Group of related OAuth scopes shown in setup guidance.
 */
export interface ScopeCategory {
  /** Human category name shown in setup guidance. */
  name: string;
  /** Short explanation of what the category enables. */
  description: string;
  /** OAuth scopes in this category. */
  scopes: string[];
  /** Whether setup treats the category as recommended baseline access. */
  required: boolean;
}

/** Result of comparing token scopes to recommended or required scopes. */
export interface ScopeCoverageVerification {
  /** True when every required scope is present on the token. */
  hasAllRequired: boolean;
  /** Required scopes missing from the token. */
  missingScopes: string[];
  /** Token scopes not present in the required set. */
  extraScopes: string[];
}

/**
 * Get all available scope categories
 *
 * @returns Scope categories shown by setup guidance.
 *
 * @example
 * ```ts
 * const categories = getScopeCategories();
 * ```
 */
export const getScopeCategories = (): ScopeCategory[] => [
  {
    name: 'Inventory Management',
    description: 'Create, read, update, and delete inventory items',
    scopes: ['https://api.ebay.com/oauth/api_scope/sell.inventory'],
    required: true,
  },
  {
    name: 'Order Fulfillment',
    description: 'View and manage orders, shipping, and fulfillment',
    scopes: [
      'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    ],
    required: true,
  },
  {
    name: 'Account Management',
    description: 'Manage account settings, policies, and preferences',
    scopes: [
      'https://api.ebay.com/oauth/api_scope/sell.account',
      'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
    ],
    required: true,
  },
  {
    name: 'Analytics & Reports',
    description: 'Access sales analytics and performance reports',
    scopes: [
      'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
      'https://api.ebay.com/oauth/api_scope/sell.marketplace.insights.readonly',
    ],
    required: false,
  },
  {
    name: 'Marketing & Promotions',
    description: 'Create and manage marketing campaigns and promotions',
    scopes: [
      'https://api.ebay.com/oauth/api_scope/sell.marketing',
      'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
    ],
    required: false,
  },
  {
    name: 'Finance & Payments',
    description: 'Access financial data and payment information',
    scopes: ['https://api.ebay.com/oauth/api_scope/sell.finances'],
    required: false,
  },
  {
    name: 'Reputation & Feedback',
    description: 'Manage seller reputation and customer feedback',
    scopes: ['https://api.ebay.com/oauth/api_scope/sell.reputation'],
    required: false,
  },
  {
    name: 'Commerce Services',
    description: 'Identity verification, notifications, and messaging',
    scopes: [
      'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly',
      'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription',
      'https://api.ebay.com/oauth/api_scope/sell.stores',
    ],
    required: false,
  },
];

/**
 * Get recommended scopes for the environment
 *
 * @param environment - eBay environment whose recommended scopes should be returned.
 * @returns Recommended OAuth scopes for that environment.
 *
 * @example
 * ```ts
 * const scopes = getRecommendedScopes('sandbox');
 * ```
 */
export const getRecommendedScopes = (environment: 'sandbox' | 'production'): string[] =>
  getDefaultScopes(environment);

/**
 * Display scope selection interface
 *
 * @returns Nothing; writes scope category guidance to stdout.
 *
 * @example
 * ```ts
 * displayScopeCategories();
 * ```
 */
export const displayScopeCategories = (): void => {
  writeCliLine(chalk.bold.cyan('\n📋 Available OAuth Scopes\n'));

  const categories = getScopeCategories();

  for (const category of categories) {
    const badge = category.required ? chalk.green('[Required]') : chalk.gray('[Optional]');
    writeCliLine(`${badge} ${chalk.bold.white(category.name)}`);
    writeCliLine(`  ${chalk.gray(category.description)}`);
    writeCliLine(chalk.gray(`  Scopes: ${category.scopes.length}`));
    writeCliLine('');
  }
};

/**
 * Verify if token has required scopes
 *
 * @param tokenScopes - OAuth scopes present on the token.
 * @param requiredScopes - Scopes expected for the workflow or environment.
 * @returns Scope coverage result with missing and extra scopes.
 *
 * @example
 * ```ts
 * const coverage = verifyScopesCoverage(tokenScopes, requiredScopes);
 * ```
 */
export const verifyScopesCoverage = (
  tokenScopes: string[],
  requiredScopes: string[],
): ScopeCoverageVerification => {
  const tokenScopeSet = new Set(tokenScopes);
  const requiredScopeSet = new Set(requiredScopes);

  const missingScopes = requiredScopes.filter((scope) => !tokenScopeSet.has(scope));
  const extraScopes = tokenScopes.filter((scope) => !requiredScopeSet.has(scope));

  return {
    hasAllRequired: missingScopes.length === 0,
    missingScopes,
    extraScopes,
  };
};

/**
 * Display scope verification results
 *
 * @param tokenScopes - OAuth scopes present on the token.
 * @param environment - eBay environment whose recommended scopes should be checked.
 * @returns Nothing; writes verification guidance to stdout.
 *
 * @example
 * ```ts
 * displayScopeVerification(tokenScopes, 'production');
 * ```
 */
export const displayScopeVerification = (
  tokenScopes: string[],
  environment: 'sandbox' | 'production',
): void => {
  writeCliLine(chalk.bold.cyan('\n🔍 Scope Verification\n'));

  const recommendedScopes = getRecommendedScopes(environment);
  const verification = verifyScopesCoverage(tokenScopes, recommendedScopes);

  writeCliLine(chalk.bold.white('Token Scopes:'));
  writeCliLine(chalk.gray(`  Total: ${tokenScopes.length}\n`));

  if (verification.hasAllRequired) {
    writeCliLine(chalk.green('✓ Token has all recommended scopes\n'));
  } else {
    writeCliLine(chalk.yellow('⚠️  Token is missing some recommended scopes\n'));

    writeCliLine(chalk.bold.white('Missing Scopes:'));
    for (const scope of verification.missingScopes) {
      writeCliLine(chalk.yellow(`  • ${scope}`));
    }
    writeCliLine('');
  }

  if (verification.extraScopes.length > 0) {
    writeCliLine(chalk.gray('Additional Scopes (not in recommended list):'));
    for (const scope of verification.extraScopes) {
      writeCliLine(chalk.gray(`  • ${scope}`));
    }
    writeCliLine('');
  }

  // Display scope categories and their status
  const categories = getScopeCategories();
  const tokenScopeSet = new Set(tokenScopes);

  writeCliLine(chalk.bold.white('Coverage by Category:\n'));

  for (const category of categories) {
    const hasAllCategoryScopes = category.scopes.every((scope) => tokenScopeSet.has(scope));
    const hasSomeCategoryScopes = category.scopes.some((scope) => tokenScopeSet.has(scope));

    let status: string;
    if (hasAllCategoryScopes) {
      status = chalk.green('✓ Full');
    } else if (hasSomeCategoryScopes) {
      status = chalk.yellow('◐ Partial');
    } else {
      status = chalk.red('✗ None');
    }

    const badge = category.required ? chalk.red('[Required]') : chalk.gray('[Optional]');
    writeCliLine(`${status} ${badge} ${category.name}`);
  }

  writeCliLine('');
};

/**
 * Get scope description for a full OAuth scope URL.
 *
 * @param scope - Full eBay OAuth scope URL.
 * @returns Human-readable scope description, or a missing-description label.
 *
 * @example
 * ```ts
 * const description = describeScopeFromOAuthUrl(scope);
 * ```
 */
export const describeScopeFromOAuthUrl = (scope: string): string => {
  const descriptions: Record<string, string> = {
    'https://api.ebay.com/oauth/api_scope/sell.inventory': 'Manage inventory items and offers',
    'https://api.ebay.com/oauth/api_scope/sell.fulfillment': 'Manage orders and shipping',
    'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly': 'View orders and shipping',
    'https://api.ebay.com/oauth/api_scope/sell.account': 'Manage account settings',
    'https://api.ebay.com/oauth/api_scope/sell.account.readonly': 'View account settings',
    'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly': 'View analytics and reports',
    'https://api.ebay.com/oauth/api_scope/sell.marketing': 'Manage marketing campaigns',
    'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly': 'View marketing campaigns',
    'https://api.ebay.com/oauth/api_scope/sell.finances': 'View financial data',
    'https://api.ebay.com/oauth/api_scope/sell.reputation': 'Manage seller reputation',
    'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly': 'View user identity',
    'https://api.ebay.com/oauth/api_scope/sell.stores': 'Manage eBay Stores',
    'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription':
      'Manage notification subscriptions',
    'https://api.ebay.com/oauth/api_scope/sell.marketplace.insights.readonly':
      'View marketplace insights',
  };

  return descriptions[scope] || 'No description available';
};

/**
 * Format scopes for display
 *
 * @param scopes - OAuth scopes to format.
 * @returns Bulleted scope list for CLI display.
 *
 * @example
 * ```ts
 * const text = formatScopesForDisplay(scopes);
 * ```
 */
export const formatScopesForDisplay = (scopes: string[]): string =>
  scopes
    .map((scope) => {
      const shortName = scope.split('/').pop() || scope;
      return `  • ${shortName}`;
    })
    .join('\n');

/**
 * Get all scopes as a space-separated string
 *
 * @param environment - eBay environment whose scopes should be returned.
 * @returns Recommended scopes joined for OAuth URL parameters.
 *
 * @example
 * ```ts
 * const scopeParam = getAllScopesString('sandbox');
 * ```
 */
export const getAllScopesString = (environment: 'sandbox' | 'production'): string =>
  getRecommendedScopes(environment).join(' ');

/**
 * Parse scope string to array
 *
 * @param scopeString - Space-delimited OAuth scope string.
 * @returns Non-empty scope tokens.
 *
 * @example
 * ```ts
 * const scopes = parseScopeString(scopeParam);
 * ```
 */
export const parseScopeString = (scopeString: string): string[] =>
  scopeString
    .split(/\s+/)
    .map((scope) => scope.trim())
    .filter((scope) => scope.length > 0);
