// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture } from '@internals/testing';
import { DragHandle } from '@nvidia-elements/core/drag-handle';
import '@nvidia-elements/core/drag-handle/define.js';

describe(DragHandle.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: DragHandle;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-drag-handle aria-label="Move item"></nve-drag-handle>`);
    element = fixture.querySelector('nve-drag-handle');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should register a focusable toggle button that does not submit by default', () => {
    expect(customElements.get(DragHandle.metadata.tag)).toBe(DragHandle);
    expect(element.type).toBe('button');
    expect(element.pressed).toBe(false);
    expect(element._internals.role).toBe('button');
    expect(element._internals.ariaPressed).toBe('false');
    expect(element.tabIndex).toBe(0);
  });

  it('should render a fixed decorative grip without slots or icon configuration', async () => {
    const icon = element.shadowRoot.querySelector('nve-icon');
    await elementIsStable(icon);
    expect(icon.name).toBe('drag');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.getAttribute('part')).toBe('icon');
    expect(element.shadowRoot.querySelector('slot')).toBeNull();
    expect('iconName' in element).toBe(false);
    expect('direction' in element).toBe(false);
  });

  it.each(['Space', 'Unidentified'])(
    'should toggle pressed and prevent scrolling when Space has code %s',
    async code => {
      const click = vi.fn();
      element.addEventListener('click', click);
      const keydown = space({ code });
      element.dispatchEvent(keydown);
      await elementIsStable(element);
      expect(keydown.defaultPrevented).toBe(true);
      expect(element.pressed).toBe(false);
      expect(click).not.toHaveBeenCalled();

      element.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code, bubbles: true }));
      await elementIsStable(element);
      expect(click).toHaveBeenCalledTimes(1);
      expect(element.pressed).toBe(true);
      expect(element.hasAttribute('pressed')).toBe(true);
      expect(element._internals.ariaPressed).toBe('true');

      element.dispatchEvent(space({ code }));
      await elementIsStable(element);
      expect(element.pressed).toBe(true);

      element.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code, bubbles: true }));
      await elementIsStable(element);
      expect(click).toHaveBeenCalledTimes(2);
      expect(element.pressed).toBe(false);
      expect(element.hasAttribute('pressed')).toBe(false);
      expect(element._internals.ariaPressed).toBe('false');
    }
  );

  it('should ignore repeated Space keydown events while preventing scrolling', async () => {
    element.dispatchEvent(space());
    const repeated = space({ repeat: true });
    element.dispatchEvent(repeated);
    await elementIsStable(element);
    expect(element.pressed).toBe(false);
    expect(repeated.defaultPrevented).toBe(true);
    element.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true }));
    await elementIsStable(element);
    expect(element.pressed).toBe(true);
  });

  it('should leave pressed unchanged when Space is canceled', async () => {
    const keydown = space();
    keydown.preventDefault();
    element.dispatchEvent(keydown);
    await elementIsStable(element);
    expect(element.pressed).toBe(false);
  });

  it.each(['disabled', 'readOnly'] as const)('should ignore keyboard activation when %s', async state => {
    element[state] = true;
    await elementIsStable(element);
    const click = vi.fn();
    element.addEventListener('click', click);
    element.dispatchEvent(space());
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));
    await elementIsStable(element);
    expect(element.pressed).toBe(false);
    expect(element.tabIndex).toBe(-1);
    expect(click).not.toHaveBeenCalled();
  });

  it('should restore the supplied tabindex after disabling and enabling', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`<nve-drag-handle tabindex="-1" aria-label="Move item"></nve-drag-handle>`);
    element = fixture.querySelector('nve-drag-handle');
    element.disabled = true;
    await elementIsStable(element);
    expect(element._internals.ariaDisabled).toBe('true');
    expect(element.matches(':state(disabled)')).toBe(true);
    element.disabled = false;
    await elementIsStable(element);
    expect(element.tabIndex).toBe(-1);
    expect(element._internals.ariaDisabled).toBe('false');
  });

  it('should dispatch one click and toggle once after Space', async () => {
    const click = vi.fn();
    element.addEventListener('click', click);
    element.dispatchEvent(space());
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));
    await elementIsStable(element);
    expect(click).toHaveBeenCalledTimes(1);
    expect(element.pressed).toBe(true);
  });

  it.each(['Enter', 'Unidentified'])('should toggle pressed once per Enter activation with code %s', async code => {
    const click = vi.fn();
    element.addEventListener('click', click);
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code, bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code, bubbles: true }));
    await elementIsStable(element);
    expect(click).toHaveBeenCalledTimes(1);
    expect(element.pressed).toBe(true);
    expect(element._internals.ariaPressed).toBe('true');

    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code, bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code, bubbles: true }));
    await elementIsStable(element);
    expect(click).toHaveBeenCalledTimes(2);
    expect(element.pressed).toBe(false);
    expect(element._internals.ariaPressed).toBe('false');
  });

  it('should forward arrow keys for application-defined movement', () => {
    const keydown = new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true, cancelable: true });
    const listener = vi.fn();
    fixture.addEventListener('keydown', listener);
    element.dispatchEvent(keydown);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(keydown.defaultPrevented).toBe(false);
    expect(element.pressed).toBe(false);
  });

  it('should forward pointer input and toggle pressed only on click', async () => {
    const pointerdown = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1 });
    const listener = vi.fn();
    fixture.addEventListener('pointerdown', listener);
    element.dispatchEvent(pointerdown);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(pointerdown.defaultPrevented).toBe(false);
    expect(element.draggable).toBe(true);
    expect(element.pressed).toBe(false);
    emulateClick(element);
    await elementIsStable(element);
    expect(element.pressed).toBe(true);
    expect(element._internals.ariaPressed).toBe('true');
    emulateClick(element);
    await elementIsStable(element);
    expect(element.pressed).toBe(false);
    expect(element._internals.ariaPressed).toBe('false');
  });

  it('should toggle pressed from click activation without keyboard or pointer events', async () => {
    element.click();
    await elementIsStable(element);
    expect(element.pressed).toBe(true);
    expect(element._internals.ariaPressed).toBe('true');
    expect(element.getAttribute('aria-label')).toBe('Move item');
    element.click();
    await elementIsStable(element);
    expect(element.pressed).toBe(false);
    expect(element._internals.ariaPressed).toBe('false');
    expect(element.getAttribute('aria-label')).toBe('Move item');
  });

  it('should leave pressed unchanged when click activation is canceled', async () => {
    element.addEventListener('click', event => event.preventDefault(), { capture: true });
    element.click();
    await elementIsStable(element);
    expect(element.pressed).toBe(false);
  });

  it.each(['disabled', 'readOnly'] as const)('should ignore click activation when %s', async state => {
    element[state] = true;
    await elementIsStable(element);
    element.click();
    await elementIsStable(element);
    expect(element.pressed).toBe(false);
  });

  it('should forward native drag events and preserve application drag data', () => {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', 'item-1');
    const dragstart = new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer });
    const listener = vi.fn();
    fixture.addEventListener('dragstart', listener);
    element.dispatchEvent(dragstart);
    expect(listener).toHaveBeenCalledWith(dragstart);
    expect(dragstart.defaultPrevented).toBe(false);
    expect(dataTransfer.getData('text/plain')).toBe('item-1');
    expect(element.pressed).toBe(false);
  });

  it.each(['disabled', 'readOnly'] as const)('should cancel native dragging when %s', async state => {
    element[state] = true;
    await elementIsStable(element);
    const dragstart = new DragEvent('dragstart', { bubbles: true, cancelable: true });
    expect(element.dispatchEvent(dragstart)).toBe(false);
    expect(dragstart.defaultPrevented).toBe(true);
    expect(element.pressed).toBe(false);
  });

  it('should preserve an explicit native dragging opt-out across reconnection', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`<nve-drag-handle draggable="false" aria-label="Move item"></nve-drag-handle>`);
    element = fixture.querySelector('nve-drag-handle');
    await elementIsStable(element);
    expect(element.draggable).toBe(false);
    element.remove();
    fixture.append(element);
    await elementIsStable(element);
    expect(element.draggable).toBe(false);
  });

  it('should clear pointer active state when dragging ends without changing pressed', async () => {
    element.pressed = true;
    await elementIsStable(element);
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(element.matches(':state(active)')).toBe(true);
    element.dispatchEvent(new DragEvent('dragend', { bubbles: true }));
    expect(element.matches(':state(active)')).toBe(false);
    expect(element.pressed).toBe(true);
  });

  it('should reflect application-controlled pressed state without dispatching clicks', async () => {
    const click = vi.fn();
    element.addEventListener('click', click);
    element.pressed = true;
    await elementIsStable(element);
    expect(element.hasAttribute('pressed')).toBe(true);
    expect(element._internals.ariaPressed).toBe('true');
    expect(click).not.toHaveBeenCalled();
  });

  it('should preserve authored pressed state and button type', async () => {
    removeFixture(fixture);
    fixture = await createFixture(
      html`<nve-drag-handle pressed type="reset" aria-label="Move item"></nve-drag-handle>`
    );
    element = fixture.querySelector('nve-drag-handle');
    await elementIsStable(element);
    expect(element.pressed).toBe(true);
    expect(element.type).toBe('reset');
  });

  it('should preserve state across reconnection without duplicating activation handlers', async () => {
    element.pressed = true;
    await elementIsStable(element);
    element.remove();
    fixture.append(element);
    await elementIsStable(element);
    expect(element.pressed).toBe(true);
    element.dispatchEvent(space());
    element.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true }));
    await elementIsStable(element);
    expect(element.pressed).toBe(false);
  });

  it('should remove activation and Space handlers while disconnected', async () => {
    element.remove();
    const keydown = space();
    element.dispatchEvent(keydown);
    element.click();
    await elementIsStable(element);
    expect(keydown.defaultPrevented).toBe(false);
    expect(element.pressed).toBe(false);
  });

  it.each(['pressed', 'expanded'] as const)('should request the solid icon appearance when %s', async state => {
    element[state] = true;
    await elementIsStable(element);
    const icon = element.shadowRoot.querySelector('nve-icon');
    await elementIsStable(icon);
    expect(icon.name).toBe('drag');
    expect(icon.appearance).toBe('solid');
    await vi.waitFor(() => expect(icon.shadowRoot.querySelector('svg')).not.toBeNull());
  });
});

function space(options: KeyboardEventInit = {}) {
  return new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true, cancelable: true, ...options });
}
