// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { decodeHtmlEntities } from './html.js';

describe('decodeHtmlEntities', () => {
  it('should decode html entities once', () => {
    const source = '&lt;nve-badge status=&quot;success&quot;&gt;GPU &amp; CPU&#039;s&lt;/nve-badge&gt;';

    expect(decodeHtmlEntities(source)).toBe('<nve-badge status="success">GPU & CPU\'s</nve-badge>');
  });

  it('should not double decode ampersand-prefixed entities', () => {
    expect(decodeHtmlEntities('&amp;lt;script&amp;gt;')).toBe('&lt;script&gt;');
  });
});
