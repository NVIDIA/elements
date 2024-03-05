import { describe, expect, it } from 'vitest';
import { Icon, mergeIcons } from '@elements/elements/icon';

describe('mlv-icon static', () => {
  it('should return static registry if icon is not yet registered', () => {
    class Test extends Icon {
      static metadata = {
        tag: 'not-registered-icon',
        version: '0.0.0'
      };
    }

    expect((Test as any)._iconsRegistry).toBe(Test._icons);
  });

  it('should merge conflicting icon versions to latest', async () => {
    class Registered {
      static metadata: any = {
        version: '0.0.0'
      };

      static _icons: any = {
        'merge-svg': { svg: () => '<svg id="merge-svg"><path d=""/></svg>' }
      };
    }

    mergeIcons(Registered as unknown as typeof Icon);
    expect(Registered._icons['merge-svg']).toBeDefined();

    Registered._icons = {
      'merge-svg-2': { svg: () => '<svg id="merge-svg"><path d=""/></svg>' }
    };

    Registered.metadata = {
      version: '-2.-2.-2'
    };

    mergeIcons(Registered as unknown as typeof Icon);
    expect(Registered._icons['merge-svg-2']).toBeDefined();
  });
});
