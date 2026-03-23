import { describe, expect, it } from 'vitest';

// root entrypoint types
import type { Color } from '@nvidia-elements/core';
import type { Color as ColorFromPath } from '@nvidia-elements/core/index.js';

// multi-entrypoint
import { Dot } from '@nvidia-elements/core/dot';
import { Dot as DotFromPath } from '@nvidia-elements/core/dot/index.js';

// multi-entrypoint types
import type { Dot as DotType } from '@nvidia-elements/core/dot';
import type { Dot as DotTypeFromPath } from '@nvidia-elements/core/dot/index.js';

// multi-entrypoint define
import * as dot from '@nvidia-elements/core/dot/define.js';

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
  });

  it('should follow type paths for define and define.js', () => {
    const dotType: DotType = null;
    const dotType2: DotTypeFromPath = null;
    expect(dotType).toBe(null);
    expect(dotType2).toBe(null);
  });
});
