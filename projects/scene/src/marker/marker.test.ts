// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture, required } from '@internals/testing';
import { configureSceneTesting, resetSceneTesting } from '../internal/testing.js';
import { SceneMarker } from './marker.js';
import '@nvidia-elements/scene/cubes/define.js';
import '@nvidia-elements/scene/scene/define.js';

describe(SceneMarker.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) removeFixture(fixture);
    resetSceneTesting();
  });

  it('should define declarative marker attributes', async () => {
    fixture = await createFixture(html`
      <nve-scene-cubes>
        <nve-scene-marker position="[1,2,3]" orientation="[0,0,0,1]" scale="[2,2,2]" color="red" outline-color="blue"></nve-scene-marker>
      </nve-scene-cubes>
    `);
    const marker = required(fixture.querySelector<SceneMarker>(SceneMarker.metadata.tag), 'Expected marker fixture.');
    await elementIsStable(marker);
    expect(customElements.get(SceneMarker.metadata.tag)).toBe(SceneMarker);
    expect(marker).toMatchObject({
      position: [1, 2, 3],
      orientation: [0, 0, 0, 1],
      scale: [2, 2, 2],
      color: 'red',
      outlineColor: 'blue'
    });
  });

  it('should give focusable markers a button role while preserving an authored role', async () => {
    fixture = await createFixture(html`
      <nve-scene-cubes>
        <nve-scene-marker id="default" tabindex="0"></nve-scene-marker>
        <nve-scene-marker id="authored" role="link" aria-label="Authored marker" tabindex="0"></nve-scene-marker>
      </nve-scene-cubes>
    `);
    const defaultMarker = required(fixture.querySelector<SceneMarker>('#default'), 'Expected default marker.');
    const authoredMarker = required(fixture.querySelector<SceneMarker>('#authored'), 'Expected authored marker.');
    await Promise.all([elementIsStable(defaultMarker), elementIsStable(authoredMarker)]);

    expect(defaultMarker?._internals.role).toBe('button');
    expect(authoredMarker?.getAttribute('role')).toBe('link');
    expect(authoredMarker?._internals.role).not.toBe('button');
  });

  it('should match keyboard activation keys to button, link, and unrelated authored roles', async () => {
    configureSceneTesting({ requestAdapter: () => new Promise(() => undefined) });
    fixture = await createFixture(html`
      <nve-scene aria-label="Marker activation">
        <nve-scene-cubes>
          <nve-scene-marker id="default" tabindex="0" aria-label="Default marker"></nve-scene-marker>
          <nve-scene-marker id="button" role="button" tabindex="0" aria-label="Button marker"></nve-scene-marker>
          <nve-scene-marker id="link" role="link" tabindex="0" aria-label="Link marker"></nve-scene-marker>
          <nve-scene-marker id="status" role="status" tabindex="0" aria-label="Status marker"></nve-scene-marker>
        </nve-scene-cubes>
      </nve-scene>
    `);
    const defaultMarker = required(fixture.querySelector<SceneMarker>('#default'), 'Expected default marker.');
    const buttonMarker = required(fixture.querySelector<SceneMarker>('#button'), 'Expected button marker.');
    const linkMarker = required(fixture.querySelector<SceneMarker>('#link'), 'Expected link marker.');
    const statusMarker = required(fixture.querySelector<SceneMarker>('#status'), 'Expected status marker.');
    await Promise.all([
      elementIsStable(defaultMarker),
      elementIsStable(buttonMarker),
      elementIsStable(linkMarker),
      elementIsStable(statusMarker)
    ]);

    const clicks = new Map<string, number>([
      ['default', 0],
      ['button', 0],
      ['link', 0],
      ['status', 0]
    ]);
    for (const [id, marker] of [
      ['default', defaultMarker],
      ['button', buttonMarker],
      ['link', linkMarker],
      ['status', statusMarker]
    ] as const) {
      marker?.addEventListener('click', () => clicks.set(id, (clicks.get(id) ?? 0) + 1));
      marker?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
      marker?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' }));
    }

    expect(defaultMarker?._internals.role).toBe('button');
    expect(clicks).toEqual(
      new Map<string, number>([
        ['default', 2],
        ['button', 2],
        ['link', 1],
        ['status', 0]
      ])
    );
  });
});
