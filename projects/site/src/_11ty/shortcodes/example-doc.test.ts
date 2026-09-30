import { beforeEach, describe, expect, it, vi } from 'vitest';

const { example, element } = vi.hoisted(() => ({
  example: {
    id: 'test-component-example',
    name: 'Method',
    element: 'nve-test-component',
    entrypoint: '@test/components/test-component.examples.json',
    summary: 'Example summary.'
  },
  element: {
    name: 'nve-test-component',
    manifest: {
      description: '',
      members: [
        { kind: 'field', name: 'property', description: 'Property description.' },
        { kind: 'field', name: 'undocumentedProperty' },
        {
          kind: 'field',
          name: 'propertyWithValues',
          type: { values: [{ value: 'value' }] }
        },
        {
          kind: 'method',
          name: 'method',
          description: 'Method description.',
          parameters: [{ name: 'parameter', type: { text: 'number' } }],
          return: { type: { text: 'void' } }
        },
        { kind: 'method', name: 'otherMethod', description: 'Other method description.' },
        { kind: 'method', name: 'privateMethod', privacy: 'private', description: 'Private method description.' }
      ]
    }
  }
}));

vi.mock('../../index.11tydata.js', () => ({ siteData: { examples: [example], elements: [element] } }));
vi.mock('./example.js', () => ({
  exampleShortcode: vi.fn().mockResolvedValue(''),
  exampleTagsShortcode: vi.fn().mockResolvedValue('')
}));

vi.resetModules();
const { exampleDocShortcode } = await import('./example-doc.js');

beforeEach(() => {
  example.name = 'Method';
});

describe('exampleDocShortcode', () => {
  it('should map an example name to only the matching method documentation', async () => {
    const html = await exampleDocShortcode(example.entrypoint, example.name);

    expect(html).toContain('aria-label="api method"');
    expect(html).toContain('method(parameter: number): void');
    expect(html).toContain('Method description.');
    expect(html).not.toContain('Property description.');
    expect(html).not.toContain('Other method description.');
    expect(html).not.toContain(example.summary);
  });

  it('should preserve automatic property mapping', async () => {
    example.name = 'Property';
    const html = await exampleDocShortcode(example.entrypoint, example.name);

    expect(html).toContain('Property description.');
    expect(html).not.toContain(example.summary);
  });

  it('should match a PascalCase example name to a camelCase method name', async () => {
    example.name = 'OtherMethod';
    const html = await exampleDocShortcode(example.entrypoint, example.name);

    expect(html).toContain('aria-label="api method"');
    expect(html).toContain('otherMethod(): unknown');
    expect(html).toContain('Other method description.');
    expect(html).not.toContain('method(parameter: number): void');
    expect(html).not.toContain(example.summary);
  });

  it('should use the summary when the example name does not match a member', async () => {
    example.name = 'Unmatched';
    const html = await exampleDocShortcode(example.entrypoint, example.name);

    expect(html).toContain(example.summary);
    expect(html).not.toContain('api-shortcode');
  });

  it('should use the summary when default documentation is empty', async () => {
    example.name = 'Default';
    expect(await exampleDocShortcode(example.entrypoint, example.name)).toContain(example.summary);
  });

  it('should use the summary when a public field has no description or values', async () => {
    example.name = 'UndocumentedProperty';
    const html = await exampleDocShortcode(example.entrypoint, example.name);

    expect(html).toContain(example.summary);
    expect(html).not.toContain('api-shortcode');
    expect(html).not.toContain('api-value-table');
  });

  it('should render property values even when the field has no description', async () => {
    example.name = 'PropertyWithValues';
    const html = await exampleDocShortcode(example.entrypoint, example.name);

    expect(html).toContain('aria-label="api options for \'propertyWithValues\'"');
    expect(html).toContain('<span nve-text="code nowrap">value</span>');
    expect(html).not.toContain(example.summary);
  });

  it('should use the summary when the matching member is private', async () => {
    example.name = 'PrivateMethod';
    const html = await exampleDocShortcode(example.entrypoint, example.name);

    expect(html).toContain(example.summary);
    expect(html).not.toContain('Private method description.');
  });
});
