// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  createFixture,
  elementIsStable,
  removeFixture,
  emulateMouseEnter,
  emulateMouseLeave
} from '@internals/testing';
import { CopyButton } from '@nvidia-elements/core/copy-button';
import { Toast } from '@nvidia-elements/core/toast';
import { Tooltip } from '@nvidia-elements/core/tooltip';

import '@nvidia-elements/core/copy-button/define.js';

describe(CopyButton.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: CopyButton;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-copy-button value="hello" behavior-copy></nve-copy-button>`);
    element = fixture.querySelector(CopyButton.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(CopyButton.metadata.tag)).toBeDefined();
  });

  it('should not reflect value property', () => {
    element.removeAttribute('value');
    element.value = 'noreflect';
    expect(element.getAttribute('value')).toBeNull();
    expect(element.value).toBe('noreflect');
  });

  it('should enable copy functionality and show toast when clicked', async () => {
    const mockClipboard = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    element.click();
    await elementIsStable(element);

    // check if clipboard functionality was called with the right value
    expect(mockClipboard).toHaveBeenCalledWith('hello');
    expect(mockClipboard).toHaveBeenCalledTimes(1);

    // check if toast appears when content is copied successfully
    const toast = element.shadowRoot.querySelector<Toast>(Toast.metadata.tag);
    expect(toast.status).toBe('success');

    mockClipboard.mockRestore();
  });

  it('should enable copy functionality and show toast when clicked', async () => {
    const mockClipboard = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    element.click();
    await elementIsStable(element);

    // check if clipboard functionality was called with the right value
    expect(mockClipboard).toHaveBeenCalledWith('hello');
    expect(mockClipboard).toHaveBeenCalledTimes(1);

    // check if toast appears when content is copied successfully
    const toast = element.shadowRoot.querySelector<Toast>(Toast.metadata.tag);
    expect(toast.status).toBe('success');
    await toast.updateComplete;

    mockClipboard.mockRestore();
  });

  it('should show the tooltip on hover', async () => {
    emulateMouseEnter(element);
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<Tooltip>(Tooltip.metadata.tag)).toBeTruthy();

    emulateMouseLeave(element);
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<Tooltip>(Tooltip.metadata.tag)).toBeFalsy();
  });

  it('should handle clipboard API errors', async () => {
    // Mock the Clipboard API to throw an error
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard API error'))
      },
      configurable: true
    });

    // Capture error messages
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    element.click();
    await elementIsStable(element);

    // Check if error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Clipboard API error'));
    expect(element.shadowRoot.querySelector<Toast>(Toast.metadata.tag)).toBeFalsy();

    consoleErrorSpy.mockRestore();
    Object.defineProperty(navigator, 'clipboard', { value: originalClipboard });
  });

  it('should allow event listeners and event bubbling when behavior-copy is active', async () => {
    const mockClipboard = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

    const buttonClickSpy = vi.fn();
    element.addEventListener('click', buttonClickSpy);

    const wrapper = document.createElement('div');
    const parentClickSpy = vi.fn();
    wrapper.addEventListener('click', parentClickSpy);
    wrapper.appendChild(element);
    document.body.appendChild(wrapper);

    await elementIsStable(element);

    element.shadowRoot.querySelector<HTMLElement>('#btn').click();
    await elementIsStable(element);

    // Verify button's own event listener was called
    expect(buttonClickSpy).toHaveBeenCalledTimes(1);

    // Verify parent click handler WAS called (events bubble up without stopPropagation)
    expect(parentClickSpy).toHaveBeenCalledTimes(1);

    // Verify clipboard functionality still works
    expect(mockClipboard).toHaveBeenCalledWith('hello');
    expect(mockClipboard).toHaveBeenCalledTimes(1);

    wrapper.remove();
    mockClipboard.mockRestore();
  });
});
