// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { DraggableList, type DraggableDropDetail } from '@nvidia-elements/foundations/draggable-list';
import { I18nService } from '@nvidia-elements/foundations/internal/i18n';
import '@nvidia-elements/foundations/draggable-list/define.js';

function key(element: HTMLElement, value: string, options: KeyboardEventInit = {}) {
  const init = {
    key: value,
    code: value === ' ' ? 'Space' : value,
    bubbles: true,
    composed: true,
    cancelable: true,
    ...options
  };
  const down = new KeyboardEvent('keydown', init);
  element.dispatchEvent(down);
  element.dispatchEvent(new KeyboardEvent('keyup', init));
  return down;
}

function drag(
  element: HTMLElement,
  type: string,
  { portion = 0.25, dataTransfer = new DataTransfer() }: { portion?: number; dataTransfer?: DataTransfer } = {}
) {
  const rect = element.getBoundingClientRect();
  const event = new DragEvent(type, {
    dataTransfer,
    clientY: rect.top + rect.height * portion,
    clientX: rect.left + rect.width * portion,
    bubbles: true,
    composed: true,
    cancelable: true
  });
  element.dispatchEvent(event);
  return event;
}

describe(DraggableList.metadata.tag, () => {
  let fixture: HTMLElement;
  let list: DraggableList;
  let other: DraggableList;
  let items: HTMLButtonElement[];
  let drop: ReturnType<typeof vi.fn<(event: CustomEvent<DraggableDropDetail>) => void>>;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <section>
        <nve-draggable-list>
          <button>A</button><button>B</button><button>C</button>
          <button nve-draggable="dropzone">Append</button>
        </nve-draggable-list>
        <nve-draggable-list>
          <button>D</button><button nve-draggable="dropzone">Append elsewhere</button>
        </nve-draggable-list>
      </section>
    `);
    [list, other] = Array.from(fixture.querySelectorAll('nve-draggable-list'));
    items = Array.from(list.querySelectorAll('button'));
    await elementIsStable(list);
    await elementIsStable(other);
    drop = vi.fn();
    fixture.addEventListener('draggable-drop', drop);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('defines the list without changing item semantics or adding tab stops', () => {
    expect(customElements.get('nve-draggable-list')).toBe(DraggableList);
    expect(list.hasAttribute('role')).toBe(false);
    expect(list.hasAttribute('tabindex')).toBe(false);
    expect(items[0].hasAttribute('tabindex')).toBe(false);
    expect(items[0].draggable).toBe(true);
    expect(items[3].draggable).toBe(false);
  });

  it.each([0.25, 0.75])('requests pointer placement at target fraction %s without moving items', fraction => {
    const transfer = new DataTransfer();
    drag(items[0], 'dragstart', { dataTransfer: transfer });
    expect(transfer.getData('application/x-nve-draggable')).toBe('move');
    expect(drag(items[2], 'dragover', { portion: fraction, dataTransfer: transfer }).defaultPrevented).toBe(true);
    drag(items[2], 'drop', { portion: fraction, dataTransfer: transfer });
    expect(drop).toHaveBeenCalledTimes(1);
    const event = drop.mock.calls[0][0];
    expect(event.detail).toEqual({
      source: items[0],
      target: items[2],
      sourceContainer: list,
      targetContainer: list,
      sourceIndex: 0,
      targetIndex: fraction < 0.5 ? 1 : 2,
      placement: fraction < 0.5 ? 'before' : 'after',
      interaction: 'pointer'
    });
    expect(event.bubbles && event.composed && Object.isFrozen(event.detail)).toBe(true);
    expect(list.firstElementChild).toBe(items[0]);
    expect(items[0].hasAttribute('nve-draggable')).toBe(false);
    expect(items[2].hasAttribute('nve-draggable')).toBe(false);
  });

  it.each([
    { orientation: 'vertical', direction: 'ltr', trailing: 0.75, leading: 0.25 },
    { orientation: 'horizontal', direction: 'ltr', trailing: 0.75, leading: 0.25 },
    { orientation: 'horizontal', direction: 'rtl', trailing: 0.25, leading: 0.75 }
  ] as const)(
    'keeps one indicator for a $orientation $direction insertion position across adjacent items',
    async ({ orientation, direction, trailing, leading }) => {
      list.orientation = orientation;
      list.dir = direction;
      list.style.display = 'flex';
      list.style.flexDirection = orientation === 'vertical' ? 'column' : 'row';
      list.style.gap = '12px';
      await elementIsStable(list);

      const [source, previous, next] = items;
      const dataTransfer = new DataTransfer();
      drag(source, 'dragstart', { dataTransfer });
      drag(previous, 'dragover', { portion: trailing, dataTransfer });
      expect(Array.from(list.querySelectorAll('[nve-draggable~="target"]'))).toEqual([next]);
      expect(next.getAttribute('nve-draggable')).toContain('before');

      drag(next, 'dragover', { portion: leading, dataTransfer });
      expect(Array.from(list.querySelectorAll('[nve-draggable~="target"]'))).toEqual([next]);
      expect(next.getAttribute('nve-draggable')).toContain('before');

      drag(previous, 'drop', { portion: trailing, dataTransfer });
      expect(drop).toHaveBeenCalledTimes(1);
      expect(drop.mock.calls[0][0].detail).toMatchObject({ target: previous, placement: 'after', targetIndex: 1 });
      expect(list.querySelector('[nve-draggable~="target"]')).toBeNull();
    }
  );

  it('shares native sessions across lists and retains a valid source after DOM transfer', async () => {
    const destination = other.querySelector('button')!;
    fixture.addEventListener('draggable-drop', (event: CustomEvent<DraggableDropDetail>) => {
      const { source, target, placement } = event.detail;
      target.insertAdjacentElement(placement === 'after' ? 'afterend' : 'beforebegin', source);
    });
    const end = vi.fn();
    list.addEventListener('draggable-end', end);
    drag(items[0], 'dragstart');
    drag(destination, 'drop');
    expect(other.firstElementChild).toBe(items[0]);
    expect(end).toHaveBeenCalledTimes(1);
    expect(end.mock.calls[0][0].detail.dropped).toBe(true);
    await elementIsStable(other);
    drag(items[0], 'dragstart');
    drag(items[2], 'drop');
    expect(drop).toHaveBeenCalledTimes(2);
    expect(drop.mock.calls[1][0].detail.sourceContainer).toBe(other);
  });

  it('appends to empty lists using explicit dropzones', async () => {
    other.firstElementChild!.remove();
    await elementIsStable(other);
    const destination = other.querySelector('button')!;
    drag(items[0], 'dragstart');
    drag(destination, 'drop');
    expect(drop.mock.calls[0][0].detail).toMatchObject({ targetIndex: 0, placement: 'append', targetContainer: other });
  });

  it('appends within a list through its opted-in background and still targets individual rows', () => {
    drag(items[0], 'dragstart');
    expect(drag(list, 'dragover').defaultPrevented).toBe(false);

    list.setAttribute('nve-draggable', 'dropzone');
    drag(items[2], 'dragover');
    expect(items[2].getAttribute('nve-draggable')).toContain('before');
    expect(drag(list, 'dragover').defaultPrevented).toBe(true);
    expect(list.getAttribute('nve-draggable')).toContain('append');
    expect(items[2].hasAttribute('nve-draggable')).toBe(false);

    drag(list, 'drop');
    expect(drop).toHaveBeenCalledTimes(1);
    expect(drop.mock.calls[0][0].detail).toMatchObject({
      source: items[0],
      target: list,
      sourceContainer: list,
      targetContainer: list,
      targetIndex: 2,
      placement: 'append'
    });
    expect(list.getAttribute('nve-draggable')).toBe('dropzone');
  });

  it('ignores external drags, self drops and unchanged positions', () => {
    expect(drag(items[1], 'dragover').defaultPrevented).toBe(false);
    drag(items[1], 'drop');
    drag(items[0], 'dragstart');
    drag(items[0], 'drop');
    drag(items[0], 'dragend');
    drag(items[0], 'dragstart');
    drag(items[1], 'drop');
    expect(drop).not.toHaveBeenCalled();
    expect(items[0].hasAttribute('nve-draggable')).toBe(false);
  });

  it('chooses with arrows and commits once, preserving focus and application order', async () => {
    items[0].focus();
    expect(key(items[0], ' ').defaultPrevented).toBe(true);
    expect(items[0].getAttribute('aria-pressed')).toBe('true');
    key(items[0], 'ArrowDown');
    expect(items[2].getAttribute('nve-draggable')).toContain('before');
    expect(document.activeElement).toBe(items[0]);
    key(items[0], 'Enter');
    await elementIsStable(list);
    expect(drop).toHaveBeenCalledTimes(1);
    expect(drop.mock.calls[0][0].detail).toMatchObject({ targetIndex: 1, interaction: 'keyboard' });
    expect(items[0].hasAttribute('aria-pressed')).toBe(false);
    expect(list.shadowRoot!.querySelector('[role="status"]')!.textContent).toContain('Move requested');
    expect(list.firstElementChild).toBe(items[0]);
  });

  it('supports Home, End and bounded movement without emitting until commitment', () => {
    key(items[1], 'Enter');
    key(items[1], 'Home');
    key(items[1], 'ArrowUp');
    expect(items[0].getAttribute('nve-draggable')).toContain('before');
    key(items[1], 'End');
    key(items[1], 'ArrowDown');
    expect(items[2].getAttribute('nve-draggable')).toContain('after');
    expect(drop).not.toHaveBeenCalled();
    key(items[1], ' ');
    expect(drop.mock.calls[0][0].detail.targetIndex).toBe(2);
  });

  it('allows Tab to another list and activation on its destination', () => {
    key(items[0], ' ');
    expect(key(items[0], 'Tab').defaultPrevented).toBe(false);
    const destination = other.querySelector('button')!;
    destination.focus();
    key(destination, 'Enter');
    expect(drop.mock.calls[0][0].detail).toMatchObject({ targetContainer: other, targetIndex: 0 });
  });

  it('uses the newly focused item after choosing a keyboard placement in the same list', () => {
    items[0].focus();
    key(items[0], ' ');
    key(items[0], 'End');
    expect(items[2].getAttribute('nve-draggable')).toContain('after');

    items[2].focus();
    key(items[2], 'Enter');
    expect(drop.mock.calls[0][0].detail).toMatchObject({ target: items[2], targetIndex: 1, placement: 'before' });
  });

  it('supports click pickup and click placement, including append', () => {
    items[0].click();
    items[3].click();
    expect(drop.mock.calls[0][0].detail).toMatchObject({
      targetIndex: 2,
      placement: 'append',
      interaction: 'keyboard'
    });
  });

  it('honors the focused append target after choosing an earlier position with the keyboard', () => {
    items[0].focus();
    key(items[0], ' ');
    key(items[0], 'ArrowDown');
    expect(items[2].getAttribute('nve-draggable')).toContain('before');

    const append = items[3];
    append.focus();
    key(append, 'Enter');

    expect(drop).toHaveBeenCalledTimes(1);
    expect(drop.mock.calls[0][0].detail).toMatchObject({ target: append, placement: 'append', targetIndex: 2 });
  });

  it('cancels through Escape, explicit cancel, outside pointerdown and window blur', () => {
    const end = vi.fn();
    list.addEventListener('draggable-end', end);
    for (const cancel of [
      () => key(items[0], 'Escape'),
      () => list.cancel(),
      () => document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })),
      () => window.dispatchEvent(new Event('blur'))
    ]) {
      key(items[0], ' ');
      key(items[0], 'End');
      cancel();
      expect(items[0].hasAttribute('aria-pressed')).toBe(false);
      expect(items[2].hasAttribute('nve-draggable')).toBe(false);
    }
    expect(drop).not.toHaveBeenCalled();
    expect(end).toHaveBeenCalledTimes(4);
    expect(end.mock.calls.every(([event]) => !event.detail.dropped)).toBe(true);
  });

  it('preserves explicit draggability and cancels when disabled, hidden or structurally invalidated', async () => {
    items[1].draggable = false;
    expect(drag(items[1], 'dragstart').defaultPrevented).toBe(true);
    for (const invalidate of [
      () => {
        list.disabled = true;
      },
      () => {
        items[0].hidden = true;
      },
      () => {
        list.insertBefore(document.createElement('button'), items[2]);
      }
    ]) {
      list.disabled = false;
      items[0].hidden = false;
      await elementIsStable(list);
      key(items[0], ' ');
      key(items[0], 'End');
      invalidate();
      await elementIsStable(list);
      expect(items[0].hasAttribute('aria-pressed')).toBe(false);
    }
    expect(items[1].getAttribute('draggable')).toBe('false');
    expect(drop).not.toHaveBeenCalled();
  });

  it('cancels a stale destination and does not reuse it on a later external drop', async () => {
    drag(items[0], 'dragstart');
    const destination = other.querySelector('button')!;
    drag(destination, 'dragover');
    destination.remove();
    await elementIsStable(other);
    expect(items[0].hasAttribute('nve-draggable')).toBe(false);
    drag(items[2], 'drop');
    expect(drop).not.toHaveBeenCalled();
  });

  it('cancels an append proposal when its target moves to another list', async () => {
    const append = other.querySelector<HTMLElement>('[nve-draggable="dropzone"]')!;
    other.firstElementChild!.remove();
    const third = document.createElement('nve-draggable-list');
    fixture.append(third);
    await elementIsStable(third);

    key(items[0], ' ');
    key(append, 'End');
    expect(append.getAttribute('nve-draggable')).toContain('target append');

    third.append(append);
    await elementIsStable(third);
    expect(items[0].hasAttribute('aria-pressed')).toBe(false);
    expect(append.getAttribute('nve-draggable')).toBe('dropzone');
    key(items[0], 'Enter');
    expect(drop).not.toHaveBeenCalled();
  });

  it('handles horizontal RTL pointer and keyboard placement', async () => {
    list.orientation = 'horizontal';
    list.dir = 'rtl';
    await elementIsStable(list);
    drag(items[0], 'dragstart');
    drag(items[2], 'drop', { portion: 0.25 });
    expect(drop.mock.calls[0][0].detail.placement).toBe('after');
    key(items[0], ' ');
    expect(key(items[0], 'ArrowDown').defaultPrevented).toBe(false);
    key(items[0], 'ArrowLeft');
    key(items[0], 'Enter');
    expect(drop.mock.calls[1][0].detail.targetIndex).toBe(1);
  });

  it.each([
    { direction: 'rtl', dir: 'ltr', next: 'ArrowLeft', offset: '-2px' },
    { direction: 'ltr', dir: 'rtl', next: 'ArrowRight', offset: '2px' }
  ])('draws the marker on the leading edge with CSS direction $direction', async ({ direction, dir, next, offset }) => {
    list.orientation = 'horizontal';
    list.dir = dir;
    list.style.direction = direction;
    list.style.setProperty('--nve-ref-border-width-sm', '2px');
    list.style.setProperty('--nve-sys-accent-secondary-background', 'red');
    await elementIsStable(list);

    key(items[0], ' ');
    key(items[0], next);
    expect(items[2].getAttribute('nve-draggable')).toContain('before');
    expect(getComputedStyle(items[2]).boxShadow).toMatch(new RegExp(` ${offset} 0px.* inset$`));
  });

  it('reconnects and adds items without duplicate events or persistent item markers', async () => {
    key(items[0], ' ');
    list.remove();
    expect(items[0].hasAttribute('aria-pressed')).toBe(false);
    expect(items[0].hasAttribute('draggable')).toBe(false);
    fixture.append(list);
    const added = document.createElement('button');
    added.textContent = 'New';
    list.append(added);
    await elementIsStable(list);
    expect(added.draggable).toBe(true);
    key(added, ' ');
    key(added, 'Home');
    key(added, ' ');
    expect(drop).toHaveBeenCalledTimes(1);
  });

  it('emits native lifecycle events and clears the target when leaving descendants', () => {
    const events: string[] = [];
    for (const name of ['start', 'drag', 'enter', 'over', 'leave', 'end'])
      list.addEventListener(`draggable-${name}`, () => events.push(name));
    drag(items[0], 'dragstart');
    drag(items[0], 'drag');
    drag(items[2], 'dragenter');
    drag(items[2], 'dragover');
    drag(items[2], 'dragleave');
    drag(items[0], 'dragend');
    expect(events).toEqual(['start', 'drag', 'enter', 'over', 'leave', 'end']);
  });

  it('localizes pickup and position announcements through Foundations i18n', async () => {
    const previous = I18nService.i18n.dragPosition;
    I18nService.update({ dragPosition: '{label}: emplacement {position}/{count}' });
    key(items[0], ' ');
    key(items[0], 'End');
    await elementIsStable(list);
    expect(list.shadowRoot!.querySelector('[role="status"]')!.textContent).toBe('A: emplacement 3/3');
    I18nService.update({ dragPosition: previous });
  });

  it('requires handles when supplied, while allowing other item controls to work', async () => {
    list.innerHTML =
      '<div><button nve-draggable="handle" aria-label="Move job">Grip</button><input aria-label="Job name"></div><div tabindex="0">Target</div>';
    await elementIsStable(list);
    const item = list.firstElementChild as HTMLElement;
    const handle = list.querySelector('button')!;
    const input = list.querySelector('input')!;
    expect(drag(item, 'dragstart').defaultPrevented).toBe(true);
    expect(key(input, ' ').defaultPrevented).toBe(false);
    input.click();
    expect(item.hasAttribute('nve-draggable')).toBe(false);
    handle.click();
    expect(handle.getAttribute('aria-pressed')).toBe('true');
    key(input, 'ArrowDown');
    expect(drop).not.toHaveBeenCalled();
    key(handle, 'End');
    handle.click();
    expect(drop).toHaveBeenCalledTimes(1);
    expect(handle.getAttribute('nve-draggable')).toBe('handle');
  });

  it.each(['light DOM', 'shadow DOM'])('cancels pickup when the handle leaves the item (%s)', async tree => {
    list.innerHTML = '<div></div><div>Job B</div>';
    await elementIsStable(list);
    const item = list.querySelector('div')!;
    const root = tree === 'shadow DOM' ? item.attachShadow({ mode: 'open' }) : item;
    root.innerHTML = '<button nve-draggable="handle">Grip</button>Job A';
    const handle = root.querySelector('button')!;
    const append = other.querySelector<HTMLElement>('[nve-draggable="dropzone"]')!;
    key(handle, ' ');
    expect(handle.getAttribute('aria-pressed')).toBe('true');

    handle.remove();
    await elementIsStable(list);
    expect(item.hasAttribute('nve-draggable')).toBe(false);
    expect(handle.hasAttribute('aria-pressed')).toBe(false);
    key(append, 'Enter');
    expect(drop).not.toHaveBeenCalled();
  });

  it('ignores descendant lists when resolving outer item ownership', async () => {
    list.innerHTML =
      '<div><nve-draggable-list><button>Inner A</button><button>Inner B</button></nve-draggable-list></div>';
    const inner = list.querySelector('nve-draggable-list')!;
    await elementIsStable(inner);
    const start = vi.fn();
    list.addEventListener('draggable-start', start);
    key(inner.querySelector('button')!, ' ');
    expect(start).toHaveBeenCalledTimes(1);
    expect(start.mock.calls[0][0].detail.sourceContainer).toBe(inner);
    inner.cancel();
  });

  it.each(['light DOM', 'shadow DOM'])('rejects a destination inside the source in %s', async tree => {
    list.innerHTML = '<div></div><button>Other item</button>';
    const item = list.querySelector('div')!;
    const root = tree === 'shadow DOM' ? item.attachShadow({ mode: 'open' }) : item;
    root.innerHTML =
      '<button nve-draggable="handle">Move</button><nve-draggable-list><button>Inner</button></nve-draggable-list>';
    const inner = root.querySelector('nve-draggable-list')!;
    const handle = root.querySelector('button')!;
    const destination = inner.querySelector('button')!;
    await elementIsStable(inner);

    key(handle, ' ');
    expect(item.getAttribute('nve-draggable')).toBe('active');
    key(destination, 'Enter');
    expect(drop).not.toHaveBeenCalled();
    expect(destination.hasAttribute('nve-draggable')).toBe(false);
    key(handle, 'End');
    key(handle, 'Enter');
    expect(drop).toHaveBeenCalledOnce();
  });

  it('requires the handle when an item renders it inside a shadow root', async () => {
    list.innerHTML = '<div tabindex="0"><span>Job</span></div><button>Other item</button>';
    const item = list.querySelector('div')!;
    const root = item.attachShadow({ mode: 'open' });
    root.innerHTML = '<button nve-draggable="handle">Move</button><slot></slot>';
    await elementIsStable(list);

    item.querySelector('span')!.click();
    key(item, ' ');
    expect(item.hasAttribute('nve-draggable')).toBe(false);
    root.querySelector('button')!.click();
    expect(item.getAttribute('nve-draggable')).toBe('active');
  });

  it('preserves handle properties and preexisting pressed attributes through cancellation', async () => {
    const handle = Object.assign(items[0], { pressed: false });
    key(handle, ' ');
    expect(handle.pressed).toBe(true);
    list.cancel();
    expect(handle.pressed).toBe(false);
    items[1].setAttribute('aria-pressed', 'false');
    key(items[1], ' ');
    list.cancel();
    expect(items[1].getAttribute('aria-pressed')).toBe('false');
    list.innerHTML = '<div tabindex="0" aria-label="Training">Job</div>';
    await elementIsStable(list);
    const item = list.querySelector('div')!;
    key(item, ' ');
    expect(item.hasAttribute('aria-pressed')).toBe(false);
    list.cancel();
  });

  it('does not claim modified, prevented or repeated activation as another pickup', () => {
    const start = vi.fn();
    list.addEventListener('draggable-start', start);
    key(items[0], ' ', { altKey: true });
    key(items[0], 'Enter', { ctrlKey: true });
    key(items[0], ' ', { metaKey: true });
    const prevented = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    prevented.preventDefault();
    items[0].dispatchEvent(prevented);
    key(items[0], ' ', { repeat: true });
    expect(start).not.toHaveBeenCalled();
    key(items[0], ' ');
    key(items[0], ' ', { repeat: true });
    expect(start).toHaveBeenCalledTimes(1);
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(items[0].hasAttribute('nve-draggable')).toBe(false);
  });

  it('leaves repeated activation and keyup available to controls in a disabled list', async () => {
    list.disabled = true;
    await elementIsStable(list);
    const onKeyup = vi.fn();
    items[0].addEventListener('keyup', onKeyup);

    expect(key(items[0], ' ', { repeat: true }).defaultPrevented).toBe(false);
    expect(onKeyup).toHaveBeenCalledOnce();
    expect(onKeyup.mock.calls[0][0].defaultPrevented).toBe(false);
  });

  it('cancels native pickup when an application prevents the underlying dragstart', async () => {
    const end = vi.fn();
    list.addEventListener('draggable-end', end);
    items[0].addEventListener('dragstart', event => event.preventDefault(), { once: true });
    drag(items[0], 'dragstart');
    await Promise.resolve();
    expect(items[0].hasAttribute('nve-draggable')).toBe(false);
    expect(end).toHaveBeenCalledTimes(1);
    drag(items[2], 'drop');
    expect(drop).not.toHaveBeenCalled();
    const missingTransfer = new DragEvent('dragstart', { bubbles: true, cancelable: true });
    items[0].dispatchEvent(missingTransfer);
    expect(missingTransfer.defaultPrevented).toBe(true);
  });

  it('allows lifecycle consumers to cancel pickup and changed proposals safely', () => {
    list.addEventListener('draggable-start', () => list.cancel(), { once: true });
    expect(drag(items[0], 'dragstart').defaultPrevented).toBe(true);
    list.addEventListener('draggable-enter', () => list.cancel(), { once: true });
    drag(items[0], 'dragstart');
    expect(drag(items[2], 'dragover').defaultPrevented).toBe(false);
    expect(items[2].hasAttribute('nve-draggable')).toBe(false);
    drag(items[0], 'dragstart');
    drag(items[2], 'dragover');
    list.addEventListener('draggable-leave', () => list.cancel(), { once: true });
    drag(items[1], 'dragover', { portion: 0.75 });
    expect(items[0].hasAttribute('nve-draggable')).toBe(false);
    expect(items[1].hasAttribute('nve-draggable')).toBe(false);
    expect(drop).not.toHaveBeenCalled();
  });

  it('cancels commitment when a leave listener removes the proposed destination', () => {
    const end = vi.fn();
    list.addEventListener('draggable-end', end);
    key(items[0], ' ');
    key(items[0], 'End');
    list.addEventListener('draggable-leave', () => items[2].remove(), { once: true });
    key(items[0], 'Enter');

    expect(drop).not.toHaveBeenCalled();
    expect(end).toHaveBeenCalledOnce();
    expect(end.mock.calls[0][0].detail.dropped).toBe(false);
    expect(items[0].hasAttribute('nve-draggable')).toBe(false);
  });

  it('navigates another list and an empty append target with the keyboard', async () => {
    key(items[0], ' ');
    const destination = other.querySelector('button')!;
    destination.focus();
    key(destination, 'ArrowDown');
    key(destination, 'ArrowUp');
    key(destination, 'Enter');
    expect(drop.mock.calls[0][0].detail).toMatchObject({ targetContainer: other, targetIndex: 0 });
    destination.remove();
    await elementIsStable(other);
    key(items[0], ' ');
    const append = other.querySelector('button')!;
    append.focus();
    key(append, 'End');
    key(append, 'Enter');
    expect(drop.mock.calls[1][0].detail).toMatchObject({ placement: 'append', targetIndex: 0 });
  });

  it('keeps editable descendants interactive during pickup and excludes hidden destinations', async () => {
    list.innerHTML = '<div tabindex="0"><span>Job A</span><input aria-label="Name"></div><div tabindex="0">Job B</div>';
    await elementIsStable(list);
    const [a, b] = Array.from(list.querySelectorAll('div'));
    const input = list.querySelector('input')!;
    key(input, ' ');
    expect(a.hasAttribute('nve-draggable')).toBe(false);
    a.click();
    input.click();
    expect(drop).not.toHaveBeenCalled();
    b.hidden = true;
    drag(b, 'dragover');
    expect(drop).not.toHaveBeenCalled();
    b.hidden = false;
    key(a, 'End');
    a.click();
    expect(drop).toHaveBeenCalledTimes(1);
  });

  it('respects disabled handles and direct handle items without replacing their marker', async () => {
    items[0].setAttribute('nve-draggable', 'handle');
    items[0].disabled = true;
    expect(drag(items[0], 'dragstart').defaultPrevented).toBe(true);
    items[0].disabled = false;
    items[0].click();
    key(items[0], 'End');
    items[0].click();
    expect(drop).toHaveBeenCalledTimes(1);
    expect(items[0].getAttribute('nve-draggable')).toBe('handle');
    list.innerHTML = '<div><button nve-draggable="handle" disabled>Move</button></div>';
    await elementIsStable(list);
    expect(drag(list.querySelector('button')!, 'dragstart').defaultPrevented).toBe(true);
  });

  it('clears a keyboard proposal when the destination container disconnects', async () => {
    key(items[0], ' ');
    const destination = other.querySelector('button')!;
    key(destination, 'End');
    other.remove();
    await elementIsStable(list);
    expect(items[0].hasAttribute('aria-pressed')).toBe(false);
    expect(drop).not.toHaveBeenCalled();
  });

  it.each(['mouse', 'touch'])(
    'reports %s click pickup as pointer input while retaining placement controls',
    pointerType => {
      const activate = () =>
        items[0].dispatchEvent(
          new PointerEvent('click', {
            detail: 1,
            pointerType,
            button: 0,
            bubbles: true,
            composed: true,
            cancelable: true
          })
        );
      activate();
      expect(items[0].getAttribute('aria-pressed')).toBe('true');
      key(items[0], 'End');
      activate();
      expect(drop.mock.calls[0][0].detail).toMatchObject({ interaction: 'pointer', targetIndex: 2 });
      expect(items[0].hasAttribute('aria-pressed')).toBe(false);
    }
  );
});
