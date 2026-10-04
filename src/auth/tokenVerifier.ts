/**
 * Token verification using OAuth 2.0 Token Introspection (RFC 7662)
 * and JWT validation
 */

import { createRemoteJWKSet, jwtVerify } from 'jose';
import {
  tokenVerifierError,
  type TokenVerifierError,
  type TokenVerifierErrorReason,
  type TokenVerifierOperation,
} from '@/auth/tokenVerifierError.js';
import { getErrorMessage } from '@/utils/errors.js';
import { describeHttpError, httpRequestEffect, type HttpRequestOptions } from '@/utils/http.js';
import { Effect } from 'effect';
import type {
  VerifiedToken,
  TokenIntrospectionRequest,
  TokenIntrospectionResponse,
  OAuthServerMetadata,
} from './oauthTypes.js';

export type { TokenVerifierError } from '@/auth/tokenVerifierError.js';

/**
 * OAuth issuer and audience settings used to validate MCP access tokens.
 */
export interface TokenVerifierConfig {
  /**
   * OAuth authorization server metadata URL or metadata object
   */
  authServerMetadata: string | OAuthServerMetadata;

  /**
   * Client ID for introspection endpoint authentication
   */
  clientId?: string;

  /**
   * Client secret for introspection endpoint authentication
   */
  clientSecret?: string;

  /**
   * Expected audience (resource server URL)
   */
  expectedAudience: string;

  /**
   * Required scopes for access
   */
  requiredScopes?: string[];

  /**
   * Whether to use token introspection (true) or JWT validation (false)
   * Default: true
   */
  useIntrospection?: boolean;
}

/**
 * Verifies MCP Bearer tokens using OAuth introspection or JWT validation.
 */
export class TokenVerifier {
  private config: TokenVerifierConfig;
  private metadata: OAuthServerMetadata | null = null;

  constructor(config: TokenVerifierConfig) {
    this.config = config;
  }

  /**
   * Execute an OAuth verifier HTTP request and return its decoded body.
   */
  private requestVerifierData<T>(
    operation: TokenVerifierOperation,
    reason: TokenVerifierErrorReason,
    failureMessage: string,
    options: HttpRequestOptions,
  ): Effect.Effect<T, TokenVerifierError> {
    return httpRequestEffect<T>(options).pipe(
      Effect.map((response) => response.data),
      Effect.mapError((cause) =>
        tokenVerifierError({
          operation,
          reason,
          message: `${failureMessage}: ${describeHttpError(cause)}`,
          cause,
        }),
      ),
    );
  }

  /**
   * Initialize the verifier by loading OAuth server metadata.
   *
   * @returns An Effect that completes after metadata is loaded or assigned.
   *
   * @example
   * ```ts
   * await Effect.runPromise(verifier.initialize());
   * ```
   */
  initialize = (): Effect.Effect<void, TokenVerifierError> =>
    Effect.gen(this, function* () {
      if (typeof this.config.authServerMetadata === 'string') {
        this.metadata = yield* this.requestVerifierData<OAuthServerMetadata>(
          'initialize',
          'metadataRequest',
          'Failed to load OAuth server metadata',
          {
            url: this.config.authServerMetadata,
          },
        );
      } else {
        this.metadata = this.config.authServerMetadata;
      }
    });

  /**
   * Verify an access token.
   *
   * @param token - Bearer token received by the MCP HTTP transport.
   * @returns An Effect that succeeds with verified token claims.
   *
   * @example
   * ```ts
   * const verified = await Effect.runPromise(verifier.verifyToken(token));
   * ```
   */
  verifyToken = (token: string): Effect.Effect<VerifiedToken, TokenVerifierError> =>
    Effect.gen(this, function* () {
      if (!this.metadata) {
        return yield* Effect.fail(
          tokenVerifierError({
            operation: 'verifyToken',
            reason: 'notInitialized',
            message: 'Token verifier not initialized',
          }),
        );
      }

      if (this.config.useIntrospection === false) {
        return yield* this.verifyViaJWT(token);
      }
      return yield* this.verifyViaIntrospection(token);
    });

  /**
   * Verify token using OAuth 2.0 Token Introspection (RFC 7662)
   */
  private verifyViaIntrospection = (
    token: string,
  ): Effect.Effect<VerifiedToken, TokenVerifierError> =>
    Effect.gen(this, function* () {
      if (!this.metadata) {
        return yield* Effect.fail(
          tokenVerifierError({
            operation: 'verifyViaIntrospection',
            reason: 'notInitialized',
            message: 'Token verifier not initialized',
          }),
        );
      }

      // Check if introspection endpoint is available
      const introspectionEndpoint = this.metadata.introspection_endpoint;
      if (!introspectionEndpoint) {
        return yield* Effect.fail(
          tokenVerifierError({
            operation: 'verifyViaIntrospection',
            reason: 'missingIntrospectionEndpoint',
            message: 'Introspection endpoint not available in OAuth server metadata',
          }),
        );
      }

      // Prepare introspection request. Client credentials authenticate via HTTP
      // Basic (RFC 7662 §2.1) rather than form body fields.
      const introspectionRequest: TokenIntrospectionRequest = {
        token,
        token_type_hint: 'access_token',
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      if (this.config.clientId && this.config.clientSecret) {
        headers.Authorization = `Basic ${Buffer.from(
          `${this.config.clientId}:${this.config.clientSecret}`,
        ).toString('base64')}`;
      }

      const params = new URLSearchParams({
        token: introspectionRequest.token,
      });

      // Make introspection request
      const introspection = yield* this.requestVerifierData<TokenIntrospectionResponse>(
        'verifyViaIntrospection',
        'introspectionRequest',
        'Token introspection failed',
        {
          method: 'POST',
          url: introspectionEndpoint,
          body: params,
          headers,
        },
      );

      // Check if token is active
      if (!introspection.active) {
        return yield* Effect.fail(
          tokenVerifierError({
            operation: 'verifyViaIntrospection',
            reason: 'inactiveToken',
            message: 'Token is not active',
          }),
        );
      }

      // Validate audience
      if (!this.validateAudience(introspection.aud)) {
        return yield* Effect.fail(
          tokenVerifierError({
            operation: 'verifyViaIntrospection',
            reason: 'invalidAudience',
            message: `Invalid audience. Expected: ${this.config.expectedAudience}, Got: ${introspection.aud}`,
          }),
        );
      }

      // Validate scopes
      const scopes = introspection.scope ? introspection.scope.split(' ') : [];
      if (this.config.requiredScopes) {
        const hasRequiredScopes = this.config.requiredScopes.every((scope) =>
          scopes.includes(scope),
        );
        if (!hasRequiredScopes) {
          return yield* Effect.fail(
            tokenVerifierError({
              operation: 'verifyViaIntrospection',
              reason: 'missingScopes',
              message: `Missing required scopes. Required: ${this.config.requiredScopes.join(', ')}, Got: ${scopes.join(', ')}`,
            }),
          );
        }
      }

      return {
        token,
        clientId: introspection.client_id || 'missing-client-id',
        scopes,
        expiresAt: introspection.exp,
        audience: introspection.aud,
        subject: introspection.sub,
      };
    });

  /**
   * Verify token using JWT validation
   */
  private verifyViaJWT = (token: string): Effect.Effect<VerifiedToken, TokenVerifierError> =>
    Effect.gen(this, function* () {
      if (!this.metadata) {
        return yield* Effect.fail(
          tokenVerifierError({
            operation: 'verifyViaJWT',
            reason: 'notInitialized',
            message: 'Token verifier not initialized',
          }),
        );
      }

      const metadata = this.metadata;
      const jwksUri = metadata.jwks_uri;
      if (!jwksUri) {
        return yield* Effect.fail(
          tokenVerifierError({
            operation: 'verifyViaJWT',
            reason: 'missingJwksUri',
            message: 'JWKS URI not available in OAuth server metadata',
          }),
        );
      }

      const JWKS = yield* Effect.try({
        try: () => createRemoteJWKSet(new URL(jwksUri)),
        catch: (cause) =>
          tokenVerifierError({
            operation: 'verifyViaJWT',
            reason: 'jwtVerification',
            message: `JWT verification failed: ${getErrorMessage(cause)}`,
            cause,
          }),
      });
      const { payload: claims } = yield* Effect.tryPromise({
        try: () =>
          jwtVerify(token, JWKS, {
            issuer: metadata.issuer,
            audience: this.config.expectedAudience,
          }),
        catch: (cause) =>
          tokenVerifierError({
            operation: 'verifyViaJWT',
            reason: 'jwtVerification',
            message: `JWT verification failed: ${getErrorMessage(cause)}`,
            cause,
          }),
      });
      let scopes: string[] = [];
      if (typeof claims.scope === 'string') {
        scopes = claims.scope.split(' ');
      } else if (Array.isArray(claims.scope)) {
        scopes = claims.scope.filter((scope): scope is string => typeof scope === 'string');
      }

      if (this.config.requiredScopes) {
        const hasRequiredScopes = this.config.requiredScopes.every((scope) =>
          scopes.includes(scope),
        );
        if (!hasRequiredScopes) {
          return yield* Effect.fail(
            tokenVerifierError({
              operation: 'verifyViaJWT',
              reason: 'missingScopes',
              message: `Missing required scopes. Required: ${this.config.requiredScopes.join(', ')}, Got: ${scopes.join(', ')}`,
            }),
          );
        }
      }

      let clientId = 'missing-client-id';
      if (typeof claims.client_id === 'string') {
        clientId = claims.client_id;
      } else if (typeof claims.azp === 'string') {
        clientId = claims.azp;
      }

      return {
        token,
        clientId,
        scopes,
        expiresAt: claims.exp,
        audience: claims.aud,
        subject: claims.sub,
      };
    });

  /**
   * Validate audience claim
   */
  private validateAudience(audience: string | string[] | undefined): boolean {
    if (!audience) {
      return false;
    }

    const audiences = Array.isArray(audience) ? audience : [audience];
    const normalizedExpected = this.config.expectedAudience.replace(/\/$/, '');

    return audiences.some((aud) => {
      const normalizedAud = aud.replace(/\/$/, '');
      return (
        normalizedAud === normalizedExpected ||
        normalizedAud === normalizedExpected + '/' ||
        normalizedExpected === normalizedAud + '/'
      );
    });
  }
}
