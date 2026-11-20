// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { elements } from './metadata.js';

interface AttributeInfo {
  name: string;
  deprecated: boolean;
  isEnum: boolean;
  typeText: string;
  values: string[];
}

const ARBITRARY_TYPES = ['boolean', 'string', 'number'];

export function isAllowedAttributeValue(attribute: AttributeInfo, value: string): boolean {
  return (
    attribute.values.includes(value) ||
    attribute.typeText.split('|').some(type => {
      if (type.trim() === '`${string}:${string}`') return value.includes(':');
      if (type.trim() === '`${string}.svg`') return value.endsWith('.svg');
      return false;
    })
  );
}

export function getElementAttribute(tagName: string, attributeName: string): AttributeInfo | null {
  const attr = elements.find(e => e.name === tagName)?.manifest?.attributes?.find(a => a.name === attributeName);
  if (!attr) return null;

  const typeText = attr.type?.text ?? '';
  const values = hasArbitraryTypeInText(typeText) ? [] : extractLiteralUnionValues(typeText);

  return {
    name: attr.name,
    deprecated: attr.deprecated,
    isEnum: values.length > 0,
    typeText,
    values
  };
}

export function getElementAttributeNames(tagName: string): string[] {
  const element = elements.find(e => e.name === tagName);
  if (!element?.manifest?.attributes) return [];

  return element.manifest.attributes.filter(a => !a.deprecated).map(a => a.name);
}

export function getRecommendedValue(value: string, validValues: string[]): string | null {
  if (validValues.length === 0) return null;

  // Check for exact match first
  if (validValues.includes(value)) return value;

  // Check for case-insensitive match
  const lowerValue = value.toLowerCase();
  const caseMatch = validValues.find(v => v.toLowerCase() === lowerValue);
  if (caseMatch) return caseMatch;

  // Check for partial match (value is substring of valid value or vice versa)
  const partialMatch = validValues.find(
    v => v.toLowerCase().includes(lowerValue) || lowerValue.includes(v.toLowerCase())
  );
  if (partialMatch) return partialMatch;

  return null;
}

function extractLiteralUnionValues(typeText: string): string[] {
  if (!typeText) return [];

  const values = [...typeText.matchAll(/['"]([^'"]+)['"]/g)]
    .map(([, value]) => value?.trim())
    .filter((value): value is string => Boolean(value));

  return [...new Set(values)];
}

function hasArbitraryTypeInText(typeText: string): boolean {
  if (!typeText) return false;

  const values = typeText
    .replaceAll(`'`, '')
    .replaceAll(`"`, '')
    .split('|')
    .map(v => v.trim());

  return values.some(v => ARBITRARY_TYPES.includes(v) || v.includes('IconName'));
}
