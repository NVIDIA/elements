// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { FormatDatetime } from '@nvidia-elements/core/format-datetime';
import '@nvidia-elements/core/format-datetime/define.js';

describe(FormatDatetime.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-format-datetime date-style="long">2023-07-28T04:20:17.434Z</nve-format-datetime>
      <nve-format-datetime date="2024-01-01T00:00:00.000Z" date-style="short"></nve-format-datetime>
      <nve-format-datetime locale="de-DE" date-style="long">2023-07-28T04:20:17.434Z</nve-format-datetime>
    `);

    await elementIsStable(fixture.querySelector(FormatDatetime.metadata.tag));
    const results = await runAxe([FormatDatetime.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
