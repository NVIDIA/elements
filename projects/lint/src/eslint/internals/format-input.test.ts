// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { HtmlTagNode } from '../rule-types.js';
import { getLiteralFormatAttribute, getLiteralFormatInput } from './format-input.js';

function tag(attributes: Record<string, string> = {}, children: HtmlTagNode[] = []): HtmlTagNode {
  return {
    type: 'Tag',
    name: 'nve-format-number',
    openStart: { range: [0, 1] },
    children,
    attributes: Object.entries(attributes).map(([key, value]) => ({
      type: 'Attribute',
      key: { value: key },
      value: { value }
    }))
  };
}

function text(value: string): HtmlTagNode {
  return { type: 'Text', name: '', value, openStart: { range: [0, 1] } };
}

describe('getLiteralFormatAttribute', () => {
  it('distinguishes absent and empty attributes and preserves their reporting node', () => {
    const absent = tag();
    expect(getLiteralFormatAttribute(absent, 'value')).toEqual({ node: absent, value: undefined });
    const empty = tag({ value: '' });
    expect(getLiteralFormatAttribute(empty, 'value')).toEqual({ node: empty.attributes?.[0], value: '' });
  });

  it.each([
    '.value',
    '?value',
    ':value',
    '[value]',
    '[attr.value]',
    'v-bind:value',
    'v-bind',
    'v-bind:[field]',
    ':[field]'
  ])('skips dynamic %s attributes even when a literal is present', binding => {
    expect(getLiteralFormatAttribute(tag({ value: '12', [binding]: 'input' }), 'value')).toBeUndefined();
  });

  it.each(['${value}', '{{value}}', '{% value %}', '1&amp;2'])('skips encoded or bound values: %s', value => {
    expect(getLiteralFormatAttribute(tag({ value }), 'value')).toBeUndefined();
  });

  it('recognizes camel-case bindings for hyphenated attributes', () => {
    expect(
      getLiteralFormatAttribute(tag({ maximumFractionDigits: 'digits' }), 'maximum-fraction-digits')
    ).toBeUndefined();
    expect(
      getLiteralFormatAttribute(tag({ '.maximumFractionDigits': 'digits' }), 'maximum-fraction-digits')
    ).toBeUndefined();
  });
});

describe('getLiteralFormatInput', () => {
  it('prefers the attribute over text, including an explicitly empty value', () => {
    expect(getLiteralFormatInput(tag({ value: '12' }, [text('34')]), 'value')?.value).toBe('12');
    expect(getLiteralFormatInput(tag({ value: '' }, [text('34')]), 'value')?.value).toBe('');
  });

  it('joins and trims text while ignoring comments', () => {
    const node = tag({}, [text(' 12'), { ...text('ignored'), type: 'Comment' }, text('34 ')]);
    expect(getLiteralFormatInput(node, 'value')).toEqual({ node, value: '1234' });
  });

  it.each(['v-text', 'v-html', '.textContent', '.innerHTML', '[textContent]', '[innerHTML]'])(
    'skips text controlled by %s',
    binding => {
      expect(getLiteralFormatInput(tag({ [binding]: 'content' }, [text('12')]), 'value')).toBeUndefined();
    }
  );

  it('skips nested markup and encoded or interpolated text', () => {
    for (const child of [tag(), text('1&amp;2'), text('${value}')]) {
      expect(getLiteralFormatInput(tag({}, [child]), 'value')).toBeUndefined();
    }
  });
});
