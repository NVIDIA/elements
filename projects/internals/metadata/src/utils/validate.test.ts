import { describe, expect, it } from 'vitest';
import type { MetadataSummary } from '../types.js';
import { validateTemplate } from './validate.js';

const metadata = {
  projects: {
    '@nvidia-elements/core': {
      elements: [
        { name: 'nve-button', manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } } },
        {
          name: 'nve-badge',
          manifest: {
            metadata: { entrypoint: '@nvidia-elements/core/badge' },
            attributes: [{ name: 'status', type: { text: 'success|invalid' } }]
          }
        },
        { name: 'nve-page', manifest: { metadata: { entrypoint: '@nvidia-elements/core/page' } } }
      ]
    }
  }
} as unknown as MetadataSummary;

describe('validateTemplate', () => {
  it('should validate a template', () => {
    const template =
      '<nve-page><div nve-invalid="test" nve-layout="column gap:md" nve-text="body"><b>test</b><nve-invalid></nve-invalid><nve-badge status="success">test</nve-badge><nve-badge status="invalid">test</nve-badge><nve-badge style="--color: red">test</nve-badge><script>alert("!")</script></div></nve-page>';
    const result = validateTemplate(template, metadata);
    expect(result).toBe(
      '<nve-page><div nve-layout="column gap:md" nve-text="body"><b>test</b><nve-badge status="success">test</nve-badge><nve-badge status="invalid">test</nve-badge><nve-badge style="--color:red">test</nve-badge></div></nve-page>'
    );
  });

  it('should sanitize a template', () => {
    const template = '<p>hello</p><script>alert("!")</script>';
    const result = validateTemplate(template, metadata);
    expect(result).toBe('<p>hello</p>');
  });

  it('should remove invalid global attributes', () => {
    const template = '<p nve-invalid="test">hello</p>';
    const result = validateTemplate(template, metadata);
    expect(result).toBe('<p>hello</p>');
  });

  it('should allow elements global attributes', () => {
    const template = '<p nve-layout="column" nve-text="body">hello</p>';
    const result = validateTemplate(template, metadata);
    expect(result).toBe('<p nve-layout="column" nve-text="body">hello</p>');
  });

  it('should remove invalid elements', () => {
    const template = '<p>hello</p><nve-blah></nve-blah>';
    const result = validateTemplate(template, metadata);
    expect(result).toBe('<p>hello</p>');
  });

  it('should allow valid elements', () => {
    const template = '<p>hello</p><nve-badge>hello there</nve-badge>';
    const result = validateTemplate(template, metadata);
    expect(result).toBe('<p>hello</p><nve-badge>hello there</nve-badge>');
  });

  it('should remove invalid element attributes', () => {
    const template = '<nve-badge invalid="blah">hello there</nve-badge>';
    const result = validateTemplate(template, metadata);
    expect(result).toBe('<nve-badge>hello there</nve-badge>');
  });

  it('should allow valid element attributes', () => {
    const template = '<nve-badge status="success">hello there</nve-badge>';
    const result = validateTemplate(template, metadata);
    expect(result).toBe('<nve-badge status="success">hello there</nve-badge>');
  });

  it('should allow global elements', () => {
    const template = '<nve-page></nve-page>';
    const result = validateTemplate(template, metadata, { allowGlobalElements: true });
    expect(result).toBe('<nve-page></nve-page>');
  });

  it('should remove global elements', () => {
    const template = '<nve-page></nve-page>';
    const result = validateTemplate(template, metadata, { allowGlobalElements: false });
    expect(result).toBe('');
  });

  it('should allow style attributes', () => {
    const template = '<nve-badge style="--color: red">hello there</nve-badge>';
    const result = validateTemplate(template, metadata);
    expect(result).toBe('<nve-badge style="--color:red">hello there</nve-badge>');
  });

  it('should remove style attributes', () => {
    const template = '<nve-badge style="--color: red">hello there</nve-badge>';
    const result = validateTemplate(template, metadata, { allowStyleAttribute: false });
    expect(result).toBe('<nve-badge>hello there</nve-badge>');
  });

  it('should allow slot attribute on elements', () => {
    const template = '<div slot="test">hello there</div>';
    const result = validateTemplate(template, metadata);
    expect(result).toBe('<div slot="test">hello there</div>');
  });

  it('should not allow nve-theme on elements other than html and body', () => {
    const template = '<div nve-theme="dark">hello there</div>';
    const result = validateTemplate(template, metadata);
    expect(result).toBe('<div>hello there</div>');
  });

  it('should not allow nve-layout on shadow dom host elements', () => {
    const template = '<nve-badge nve-layout="pad:lg">hello there</nve-badge>';
    const result = validateTemplate(template, metadata);
    expect(result).toBe('<nve-badge>hello there</nve-badge>');
  });

  it('should not allow nve-text on shadow dom host elements', () => {
    const template = '<nve-badge nve-text="body">hello there</nve-badge>';
    const result = validateTemplate(template, metadata);
    expect(result).toBe('<nve-badge>hello there</nve-badge>');
  });
});
