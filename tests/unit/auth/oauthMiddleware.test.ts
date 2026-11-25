import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { createBearerAuthMiddleware, requireScopes } from '@/auth/oauthMiddleware.js';
import type { TokenVerifier } from '@/auth/tokenVerifier.js';
import type { VerifiedToken } from '@/auth/oauthTypes.js';
import { Effect } from 'effect';

type AuthenticatedTestRequest = Partial<Request> & { auth?: VerifiedToken };

describe('OAuth Middleware', () => {
  describe('createBearerAuthMiddleware', () => {
    let mockVerifier: TokenVerifier;
    let mockRequest: AuthenticatedTestRequest;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let statusMock: ReturnType<typeof vi.fn>;
    let jsonMock: ReturnType<typeof vi.fn>;
    let setHeaderMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      jsonMock = vi.fn();
      statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      setHeaderMock = vi.fn();

      mockRequest = {
        headers: {},
      };

      mockResponse = {
        status: statusMock,
        json: jsonMock,
        setHeader: setHeaderMock,
      };

      mockNext = vi.fn();

      mockVerifier = {
        verifyToken: vi.fn(),
      } as unknown as TokenVerifier;
    });

    it('reject requests without authorization header', async () => {
      const middleware = createBearerAuthMiddleware({
        verifier: mockVerifier,
        resourceMetadataUrl: 'http://localhost:3000/.well-known/oauth-protected-resource',
        realm: 'test-realm',
      });

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(setHeaderMock).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'invalid_token',
        error_description: 'No authorization header provided',
      });
    });

    it('reject invalid authorization header format', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token123',
      };

      const middleware = createBearerAuthMiddleware({
        verifier: mockVerifier,
        resourceMetadataUrl: 'http://localhost:3000/.well-known/oauth-protected-resource',
      });

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('reject authorization header without token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer',
      };

      const middleware = createBearerAuthMiddleware({
        verifier: mockVerifier,
        resourceMetadataUrl: 'http://localhost:3000/.well-known/oauth-protected-resource',
      });

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('verify valid bearer token', async () => {
      const validToken: VerifiedToken = {
        token: 'valid-token',
        clientId: 'test-client',
        scopes: ['mcp:tools'],
        expiresAt: Date.now() / 1000 + 3600,
        audience: 'http://localhost:3000',
        subject: 'user123',
      };

      (mockVerifier.verifyToken as ReturnType<typeof vi.fn>).mockReturnValue(
        Effect.succeed(validToken),
      );

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      const middleware = createBearerAuthMiddleware({
        verifier: mockVerifier,
        resourceMetadataUrl: 'http://localhost:3000/.well-known/oauth-protected-resource',
      });

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockVerifier.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.auth).toEqual(validToken);
    });

    it('reject invalid token', async () => {
      (mockVerifier.verifyToken as ReturnType<typeof vi.fn>).mockReturnValue(
        Effect.fail(new Error('Token expired')),
      );

      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      const middleware = createBearerAuthMiddleware({
        verifier: mockVerifier,
        resourceMetadataUrl: 'http://localhost:3000/.well-known/oauth-protected-resource',
      });

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'invalid_token',
        error_description: 'Token expired',
      });
    });

    it('handle verifier errors gracefully', async () => {
      (mockVerifier.verifyToken as ReturnType<typeof vi.fn>).mockReturnValue(
        Effect.fail(new Error('Unexpected error')),
      );

      mockRequest.headers = {
        authorization: 'Bearer some-token',
      };

      const middleware = createBearerAuthMiddleware({
        verifier: mockVerifier,
        resourceMetadataUrl: 'http://localhost:3000/.well-known/oauth-protected-resource',
      });

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });

  describe('requireScopes', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let statusMock: ReturnType<typeof vi.fn>;
    let jsonMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      jsonMock = vi.fn();
      statusMock = vi.fn().mockReturnValue({ json: jsonMock });

      mockRequest = {};
      mockResponse = {
        status: statusMock,
        json: jsonMock,
      };
      mockNext = vi.fn();
    });

    it('reject requests without auth', () => {
      const middleware = requireScopes(['mcp:admin']);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'unauthorized',
        error_description: 'No authentication information found',
      });
    });

    it('allow requests with required scopes', () => {
      mockRequest.auth = {
        token: 'test-token',
        clientId: 'test-client',
        scopes: ['mcp:admin', 'mcp:tools'],
        expiresAt: Date.now() / 1000 + 3600,
      };

      const middleware = requireScopes(['mcp:admin']);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('reject requests with insufficient scopes', () => {
      mockRequest.auth = {
        token: 'test-token',
        clientId: 'test-client',
        scopes: ['mcp:tools'],
        expiresAt: Date.now() / 1000 + 3600,
      };

      const middleware = requireScopes(['mcp:admin', 'mcp:superuser']);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'insufficient_scope',
        error_description: 'Missing required scopes: mcp:admin, mcp:superuser',
        required_scopes: ['mcp:admin', 'mcp:superuser'],
        provided_scopes: ['mcp:tools'],
      });
    });

    it('allow requests with all required scopes', () => {
      mockRequest.auth = {
        token: 'test-token',
        clientId: 'test-client',
        scopes: ['mcp:admin', 'mcp:tools', 'mcp:read'],
        expiresAt: Date.now() / 1000 + 3600,
      };

      const middleware = requireScopes(['mcp:admin', 'mcp:tools']);

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
