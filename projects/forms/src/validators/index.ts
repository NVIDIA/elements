// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { validateSchema } from '../internal/schema.js';
import type { FormControl, ValidatorResult } from '../internal/types.js';

/**
 * Given a json schema, check the value against the schema
 * JSON Schema follows the OpenAI JSON Schema for structured outputs
 * https://platform.openai.com/docs/guides/structured-outputs
 *
 * - All fields or function parameters must specify required
 * - Require additionalProperties: false on all objects
 * - Structured Outputs support the following types:
 *   - String
 *   - Number
 *   - Boolean
 *   - Object
 *   - Array
 *   - Enum
 */
export function valueSchemaValidator(value: unknown, element: FormControl): ValidatorResult {
  const metadata = (element as any).constructor.metadata; // eslint-disable-line @typescript-eslint/no-explicit-any
  return validateSchema(metadata.valueSchema, value);
}

export function requiredValidator(value: unknown, element: FormControl): ValidatorResult {
  if (
    (element as unknown as { required: boolean }).required &&
    (value === undefined || value === null || value === '')
  ) {
    return { validity: { valueMissing: true, valid: false }, message: 'This field is required' };
  }
  return { validity: { valid: true }, message: '' };
}
