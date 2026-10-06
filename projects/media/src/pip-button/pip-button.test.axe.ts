// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { createMediaState } from '../internal/media-state.js';
import { MediaPipButton } from './pip-button.js';
import './define.js';

describe(MediaPipButton.metadata.tag, () => {
  it('should pass axe checks for inactive, active, unavailable, and consumer-disabled controls', async () => {
    const fixture = await createFixture(html`
      <div id="pip-inactive" .mediaState=${createMediaState({ pipAvailable: true })}></div>
      <div id="pip-active" .mediaState=${createMediaState({ pip: true, pipAvailable: true })}></div>
      <nve-media-pip-button commandfor="pip-inactive"></nve-media-pip-button>
      <nve-media-pip-button commandfor="pip-active"></nve-media-pip-button>
      <nve-media-pip-button></nve-media-pip-button>
      <nve-media-pip-button commandfor="pip-inactive" disabled></nve-media-pip-button>
    `);
    try {
      await Promise.all(
        [...fixture.querySelectorAll<MediaPipButton>(MediaPipButton.metadata.tag)].map(element =>
          elementIsStable(element)
        )
      );
      const results = await runAxe([MediaPipButton.metadata.tag]);
      expect(results).toMatchObject({ violations: [] });
    } finally {
      removeFixture(fixture);
    }
  });
});
