// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { KeyStateController } from '@nvidia-elements/core/internal';

@customElement('key-state-controller-test-element')
class KeyStateControllerTestElement extends LitElement {
  readonly keyState = new KeyStateController(this, { watchedCodes: ['Space'] });
}

describe('key-state.controller', () => {
  let element: KeyStateControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<key-state-controller-test-element></key-state-controller-test-element>`);
    element = fixture.querySelector('key-state-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('tracks physical key codes without preventing their native events', async () => {
    element.keyState.enabled = true;
    const down = new KeyboardEvent('keydown', { cancelable: true, code: 'Space' });
    expect(globalThis.dispatchEvent(down)).toBe(true);
    await elementIsStable(element);
    expect(element.keyState.isPressed('Space')).toBe(true);
    expect(down.defaultPrevented).toBe(false);

    globalThis.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    await elementIsStable(element);
    expect(element.keyState.isPressed('Space')).toBe(false);
  });

  it('observes key releases stopped by descendants', async () => {
    element.keyState.enabled = true;
    const descendant = document.createElement('button');
    element.append(descendant);
    descendant.addEventListener('keyup', event => event.stopPropagation());

    descendant.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', composed: true }));
    await elementIsStable(element);
    expect(element.keyState.isPressed('Space')).toBe(true);

    descendant.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, code: 'Space', composed: true }));
    await elementIsStable(element);
    expect(element.keyState.isPressed('Space')).toBe(false);
  });

  it('clears held keys when the document becomes hidden', async () => {
    const requestUpdate = vi.spyOn(element, 'requestUpdate');
    element.keyState.enabled = true;
    globalThis.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    await elementIsStable(element);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await elementIsStable(element);

    expect(element.keyState.isPressed('Space')).toBe(false);
    expect(requestUpdate).toHaveBeenCalledTimes(2);
  });

  it('does not attach listeners until enabled', async () => {
    const addWindowListener = vi.spyOn(globalThis, 'addEventListener');
    const addDocumentListener = vi.spyOn(document, 'addEventListener');
    const disabled = document.createElement('key-state-controller-test-element');
    fixture.append(disabled);
    await elementIsStable(disabled);

    expect(listenerCalls(addWindowListener, 'keydown')).toHaveLength(0);
    expect(listenerCalls(addWindowListener, 'keyup')).toHaveLength(0);
    expect(listenerCalls(addWindowListener, 'blur')).toHaveLength(0);
    expect(listenerCalls(addDocumentListener, 'visibilitychange')).toHaveLength(0);

    disabled.keyState.enabled = true;

    expect(listenerCalls(addWindowListener, 'keydown')).toHaveLength(1);
    expect(listenerCalls(addWindowListener, 'keyup')).toHaveLength(1);
    expect(listenerCalls(addWindowListener, 'blur')).toHaveLength(1);
    expect(listenerCalls(addDocumentListener, 'visibilitychange')).toHaveLength(1);
  });

  it('shares one listener set and retains it until the final subscriber disconnects', async () => {
    const addWindowListener = vi.spyOn(globalThis, 'addEventListener');
    const addDocumentListener = vi.spyOn(document, 'addEventListener');
    const removeWindowListener = vi.spyOn(globalThis, 'removeEventListener');
    const removeDocumentListener = vi.spyOn(document, 'removeEventListener');
    const other = document.createElement('key-state-controller-test-element');
    fixture.append(other);
    await elementIsStable(other);

    element.keyState.enabled = true;
    other.keyState.enabled = true;

    expect(listenerCalls(addWindowListener, 'keydown')).toHaveLength(1);
    expect(listenerCalls(addWindowListener, 'keyup')).toHaveLength(1);
    expect(listenerCalls(addWindowListener, 'blur')).toHaveLength(1);
    expect(listenerCalls(addDocumentListener, 'visibilitychange')).toHaveLength(1);

    element.remove();
    globalThis.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    expect(other.keyState.isPressed('Space')).toBe(true);
    expect(listenerCalls(removeWindowListener, 'keydown')).toHaveLength(0);
    expect(listenerCalls(removeDocumentListener, 'visibilitychange')).toHaveLength(0);

    other.remove();
    expect(listenerCalls(removeWindowListener, 'keydown')).toHaveLength(1);
    expect(listenerCalls(removeWindowListener, 'keyup')).toHaveLength(1);
    expect(listenerCalls(removeWindowListener, 'blur')).toHaveLength(1);
    expect(listenerCalls(removeDocumentListener, 'visibilitychange')).toHaveLength(1);
    expect(other.keyState.isPressed('Space')).toBe(false);
  });

  it('updates for watched-code transitions and blur, but not unrelated keys', () => {
    const requestUpdate = vi.spyOn(element, 'requestUpdate');
    element.keyState.enabled = true;
    requestUpdate.mockClear();

    globalThis.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));
    globalThis.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
    expect(requestUpdate).not.toHaveBeenCalled();

    globalThis.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    expect(requestUpdate).toHaveBeenCalledOnce();
    globalThis.dispatchEvent(new Event('blur'));
    expect(requestUpdate).toHaveBeenCalledTimes(2);
    expect(element.keyState.isPressed('Space')).toBe(false);
  });

  it('keeps keyboard state independent between documents', async () => {
    const iframe = document.createElement('iframe');
    fixture.append(iframe);
    const iframeDocument = iframe.contentDocument;
    const iframeWindow = iframe.contentWindow;
    expect(iframeDocument).not.toBeNull();
    expect(iframeWindow).not.toBeNull();
    if (!iframeDocument || !iframeWindow) return;

    const other = document.createElement('key-state-controller-test-element');
    other.keyState.enabled = true;
    iframeDocument.body.append(other);
    await elementIsStable(other);
    element.keyState.enabled = true;

    globalThis.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    expect(element.keyState.isPressed('Space')).toBe(true);
    expect(other.keyState.isPressed('Space')).toBe(false);
    globalThis.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));

    iframeWindow.dispatchEvent(new iframeWindow.KeyboardEvent('keydown', { code: 'Space' }));
    expect(element.keyState.isPressed('Space')).toBe(false);
    expect(other.keyState.isPressed('Space')).toBe(true);
  });
});

function listenerCalls(
  spy: { readonly mock: { readonly calls: ReadonlyArray<ReadonlyArray<unknown>> } },
  type: string
): ReadonlyArray<ReadonlyArray<unknown>> {
  return spy.mock.calls.filter(([eventType]) => eventType === type);
}
