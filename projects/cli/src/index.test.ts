// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { execFileSync, spawnSync } from 'node:child_process';
import { describe, it, expect } from 'vitest';
import { VERSION } from './index.js';

describe('index', () => {
  const output = execFileSync(process.execPath, ['dist/index.js']).toString();

  function runWithoutRequiredArgs(command: string) {
    const result = spawnSync(process.execPath, ['dist/index.js', command], {
      timeout: 3000,
      encoding: 'utf-8',
      input: '' // close stdin so prompts don't hang
    });
    return `${result.stdout}${result.stderr}`;
  }

  it('should have a version', () => {
    expect(VERSION).toBe('0.0.0');
  });

  it('should have command formatting outlined', () => {
    expect(output).toContain('nve <cmd> [args]');
  });

  it('should provide api.list', () => {
    expect(output).toContain('nve api.list [format]');
  });

  it('should provide examples.list', () => {
    expect(output).toContain('nve examples.list');
  });

  it('should provide examples.get', () => {
    expect(output).toContain('nve examples.get <id> [format]');
  });

  it('should provide skills.list', () => {
    expect(output).toContain('nve skills.list [format]');
  });

  it('should provide skills.get', () => {
    expect(output).toContain('nve skills.get <name> [format]');
  });

  it('should conditionally provide playground.validate when url is available', () => {
    const hasPlayground = output.includes('nve playground.validate');
    expect(typeof hasPlayground).toBe('boolean');
  });

  it('should conditionally provide playground.create when url is available', () => {
    const hasPlayground = output.includes('nve playground.create');
    expect(typeof hasPlayground).toBe('boolean');
  });

  it('should provide project.create', () => {
    expect(output).toContain('nve project.create <type> [cwd] [start]');
  });

  it('should provide project.setup', () => {
    expect(output).toContain('nve project.setup [cwd]');
  });

  it('should provide project.validate', () => {
    expect(output).toContain('nve project.validate <type> [cwd]');
  });

  it('should provide tokens.list', () => {
    expect(output).toContain('nve api.tokens.list [format]');
  });

  it('should not show hidden install command', () => {
    expect(output).not.toContain('nve install');
  });

  describe('interactive fallback for missing required args', () => {
    it('should not exit with validation error for project.create without <type>', () => {
      const result = runWithoutRequiredArgs('project.create');
      expect(result).not.toContain('Not enough non-option arguments');
      expect(result).not.toContain('Missing required argument');
    });

    it('should not exit with validation error for api.get without <names>', () => {
      const result = runWithoutRequiredArgs('api.get');
      expect(result).not.toContain('Not enough non-option arguments');
      expect(result).not.toContain('Missing required argument');
    });

    it('should not exit with validation error for project.validate without <type>', () => {
      const result = runWithoutRequiredArgs('project.validate');
      expect(result).not.toContain('Not enough non-option arguments');
      expect(result).not.toContain('Missing required argument');
    });
  });

  describe('fail handler', () => {
    it('should exit with code 1 for invalid positional choice values', () => {
      const result = spawnSync(process.execPath, ['dist/index.js', 'project.create', 'not-a-valid-type'], {
        timeout: 5000,
        encoding: 'utf-8',
        input: ''
      });
      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('Invalid values');
    });
  });

  describe('comma-separated array argument parsing', () => {
    it('should split a comma-separated string into individual values for array-type args', () => {
      const result = spawnSync(process.execPath, ['dist/index.js', 'api.get', 'nve-foo,nve-bar'], {
        timeout: 10000,
        encoding: 'utf-8',
        input: ''
      });
      const combined = `${result.stdout}${result.stderr}`;
      expect(combined).not.toContain('"nve-foo,nve-bar"');
      expect(combined).toContain('nve-foo');
      expect(combined).toContain('nve-bar');
    });
  });

  describe('tool errors', () => {
    it('should exit with error when exact api lookup has no matches', () => {
      const result = spawnSync(process.execPath, ['dist/index.js', 'api.get', 'nve-badges'], {
        timeout: 10000,
        encoding: 'utf-8',
        input: ''
      });

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('No components or APIs found matching');
      expect(result.stderr).toContain('nve-badges');
    });

    it('should print structured error results when they are available', () => {
      const result = spawnSync(
        process.execPath,
        ['dist/index.js', 'playground.create', '<nve-button nve-layout="column">hello</nve-button>'],
        {
          timeout: 10000,
          encoding: 'utf-8',
          input: '',
          env: { ...process.env, CI: 'true', ELEMENTS_PLAYGROUND_BASE_URL: 'https://playground.example' }
        }
      );
      const lintMessages = JSON.parse(result.stderr) as { message: string }[];

      expect(result.status).toBe(1);
      expect(result.stdout).toBe('');
      expect(Array.isArray(lintMessages)).toBe(true);
      expect(lintMessages[0]?.message).toContain('Unexpected use of restricted attribute "nve-layout"');
    });
  });
});
