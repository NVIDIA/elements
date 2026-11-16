// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { type Meter, MeterGroup } from '@nvidia-elements/core/meter';
import '@nvidia-elements/core/meter/define.js';

describe(MeterGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let group: MeterGroup;
  let first: Meter;
  let second: Meter;
  const track = () => group.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!;

  async function settle() {
    await Promise.all(Array.from(fixture.querySelectorAll('nve-meter')).map(meter => elementIsStable(meter)));
    await elementIsStable(group);
  }

  beforeEach(async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    fixture = await createFixture(html`
      <nve-meter-group aria-label="Storage" style="width: 400px; --height: 8px">
        <nve-meter value="20" color="blue-cobalt" aria-label="Apps"></nve-meter>
        <nve-meter value="30" min="0" max="100" color="teal-cyan" aria-label="Media"></nve-meter>
      </nve-meter-group>
    `);
    group = fixture.querySelector('nve-meter-group')!;
    first = group.querySelectorAll('nve-meter')[0]!;
    second = group.querySelectorAll('nve-meter')[1]!;
    await settle();
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('should keep independent accessible measurements on a shared fixed scale', () => {
    expect(customElements.get('nve-meter-group')).toBe(MeterGroup);
    expect(group._internals.role).toBe('group');
    expect(group._internals.ariaValueNow).toBeNull();
    expect(first._internals.role).toBe('meter');
    expect(second._internals.ariaValueNow).toBe('30');
    expect(first.getBoundingClientRect().width).toBeCloseTo(79.8, 1);
    expect(second.getBoundingClientRect().width).toBeCloseTo(119.7, 1);
    expect(track().getBoundingClientRect().width).toBe(400);
    expect(first.shadowRoot!.querySelector('.fill')!.getBoundingClientRect().width).toBeCloseTo(79.8, 1);
    expect(first.shadowRoot!.querySelector('[internal-host]')!.getBoundingClientRect().height).toBe(8);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should update JS values and bounds without attribute reflection or change events', async () => {
    const changed = vi.fn();
    group.addEventListener('change', changed);
    first.value = 40;
    await settle();
    expect(first.getAttribute('value')).toBe('20');
    expect(first.getBoundingClientRect().width).toBeCloseTo(159.6, 1);
    first.min = second.min = 10;
    first.max = second.max = 110;
    first.value = 30;
    await settle();
    expect(first.getBoundingClientRect().width).toBeCloseTo(79.8, 1);
    expect(second.getBoundingClientRect().width).toBeCloseTo(79.8, 1);
    expect(changed).not.toHaveBeenCalled();
  });

  it('should clip excess capacity without shrinking segments or emitting diagnostics', async () => {
    first.value = second.value = 80;
    await settle();
    expect(first.getBoundingClientRect().width).toBeCloseTo(319.2, 1);
    expect(second.getBoundingClientRect().width).toBeCloseTo(319.2, 1);
    expect(getComputedStyle(track()).overflow).toBe('hidden');
    expect(second.getBoundingClientRect().right).toBeGreaterThan(track().getBoundingClientRect().right);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should reserve gaps before sizing a full allocation and update when a segment is inserted', async () => {
    group.style.setProperty('--gap', '20px');
    first.value = 40;
    second.value = 60;
    await settle();
    expect(first.getBoundingClientRect().width).toBeCloseTo(152, 1);
    expect(second.getBoundingClientRect().width).toBeCloseTo(228, 1);
    expect(second.getBoundingClientRect().right).toBeCloseTo(track().getBoundingClientRect().right, 1);

    const third = document.createElement('nve-meter');
    third.value = 20;
    second.value = 40;
    group.append(third);
    await settle();
    expect(first.getBoundingClientRect().width).toBeCloseTo(144, 1);
    expect(second.getBoundingClientRect().width).toBeCloseTo(144, 1);
    expect(third.getBoundingClientRect().width).toBeCloseTo(72, 1);
    expect(third.getBoundingClientRect().right).toBeCloseTo(track().getBoundingClientRect().right, 1);
  });

  it('should preserve unused capacity and clip excess allocations with custom gaps', async () => {
    group.style.setProperty('--gap', '20px');
    await settle();
    expect(first.getBoundingClientRect().width).toBeCloseTo(76, 1);
    expect(second.getBoundingClientRect().width).toBeCloseTo(114, 1);
    expect(track().getBoundingClientRect().right - second.getBoundingClientRect().right).toBeCloseTo(190, 1);

    first.value = second.value = 80;
    await settle();
    expect(first.getBoundingClientRect().width).toBeCloseTo(304, 1);
    expect(second.getBoundingClientRect().width).toBeCloseTo(304, 1);
    expect(second.getBoundingClientRect().right).toBeGreaterThan(track().getBoundingClientRect().right);
    expect(getComputedStyle(track()).overflow).toBe('hidden');
  });

  it('should render each child from its own bounds without runtime validation', async () => {
    first.max = 200;
    await settle();
    expect(first.max).toBe(200);
    expect(second.max).toBe(100);
    expect(first.getBoundingClientRect().width).toBeCloseTo(39.9, 1);
    expect(second.getBoundingClientRect().top).toBe(first.getBoundingClientRect().top);
    expect(console.warn).not.toHaveBeenCalled();
    first.max = 100;
    await settle();
    expect(first.getBoundingClientRect().width).toBeCloseTo(79.8, 1);
    expect(second.getBoundingClientRect().top).toBe(first.getBoundingClientRect().top);
  });

  it('should synchronize insertion, reordering, and removal', async () => {
    group.style.setProperty('--gap', '3px');
    const meter = document.createElement('nve-meter');
    meter.value = 10;
    meter.setAttribute('aria-label', 'System');
    group.prepend(meter);
    await settle();
    expect(meter.getBoundingClientRect().width).toBeCloseTo(39.4, 1);
    expect(first.getBoundingClientRect().left - meter.getBoundingClientRect().right).toBe(3);
    group.append(first);
    await settle();
    expect(first.getBoundingClientRect().left - second.getBoundingClientRect().right).toBe(3);
    fixture.append(first);
    await settle();
    expect(first.style.getPropertyValue('--_meter-segment-size')).toBe('');
    expect(getComputedStyle(first.shadowRoot!.querySelector('.fill')!).width).not.toBe('0px');
    meter.remove();
    await settle();
    expect(second.getBoundingClientRect().left).toBe(group.getBoundingClientRect().left);
  });

  it('should transfer ownership between groups and stop updating the old group', async () => {
    const other = document.createElement('nve-meter-group');
    other.style.width = '200px';
    fixture.append(other);
    other.append(first);
    await settle();
    await elementIsStable(other);
    first.value = 40;
    await settle();
    await elementIsStable(other);
    expect(first.getBoundingClientRect().width).toBeCloseTo(80, 1);
    expect(second.getBoundingClientRect().width).toBeCloseTo(120, 1);
    const update = vi.spyOn(group, 'requestUpdate');
    first.value = 50;
    await elementIsStable(first);
    await elementIsStable(other);
    expect(update).not.toHaveBeenCalled();
    expect(first.getBoundingClientRect().width).toBeCloseTo(100, 1);
  });

  it('should release child controllers on disconnect and reconnect cleanly', async () => {
    group.remove();
    const update = vi.spyOn(group, 'requestUpdate');
    first.value = 50;
    await elementIsStable(first);
    expect(update).not.toHaveBeenCalled();
    expect(first.style.getPropertyValue('--_meter-segment-size')).toBe('');
    fixture.append(group);
    await settle();
    expect(first.getBoundingClientRect().width).toBeCloseTo(199.5, 1);
    first.value = 60;
    await settle();
    expect(first.getBoundingClientRect().width).toBeCloseTo(239.4, 1);
  });

  it('should preserve child fill overrides and let the group own track styles', async () => {
    group.style.setProperty('--background', 'rgb(220, 220, 220)');
    group.style.setProperty('--height', '12px');
    first.style.setProperty('--accent-color', 'rgb(90, 30, 120)');
    first.style.setProperty('--height', '30px');
    first.status = 'warning';
    await settle();
    expect(getComputedStyle(track()).backgroundColor).toBe('rgb(220, 220, 220)');
    expect(first.shadowRoot!.querySelector('[internal-host]')!.getBoundingClientRect().height).toBe(12);
    expect(getComputedStyle(first.shadowRoot!.querySelector('.fill')!).backgroundColor).toBe('rgb(90, 30, 120)');
    expect(first.color).toBe('blue-cobalt');
    expect(first.status).toBe('warning');
  });

  it('should lay out segments in RTL reading order', async () => {
    group.style.setProperty('--gap', '3px');
    group.dir = 'rtl';
    await settle();
    expect(first.getBoundingClientRect().right).toBe(track().getBoundingClientRect().right);
    expect(first.getBoundingClientRect().left - second.getBoundingClientRect().right).toBe(3);
  });

  it('should handle empty and collapsed groups without diagnostics', async () => {
    first.min = second.min = 10;
    first.max = second.max = 10;
    await settle();
    expect(first.getBoundingClientRect().width).toBe(0);
    expect(second._internals.ariaValueNow).toBe('10');
    group.replaceChildren();
    await settle();
    expect(track().getBoundingClientRect().width).toBe(400);
    expect(track().getBoundingClientRect().height).toBe(8);
    expect(console.warn).not.toHaveBeenCalled();
  });
});
