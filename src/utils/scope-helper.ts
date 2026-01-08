/**
 * Scope Helper - Manages eBay OAuth scopes
 */

import chalk from 'chalk';
import { getDefaultScopes } from '../config/environment.js';

export interface ScopeCategory {
  name: string;
  description: string;
  scopes: string[];
  required: boolean;
}

/**
 * Get all available scope categories
 */
export function getScopeCategories(): ScopeCategory[] {
  return [
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
}

/**
 * Get recommended scopes for the environment
 */
export function getRecommendedScopes(environment: 'sandbox' | 'production'): string[] {
  return getDefaultScopes(environment);
}

/**
 * Display scope selection interface
 */
export function displayScopeCategories(): void {
  console.log(chalk.bold.cyan('\n📋 Available OAuth Scopes\n'));

  const categories = getScopeCategories();

  for (const category of categories) {
    const badge = category.required ? chalk.green('[Required]') : chalk.gray('[Optional]');
    console.log(`${badge} ${chalk.bold.white(category.name)}`);
    console.log(`  ${chalk.gray(category.description)}`);
    console.log(chalk.gray(`  Scopes: ${category.scopes.length}`));
    console.log('');
  }
}

/**
 * Verify if token has required scopes
 */
export function verifyScopesCoverage(
  tokenScopes: string[],
  requiredScopes: string[]
): {
  hasAllRequired: boolean;
  missingScopes: string[];
  extraScopes: string[];
} {
  const tokenScopeSet = new Set(tokenScopes);
  const requiredScopeSet = new Set(requiredScopes);

  const missingScopes = requiredScopes.filter((scope) => !tokenScopeSet.has(scope));
  const extraScopes = tokenScopes.filter((scope) => !requiredScopeSet.has(scope));

  return {
    hasAllRequired: missingScopes.length === 0,
    missingScopes,
    extraScopes,
  };
}

/**
 * Display scope verification results
 */
export function displayScopeVerification(
  tokenScopes: string[],
  environment: 'sandbox' | 'production'
): void {
  console.log(chalk.bold.cyan('\n🔍 Scope Verification\n'));

  const recommendedScopes = getRecommendedScopes(environment);
  const verification = verifyScopesCoverage(tokenScopes, recommendedScopes);

  console.log(chalk.bold.white('Token Scopes:'));
  console.log(chalk.gray(`  Total: ${tokenScopes.length}\n`));

  if (verification.hasAllRequired) {
    console.log(chalk.green('✓ Token has all recommended scopes\n'));
  } else {
    console.log(chalk.yellow('⚠️  Token is missing some recommended scopes\n'));

    console.log(chalk.bold.white('Missing Scopes:'));
    for (const scope of verification.missingScopes) {
      console.log(chalk.yellow(`  • ${scope}`));
    }
    console.log('');
  }

  if (verification.extraScopes.length > 0) {
    console.log(chalk.gray('Additional Scopes (not in recommended list):'));
    for (const scope of verification.extraScopes) {
      console.log(chalk.gray(`  • ${scope}`));
    }
    console.log('');
  }

  // Display scope categories and their status
  const categories = getScopeCategories();
  const tokenScopeSet = new Set(tokenScopes);

  console.log(chalk.bold.white('Coverage by Category:\n'));

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
    console.log(`${status} ${badge} ${category.name}`);
  }

  console.log('');
}

/**
 * Get scope description
 */
export function getScopeDescription(scope: string): string {
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
}

/**
 * Format scopes for display
 */
export function formatScopesForDisplay(scopes: string[]): string {
  return scopes
    .map((scope) => {
      const shortName = scope.split('/').pop() || scope;
      return `  • ${shortName}`;
    })
    .join('\n');
}

/**
 * Get all scopes as a space-separated string
 */
export function getAllScopesString(environment: 'sandbox' | 'production'): string {
  return getRecommendedScopes(environment).join(' ');
}

/**
 * Parse scope string to array
 */
export function parseScopeString(scopeString: string): string[] {
  return scopeString
    .split(/\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
