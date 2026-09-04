// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { FIELD_BYTE_WIDTHS, defineLayout } from './define-layout.js';
import { LINE_VERTEX, MARKER, POINT, TRI_VERTEX } from './built-ins.js';

describe(defineLayout.name, () => {
  it('should define and deeply freeze immutable layout metadata', () => {
    const layout = defineLayout('test.freeze', { value: { type: 'f32x2', offset: 0 } }, { stride: 8 });

    expect(layout).toEqual({
      name: 'test.freeze',
      stride: 8,
      fields: { value: { type: 'f32x2', offset: 0 } }
    });
    expect(Object.isFrozen(layout)).toBe(true);
    expect(Object.isFrozen(layout.fields)).toBe(true);
    expect(Object.isFrozen(layout.fields.value)).toBe(true);
  });

  it('should return the original descriptor for an identical shape regardless of field order', () => {
    const original = defineLayout(
      'test.identical',
      { first: { type: 'f32', offset: 0 }, second: { type: 'u32', offset: 4 } },
      { stride: 8 }
    );
    const duplicate = defineLayout(
      'test.identical',
      { second: { type: 'u32', offset: 4 }, first: { type: 'f32', offset: 0 } },
      { stride: 8 }
    );

    expect(duplicate).toBe(original);
  });

  it.each([
    ['uppercase', 'Test.layout'],
    ['leading number', '1test.layout'],
    ['underscore', 'test_layout'],
    ['empty', '']
  ])('should reject an invalid %s layout name', (_, name) => {
    expect(() => defineLayout(name, { value: { type: 'f32', offset: 0 } }, { stride: 4 })).toThrow(TypeError);
  });

  it.each(['Bad', '1field', 'bad_field', ''])('should reject invalid field name %s', name => {
    expect(() =>
      defineLayout(`test.field-name-${name.length}`, { [name]: { type: 'f32', offset: 0 } }, { stride: 4 })
    ).toThrow(TypeError);
  });

  it.each([null, [], 'field'])('should reject fields that are not records', fields => {
    expect(() => defineLayout('test.fields-record', fields as never, { stride: 4 })).toThrow(TypeError);
  });

  it('should reject an empty field record', () => {
    expect(() => defineLayout('test.empty-fields', {}, { stride: 4 })).toThrow(TypeError);
  });

  it.each([null, {}, { type: 'f16', offset: 0 }, { type: 1, offset: 0 }])(
    'should reject unsupported field specification %j',
    field => {
      expect(() => defineLayout('test.field-type', { value: field as never }, { stride: 4 })).toThrow(TypeError);
    }
  );

  it.each([0, -4, 2, 4.5, Number.NaN, Number.POSITIVE_INFINITY, undefined, null])(
    'should reject invalid stride %s',
    stride => {
      const opts = stride === null ? null : { stride };
      expect(() => defineLayout('test.stride', { value: { type: 'f32', offset: 0 } }, opts as never)).toThrow(
        RangeError
      );
    }
  );

  it.each([-4, 2, 0.5, Number.NaN, Number.POSITIVE_INFINITY, undefined])(
    'should reject invalid field offset %s',
    offset => {
      expect(() => defineLayout('test.offset', { value: { type: 'f32', offset } } as never, { stride: 8 })).toThrow(
        RangeError
      );
    }
  );

  it('should reject overlapping fields', () => {
    expect(() =>
      defineLayout(
        'test.overlap',
        { vector: { type: 'f32x3', offset: 0 }, scalar: { type: 'f32', offset: 8 } },
        { stride: 16 }
      )
    ).toThrow(RangeError);

    expect(() =>
      defineLayout(
        'test.same-offset',
        { first: { type: 'f32', offset: 0 }, second: { type: 'f32', offset: 0 } },
        { stride: 4 }
      )
    ).toThrow(RangeError);
  });

  it('should reject fields that extend past stride', () => {
    expect(() => defineLayout('test.extent', { vector: { type: 'f32x4', offset: 4 } }, { stride: 16 })).toThrow(
      RangeError
    );
  });

  it('should reject a conflicting redefinition by stride or fields', () => {
    defineLayout('test.conflict-stride', { value: { type: 'f32', offset: 0 } }, { stride: 4 });
    defineLayout('test.conflict-field', { value: { type: 'f32', offset: 0 } }, { stride: 4 });
    defineLayout('test.conflict-count', { value: { type: 'f32', offset: 0 } }, { stride: 8 });

    expect(() => defineLayout('test.conflict-stride', { value: { type: 'f32', offset: 0 } }, { stride: 8 })).toThrow(
      TypeError
    );
    expect(() => defineLayout('test.conflict-field', { value: { type: 'u32', offset: 0 } }, { stride: 4 })).toThrow(
      TypeError
    );
    expect(() =>
      defineLayout(
        'test.conflict-count',
        { value: { type: 'f32', offset: 0 }, added: { type: 'f32', offset: 4 } },
        { stride: 8 }
      )
    ).toThrow(TypeError);
  });

  it('should expose every normative field byte width', () => {
    expect(FIELD_BYTE_WIDTHS).toEqual({ f32: 4, f32x2: 8, f32x3: 12, f32x4: 16, u32: 4, unorm8x4: 4 });
  });
});

describe('built-in layouts', () => {
  it('should match the marker byte table', () => {
    expect(MARKER).toEqual({
      name: 'nve.marker',
      stride: 48,
      fields: {
        position: { type: 'f32x3', offset: 0 },
        orientation: { type: 'f32x4', offset: 12 },
        scale: { type: 'f32x3', offset: 28 },
        color: { type: 'unorm8x4', offset: 40 },
        'outline-color': { type: 'unorm8x4', offset: 44 }
      }
    });
  });

  it.each([
    [POINT, 'nve.point'],
    [TRI_VERTEX, 'nve.tri-vertex']
  ])('should match the 16-byte vertex table for %s', (layout, name) => {
    expect(layout).toEqual({
      name,
      stride: 16,
      fields: { position: { type: 'f32x3', offset: 0 }, color: { type: 'unorm8x4', offset: 12 } }
    });
  });

  it('should match the enriched line vertex byte table', () => {
    expect(LINE_VERTEX).toEqual({
      name: 'nve.line-vertex',
      stride: 40,
      fields: {
        position: { type: 'f32x3', offset: 0 },
        color: { type: 'unorm8x4', offset: 12 },
        normal: { type: 'f32x3', offset: 16 },
        width: { type: 'f32', offset: 28 },
        dash: { type: 'f32', offset: 32 },
        gap: { type: 'f32', offset: 36 }
      }
    });
  });
});
