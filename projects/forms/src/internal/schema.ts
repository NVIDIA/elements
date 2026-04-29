// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Schema } from './types.js';
import { FormControlError } from './errors.js';

export function parseValueSchema<T>(formControlName: string, value: string, schema: Schema): T {
  const parsedValue = parseControlValue(value, schema);
  if (parsedValue === undefined) {
    throw new FormControlError(formControlName, `unsupported value type ${typeof value}`);
  }
  return parsedValue as T;
}

type ValidationResult = { validity: Partial<ValidityState>; message: string };

const VALID: ValidationResult = { validity: { valid: true }, message: '' };

function invalid(validity: Partial<ValidityState>, message: string): ValidationResult {
  return { validity: { ...validity, valid: false }, message };
}

function validateString(schema: Schema & { type: 'string' }, value: unknown): ValidationResult {
  if (typeof value !== 'string') {
    return invalid({ typeMismatch: true }, `expected string, got ${typeof value}`);
  }
  if (schema.minLength !== undefined && value.length < schema.minLength) {
    return invalid({ tooShort: true }, `string length ${value.length} is less than minimum length ${schema.minLength}`);
  }
  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    return invalid(
      { tooLong: true },
      `string length ${value.length} is greater than maximum length ${schema.maxLength}`
    );
  }
  if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
    return invalid({ patternMismatch: true }, `string does not match pattern ${schema.pattern}`);
  }
  return VALID;
}

function validateNumber(schema: Schema & { type: 'number' }, value: unknown): ValidationResult {
  if (typeof value !== 'number') {
    return invalid({ typeMismatch: true }, `expected type number, received type ${typeof value}`);
  }
  if (isNaN(value as unknown as number)) {
    return invalid({ typeMismatch: true }, `expected type number, received type NaN`);
  }
  if (schema.minimum !== undefined && value < schema.minimum) {
    return invalid({ rangeUnderflow: true }, `number ${value} is less than minimum ${schema.minimum}`);
  }
  if (schema.maximum !== undefined && value > schema.maximum) {
    return invalid({ rangeOverflow: true }, `number ${value} is greater than maximum ${schema.maximum}`);
  }
  return VALID;
}

function validateBoolean(value: unknown): ValidationResult {
  if (typeof value !== 'boolean') {
    return invalid({ typeMismatch: true }, `expected boolean, got ${typeof value}`);
  }
  return VALID;
}

function validateArray(schema: Schema & { type: 'array' }, value: unknown): ValidationResult {
  if (!Array.isArray(value)) {
    return invalid({ typeMismatch: true }, `expected type array, received type ${typeof value}`);
  }
  if (schema.minItems !== undefined && value.length < schema.minItems) {
    return invalid(
      { rangeUnderflow: true },
      `array length ${value.length} is less than minimum length ${schema.minItems}`
    );
  }
  if (schema.maxItems !== undefined && value.length > schema.maxItems) {
    return invalid(
      { rangeOverflow: true },
      `array length ${value.length} is greater than maximum length ${schema.maxItems}`
    );
  }
  for (const item of value) {
    const result = validateSchema(schema.items, item);
    if (!result.validity.valid) {
      return result;
    }
  }
  return VALID;
}

function validateObjectProperty(
  property: { name: string; schema: Schema },
  value: Record<string, unknown>,
  required?: string[]
): ValidationResult {
  const { name, schema: propSchema } = property;
  const propValue = value[name];
  if (propValue === undefined) {
    if (required?.includes(name)) {
      return invalid({ valueMissing: true }, `missing required property: ${name}`);
    }
    return VALID;
  }
  return validateSchema(propSchema, propValue);
}

function validateObject(schema: Schema & { type: 'object' }, value: unknown): ValidationResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return invalid({ typeMismatch: true }, `expected type object, received type ${typeof value}`);
  }

  const valueProperties = Object.keys(value as object);
  const schemaProperties = Object.keys(schema.properties);

  const additionalProps = valueProperties.filter(prop => !schemaProperties.includes(prop));
  if (additionalProps.length > 0 && !schema.additionalProperties) {
    return invalid({ badInput: true }, `additional properties not allowed: ${additionalProps.join(', ')}`);
  }

  for (const [prop, propSchema] of Object.entries(schema.properties)) {
    const result = validateObjectProperty(
      { name: prop, schema: propSchema },
      value as Record<string, unknown>,
      schema.required
    );
    if (!result.validity.valid) {
      return result;
    }
  }
  return VALID;
}

function validateEnum(schema: Schema & { type: 'enum' }, value: unknown): ValidationResult {
  if (!schema.enum.includes(value as string | number)) {
    return invalid({ typeMismatch: true }, `value must be one of: ${schema.enum.join(', ')}`);
  }
  return VALID;
}

export function validateSchema(schema: Schema, value: unknown): ValidationResult {
  if (!schema || typeof schema !== 'object') {
    return invalid({ badInput: true }, 'invalid schema, schema must be a non-null object');
  }

  if (!('type' in schema)) {
    return invalid({ badInput: true }, 'schema must have "type" property');
  }

  switch (schema.type) {
    case 'string':
      return validateString(schema, value);
    case 'number':
      return validateNumber(schema, value);
    case 'boolean':
      return validateBoolean(value);
    case 'array':
      return validateArray(schema, value);
    case 'object':
      return validateObject(schema, value);
    case 'enum':
      return validateEnum(schema, value);
    default:
      return invalid({ badInput: true }, `unsupported type: ${(schema as { type: string }).type}`);
  }
}

export function parseControlValue<T>(value: string, schema: Schema): T | undefined {
  const schemaType = schema.type;

  switch (schemaType) {
    case 'string':
      return value as T;
    case 'number':
      return parseFloat(value) as T;
    case 'boolean':
      return (!!value || value === 'true') as T;
    case 'array':
    case 'object':
      return JSON.parse(value) as T;
    case 'enum':
      return (schema.enum.includes(value) ? value : undefined) as T;
    default: {
      const _exhaustiveCheck: never = schemaType;
      return undefined;
    }
  }
}
