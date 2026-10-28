// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { I18nService } from '@nvidia-elements/core/internal';
import { ProgressDot } from '@nvidia-elements/core/progress-dot';
import reducedMotionStyles from '@nvidia-elements/themes/reduced-motion.css?inline';
import '@nvidia-elements/core/progress-dot/define.js';

describe(ProgressDot.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ProgressDot;
  let loadingLabel: string;
  let themeStyles: HTMLStyleElement;

  beforeEach(async () => {
    themeStyles = document.createElement('style');
    themeStyles.textContent = reducedMotionStyles;
    document.head.append(themeStyles);
    fixture = await createFixture(html`<nve-progress-dot></nve-progress-dot>`);
    element = fixture.querySelector('nve-progress-dot');
    await elementIsStable(element);
    loadingLabel = I18nService.i18n.loading;
  });

  afterEach(() => {
    removeFixture(fixture);
    themeStyles.remove();
    I18nService.update({ loading: loadingLabel });
  });

  it('should register an indeterminate progress indicator with a default label', () => {
    expect(customElements.get(ProgressDot.metadata.tag)).toBe(ProgressDot);
    expect(element.size).toBe('md');
    expect(element.getAttribute('size')).toBe('md');
    expect(element._internals.role).toBe('progressbar');
    expect(element._internals.ariaLabel).toBe(loadingLabel);
    expect(element._internals.ariaValueNow).toBeNull();
    expect(element.hasAttribute('aria-valuenow')).toBe(false);
    expect(element.hasAttribute('tabindex')).toBe(false);
    expect(element.shadowRoot.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
    expect(element.shadowRoot.querySelectorAll('circle')).toHaveLength(3);
  });

  it.each([
    ['sm', 16],
    ['md', 20],
    ['lg', 24]
  ] as const)('should reflect and render the %s size', async (size, dimension) => {
    element.size = size;
    await elementIsStable(element);

    expect(element.getAttribute('size')).toBe(size);
    expect(element.getBoundingClientRect().width).toBe(dimension);
    expect(element.getBoundingClientRect().height).toBe(dimension);

    element.setAttribute('size', 'sm');
    await elementIsStable(element);
    expect(element.size).toBe('sm');
  });

  it('should inherit surrounding text color', () => {
    fixture.style.color = 'rgb(12, 34, 56)';
    expect(getComputedStyle(element.shadowRoot.querySelector('svg')).fill).toBe('rgb(12, 34, 56)');
  });

  it('should allow CSS overrides across sizes', async () => {
    element.style.cssText = '--width: 60px; --height: 40px; --color: rgb(56, 34, 12)';
    element.size = 'lg';
    await elementIsStable(element);

    expect(element.getBoundingClientRect().width).toBe(60);
    expect(element.getBoundingClientRect().height).toBe(40);
    expect(getComputedStyle(element.shadowRoot.querySelector('svg')).fill).toBe('rgb(56, 34, 12)');
  });

  it.each([
    ['1.2s', ['0s', '0.16s', '0.32s']],
    ['2.4s', ['0s', '0.32s', '0.64s']]
  ] as const)('should scale animation delays with a %s cycle', (duration, delays) => {
    element.style.setProperty('--animation-duration', duration);
    const dots = [...element.shadowRoot.querySelectorAll('circle')];
    expect(dots.map(dot => getComputedStyle(dot).animationDuration)).toEqual([duration, duration, duration]);
    expect(dots.map(dot => getComputedStyle(dot).animationDelay)).toEqual(delays);
  });

  it('should brighten and grow each dot before resting for the end of the cycle', () => {
    // Loading a theme registers its availability without selecting that theme.
    expect(getComputedStyle(element).getPropertyValue('--nve-config-reduced-motion')).toBe('true');
    const dot = element.shadowRoot.querySelector('circle');
    const animations = dot.getAnimations();
    expect(animations).toHaveLength(1);
    const animation = animations[0];
    expect(animation.playState).toBe('running');
    const duration = Number(animation.effect.getComputedTiming().duration);
    expect(duration).toBeGreaterThan(0);
    animation.pause();
    animation.currentTime = 0;
    expect(Number(getComputedStyle(dot).opacity)).toBeCloseTo(0.3);
    expect(new DOMMatrix(getComputedStyle(dot).transform).a).toBeCloseTo(0.7);
    const restingBounds = dot.getBoundingClientRect();

    animation.currentTime = duration * 0.3;
    expect(getComputedStyle(dot).opacity).toBe('1');
    expect(new DOMMatrix(getComputedStyle(dot).transform).a).toBeCloseTo(1);
    const peakBounds = dot.getBoundingClientRect();
    expect(peakBounds.x + peakBounds.width / 2).toBeCloseTo(restingBounds.x + restingBounds.width / 2);
    expect(peakBounds.y + peakBounds.height / 2).toBeCloseTo(restingBounds.y + restingBounds.height / 2);

    for (const progress of [0.6, 0.8, 1]) {
      animation.currentTime = duration * progress;
      expect(Number(getComputedStyle(dot).opacity)).toBeCloseTo(0.3);
      expect(new DOMMatrix(getComputedStyle(dot).transform).a).toBeCloseTo(0.7);
    }
  });

  it('should show static visible dots when the duration is zero', () => {
    element.style.setProperty('--animation-duration', '0s');
    for (const dot of element.shadowRoot.querySelectorAll('circle')) {
      expect(getComputedStyle(dot).animationDuration).toBe('0s');
      expect(getComputedStyle(dot).opacity).toBe('1');
      expect(getComputedStyle(dot).transform).toBe('none');
    }
  });

  it('should stop animation for the reduced-motion theme', () => {
    fixture.setAttribute('nve-theme', 'reduced-motion');
    element.style.setProperty('--animation-duration', '2s');
    for (const dot of element.shadowRoot.querySelectorAll('circle')) {
      expect(getComputedStyle(dot).animationName).toBe('none');
      expect(getComputedStyle(dot).opacity).toBe('1');
      expect(getComputedStyle(dot).transform).toBe('none');
    }

    fixture.removeAttribute('nve-theme');
    for (const dot of element.shadowRoot.querySelectorAll('circle')) {
      expect(getComputedStyle(dot).animationName).toBe('breathe');
      expect(getComputedStyle(dot).animationDuration).toBe('2s');
    }
  });

  it('should honor native hidden without changing loading semantics', () => {
    element.hidden = true;
    expect(getComputedStyle(element).display).toBe('none');
    element.hidden = false;
    expect(getComputedStyle(element).display).toBe('inline-flex');
    expect(element._internals.role).toBe('progressbar');
  });

  it('should update the fallback label from global translations', async () => {
    I18nService.update({ loading: 'chargement' });
    await elementIsStable(element);
    expect(element._internals.ariaLabel).toBe('chargement');
  });

  it('should preserve instance translations across global updates', async () => {
    element.i18n = { loading: 'Generating response' };
    await elementIsStable(element);
    I18nService.update({ loading: 'chargement' });
    await elementIsStable(element);

    expect(element._internals.ariaLabel).toBe('Generating response');
    expect(element.hasAttribute('i18n')).toBe(false);
  });

  it('should preserve author labels when translations change', async () => {
    element.setAttribute('aria-label', 'Loading results');
    element.setAttribute('aria-labelledby', 'results-label');
    element.i18n = { loading: 'chargement' };
    await elementIsStable(element);

    expect(element.getAttribute('aria-label')).toBe('Loading results');
    expect(element.getAttribute('aria-labelledby')).toBe('results-label');
    expect(element._internals.ariaLabel).toBe('chargement');
  });
});
