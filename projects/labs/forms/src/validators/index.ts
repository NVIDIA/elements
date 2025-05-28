import { validateSchema } from '../internal/schema.js';
import type { FormControl, ValidatorResult } from '../internal/types.js';

/**
 * Given a json schema validate the value against the schema
 * JSON Schema follows the OpenAI JSON Schema for structured outputs
 * https://platform.openai.com/docs/guides/structured-outputs
 *
 * - All fields or function parameters must be specified as required
 * - Require additionalProperties: false to be set on all objects
 * - The following types are supported for Structured Outputs:
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

export function requiredValidator<T>(value: T, element: FormControl & { required: boolean }): ValidatorResult {
  if (element.required && (value === undefined || value === null || value === '')) {
    return { validity: { valueMissing: true, valid: false }, message: 'This field is required' };
  }
  return { validity: { valid: true }, message: '' };
}
