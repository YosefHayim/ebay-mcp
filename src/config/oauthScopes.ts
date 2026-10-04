/**
 * OAuth scopes eBay grants to seller apps, copied from the developer portal scope tables.
 * Each comment is eBay's description of the scope below it.
 */

/** Scopes available to apps in the eBay production environment. */
export const productionScopes: readonly string[] = [
  // View public data from eBay
  'https://api.ebay.com/oauth/api_scope',
  // View your eBay marketing activities, such as ad campaigns and listing promotions
  'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
  // View and manage your eBay marketing activities, such as ad campaigns and listing promotions
  'https://api.ebay.com/oauth/api_scope/sell.marketing',
  // View your inventory and offers
  'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
  // View and manage your inventory and offers
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
  // View your account settings
  'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
  // View and manage your account settings
  'https://api.ebay.com/oauth/api_scope/sell.account',
  // View your order fulfillments
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
  // View and manage your order fulfillments
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
  // View your selling analytics data, such as performance reports
  'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
  // View and manage your payment and order information to display this information to you and allow you to initiate refunds using the third party application
  'https://api.ebay.com/oauth/api_scope/sell.finances',
  // View and manage disputes and related details (including payment and order information).
  'https://api.ebay.com/oauth/api_scope/sell.payment.dispute',
  // View a user's basic information, such as username or business account details, from their eBay member account
  'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly',
  // View and manage your reputation data, such as feedback.
  'https://api.ebay.com/oauth/api_scope/sell.reputation',
  // View your reputation data, such as feedback.
  'https://api.ebay.com/oauth/api_scope/sell.reputation.readonly',
  // View and manage your event notification subscriptions
  'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription',
  // View your event notification subscriptions
  'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly',
  // View and manage eBay stores
  'https://api.ebay.com/oauth/api_scope/sell.stores',
  // View eBay stores
  'https://api.ebay.com/oauth/api_scope/sell.stores.readonly',
  // Allows access to eDelivery International Shipping APIs.
  'https://api.ebay.com/oauth/scope/sell.edelivery',
  // Allows access to APIs that are related to eBay's Verified Rights Owner (VeRO) program.
  'https://api.ebay.com/oauth/api_scope/commerce.vero',
  // Enables applications to manage and enhance inventory listings through the Inventory Mapping Public API.
  'https://api.ebay.com/oauth/api_scope/sell.inventory.mapping',
  // Allows access to eBay Message APIs.
  'https://api.ebay.com/oauth/api_scope/commerce.message',
  // Allows access to Feedback APIs.
  'https://api.ebay.com/oauth/api_scope/commerce.feedback',
  // View and manage shipping information
  'https://api.ebay.com/oauth/api_scope/commerce.shipping',
  // Allows readonly access to Feedback APIs.
  'https://api.ebay.com/oauth/api_scope/commerce.feedback.readonly',
];

/** Scopes available to apps in the eBay sandbox environment. */
export const sandboxScopes: readonly string[] = [
  // View public data from eBay
  'https://api.ebay.com/oauth/api_scope',
  // View your order details
  'https://api.ebay.com/oauth/api_scope/buy.order.readonly',
  // Purchase eBay items off eBay
  'https://api.ebay.com/oauth/api_scope/buy.guest.order',
  // View your eBay marketing activities, such as ad campaigns and listing promotions
  'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
  // View and manage your eBay marketing activities, such as ad campaigns and listing promotions
  'https://api.ebay.com/oauth/api_scope/sell.marketing',
  // View your inventory and offers
  'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
  // View and manage your inventory and offers
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
  // View your account settings
  'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
  // View and manage your account settings
  'https://api.ebay.com/oauth/api_scope/sell.account',
  // View your order fulfillments
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
  // View and manage your order fulfillments
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
  // View your selling analytics data, such as performance reports
  'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
  // This scope would allow signed in users read only access to marketplace insights.
  'https://api.ebay.com/oauth/api_scope/sell.marketplace.insights.readonly',
  // This scope would allow signed in user to read catalog data.
  'https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly',
  // This scope would allow signed in user to access shopping carts
  'https://api.ebay.com/oauth/api_scope/buy.shopping.cart',
  // View and manage bidding activities for auctions
  'https://api.ebay.com/oauth/api_scope/buy.offer.auction',
  // View a user's basic information, such as username or business account details, from their eBay member account
  'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly',
  // View a user's personal email information from their eBay member account
  'https://api.ebay.com/oauth/api_scope/commerce.identity.email.readonly',
  // View a user's personal telephone information from their eBay member account
  'https://api.ebay.com/oauth/api_scope/commerce.identity.phone.readonly',
  // View a user's personal address information from their eBay member account
  'https://api.ebay.com/oauth/api_scope/commerce.identity.address.readonly',
  // View a user's first and last name from their eBay member account
  'https://api.ebay.com/oauth/api_scope/commerce.identity.name.readonly',
  // View a user's eBay member account status
  'https://api.ebay.com/oauth/api_scope/commerce.identity.status.readonly',
  // View and manage your payment and order information to display this information to you and allow you to initiate refunds using the third party application
  'https://api.ebay.com/oauth/api_scope/sell.finances',
  // View and manage disputes and related details (including payment and order information).
  'https://api.ebay.com/oauth/api_scope/sell.payment.dispute',
  // View and manage your item drafts.
  'https://api.ebay.com/oauth/api_scope/sell.item.draft',
  // View and manage your item information.
  'https://api.ebay.com/oauth/api_scope/sell.item',
  // View and manage your reputation data, such as feedback.
  'https://api.ebay.com/oauth/api_scope/sell.reputation',
  // View your reputation data, such as feedback.
  'https://api.ebay.com/oauth/api_scope/sell.reputation.readonly',
  // View and manage your event notification subscriptions
  'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription',
  // View your event notification subscriptions
  'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly',
  // View and manage eBay stores
  'https://api.ebay.com/oauth/api_scope/sell.stores',
  // View eBay stores
  'https://api.ebay.com/oauth/api_scope/sell.stores.readonly',
  // Allows access to APIs that are related to eBay's Verified Rights Owner (VeRO) program.
  'https://api.ebay.com/oauth/api_scope/commerce.vero',
  // Allows access to Feedback APIs.
  'https://api.ebay.com/oauth/api_scope/commerce.feedback',
  // Enables applications to manage and enhance inventory listings through the Inventory Mapping Public API.
  'https://api.ebay.com/oauth/api_scope/sell.inventory.mapping',
];
