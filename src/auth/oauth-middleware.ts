/**
 * OAuth 2.1 middleware for Express
 * Implements RFC 6750 Bearer Token authentication
 */

import type { Request, Response, NextFunction } from "express";
import type { TokenVerifier } from "./token-verifier.js";
import type { VerifiedToken } from "./oauth-types.js";

/**
 * Extended Express Request with verified token
 */
export interface AuthenticatedRequest extends Request {
  auth?: VerifiedToken;
}

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
 */
export function createBearerAuthMiddleware(
  config: BearerAuthMiddlewareConfig
) {
  const realm = config.realm || "mcp";

  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        sendUnauthorized(res, realm, config.resourceMetadataUrl, {
          error: "invalid_token",
          error_description: "No authorization header provided",
        });
        return;
      }

      // Check Bearer scheme
      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        sendUnauthorized(res, realm, config.resourceMetadataUrl, {
          error: "invalid_token",
          error_description: "Invalid authorization header format. Expected: Bearer <token>",
        });
        return;
      }

      const token = parts[1];

      // Verify token
      try {
        const verifiedToken = await config.verifier.verifyToken(token);
        req.auth = verifiedToken;
        next();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Token verification failed";

        sendUnauthorized(res, realm, config.resourceMetadataUrl, {
          error: "invalid_token",
          error_description: errorMessage,
        });
      }
    } catch (error) {
      console.error("OAuth middleware error:", error);
      res.status(500).json({
        error: "server_error",
        error_description: "Internal server error during authentication",
      });
    }
  };
}

/**
 * Send 401 Unauthorized response with RFC 6750 compliant WWW-Authenticate header
 */
function sendUnauthorized(
  res: Response,
  realm: string,
  resourceMetadataUrl: string,
  challenge: {
    error?: string;
    error_description?: string;
    scope?: string;
  }
): void {
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

  res.setHeader("WWW-Authenticate", authenticateValue);
  res.status(401).json({
    error: challenge.error || "unauthorized",
    error_description: challenge.error_description || "Authorization required",
  });
}

/**
 * Optional middleware to check specific scopes
 */
export function requireScopes(requiredScopes: string[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.auth) {
      res.status(401).json({
        error: "unauthorized",
        error_description: "No authentication information found",
      });
      return;
    }

    const hasRequiredScopes = requiredScopes.every((scope) =>
      req.auth!.scopes.includes(scope)
    );

    if (!hasRequiredScopes) {
      res.status(403).json({
        error: "insufficient_scope",
        error_description: `Missing required scopes: ${requiredScopes.join(", ")}`,
        required_scopes: requiredScopes,
        provided_scopes: req.auth.scopes,
      });
      return;
    }

    next();
  };
}
