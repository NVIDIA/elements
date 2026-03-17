import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getMcpServerConfig,
  getConfigPath,
  writeMcpConfig,
  writeClaudeSettings,
  writeElementsSkill,
  setupAgent
} from './setup-agent.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn()
}));

vi.mock('../internal/node.js', () => ({
  getNPMClient: vi.fn()
}));

vi.mock('./starters.js', () => ({
  claudeProjectSettings: {
    $schema: 'https://json.schemastore.org/claude-code-settings.json',
    permissions: {
      allow: ['mcp__elements__api_list', 'mcp__elements__api_get']
    },
    enabledMcpjsonServers: ['elements']
  }
}));

vi.mock('../context/index.js', () => ({
  skills: [
    {
      name: 'elements',
      title: 'Elements Design System (nve)',
      description: 'Build UI with NVIDIA Elements',
      context: '## Elements Context'
    }
  ]
}));

describe('setup-mcp', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getMcpServerConfig', () => {
    it('should return config for cursor (single command string)', () => {
      const config = getMcpServerConfig('cursor');
      expect(config.command).toBe('nve mcp');
      expect(config.args).toBeUndefined();
    });

    it('should return config for claude-code (command + args)', () => {
      const config = getMcpServerConfig('claude-code');
      expect(config.command).toBe('nve');
      expect(config.args).toEqual(['mcp']);
    });

    it('should return pnpm config for claude-code (command + args)', () => {
      const config = getMcpServerConfig('claude-code');
      expect(config.command).toBe('nve');
      expect(config.args).toEqual(['mcp']);
    });

    it('should include description in all configs', () => {
      const configs = [getMcpServerConfig('cursor'), getMcpServerConfig('claude-code')];
      for (const config of configs) {
        expect(config.description).toBe(
          'NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples'
        );
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

      writeMcpConfig('/project', 'claude-code');

      expect(mkdirSync).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.mcpServers.elements).toBeDefined();
      expect(written.mcpServers.elements.command).toBe('nve');
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

      writeMcpConfig('/project', 'claude-code');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.mcpServers['other-server']).toEqual({ command: 'other', description: 'Other MCP' });
      expect(written.mcpServers.elements).toBeDefined();
      expect(written.mcpServers.elements.command).toBe('nve');
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

      writeMcpConfig('/project', 'cursor');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.mcpServers.elements.command).toBe('nve mcp');
      expect(written.mcpServers.elements.description).toBe(
        'NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples'
      );
    });

    it('should preserve non-mcpServers properties in existing config', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
      const existing = {
        someOtherProperty: true,
        mcpServers: {}
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existing));

      writeMcpConfig('/project', 'claude-code');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.someOtherProperty).toBe(true);
    });

    it('should handle invalid JSON in existing config gracefully', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('not valid json');

      writeMcpConfig('/project', 'claude-code');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.mcpServers.elements).toBeDefined();
    });

    it('should create .cursor directory for cursor IDE', async () => {
      const { existsSync, mkdirSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      writeMcpConfig('/project', 'cursor');

      const dirArg = vi.mocked(mkdirSync).mock.calls[0][0] as string;
      expect(dirArg).toContain('.cursor');
    });

    it('should return the config file path', async () => {
      const { existsSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const result = writeMcpConfig('/project', 'cursor');
      expect(result).toContain('.cursor');
      expect(result).toContain('mcp.json');
    });
  });

  describe('writeClaudeSettings', () => {
    it('should create new settings file when none exists', async () => {
      const { existsSync, writeFileSync, mkdirSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      writeClaudeSettings('/project');

      expect(mkdirSync).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.$schema).toBe('https://json.schemastore.org/claude-code-settings.json');
      expect(written.permissions.allow).toContain('mcp__elements__api_list');
      expect(written.enabledMcpjsonServers).toContain('elements');
    });

    it('should merge permissions.allow without removing existing entries', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
      const existing = {
        permissions: {
          allow: ['user_custom_permission']
        }
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existing));

      writeClaudeSettings('/project');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.permissions.allow).toContain('user_custom_permission');
      expect(written.permissions.allow).toContain('mcp__elements__api_list');
      expect(written.permissions.allow).toContain('mcp__elements__api_get');
    });

    it('should deduplicate permissions.allow entries', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
      const existing = {
        permissions: {
          allow: ['mcp__elements__api_list', 'user_custom']
        }
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existing));

      writeClaudeSettings('/project');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      const apiListCount = written.permissions.allow.filter((p: string) => p === 'mcp__elements__api_list').length;
      expect(apiListCount).toBe(1);
    });

    it('should merge enabledMcpjsonServers without removing existing entries', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
      const existing = {
        enabledMcpjsonServers: ['other-server']
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existing));

      writeClaudeSettings('/project');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.enabledMcpjsonServers).toContain('other-server');
      expect(written.enabledMcpjsonServers).toContain('elements');
    });

    it('should preserve other existing permissions properties', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
      const existing = {
        permissions: {
          allow: [],
          deny: ['some_denied_tool']
        }
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existing));

      writeClaudeSettings('/project');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.permissions.deny).toEqual(['some_denied_tool']);
    });

    it('should preserve other top-level properties', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
      const existing = {
        customProperty: 'value',
        permissions: { allow: [] }
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existing));

      writeClaudeSettings('/project');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.customProperty).toBe('value');
    });

    it('should handle invalid JSON in existing settings gracefully', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('not valid json');

      writeClaudeSettings('/project');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.permissions.allow).toContain('mcp__elements__api_list');
    });

    it('should return the settings file path', async () => {
      const { existsSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const result = writeClaudeSettings('/project');
      expect(result).toContain('.claude');
      expect(result).toContain('settings.json');
    });
  });

  describe('writeElementsSkill', () => {
    it('should create skill file with correct content', async () => {
      const { writeFileSync, mkdirSync } = await import('node:fs');

      writeElementsSkill('/project');

      expect(mkdirSync).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();

      const skillPath = vi.mocked(writeFileSync).mock.calls[0][0] as string;
      expect(skillPath).toContain('.claude/skills/elements/SKILL.md');

      const content = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      expect(content).toContain('name: elements');
      expect(content).toContain('title: Elements Design System (nve)');
      expect(content).toContain('description: Build UI with NVIDIA Elements');
      expect(content).toContain('## Elements Context');
    });

    it('should create .claude/skills/elements directory', async () => {
      const { mkdirSync } = await import('node:fs');

      writeElementsSkill('/project');

      const dirArg = vi.mocked(mkdirSync).mock.calls[0][0] as string;
      expect(dirArg).toContain('.claude/skills/elements');
      expect(vi.mocked(mkdirSync).mock.calls[0][1]).toEqual({ recursive: true });
    });

    it('should return the skill file path', () => {
      const result = writeElementsSkill('/project');
      expect(result).toContain('.claude/skills/elements/SKILL.md');
    });
  });

  describe('setupMcpConfig', () => {
    it('should return danger report when no package manager is found', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      vi.mocked(getNPMClient).mockResolvedValue(null);

      const report = await setupAgent('/project', 'cursor');
      expect(report.setup).toBeDefined();
      expect(report.setup.status).toBe('danger');
      expect(report.setup.message).toContain('No package manager found');
    });

    it('should configure cursor IDE successfully', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { existsSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('npm');
      vi.mocked(existsSync).mockReturnValue(false);

      const report = await setupAgent('/project', 'cursor');
      expect(report.cursor).toBeDefined();
      expect(report.cursor.status).toBe('success');
      expect(report.cursor.message).toContain('Cursor configured');
      expect(report.cursor.message).toContain('Restart Cursor to activate');
    });

    it('should configure claude-code IDE successfully with settings', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { existsSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('pnpm');
      vi.mocked(existsSync).mockReturnValue(false);

      const report = await setupAgent('/project', 'claude-code');
      expect(report['claude-code']).toBeDefined();
      expect(report['claude-code'].status).toBe('success');
      expect(report['claude-code'].message).toContain('Claude Code configured');
      expect(report['claude-code'].message).toContain('Restart Claude Code to activate');
      expect(report['claude-settings']).toBeDefined();
      expect(report['claude-settings'].status).toBe('success');
      expect(report['claude-settings'].message).toContain('settings configured');
    });

    it('should configure both IDEs when ide is "both"', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { existsSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('npm');
      vi.mocked(existsSync).mockReturnValue(false);

      const report = await setupAgent('/project', 'both');
      expect(report.cursor).toBeDefined();
      expect(report.cursor.status).toBe('success');
      expect(report['claude-code']).toBeDefined();
      expect(report['claude-code'].status).toBe('success');
      expect(report['claude-settings']).toBeDefined();
      expect(report['claude-settings'].status).toBe('success');
    });

    it('should return danger report when writeMcpConfig throws for cursor', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { mkdirSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('npm');
      vi.mocked(mkdirSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const report = await setupAgent('/project', 'cursor');
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

      const report = await setupAgent('/project', 'claude-code');
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

      const report = await setupAgent('/project', 'both');
      expect(report.cursor.status).toBe('success');
      expect(report['claude-code'].status).toBe('danger');
    });

    it('should always configure elements skill regardless of IDE', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { existsSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('npm');
      vi.mocked(existsSync).mockReturnValue(false);

      for (const ide of ['cursor', 'claude-code', 'both'] as const) {
        vi.clearAllMocks();
        vi.mocked(getNPMClient).mockResolvedValue('npm');
        vi.mocked(existsSync).mockReturnValue(false);

        const report = await setupAgent('/project', ide);
        expect(report['elements-skill']).toBeDefined();
        expect(report['elements-skill'].status).toBe('success');
        expect(report['elements-skill'].message).toContain('Elements skill file configured');
      }
    });

    it('should not configure claude settings for cursor IDE', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { existsSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('npm');
      vi.mocked(existsSync).mockReturnValue(false);

      const report = await setupAgent('/project', 'cursor');
      expect(report['claude-settings']).toBeUndefined();
    });
  });
});
