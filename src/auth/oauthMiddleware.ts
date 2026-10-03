/**
 * OAuth 2.1 middleware for Express
 * Implements RFC 6750 Bearer Token authentication
 */

import type { Request, Response, NextFunction } from 'express';
import { getErrorMessage } from '@/utils/errors.js';
import type { TokenVerifier } from './tokenVerifier.js';
import type { VerifiedToken } from './oauthTypes.js';
import { Effect, Either } from 'effect';

/**
 * Extended Express Request with verified token
 */
export interface AuthenticatedRequest extends Request {
  /** Verified bearer token attached after authentication succeeds. */
  auth?: VerifiedToken;
}

/**
 * Configuration for MCP Bearer-token authentication middleware.
 */
export interface BearerAuthMiddlewareConfig {
  /**
   * Token verifier instance
   */
  verifier: TokenVerifier;

  /**
   * Protected Resource Metadata URL for WWW-Authenticate header
   */
  resourceMetadataUrl: string;

  /**
   * Realm for WWW-Authenticate header
   */
  realm?: string;
}

/**
 * Create Bearer token authentication middleware
 *
 * @param config - Token verifier and RFC 6750 challenge settings.
 * @returns Express middleware that verifies bearer tokens and attaches `request.auth`.
 *
 * @example
 * ```ts
 * const middleware = createBearerAuthMiddleware({ verifier, resourceMetadataUrl });
 * ```
 */
export const createBearerAuthMiddleware = (config: BearerAuthMiddlewareConfig) => {
  const realm = config.realm || 'mcp';

  return async (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      sendUnauthorized(response, realm, config.resourceMetadataUrl, {
        error: 'invalid_token',
        error_description: 'No authorization header provided',
      });
      return;
    }

    // Check Bearer scheme
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      sendUnauthorized(response, realm, config.resourceMetadataUrl, {
        error: 'invalid_token',
        error_description: 'Invalid authorization header format. Expected: Bearer <token>',
      });
      return;
    }

    const token = parts[1];
    const verified = await Effect.runPromise(Effect.either(config.verifier.verifyToken(token)));

    if (Either.isLeft(verified)) {
      const errorMessage = getErrorMessage(verified.left, 'Token verification failed');

      sendUnauthorized(response, realm, config.resourceMetadataUrl, {
        error: 'invalid_token',
        error_description: errorMessage,
      });
      return;
    }

    request.auth = verified.right;
    next();
  };
};

/**
 * Send 401 Unauthorized response with RFC 6750 compliant WWW-Authenticate header
 */
const sendUnauthorized = (
  response: Response,
  realm: string,
  resourceMetadataUrl: string,
  challenge: {
    error?: string;
    error_description?: string;
    scope?: string;
  },
): void => {
  // Build WWW-Authenticate header per RFC 6750
  let authenticateValue = `Bearer realm="${realm}", resource_metadata="${resourceMetadataUrl}"`;

  if (challenge.error) {
    authenticateValue += `, error="${challenge.error}"`;
  }

  if (challenge.error_description) {
    authenticateValue += `, error_description="${challenge.error_description}"`;
  }

  if (challenge.scope) {
    authenticateValue += `, scope="${challenge.scope}"`;
  }

  response.setHeader('WWW-Authenticate', authenticateValue);
  response.status(401).json({
    error: challenge.error || 'unauthorized',
    error_description: challenge.error_description || 'Authorization required',
  });
};

/**
 * Optional middleware to check specific scopes
 *
 * @param requiredScopes - OAuth scopes required by the protected route.
 * @returns Express middleware that rejects unauthenticated or under-scoped requests.
 *
 * @example
 * ```ts
 * app.get('/admin', requireScopes(['mcp:admin']), handler);
 * ```
 */
export const requireScopes =
  (requiredScopes: string[]) =>
  (request: AuthenticatedRequest, response: Response, next: NextFunction): void => {
    if (!request.auth) {
      response.status(401).json({
        error: 'unauthorized',
        error_description: 'No authentication information found',
      });
      return;
    }

    const hasRequiredScopes = requiredScopes.every((scope) => request.auth!.scopes.includes(scope));

    if (!hasRequiredScopes) {
      response.status(403).json({
        error: 'insufficient_scope',
        error_description: `Missing required scopes: ${requiredScopes.join(', ')}`,
        required_scopes: requiredScopes,
        provided_scopes: request.auth.scopes,
      });
      return;
    }

    next();
  };
