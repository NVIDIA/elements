// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { lintTemplate } from './index.js';

describe('lintPlaygroundTemplate', () => {
  it('should return empty array for valid HTML code', async () => {
    const validCode = '<div>Hello World</div>';
    const result = await lintTemplate(validCode, { strict: true });

    expect(result).toEqual([]);
  });

  it('should return empty array for valid custom elements', async () => {
    const validCode = '<nve-button>Click me</nve-button>';
    const result = await lintTemplate(validCode, { strict: true });

    expect(result).toEqual([]);
  });

  it('should limit emphasis buttons per template', async () => {
    const code = `
      <nve-button interaction="emphasis">One</nve-button>
      <nve-button interaction="emphasis">Two</nve-button>
      <nve-button interaction="emphasis">Three</nve-button>
    `;
    const result = await lintTemplate(code, { strict: true });

    expect(result.filter(message => message.id === 'excessive-primary-action')).toHaveLength(1);
  });

  it('should detect restricted attributes on custom elements', async () => {
    const codeWithRestrictedAttribute = '<nve-button nve-layout="pad:md">Button</nve-button>';
    const result = await lintTemplate(codeWithRestrictedAttribute, { strict: true });

    expect(result.length).toBeGreaterThan(0);
    expect(
      result.some(msg => msg.id === 'no-restricted-attributes' || msg.id === 'no-restricted-attributes-with-supported')
    ).toBe(true);
    expect(result.some(msg => msg.message.includes('nve-layout'))).toBe(true);
  });

  it('should map ESLint severity correctly', async () => {
    const codeWithViolation = '<nve-button nve-layout="pad:md">Button</nve-button>';
    const result = await lintTemplate(codeWithViolation, { strict: true });

    expect(result.length).toBeGreaterThan(0);
    const message = result[0];
    expect(['error', 'warn']).toContain(message.severity);
  });

  it('should include correct line and column information', async () => {
    const codeWithViolation = '<nve-button nve-layout="pad:md">Button</nve-button>';
    const result = await lintTemplate(codeWithViolation, { strict: true });

    expect(result.length).toBeGreaterThan(0);
    const message = result[0];
    expect(typeof message.line).toBe('number');
    expect(typeof message.column).toBe('number');
    expect(typeof message.endLine).toBe('number');
    expect(typeof message.endColumn).toBe('number');
    expect(message.line).toBeGreaterThan(0);
    expect(message.column).toBeGreaterThan(0);
  });

  it('should return proper TemplateLintMessage structure', async () => {
    const codeWithViolation = '<nve-button nve-layout="pad:md">Button</nve-button>';
    const result = await lintTemplate(codeWithViolation, { strict: true });

    expect(result.length).toBeGreaterThan(0);
    const message = result[0];

    // Verify all required properties exist
    expect(message).toHaveProperty('id');
    expect(message).toHaveProperty('severity');
    expect(message).toHaveProperty('message');
    expect(message).toHaveProperty('line');
    expect(message).toHaveProperty('column');
    expect(message).toHaveProperty('endLine');
    expect(message).toHaveProperty('endColumn');

    // Verify types
    expect(typeof message.id).toBe('string');
    expect(['error', 'warn']).toContain(message.severity);
    expect(typeof message.message).toBe('string');
    expect(typeof message.line).toBe('number');
    expect(typeof message.column).toBe('number');
    expect(typeof message.endLine).toBe('number');
    expect(typeof message.endColumn).toBe('number');
  });

  it('should return warning for empty string input', async () => {
    const result = await lintTemplate('', { strict: true });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('empty-template');
    expect(result[0].severity).toBe('warn');
    expect(result[0].message).toContain('Template is empty');
  });

  it('should return warning for whitespace-only input', async () => {
    const result = await lintTemplate('   \n\t  ', { strict: true });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('empty-template');
  });

  it('should handle malformed HTML gracefully', async () => {
    const malformedCode = '<div><span>Unclosed tags';
    const result = await lintTemplate(malformedCode, { strict: true });
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle multiple violations in single code block', async () => {
    const codeWithMultipleViolations = `
      <nve-button nve-layout="pad:md">Button 1</nve-button>
      <nve-button nve-text="body">Button 2</nve-button>
    `;
    const result = await lintTemplate(codeWithMultipleViolations, { strict: true });

    expect(result.length).toBeGreaterThan(1);
    expect(result[0].id).toBe('no-restricted-attributes-with-supported');
    expect(result[1].id).toBe('no-restricted-attributes-with-supported');
  });

  it('should handle suggestions', async () => {
    const codeWithSuggestion = '<nve-button mlv-layout="pad:md">Button</nve-button>';
    const result = await lintTemplate(codeWithSuggestion, { strict: true });
    expect(result.length).toBeGreaterThan(0);

    const messageWithSuggestion = result.find(msg => msg.id === 'unexpected-deprecated-global-attribute');
    expect(messageWithSuggestion).toBeDefined();
    expect(messageWithSuggestion.suggestions).toBeDefined();
    expect(messageWithSuggestion.suggestions.length).toBeGreaterThan(0);
  });

  it('should apply non-strict template rules as warnings', async () => {
    const result = await lintTemplate('<div class="flex"></div>', { strict: false });
    const tailwindMessage = result.find(message => message.id === 'no-tailwind-class-with-suggestion');

    expect(tailwindMessage?.severity).toBe('warn');
  });

  it('should apply strict template rules as errors', async () => {
    const result = await lintTemplate('<div class="flex"></div>', { strict: true });
    const tailwindMessage = result.find(message => message.id === 'no-tailwind-class-with-suggestion');

    expect(tailwindMessage?.severity).toBe('error');
  });

  it('should apply missing gap checks to strict templates', async () => {
    const missingGap = '<div nve-layout="row"><span>one</span><span>two</span></div>';
    const explicitNoGap = '<div nve-layout="row gap:none"><span>one</span><span>two</span></div>';
    const strictResult = await lintTemplate(missingGap, { strict: true });
    const explicitNoGapResult = await lintTemplate(explicitNoGap, { strict: true });

    expect(strictResult.find(message => message.id === 'missing-gap-space')?.severity).toBe('error');
    expect(explicitNoGapResult.some(message => message.id === 'missing-gap-space')).toBe(false);
  });
});
