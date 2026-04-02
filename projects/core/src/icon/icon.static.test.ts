// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { Icon, mergeIcons } from '@nvidia-elements/core/icon';

describe(`${Icon.metadata.tag}: static`, () => {
  it('should merge conflicting icon versions to latest', async () => {
    class Registered {
      static metadata = {
        version: '0.0.0'
      };

      static _icons: Record<string, { svg: () => string }> = {
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
