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
        <span>Editor</span>
        <button type="button">Presentation only</button>
      </nve-ghost>
    `);
    ghost = fixture.querySelector<Ghost>('nve-ghost')!;
    await elementIsStable(ghost);
  });

  afterEach(() => removeFixture(fixture));

  it('projects supplied content without reparenting it', () => {
    const button = ghost.querySelector('button')!;
    expect(ghost.shadowRoot!.querySelector<HTMLSlotElement>('slot')!.assignedElements()).toEqual([
      ghost.querySelector('span'),
      button
    ]);
    expect(button.parentElement).toBe(ghost);
  });

  it('bounds the visual layers and preserves supplied content across changes', async () => {
    const button = ghost.querySelector('button');
    expect(ghost.shadowRoot!.querySelectorAll('.rear')).toHaveLength(0);
    ghost.layers = 8;
    await elementIsStable(ghost);
    expect(ghost.shadowRoot!.querySelectorAll('.rear')).toHaveLength(2);
    expect(ghost.querySelector('button')).toBe(button);
    ghost.layers = 1;
    await elementIsStable(ghost);
    expect(ghost.shadowRoot!.querySelectorAll('.rear')).toHaveLength(0);
    expect(ghost.querySelector('button')).toBe(button);
  });

  it('contains the complete stack within its configured dimensions', async () => {
    ghost.layers = 3;
    ghost.style.setProperty('--stack-offset-x', '6px');
    ghost.style.setProperty('--stack-offset-y', '3px');
    await elementIsStable(ghost);
    const bounds = ghost.getBoundingClientRect();
    const front = ghost.shadowRoot!.querySelector('.front')!.getBoundingClientRect();
    const rear = ghost.shadowRoot!.querySelector('.rear')!.getBoundingClientRect();
    expect(bounds.width).toBe(300);
    expect(bounds.height).toBe(180);
    expect(front.width).toBe(288);
    expect(front.height).toBe(174);
    expect(rear.right).toBe(bounds.right);
    expect(rear.bottom).toBe(bounds.bottom);
  });

  it('prevents focus on supplied interactive preview content', () => {
    const button = ghost.querySelector('button')!;
    button.focus();
    expect(document.activeElement).not.toBe(button);
    expect(ghost.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!.inert).toBe(true);
  });

  it('allows pointer targeting of content beneath the preview', () => {
    fixture.style.position = 'relative';
    const target = document.createElement('button');
    target.textContent = 'Underlying control';
    Object.assign(target.style, { width: '300px', height: '180px' });
    fixture.prepend(target);
    Object.assign(ghost.style, { position: 'absolute', inset: '0', zIndex: '1' });
    const rect = target.getBoundingClientRect();
    expect(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)).toBe(target);
  });
});
