// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { globalAttributes } from './metadata.js';

export const ATTRIBUTE_EXCEPTIONS = ['debug', 'mkd', 'md']; // internal scopes

export const VALUE_BINDINGS = ['${', '{', '{{', '{%'];

export const VALID_NVE_TEXT_VALUES = new Set([
  ...(globalAttributes.find(attribute => attribute.name === 'nve-text')?.values?.map(value => value.name) ?? []),
  ...ATTRIBUTE_EXCEPTIONS
]);

export const VALID_NVE_LAYOUT_VALUES = [
  ...(globalAttributes.find(attribute => attribute.name === 'nve-layout')?.values?.map(value => value.name) ?? []),
  ...ATTRIBUTE_EXCEPTIONS
];

export const VALID_NVE_DISPLAY_VALUES = new Set([
  ...(globalAttributes.find(attribute => attribute.name === 'nve-display')?.values?.map(value => value.name) ?? []),
  ...ATTRIBUTE_EXCEPTIONS
]);

export function recommendedNveTextValue(attributeValue: string): string | null {
  if (VALUE_BINDINGS.some(binding => attributeValue.includes(binding))) {
    return attributeValue;
  }

  const values = getAttributeValueSegments(attributeValue);
  const validValues = new Set(VALID_NVE_TEXT_VALUES);

  const repairs: [RegExp, string][] = [
    [/^default$/, 'body'],
    [/^small$/, 'sm'],
    [/^large$/, 'lg'],
    [/^extra-large$/, 'xl'],
    [/^extra-small$/, 'xs'],
    [/^heading-1$/, 'heading'],
    [/^heading:1$/, 'heading'],
    [/^heading-2$/, 'heading'],
    [/^heading:2$/, 'heading']
  ];

  const result: string[] = repairAttributeValueSegments(values, repairs);

  if (result.some(value => !validValues.has(value))) {
    return null;
  } else {
    return result.join(' ');
  }
}

export function recommendedNveLayoutValue(attributeValue: string, invalidSymbols: string[] = []): string | null {
  if (VALUE_BINDINGS.some(binding => attributeValue.includes(binding))) {
    return attributeValue;
  }

  const values = getAttributeValueSegments(attributeValue);
  const validValues = new Set(VALID_NVE_LAYOUT_VALUES.filter(v => !invalidSymbols.some(symbol => v.includes(symbol))));

  const repairs: [RegExp, string][] = [
    [/^default$/, 'column'],
    [/^stack$/, 'column'],
    [/^col$/, 'column'],
    [/^inline$/, 'row'],
    [/^center$/, 'align:center'],
    [/^wrap$/, 'align:wrap'],
    [/^stretch$/, 'align:stretch'],
    [/^items:center$/, 'align:center'],
    [/^align-items:/, 'align:'],
    [/^padding-top-/, 'pad-top:'],
    [/^padding-right-/, 'pad-right:'],
    [/^padding-bottom-/, 'pad-bottom:'],
    [/^padding-left-/, 'pad-left:'],
    [/^padding-top:/, 'pad-top:'],
    [/^padding-right:/, 'pad-right:'],
    [/^padding-bottom:/, 'pad-bottom:'],
    [/^padding-left:/, 'pad-left:'],
    [/^padding-/, 'pad:'],
    [/^padding:/, 'pad:'],
    [/^gap-/, 'gap:'],
    [/^grid-cols:/, 'span-items:'],
    [/^grid-columns:/, 'span-items:'],
    [/^justify:/, 'align:'],
    [/extra-small/, 'xs'],
    [/small/, 'sm'],
    [/medium/, 'md'],
    [/large/, 'lg'],
    [/extra-large/, 'xl'],
    values.includes('column') ? [/align:start/, 'align:top'] : [/align:start/, 'align:left'],
    values.includes('column') ? [/align:end/, 'align:bottom'] : [/align:end/, 'align:right']
  ];

  const result: string[] = repairAttributeValueSegments(values, repairs);

  if (result.some(value => !validValues.has(value))) {
    return null;
  } else {
    return result.join(' ');
  }
}

function getAttributeValueSegments(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .filter(value => value !== '');
}

function repairAttributeValueSegments(values: string[], repairs: [RegExp, string][]) {
  return values.map(value => repairStringValue(value, repairs));
}

function repairStringValue(value: string, repairs: [RegExp, string][]) {
  let repairedValue = value;
  for (const [regex, replacement] of repairs) {
    repairedValue = repairedValue.replace(regex, replacement);
  }
  return repairedValue;
}
