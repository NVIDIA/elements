// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, it, expect } from 'vitest';
import { VERSION } from './index.js';

const NATIVE_BINARY_FILENAMES = new Map([
  ['darwin-arm64', 'nve-macos-arm64'],
  ['darwin-x64', 'nve-macos-x64'],
  ['linux-arm64', 'nve-linux-arm64'],
  ['linux-x64', 'nve-linux-x64'],
  ['win32-x64', 'nve-windows-x64.exe']
]);

describe('index', () => {
  const output = execFileSync(process.execPath, ['dist/index.js']).toString();

  it('should run the native binary for the current platform', () => {
    const binaryFilename = NATIVE_BINARY_FILENAMES.get(`${process.platform}-${process.arch}`);
    if (!binaryFilename) return;

    const binaryPath = join(import.meta.dirname, '../dist', binaryFilename);
    const nativeHelp = execFileSync(binaryPath, ['--help'], { encoding: 'utf-8' });

    expect(nativeHelp).toContain('nve api.validate [paths..]');
  });

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

  it('should hide the banner when output is not interactive', () => {
    expect(output).not.toContain('░██████████');
    expect(output).toContain('@nvidia-elements/cli');
  });

  it('should provide api.list', () => {
    expect(output).toContain('nve api.list [format]');
  });

  it('should provide api.validate with stdin support', () => {
    expect(output).toContain('nve api.validate [paths..]');
  });

  it('should expose metadata-driven validation options without raw template input', () => {
    const help = execFileSync(process.execPath, ['dist/index.js', 'api.validate', '--help']).toString();
    expect(help).toContain('--stdin');
    expect(help).toContain('--fix');
    expect(help).toContain('--max-diagnostics');
    expect(help).toMatch(/--lang[\s\S]*default: ["']html["']/);
    expect(help).not.toContain('--lang is required');
    expect(help).not.toContain('--maxDiagnostics');
    expect(help).not.toContain('--preset');
    expect(help).not.toContain('--template');
  });

  it('should return JSON diagnostics and a failing exit code for invalid stdin HTML', () => {
    const result = spawnSync(process.execPath, ['dist/index.js', 'api.validate', '--stdin', '--format', 'json'], {
      encoding: 'utf-8',
      input: '<nve-app-header></nve-app-header>'
    });
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('"ok": false');
    expect(result.stdout).toContain('no-deprecated-tags');
  });

  it('should require a JSON stdin filename', () => {
    const result = spawnSync(process.execPath, ['dist/index.js', 'api.validate', '--stdin', '--lang', 'json'], {
      encoding: 'utf-8',
      input: '{}'
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('filename is required');
  });

  it.each([
    {
      caseName: 'clean HTML',
      args: ['--stdin', '--format', 'json'],
      input: '<nve-button></nve-button>',
      expected: '"warnings": 0'
    },
    {
      caseName: 'HTML with warnings',
      args: ['--stdin', '--lang', 'html', '--format', 'json'],
      input: '<div class="flex"></div>',
      expected: '"warnings": 1'
    },
    {
      caseName: 'clean filename-scoped JSON',
      args: ['--stdin', '--lang', 'json', '--filename', 'package.json', '--format', 'json'],
      input: '{}',
      expected: '"files": 1'
    }
  ])('should accept $caseName stdin', ({ args, input, expected }) => {
    const result = spawnSync(process.execPath, ['dist/index.js', 'api.validate', ...args], {
      encoding: 'utf-8',
      input
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(expected);
  });

  it('should report the package rule for deprecated JSON stdin', () => {
    const result = spawnSync(
      process.execPath,
      ['dist/index.js', 'api.validate', '--stdin', '--lang', 'json', '--filename', 'package.json', '--format', 'json'],
      { encoding: 'utf-8', input: '{"dependencies":{"@nve-labs/lint":"1"}}' }
    );
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('no-deprecated-packages');
  });

  it('should map kebab-case diagnostic limits to the shared schema key', () => {
    const result = spawnSync(
      process.execPath,
      ['dist/index.js', 'api.validate', '--stdin', '--lang', 'html', '--max-diagnostics', '1', '--format', 'json'],
      { encoding: 'utf-8', input: '<nve-app-header></nve-app-header><nve-panel></nve-panel>' }
    );
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('"truncated": true');
    expect(result.stdout.match(/"rule"/g)).toHaveLength(1);
  });

  it.each([
    { caseName: 'file path', path: 'page.html', expectedFiles: 1 },
    { caseName: 'glob path', path: '*.html', expectedFiles: 2 }
  ])('should support $caseName mode', async ({ path, expectedFiles }) => {
    const cwd = await mkdtemp(join(tmpdir(), 'elements-cli-validate-'));
    try {
      await writeFile(join(cwd, 'page.html'), '<nve-button></nve-button>');
      await writeFile(join(cwd, 'second.html'), '<nve-button></nve-button>');
      const entry = join(import.meta.dirname, '../dist/index.js');
      const result = spawnSync(process.execPath, [entry, 'api.validate', path, '--format', 'json'], {
        cwd,
        encoding: 'utf-8'
      });
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(`"files": ${expectedFiles}`);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('should reject an empty glob', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'elements-cli-validate-'));
    try {
      const entry = join(import.meta.dirname, '../dist/index.js');
      const result = spawnSync(process.execPath, [entry, 'api.validate', 'missing-*.html', '--format', 'json'], {
        cwd,
        encoding: 'utf-8'
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('No files matched');
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('should reject stdin fixes', () => {
    const stdin = spawnSync(process.execPath, ['dist/index.js', 'api.validate', '--stdin', '--lang', 'html', '--fix'], {
      encoding: 'utf-8',
      input: '<nve-button></nve-button>'
    });
    expect(stdin.status).toBe(1);
  });

  it('should reject unreadable paths', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'elements-cli-validate-'));
    try {
      const filename = join(cwd, 'unreadable.html');
      const readFailureMock = join(cwd, 'read-failure-mock.mjs');
      await writeFile(filename, '<nve-button></nve-button>');
      await writeFile(
        readFailureMock,
        `import fsPromises from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';

const originalReadFile = fsPromises.readFile;
fsPromises.readFile = async (path, ...args) => {
  if (String(path).endsWith('unreadable.html')) {
    throw Object.assign(new Error('mock read failure'), { code: 'EACCES' });
  }
  return originalReadFile(path, ...args);
};
syncBuiltinESMExports();
`
      );
      const result = spawnSync(
        process.execPath,
        [
          '--import',
          pathToFileURL(readFailureMock).href,
          join(import.meta.dirname, '../dist/index.js'),
          'api.validate',
          'unreadable.html'
        ],
        {
          cwd,
          encoding: 'utf-8'
        }
      );
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('mock read failure');
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it('should provide examples.list', () => {
    expect(output).toContain('nve examples.list');
  });

  it('should provide examples.get', () => {
    expect(output).toContain('nve examples.get <id> [format]');
  });

  it('should provide api.get with variadic names', () => {
    expect(output).toContain('nve api.get [--format] <names..>');
    expect(output).not.toContain('nve api.get <names> [format]');
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

    it('should pass space-separated API names as one array argument', () => {
      const result = spawnSync(process.execPath, ['dist/index.js', 'api.get', 'nve-card', 'nve-input'], {
        timeout: 10000,
        encoding: 'utf-8',
        input: '',
        env: { ...process.env, CI: 'true' }
      });

      expect(result.status).toBe(0);
      expect(result.stderr).toBe('');
      expect(result.stdout).toContain('nve-card');
      expect(result.stdout).toContain('nve-input');
    });

    it('should accept an explicit format option after space-separated API names', () => {
      const result = spawnSync(
        process.execPath,
        ['dist/index.js', 'api.get', 'nve-card', 'nve-input', '--format', 'json'],
        {
          timeout: 10000,
          encoding: 'utf-8',
          input: '',
          env: { ...process.env, CI: 'true' }
        }
      );

      expect(result.status).toBe(0);
      expect(result.stderr).toBe('');
      expect(JSON.parse(result.stdout)).toEqual([
        expect.objectContaining({ name: 'nve-card' }),
        expect.objectContaining({ name: 'nve-input' })
      ]);
    });

    it('should reject array arguments that exceed the schema limit', () => {
      const result = spawnSync(
        process.execPath,
        ['dist/index.js', 'api.get', 'nve-card', 'nve-input', 'nve-button', 'nve-badge'],
        {
          timeout: 10000,
          encoding: 'utf-8',
          input: '',
          env: { ...process.env, CI: 'true' }
        }
      );

      expect(result.status).toBe(1);
      expect(result.stderr).toContain('api.get accepts at most 3 names.');
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
