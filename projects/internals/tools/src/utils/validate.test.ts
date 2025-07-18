import { describe, expect, it } from 'vitest';
import type { MetadataSummary } from '@nve-internals/metadata';
import { validateTemplate } from './validate.js';

const metadata = {
  projects: {
    '@nvidia-elements/core': {
      elements: [
        {
          name: 'nve-button',
          manifest: {
            metadata: { entrypoint: '@nvidia-elements/core/button' },
            attributes: [
              { name: 'pressed', type: { text: `boolean` } },
              { name: 'command', type: { text: `string` } },
              { name: 'commandfor', type: { text: `string` } },
              { name: 'popovertarget', type: { text: `string` } },
              { name: 'popovertargetaction', type: { text: `string` } }
            ]
          }
        },
        {
          name: 'nve-badge',
          manifest: {
            metadata: { entrypoint: '@nvidia-elements/core/badge' },
            attributes: [{ name: 'status', type: { text: `'accent' | 'warning' | 'success' | 'danger'` } }]
          }
        },
        {
          name: 'nve-icon',
          manifest: {
            metadata: { entrypoint: '@nvidia-elements/core/icon' },
            attributes: [{ name: 'name', type: { text: `IconName | default` } }]
          }
        },
        {
          name: 'nve-grid-column',
          manifest: {
            metadata: { entrypoint: '@nvidia-elements/core/grid' },
            attributes: [{ name: 'width', type: { text: `number` } }]
          }
        }
      ]
    }
  }
} as unknown as MetadataSummary;

describe('validateTemplate', () => {
  it('should validate a template', () => {
    const template =
      '<body><div nve-invalid="test" nve-layout="column gap:md" nve-text="body"><b>test</b><nve-invalid></nve-invalid><nve-badge status="success">test</nve-badge><nve-badge>test</nve-badge><nve-badge style="--color: red">test</nve-badge><script>alert("!")</script></div></body>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe(
      '<div nve-layout="column gap:md" nve-text="body"><b>test</b><nve-badge status="success">test</nve-badge><nve-badge>test</nve-badge><nve-badge>test</nve-badge><script>alert("!")</script></div>'
    );
  });

  it('should sanitize a template', () => {
    const template = '<p>hello</p><script>alert("!")</script>';
    const { result } = validateTemplate(template, metadata, { allowVulnerableTags: false });
    expect(result).toBe('<p>hello</p>');
  });

  it('should not sanitize a template', () => {
    const template = '<p>hello</p><script>alert("!")</script>';
    const { result } = validateTemplate(template, metadata, { allowVulnerableTags: true });
    expect(result).toBe('<p>hello</p><script>alert("!")</script>');
  });

  it('should remove invalid global attributes', () => {
    const template = '<p nve-invalid="test">hello</p>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<p>hello</p>');
  });

  it('should allow elements global attributes', () => {
    const template = '<p nve-layout="column" nve-text="body">hello</p>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<p nve-layout="column" nve-text="body">hello</p>');
  });

  it('should remove invalid elements', () => {
    const template = '<p>hello</p><nve-blah></nve-blah>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<p>hello</p>');
  });

  it('should allow valid elements', () => {
    const template = '<p>hello</p><nve-badge>hello there</nve-badge>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<p>hello</p><nve-badge>hello there</nve-badge>');
  });

  it('should remove invalid element attributes', () => {
    const template = '<nve-badge invalid="blah">hello there</nve-badge>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<nve-badge>hello there</nve-badge>');
  });

  it('should allow valid element attributes', () => {
    const template = '<nve-badge status="success">hello there</nve-badge>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<nve-badge status="success">hello there</nve-badge>');
  });

  it('should remove invalid element attribute values', () => {
    const template = '<nve-badge status="blah">hello there</nve-badge>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<nve-badge status>hello there</nve-badge>');
  });

  it('should allow icon name attribute with arbitrary values', () => {
    const template = '<nve-icon name="test">hello there</nve-icon>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<nve-icon name="test">hello there</nve-icon>');
  });

  it('should allow number type attribute with arbitrary values', () => {
    const template = '<nve-grid-column width="100">hello there</nve-grid-column>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<nve-grid-column width="100">hello there</nve-grid-column>');
  });

  it('should allow boolean type attributes', () => {
    const template = '<nve-button pressed>hello there</nve-button>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<nve-button pressed>hello there</nve-button>');
  });

  it('should allow popover attributes', () => {
    const template = '<nve-button popovertarget="test">test</nve-button><dialog id="test">test</dialog>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<nve-button popovertarget="test">test</nve-button><dialog id="test">test</dialog>');
  });

  it('should allow command attributes', () => {
    const template =
      '<nve-button command="show-dialog" commandfor="test">test</nve-button><dialog id="test">test</dialog>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe(
      '<nve-button command="show-dialog" commandfor="test">test</nve-button><dialog id="test">test</dialog>'
    );
  });

  it('should allow form elements', () => {
    const template =
      '<form><label for="test">test</label><input id="test" /><select><option value="1">test</option></select></form>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe(
      '<form><label for="test">test</label><input id="test" /><select><option value="1">test</option></select></form>'
    );
  });

  it('should remove global elements by default', () => {
    const template = '<body></body>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('');
  });

  it('should allow global elements', () => {
    const template = '<body></body>';
    const { result } = validateTemplate(template, metadata, { allowGlobalElements: true });
    expect(result).toBe('<body></body>');
  });

  it('should remove style attributes by default', () => {
    const template = '<nve-badge style="--color: red">hello there</nve-badge>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<nve-badge>hello there</nve-badge>');
  });

  it('should allow style attributes', () => {
    const template = '<nve-badge style="--color: red">hello there</nve-badge>';
    const { result } = validateTemplate(template, metadata, { allowStyleAttribute: true });
    expect(result).toBe('<nve-badge style="--color:red">hello there</nve-badge>');
  });

  it('should allow slot attribute on elements', () => {
    const template = '<div slot="test">hello there</div>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<div slot="test">hello there</div>');
  });

  it('should not allow nve-theme on elements other than html and body', () => {
    const template = '<div nve-theme="dark">hello there</div>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<div>hello there</div>');
  });

  it('should not allow nve-layout on shadow dom host elements', () => {
    const template = '<nve-badge nve-layout="pad:lg">hello there</nve-badge>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<nve-badge>hello there</nve-badge>');
  });

  it('should not allow nve-text on shadow dom host elements', () => {
    const template = '<nve-badge nve-text="body">hello there</nve-badge>';
    const { result } = validateTemplate(template, metadata);
    expect(result).toBe('<nve-badge>hello there</nve-badge>');
  });

  it('should not allow script tags', () => {
    const template = '<script type="module">console.log("!")</script>';
    const { result } = validateTemplate(template, metadata, { allowVulnerableTags: false });
    expect(result).toBe('');
  });

  it('should allow script tags for trusted content', () => {
    const template = '<script type="module">console.log("!")</script>';
    const { result } = validateTemplate(template, metadata, { allowVulnerableTags: true });
    expect(result).toBe('<script type="module">console.log("!")</script>');
  });
});
