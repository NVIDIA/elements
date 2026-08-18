// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type FieldType = 'f32' | 'f32x2' | 'f32x3' | 'f32x4' | 'u32' | 'unorm8x4';

export interface FieldSpec {
  type: FieldType;
  offset: number;
}

export interface LayoutDescriptor {
  readonly name: string;
  readonly stride: number;
  readonly fields: Readonly<Record<string, Readonly<FieldSpec>>>;
}

export const FIELD_BYTE_WIDTHS: Readonly<Record<FieldType, number>> = Object.freeze({
  f32: 4,
  f32x2: 8,
  f32x3: 12,
  f32x4: 16,
  u32: 4,
  unorm8x4: 4
});

const NAME_PATTERN = /^[a-z][a-z0-9.-]*$/;
const layouts = new Map<string, LayoutDescriptor>();

export function defineLayout(
  name: string,
  fields: Record<string, FieldSpec>,
  opts: { stride: number }
): LayoutDescriptor {
  assertName(name, 'Layout');
  const entries = getFieldEntries(fields);
  const stride = getStride(opts);
  const frozenFields = freezeAndValidateFields(entries, stride);
  const existing = layouts.get(name);

  if (existing) {
    if (layoutsEqual(existing, stride, frozenFields)) {
      return existing;
    }
    throw new TypeError(`Layout "${name}" is already defined with a different shape.`);
  }

  const descriptor = Object.freeze({ name, stride, fields: frozenFields });
  layouts.set(name, descriptor);
  return descriptor;
}

function assertName(name: unknown, subject: string): asserts name is string {
  if (typeof name !== 'string' || !NAME_PATTERN.test(name)) {
    throw new TypeError(`${subject} names must match ${NAME_PATTERN}.`);
  }
}

function getFieldEntries(fields: unknown): [string, unknown][] {
  if (typeof fields !== 'object' || fields === null || Array.isArray(fields)) {
    throw new TypeError('Layout fields must be a record.');
  }

  const entries = Object.entries(fields);
  if (entries.length === 0) {
    throw new TypeError('A layout must define at least one field.');
  }
  return entries;
}

function getStride(opts: unknown): number {
  const stride = typeof opts === 'object' && opts !== null && 'stride' in opts ? opts.stride : undefined;
  if (typeof stride !== 'number' || !Number.isInteger(stride) || stride <= 0 || stride % 4 !== 0) {
    throw new RangeError('Layout stride must be a positive integer multiple of four.');
  }
  return stride;
}

function freezeAndValidateFields(
  entries: [string, unknown][],
  stride: number
): Readonly<Record<string, Readonly<FieldSpec>>> {
  const validated = entries.map(([name, spec]) => {
    assertName(name, 'Field');
    if (typeof spec !== 'object' || spec === null || !('type' in spec) || !isFieldType(spec.type)) {
      throw new TypeError(`Field "${name}" must use a supported type.`);
    }
    if (
      !('offset' in spec) ||
      typeof spec.offset !== 'number' ||
      !Number.isInteger(spec.offset) ||
      spec.offset < 0 ||
      spec.offset % 4 !== 0
    ) {
      throw new RangeError(`Field "${name}" offset must be a nonnegative integer aligned to four bytes.`);
    }
    return [name, Object.freeze({ type: spec.type, offset: spec.offset })] as const;
  });

  assertFieldRanges(validated, stride);
  return Object.freeze(Object.fromEntries(validated));
}

function assertFieldRanges(entries: readonly (readonly [string, Readonly<FieldSpec>])[], stride: number): void {
  const ranges = entries
    .map(([name, spec]) => ({ name, start: spec.offset, end: spec.offset + FIELD_BYTE_WIDTHS[spec.type] }))
    .sort((left, right) => left.start - right.start || left.name.localeCompare(right.name));

  let priorEnd = 0;
  for (const range of ranges) {
    if (range.end > stride) {
      throw new RangeError(`Field "${range.name}" extends past the layout stride.`);
    }
    if (range.start < priorEnd) {
      throw new RangeError(`Field "${range.name}" overlaps another field.`);
    }
    priorEnd = range.end;
  }
}

function isFieldType(value: unknown): value is FieldType {
  return typeof value === 'string' && Object.hasOwn(FIELD_BYTE_WIDTHS, value);
}

function layoutsEqual(
  existing: LayoutDescriptor,
  stride: number,
  fields: Readonly<Record<string, Readonly<FieldSpec>>>
): boolean {
  if (existing.stride !== stride) {
    return false;
  }

  const existingNames = Object.keys(existing.fields).sort();
  const fieldNames = Object.keys(fields).sort();
  return (
    existingNames.length === fieldNames.length &&
    existingNames.every(name => {
      const existingField = existing.fields[name];
      const field = fields[name];
      return existingField?.type === field?.type && existingField?.offset === field?.offset;
    })
  );
}
