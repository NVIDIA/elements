// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createCssVarCompletions, resolveTokenValue } from './css-var-completions.js';

describe('css variable completions', () => {
  it('should resolve references and collapse matching theme values', () => {
    const completions = createCssVarCompletions({
      baseTokenDictionary: {
        'ref.color.base': { value: 'white', type: 'color' },
        'ref.scale.space': { value: '1' },
        'ref.space.sm': { value: '{ref.scale.space} * 8px', type: 'spacing' },
        'sys.layer.canvas.background': { value: '{ref.color.base}', type: 'color' }
      },
      darkThemeTokenDictionary: {
        'ref.color.base': { value: 'black', type: 'color' }
      },
      highContrastThemeTokenDictionary: {
        'ref.color.base': { value: 'white', type: 'color' }
      },
      compactThemeTokenDictionary: {
        'ref.scale.space': { value: '0.8' }
      },
      reducedMotionThemeTokenDictionary: {}
    });

    expect(completions['--nve-sys-layer-canvas-background'].values).toEqual({
      light: 'white',
      dark: 'black'
    });
    expect(completions['--nve-ref-space-sm'].values).toEqual({
      '': '1 * 8px',
      compact: '0.8 * 8px'
    });
  });

  it('should fail when a token reference cannot be resolved', () => {
    expect(() => resolveTokenValue('{ref.color.missing}', {}, ['sys.color.text'])).toThrow(
      'Unable to resolve a referenced token for path: "ref.color.missing"'
    );
  });

  it('should fail when token references are cyclic', () => {
    const tokenDictionary = {
      'ref.color.a': { value: '{ref.color.b}' },
      'ref.color.b': { value: '{ref.color.a}' }
    };

    expect(() => resolveTokenValue('{ref.color.a}', tokenDictionary, ['sys.color.text'])).toThrow(
      'Cyclic token reference: sys.color.text -> ref.color.a -> ref.color.b -> ref.color.a'
    );
  });
});
