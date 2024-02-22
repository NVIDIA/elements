import { describe, expect, it } from 'vitest';

// root entrypoint types
import type { Color } from '@elements/elements';
import type { Color as ColorFromPath } from '@elements/elements/index.js';

// multi-entrypoint
import { Dot } from '@elements/elements/dot';
import { Dot as DotFromPath } from '@elements/elements/dot/index.js';

// multi-entrypoint types
import type { Dot as DotType } from '@elements/elements/dot';
import type { Dot as DotTypeFromPath } from '@elements/elements/dot/index.js';

// multi-entrypoint define
import * as dot from '@elements/elements/dot/define';
import * as dot2 from '@elements/elements/dot/define.js';

describe('entrypoint paths and type checking', () => {
  it('should allow root entrypoint', () => {
    const color: Color = 'green-mint';
    const colorFromPath: ColorFromPath = 'green-mint';
    expect(color).toBe('green-mint');
    expect(colorFromPath).toBe('green-mint');
  });

  it('should allow multi-entrypoint imports', () => {
    expect(Dot).toBeTruthy();
    expect(DotFromPath).toBeTruthy();
    expect(dot).toBeTruthy();
    expect(dot2).toBeTruthy();
  });

  it('should follow type paths for define and define.js', () => {
    const dotType: DotType = null;
    const dotType2: DotTypeFromPath = null;
    expect(dotType).toBe(null);
    expect(dotType2).toBe(null);
  });
});
