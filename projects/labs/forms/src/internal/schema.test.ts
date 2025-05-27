import { describe, it, expect } from 'vitest';
import type { Schema } from './types.js';
import { parseControlValue, validateSchema } from './schema.js';

describe('valueSchemaValidator', () => {
  it('should validate an invalid schema', () => {
    const schema: Schema = null;
    const value = 'test';
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.badInput).toBe(true);
    expect(result.message).toBe('invalid schema, schema must be a non-null object');
  });

  it('should validate an invalid schema', () => {
    const schema = {};
    const value = 'test';
    const result = validateSchema(schema as Schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.badInput).toBe(true);
    expect(result.message).toBe('schema must have "type" property');
  });

  it('should validate a valid string', () => {
    const schema: Schema = { type: 'string' };
    const value = 'test';
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(true);
    expect(Object.keys(result.validity).length).toBe(1);
    expect(result.message).toBe('');
  });

  it('should validate an invalid string', () => {
    const schema: Schema = { type: 'string' };
    const value = 0;
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.typeMismatch).toBe(true);
    expect(result.message).toBe('expected string, got number');
  });

  it('should validate an invalid string minLength', () => {
    const schema: Schema = { type: 'string', minLength: 5 };
    const value = 'test';
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.tooShort).toBe(true);
    expect(result.message).toBe('string length 4 is less than minimum length 5');
  });

  it('should validate an invalid string maxLength', () => {
    const schema: Schema = { type: 'string', maxLength: 5 };
    const value = '123456';
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.tooLong).toBe(true);
    expect(result.message).toBe('string length 6 is greater than maximum length 5');
  });

  it('should validate an invalid string pattern', () => {
    const schema: Schema = { type: 'string', pattern: '^[a-z]+$' };
    const value = '123456';
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.patternMismatch).toBe(true);
    expect(result.message).toBe('string does not match pattern ^[a-z]+$');
  });

  it('should validate a number', () => {
    const schema: Schema = { type: 'number' };
    const value = 123;
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(true);
    expect(Object.keys(result.validity).length).toBe(1);
    expect(result.message).toBe('');
  });

  it('should validate an invalid number', () => {
    const schema: Schema = { type: 'number' };
    const value = '123';
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.typeMismatch).toBe(true);
    expect(result.message).toBe('expected type number, received type string');
  });

  it('should validate an invalid number NaN', () => {
    const schema: Schema = { type: 'number' };
    const value = NaN;
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.typeMismatch).toBe(true);
    expect(result.message).toBe('expected type number, received type NaN');
  });

  it('should validate an invalid number minimum', () => {
    const schema: Schema = { type: 'number', minimum: 100 };
    const value = 99;
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.rangeUnderflow).toBe(true);
    expect(result.message).toBe('number 99 is less than minimum 100');
  });

  it('should validate an invalid number maximum', () => {
    const schema: Schema = { type: 'number', maximum: 100 };
    const value = 101;
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.rangeOverflow).toBe(true);
    expect(result.message).toBe('number 101 is greater than maximum 100');
  });

  it('should validate a boolean', () => {
    const schema: Schema = { type: 'boolean' };
    const value = true;
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(true);
    expect(Object.keys(result.validity).length).toBe(1);
    expect(result.message).toBe('');
  });

  it('should validate an invalid boolean', () => {
    const schema: Schema = { type: 'boolean' };
    const value = 'true';
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.typeMismatch).toBe(true);
    expect(result.message).toBe('expected boolean, got string');
  });

  it('should validate an array', () => {
    const schema: Schema = { type: 'array', items: { type: 'string' } };
    const value = ['test', 'test2'];
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(true);
    expect(Object.keys(result.validity).length).toBe(1);
    expect(result.message).toBe('');
  });

  it('should validate an invalid array', () => {
    const schema: Schema = { type: 'array', items: { type: 'string' } };
    const value = 'test';
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.typeMismatch).toBe(true);
    expect(result.message).toBe('expected type array, received type string');
  });

  it('should validate an invalid array minItems', () => {
    const schema: Schema = { type: 'array', items: { type: 'string' }, minItems: 2 };
    const value = ['test'];
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.rangeUnderflow).toBe(true);
    expect(result.message).toBe('array length 1 is less than minimum length 2');
  });

  it('should validate an invalid array maxItems', () => {
    const schema: Schema = { type: 'array', items: { type: 'string' }, maxItems: 2 };
    const value = ['test', 'test2', 'test3'];
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.rangeOverflow).toBe(true);
    expect(result.message).toBe('array length 3 is greater than maximum length 2');
  });

  it('should validate an invalid array items', () => {
    const schema: Schema = { type: 'array', items: { type: 'string' } };
    const value = ['test', 123];
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.typeMismatch).toBe(true);
    expect(result.message).toBe('expected string, got number');
  });

  it('should validate an object', () => {
    const schema: Schema = { type: 'object', properties: { name: { type: 'string' } } };
    const value = { name: 'test' };
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(true);
    expect(Object.keys(result.validity).length).toBe(1);
    expect(result.message).toBe('');
  });

  it('should validate an invalid object', () => {
    const schema: Schema = { type: 'object', properties: { name: { type: 'string' } } };
    const value = 0;
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.typeMismatch).toBe(true);
    expect(result.message).toBe('expected type object, received type number');
  });

  it('should validate an invalid object property', () => {
    const schema: Schema = { type: 'object', properties: { name: { type: 'string' } } };
    const value = { name: 123 };
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.typeMismatch).toBe(true);
    expect(result.message).toBe('expected string, got number');
  });

  it('should validate an invalid object missing required property', () => {
    const schema: Schema = { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] };
    const value = {};
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.valueMissing).toBe(true);
    expect(result.message).toBe('missing required property: name');
  });

  it('should validate an invalid object additional properties', () => {
    const schema: Schema = { type: 'object', properties: { name: { type: 'string' } }, additionalProperties: false };
    const value = { name: 'test', age: 123 };
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.badInput).toBe(true);
    expect(result.message).toBe('additional properties not allowed: age');
  });

  it('should validate an enum', () => {
    const schema: Schema = { type: 'enum', enum: ['test', 'test2'] };
    const value = 'test';
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(true);
    expect(Object.keys(result.validity).length).toBe(1);
    expect(result.message).toBe('');
  });

  it('should validate an invalid enum', () => {
    const schema: Schema = { type: 'enum', enum: ['test', 'test2'] };
    const value = 'test3';
    const result = validateSchema(schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.typeMismatch).toBe(true);
    expect(result.message).toBe('value must be one of: test, test2');
  });

  it('should validate unsupported type', () => {
    const schema = { type: 'unsupported' };
    const value = 'test';
    const result = validateSchema(schema as Schema, value);
    expect(result.validity.valid).toBe(false);
    expect(result.validity.badInput).toBe(true);
    expect(result.message).toBe('unsupported type: unsupported');
  });
});

describe('parseControlValue', () => {
  it('should parse a valid string', () => {
    const schema: Schema = { type: 'string' };
    const value = 'test';
    const result = parseControlValue(value, schema);
    expect(result).toBe('test');
  });

  it('should parse a valid number', () => {
    const schema: Schema = { type: 'number' };
    const value = '0';
    const result = parseControlValue(value, schema);
    expect(result).toBe(0);
  });

  it('should parse a valid truthy boolean', () => {
    const schema: Schema = { type: 'boolean' };
    const value = 'true';
    const result = parseControlValue(value, schema);
    expect(result).toBe(true);
  });

  it('should parse a valid string as boolean', () => {
    const schema: Schema = { type: 'boolean' };
    const value = 'false';
    const result = parseControlValue(value, schema);
    expect(result).toBe(true);
  });

  it('should parse a valid falsy boolean', () => {
    const schema: Schema = { type: 'boolean' };
    const value = null;
    const result = parseControlValue(value, schema);
    expect(result).toBe(false);
  });

  it('should parse a valid array', () => {
    const schema: Schema = { type: 'array', items: { type: 'string' } };
    const value = '["test", "test2"]';
    const result = parseControlValue(value, schema);
    expect(result).toEqual(['test', 'test2']);
  });

  it('should parse a valid object', () => {
    const schema: Schema = { type: 'object', properties: { name: { type: 'string' } } };
    const value = '{"name": "test"}';
    const result = parseControlValue(value, schema);
    expect(result).toEqual({ name: 'test' });
  });

  it('should parse a valid enum', () => {
    const schema: Schema = { type: 'enum', enum: ['test', 'test2'] };
    const value = 'test';
    const result = parseControlValue(value, schema);
    expect(result).toBe('test');
  });

  it('should parse an invalid enum', () => {
    const schema: Schema = { type: 'enum', enum: ['test', 'test2'] };
    const value = 'test3';
    const result = parseControlValue(value, schema);
    expect(result).toBeUndefined();
  });

  it('should parse an invalid schema', () => {
    const schema = { type: 'unknown' };
    const value = null;
    const result = parseControlValue(value, schema as Schema);
    expect(result).toBeUndefined();
  });
});
