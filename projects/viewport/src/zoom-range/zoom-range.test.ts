// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { Viewport } from '@nvidia-elements/viewport/viewport';
import { ViewportZoomRange } from '@nvidia-elements/viewport/zoom-range';
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
    const viewportElement = fixture.querySelector('nve-viewport');
    const rangeElement = fixture.querySelector('nve-viewport-zoom-range');
    if (!viewportElement || !rangeElement) throw new Error('Viewport and zoom range are missing.');
    viewport = viewportElement;
    range = rangeElement;
    await elementIsStable(viewport);
    await elementIsStable(range);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('setup and targeting', () => {
    it('provides a default slider label with an empty translation registry', async () => {
      vi.stubGlobal('NVE_ELEMENTS', {
        ...globalThis.NVE_ELEMENTS,
        state: { ...globalThis.NVE_ELEMENTS.state, i18nRegistry: {} }
      });
      const unlabelledRange = new ViewportZoomRange();
      fixture.append(unlabelledRange);
      await elementIsStable(unlabelledRange);

      expect(unlabelledRange.shadowRoot?.querySelector('input')?.getAttribute('aria-label')).toBe('scale');
    });

    it('initializes its bounds and value from the viewport', () => {
      expect(customElements.get(ViewportZoomRange.metadata.tag)).toBe(ViewportZoomRange);
      expect(range.min).toBe(0.25);
      expect(range.max).toBe(4);
      expect(range.valueAsNumber).toBe(1);
      expect(range.commandForElement).toBe(viewport);
      expect(input().disabled).toBe(false);
      expect(input().getAttribute('aria-label')).toBe('Zoom');
    });

    it('controls its direct parent viewport without an explicit target', async () => {
      range.commandfor = null;
      viewport.append(range);
      await elementIsStable(range);
      expect(range.commandForElement).toBe(viewport);
      change(2);
      expect(viewport.scale).toBeCloseTo(2);
      viewport.scale = 3;
      await elementIsStable(viewport);
      await elementIsStable(range);
      expect(range.scale).toBe(3);
    });

    it('synchronizes and navigates through an explicit commandForElement target', async () => {
      const other = document.createElement('nve-viewport');
      other.behaviorZoom = true;
      other.scale = 3;
      fixture.append(other);
      await elementIsStable(other);
      range.commandfor = null;
      range.commandForElement = other;
      await elementIsStable(range);
      expect(range.valueAsNumber).toBeCloseTo(3);
      change(4);
      expect(other.scale).toBeCloseTo(4);
      expect(viewport.scale).toBe(1);
    });

    it('reflects an explicit element and lets an attribute change replace it', async () => {
      const other = document.createElement('nve-viewport');
      other.behaviorZoom = true;
      fixture.append(other);
      await elementIsStable(other);
      range.commandForElement = other;

      expect(range.commandForElement).toBe(other);
      expect(range.commandfor).toBe('');
      expect(range.getAttribute('commandfor')).toBe('');
      await elementIsStable(range);
      change(2);
      expect(other.scale).toBeCloseTo(2);
      expect(viewport.scale).toBe(1);

      range.setAttribute('commandfor', viewport.id);

      expect(range.commandForElement).toBe(viewport);
      await elementIsStable(range);
      change(3);
      expect(viewport.scale).toBeCloseTo(3);
      expect(other.scale).toBeCloseTo(2);
    });

    it('clears the attribute and restores the parent default when the element property is cleared', async () => {
      viewport.append(range);
      range.commandForElement = viewport;
      await elementIsStable(range);

      range.commandForElement = null;

      expect(range.hasAttribute('commandfor')).toBe(false);
      expect(range.commandfor).toBeNull();
      expect(range.commandForElement).toBe(viewport);
      await elementIsStable(range);
      change(2);
      expect(viewport.scale).toBeCloseTo(2);
    });

    it('treats an empty explicit attribute as an unresolved target', async () => {
      viewport.append(range);
      range.commandForElement = viewport;
      range.setAttribute('commandfor', '');
      await elementIsStable(range);

      expect(range.commandForElement).toBeNull();
      expect(input().disabled).toBe(true);
    });

    it('follows its parent when moved and lets an explicit id override discovery', async () => {
      const other = document.createElement('nve-viewport');
      other.behaviorZoom = true;
      fixture.append(other);
      await elementIsStable(other);
      range.commandfor = null;
      viewport.append(range);
      await elementIsStable(range);

      other.append(range);

      expect(range.commandForElement).toBe(other);
      change(2);
      expect(other.scale).toBeCloseTo(2);
      expect(viewport.scale).toBe(1);

      range.commandfor = viewport.id;

      expect(range.commandForElement).toBe(viewport);
      await elementIsStable(range);
      change(3);
      expect(viewport.scale).toBeCloseTo(3);
      expect(other.scale).toBeCloseTo(2);
    });

    it('keeps an unresolved explicit id from falling back to the parent viewport', async () => {
      range.commandfor = 'missing-viewport';
      viewport.append(range);
      await elementIsStable(range);

      expect(range.commandForElement).toBeNull();
      expect(input().disabled).toBe(true);
      change(2);
      expect(viewport.scale).toBe(1);

      range.commandfor = null;

      expect(range.commandForElement).toBe(viewport);
      await elementIsStable(range);
      change(2);
      expect(viewport.scale).toBeCloseTo(2);
    });

    it('navigates through native input within an enclosing shadow root', async () => {
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
  });

  describe('state synchronization', () => {
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

    it('caches its subscription while public association reads resolve the current id', async () => {
      const getElementById = vi.spyOn(document, 'getElementById');
      expect(range.commandForElement).toBe(viewport);
      expect(range.commandForElement).toBe(viewport);
      expect(getElementById).toHaveBeenCalledTimes(2);
      getElementById.mockClear();

      viewport.scale = 2;
      await elementIsStable(viewport);
      await elementIsStable(range);
      viewport.scale = 3;
      await elementIsStable(viewport);
      await elementIsStable(range);

      expect(range.scale).toBe(3);
      expect(getElementById).not.toHaveBeenCalled();
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
  });

  describe('target lifecycle', () => {
    it('disables input and omits form data without a viewport target', async () => {
      range.remove();
      range = document.createElement('nve-viewport-zoom-range');
      range.name = 'scale';
      const form = document.createElement('form');
      fixture.append(form);
      form.append(range);
      await elementIsStable(range);
      const inputs = vi.fn();
      const changes = vi.fn();
      range.addEventListener('input', inputs);
      range.addEventListener('change', changes);
      expect(input().disabled).toBe(true);

      input().valueAsNumber = 0.75;
      input().dispatchEvent(new InputEvent('input', { bubbles: true }));
      input().dispatchEvent(new Event('change', { bubbles: true }));

      expect(range.scale).toBe(1);
      expect(new FormData(form).has('scale')).toBe(false);
      expect(inputs).not.toHaveBeenCalled();
      expect(changes).not.toHaveBeenCalled();
      expect(viewport.scale).toBe(1);
    });

    it('enables input when a late commandfor target announces readiness', async () => {
      range.commandfor = 'later-viewport';
      await elementIsStable(range);
      expect(input().disabled).toBe(true);
      const later = document.createElement('nve-viewport');
      later.id = 'later-viewport';
      later.behaviorZoom = true;
      later.minScale = 0.25;
      later.maxScale = 4;
      fixture.append(later);
      await elementIsStable(later);
      await elementIsStable(range);
      expect(input().disabled).toBe(false);
      const command = vi.fn();
      later.addEventListener('command', command);
      input().focus();

      await userEvent.keyboard('{ArrowRight}');
      await elementIsStable(range);

      expect(command).toHaveBeenCalledOnce();
      expect(later.scale).toBeCloseTo(16 ** 0.01);
      expect(range.scale).toBe(later.scale);
      later.scale = 3;
      await elementIsStable(later);
      expect(range.scale).toBe(3);
    });

    it('rebinds input commands and state to a same-id replacement before the control updates', async () => {
      const replacement = document.createElement('nve-viewport');
      replacement.id = viewport.id;
      replacement.behaviorZoom = true;
      replacement.minScale = 1;
      replacement.maxScale = 9;
      fixture.append(replacement);
      await elementIsStable(replacement);
      const oldCommand = vi.fn();
      const newCommand = vi.fn();
      viewport.addEventListener('command', oldCommand);
      replacement.addEventListener('command', newCommand);
      viewport.replaceWith(replacement);

      input().valueAsNumber = 0.5;
      input().dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));

      expect(oldCommand).not.toHaveBeenCalled();
      expect(newCommand).toHaveBeenCalledOnce();
      expect(replacement.scale).toBeCloseTo(3);
      expect(range.min).toBe(1);
      expect(range.max).toBe(9);
      replacement.scale = 4;
      await elementIsStable(replacement);
      expect(range.scale).toBe(4);
    });

    it('ignores input during replacement readiness and then uses the replacement bounds', async () => {
      const replacement = document.createElement('nve-viewport');
      replacement.id = viewport.id;
      replacement.behaviorZoom = true;
      replacement.minScale = 1;
      replacement.maxScale = 9;
      range.step = 0.25;
      const command = vi.fn();
      const inputs = vi.fn();
      const changes = vi.fn();
      replacement.addEventListener('command', command);
      range.addEventListener('input', inputs);
      range.addEventListener('change', changes);
      viewport.replaceWith(replacement);
      expect(replacement.hasUpdated).toBe(false);

      input().valueAsNumber = 0.5;
      input().dispatchEvent(new InputEvent('input', { bubbles: true }));
      input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      input().dispatchEvent(new Event('change', { bubbles: true }));

      expect(command).not.toHaveBeenCalled();
      expect(inputs).not.toHaveBeenCalled();
      expect(changes).not.toHaveBeenCalled();
      expect(replacement.scale).toBe(1);
      await elementIsStable(replacement);
      await elementIsStable(range);
      expect(input().disabled).toBe(false);
      expect(range.min).toBe(1);
      expect(range.max).toBe(9);
      expect(range.scale).toBe(1);

      input().valueAsNumber = 0.5;
      input().dispatchEvent(new InputEvent('input', { bubbles: true }));
      expect(command).toHaveBeenCalledOnce();
      expect(replacement.scale).toBe(3);
      expect(range.scale).toBe(3);
    });

    it('does not send input commands to a removed id target', async () => {
      const command = vi.fn();
      viewport.addEventListener('command', command);
      viewport.remove();
      change(2);
      expect(command).not.toHaveBeenCalled();
      await elementIsStable(range);
      expect(input().disabled).toBe(true);
      expect(range.scale).toBe(1);
      expect(range.min).toBe(0.25);
      expect(range.max).toBe(4);
    });

    it('restores input commands on reconnection without duplicate listeners', async () => {
      const command = vi.fn();
      viewport.addEventListener('command', command);
      change(2);
      expect(command).toHaveBeenCalledOnce();

      range.remove();
      change(3);
      expect(command).toHaveBeenCalledOnce();
      fixture.append(range);
      change(3);

      expect(command).toHaveBeenCalledTimes(2);
      expect(viewport.scale).toBe(3);
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
    it('does not navigate while disabled', async () => {
      range.disabled = true;
      await elementIsStable(range);
      change(2);
      expect(viewport.scale).toBe(1);
    });

    it('does not navigate while readOnly', async () => {
      range.readOnly = true;
      await elementIsStable(range);
      change(2);
      expect(viewport.scale).toBe(1);
    });

    it('disables the slider when minimum and maximum scale are equal', async () => {
      viewport.minScale = 4;
      await elementIsStable(viewport);
      await elementIsStable(range);
      expect(input().disabled).toBe(true);
      expect(input().valueAsNumber).toBe(0);
      expect(range.scale).toBe(4);
    });

    it('rejects input immediately after viewport zoom is disabled', () => {
      viewport.behaviorZoom = false;
      change(2);
      expect(viewport.scale).toBe(1);
    });

    it('remains disabled after losing a viewport target that cannot zoom', async () => {
      viewport.behaviorZoom = false;
      await elementIsStable(viewport);
      await elementIsStable(range);
      expect(input().disabled).toBe(true);
      range.commandfor = 'missing-viewport';
      await elementIsStable(range);
      expect(input().disabled).toBe(true);
      change(2);
      expect(range.scale).toBe(1);
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
      await userEvent.keyboard('a');
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
