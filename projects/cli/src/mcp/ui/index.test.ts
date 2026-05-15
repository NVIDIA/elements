// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { buildUIResourceHtml } from './index.js';

describe(buildUIResourceHtml.name, () => {
  it('should validate inbound MCP UI message source and origin before reading data', () => {
    const html = buildUIResourceHtml({
      title: 'Test MCP UI',
      script: ''
    });
    const messageListenerScript = html.slice(
      html.indexOf("window.addEventListener('message'"),
      html.indexOf('if (m.id !== undefined')
    );

    expect(messageListenerScript).toContain('const expectedOrigin = this.#getExpectedParentOrigin();');
    expect(messageListenerScript).toContain('e.origin !== expectedOrigin');
    expect(messageListenerScript).toContain('e.source !== window.parent');
    expect(messageListenerScript.indexOf('const expectedOrigin')).toBeLessThan(
      messageListenerScript.indexOf('const m = e.data')
    );
  });
});
