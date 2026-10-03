/**
 * Unit tests for LLM Client Detection and Auto-Configuration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';

const mockHomedir = '/home/testuser';

// Mock fs and os modules
vi.mock('fs');
vi.mock('os', () => ({
  homedir: vi.fn(() => '/home/testuser'),
  platform: vi.fn(() => 'darwin'),
}));

// Import after mocking
import {
  detectLLMClients,
  configureLLMClient,
  getAllSupportedClients,
  supportsNativeMCP,
  getManualConfigInstructions,
  verifyClientConfiguration,
} from '@/utils/llmClientDetector.js';

describe('LLM Client Detector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(os.homedir).mockReturnValue(mockHomedir);
    vi.mocked(os.platform).mockReturnValue('darwin');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('detectLLMClients', () => {
    it('detect all 9 supported clients', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const clients = detectLLMClients();

      expect(clients).toHaveLength(9);
      expect(clients.map((client) => client.name)).toEqual([
        'claude',
        'cline',
        'continue',
        'zed',
        'cursor',
        'windsurf',
        'roocode',
        'claudecode',
        'amazonq',
      ]);
    });

    it('detect Claude Desktop client', () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => path.toString().includes('Claude'));

      const clients = detectLLMClients();
      const claude = clients.find((client) => client.name === 'claude');

      expect(claude).toBeDefined();
      expect(claude?.detected).toBe(true);
      expect(claude?.displayName).toBe('Claude Desktop');
    });

    it('detect Zed editor client', () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => path.toString().includes('zed'));

      const clients = detectLLMClients();
      const zed = clients.find((client) => client.name === 'zed');

      expect(zed).toBeDefined();
      expect(zed?.detected).toBe(true);
      expect(zed?.displayName).toBe('Zed Editor');
    });

    it('detect Cursor IDE client', () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => path.toString().includes('.cursor'));

      const clients = detectLLMClients();
      const cursor = clients.find((client) => client.name === 'cursor');

      expect(cursor).toBeDefined();
      expect(cursor?.detected).toBe(true);
      expect(cursor?.displayName).toBe('Cursor IDE');
    });

    it('detect Windsurf client', () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => path.toString().includes('.codeium'));

      const clients = detectLLMClients();
      const windsurf = clients.find((client) => client.name === 'windsurf');

      expect(windsurf).toBeDefined();
      expect(windsurf?.detected).toBe(true);
      expect(windsurf?.displayName).toBe('Windsurf (Codeium)');
    });

    it('detect Roo Code client', () => {
      vi.mocked(fs.existsSync).mockImplementation((path) =>
        path.toString().includes('rooveterinaryinc.roo-cline'),
      );

      const clients = detectLLMClients();
      const roocode = clients.find((client) => client.name === 'roocode');

      expect(roocode).toBeDefined();
      expect(roocode?.detected).toBe(true);
      expect(roocode?.displayName).toBe('Roo Code (VSCode Extension)');
    });

    it('detect Claude Code CLI client', () => {
      vi.mocked(fs.existsSync).mockImplementation((path) =>
        path.toString().includes('.claude.json'),
      );

      const clients = detectLLMClients();
      const claudecode = clients.find((client) => client.name === 'claudecode');

      expect(claudecode).toBeDefined();
      expect(claudecode?.configExists).toBe(true);
      expect(claudecode?.displayName).toBe('Claude Code CLI');
    });

    it('detect Amazon Q client', () => {
      vi.mocked(fs.existsSync).mockImplementation((path) => path.toString().includes('amazonq'));

      const clients = detectLLMClients();
      const amazonq = clients.find((client) => client.name === 'amazonq');

      expect(amazonq).toBeDefined();
      expect(amazonq?.detected).toBe(true);
      expect(amazonq?.displayName).toBe('Amazon Q Developer');
    });

    it('set configExists to true when config file exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const clients = detectLLMClients();

      clients.forEach((client) => {
        expect(client.configExists).toBe(true);
        expect(client.detected).toBe(true);
      });
    });
  });

  describe('getAllSupportedClients', () => {
    it('return all 9 supported client names', () => {
      const clients = getAllSupportedClients();

      expect(clients).toHaveLength(9);
      expect(clients).toContain('claude');
      expect(clients).toContain('cline');
      expect(clients).toContain('continue');
      expect(clients).toContain('zed');
      expect(clients).toContain('cursor');
      expect(clients).toContain('windsurf');
      expect(clients).toContain('roocode');
      expect(clients).toContain('claudecode');
      expect(clients).toContain('amazonq');
    });
  });

  describe('supportsNativeMCP', () => {
    it('return true for all supported clients', () => {
      const supportedClients = [
        'claude',
        'cline',
        'continue',
        'zed',
        'cursor',
        'windsurf',
        'roocode',
        'claudecode',
        'amazonq',
      ];

      supportedClients.forEach((client) => {
        expect(supportsNativeMCP(client)).toBe(true);
      });
    });

    it('be case-insensitive', () => {
      expect(supportsNativeMCP('CLAUDE')).toBe(true);
      expect(supportsNativeMCP('Zed')).toBe(true);
      expect(supportsNativeMCP('CURSOR')).toBe(true);
    });

    it('return false for unsupported clients', () => {
      expect(supportsNativeMCP('unsupported-client')).toBe(false);
      expect(supportsNativeMCP('chatgpt')).toBe(false);
      expect(supportsNativeMCP('gemini')).toBe(false);
    });
  });

  describe('configureLLMClient', () => {
    const projectRoot = '/test/project';

    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.readFileSync).mockReturnValue('{}');
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
    });

    it('configure Claude Desktop', () => {
      const configured = configureLLMClient('claude', projectRoot);

      expect(configured).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('configure Zed editor', () => {
      const configured = configureLLMClient('zed', projectRoot);

      expect(configured).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('configure Cursor IDE', () => {
      const configured = configureLLMClient('cursor', projectRoot);

      expect(configured).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('configure Windsurf', () => {
      const configured = configureLLMClient('windsurf', projectRoot);

      expect(configured).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('configure Roo Code', () => {
      const configured = configureLLMClient('roocode', projectRoot);

      expect(configured).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('configure Claude Code CLI', () => {
      const configured = configureLLMClient('claudecode', projectRoot);

      expect(configured).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('configure Amazon Q', () => {
      const configured = configureLLMClient('amazonq', projectRoot);

      expect(configured).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('return false for unknown client', () => {
      const configured = configureLLMClient('unsupported-client', projectRoot);

      expect(configured).toBe(false);
    });
  });

  describe('getManualConfigInstructions', () => {
    const projectRoot = '/test/project';

    it('return instructions for Claude Desktop', () => {
      const instructions = getManualConfigInstructions('claude', projectRoot);

      expect(instructions).toContain('mcpServers');
      expect(instructions).toContain('ebay-mcp-server');
      expect(instructions).toContain('node');
    });

    it('return instructions for Zed editor', () => {
      const instructions = getManualConfigInstructions('zed', projectRoot);

      expect(instructions).toContain('context_servers');
      expect(instructions).toContain('ebay-mcp-server');
      expect(instructions).toContain('path');
    });

    it('return instructions for Cursor IDE', () => {
      const instructions = getManualConfigInstructions('cursor', projectRoot);

      expect(instructions).toContain('mcpServers');
      expect(instructions).toContain('ebay-mcp-server');
    });

    it('return instructions for Windsurf', () => {
      const instructions = getManualConfigInstructions('windsurf', projectRoot);

      expect(instructions).toContain('mcpServers');
      expect(instructions).toContain('ebay-mcp-server');
    });

    it('return instructions for Roo Code', () => {
      const instructions = getManualConfigInstructions('roocode', projectRoot);

      expect(instructions).toContain('mcpServers');
      expect(instructions).toContain('ebay-mcp-server');
    });

    it('return instructions for Claude Code CLI', () => {
      const instructions = getManualConfigInstructions('claudecode', projectRoot);

      expect(instructions).toContain('mcpServers');
      expect(instructions).toContain('ebay-mcp-server');
    });

    it('return instructions for Amazon Q', () => {
      const instructions = getManualConfigInstructions('amazonq', projectRoot);

      expect(instructions).toContain('mcpServers');
      expect(instructions).toContain('ebay-mcp-server');
    });

    it('return default message for unknown client', () => {
      const instructions = getManualConfigInstructions('unsupported-client', projectRoot);

      expect(instructions).toContain('not available');
    });
  });

  describe('verifyClientConfiguration', () => {
    const projectRoot = '/test/project';

    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
    });

    it('verify Claude Desktop configuration', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          mcpServers: {
            'ebay-mcp-server': { command: 'node', args: [] },
          },
        }),
      );

      const verified = verifyClientConfiguration('claude', projectRoot);

      expect(verified).toBe(true);
    });

    it('verify Zed configuration', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          context_servers: {
            'ebay-mcp-server': { command: { path: 'node' } },
          },
        }),
      );

      const verified = verifyClientConfiguration('zed', projectRoot);

      expect(verified).toBe(true);
    });

    it('verify Cursor configuration', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          mcpServers: {
            'ebay-mcp-server': { command: 'node', args: [] },
          },
        }),
      );

      const verified = verifyClientConfiguration('cursor', projectRoot);

      expect(verified).toBe(true);
    });

    it('verify Windsurf configuration', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          mcpServers: {
            'ebay-mcp-server': { command: 'node', args: [] },
          },
        }),
      );

      const verified = verifyClientConfiguration('windsurf', projectRoot);

      expect(verified).toBe(true);
    });

    it('verify Roo Code configuration', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          mcpServers: {
            'ebay-mcp-server': { command: 'node', args: [] },
          },
        }),
      );

      const verified = verifyClientConfiguration('roocode', projectRoot);

      expect(verified).toBe(true);
    });

    it('verify Claude Code CLI configuration', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          mcpServers: {
            'ebay-mcp-server': { command: 'node', args: [] },
          },
        }),
      );

      const verified = verifyClientConfiguration('claudecode', projectRoot);

      expect(verified).toBe(true);
    });

    it('verify Amazon Q configuration', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          mcpServers: {
            'ebay-mcp-server': { command: 'node', args: [] },
          },
        }),
      );

      const verified = verifyClientConfiguration('amazonq', projectRoot);

      expect(verified).toBe(true);
    });

    it('return false when config file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const verified = verifyClientConfiguration('claude', projectRoot);

      expect(verified).toBe(false);
    });

    it('return false when ebay-mcp-server is not configured', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({
          mcpServers: {},
        }),
      );

      const verified = verifyClientConfiguration('claude', projectRoot);

      expect(verified).toBe(false);
    });

    it('return false for unknown client', () => {
      const verified = verifyClientConfiguration('unsupported-client', projectRoot);

      expect(verified).toBe(false);
    });
  });

  describe('Platform-specific paths', () => {
    const testCases = [
      { platform: 'darwin', pathPart: 'Library' },
      { platform: 'win32', pathPart: 'AppData' },
      { platform: 'linux', pathPart: '.config' },
    ] as const;

    testCases.forEach(({ platform, pathPart }) => {
      it(`use correct paths on ${platform}`, () => {
        vi.mocked(os.platform).mockReturnValue(platform);
        vi.mocked(fs.existsSync).mockReturnValue(false);

        const clients = detectLLMClients();

        // Claude Desktop uses a platform-specific path.
        const claude = clients.find((client) => client.name === 'claude');
        expect(claude?.configPath).toContain(pathPart);
      });
    });
  });
});
