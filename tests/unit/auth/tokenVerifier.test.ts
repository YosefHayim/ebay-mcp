import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import * as jose from 'jose';
import { Effect } from 'effect';
import { TokenVerifier, type TokenVerifierError } from '@/auth/tokenVerifier.js';
import { invalidInput } from '@tests/helpers/invalidInput.js';
import type { OAuthServerMetadata } from '@/auth/oauthTypes.js';

vi.mock('jose');

// All test endpoints live on this origin; nock intercepts native fetch.
const ORIGIN = 'http://localhost:8080';
const METADATA_PATH = '/realms/master/.well-known/openid-configuration';
const INTROSPECT_PATH = '/realms/master/protocol/openid-connect/token/introspect';

const initializeVerifier = (verifier: TokenVerifier): Promise<void> =>
  Effect.runPromise(verifier.initialize());

const verifyToken = (verifier: TokenVerifier, token: string) =>
  Effect.runPromise(verifier.verifyToken(token));

const expectVerifierFailure = async (
  effect: Effect.Effect<unknown, TokenVerifierError>,
  expected: {
    readonly operation: TokenVerifierError['operation'];
    readonly reason: TokenVerifierError['reason'];
    readonly message: string | RegExp;
  },
): Promise<void> => {
  const error = await Effect.runPromise(Effect.flip(effect));

  expect(error._tag).toBe('TokenVerifierError');
  expect(error.operation).toBe(expected.operation);
  expect(error.reason).toBe(expected.reason);
  if (expected.message instanceof RegExp) {
    expect(error.message).toMatch(expected.message);
  } else {
    expect(error.message).toContain(expected.message);
  }
};

describe('TokenVerifier', () => {
  const mockMetadata: OAuthServerMetadata = {
    issuer: 'http://localhost:8080/realms/master',
    authorization_endpoint: 'http://localhost:8080/realms/master/protocol/openid-connect/auth',
    token_endpoint: 'http://localhost:8080/realms/master/protocol/openid-connect/token',
    jwks_uri: 'http://localhost:8080/realms/master/protocol/openid-connect/certs',
    introspection_endpoint: `${ORIGIN}${INTROSPECT_PATH}`,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
    vi.restoreAllMocks();
  });

  describe('initialize', () => {
    it('load metadata from URL', async () => {
      const scope = nock(ORIGIN).get(METADATA_PATH).reply(200, mockMetadata);

      const verifier = new TokenVerifier({
        authServerMetadata: `${ORIGIN}${METADATA_PATH}`,
        expectedAudience: 'http://localhost:3000',
      });

      await initializeVerifier(verifier);

      expect(scope.isDone()).toBe(true);
    });

    it('use provided metadata object', async () => {
      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
      });

      // No HTTP call is made when metadata is supplied inline.
      await expect(initializeVerifier(verifier)).resolves.toBeUndefined();
      expect(nock.pendingMocks()).toHaveLength(0);
    });

    it('returns tagged error if metadata loading fails', async () => {
      nock(ORIGIN).get(METADATA_PATH).reply(500, { error: 'server_error' });

      const verifier = new TokenVerifier({
        authServerMetadata: `${ORIGIN}${METADATA_PATH}`,
        expectedAudience: 'http://localhost:3000',
      });

      await expectVerifierFailure(verifier.initialize(), {
        operation: 'initialize',
        reason: 'metadataRequest',
        message: /Failed to load OAuth server metadata/,
      });
    });
  });

  describe('verifyToken - introspection', () => {
    it('verify token via introspection', async () => {
      const expectedBasic = `Basic ${Buffer.from('mcp-server:secret').toString('base64')}`;
      nock(ORIGIN).get('/.well-known/openid-configuration').reply(200, mockMetadata);
      nock(ORIGIN)
        .post(INTROSPECT_PATH, (introspectionBody) => {
          // nock parses urlencoded bodies into objects; credentials must not appear here
          const params =
            typeof introspectionBody === 'string'
              ? Object.fromEntries(new URLSearchParams(introspectionBody))
              : (introspectionBody as Record<string, string>);
          expect(params.token).toBe('test-token');
          expect(params.client_id).toBeUndefined();
          expect(params.client_secret).toBeUndefined();
          return true;
        })
        .matchHeader('Authorization', expectedBasic)
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, {
          active: true,
          client_id: 'test-client',
          scope: 'mcp:tools mcp:admin',
          exp: Math.floor(Date.now() / 1000) + 3600,
          aud: 'http://localhost:3000',
          sub: 'user123',
        });

      const verifier = new TokenVerifier({
        authServerMetadata: `${ORIGIN}/.well-known/openid-configuration`,
        expectedAudience: 'http://localhost:3000',
        clientId: 'mcp-server',
        clientSecret: 'secret',
        requiredScopes: ['mcp:tools'],
        useIntrospection: true,
      });

      await initializeVerifier(verifier);
      const verifiedToken = await verifyToken(verifier, 'test-token');

      expect(verifiedToken).toMatchObject({
        token: 'test-token',
        clientId: 'test-client',
        scopes: ['mcp:tools', 'mcp:admin'],
        audience: 'http://localhost:3000',
        subject: 'user123',
      });
    });

    it('sends client credentials as HTTP Basic auth, not form fields', async () => {
      const clientId = 'basic-client';
      const clientSecret = 'basic-secret';
      const expectedBasic = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
      let capturedAuth: string | undefined;
      let capturedBody: string | undefined;

      nock(ORIGIN)
        .post(INTROSPECT_PATH, (introspectionBody) => {
          capturedBody =
            typeof introspectionBody === 'string'
              ? introspectionBody
              : new URLSearchParams(introspectionBody).toString();
          return true;
        })
        .matchHeader('Authorization', (authorizationHeader) => {
          capturedAuth = authorizationHeader;
          return authorizationHeader === expectedBasic;
        })
        .reply(200, {
          active: true,
          client_id: 'test-client',
          scope: 'mcp:tools',
          aud: 'http://localhost:3000',
        });

      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
        clientId,
        clientSecret,
        useIntrospection: true,
      });

      await initializeVerifier(verifier);
      await verifyToken(verifier, 'opaque-token');

      expect(capturedAuth).toBe(expectedBasic);
      expect(capturedBody).toContain('token=opaque-token');
      expect(capturedBody).not.toContain('client_id');
      expect(capturedBody).not.toContain('client_secret');
    });

    it('omits Authorization when client credentials are incomplete', async () => {
      nock(ORIGIN)
        .post(INTROSPECT_PATH)
        .matchHeader('Authorization', (authorizationHeader) => authorizationHeader === undefined)
        .reply(200, {
          active: true,
          client_id: 'test-client',
          scope: 'mcp:tools',
          aud: 'http://localhost:3000',
        });

      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
        clientId: 'only-id',
        // clientSecret intentionally omitted
        useIntrospection: true,
      });

      await initializeVerifier(verifier);
      const verifiedToken = await verifyToken(verifier, 'test-token');
      expect(verifiedToken.token).toBe('test-token');
    });

    it('reject inactive tokens', async () => {
      nock(ORIGIN).post(INTROSPECT_PATH).reply(200, { active: false });

      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
        useIntrospection: true,
      });

      await initializeVerifier(verifier);

      await expectVerifierFailure(verifier.verifyToken('invalid-token'), {
        operation: 'verifyViaIntrospection',
        reason: 'inactiveToken',
        message: 'Token is not active',
      });
    });

    it('reject tokens with invalid audience', async () => {
      nock(ORIGIN)
        .post(INTROSPECT_PATH)
        .reply(200, { active: true, aud: 'http://different-server:3000', scope: 'mcp:tools' });

      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
        useIntrospection: true,
      });

      await initializeVerifier(verifier);

      await expectVerifierFailure(verifier.verifyToken('test-token'), {
        operation: 'verifyViaIntrospection',
        reason: 'invalidAudience',
        message: /Invalid audience/,
      });
    });

    it('reject tokens with missing scopes', async () => {
      nock(ORIGIN)
        .post(INTROSPECT_PATH)
        .reply(200, { active: true, aud: 'http://localhost:3000', scope: 'mcp:tools' });

      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
        requiredScopes: ['mcp:admin', 'mcp:superuser'],
        useIntrospection: true,
      });

      await initializeVerifier(verifier);

      await expectVerifierFailure(verifier.verifyToken('test-token'), {
        operation: 'verifyViaIntrospection',
        reason: 'missingScopes',
        message: /Missing required scopes/,
      });
    });

    it('handle introspection endpoint errors', async () => {
      nock(ORIGIN).post(INTROSPECT_PATH).reply(400, { error_description: 'Invalid token' });

      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
        useIntrospection: true,
      });

      await initializeVerifier(verifier);

      await expectVerifierFailure(verifier.verifyToken('test-token'), {
        operation: 'verifyViaIntrospection',
        reason: 'introspectionRequest',
        message: 'Token introspection failed: Invalid token',
      });
    });

    it('returns tagged error if introspection endpoint is not available', async () => {
      const metadataWithoutIntrospection = {
        issuer: 'http://localhost:8080/realms/master',
        authorization_endpoint: 'http://localhost:8080/realms/master/protocol/openid-connect/auth',
        token_endpoint: 'http://localhost:8080/realms/master/protocol/openid-connect/token',
        jwks_uri: 'http://localhost:8080/realms/master/protocol/openid-connect/certs',
      };

      const verifier = new TokenVerifier({
        authServerMetadata: metadataWithoutIntrospection,
        expectedAudience: 'http://localhost:3000',
        useIntrospection: true,
      });

      await initializeVerifier(verifier);

      await expectVerifierFailure(verifier.verifyToken('test-token'), {
        operation: 'verifyViaIntrospection',
        reason: 'missingIntrospectionEndpoint',
        message: 'Introspection endpoint not available',
      });
    });
  });

  describe('verifyToken - JWT', () => {
    it('verify token via JWT validation', async () => {
      const mockJWKS = vi.fn();
      const mockPayload = {
        iss: mockMetadata.issuer,
        aud: 'http://localhost:3000',
        sub: 'user123',
        client_id: 'test-client',
        scope: 'mcp:tools mcp:admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      vi.mocked(jose.createRemoteJWKSet).mockReturnValue(invalidInput(mockJWKS));
      vi.mocked(jose.jwtVerify).mockResolvedValue({
        payload: mockPayload,
        protectedHeader: invalidInput({}),
      });

      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
        requiredScopes: ['mcp:tools'],
        useIntrospection: false,
      });

      await initializeVerifier(verifier);
      const verifiedToken = await verifyToken(verifier, 'test-jwt-token');

      expect(verifiedToken).toMatchObject({
        token: 'test-jwt-token',
        clientId: 'test-client',
        scopes: ['mcp:tools', 'mcp:admin'],
        subject: 'user123',
      });

      expect(jose.jwtVerify).toHaveBeenCalledWith('test-jwt-token', mockJWKS, {
        issuer: mockMetadata.issuer,
        audience: 'http://localhost:3000',
      });
    });

    it('handle scope as array in JWT', async () => {
      const mockJWKS = vi.fn();
      const mockPayload = {
        iss: mockMetadata.issuer,
        aud: 'http://localhost:3000',
        scope: ['mcp:tools', 'mcp:admin'],
        client_id: 'test-client',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      vi.mocked(jose.createRemoteJWKSet).mockReturnValue(invalidInput(mockJWKS));
      vi.mocked(jose.jwtVerify).mockResolvedValue({
        payload: mockPayload,
        protectedHeader: invalidInput({}),
      });

      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
        useIntrospection: false,
      });

      await initializeVerifier(verifier);
      const verifiedToken = await verifyToken(verifier, 'test-jwt-token');

      expect(verifiedToken.scopes).toEqual(['mcp:tools', 'mcp:admin']);
    });

    it('reject JWT with missing scopes', async () => {
      const mockJWKS = vi.fn();
      const mockPayload = {
        iss: mockMetadata.issuer,
        aud: 'http://localhost:3000',
        scope: 'mcp:tools',
        client_id: 'test-client',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      vi.mocked(jose.createRemoteJWKSet).mockReturnValue(invalidInput(mockJWKS));
      vi.mocked(jose.jwtVerify).mockResolvedValue({
        payload: mockPayload,
        protectedHeader: invalidInput({}),
      });

      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
        requiredScopes: ['mcp:admin'],
        useIntrospection: false,
      });

      await initializeVerifier(verifier);

      await expectVerifierFailure(verifier.verifyToken('test-jwt-token'), {
        operation: 'verifyViaJWT',
        reason: 'missingScopes',
        message: /Missing required scopes/,
      });
    });

    it('returns tagged error if JWKS URI is not available', async () => {
      const metadataWithoutJWKS = {
        issuer: 'http://localhost:8080/realms/master',
        authorization_endpoint: 'http://localhost:8080/realms/master/protocol/openid-connect/auth',
        token_endpoint: 'http://localhost:8080/realms/master/protocol/openid-connect/token',
      };

      const verifier = new TokenVerifier({
        authServerMetadata: metadataWithoutJWKS as OAuthServerMetadata,
        expectedAudience: 'http://localhost:3000',
        useIntrospection: false,
      });

      await initializeVerifier(verifier);

      await expectVerifierFailure(verifier.verifyToken('test-token'), {
        operation: 'verifyViaJWT',
        reason: 'missingJwksUri',
        message: 'JWKS URI not available',
      });
    });

    it('handle JWT verification failures', async () => {
      vi.mocked(jose.createRemoteJWKSet).mockReturnValue(invalidInput(vi.fn()));
      vi.mocked(jose.jwtVerify).mockRejectedValue(new Error('Invalid signature'));

      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
        useIntrospection: false,
      });

      await initializeVerifier(verifier);

      await expectVerifierFailure(verifier.verifyToken('invalid-jwt'), {
        operation: 'verifyViaJWT',
        reason: 'jwtVerification',
        message: 'JWT verification failed: Invalid signature',
      });
    });

    it('use azp claim if client_id not present', async () => {
      const mockJWKS = vi.fn();
      const mockPayload = {
        iss: mockMetadata.issuer,
        aud: 'http://localhost:3000',
        azp: 'authorized-party-client',
        scope: 'mcp:tools',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      vi.mocked(jose.createRemoteJWKSet).mockReturnValue(invalidInput(mockJWKS));
      vi.mocked(jose.jwtVerify).mockResolvedValue({
        payload: mockPayload,
        protectedHeader: invalidInput({}),
      });

      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
        useIntrospection: false,
      });

      await initializeVerifier(verifier);
      const verifiedToken = await verifyToken(verifier, 'test-jwt-token');

      expect(verifiedToken.clientId).toBe('authorized-party-client');
    });
  });

  describe('validateAudience', () => {
    it('validate audience with trailing slash normalization', async () => {
      nock(ORIGIN)
        .post(INTROSPECT_PATH)
        .reply(200, { active: true, aud: 'http://localhost:3000/', scope: 'mcp:tools' });

      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
        useIntrospection: true,
      });

      await initializeVerifier(verifier);
      const verifiedToken = await verifyToken(verifier, 'test-token');

      expect(verifiedToken).toBeDefined();
    });

    it('validate audience array', async () => {
      nock(ORIGIN)
        .post(INTROSPECT_PATH)
        .reply(200, {
          active: true,
          aud: ['http://localhost:3000', 'http://example.com'],
          scope: 'mcp:tools',
        });

      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
        useIntrospection: true,
      });

      await initializeVerifier(verifier);
      const verifiedToken = await verifyToken(verifier, 'test-token');

      expect(verifiedToken).toBeDefined();
    });
  });

  describe('verifyToken - not initialized', () => {
    it('returns tagged error if verify token is called before initialization', async () => {
      const verifier = new TokenVerifier({
        authServerMetadata: mockMetadata,
        expectedAudience: 'http://localhost:3000',
      });

      await expectVerifierFailure(verifier.verifyToken('test-token'), {
        operation: 'verifyToken',
        reason: 'notInitialized',
        message: 'Token verifier not initialized',
      });
    });
  });
});
