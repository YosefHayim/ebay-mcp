/**
 * OAuth 2.1 types for MCP server authorization
 */

/**
 * OAuth 2.0 Authorization Server Metadata (RFC 8414)
 */
export interface OAuthServerMetadata {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  registration_endpoint?: string;
  jwks_uri?: string;
  response_types_supported: string[];
  grant_types_supported?: string[];
  token_endpoint_auth_methods_supported?: string[];
  scopes_supported?: string[];
  code_challenge_methods_supported?: string[];
}

/**
 * Protected Resource Metadata (RFC 9728)
 */
export interface ProtectedResourceMetadata {
  resource: string;
  authorization_servers: string[];
  scopes_supported?: string[];
  resource_documentation?: string;
  resource_signing_alg_values_supported?: string[];
}

/**
 * Verified access token payload
 */
export interface VerifiedToken {
  token: string;
  clientId: string;
  scopes: string[];
  expiresAt?: number;
  audience?: string | string[];
  subject?: string;
}

/**
 * Token introspection request (RFC 7662)
 */
export interface TokenIntrospectionRequest {
  token: string;
  token_type_hint?: 'access_token' | 'refresh_token';
  client_id?: string;
  client_secret?: string;
}

/**
 * Token introspection response (RFC 7662)
 */
export interface TokenIntrospectionResponse {
  active: boolean;
  scope?: string;
  client_id?: string;
  username?: string;
  token_type?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  sub?: string;
  aud?: string | string[];
  iss?: string;
  jti?: string;
}
