import { redactSecretFields, redactSecrets } from '@/utils/logRedaction.js';
import { describe, expect, it } from 'vitest';

const credentials = 'client:s3cret';

describe('log redaction', () => {
  it('masks credentials embedded in URLs and keeps the rest of the message', () => {
    expect(redactSecrets(`Auth Server: https://${credentials}@auth.example.test/realms/mcp`)).toBe(
      'Auth Server: https://[REDACTED]@auth.example.test/realms/mcp',
    );
    expect(redactSecrets('proxy http://ghp_token@proxy.local:8080 and wss://u:p@ws.local')).toBe(
      'proxy http://[REDACTED]@proxy.local:8080 and wss://[REDACTED]@ws.local',
    );
  });

  it('leaves messages without credentials unchanged', () => {
    const messages = [
      'Auth Server: http://localhost:8080/realms/master',
      'Required Scopes: mcp:tools, mcp:admin',
      'Clients must provide valid Bearer tokens to access MCP endpoints',
      'Contact seller@example.com',
    ];

    expect(messages.map((message) => redactSecrets(message))).toEqual(messages);
  });

  it('scans long messages in linear time', () => {
    const longMessage = 'a'.repeat(200_000);

    expect(redactSecrets(longMessage)).toBe(longMessage);
  });

  it('masks secret-named fields at any depth without touching other context', () => {
    const meta = {
      url: 'https://user:pass@api.example.test/x',
      client_secret: 'abc',
      nested: { accessToken: 'def', refresh_token: 'ghi', status: 401 },
      list: [{ password: 'jkl', name: 'kept' }],
      headers: { Authorization: 'Bearer mno', 'x-api-key': 'pqr' },
      hint: 'The configured EBAY_USER_REFRESH_TOKEN may be invalid or expired',
    };

    expect(redactSecretFields(meta)).toEqual({
      url: 'https://[REDACTED]@api.example.test/x',
      client_secret: '[REDACTED]',
      nested: { accessToken: '[REDACTED]', refresh_token: '[REDACTED]', status: 401 },
      list: [{ password: '[REDACTED]', name: 'kept' }],
      headers: { Authorization: '[REDACTED]', 'x-api-key': '[REDACTED]' },
      hint: 'The configured EBAY_USER_REFRESH_TOKEN may be invalid or expired',
    });
  });

  it('does not mutate the logged object and passes non-plain values through', () => {
    const meta = { clientSecret: 'abc' };
    const when = new Date(0);

    redactSecretFields(meta);

    expect(meta).toEqual({ clientSecret: 'abc' });
    expect(redactSecretFields(when)).toBe(when);
    expect(redactSecretFields(undefined)).toBeUndefined();
  });
});
