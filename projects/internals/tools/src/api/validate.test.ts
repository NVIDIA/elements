// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { chmod, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { PassThrough } from 'node:stream';
import { basename, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  formatValidationResult,
  readStdin,
  readValidationPaths,
  validate,
  validateVirtualFilename,
  type ValidationResult
} from './validate.js';

const directories: string[] = [];
async function temp() {
  const directory = await mkdtemp(join(tmpdir(), 'elements-validate-'));
  directories.push(directory);
  return directory;
}
afterEach(async () =>
  Promise.all(directories.splice(0).map(directory => rm(directory, { recursive: true, force: true })))
);

async function withStdin<T>(stream: PassThrough, callback: () => Promise<T>): Promise<T> {
  const original = process.stdin;
  Object.defineProperty(process, 'stdin', { configurable: true, value: stream });
  try {
    return await callback();
  } finally {
    Object.defineProperty(process, 'stdin', { configurable: true, value: original });
  }
}

describe('validate', () => {
  it('returns a stable HTML and JSON diagnostic contract', async () => {
    const result = await validate([
      { filename: 'page.html', source: '<nve-app-header></nve-app-header>', lang: 'html' },
      { filename: 'package.json', source: '{"dependencies":{"@nve-labs/lint":"1"}}', lang: 'json' }
    ]);
    expect({
      ok: result.ok,
      summary: result.summary,
      diagnostics: result.diagnostics.map(({ file, severity, rule, fixable }) => ({ file, severity, rule, fixable }))
    }).toMatchInlineSnapshot(`
      {
        "diagnostics": [
          {
            "file": "page.html",
            "fixable": false,
            "rule": "@nvidia-elements/lint/no-deprecated-tags",
            "severity": "error",
          },
          {
            "file": "page.html",
            "fixable": false,
            "rule": "@nvidia-elements/lint/no-unknown-tags",
            "severity": "error",
          },
          {
            "file": "package.json",
            "fixable": false,
            "rule": "@nvidia-elements/lint/no-deprecated-packages",
            "severity": "error",
          },
        ],
        "ok": false,
        "summary": {
          "errors": 3,
          "files": 2,
          "truncated": false,
          "warnings": 0,
        },
      }
    `);
    expect(result.diagnostics[0]).toMatchObject({ line: 1, column: 1, endLine: 1, suggestion: 'nve-page-header' });
  });

  it('keeps full counts when truncating and rejects invalid limits', async () => {
    const result = await validate(
      [{ filename: 'page.html', source: '<nve-app-header></nve-app-header><nve-panel></nve-panel>', lang: 'html' }],
      { maxDiagnostics: 1 }
    );
    expect(result).toMatchObject({ summary: { errors: 3, truncated: true } });
    expect(result.diagnostics).toHaveLength(1);
    await expect(validate([], { maxDiagnostics: 0 })).rejects.toThrow('positive integer');
  });

  it('reports warnings without failing', async () => {
    const result = await validate([{ filename: 'page.html', source: '<div class="flex"></div>', lang: 'html' }]);
    expect(result).toMatchObject({ ok: true, summary: { errors: 0, warnings: 1 } });
  });

  it('provides stable locations for ESLint diagnostics without source locations', async () => {
    const result = await validate([
      { filename: 'src/example.snippets.html', source: '<nve-button></nve-button>', lang: 'html' }
    ]);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        line: 1,
        column: 1,
        endLine: 1,
        endColumn: 1,
        rule: 'eslint'
      })
    ]);
  });

  it('never loads a local ESLint config', async () => {
    const cwd = await temp();
    await mkdir(join(cwd, 'src'));
    await writeFile(join(cwd, 'eslint.config.js'), "import 'unavailable-local-eslint-package'; export default [];");
    const result = await validate(
      [
        { filename: 'src/page.html', source: '<nve-app-header></nve-app-header>', lang: 'html' },
        { filename: 'src/package.json', source: '{\"dependencies\":{\"@nve-labs/lint\":\"1\"}}', lang: 'json' }
      ],
      { cwd }
    );
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule: '@nvidia-elements/lint/no-deprecated-tags' }),
        expect.objectContaining({ rule: '@nvidia-elements/lint/no-deprecated-packages' })
      ])
    );
  });

  it('rejects file and byte caps and rewrites fixable path input', async () => {
    await expect(
      validate(
        Array.from({ length: 201 }, (_, index) => ({
          filename: `${index}.html`,
          source: '<nve-button></nve-button>'
        }))
      )
    ).rejects.toThrow('200 files');
    await expect(
      validate([{ filename: 'page.html', source: 'x'.repeat(5 * 1024 * 1024 + 1), lang: 'html' }])
    ).rejects.toThrow('bytes');
    const cwd = await temp();
    await writeFile(join(cwd, 'page.html'), '<nve-button interaction="emphasize"></nve-button>');
    const [input] = await readValidationPaths(['page.html'], cwd);
    expect((await validate([input!], { cwd })).diagnostics.some(item => item.fixable)).toBe(true);
    await validate([input!], { cwd, fix: true });
    await expect(readValidationPaths(['page.html'], cwd)).resolves.toEqual([
      expect.objectContaining({ source: '<nve-button interaction="emphasis"></nve-button>' })
    ]);

    const outside = await temp();
    const outsidePath = join(outside, 'page.html');
    const outsideSource = '<nve-button interaction="emphasize"></nve-button>';
    await writeFile(outsidePath, outsideSource);
    await expect(
      validate([{ filename: 'page.html', source: outsideSource, path: outsidePath }], { cwd, fix: true })
    ).rejects.toThrow('Refusing to write outside');
    await expect(readFile(outsidePath, 'utf8')).resolves.toBe(outsideSource);
  });

  it('infers languages, reports parser errors, and rejects unsafe inputs', async () => {
    await expect(
      validate([
        { filename: 'page.htm', source: '<nve-button></nve-button>' },
        { filename: 'package.json', source: '{}' }
      ])
    ).resolves.toMatchObject({ ok: true, summary: { files: 2 } });
    await expect(validate([{ filename: 'notes.txt', source: 'text' }])).rejects.toThrow('Unsupported validation file');
    await expect(validate([{ filename: '../page.html', source: '<div></div>' }])).rejects.toThrow('outside');
    await expect(validate([{ filename: 'broken.json', source: '{' }])).resolves.toMatchObject({
      ok: false,
      summary: { errors: 1 }
    });
  });
});

describe('readValidationPaths', () => {
  it('honors gitignore and rejects traversal and symlink escapes', async () => {
    const cwd = await temp();
    await writeFile(join(cwd, '.gitignore'), '*.html\n!keep.html\n!outside.html\n');
    await writeFile(join(cwd, 'ignored.html'), '<nve-button></nve-button>');
    await writeFile(join(cwd, 'keep.html'), '<nve-button></nve-button>');
    await expect(readValidationPaths(['*.html'], cwd)).resolves.toEqual([
      expect.objectContaining({ filename: 'keep.html' })
    ]);
    await expect(readValidationPaths([join(cwd, 'keep.html')], cwd)).resolves.toEqual([
      expect.objectContaining({ filename: 'keep.html' })
    ]);
    await expect(readValidationPaths(['../*.html'], cwd)).rejects.toThrow('traversal');
    const outside = await temp();
    await writeFile(join(outside, 'outside.html'), '<nve-button></nve-button>');
    await symlink(join(outside, 'outside.html'), join(cwd, 'outside.html'));
    await expect(readValidationPaths(['outside.html'], cwd)).rejects.toThrow('outside');
    await writeFile(join(cwd, 'readme.txt'), 'text');
    await writeFile(join(outside, 'outside.txt'), 'text');
    await symlink(join(outside, 'outside.txt'), join(cwd, 'outside.txt'));
    await expect(readValidationPaths(['*.txt'], cwd)).rejects.toThrow('No supported');
    await expect(readValidationPaths(['readme.txt'], cwd)).rejects.toThrow('No supported');
  });

  it('enforces empty, unreadable, file-count, byte, and node_modules limits', async () => {
    const cwd = await temp();
    await expect(readValidationPaths(['missing.html'], cwd)).rejects.toThrow('No files matched');
    await writeFile(join(cwd, 'unreadable.html'), '<nve-button></nve-button>');
    await chmod(join(cwd, 'unreadable.html'), 0o000);
    try {
      if (process.platform !== 'win32' && process.getuid?.() !== 0) {
        await expect(readValidationPaths(['unreadable.html'], cwd)).rejects.toThrow(/EACCES/);
      }
    } finally {
      await chmod(join(cwd, 'unreadable.html'), 0o600);
    }
    await mkdir(join(cwd, 'many'));
    await Promise.all(
      Array.from({ length: 201 }, (_, index) => writeFile(join(cwd, `many/${index}.html`), '<nve-button></nve-button>'))
    );
    await writeFile(join(cwd, '.gitignore'), 'many/*.html\n!many/0.html\n');
    await expect(readValidationPaths(['many/*.html'], cwd)).resolves.toHaveLength(1);
    await rm(join(cwd, '.gitignore'));
    await expect(readValidationPaths(['many/*.html'], cwd)).rejects.toThrow('200 files');
    await writeFile(join(cwd, 'large.html'), 'x'.repeat(5 * 1024 * 1024 + 1));
    await expect(readValidationPaths(['large.html'], cwd)).rejects.toThrow('bytes');
    await mkdir(join(cwd, 'node_modules'));
    await writeFile(join(cwd, 'node_modules/skip.html'), '<nve-button></nve-button>');
    await expect(readValidationPaths(['node_modules/*.html'], cwd)).rejects.toThrow('No files matched');
  });

  it('handles missing and outside absolute patterns and gitignore read errors', async () => {
    const cwd = await temp();
    await expect(readValidationPaths([], cwd)).rejects.toThrow('one or more paths');
    const canonicalCwd = await realpath(cwd);
    await expect(readValidationPaths([join(canonicalCwd, 'missing.html')], cwd)).rejects.toThrow('No files matched');
    const outside = await temp();
    await writeFile(join(outside, 'outside.html'), '<nve-button></nve-button>');
    await expect(readValidationPaths([join(outside, 'outside.html')], cwd)).rejects.toThrow('outside');
    await mkdir(join(cwd, '.gitignore'));
    await expect(readValidationPaths(['*.html'], cwd)).rejects.toThrow();
  });

  it('treats existing file paths as literals instead of glob patterns', async () => {
    const cwd = await temp();
    await writeFile(join(cwd, '[slug].html'), '<nve-button></nve-button>');
    await writeFile(join(cwd, 's.html'), '<nve-button></nve-button>');
    await expect(readValidationPaths(['[slug].html'], cwd)).resolves.toEqual([
      expect.objectContaining({ filename: '[slug].html' })
    ]);
  });
});

describe('stdin and formatting helpers', () => {
  it('reads stdin until end and propagates stream errors', async () => {
    const stream = new PassThrough();
    await withStdin(stream, async () => {
      const result = readStdin();
      stream.end('hello');
      await expect(result).resolves.toBe('hello');
      expect(stream.listenerCount('data')).toBe(0);
      expect(stream.listenerCount('end')).toBe(0);
      expect(stream.listenerCount('error')).toBe(0);
    });

    const errorStream = new PassThrough();
    await withStdin(errorStream, async () => {
      const result = readStdin();
      errorStream.destroy(new Error('stdin failed'));
      await expect(result).rejects.toThrow('stdin failed');
      expect(errorStream.listenerCount('data')).toBe(0);
      expect(errorStream.listenerCount('end')).toBe(0);
      expect(errorStream.listenerCount('error')).toBe(0);
    });
  });

  it('rejects oversized stdin input', async () => {
    const stream = new PassThrough();
    await withStdin(stream, async () => {
      const result = readStdin();
      stream.write('x'.repeat(5 * 1024 * 1024 + 1));
      await expect(result).rejects.toThrow('bytes');
      expect(stream.listenerCount('data')).toBe(0);
      expect(stream.listenerCount('end')).toBe(0);
      expect(stream.listenerCount('error')).toBe(0);
      stream.destroy();
    });
  });

  it('formats passed and failed results', () => {
    const passed: ValidationResult = {
      ok: true,
      summary: { files: 1, errors: 0, warnings: 0, truncated: false },
      diagnostics: []
    };
    expect(formatValidationResult(passed)).toBe('## Validation passed\n\n1 file, 0 errors, 0 warnings');

    const failed: ValidationResult = {
      ok: false,
      summary: { files: 2, errors: 1, warnings: 1, truncated: true },
      diagnostics: [
        {
          file: 'page.html',
          line: 2,
          column: 3,
          endLine: 2,
          endColumn: 8,
          severity: 'error',
          rule: 'rule-a',
          message: 'bad tag',
          suggestion: 'nve-button',
          fixable: true
        },
        {
          file: 'page.html',
          line: 4,
          column: 1,
          endLine: 4,
          endColumn: 1,
          severity: 'warning',
          rule: 'rule-b',
          message: 'warning',
          fixable: false
        }
      ]
    };
    expect(formatValidationResult(failed)).toContain('## Validation found errors');
    expect(formatValidationResult(failed)).toContain('2 files, 1 errors, 1 warnings');
    expect(formatValidationResult(failed)).toContain('Suggestion: `nve-button`.');
  });

  it('normalizes virtual filenames and rejects paths outside cwd', async () => {
    const cwd = await temp();
    expect(validateVirtualFilename('src/page.html', cwd)).toBe('src/page.html');
    expect(validateVirtualFilename(cwd, cwd)).toBe(basename(cwd));
    expect(() => validateVirtualFilename('../page.html', cwd)).toThrow('outside');
  });
});
