// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { writeFileSync, unlinkSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ToolMethod } from '../internal/tools.js';
import { PlaygroundService } from './service.js';
import { createPlaygroundURL } from './utils.js';

// when ELEMENTS_PLAYGROUND_BASE_URL is not configured, createPlaygroundURL returns ''
const hasPlaygroundBaseURL = createPlaygroundURL('test', []).length > 0;

describe('PlaygroundService', () => {
  it('should provide validate', async () => {
    const env = process.env.ELEMENTS_ENV;
    process.env.ELEMENTS_ENV = 'mcp';
    const result = await PlaygroundService.validate({
      template: '<nve-button nve-layout="column">hello there</nve-button>'
    });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0].message).toContain(
      'Unexpected use of restricted attribute "nve-layout" on <nve-button>. Remove the attribute.'
    );
    expect(result[0].message).toContain('Supported attributes:');
    expect(result[0].line).toBe(1);
    expect(result[0].column).toBe(13);
    expect(result[0].endLine).toBe(1);
    expect(result[0].endColumn).toBe(32);
    expect(result[1].message).toBe(
      'Layout "column" is missing gap spacing. Add a gap value such as "xs", "sm", "md", "lg", "xl"'
    );
    expect((PlaygroundService.validate as ToolMethod<unknown>).metadata.name).toBe('validate');
    expect((PlaygroundService.validate as ToolMethod<unknown>).metadata.command).toBe('validate');
    expect((PlaygroundService.validate as ToolMethod<unknown>).metadata.description).toBe(
      'Validates HTML templates specifically for playground examples. Includes all checks from the "api_template_validate" tool with additional constraints to prevent common mistakes when generating standalone demos and playgrounds. Use this before calling playground_create.'
    );
    expect(
      (PlaygroundService.validate as ToolMethod<unknown>).metadata.inputSchema?.properties?.template
    ).toBeDefined();
    process.env.ELEMENTS_ENV = env;
  });

  it('should return warning for empty template', async () => {
    const env = process.env.ELEMENTS_ENV;
    process.env.ELEMENTS_ENV = 'mcp';
    const result = await PlaygroundService.validate({ template: '' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('empty-template');
    expect(result[0].severity).toBe('warn');
    expect(result[0].message).toContain('Template is empty');
    process.env.ELEMENTS_ENV = env;
  });

  it('should return warning for whitespace-only template', async () => {
    const env = process.env.ELEMENTS_ENV;
    process.env.ELEMENTS_ENV = 'mcp';
    const result = await PlaygroundService.validate({ template: '   \n  ' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('empty-template');
    process.env.ELEMENTS_ENV = env;
  });

  it('should provide create', async () => {
    const result = await PlaygroundService.create({
      template: '<nve-button></nve-button>',
      type: 'default',
      start: false
    });
    if (hasPlaygroundBaseURL) {
      expect(result).has.string('?version=1');
      expect(result).has.string('&layout=vertical-split');
      expect(result).has.string('&file=index.html');
      expect(result).has.string('&files=');
    } else {
      expect(result).toBe('');
    }
    expect((PlaygroundService.create as ToolMethod<unknown>).metadata.name).toBe('create');
    expect((PlaygroundService.create as ToolMethod<unknown>).metadata.command).toBe('create');
    expect((PlaygroundService.create as ToolMethod<unknown>).metadata.description).toBe(
      'Create a shareable playground URL from an HTML template. Returns URL if valid, or validation errors if invalid. Tip: Use playground_validate first to check for issues.'
    );
    expect((PlaygroundService.create as ToolMethod<unknown>).metadata.inputSchema?.properties?.template).toBeDefined();
  });

  describe('create', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.ELEMENTS_ENV;
    });

    afterEach(() => {
      process.env.ELEMENTS_ENV = originalEnv;
    });

    it('should return lint errors when template has validation errors in mcp environment', async () => {
      process.env.ELEMENTS_ENV = 'mcp';
      const result = await PlaygroundService.create({
        template: '<nve-button nve-layout="column">hello</nve-button>',
        start: false
      });
      expect(Array.isArray(result)).toBe(true);
      expect((result as unknown[]).length).toBeGreaterThan(0);
      expect((result as { message: string }[])[0].message).toContain(
        'Unexpected use of restricted attribute "nve-layout" on <nve-button>. Remove the attribute.'
      );
    });

    it('should return lint errors when template has validation errors in cli environment', async () => {
      process.env.ELEMENTS_ENV = 'cli';
      const result = await PlaygroundService.create({
        template: '<nve-button nve-layout="column">hello</nve-button>',
        start: false
      });
      expect(Array.isArray(result)).toBe(true);
      expect((result as unknown[]).length).toBeGreaterThan(0);
    });

    it('should skip validation and return URL when not in mcp or cli environment', async () => {
      process.env.ELEMENTS_ENV = 'browser';
      const result = await PlaygroundService.create({
        template: '<nve-button nve-layout="column">hello</nve-button>',
        start: false
      });
      expect(typeof result).toBe('string');
      if (hasPlaygroundBaseURL) {
        expect(result).has.string('?version=1');
      } else {
        expect(result).toBe('');
      }
    });

    it('should return URL when template passes lint in mcp environment', async () => {
      process.env.ELEMENTS_ENV = 'mcp';
      const CI = process.env.CI;
      process.env.CI = 'true';
      const result = await PlaygroundService.create({
        template: '<nve-button>valid</nve-button>',
        start: false
      });
      expect(typeof result).toBe('string');
      if (hasPlaygroundBaseURL) {
        expect(result).has.string('?version=1');
      } else {
        expect(result).toBe('');
      }
      process.env.CI = CI;
    });

    it('should include author in formatted name when provided', async () => {
      process.env.ELEMENTS_ENV = 'browser';
      const result = await PlaygroundService.create({
        template: '<nve-button>test</nve-button>',
        author: 'Claude',
        start: false
      });
      expect(typeof result).toBe('string');
      if (hasPlaygroundBaseURL) {
        expect(result).has.string('?version=1');
      } else {
        expect(result).toBe('');
      }
    });

    it('should handle undefined ELEMENTS_ENV', async () => {
      delete process.env.ELEMENTS_ENV;
      const result = await PlaygroundService.create({
        template: '<nve-button>test</nve-button>',
        start: false
      });
      expect(typeof result).toBe('string');
      if (hasPlaygroundBaseURL) {
        expect(result).has.string('?version=1');
      } else {
        expect(result).toBe('');
      }
    });
  });

  describe('validate', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.ELEMENTS_ENV;
    });

    afterEach(() => {
      process.env.ELEMENTS_ENV = originalEnv;
    });

    it('should return empty array when not in mcp or cli environment', async () => {
      process.env.ELEMENTS_ENV = 'browser';
      const result = await PlaygroundService.validate({
        template: '<nve-button nve-layout="column">hello</nve-button>'
      });
      expect(result).toEqual([]);
    });
  });

  describe('path input', () => {
    let tempDir: string;
    let tempFile: string;
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.ELEMENTS_ENV;
      tempDir = mkdtempSync(join(tmpdir(), 'playground-test-'));
      tempFile = join(tempDir, 'template.html');
    });

    afterEach(() => {
      process.env.ELEMENTS_ENV = originalEnv;
      try {
        unlinkSync(tempFile);
      } catch {
        // already cleaned up
      }
    });

    it('should expose path in validate inputSchema', () => {
      const metadata = (PlaygroundService.validate as ToolMethod<unknown>).metadata;
      expect(metadata.inputSchema?.properties?.path).toBeDefined();
      expect(metadata.inputSchema?.properties?.path.type).toBe('string');
    });

    it('should expose path in create inputSchema', () => {
      const metadata = (PlaygroundService.create as ToolMethod<unknown>).metadata;
      expect(metadata.inputSchema?.properties?.path).toBeDefined();
      expect(metadata.inputSchema?.properties?.path.type).toBe('string');
    });

    it('should not require template or path in validate inputSchema', () => {
      const metadata = (PlaygroundService.validate as ToolMethod<unknown>).metadata;
      expect(metadata.inputSchema?.required).toBeUndefined();
    });

    it('should not require template or path in create inputSchema', () => {
      const metadata = (PlaygroundService.create as ToolMethod<unknown>).metadata;
      expect(metadata.inputSchema?.required).toBeUndefined();
    });

    it('validate should read template from file path', async () => {
      process.env.ELEMENTS_ENV = 'mcp';
      writeFileSync(tempFile, '<nve-button>hello</nve-button>', 'utf8');
      const result = await PlaygroundService.validate({ path: tempFile });
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('validate should return lint errors from file path', async () => {
      process.env.ELEMENTS_ENV = 'mcp';
      writeFileSync(tempFile, '<nve-button nve-layout="column">hello</nve-button>', 'utf8');
      const result = await PlaygroundService.validate({ path: tempFile });
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].message).toContain('Unexpected use of restricted attribute "nve-layout"');
    });

    it('create should read template from file path', async () => {
      process.env.ELEMENTS_ENV = 'browser';
      writeFileSync(tempFile, '<nve-button>hello</nve-button>', 'utf8');
      const result = await PlaygroundService.create({ path: tempFile, start: false });
      expect(typeof result).toBe('string');
      if (hasPlaygroundBaseURL) {
        expect(result).has.string('?version=1');
      } else {
        expect(result).toBe('');
      }
    });

    it('create should return lint errors from file path in mcp environment', async () => {
      process.env.ELEMENTS_ENV = 'mcp';
      writeFileSync(tempFile, '<nve-button nve-layout="column">hello</nve-button>', 'utf8');
      const result = await PlaygroundService.create({ path: tempFile, start: false });
      expect(Array.isArray(result)).toBe(true);
      expect((result as { message: string }[])[0].message).toContain(
        'Unexpected use of restricted attribute "nve-layout"'
      );
    });

    it('should throw when both template and path are provided', async () => {
      writeFileSync(tempFile, '<nve-button>hello</nve-button>', 'utf8');
      await expect(
        PlaygroundService.validate({ template: '<nve-button>hello</nve-button>', path: tempFile })
      ).rejects.toThrow('Provide either "template" or "path", not both.');
    });

    it('should throw when neither template nor path is provided', async () => {
      await expect(PlaygroundService.validate({})).rejects.toThrow('Either "template" or "path" is required.');
    });

    it('should throw when file does not exist', async () => {
      await expect(PlaygroundService.validate({ path: '/nonexistent/file.html' })).rejects.toThrow();
    });
  });
});
