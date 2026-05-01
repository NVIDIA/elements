// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { FormatNumber } from '@nvidia-elements/core/format-number';
import '@nvidia-elements/core/format-number/define.js';

describe(FormatNumber.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-format-number locale="en-US">1234567</nve-format-number>
      <nve-format-number locale="en-US" format-style="currency" currency="USD">1234.56</nve-format-number>
      <nve-format-number locale="de-DE">1234.56</nve-format-number>
    `);

    try {
      await elementIsStable(fixture.querySelector(FormatNumber.metadata.tag));
      const results = await runAxe([FormatNumber.metadata.tag]);
      expect(results.violations.length).toBe(0);
    } finally {
      removeFixture(fixture);
    }
  });
});
