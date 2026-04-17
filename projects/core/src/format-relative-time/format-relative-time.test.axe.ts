// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { FormatRelativeTime } from '@nvidia-elements/core/format-relative-time';
import '@nvidia-elements/core/format-relative-time/define.js';

describe(FormatRelativeTime.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-format-relative-time date="2023-07-27T12:00:00.000Z"></nve-format-relative-time>
      <nve-format-relative-time date="2020-01-15T12:00:00.000Z" numeric="auto"></nve-format-relative-time>
      <nve-format-relative-time locale="de-DE" date="2023-07-27T12:00:00.000Z"></nve-format-relative-time>
    `);

    await elementIsStable(fixture.querySelector(FormatRelativeTime.metadata.tag));
    const results = await runAxe([FormatRelativeTime.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
