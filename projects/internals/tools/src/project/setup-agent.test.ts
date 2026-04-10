// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  writeMcpJsonConfig,
  writeMcpTomlConfig,
  writeClaudeSettings,
  writeElementsSkill,
  writeVSCodeSettings,
  writeAllAgentConfigs,
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

  describe('writeMcpJsonConfig', () => {
    it('should create new config file when none exists', async () => {
      const { existsSync, writeFileSync, mkdirSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      writeMcpJsonConfig('/project/.mcp.json');

      expect(mkdirSync).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.mcpServers.elements).toBeDefined();
      expect(written.mcpServers.elements.command).toBe('nve');
      expect(written.mcpServers.elements.args).toEqual(['mcp']);
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

      writeMcpJsonConfig('/project/.mcp.json');

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

      writeMcpJsonConfig('/project/.cursor/mcp.json');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.mcpServers.elements.command).toBe('nve');
      expect(written.mcpServers.elements.args).toEqual(['mcp']);
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

      writeMcpJsonConfig('/project/.mcp.json');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.someOtherProperty).toBe(true);
    });

    it('should handle invalid JSON in existing config gracefully', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('not valid json');

      writeMcpJsonConfig('/project/.mcp.json');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written.mcpServers.elements).toBeDefined();
    });

    it('should create parent directory', async () => {
      const { existsSync, mkdirSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      writeMcpJsonConfig('/project/.cursor/mcp.json');

      const dirArg = vi.mocked(mkdirSync).mock.calls[0][0] as string;
      expect(dirArg).toContain('.cursor');
    });

    it('should return the config file path', async () => {
      const { existsSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const result = writeMcpJsonConfig('/project/.cursor/mcp.json');
      expect(result).toContain('.cursor');
      expect(result).toContain('mcp.json');
    });
  });

  describe('writeMcpTomlConfig', () => {
    it('should create new TOML config when none exists', async () => {
      const { existsSync, writeFileSync, mkdirSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      writeMcpTomlConfig('/project/.codex/config.toml');

      expect(mkdirSync).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();

      const written = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      expect(written).toContain('[mcp_servers.elements]');
      expect(written).toContain('command = "nve"');
      expect(written).toContain('args = ["mcp"]');
    });

    it('should preserve existing servers in TOML config', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
      const existing = '[mcp_servers.other]\ncommand = "other-cmd"\n';

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existing);

      writeMcpTomlConfig('/project/.codex/config.toml');

      const written = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      expect(written).toContain('[mcp_servers.other]');
      expect(written).toContain('command = "other-cmd"');
      expect(written).toContain('[mcp_servers.elements]');
      expect(written).toContain('command = "nve"');
    });

    it('should overwrite existing elements entry in TOML config', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
      const existing = '[mcp_servers.elements]\ncommand = "old-cmd"\n';

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(existing);

      writeMcpTomlConfig('/project/.codex/config.toml');

      const written = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      expect(written).toContain('command = "nve"');
      expect(written).not.toContain('command = "old-cmd"');
    });

    it('should handle empty or invalid file gracefully', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('read error');
      });

      writeMcpTomlConfig('/project/.codex/config.toml');

      const written = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      expect(written).toContain('[mcp_servers.elements]');
    });

    it('should create parent directory', async () => {
      const { existsSync, mkdirSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      writeMcpTomlConfig('/project/.codex/config.toml');

      const dirArg = vi.mocked(mkdirSync).mock.calls[0][0] as string;
      expect(dirArg).toContain('.codex');
    });

    it('should return the config file path', async () => {
      const { existsSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const result = writeMcpTomlConfig('/project/.codex/config.toml');
      expect(result).toContain('.codex');
      expect(result).toContain('config.toml');
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

      writeElementsSkill('/project/.agents/skills/elements');

      expect(mkdirSync).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();

      const skillPath = vi.mocked(writeFileSync).mock.calls[0][0] as string;
      expect(skillPath).toContain('SKILL.md');

      const content = vi.mocked(writeFileSync).mock.calls[0][1] as string;
      expect(content).toContain('name: elements');
      expect(content).toContain('title: Elements Design System (nve)');
      expect(content).toContain('description: Build UI with NVIDIA Elements');
      expect(content).toContain('## Elements Context');
    });

    it('should create skill directory recursively', async () => {
      const { mkdirSync } = await import('node:fs');

      writeElementsSkill('/project/.agents/skills/elements');

      const dirArg = vi.mocked(mkdirSync).mock.calls[0][0] as string;
      expect(dirArg).toBe('/project/.agents/skills/elements');
      expect(vi.mocked(mkdirSync).mock.calls[0][1]).toEqual({ recursive: true });
    });

    it('should return the skill file path', () => {
      const result = writeElementsSkill('/project/.agents/skills/elements');
      expect(result).toContain('SKILL.md');
    });
  });

  describe('setupAgent', () => {
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
      expect(report.cursor.message).toContain('Enable the MCP');
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
    });

    it('should configure codex IDE successfully', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { existsSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('npm');
      vi.mocked(existsSync).mockReturnValue(false);

      const report = await setupAgent('/project', 'codex');
      expect(report.codex).toBeDefined();
      expect(report.codex.status).toBe('success');
      expect(report.codex.message).toContain('Codex configured');
      expect(report.codex.message).toContain('Restart Codex to activate');
    });

    it('should configure all IDEs when ide is "all"', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { existsSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('npm');
      vi.mocked(existsSync).mockReturnValue(false);

      const report = await setupAgent('/project', 'all');
      expect(report.cursor).toBeDefined();
      expect(report.cursor.status).toBe('success');
      expect(report['claude-code']).toBeDefined();
      expect(report['claude-code'].status).toBe('success');
      expect(report.codex).toBeDefined();
      expect(report.codex.status).toBe('success');
    });

    it('should return danger report when config throws for cursor', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { mkdirSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('npm');
      vi.mocked(mkdirSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const report = await setupAgent('/project', 'cursor');
      expect(report.cursor).toBeDefined();
      expect(report.cursor.status).toBe('danger');
      expect(report.cursor.message).toContain('Failed to configure Cursor');
      expect(report.cursor.message).toContain('Permission denied');
    });

    it('should return danger report when config throws for claude-code', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { mkdirSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('pnpm');
      vi.mocked(mkdirSync).mockImplementation(() => {
        throw new Error('Disk full');
      });

      const report = await setupAgent('/project', 'claude-code');
      expect(report['claude-code']).toBeDefined();
      expect(report['claude-code'].status).toBe('danger');
      expect(report['claude-code'].message).toContain('Failed to configure Claude Code');
      expect(report['claude-code'].message).toContain('Disk full');
    });

    it('should return danger report when config throws for codex', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { mkdirSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('npm');
      vi.mocked(mkdirSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const report = await setupAgent('/project', 'codex');
      expect(report.codex).toBeDefined();
      expect(report.codex.status).toBe('danger');
      expect(report.codex.message).toContain('Failed to configure Codex');
      expect(report.codex.message).toContain('Permission denied');
    });

    it('should handle partial failure when configuring all IDEs', async () => {
      const { getNPMClient } = await import('../internal/node.js');
      const { existsSync, mkdirSync } = await import('node:fs');
      vi.mocked(getNPMClient).mockResolvedValue('npm');
      vi.mocked(existsSync).mockReturnValue(false);

      let callCount = 0;
      vi.mocked(mkdirSync).mockImplementation(() => {
        callCount++;
        // cursor: writeElementsSkill(mkdir1) + writeMcpJsonConfig(mkdir2) = 2 calls
        if (callCount <= 2) {
          return undefined; // cursor succeeds
        }
        throw new Error('Permission denied'); // claude-code fails
      });

      const report = await setupAgent('/project', 'all');
      expect(report.cursor.status).toBe('success');
      expect(report['claude-code'].status).toBe('danger');
    });
  });

  describe('writeAllAgentConfigs', () => {
    it('should write all IDE configs to the directory', async () => {
      const { existsSync, writeFileSync, mkdirSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      writeAllAgentConfigs('/project');

      const writeCalls = vi.mocked(writeFileSync).mock.calls;
      const paths = writeCalls.map(call => call[0] as string);

      // claude settings
      expect(paths.some(p => p.includes('.claude/settings.json'))).toBe(true);
      // claude-code MCP JSON
      expect(paths.some(p => p.endsWith('.mcp.json'))).toBe(true);
      // cursor MCP JSON
      expect(paths.some(p => p.includes('.cursor/mcp.json'))).toBe(true);
      // codex TOML
      expect(paths.some(p => p.includes('.codex/config.toml'))).toBe(true);
      // shared agent skill
      expect(paths.some(p => p.includes('.agents/skills/elements/SKILL.md'))).toBe(true);
      // claude-code skill
      expect(paths.some(p => p.includes('.claude/skills/elements/SKILL.md'))).toBe(true);
      // vscode settings
      expect(paths.some(p => p.includes('.vscode/settings.json'))).toBe(true);

      expect(mkdirSync).toHaveBeenCalled();
    });
  });

  describe('writeVSCodeSettings', () => {
    it('should create new settings file when none exists', async () => {
      const { existsSync, writeFileSync, mkdirSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      writeVSCodeSettings('/project');

      expect(mkdirSync).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalled();

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written['html.customData']).toContain('./node_modules/@nvidia-elements/core/dist/data.html.json');
    });

    it('should preserve existing properties', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');
      const existing = { 'editor.fontSize': 14 };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existing));

      writeVSCodeSettings('/project');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written['editor.fontSize']).toBe(14);
      expect(written['html.customData']).toBeDefined();
    });

    it('should handle invalid JSON gracefully', async () => {
      const { existsSync, readFileSync, writeFileSync } = await import('node:fs');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('not valid json');

      writeVSCodeSettings('/project');

      const written = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(written['html.customData']).toBeDefined();
    });

    it('should return the settings file path', async () => {
      const { existsSync } = await import('node:fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const result = writeVSCodeSettings('/project');
      expect(result).toContain('.vscode');
      expect(result).toContain('settings.json');
    });
  });
});
