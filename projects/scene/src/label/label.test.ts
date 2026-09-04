// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import {
  consumeLabelDirty,
  getLabelConfiguration,
  getLabelStateSnapshot,
  setLabelSceneState
} from '../internal/label/state.js';
import { SceneLabel } from './label.js';
import './define.js';

describe(SceneLabel.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => fixture && removeFixture(fixture));

  it('should define layout-transparent declarative label values', async () => {
    fixture = await createFixture(html`
      <nve-scene-label anchor="top-left" frame="base-link" offset="[4,-8]" position="[1,2,3]">
        <span>Robot base</span>
      </nve-scene-label>
    `);
    const label = getLabel(fixture);
    await elementIsStable(label);

    expect(customElements.get(SceneLabel.metadata.tag)).toBe(SceneLabel);
    expect(label).toMatchObject({ anchor: 'top-left', frame: 'base-link', offset: [4, -8], position: [1, 2, 3] });
    expect(label.shadowRoot?.querySelector('slot')).toBeDefined();
    expect(getComputedStyle(label).display).toBe('contents');
  });

  it('should use the documented defaults and preserve its light-DOM child', async () => {
    fixture = await createFixture(html`<nve-scene-label><button>Open robot details</button></nve-scene-label>`);
    const label = getLabel(fixture);
    const child = label.firstElementChild;
    await elementIsStable(label);

    expect(label).toMatchObject({ anchor: 'center', frame: null, offset: [0, 0], position: [0, 0, 0] });
    expect(label.firstElementChild).toBe(child);
    expect(label.stale).toBe(false);
    expect(label.occluded).toBe(false);
  });

  it('should notify internal state when invalidated and accept Scene-managed reflected state', async () => {
    fixture = await createFixture(html`<nve-scene-label><span>Robot base</span></nve-scene-label>`);
    const label = getLabel(fixture);
    await elementIsStable(label);
    const version = getLabelStateSnapshot(label).version;

    label.invalidate();
    setLabelSceneState(label, { occluded: true, stale: true });
    await elementIsStable(label);

    expect(getLabelStateSnapshot(label)).toMatchObject({ dirty: true });
    expect(getLabelStateSnapshot(label).version).toBeGreaterThan(version);
    expect(label).toMatchObject({ occluded: true, stale: true });
    expect(label.hasAttribute('occluded')).toBe(true);
    expect(label.hasAttribute('stale')).toBe(true);
  });

  it('should provide deterministic configuration fallbacks and let Scene correct authored state', async () => {
    fixture = await createFixture(html`
      <nve-scene-label frame="  " occluded offset="[1]" position="[1,2]" stale>
        <span>Robot base</span>
      </nve-scene-label>
    `);
    const label = getLabel(fixture);
    label.setAttribute('anchor', 'diagonal');
    await elementIsStable(label);

    expect(getLabelConfiguration(label)).toEqual({
      anchor: 'center',
      frame: null,
      offset: [0, 0],
      position: [0, 0, 0]
    });
    expect(label).toMatchObject({ occluded: true, stale: true });

    setLabelSceneState(label, { occluded: false, stale: false });
    expect(label).toMatchObject({ occluded: false, stale: false });
    expect(label.hasAttribute('occluded')).toBe(false);
    expect(label.hasAttribute('stale')).toBe(false);

    label.setAttribute('occluded', '');
    label.setAttribute('stale', '');
    expect(label).toMatchObject({ occluded: true, stale: true });

    setLabelSceneState(label, { occluded: false, stale: false });
    expect(label).toMatchObject({ occluded: false, stale: false });
  });

  it('should retain registered state across disconnect and reconnect', async () => {
    fixture = await createFixture(html`<nve-scene-label><span>Robot base</span></nve-scene-label>`);
    const label = getLabel(fixture);
    await elementIsStable(label);
    expect(consumeLabelDirty(label)).toBe(true);
    expect(consumeLabelDirty(label)).toBe(false);

    label.remove();
    fixture.append(label);
    await elementIsStable(label);
    expect(consumeLabelDirty(label)).toBe(false);

    const version = getLabelStateSnapshot(label).version;
    label.invalidate();

    expect(getLabelStateSnapshot(label)).toMatchObject({ dirty: true });
    expect(getLabelStateSnapshot(label).version).toBeGreaterThan(version);
  });
});

function getLabel(fixture: HTMLElement): SceneLabel {
  const label = fixture.querySelector<SceneLabel>(SceneLabel.metadata.tag);
  if (!label) {
    throw new Error('Expected a scene label.');
  }
  return label;
}
