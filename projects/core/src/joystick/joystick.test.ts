// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Joystick, type JoystickInteractionEnd } from '@nvidia-elements/core/joystick';
import '@nvidia-elements/core/joystick/define.js';
import { I18nService } from '@nvidia-elements/foundations/i18n';

describe(Joystick.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Joystick;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<form><label for="stick">Movement</label><nve-joystick id="stick" name="movement"></nve-joystick></form>`
    );
    element = fixture.querySelector('nve-joystick');
    form = fixture.querySelector('form');
    await elementIsStable(element);
    vi.spyOn(element, 'setPointerCapture').mockImplementation(() => {});
    const travel = element.shadowRoot.querySelector<HTMLElement>('.travel');
    vi.spyOn(travel, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 10, 100, 100));
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  describe('accessible feedback', () => {
    const status = () => element.shadowRoot.querySelector('[role="status"]');
    const sendKey = (type: string, name = 'ArrowRight') =>
      element.dispatchEvent(new KeyboardEvent(type, { key: name, bubbles: true }));
    const advance = async (ms = 500) => {
      await vi.advanceTimersByTimeAsync(ms);
      await element.updateComplete;
    };

    afterEach(() => vi.useRealTimers());

    it('should describe coordinates, precision, absent values, and availability', async () => {
      element.constraint = 'square';
      element.value = { x: 0.000001, y: -0 };
      await elementIsStable(element);
      expect(element._internals.ariaDescription).toContain('X 0.000001, Y 0.');
      expect(element._internals.ariaDescription).toContain('Use arrow keys');
      element.readOnly = true;
      await elementIsStable(element);
      expect(element._internals.ariaDescription).toBe('X 0.000001, Y 0.');
      element.value = undefined;
      await elementIsStable(element);
      expect(element._internals.ariaDescription).toBe('No position.');
    });

    it.each(['horizontal', 'vertical'] as const)(
      'should describe both coordinates for the %s constraint',
      async constraint => {
        element.constraint = constraint;
        element.release = 'hold';
        await elementIsStable(element);
        element.value = constraint === 'horizontal' ? { x: 0.2, y: 0 } : { x: 0, y: 0.2 };
        await elementIsStable(element);
        expect(element._internals.ariaDescription).toContain(
          constraint === 'horizontal' ? 'X 0.2, Y 0.' : 'X 0, Y 0.2.'
        );
        expect(element._internals.ariaDescription).toContain('Release to keep');
      }
    );

    it('should merge global translations with instance templates and update pending wording', async () => {
      const original = I18nService.i18n.joystickPosition;
      try {
        I18nService.update({ joystickPosition: 'Global {x}, {y}.' });
        await elementIsStable(element);
        expect(element._internals.ariaDescription).toContain('Global 0, 0.');
        element.i18n = { joystickPosition: 'Local {x}, {x}, {y}.' };
        await elementIsStable(element);
        expect(element._internals.ariaDescription).toContain('Local 0, 0, 0.');
        element.focus();
        vi.useFakeTimers();
        sendKey('keydown');
        sendKey('keyup');
        element.i18n = { joystickReturnedToCenter: 'Released: {position}' };
        await element.updateComplete;
        await advance();
        expect(status().textContent).toBe('Released: Global 0.1, 0.');
      } finally {
        I18nService.update({ joystickPosition: original });
      }
    });

    it('should preserve a quick tap and its return without changing the name', async () => {
      element.focus();
      vi.useFakeTimers();
      sendKey('keydown');
      sendKey('keyup');
      await advance(499);
      expect(status().textContent).toBe('');
      await advance(1);
      expect(status().textContent).toBe('X 0.1, Y 0. Returned to center.');
      expect(element._internals.ariaDescription).toContain('X 0, Y 0.');
      expect(element._internals.ariaLabel).toBe('Movement');
      sendKey('keydown');
      sendKey('keyup');
      await advance();
      expect(status().textContent).toBe('X 0.1, Y 0. Returned to center.');
    });

    it('should coalesce movement, retain held values, and announce escape', async () => {
      element.release = 'hold';
      await elementIsStable(element);
      element.focus();
      vi.useFakeTimers();
      sendKey('keydown');
      await advance(250);
      sendKey('keydown');
      await advance(250);
      expect(status().textContent).toBe('X 0.2, Y 0.');
      sendKey('keyup');
      await advance();
      expect(element.value).toEqual({ x: 0.2, y: 0 });
      sendKey('keydown');
      sendKey('keydown', 'Escape');
      await advance();
      expect(status().textContent).toBe('X 0, Y 0.');
    });

    it('should keep unfocused and programmatic changes silent', async () => {
      vi.useFakeTimers();
      sendKey('keydown');
      sendKey('keyup');
      await advance();
      expect(status().textContent).toBe('');
      element.focus();
      sendKey('keydown');
      element.value = { x: 0.4, y: 0.2 };
      await advance();
      expect(status().textContent).toBe('');
      expect(element._internals.ariaDescription).toContain('X 0.4, Y 0.2.');
    });

    it.each(['blur', 'disabled', 'readonly', 'off', 'reset', 'configuration', 'disconnect', 'hidden'])(
      'should discard pending feedback on %s',
      async action => {
        element.focus();
        vi.useFakeTimers();
        sendKey('keydown');
        sendKey('keyup');
        if (action === 'blur') element.blur();
        if (action === 'disabled') element.disabled = true;
        if (action === 'readonly') element.readOnly = true;
        if (action === 'off') element.announce = 'off';
        if (action === 'reset') element.reset();
        if (action === 'configuration') element.keyboardStep = 0.2;
        if (action === 'disconnect') element.remove();
        if (action === 'hidden') {
          vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
          document.dispatchEvent(new Event('visibilitychange'));
        }
        await element.updateComplete;
        await advance();
        expect(status().textContent).toBe('');
      }
    );

    it('should announce focused pointer input outside the hidden visual subtree', async () => {
      element.release = 'hold';
      await elementIsStable(element);
      vi.useFakeTimers();
      element.dispatchEvent(pointer('pointerdown', 85, 60));
      await advance();
      expect(status().textContent).toBe('X 0.5, Y 0.');
      expect(status().closest('[aria-hidden="true"]')).toBeNull();
      element.dispatchEvent(pointer('pointerup', 85, 60));
    });

    it('should localize numbers and tolerate invalid document languages', async () => {
      const original = document.documentElement.lang;
      try {
        document.documentElement.lang = 'de';
        element.value = { x: 0.25, y: -0.5 };
        await elementIsStable(element);
        expect(element._internals.ariaDescription).toContain('X 0,25, Y -0,5.');
        document.documentElement.lang = 'invalid_locale';
        element.value = { x: 0, y: 0 };
        await elementIsStable(element);
        expect(element._internals.ariaDescription).toContain('X 0, Y 0.');
      } finally {
        document.documentElement.lang = original;
      }
    });

    it('should not replay muted feedback and should treat unknown announce values as polite', async () => {
      element.focus();
      vi.useFakeTimers();
      sendKey('keydown');
      sendKey('keyup');
      element.announce = 'off';
      await element.updateComplete;
      element.setAttribute('announce', 'unknown');
      await element.updateComplete;
      await advance();
      expect(status().textContent).toBe('');
      sendKey('keydown');
      sendKey('keyup');
      await advance();
      expect(status().textContent).toContain('Returned to center.');
      expect(status().getAttribute('aria-live')).toBe('polite');
    });

    it.each([false, true])(
      'should suppress stale feedback after a synchronous application write (same coordinates: %s)',
      async same => {
        element.focus();
        vi.useFakeTimers();
        element.addEventListener(
          'input',
          () => {
            element.value = same ? element.value : { x: 0.4, y: 0.2 };
          },
          { once: true }
        );
        sendKey('keydown');
        await advance();
        expect(status().textContent).toBe('');
      }
    );

    it('should retain the latest input when an input listener starts a nested adjustment', async () => {
      element.focus();
      vi.useFakeTimers();
      element.addEventListener('input', () => sendKey('keydown'), { once: true });
      sendKey('keydown');
      await advance();
      expect(status().textContent).toBe('X 0.2, Y 0.');
    });

    it('should preserve authored descriptions and support off without reflection', async () => {
      element.setAttribute('aria-description', 'Application help');
      element.setAttribute('aria-describedby', 'help');
      element.announce = 'off';
      await elementIsStable(element);
      expect(element.getAttribute('aria-description')).toBe('Application help');
      expect(element.getAttribute('aria-describedby')).toBe('help');
      expect(element.hasAttribute('announce')).toBe(false);
      expect(status().getAttribute('aria-live')).toBe('off');
      expect(element._internals.ariaDescription).toContain('X 0, Y 0.');
    });
  });

  it('should register and submit a neutral vector through its associated form', () => {
    expect(customElements.get('nve-joystick')).toBe(Joystick);
    expect(element.value).toEqual({ x: 0, y: 0 });
    expect(element.form).toBe(form);
    expect(Object.fromEntries(new FormData(form))).toEqual({ 'movement-x': '0', 'movement-y': '0' });
    expect(element.composedLabel).toBe('Movement');
  });

  it('should manage the default focus order across enabled-state updates', async () => {
    expect(element.tabIndex).toBe(0);
    element.disabled = true;
    await elementIsStable(element);
    expect(element.tabIndex).toBe(-1);
    element.disabled = false;
    await elementIsStable(element);
    expect(element.tabIndex).toBe(0);
  });

  it.each([-1, 0])('should preserve a declared tabindex of %s across updates and reconnection', async tabIndex => {
    const other = document.createElement('nve-joystick');
    other.setAttribute('tabindex', String(tabIndex));
    fixture.append(other);
    await elementIsStable(other);
    expect(other.tabIndex).toBe(tabIndex);
    other.value = { x: 0.2, y: 0.3 };
    other.disabled = true;
    await elementIsStable(other);
    expect(other.tabIndex).toBe(tabIndex);
    other.disabled = false;
    await elementIsStable(other);
    expect(other.tabIndex).toBe(tabIndex);
    other.remove();
    fixture.append(other);
    await elementIsStable(other);
    expect(other.tabIndex).toBe(tabIndex);
  });

  it.each(['property', 'attribute'])(
    'should preserve a caller tabindex set through the %s while disabled',
    async mode => {
      element.disabled = true;
      await elementIsStable(element);
      if (mode === 'property') element.tabIndex = -1;
      else element.setAttribute('tabindex', '-1');
      element.disabled = false;
      element.value = { x: 0.2, y: 0.3 };
      await elementIsStable(element);
      expect(element.tabIndex).toBe(-1);
      element.disabled = true;
      await elementIsStable(element);
      element.disabled = false;
      await elementIsStable(element);
      expect(element.tabIndex).toBe(-1);
    }
  );

  it.each(['disabled', 'readOnly'] as const)(
    'should restore the caller touch action when %s and override it only while available',
    async property => {
      const other = document.createElement('nve-joystick');
      other.style.setProperty('touch-action', 'pan-y', 'important');
      other[property] = true;
      fixture.append(other);
      await elementIsStable(other);
      expect(other.style.touchAction).toBe('pan-y');
      expect(other.style.getPropertyPriority('touch-action')).toBe('important');
      other[property] = false;
      await elementIsStable(other);
      expect(other.style.touchAction).toBe('none');
      other[property] = true;
      await elementIsStable(other);
      expect(other.style.touchAction).toBe('pan-y');
      expect(other.style.getPropertyPriority('touch-action')).toBe('important');
      other[property] = false;
      await elementIsStable(other);
      expect(other.style.touchAction).toBe('none');
    }
  );

  it('should update programmatic values without input events or attribute reflection', async () => {
    const listener = vi.fn();
    element.addEventListener('input', listener);
    element.value = { x: 0.2, y: -0.4 };
    await elementIsStable(element);
    expect(element.getAttribute('value')).toBeNull();
    expect(listener).not.toHaveBeenCalled();
    expect(new FormData(form).get('movement-y')).toBe('-0.4');
    expect(element.shadowRoot.querySelector<HTMLElement>('.thumb').style.left).toBe('60%');
  });

  it('should apply the opacity attribute to the background without fading the thumb or border', async () => {
    const surface = element.shadowRoot.querySelector<HTMLElement>('[internal-host]');
    const border = getComputedStyle(surface).border;
    expect(element.opacity).toBe(false);
    element.setAttribute('opacity', '');
    await elementIsStable(element);
    expect(element.opacity).toBe(true);
    expect(getComputedStyle(element.shadowRoot.querySelector('.background')).opacity).toBe('0.6');
    expect(getComputedStyle(element).opacity).toBe('1');
    expect(getComputedStyle(surface).opacity).toBe('1');
    expect(getComputedStyle(surface).border).toBe(border);
    expect(getComputedStyle(surface, '::before').opacity).toBe('1');
    expect(getComputedStyle(element.shadowRoot.querySelector('.thumb')).opacity).toBe('1');
  });

  it('should use the CSS opacity value only while the Boolean property is enabled', async () => {
    const background = element.shadowRoot.querySelector('.background');
    element.style.setProperty('--opacity', '0.35');
    expect(getComputedStyle(background).opacity).toBe('1');
    element.opacity = true;
    await elementIsStable(element);
    expect(element.hasAttribute('opacity')).toBe(true);
    expect(getComputedStyle(background).opacity).toBe('0.35');
    element.opacity = false;
    await elementIsStable(element);
    expect(element.hasAttribute('opacity')).toBe(false);
    expect(getComputedStyle(background).opacity).toBe('1');
  });

  it('should reject malformed and out-of-constraint values without replacing the current vector', () => {
    expect(() => {
      element.value = { x: NaN, y: 0 };
    }).toThrow(TypeError);
    expect(() => {
      element.value = { x: 1, y: 1 };
    }).toThrow(TypeError);
    expect(element.value).toEqual({ x: 0, y: 0 });
  });

  it('should expose the associated label as its accessible name', () => {
    expect(element._internals.ariaLabel).toBe('Movement');
  });

  it('should preserve an explicit accessible name when the value changes', async () => {
    element.ariaLabel = 'Recorded direction';
    element.value = { x: 0.2, y: -0.4 };
    await elementIsStable(element);
    expect(element.ariaLabel).toBe('Recorded direction');
    expect(element._internals.ariaLabel).toBe('Recorded direction');
  });

  it('should parse a square value regardless of attribute order', async () => {
    const container = document.createElement('div');
    container.innerHTML = '<nve-joystick value=\'{"x":1,"y":1}\' constraint="square"></nve-joystick>';
    fixture.append(container);
    const square = container.querySelector('nve-joystick');
    await elementIsStable(square);
    expect(square.value).toEqual({ x: 1, y: 1 });
  });

  it('should preserve the pointer direction beyond a circular boundary', () => {
    element.dispatchEvent(pointer('pointerdown', 160, 110));
    expect(element.value.x).toBeCloseTo(2 / Math.sqrt(5));
    expect(element.value.y).toBeCloseTo(1 / Math.sqrt(5));
    expect(element.matches(':state(active)')).toBe(true);
  });

  it.each(['square', 'horizontal', 'vertical'] as const)('should constrain pointer input to %s', async constraint => {
    element.constraint = constraint;
    await elementIsStable(element);
    element.dispatchEvent(pointer('pointerdown', 110, 110));
    expect(element.value).toEqual({ x: constraint === 'vertical' ? 0 : 1, y: constraint === 'horizontal' ? 0 : 1 });
  });

  it('should emit a final neutral input before change and the terminal event', () => {
    const order: string[] = [];
    for (const type of ['interaction-start', 'input', 'change', 'interaction-end']) {
      element.addEventListener(type, () => order.push(type));
    }
    element.dispatchEvent(pointer('pointerdown', 110, 60));
    element.dispatchEvent(pointer('pointerup', 110, 60));
    expect(element.value).toEqual({ x: 0, y: 0 });
    expect(order).toEqual(['interaction-start', 'input', 'input', 'change', 'interaction-end']);
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should preserve a held value after normal release', async () => {
    element.release = 'hold';
    await elementIsStable(element);
    element.dispatchEvent(pointer('pointerdown', 110, 60));
    element.dispatchEvent(pointer('pointerup', 110, 60));
    expect(element.value).toEqual({ x: 1, y: 0 });
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should set the active custom state at neutral and before lifecycle events without an attribute', () => {
    const states: boolean[] = [];
    element.addEventListener('interaction-start', () => states.push(element.matches(':state(active)')));
    element.addEventListener('interaction-end', () => states.push(element.matches(':state(active)')));
    expect(element.matches(':state(active)')).toBe(false);
    element.dispatchEvent(pointer('pointerdown', 60, 60));
    expect(element.value).toEqual({ x: 0, y: 0 });
    expect(element.matches(':state(active)')).toBe(true);
    expect(element.hasAttribute('active')).toBe(false);
    element.dispatchEvent(pointer('pointerup', 60, 60));
    expect(element.matches(':state(active)')).toBe(false);
    expect(states).toEqual([true, false]);
    element.value = undefined;
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should include the release position when the pointer moves between samples', async () => {
    element.release = 'hold';
    await elementIsStable(element);
    element.dispatchEvent(pointer('pointerdown', 110, 60));
    element.dispatchEvent(pointer('pointerup', 60, 10));
    expect(element.value).toEqual({ x: 0, y: -1 });
  });

  it.each(['pointercancel', 'lostpointercapture'] as const)(
    'should neutralize held input on %s exactly once',
    async type => {
      element.release = 'hold';
      await elementIsStable(element);
      const ended = vi.fn();
      const changed = vi.fn();
      element.addEventListener('interaction-end', ended);
      element.addEventListener('change', changed);
      element.dispatchEvent(pointer('pointerdown', 110, 60));
      element.dispatchEvent(pointer(type, 110, 60));
      element.dispatchEvent(pointer('pointerup', 110, 60));
      expect(element.value).toEqual({ x: 0, y: 0 });
      expect(ended).toHaveBeenCalledOnce();
      expect(element.matches(':state(active)')).toBe(false);
      expect(changed).not.toHaveBeenCalled();
    }
  );

  it('should ignore a second pointer and continue after the owning pointer releases', () => {
    element.dispatchEvent(pointer('pointerdown', 110, 60));
    element.dispatchEvent(pointer('pointerdown', 10, { clientY: 60, pointerId: 2 }));
    element.dispatchEvent(pointer('pointerup', 10, { clientY: 60, pointerId: 2 }));
    expect(element.value).toEqual({ x: 1, y: 0 });
    element.dispatchEvent(pointer('pointerup', 110, 60));
    element.dispatchEvent(pointer('pointerdown', 10, { clientY: 60, pointerId: 2 }));
    expect(element.value).toEqual({ x: -1, y: 0 });
  });

  it('should ignore secondary mouse buttons', () => {
    element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 2, pointerId: 1 }));
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should accept a non-primary touch pointer for a separate control', () => {
    element.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        pointerId: 2,
        isPrimary: false,
        pointerType: 'touch',
        button: 0,
        clientX: 110,
        clientY: 60
      })
    );
    expect(element.value).toEqual({ x: 1, y: 0 });
  });

  it('should use physical directions in rtl layouts', async () => {
    element.dir = 'rtl';
    await elementIsStable(element);
    element.dispatchEvent(pointer('pointerdown', 110, 60));
    expect(element.value.x).toBe(1);
  });

  it('should keep two touch controls active without transferring focus', async () => {
    const other = document.createElement('nve-joystick');
    fixture.append(other);
    await elementIsStable(other);
    vi.spyOn(other, 'setPointerCapture').mockImplementation(() => {});
    vi.spyOn(other.shadowRoot.querySelector('.travel'), 'getBoundingClientRect').mockReturnValue(
      new DOMRect(10, 10, 100, 100)
    );
    element.focus();
    const touch = (pointerId: number) =>
      new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        pointerId,
        pointerType: 'touch',
        button: 0,
        clientX: 110,
        clientY: 60
      });
    const first = touch(1);
    const second = touch(2);
    element.dispatchEvent(first);
    other.dispatchEvent(second);
    expect(first.defaultPrevented).toBe(true);
    expect(second.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(element);
    expect(element.value).toEqual({ x: 1, y: 0 });
    expect(other.value).toEqual({ x: 1, y: 0 });
    element.dispatchEvent(pointer('pointerup', 110, 60));
    expect(other.matches(':state(active)')).toBe(true);
    other.dispatchEvent(pointer('pointerup', 110, { clientY: 60, pointerId: 2 }));
    expect(other.value).toEqual({ x: 0, y: 0 });
  });

  it('should support diagonal keyboard input and wait for the final key release', () => {
    key('keydown', 'ArrowRight');
    key('keydown', 'ArrowUp');
    expect(element.value).toEqual({ x: 0.1, y: -0.1 });
    key('keyup', 'ArrowRight');
    expect(element.matches(':state(active)')).toBe(true);
    key('keyup', 'ArrowUp');
    expect(element.value).toEqual({ x: 0, y: 0 });
  });

  it('should use keyboard-step and ignore locked-axis keys', async () => {
    element.constraint = 'horizontal';
    element.keyboardStep = 0.25;
    await elementIsStable(element);
    key('keydown', 'ArrowUp');
    expect(element.matches(':state(active)')).toBe(false);
    key('keydown', 'ArrowRight');
    expect(element.value).toEqual({ x: 0.25, y: 0 });
  });

  it('should cancel keyboard input on escape without a change event', () => {
    const end = vi.fn();
    element.addEventListener('interaction-end', end);
    key('keydown', 'ArrowRight');
    key('keydown', 'Escape');
    expect(element.value).toEqual({ x: 0, y: 0 });
    expect(end.mock.calls[0][0].detail.reason).toBe('escape');
  });

  it.each(['disabled', 'readOnly'] as const)(
    'should cancel active input when %s and block future input',
    async property => {
      key('keydown', 'ArrowRight');
      element[property] = true;
      await elementIsStable(element);
      expect(element.value).toEqual({ x: 0, y: 0 });
      key('keydown', 'ArrowRight');
      element.dispatchEvent(pointer('pointerdown', 110, 60));
      expect(element.matches(':state(active)')).toBe(false);
    }
  );

  it.each(['pointer', 'keyboard'] as const)('should end %s input immediately when disabled', async source => {
    if (source === 'pointer') element.dispatchEvent(pointer('pointerdown', 110, 60));
    else key('keydown', 'ArrowRight');
    const order: string[] = [];
    element.addEventListener('input', () => {
      expect(element.value).toEqual({ x: 0, y: 0 });
      order.push('input');
    });
    element.addEventListener('interaction-end', (event: CustomEvent<JoystickInteractionEnd>) => {
      expect(event.detail.reason).toBe('disabled');
      order.push('interaction-end');
    });
    const change = vi.fn();
    element.addEventListener('change', change);
    element.disabled = true;
    expect(element.matches(':state(active)')).toBe(false);
    expect(element.value).toEqual({ x: 0, y: 0 });
    expect(order).toEqual(['input', 'interaction-end']);
    element.disabled = false;
    element.dispatchEvent(pointer('pointerup', 110, 60));
    key('keyup', 'ArrowRight');
    await elementIsStable(element);
    expect(element.matches(':state(active)')).toBe(false);
    expect(order).toEqual(['input', 'interaction-end']);
    expect(change).not.toHaveBeenCalled();
  });

  it('should allow read-only replay without events and omit disabled values from submission', async () => {
    const input = vi.fn();
    element.addEventListener('input', input);
    element.readOnly = true;
    element.value = { x: 0.2, y: 0.3 };
    await elementIsStable(element);
    expect(new FormData(form).get('movement-x')).toBe('0.2');
    expect(input).not.toHaveBeenCalled();
    element.disabled = true;
    await elementIsStable(element);
    expect([...new FormData(form)]).toEqual([]);
  });

  it.each(['pointer', 'keyboard'] as const)(
    'should finish %s input before accepting read-only replay',
    async source => {
      if (source === 'pointer') element.dispatchEvent(pointer('pointerdown', 110, 60));
      else key('keydown', 'ArrowRight');
      const order: string[] = [];
      element.addEventListener('input', () => {
        expect(element.value).toEqual({ x: 0, y: 0 });
        order.push('input');
      });
      element.addEventListener('interaction-end', (event: CustomEvent<JoystickInteractionEnd>) => {
        expect(event.detail.reason).toBe('readonly');
        order.push('interaction-end');
      });
      const change = vi.fn();
      element.addEventListener('change', change);
      element.readOnly = true;
      expect(element.matches(':state(active)')).toBe(false);
      expect(order).toEqual(['input', 'interaction-end']);
      element.value = { x: 0.2, y: 0.3 };
      element.dispatchEvent(pointer('pointerup', 110, 60));
      key('keyup', 'ArrowRight');
      await elementIsStable(element);
      expect(element.value).toEqual({ x: 0.2, y: 0.3 });
      expect(new FormData(form).get('movement-x')).toBe('0.2');
      expect(order).toEqual(['input', 'interaction-end']);
      expect(change).not.toHaveBeenCalled();
    }
  );

  it('should restore the declared form value without input or change events', async () => {
    element.setAttribute('value', '{"x":0.2,"y":-0.3}');
    await elementIsStable(element);
    key('keydown', 'ArrowRight');
    const input = vi.fn();
    const change = vi.fn();
    element.addEventListener('input', input);
    element.addEventListener('change', change);
    form.reset();
    expect(element.value).toEqual({ x: 0.2, y: -0.3 });
    expect(element.matches(':state(active)')).toBe(false);
    expect(input).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
  });

  it('should restore JSON state silently and ignore invalid saved state', () => {
    const input = vi.fn();
    element.addEventListener('input', input);
    element.formStateRestoreCallback('{"x":0.3,"y":-0.2}', 'restore');
    expect(element.value).toEqual({ x: 0.3, y: -0.2 });
    element.formStateRestoreCallback('{broken', 'restore');
    element.formStateRestoreCallback('{"x":9,"y":0}', 'restore');
    expect(element.value).toEqual({ x: 0.3, y: -0.2 });
    expect(input).not.toHaveBeenCalled();
  });

  it.each(['circle', 'horizontal', 'vertical'] as const)(
    'should project the declared default into %s on direct and form reset',
    async constraint => {
      element.constraint = 'square';
      await elementIsStable(element);
      element.setAttribute('value', '{"x":1,"y":1}');
      element.constraint = constraint;
      await elementIsStable(element);
      const input = vi.fn();
      const change = vi.fn();
      const reset = vi.fn(() => {
        expect(() => {
          element.value = { x: 1, y: 1 };
        }).toThrow(TypeError);
      });
      element.addEventListener('input', input);
      element.addEventListener('change', change);
      element.addEventListener('reset', reset);
      const expected = {
        x: constraint === 'vertical' ? 0 : constraint === 'circle' ? Math.SQRT1_2 : 1,
        y: constraint === 'horizontal' ? 0 : constraint === 'circle' ? Math.SQRT1_2 : 1
      };
      element.value = { x: 0, y: 0 };
      element.reset();
      await elementIsStable(element);
      expect(element.value.x).toBeCloseTo(expected.x);
      expect(element.value.y).toBeCloseTo(expected.y);
      element.value = { x: 0, y: 0 };
      form.reset();
      await elementIsStable(element);
      expect(element.value.x).toBeCloseTo(expected.x);
      expect(element.value.y).toBeCloseTo(expected.y);
      expect(Number(new FormData(form).get('movement-x'))).toBeCloseTo(expected.x);
      expect(element.defaultValue).toBe('{"x":1,"y":1}');
      expect(reset).toHaveBeenCalledTimes(2);
      expect(input).not.toHaveBeenCalled();
      expect(change).not.toHaveBeenCalled();
    }
  );

  it('should distinguish missing samples from neutral values', async () => {
    element.required = true;
    expect(element.checkValidity()).toBe(true);
    element.value = undefined;
    await elementIsStable(element);
    expect(element.validity.valueMissing).toBe(true);
    expect(element.shadowRoot.querySelector<HTMLElement>('.thumb').hidden).toBe(true);
    expect([...new FormData(form)]).toEqual([]);
  });

  it('should clear input on blur and disconnect without a stale terminal event', () => {
    const reasons: JoystickInteractionEnd['reason'][] = [];
    element.addEventListener('interaction-end', (event: CustomEvent<JoystickInteractionEnd>) =>
      reasons.push(event.detail.reason)
    );
    key('keydown', 'ArrowRight');
    element.dispatchEvent(new Event('blur'));
    key('keyup', 'ArrowRight');
    key('keydown', 'ArrowRight');
    element.remove();
    expect(element.value).toEqual({ x: 0, y: 0 });
    expect(reasons).toEqual(['blur', 'disconnect']);
  });

  it('should stop on page hiding and ignore subsequent stale movement', () => {
    const ended = vi.fn();
    element.addEventListener('interaction-end', ended);
    element.dispatchEvent(pointer('pointerdown', 110, 60));
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    element.dispatchEvent(pointer('pointermove', 10, 60));
    expect(element.value).toEqual({ x: 0, y: 0 });
    expect(ended.mock.calls[0][0].detail.reason).toBe('hidden');
  });

  it('should accept a new pointer interaction after disconnecting during a drag', async () => {
    vi.spyOn(element, 'focus').mockImplementation(() => {});
    const ended = vi.fn();
    element.addEventListener('interaction-end', ended);
    element.dispatchEvent(pointer('pointerdown', 110, 60));
    element.remove();
    expect(element.value).toEqual({ x: 0, y: 0 });
    expect(ended.mock.calls[0][0].detail.reason).toBe('disconnect');
    form.append(element);
    await elementIsStable(element);
    element.dispatchEvent(pointer('pointermove', 10, 60));
    element.dispatchEvent(pointer('pointerup', 10, 60));
    expect(element.matches(':state(active)')).toBe(false);
    element.dispatchEvent(pointer('pointerdown', 10, { clientY: 60, pointerId: 2 }));
    expect(element.value).toEqual({ x: -1, y: 0 });
    expect(element.matches(':state(active)')).toBe(true);
    element.dispatchEvent(pointer('pointerup', 10, { clientY: 60, pointerId: 2 }));
    expect(element.value).toEqual({ x: 0, y: 0 });
    expect(ended).toHaveBeenCalledTimes(2);
    expect(ended.mock.calls[1][0].detail.reason).toBe('release');
  });

  it('should cancel before accepting input if a start listener disables the control', () => {
    element.addEventListener('interaction-start', () => {
      element.disabled = true;
    });
    element.dispatchEvent(pointer('pointerdown', 110, 60));
    expect(element.value).toEqual({ x: 0, y: 0 });
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should project a value silently when its movement constraint changes', async () => {
    element.constraint = 'square';
    await elementIsStable(element);
    element.value = { x: 1, y: 1 };
    const listener = vi.fn();
    element.addEventListener('input', listener);
    element.constraint = 'circle';
    await elementIsStable(element);
    expect(element.value.x).toBeCloseTo(Math.SQRT1_2);
    expect(element.value.y).toBeCloseTo(Math.SQRT1_2);
    expect(listener).not.toHaveBeenCalled();
  });

  function key(type: string, keyValue: string) {
    element.dispatchEvent(new KeyboardEvent(type, { key: keyValue, bubbles: true, cancelable: true }));
  }
});

function pointer(type: string, clientX: number, position: number | { clientY: number; pointerId: number }) {
  const { clientY, pointerId } = typeof position === 'number' ? { clientY: position, pointerId: 1 } : position;
  return new PointerEvent(type, {
    clientX,
    clientY,
    pointerId,
    button: 0,
    buttons: 1,
    bubbles: true,
    cancelable: true
  });
}
