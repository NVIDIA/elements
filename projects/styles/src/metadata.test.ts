// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

interface CustomDataValue {
  name: string;
}

interface GlobalAttribute {
  name: string;
  values: CustomDataValue[];
}

interface HtmlCustomData {
  globalAttributes: GlobalAttribute[];
}

describe('@nvidia-elements/styles metadata', () => {
  it('should generate custom data for public style attributes', () => {
    const data = JSON.parse(
      readFileSync(resolve(import.meta.dirname, '../dist/data.html.json'), 'utf-8')
    ) as HtmlCustomData;
    const attributes = new Map(
      data.globalAttributes.map(attribute => [attribute.name, new Set(attribute.values.map(value => value.name))])
    );

    expectAttributeValues(attributes, 'nve-layout', [
      'row',
      'column',
      'grid',
      'gap:md',
      'pad-x:md',
      '@md|row',
      '&md|span:6'
    ]);
    expectAttributeValues(attributes, 'nve-text', ['body', 'heading', 'link', 'truncate']);
    expectAttributeValues(attributes, 'nve-display', ['hide', '@md|show', '&md|hide']);
  });
});

function expectAttributeValues(attributes: Map<string, Set<string>>, name: string, values: string[]) {
  const attributeValues = attributes.get(name);

  expect(attributeValues).toBeDefined();
  values.forEach(value => expect(attributeValues?.has(value)).toBe(true));
}
