// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { Schema } from '@internals/tools';
import { applyPiToolInputDefaults, createPiToolParameters } from './schema.js';

describe('Pi tool schema adapter', () => {
  it('should create an empty object schema for tools without input', () => {
    expect(createPiToolParameters()).toEqual({ type: 'object', properties: {}, additionalProperties: false });
  });

  it('should preserve standard JSON Schema fields', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        names: {
          type: 'array',
          description: 'Names',
          items: { type: 'string', enum: ['a', 'b'] },
          minItems: 1,
          maxItems: 2
        },
        value: { oneOf: [{ type: 'string' }, { type: 'number' }] }
      },
      patternProperties: { '^x-': { type: 'string' } },
      required: ['names'],
      additionalProperties: false
    };

    expect(createPiToolParameters(schema)).toEqual({
      type: 'object',
      properties: {
        names: {
          type: 'array',
          description: 'Names',
          items: { type: 'string', enum: ['a', 'b'] },
          minItems: 1,
          maxItems: 2
        },
        value: { oneOf: [{ type: 'string' }, { type: 'number' }] }
      },
      patternProperties: { '^x-': { type: 'string' } },
      required: ['names'],
      additionalProperties: false
    });
  });

  it('should remove adapter-specific schema fields', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        cwd: { type: 'string', default: '/stale' },
        template: { type: 'string', defaultTemplate: '<nve-button></nve-button>', service: true },
        mode: { type: 'string', enum: ['a'], enumNames: ['A'] }
      }
    };

    expect(createPiToolParameters(schema)).toEqual({
      type: 'object',
      properties: {
        cwd: { type: 'string' },
        template: { type: 'string', default: '<nve-button></nve-button>' },
        mode: { type: 'string', enum: ['a'] }
      }
    });
  });

  it('should apply defaults and current working directory without mutating input', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        cwd: { type: 'string', default: '/stale' },
        format: { type: 'string', default: 'markdown' },
        nested: {
          type: 'object',
          properties: { enabled: { type: 'boolean', default: true } }
        },
        values: { type: 'array', items: { type: 'object', properties: { count: { type: 'number', default: 1 } } } }
      }
    };
    const input = { values: [{}] };

    expect(applyPiToolInputDefaults(input, schema, '/project')).toEqual({
      cwd: '/project',
      format: 'markdown',
      nested: { enabled: true },
      values: [{ count: 1 }]
    });
    expect(input).toEqual({ values: [{}] });
  });

  it('should preserve additional input properties', () => {
    const schema: Schema = { type: 'object', additionalProperties: true };
    expect(applyPiToolInputDefaults({ custom: 'value' }, schema, '/project')).toEqual({ custom: 'value' });
  });

  it('should preserve explicit values', () => {
    const schema: Schema = {
      type: 'object',
      properties: { cwd: { type: 'string', default: '/stale' }, format: { type: 'string', default: 'markdown' } }
    };
    expect(applyPiToolInputDefaults({ cwd: '/other', format: 'json' }, schema, '/project')).toEqual({
      cwd: '/other',
      format: 'json'
    });
  });

  it('should copy input for tools without schemas', () => {
    const input = { value: 'test' };
    const result = applyPiToolInputDefaults(input, undefined, '/project');
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
  });
});
