// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Viewport, ViewportZoomRange } from './index.js';
import './define.js';

describe(ViewportZoomRange.metadata.tag, () => {
  let fixture: HTMLElement;
  let viewport: Viewport;
  let range: ViewportZoomRange;
  const input = (): HTMLInputElement => {
    const element = range.shadowRoot?.querySelector('input');
    if (!element) throw new Error('Zoom range input missing');
    return element;
  };
  const change = (value: number): void => {
    input().valueAsNumber = Math.log(value / range.min) / Math.log(range.max / range.min);
    input().dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
  };

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-viewport id="zoom-target" behavior-pan behavior-zoom min-scale="0.25" max-scale="4"
        style="width: 400px; height: 300px"></nve-viewport>
      <nve-viewport-zoom-range commandfor="zoom-target" aria-label="Zoom"></nve-viewport-zoom-range>
    `);
    viewport = fixture.querySelector(Viewport.metadata.tag);
    range = fixture.querySelector(ViewportZoomRange.metadata.tag);
    await elementIsStable(viewport);
    await elementIsStable(range);
  });

  afterEach(() => removeFixture(fixture));

  describe('targeting and synchronization', () => {
    it('initializes its bounds and value from the viewport', () => {
      expect(customElements.get(ViewportZoomRange.metadata.tag)).toBe(ViewportZoomRange);
      expect(range.min).toBe(0.25);
      expect(range.max).toBe(4);
      expect(range.valueAsNumber).toBe(1);
      expect(input().disabled).toBe(false);
      expect(input().getAttribute('aria-label')).toBe('Zoom');
    });

    it('controls its direct parent viewport without an explicit target', async () => {
      range.commandfor = null;
      viewport.append(range);
      await elementIsStable(range);
      change(2);
      expect(viewport.scale).toBeCloseTo(2);
      viewport.scale = 3;
      await elementIsStable(viewport);
      await elementIsStable(range);
      expect(range.scale).toBe(3);
    });

    it('prioritizes explicit targets over its parent viewport', async () => {
      viewport.append(range);
      const other = document.createElement('nve-viewport');
      other.id = 'other-zoom-target';
      other.behaviorZoom = true;
      other.scale = 3;
      fixture.append(other);
      await elementIsStable(other);
      range.commandfor = other.id;
      await elementIsStable(range);
      change(2);
      expect(other.scale).toBeCloseTo(2);
      expect(viewport.scale).toBe(1);
      range.commandForElement = viewport;
      await elementIsStable(range);
      change(4);
      expect(viewport.scale).toBeCloseTo(4);
      expect(other.scale).toBeCloseTo(2);
    });

    it('prioritizes commandForElement over commandfor and stops observing the previous target', async () => {
      const other = document.createElement('nve-viewport');
      other.behaviorZoom = true;
      other.scale = 3;
      fixture.append(other);
      await elementIsStable(other);
      range.commandForElement = other;
      await elementIsStable(range);
      expect(range.valueAsNumber).toBeCloseTo(3);
      viewport.scale = 2;
      await elementIsStable(viewport);
      expect(range.valueAsNumber).toBeCloseTo(3);
      change(4);
      expect(other.scale).toBeCloseTo(4);
      expect(viewport.scale).toBe(2);
      range.commandForElement = null;
      await elementIsStable(range);
      expect(range.valueAsNumber).toBe(2);
    });

    it('resolves commandfor within an enclosing shadow root', async () => {
      range.remove();
      viewport.remove();
      const host = document.createElement('div');
      const shadow = host.attachShadow({ mode: 'open' });
      shadow.append(viewport, range);
      fixture.append(host);
      await elementIsStable(viewport);
      await elementIsStable(range);
      change(2);
      expect(viewport.scale).toBe(2);
    });

    it('observes programmatic and animated navigation without issuing commands', async () => {
      const command = vi.fn();
      viewport.addEventListener('command', command);
      viewport.animateTo({ scale: 2.25 }, { duration: 0 });
      await elementIsStable(viewport);
      await elementIsStable(range);
      expect(range.valueAsNumber).toBe(2.25);
      expect(command).not.toHaveBeenCalled();
      range.valueAsNumber = 3;
      await elementIsStable(range);
      expect(viewport.scale).toBe(2.25);
      expect(command).not.toHaveBeenCalled();
    });

    it('updates limits and disabled state independently of transform changes', async () => {
      viewport.minScale = 0.5;
      viewport.maxScale = 3;
      viewport.behaviorZoom = false;
      await elementIsStable(viewport);
      await elementIsStable(range);
      expect(range.min).toBe(0.5);
      expect(range.max).toBe(3);
      expect(input().disabled).toBe(true);
      viewport.behaviorZoom = true;
      await elementIsStable(viewport);
      await elementIsStable(range);
      expect(input().disabled).toBe(false);
    });

    it('skips target lookup when command target input is unchanged', async () => {
      const getRootNode = vi.spyOn(range, 'getRootNode');
      try {
        viewport.scale = 2;
        await elementIsStable(viewport);
        await elementIsStable(range);
        range.requestUpdate();
        await elementIsStable(range);
        expect(range.valueAsNumber).toBe(2);
        expect(getRootNode).not.toHaveBeenCalled();
      } finally {
        getRootNode.mockRestore();
      }
    });

    it('resolves newly added and replaced commandfor targets when the control updates', async () => {
      range.commandfor = 'later-viewport';
      await elementIsStable(range);
      expect(input().disabled).toBe(true);
      const later = document.createElement('nve-viewport');
      later.id = 'later-viewport';
      later.behaviorZoom = true;
      later.scale = 2;
      fixture.append(later);
      await elementIsStable(later);
      range.requestUpdate();
      await elementIsStable(range);
      expect(range.valueAsNumber).toBe(2);
      const replacement = document.createElement('nve-viewport');
      replacement.id = later.id;
      replacement.behaviorZoom = true;
      replacement.scale = 3;
      later.replaceWith(replacement);
      await elementIsStable(replacement);
      range.requestUpdate();
      await elementIsStable(range);
      expect(range.valueAsNumber).toBeCloseTo(3);
    });

    it('reconnects without duplicating input commands', async () => {
      const command = vi.fn();
      viewport.addEventListener('command', command);
      range.remove();
      viewport.scale = 2;
      fixture.append(range);
      await elementIsStable(viewport);
      await elementIsStable(range);
      expect(range.valueAsNumber).toBe(2);
      change(3);
      expect(command).toHaveBeenCalledOnce();
    });
  });

  describe('proportional scale mapping', () => {
    it('places 100% at the midpoint of the default bounds and exposes actual scale', async () => {
      viewport.minScale = 0.05;
      viewport.maxScale = 20;
      await elementIsStable(viewport);
      await elementIsStable(range);
      expect(input().valueAsNumber).toBeCloseTo(0.5);
      expect(range.style.getPropertyValue('--track-progress')).toBe('0.5');
      expect(input().getAttribute('aria-valuenow')).toBe('1');
      expect(input().getAttribute('aria-valuetext')).toBe('100%');
      input().valueAsNumber = 0;
      input().dispatchEvent(new InputEvent('input', { bubbles: true }));
      expect(viewport.scale).toBe(0.05);
      input().valueAsNumber = 1;
      input().dispatchEvent(new InputEvent('input', { bubbles: true }));
      expect(viewport.scale).toBe(20);
    });

    it('changes scale by equal ratios for equal slider movements', () => {
      const scales: number[] = [];
      for (const position of [0.25, 0.5, 0.75]) {
        input().valueAsNumber = position;
        input().dispatchEvent(new InputEvent('input', { bubbles: true }));
        scales.push(viewport.scale);
      }
      expect(scales).toEqual([0.5, 1, 2]);
      expect(range.scale).toBe(2);
      expect(range.checkValidity()).toBe(true);
    });

    it('reflects arbitrary viewport scales as valid continuous values by default', async () => {
      const command = vi.fn();
      viewport.addEventListener('command', command);
      viewport.scale = 1.137;
      await elementIsStable(viewport);
      await elementIsStable(range);
      expect(range.step).toBe(0);
      expect(range.scale).toBe(1.137);
      expect(range.checkValidity()).toBe(true);
      expect(input().valueAsNumber).toBeCloseTo(Math.log(1.137 / range.min) / Math.log(range.max / range.min));
      expect(command).not.toHaveBeenCalled();
    });
  });

  describe('input and orientation', () => {
    it('issues one immediate centered zoom command per input and emits input and change', async () => {
      const command = vi.fn();
      const inputs = vi.fn();
      const changes = vi.fn();
      viewport.addEventListener('command', command);
      range.addEventListener('input', inputs);
      range.addEventListener('change', changes);
      const center = viewport.toContentCoords(200, 150);
      change(2);
      expect(command).toHaveBeenCalledWith(
        expect.objectContaining({ command: '--zoom-to', source: expect.objectContaining({ scale: 2 }) })
      );
      expect(command).toHaveBeenCalledOnce();
      expect(inputs).toHaveBeenCalledOnce();
      expect(viewport.scale).toBe(2);
      expect(viewport.toContentCoords(200, 150)).toEqual(center);
      change(3);
      expect(command).toHaveBeenCalledTimes(2);
      expect(range.valueAsNumber).toBeCloseTo(3);
      input().dispatchEvent(new Event('change', { bubbles: true }));
      expect(changes).toHaveBeenCalledOnce();
      await elementIsStable(range);
      expect(input().valueAsNumber).toBeCloseTo(Math.log(3 / range.min) / Math.log(range.max / range.min));
    });

    it('navigates through the native slider keyboard interaction', async () => {
      const command = vi.fn();
      viewport.addEventListener('command', command);
      input().focus();
      await userEvent.keyboard('{ArrowRight}');
      await elementIsStable(viewport);
      await elementIsStable(range);
      expect(viewport.scale).toBeCloseTo(16 ** 0.01);
      expect(range.valueAsNumber).toBe(viewport.scale);
      expect(command).toHaveBeenCalledOnce();
    });

    it('supports a vertical overlay with higher scale at the top', async () => {
      range.orientation = 'vertical';
      range.slot = 'overlay';
      viewport.append(range);
      await elementIsStable(range);
      expect(range.getAttribute('orientation')).toBe('vertical');
      expect(input().getAttribute('aria-orientation')).toBe('vertical');
      expect(getComputedStyle(input()).writingMode).toBe('vertical-lr');
      expect(getComputedStyle(input()).direction).toBe('rtl');
      const frame = input().getBoundingClientRect();
      expect(frame.height).toBeGreaterThan(frame.width);
      await userEvent.click(input(), { position: { x: frame.width / 2, y: 12 } });
      expect(viewport.scale).toBeGreaterThan(1);
      await userEvent.keyboard('{ArrowDown}');
      const lower = viewport.scale;
      await userEvent.keyboard('{ArrowUp}');
      expect(viewport.scale).toBeGreaterThan(lower);
    });
  });

  describe('disabled behavior', () => {
    it('disables the slider when minimum and maximum scale are equal', async () => {
      viewport.minScale = 4;
      await elementIsStable(viewport);
      await elementIsStable(range);
      expect(input().disabled).toBe(true);
      expect(input().valueAsNumber).toBe(0);
      expect(range.scale).toBe(4);
    });

    it.each(['disabled', 'readOnly'] as const)('does not navigate while %s', async property => {
      range[property] = true;
      await elementIsStable(range);
      change(2);
      expect(viewport.scale).toBe(1);
    });

    it('rejects input immediately after viewport zoom is disabled', () => {
      viewport.behaviorZoom = false;
      change(2);
      expect(viewport.scale).toBe(1);
    });
  });

  describe('stepping and forms', () => {
    it('honors an explicit scale step', () => {
      range.step = 0.25;
      change(1.6);
      expect(viewport.scale).toBe(1.5);
      expect(range.checkValidity()).toBe(true);
    });

    it('uses explicit scale steps for keyboard input', async () => {
      range.step = 0.25;
      input().focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(viewport.scale).toBe(1.25);
      await userEvent.keyboard('{ArrowLeft}');
      expect(viewport.scale).toBe(1);
    });

    it('preserves off-step viewport scales and reports stepMismatch', async () => {
      const form = document.createElement('form');
      fixture.append(form);
      range.name = 'scale';
      form.append(range);
      range.step = 0.3;
      await elementIsStable(range);
      change(4);
      expect(viewport.scale).toBe(4);
      expect(range.step).toBe(0.3);
      expect(range.validity.stepMismatch).toBe(true);
      expect(form.checkValidity()).toBe(false);
      expect(new FormData(form).get('scale')).toBe('4');
      viewport.scale = 1.1;
      await elementIsStable(viewport);
      await elementIsStable(range);
      expect(range.scale).toBe(1.1);
      expect(form.checkValidity()).toBe(false);
      expect(new FormData(form).get('scale')).toBe('1.1');
    });

    it('validates scale bounds, missing values, and custom errors while respecting noValidate', () => {
      range.valueAsNumber = 0.1;
      expect(range.checkValidity()).toBe(false);
      expect(range.validity.rangeUnderflow).toBe(true);
      range.valueAsNumber = 5;
      expect(range.checkValidity()).toBe(false);
      expect(range.validity.rangeOverflow).toBe(true);
      range.valueAsNumber = NaN;
      expect(range.checkValidity()).toBe(false);
      expect(range.validity.valueMissing).toBe(true);
      range.valueAsNumber = 1.1;
      expect(range.checkValidity()).toBe(true);
      range.setCustomValidity('Choose another scale');
      expect(range.checkValidity()).toBe(false);
      expect(range.validity.customError).toBe(true);
      expect(range.validationMessage).toBe('Choose another scale');
      range.valueAsNumber = 4;
      expect(range.validity.customError).toBe(true);
      range.setCustomValidity('');
      expect(range.reportValidity()).toBe(true);
      range.valueAsNumber = 5;
      range.noValidate = true;
      expect(range.checkValidity()).toBe(true);
      range.noValidate = false;
      expect(range.checkValidity()).toBe(false);
      expect(range.validity.rangeOverflow).toBe(true);
    });

    it('submits scale as a numeric form value and omits unavailable controls', async () => {
      const form = document.createElement('form');
      fixture.append(form);
      range.name = 'scale';
      form.append(range);
      await elementIsStable(range);
      change(2);
      expect(new FormData(form).get('scale')).toBe('2');
      viewport.behaviorZoom = false;
      await elementIsStable(viewport);
      await elementIsStable(range);
      expect(new FormData(form).has('scale')).toBe(false);
    });
  });
});
