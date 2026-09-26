// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Schema } from '@internals/tools';
import { Type, type TUnsafe } from 'typebox';

type PiToolInput = Record<string, unknown>;
type SchemaEntry = [string, unknown];

interface ApplyDefaultOptions {
  value: unknown;
  schema: Schema;
  cwd: string;
  propertyName?: string;
}

function getDefinedEntries(entries: SchemaEntry[]): SchemaEntry[] {
  return entries.filter((entry): entry is SchemaEntry => entry[1] !== undefined);
}

function sanitizeProperties(properties: Schema['properties']): Record<string, unknown> | undefined {
  if (!properties) return undefined;
  return Object.fromEntries(
    Object.entries(properties).map(([propertyName, propertySchema]) => [
      propertyName,
      sanitizeSchema(propertySchema, propertyName)
    ])
  );
}

function sanitizeSchema(schema: Schema, propertyName?: string): Record<string, unknown> {
  const defaultValue = propertyName === 'cwd' ? undefined : (schema.default ?? schema.defaultTemplate);
  return Object.fromEntries(
    getDefinedEntries([
      ['type', schema.type],
      ['description', schema.description],
      ['default', defaultValue === undefined ? undefined : structuredClone(defaultValue)],
      ['enum', schema.enum ? [...schema.enum] : undefined],
      ['minItems', schema.minItems],
      ['maxItems', schema.maxItems],
      ['oneOf', schema.oneOf?.map(item => sanitizeSchema(item))],
      ['properties', sanitizeProperties(schema.properties)],
      ['patternProperties', sanitizeProperties(schema.patternProperties)],
      ['additionalProperties', schema.additionalProperties],
      ['items', schema.items ? sanitizeSchema(schema.items) : undefined],
      ['required', schema.required ? [...schema.required] : undefined]
    ])
  );
}

function applyObjectDefaults(value: unknown, schema: Schema, cwd: string): PiToolInput {
  const input = typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as PiToolInput) : {};
  const properties = Object.fromEntries(
    Object.entries(schema.properties ?? {}).flatMap(([name, propertySchema]) => {
      const propertyValue = applyValueDefaults({ value: input[name], schema: propertySchema, cwd, propertyName: name });
      return propertyValue === undefined ? [] : [[name, propertyValue]];
    })
  );
  return { ...input, ...properties };
}

function applyValueDefaults({ value, schema, cwd, propertyName }: ApplyDefaultOptions): unknown {
  const defaultValue = propertyName === 'cwd' ? cwd : (schema.default ?? schema.defaultTemplate);
  const resolvedValue = value ?? (defaultValue === undefined ? undefined : structuredClone(defaultValue));
  if (schema.type === 'object') return applyObjectDefaults(resolvedValue, schema, cwd);
  if (schema.type === 'array' && schema.items && Array.isArray(resolvedValue)) {
    return resolvedValue.map(item => applyValueDefaults({ value: item, schema: schema.items!, cwd }));
  }
  return resolvedValue;
}

export function createPiToolParameters(schema?: Schema): TUnsafe<PiToolInput> {
  const sanitized = schema ? sanitizeSchema(schema) : { type: 'object', properties: {}, additionalProperties: false };
  return Type.Unsafe<PiToolInput>(sanitized);
}

export function applyPiToolInputDefaults(input: PiToolInput, schema: Schema | undefined, cwd: string): PiToolInput {
  if (!schema) return { ...input };
  return applyValueDefaults({ value: input, schema, cwd }) as PiToolInput;
}
