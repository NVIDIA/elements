import { describe, expect, it, vi } from 'vitest';

vi.mock('../../index.11tydata.js', () => ({
  siteData: {
    elements: [
      {
        name: 'nve-viewport',
        manifest: {
          members: [
            { kind: 'field', name: 'autofit', description: 'Automatically fit content.' },
            { kind: 'method', name: 'reveal', description: 'Reveal a region.' }
          ]
        }
      },
      {
        name: 'nve-test-component',
        manifest: {
          members: [
            {
              kind: 'field',
              name: 'property',
              description: 'Property description.',
              type: { values: [{ value: 'value' }] }
            }
          ]
        }
      }
    ]
  }
}));

vi.resetModules();
const { apiShortcode, renderAPITable } = await import('./api.js');

describe('apiShortcode', () => {
  it.each(['property', 'method', 'event', 'slot'])('should return no content for a missing named %s', async type => {
    expect(await apiShortcode('nve-viewport', type, 'missing')).toBe('');
  });

  it('should not render all properties when the requested name is a method', async () => {
    expect(await apiShortcode('nve-viewport', 'property', 'reveal')).toBe('');
  });

  it('should still render all properties when no name is requested', async () => {
    expect(await apiShortcode('nve-viewport', 'property')).toContain('Automatically fit content.');
  });

  it('should return no content for a requested value without a description', async () => {
    expect(await apiShortcode('nve-test-component', 'property', 'property', 'value')).toBe('');
  });
});

describe('renderAPITable', () => {
  it('should render descriptions when deprecation is a boolean', () => {
    const html = renderAPITable(
      {
        manifest: {
          members: [{ kind: 'field', name: 'legacy', deprecated: true, description: 'Legacy property.' }]
        }
      },
      'property'
    );

    expect(html).toContain('>deprecated</nve-badge>');
    expect(html).toContain('Legacy property.');
  });

  it('should resolve inherited property attributes from manifest attributes', () => {
    const html = renderAPITable(
      {
        manifest: {
          members: [
            { kind: 'field', name: 'pressed', description: 'Pressed state.' },
            { kind: 'field', name: 'readOnly', description: 'Readonly state.' },
            { kind: 'field', name: 'commandForElement', description: 'Command target.' }
          ],
          attributes: [{ name: 'pressed' }, { name: 'readonly' }]
        }
      },
      'property'
    );

    expect(html).toMatch(/pressed.*?<span nve-text="code nowrap">pressed<\/span>/s);
    expect(html).toMatch(/readOnly.*?<span nve-text="code nowrap">readonly<\/span>/s);
    expect(html).toMatch(/commandForElement.*?<span nve-text="code nowrap">none<\/span>/s);
  });

  it('should render projected mixin attributes directly from members', () => {
    const html = renderAPITable(
      {
        manifest: {
          members: [
            { kind: 'field', name: 'checked', attribute: 'checked', description: 'Checked state.' },
            { kind: 'field', name: 'commandForElement', description: 'Command target.' }
          ],
          attributes: [{ name: 'checked', fieldName: 'checked' }]
        }
      },
      'property'
    );

    expect(html).toMatch(/checked.*?<span nve-text="code nowrap">checked<\/span>/s);
    expect(html).toMatch(/commandForElement.*?<span nve-text="code nowrap">none<\/span>/s);
  });

  it('should render method overloads separately from properties', () => {
    const element = {
      manifest: {
        members: [
          { kind: 'field', name: 'targetScale', attribute: 'target-scale', description: 'The target scale.' },
          {
            kind: 'method',
            name: 'scrollTo',
            description: 'Scroll to a position.',
            parameters: [{ name: 'options', optional: true, type: { text: 'ScrollToOptions' } }],
            return: { type: { text: 'Promise<void>' } }
          },
          {
            kind: 'method',
            name: 'scrollTo',
            parameters: [
              { name: 'x', type: { text: 'number' } },
              { name: 'y', type: { text: 'number' } }
            ],
            return: { type: { text: 'Promise<void>' } }
          }
        ]
      }
    };

    const methods = renderAPITable(element, 'method');
    const properties = renderAPITable(element, 'property');

    expect(methods.match(/<nve-grid-row\b/g)).toHaveLength(1);
    expect(methods).toContain('scrollTo(options?: ScrollToOptions): Promise&lt;void&gt;');
    expect(methods).toContain('scrollTo(x: number, y: number): Promise&lt;void&gt;');
    expect(methods).toContain('Scroll to a position.');
    expect(methods).not.toContain('>Attribute<');
    expect(methods).not.toContain('targetScale');
    expect(properties).toContain('targetScale');
    expect(properties).toContain('target-scale');
    expect(properties).not.toContain('scrollTo');
  });

  it('should sort API rows by name with the default slot first', () => {
    const element = {
      manifest: {
        members: [
          { kind: 'field', name: 'y' },
          { kind: 'field', name: 'x' },
          { kind: 'method', name: 'zoom' },
          { kind: 'method', name: 'pan' }
        ],
        events: [{ name: 'zoom' }, { name: 'pan' }],
        slots: [{ name: 'suffix' }, { name: 'prefix' }, { name: '' }],
        commands: [{ name: '--zoom-in' }, { name: '--pan-left' }],
        cssProperties: [{ name: '--z-color' }, { name: '--a-color' }],
        cssParts: [{ name: 'zoom' }, { name: 'pan' }]
      }
    };
    const rowNames = (type: string) =>
      [
        ...renderAPITable(element, type).matchAll(
          /<nve-grid-row role="row">\s*<nve-grid-cell role="gridcell"><span nve-text="code nowrap">([^<]*)<\/span>/g
        )
      ].map(match => match[1]);

    expect(rowNames('property')).toEqual(['x', 'y']);
    expect(rowNames('event')).toEqual(['pan', 'zoom']);
    expect(rowNames('slot')).toEqual(['default', 'prefix', 'suffix']);
    expect(rowNames('command')).toEqual(['--pan-left', '--zoom-in']);
    expect(rowNames('method')).toEqual(['pan', 'zoom']);
    expect(rowNames('css-property')).toEqual(['--a-color', '--z-color']);
    expect(rowNames('css-part')).toEqual(['pan', 'zoom']);
  });
});
