// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Scene } from '@nvidia-elements/scene/scene';
import '@nvidia-elements/scene/scene/define.js';

describe(Scene.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Scene;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    fixture = await createFixture(html`
      <nve-scene aria-label="Robot visualization"></nve-scene>
    `);
    element = fixture.querySelector(Scene.metadata.tag);
    await elementIsStable(element);
    appendSlottedText(element, 'fallback', 'The 3D scene is unavailable.');
    await Promise.resolve();
  });

  afterEach(() => {
    removeFixture(fixture);
    consoleError.mockRestore();
  });

  it('should expose an accessible named region and pass axe with fallback content', async () => {
    const results = await runAxe([Scene.metadata.tag]);

    expect(element._internals.role).toBe('region');
    expect(element.tabIndex).toBe(0);
    expect(element.shadowRoot?.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true');
    expect(
      element.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="fallback"]')?.assignedElements()
    ).toHaveLength(1);
    expect(results.violations.length).toBe(0);
  });
});

function appendSlottedText(element: Scene, slot: string, text: string): void {
  const paragraph = document.createElement('p');
  paragraph.slot = slot;
  paragraph.setAttribute('nve-text', 'body');
  paragraph.textContent = text;
  element.append(paragraph);
}
