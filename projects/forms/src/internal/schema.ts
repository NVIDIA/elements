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

export function validateSchema(schema: Schema, value: unknown): { validity: Partial<ValidityState>; message: string } {
  // Base case: if schema is null/undefined or not an object, invalid schema
  if (!schema || typeof schema !== 'object') {
    // invalid schema, schema must be a non-null object
    return { validity: { badInput: true, valid: false }, message: 'invalid schema, schema must be a non-null object' };
  }

  // Handle typed schemas
  if (!('type' in schema)) {
    return { validity: { badInput: true, valid: false }, message: 'schema must have "type" property' };
  }

  const schemaType = schema.type;

  switch (schemaType) {
    case 'string': {
      if (typeof value !== 'string') {
        return { validity: { typeMismatch: true, valid: false }, message: `expected string, got ${typeof value}` };
      }
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        return {
          validity: { tooShort: true, valid: false },
          message: `string length ${value.length} is less than minimum length ${schema.minLength}`
        };
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        return {
          validity: { tooLong: true, valid: false },
          message: `string length ${value.length} is greater than maximum length ${schema.maxLength}`
        };
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        return {
          validity: { patternMismatch: true, valid: false },
          message: `string does not match pattern ${schema.pattern}`
        };
      }
      break;
    }

    case 'number': {
      if (typeof value !== 'number') {
        return {
          validity: { typeMismatch: true, valid: false },
          message: `expected type number, received type ${typeof value}`
        };
      }
      if (isNaN(value as unknown as number)) {
        return { validity: { typeMismatch: true, valid: false }, message: `expected type number, received type NaN` };
      }
      if (schema.minimum !== undefined && value < schema.minimum) {
        return {
          validity: { rangeUnderflow: true, valid: false },
          message: `number ${value} is less than minimum ${schema.minimum}`
        };
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        return {
          validity: { rangeOverflow: true, valid: false },
          message: `number ${value} is greater than maximum ${schema.maximum}`
        };
      }
      break;
    }

    case 'boolean': {
      if (typeof value !== 'boolean') {
        return { validity: { typeMismatch: true, valid: false }, message: `expected boolean, got ${typeof value}` };
      }
      break;
    }

    case 'array': {
      if (!Array.isArray(value)) {
        return {
          validity: { typeMismatch: true, valid: false },
          message: `expected type array, received type ${typeof value}`
        };
      }

      if (Array.isArray(value)) {
        if (schema.minItems !== undefined && value.length < schema.minItems) {
          return {
            validity: { rangeUnderflow: true, valid: false },
            message: `array length ${value.length} is less than minimum length ${schema.minItems}`
          };
        }

        if (schema.maxItems !== undefined && value.length > schema.maxItems) {
          return {
            validity: { rangeOverflow: true, valid: false },
            message: `array length ${value.length} is greater than maximum length ${schema.maxItems}`
          };
        }

        // check each item in the array
        for (const item of value) {
          const result = validateSchema(schema.items, item);
          if (!result.validity.valid) {
            return result;
          }
        }
      }
      break;
    }

    case 'object': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return {
          validity: { typeMismatch: true, valid: false },
          message: `expected type object, received type ${typeof value}`
        };
      }

      const valueProperties = Object.keys(value as object);
      const schemaProperties = Object.keys(schema.properties);

      // Check for extra properties not in schema
      const additionalProps = valueProperties.filter(prop => !schemaProperties.includes(prop));
      if (additionalProps.length > 0 && !schema.additionalProperties) {
        return {
          validity: { badInput: true, valid: false },
          message: `additional properties not allowed: ${additionalProps.join(', ')}`
        };
      }

      // Check each property
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        const propValue = (value as any)[prop]; // eslint-disable-line @typescript-eslint/no-explicit-any

        if (propValue === undefined) {
          if (schema.required?.includes(prop)) {
            return { validity: { valueMissing: true, valid: false }, message: `missing required property: ${prop}` };
          }
          continue;
        } else {
          const result = validateSchema(propSchema, propValue);
          if (!result.validity.valid) {
            return result;
          }
        }
      }
      break;
    }

    case 'enum': {
      if (!schema.enum.includes(value as string | number)) {
        return {
          validity: { typeMismatch: true, valid: false },
          message: `value must be one of: ${schema.enum.join(', ')}`
        };
      }
      break;
    }

    default: {
      return { validity: { badInput: true, valid: false }, message: `unsupported type: ${schemaType}` };
    }
  }

  return { validity: { valid: true }, message: '' };
}

export function parseControlValue<T>(value: string, schema: Schema): T | undefined {
  const schemaType = schema.type;
  let parsedValue: unknown;

  switch (schemaType) {
    case 'string': {
      parsedValue = value;
      break;
    }
    case 'number': {
      parsedValue = parseFloat(value);
      break;
    }
    case 'boolean': {
      parsedValue = !!value || value === 'true';
      break;
    }
    case 'array': {
      parsedValue = JSON.parse(value);
      break;
    }
    case 'object': {
      parsedValue = JSON.parse(value);
      break;
    }
    case 'enum': {
      parsedValue = schema.enum.includes(value) ? value : undefined;
      break;
    }
    default: {
      const _exhaustiveCheck: never = schemaType;
      return undefined;
    }
  }
  return parsedValue as T;
}
