// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Ghost } from '@nvidia-elements/core/ghost';
import '@nvidia-elements/core/ghost/define.js';

describe(Ghost.metadata.tag, () => {
  let fixture: HTMLElement;
  let ghost: Ghost;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-ghost style="width:300px;height:180px">
        <span slot="label">Editor</span>
        <button type="button">Presentation only</button>
      </nve-ghost>
    `);
    ghost = fixture.querySelector<Ghost>('nve-ghost')!;
    await elementIsStable(ghost);
  });

  afterEach(() => removeFixture(fixture));

  it('keeps supplied presentation nodes in their original slots', () => {
    const button = ghost.querySelector('button')!;
    expect(ghost.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!.assignedElements()).toEqual([button]);
    expect(button.parentElement).toBe(ghost);
  });

  it('shows the supplied title above its preview content', () => {
    const label = ghost.querySelector<HTMLElement>('[slot="label"]')!;
    const content = ghost.shadowRoot!.querySelector<HTMLElement>('.content')!;
    expect(label.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(label.getBoundingClientRect().bottom).toBeLessThanOrEqual(content.getBoundingClientRect().top);
  });

  it('omits the optional title space when no label is supplied', async () => {
    const content = ghost.shadowRoot!.querySelector<HTMLElement>('.content')!;
    const before = content.getBoundingClientRect().top;
    ghost.querySelector('[slot="label"]')!.remove();
    await elementIsStable(ghost);
    expect(content.getBoundingClientRect().top).toBeLessThan(before);
    const host = ghost.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!;
    expect(content.getBoundingClientRect().top).toBeCloseTo(host.getBoundingClientRect().top + 2);
  });

  it('carries native radius shorthand and individual corner overrides through the preview frame', () => {
    ghost.style.setProperty('--border-radius', '8px 12px 16px 20px / 4px 6px 8px 10px');
    const frame = ghost.shadowRoot!.querySelector('[internal-host]')!;
    expect(getComputedStyle(frame).borderRadius).toBe('8px 12px 16px 20px / 4px 6px 8px 10px');
    ghost.style.borderTopRightRadius = '0px';
    ghost.style.borderBottomRightRadius = '0px';
    expect(getComputedStyle(frame).borderRadius).toBe(getComputedStyle(ghost).borderRadius);
    expect(getComputedStyle(frame).borderTopLeftRadius).toBe('8px 4px');
    expect(getComputedStyle(frame).borderTopRightRadius).toBe('0px');
  });

  it('prevents focus on supplied interactive preview content', () => {
    const button = ghost.querySelector('button')!;
    button.focus();
    expect(document.activeElement).not.toBe(button);
    expect(ghost.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!.inert).toBe(true);
  });
});
