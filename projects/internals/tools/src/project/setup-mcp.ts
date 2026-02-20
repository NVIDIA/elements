import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getNPMClient } from '../internal/node.js';
import type { Report } from '../internal/types.js';
import { claudeProjectSettings } from './starters.js';
import { skills } from '../skills/index.js';

export type IDE = 'cursor' | 'claude-code' | 'both';

const DESCRIPTION = 'NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples';

interface McpServerConfig {
  description: string;
  command: string;
  args?: string[];
  env: Record<string, string>;
}

export function getMcpServerConfig(client: 'npm' | 'pnpm', ide: 'cursor' | 'claude-code'): McpServerConfig {
  const env = { npm_config_registry: 'https://registry.npmjs.org' };

  if (ide === 'cursor') {
    const command =
      client === 'pnpm'
        ? 'pnpm --package=@nvidia-elements/cli@latest dlx nve-mcp'
        : 'npm exec --package=@nvidia-elements/cli@latest -y --prefer-online -- nve-mcp';
    return { description: DESCRIPTION, command, env };
  }

  // Claude Code uses command + args array
  if (client === 'pnpm') {
    return {
      description: DESCRIPTION,
      command: 'pnpm',
      args: ['--package=@nvidia-elements/cli@latest', 'dlx', 'nve-mcp'],
      env
    };
  }

  return {
    description: DESCRIPTION,
    command: 'npm',
    args: ['exec', '--package=@nvidia-elements/cli@latest', '-y', '--prefer-online', '--', 'nve-mcp'],
    env
  };
}

export function getConfigPath(cwd: string, ide: 'cursor' | 'claude-code'): string {
  return ide === 'cursor' ? resolve(join(cwd, '.cursor', 'mcp.json')) : resolve(join(cwd, '.mcp.json'));
}

export function writeMcpConfig(cwd: string, ide: 'cursor' | 'claude-code', client: 'npm' | 'pnpm'): string {
  const configPath = getConfigPath(cwd, ide);
  const serverConfig = getMcpServerConfig(client, ide);

  let existing: { mcpServers?: Record<string, unknown> } = {};
  try {
    if (existsSync(configPath)) {
      existing = JSON.parse(readFileSync(configPath, 'utf-8'));
    }
  } catch {
    // start fresh if file is invalid
  }

  const updated = {
    ...existing,
    mcpServers: {
      ...existing.mcpServers,
      elements: serverConfig
    }
  };

  const dir = configPath.substring(0, configPath.lastIndexOf('/'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(configPath, JSON.stringify(updated, null, 2) + '\n');
  return configPath;
}

function mergeArrays(existing: unknown, incoming: string[]): string[] {
  const base = Array.isArray(existing) ? (existing as string[]) : [];
  return [...new Set([...base, ...incoming])];
}

export function writeClaudeSettings(cwd: string): string {
  const settingsPath = resolve(join(cwd, '.claude', 'settings.json'));

  let existing: Record<string, unknown> = {};
  try {
    if (existsSync(settingsPath)) {
      existing = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    }
  } catch {
    // start fresh if file is invalid
  }

  const existingPermissions = (existing.permissions ?? {}) as Record<string, unknown>;
  const incomingPermissions = claudeProjectSettings.permissions;

  const updated: Record<string, unknown> = {
    ...existing,
    $schema: existing.$schema ?? claudeProjectSettings.$schema,
    permissions: {
      ...existingPermissions,
      allow: mergeArrays(existingPermissions.allow, incomingPermissions.allow)
    },
    enabledMcpjsonServers: mergeArrays(existing.enabledMcpjsonServers, claudeProjectSettings.enabledMcpjsonServers)
  };

  const dir = settingsPath.substring(0, settingsPath.lastIndexOf('/'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(settingsPath, JSON.stringify(updated, null, 2) + '\n');
  return settingsPath;
}

export function writeElementsSkill(cwd: string): string {
  const skill = skills.find(s => s.name === 'elements');
  if (!skill) {
    throw new Error('Elements skill not found');
  }

  const skillDir = resolve(join(cwd, '.claude', 'skills', skill.name));
  mkdirSync(skillDir, { recursive: true });

  const skillPath = join(skillDir, 'SKILL.md');
  const content = `---
name: ${skill.name}
title: ${skill.title}
description: ${skill.description}
---
${skill.context}`;

  writeFileSync(skillPath, content);
  return skillPath;
}

export async function setupMcpConfig(cwd: string, ide: IDE): Promise<Report> {
  const client = await getNPMClient();

  if (!client) {
    return {
      setup: {
        message: 'No package manager found. Install npm or pnpm and try again.',
        status: 'danger'
      }
    };
  }

  const ides: Array<'cursor' | 'claude-code'> = ide === 'both' ? ['cursor', 'claude-code'] : [ide];
  const report: Report = {};

  for (const target of ides) {
    try {
      const configPath = writeMcpConfig(cwd, target, client);
      const label = target === 'cursor' ? 'Cursor' : 'Claude Code';
      report[target] = {
        message: `${label} MCP configured at ${configPath}. Restart ${label} to activate.`,
        status: 'success'
      };

      if (target === 'claude-code') {
        const settingsPath = writeClaudeSettings(cwd);
        report['claude-settings'] = {
          message: `Claude Code project settings configured at ${settingsPath}.`,
          status: 'success'
        };
      }
    } catch (e) {
      const label = target === 'cursor' ? 'Cursor' : 'Claude Code';
      report[target] = {
        message: `Failed to configure ${label} MCP. ${e}`,
        status: 'danger'
      };
    }
  }

  try {
    const skillPath = writeElementsSkill(cwd);
    report['elements-skill'] = {
      message: `Elements skill file configured at ${skillPath}.`,
      status: 'success'
    };
  } catch (e) {
    report['elements-skill'] = {
      message: `Failed to configure Elements skill file. ${e}`,
      status: 'danger'
    };
  }

  return report;
}
