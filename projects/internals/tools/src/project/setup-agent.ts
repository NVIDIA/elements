// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getNPMClient } from '../internal/node.js';
import type { Report } from '../internal/types.js';
import { claudeProjectSettings } from './starters.js';
import { skills } from '../context/index.js';

export type IDE = 'cursor' | 'claude-code' | 'codex' | 'all';

const DESCRIPTION = 'NVIDIA Elements UI Design System (nve-*), custom element schemas, APIs and examples';

export interface McpServerConfig {
  description: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export function writeMcpJsonConfig(configPath: string): string {
  const jsonConfig: McpServerConfig = {
    description: DESCRIPTION,
    command: 'nve',
    args: ['mcp']
  };

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
      elements: jsonConfig
    }
  };

  const dir = configPath.substring(0, configPath.lastIndexOf('/'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(configPath, JSON.stringify(updated, null, 2) + '\n');
  return configPath;
}

export function writeMcpTomlConfig(configPath: string): string {
  let existing = '';
  try {
    if (existsSync(configPath)) {
      existing = readFileSync(configPath, 'utf-8');
    }
  } catch {
    // start fresh
  }

  const sectionRegex = new RegExp(`\\[mcp_servers\\.elements\\][\\s\\S]*?(?=\\n\\[|$)`);
  const content = existing.replace(sectionRegex, '').trimEnd();
  const block = `\n\n[mcp_servers.elements]\ncommand = "nve"\nargs = ["mcp"]\n`;
  const updated = (content + block).trimStart();
  const dir = configPath.substring(0, configPath.lastIndexOf('/'));

  mkdirSync(dir, { recursive: true });
  writeFileSync(configPath, updated);
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

export function writeElementsSkill(skillDir: string): string {
  const skill = skills.find(s => s.name === 'elements');
  if (!skill) {
    throw new Error('Elements skill not found');
  }

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

const VSCODE_HTML_CUSTOM_DATA = [
  './node_modules/@nvidia-elements/styles/dist/data.html.json',
  './node_modules/@nvidia-elements/core/dist/data.html.json',
  './node_modules/@nvidia-elements/monaco/dist/data.html.json',
  './node_modules/@nvidia-elements/code/dist/data.html.json',
  './node_modules/@nvidia-elements/markdown/dist/data.html.json'
];

export function writeVSCodeSettings(cwd: string): string {
  const settingsPath = resolve(join(cwd, '.vscode', 'settings.json'));

  let existing: Record<string, unknown> = {};
  try {
    if (existsSync(settingsPath)) {
      existing = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    }
  } catch {
    // start fresh if file is invalid
  }

  const updated = {
    ...existing,
    'html.customData': VSCODE_HTML_CUSTOM_DATA
  };

  const dir = settingsPath.substring(0, settingsPath.lastIndexOf('/'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(settingsPath, JSON.stringify(updated, null, 2) + '\n');
  return settingsPath;
}

export function writeAllAgentConfigs(dir: string): void {
  writeClaudeSettings(dir);
  writeMcpJsonConfig(resolve(join(dir, '.mcp.json')));
  writeMcpJsonConfig(resolve(join(dir, '.cursor', 'mcp.json')));
  writeMcpTomlConfig(resolve(join(dir, '.codex', 'config.toml')));
  writeElementsSkill(resolve(join(dir, '.agents', 'skills', 'elements')));
  writeElementsSkill(resolve(join(dir, '.claude', 'skills', 'elements')));
  writeVSCodeSettings(dir);
}

export async function setupAgent(cwd: string, ide: IDE): Promise<Report> {
  const dir = resolve(cwd);
  const client = await getNPMClient();

  if (!client) {
    return {
      setup: {
        message: 'No package manager found. Install npm or pnpm and try again.',
        status: 'danger'
      }
    };
  }

  const ides: Array<'cursor' | 'claude-code' | 'codex'> = ide === 'all' ? ['cursor', 'claude-code', 'codex'] : [ide];
  const report: Report = {};
  const labels: Record<string, string> = { cursor: 'Cursor', 'claude-code': 'Claude Code', codex: 'Codex' };

  for (const target of ides) {
    try {
      let message = `${labels[target]} configured. Restart ${labels[target]} to activate`;
      if (target === 'claude-code') {
        writeClaudeSettings(dir);
        writeElementsSkill(resolve(join(dir, '.claude', 'skills', 'elements')));
        writeMcpJsonConfig(resolve(join(dir, '.mcp.json')));
      }

      if (target === 'codex') {
        writeElementsSkill(resolve(join(dir, '.agents', 'skills', 'elements')));
        writeMcpTomlConfig(resolve(join(dir, '.codex', 'config.toml')));
      }

      if (target === 'cursor') {
        writeElementsSkill(resolve(join(dir, '.agents', 'skills', 'elements')));
        writeMcpJsonConfig(resolve(join(dir, '.cursor', 'mcp.json')));
        message = `${labels[target]} configured. Enable the MCP in the ${labels[target]} settings to activate`;
      }

      report[target] = {
        message,
        status: 'success'
      };
    } catch (e) {
      report[target] = {
        message: `**Failed to configure ${labels[target]}**: ${e}`,
        status: 'danger'
      };
    }
  }

  try {
    writeVSCodeSettings(dir);
    report['vscode-settings'] = {
      message: 'VSCode settings configured',
      status: 'success'
    };
  } catch (e) {
    report['vscode-settings'] = {
      message: `Failed to configure VSCode settings. ${e}`,
      status: 'danger'
    };
  }

  return report;
}
