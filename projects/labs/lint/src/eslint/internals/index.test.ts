import { describe, it, expect } from 'vitest';
import { lintPlaygroundTemplate } from './index.js';

describe('lintPlaygroundTemplate', () => {
  it('should return empty array for valid HTML code', async () => {
    const validCode = '<div>Hello World</div>';
    const result = await lintPlaygroundTemplate(validCode);

    expect(result).toEqual([]);
  });

  it('should return empty array for valid custom elements', async () => {
    const validCode = '<nve-button>Click me</nve-button>';
    const result = await lintPlaygroundTemplate(validCode);

    expect(result).toEqual([]);
  });

  it('should detect restricted attributes on custom elements', async () => {
    const codeWithRestrictedAttribute = '<nve-button nve-layout="pad:md">Button</nve-button>';
    const result = await lintPlaygroundTemplate(codeWithRestrictedAttribute);

    expect(result.length).toBeGreaterThan(0);
    expect(
      result.some(msg => msg.id === 'no-restricted-attributes' || msg.id === 'no-restricted-attributes-with-supported')
    ).toBe(true);
    expect(result.some(msg => msg.message.includes('nve-layout'))).toBe(true);
  });

  it('should map ESLint severity correctly', async () => {
    const codeWithViolation = '<nve-button nve-layout="pad:md">Button</nve-button>';
    const result = await lintPlaygroundTemplate(codeWithViolation);

    expect(result.length).toBeGreaterThan(0);
    const message = result[0];
    expect(['error', 'warn']).toContain(message.severity);
  });

  it('should include correct line and column information', async () => {
    const codeWithViolation = '<nve-button nve-layout="pad:md">Button</nve-button>';
    const result = await lintPlaygroundTemplate(codeWithViolation);

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
    const result = await lintPlaygroundTemplate(codeWithViolation);

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
    const result = await lintPlaygroundTemplate('');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('empty-template');
    expect(result[0].severity).toBe('warn');
    expect(result[0].message).toContain('Template is empty');
  });

  it('should return warning for whitespace-only input', async () => {
    const result = await lintPlaygroundTemplate('   \n\t  ');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('empty-template');
  });

  it('should handle malformed HTML gracefully', async () => {
    const malformedCode = '<div><span>Unclosed tags';
    const result = await lintPlaygroundTemplate(malformedCode);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle multiple violations in single code block', async () => {
    const codeWithMultipleViolations = `
      <nve-button nve-layout="pad:md">Button 1</nve-button>
      <nve-button nve-text="body">Button 2</nve-button>
    `;
    const result = await lintPlaygroundTemplate(codeWithMultipleViolations);

    expect(result.length).toBeGreaterThan(1);
    expect(result[0].id).toBe('no-restricted-attributes-with-supported');
    expect(result[1].id).toBe('no-restricted-attributes-with-supported');
  });

  it('should handle suggestions', async () => {
    const codeWithSuggestion = '<nve-button nve-layout="pad:md">Button</nve-button>';
    const result = await lintPlaygroundTemplate(codeWithSuggestion);
    expect(result.length).toBeGreaterThan(0);

    const messageWithSuggestion = result.find(msg => msg.id === 'unexpected-deprecated-global-attribute');
    expect(messageWithSuggestion).toBeDefined();
    expect(messageWithSuggestion.suggestions).toBeDefined();
    expect(messageWithSuggestion.suggestions.length).toBeGreaterThan(0);
  });
});
