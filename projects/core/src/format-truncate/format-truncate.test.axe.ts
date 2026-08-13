// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { FormatTruncate } from '@nvidia-elements/core/format-truncate';
import '@nvidia-elements/core/format-truncate/define.js';

describe(FormatTruncate.metadata.tag, () => {
  it('should pass axe checks for every truncation position and strategy', async () => {
    const fixture = await createFixture(html`
      <nve-format-truncate position="start">training-pipeline-2026-08-05-production</nve-format-truncate>
      <nve-format-truncate position="end">training-pipeline-2026-08-05-production</nve-format-truncate>
      <nve-format-truncate position="center" strategy="character">experiment-👩🏽‍💻-0123456789abcdef</nve-format-truncate>
      <nve-format-truncate position="center" strategy="word" bias="start" preserve="3">NVIDIA autonomous vehicle training pipeline</nve-format-truncate>
      <nve-format-truncate position="center" strategy="path" preserve="2">/models/checkpoints/production/model.bin</nve-format-truncate>
    `);

    try {
      await elementIsStable(fixture.querySelector(FormatTruncate.metadata.tag));
      const results = await runAxe([FormatTruncate.metadata.tag]);
      expect(results.violations.length).toBe(0);
    } finally {
      removeFixture(fixture);
    }
  });
});
