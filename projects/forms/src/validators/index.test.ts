// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { requiredValidator, valueSchemaValidator } from './index.js';
import type { FormControlInstance } from '../internal/types.js';

describe('requiredValidator', () => {
  it('should return valid when value exists', () => {
    const result = requiredValidator('test', { required: true } as FormControlInstance);
    expect(result.validity.valueMissing).toBe(undefined);
    expect(result.message).toBe('');
    expect(result.validity.valid).toBe(true);
  });

  it('should return invalid when required values are empty', () => {
    [undefined, null, ''].forEach(value => {
      const result = requiredValidator(value, { required: true } as FormControlInstance);

      expect(result.validity.valueMissing).toBe(true);
      expect(result.message).toBe('This field is required');
      expect(result.validity.valid).toBe(false);
    });
  });

  it('should return valid when empty values are not required', () => {
    [undefined, null, ''].forEach(value => {
      const result = requiredValidator(value, { required: false } as FormControlInstance);

      expect(result.validity.valueMissing).toBe(undefined);
      expect(result.message).toBe('');
      expect(result.validity.valid).toBe(true);
    });
  });
});

describe('valueSchemaValidator', () => {
  it('should return valid when value is valid', () => {
    class Test {
      static metadata = {
        valueSchema: { type: 'string' }
      };
    }

    const result = valueSchemaValidator('test', new Test() as FormControlInstance);
    expect(result.validity.valid).toBe(true);
    expect(result.message).toBe('');
  });

  it('should return invalid when value is invalid', () => {
    class Test {
      static metadata = {
        valueSchema: { type: 'number' }
      };
    }

    const result = valueSchemaValidator('test', new Test() as FormControlInstance);
    expect(result.validity.valid).toBe(false);
    expect(result.message).toBe('expected type number, received type string');
  });
});
