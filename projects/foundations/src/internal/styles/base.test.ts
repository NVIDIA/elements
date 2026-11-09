// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css } from 'lit';
import { describe, expect, it } from 'vitest';
import { useStyles } from './base.js';
import base from './base.css?inline';
import state from './interaction-state.css?inline';

describe('useStyles', () => {
  it('prepends base and interaction styles before caller overrides in order', () => {
    const override = css`:host { color: red; }`;
    const input = [override, ':host { display: block; }'];
    expect(useStyles(input).map(style => style.cssText)).toEqual([
      base,
      state,
      override.cssText,
      ':host { display: block; }'
    ]);
    expect(input).toEqual([override, ':host { display: block; }']);
  });

  it('includes the shared styles when no overrides are supplied', () => {
    expect(useStyles([]).map(style => style.cssText)).toEqual([base, state]);
  });
});
