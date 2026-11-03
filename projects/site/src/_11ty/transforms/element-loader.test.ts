import { describe, expect, it } from 'vitest';
import { elementLoaderTransform, getIconImports } from './element-loader.js';

describe('element loader icon imports', () => {
  it('should register unique static icons and requested solid variants', () => {
    expect(
      getIconImports(
        '<nve-icon name="person"></nve-icon><nve-icon-button icon-name="person" appearance="solid"></nve-icon-button>'
      )
    ).toEqual([
      "import '@nvidia-elements/core/icon/icons/person.js';",
      "import '@nvidia-elements/core/icon/icons/person-solid.js';"
    ]);
  });

  it('should ignore URLs, unknown names, and escaped example content', () => {
    expect(
      getIconImports(
        '<nve-icon name="custom.svg"></nve-icon><nve-icon name="unknown-icon"></nve-icon><textarea><nve-icon name="person"></nve-icon></textarea>'
      )
    ).toEqual([]);
  });

  it('should retain outline fallback when no solid asset exists', () => {
    expect(getIconImports('<nve-icon name="drag" appearance="solid"></nve-icon>')).toEqual([
      "import '@nvidia-elements/core/icon/icons/drag.js';"
    ]);
  });

  it('should import glyphs before component registrations', async () => {
    const html = await elementLoaderTransform(
      '<html><head></head><body><nve-icon name="person"></nve-icon></body></html>'
    );
    expect(html.indexOf("import '@nvidia-elements/core/icon/icons/person.js';")).toBeLessThan(
      html.indexOf("import '@nvidia-elements/core/icon/define.js';")
    );
  });
});
