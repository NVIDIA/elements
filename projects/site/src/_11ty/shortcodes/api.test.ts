import { describe, expect, it, vi } from 'vitest';

vi.mock('../../index.11tydata.js', () => ({
  siteData: {
    elements: []
  }
}));

const { renderAPITable } = await import('./api.js');

describe('renderAPITable', () => {
  it('should resolve inherited property attributes from manifest attributes', () => {
    const html = renderAPITable(
      {
        manifest: {
          members: [
            { name: 'pressed', description: 'Pressed state.' },
            { name: 'readOnly', description: 'Readonly state.' },
            { name: 'commandForElement', description: 'Command target.' }
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
            { name: 'checked', attribute: 'checked', description: 'Checked state.' },
            { name: 'commandForElement', description: 'Command target.' }
          ],
          attributes: [{ name: 'checked', fieldName: 'checked' }]
        }
      },
      'property'
    );

    expect(html).toMatch(/checked.*?<span nve-text="code nowrap">checked<\/span>/s);
    expect(html).toMatch(/commandForElement.*?<span nve-text="code nowrap">none<\/span>/s);
  });
});
