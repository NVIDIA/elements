import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  createFixture,
  elementIsStable,
  removeFixture,
  emulateMouseEnter,
  emulateMouseLeave,
  untilEvent
} from '@nvidia-elements/testing';
import { CopyButton } from '@nvidia-elements/core/copy-button';
import { Icon } from '@nvidia-elements/core/icon';
import { Toast } from '@nvidia-elements/core/toast';
import { Tooltip } from '@nvidia-elements/core/tooltip';

import '@nvidia-elements/core/copy-button/define.js';

describe(CopyButton.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: CopyButton;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-copy-button value='hello' behavior-copy></nve-copy-button>`);
    element = fixture.querySelector(CopyButton.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(CopyButton.metadata.tag)).toBeDefined();
  });

  it('should enable copy functionality and show toast when clicked', async () => {
    const mockClipboard = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

    // check if clipboard functionality was called with the right value
    element.shadowRoot.querySelector<Icon>(Icon.metadata.tag).click();
    expect(mockClipboard).toHaveBeenCalledWith('hello');
    expect(mockClipboard).toHaveBeenCalledTimes(1);

    // check if toast appears when content is copied successfully
    const toast = element.shadowRoot.querySelector<Toast>(Toast.metadata.tag);
    expect(toast.status).toBe('success');

    mockClipboard.mockRestore();
  });

  it('should enable copy functionality and show toast when clicked', async () => {
    const mockClipboard = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

    // check if clipboard functionality was called with the right value
    element.shadowRoot.querySelector<Icon>(Icon.metadata.tag).click();
    expect(mockClipboard).toHaveBeenCalledWith('hello');
    expect(mockClipboard).toHaveBeenCalledTimes(1);

    // check if toast appears when content is copied successfully
    const toast = element.shadowRoot.querySelector<Toast>(Toast.metadata.tag);
    expect(toast.status).toBe('success');
    await toast.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(toast.hidden).toBe(false);

    mockClipboard.mockRestore();
  });

  it('should show the tooltip on hover', async () => {
    // Simulate hover event
    const tooltip = element.shadowRoot.querySelector<Tooltip>(Tooltip.metadata.tag);
    const button = element.shadowRoot.querySelector<Icon>(Icon.metadata.tag);
    tooltip.hidePopover();

    const open = untilEvent(tooltip, 'open');
    emulateMouseEnter(button);
    await open;
    await elementIsStable(button);
    expect(tooltip.hidden).toBe(false);

    const close = untilEvent(tooltip, 'close');
    emulateMouseLeave(button);
    await close;
    await elementIsStable(button);
    expect(tooltip.hidden).toBe(true);
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

    element.shadowRoot.querySelector<Icon>(Icon.metadata.tag).click();
    await new Promise(resolve => setTimeout(resolve, 0));

    // Check if error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Clipboard API error'));
    expect(element.shadowRoot.querySelector<Toast>(Toast.metadata.tag).hidden).toBe(true);

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
