import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMcpServerConfig, getConfigPath, writeMcpConfig, setupMcpConfig } from './setup-mcp.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn()
}));

vi.mock('../internal/node.js', () => ({
  getNPMClient: vi.fn()
}));

describe('setup-mcp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMcpServerConfig', () => {
    it('should return npm config for cursor (single command string)', () => {
      const config = getMcpServerConfig('npm', 'cursor');
      expect(config.command).toBe('npm exec --package=@nvidia-elements/cli@latest -y --prefer-online -- nve-mcp');
      expect(config.args).toBeUndefined();
      expect(config.env.npm_config_registry).toContain('registry.npmjs.org');
    });

    it('should return pnpm config for cursor (single command string)', () => {
      const config = getMcpServerConfig('pnpm', 'cursor');
      expect(config.command).toBe('pnpm --package=@nvidia-elements/cli@latest dlx nve-mcp');
      expect(config.args).toBeUndefined();
    });

    it('should return npm config for claude-code (command + args)', () => {
      const config = getMcpServerConfig('npm', 'claude-code');
      expect(config.command).toBe('npm');
      expect(config.args).toEqual(['exec', '--package=@nvidia-elements/cli@latest', '-y', '--prefer-online', '--', 'nve-mcp']);
    });

    it('should return pnpm config for claude-code (command + args)', () => {
      const config = getMcpServerConfig('pnpm', 'claude-code');
      expect(config.command).toBe('pnpm');
      expect(config.args).toEqual(['--package=@nvidia-elements/cli@latest', 'dlx', 'nve-mcp']);
    });

    it('should include description in all configs', () => {
      const configs = [
        getMcpServerConfig('npm', 'cursor'),
        getMcpServerConfig('pnpm', 'cursor'),
        getMcpServerConfig('npm', 'claude-code'),
        getMcpServerConfig('pnpm', 'claude-code')
      ];
      for (const config of configs) {
        expect(config.description).toBe('Elements API and Custom Element Schema');
      }
    });
  });

  describe('getConfigPath', () => {
    it('should return .cursor/mcp.json for cursor', () => {
      const path = getConfigPath('/project', 'cursor');
      expect(path).toContain('.cursor');
      expect(path).toContain('mcp.json');
    });

    it('should return .mcp.json for claude-code', () => {
      const path = getConfigPath('/project', 'claude-code');
      expect(path).toContain('.mcp.json');
      expect(path).not.toContain('.cursor');
    });
  });

  describe('writeMcpConfig', () => {
    it('should create new config file when none exists', async () => {
      const { existsSync, writeFileSync, mkdirSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      writeMcpConfig('/project', 'claude-code', 'npm');

      expect(mkdirSync).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.mcpServers.elements).toBeDefined();
      expect(written.mcpServers.elements.command).toBe('npm');
    });

    it('should merge into existing config preserving other servers', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
      const existing = {
        mcpServers: {
          'other-server': { command: 'other', description: 'Other MCP' }
        }
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existing));

      writeMcpConfig('/project', 'claude-code', 'pnpm');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.mcpServers['other-server']).toEqual({ command: 'other', description: 'Other MCP' });
      expect(written.mcpServers.elements).toBeDefined();
      expect(written.mcpServers.elements.command).toBe('pnpm');
    });

    it('should overwrite existing elements config', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
      const existing = {
        mcpServers: {
          elements: { command: 'old-command', description: 'Old' }
        }
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existing));

      writeMcpConfig('/project', 'cursor', 'npm');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.mcpServers.elements.command).toContain('npm exec');
      expect(written.mcpServers.elements.description).toBe('Elements API and Custom Element Schema');
    });

    it('should preserve non-mcpServers properties in existing config', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
      const existing = {
        someOtherProperty: true,
        mcpServers: {}
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existing));

      writeMcpConfig('/project', 'claude-code', 'npm');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.someOtherProperty).toBe(true);
    });

    it('should handle invalid JSON in existing config gracefully', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('not valid json');

      writeMcpConfig('/project', 'claude-code', 'npm');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.mcpServers.elements).toBeDefined();
    });

    it('should create .cursor directory for cursor IDE', async () => {
      const { existsSync, mkdirSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      writeMcpConfig('/project', 'cursor', 'npm');

      const dirArg = vi.mocked(mkdirSync).mock.calls[0][0] as string;
      expect(dirArg).toContain('.cursor');
    });

    it('should return the config file path', async () => {
      const { existsSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const result = writeMcpConfig('/project', 'cursor', 'npm');
      expect(result).toContain('.cursor');
      expect(result).toContain('mcp.json');
    });
  });

  describe('setupMcpConfig', () => {
    it('should return danger report when no package manager is found', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      vi.mocked(getNPMClient).mockResolvedValue(null);

      const report = await setupMcpConfig('/project', 'cursor');
      expect(report.setup).toBeDefined();
      expect(report.setup.status).toBe('danger');
      expect(report.setup.message).toContain('No package manager found');
    });

    it('should configure cursor IDE successfully', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { existsSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('npm');
      vi.mocked(existsSync).mockReturnValue(false);

      const report = await setupMcpConfig('/project', 'cursor');
      expect(report.cursor).toBeDefined();
      expect(report.cursor.status).toBe('success');
      expect(report.cursor.message).toContain('Cursor MCP configured');
      expect(report.cursor.message).toContain('Restart Cursor');
    });

    it('should configure claude-code IDE successfully', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { existsSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('pnpm');
      vi.mocked(existsSync).mockReturnValue(false);

      const report = await setupMcpConfig('/project', 'claude-code');
      expect(report['claude-code']).toBeDefined();
      expect(report['claude-code'].status).toBe('success');
      expect(report['claude-code'].message).toContain('Claude Code MCP configured');
      expect(report['claude-code'].message).toContain('Restart Claude Code');
    });

    it('should configure both IDEs when ide is "both"', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { existsSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('npm');
      vi.mocked(existsSync).mockReturnValue(false);

      const report = await setupMcpConfig('/project', 'both');
      expect(report.cursor).toBeDefined();
      expect(report.cursor.status).toBe('success');
      expect(report['claude-code']).toBeDefined();
      expect(report['claude-code'].status).toBe('success');
    });

    it('should return danger report when writeMcpConfig throws for cursor', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { mkdirSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('npm');
      vi.mocked(mkdirSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const report = await setupMcpConfig('/project', 'cursor');
      expect(report.cursor).toBeDefined();
      expect(report.cursor.status).toBe('danger');
      expect(report.cursor.message).toContain('Failed to configure Cursor MCP');
      expect(report.cursor.message).toContain('Permission denied');
    });

    it('should return danger report when writeMcpConfig throws for claude-code', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { mkdirSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('pnpm');
      vi.mocked(mkdirSync).mockImplementation(() => {
        throw new Error('Disk full');
      });

      const report = await setupMcpConfig('/project', 'claude-code');
      expect(report['claude-code']).toBeDefined();
      expect(report['claude-code'].status).toBe('danger');
      expect(report['claude-code'].message).toContain('Failed to configure Claude Code MCP');
      expect(report['claude-code'].message).toContain('Disk full');
    });

    it('should handle partial failure when configuring both IDEs', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { existsSync, mkdirSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('npm');
      vi.mocked(existsSync).mockReturnValue(false);

      let callCount = 0;
      vi.mocked(mkdirSync).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return undefined; // cursor succeeds
        }
        throw new Error('Permission denied'); // claude-code fails
      });

      const report = await setupMcpConfig('/project', 'both');
      expect(report.cursor.status).toBe('success');
      expect(report['claude-code'].status).toBe('danger');
    });
  });
});
