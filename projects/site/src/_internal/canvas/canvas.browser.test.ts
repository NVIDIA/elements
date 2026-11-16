// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Canvas } from './canvas.js';
import './canvas.js';

describe('nvd-canvas', () => {
  let element: Canvas;
  let code: HTMLElement;
  const initialSource = '<textarea>\n\n  initial &amp; value\n</textarea>';
  const updatedSource = '<textarea>\n\n  # updated\n\n  &amp; value\n</textarea>';

  beforeEach(() => {
    element = globalThis.document.createElement('nvd-canvas') as Canvas;
    const pre = globalThis.document.createElement('pre');
    code = globalThis.document.createElement('code');
    code.textContent = initialSource;
    pre.append(code);
    element.append(pre);
  });

  afterEach(() => element.remove());

  it.each([
    { padding: '0px', height: '100%', contentHeight: 8, minimum: 80 },
    { padding: '12px', height: '100%', contentHeight: 8, minimum: 80 },
    { padding: '0px', height: '160px', contentHeight: 8, minimum: 160 },
    { padding: '0px', height: '100%', contentHeight: 160, minimum: 160 }
  ])(
    'fills the preview background for $contentHeight px content with $padding padding and $height height',
    async ({ padding, height, contentHeight, minimum }) => {
      const content = globalThis.document.createElement('div');
      content.style.height = `${contentHeight}px`;
      element.replaceChildren(content);
      element.style.setProperty('--padding', padding);
      element.style.setProperty('--height', height);
      element.layer = 'container';
      globalThis.document.body.append(element);
      await element.updateComplete;

      const resizer = element.shadowRoot?.querySelector('.resizer');
      const slot = element.shadowRoot?.querySelector('slot:not([name])');
      if (!resizer || !slot) throw new Error('Expected a preview wrapper and slot');
      const previewBounds = resizer.getBoundingClientRect();
      const backgroundBounds = slot.getBoundingClientRect();

      expect(previewBounds.height).toBeGreaterThanOrEqual(minimum);
      expect(backgroundBounds.top).toBe(previewBounds.top);
      expect(backgroundBounds.bottom).toBe(previewBounds.bottom);
    }
  );

  it('keeps the background at full height when the preview width changes', async () => {
    const content = globalThis.document.createElement('div');
    content.style.height = '8px';
    element.replaceChildren(content);
    element.style.width = '640px';
    element.style.setProperty('--padding', '12px');
    globalThis.document.body.append(element);
    await new Promise(requestAnimationFrame);
    await element.updateComplete;

    const handle = element.shadowRoot?.querySelector('nve-resize-handle');
    const resizer = element.shadowRoot?.querySelector('.resizer');
    const slot = element.shadowRoot?.querySelector('slot:not([name])');
    if (!handle || !resizer || !slot) throw new Error('Expected preview and resize controls');
    handle.value = 300;
    handle.dispatchEvent(new Event('input', { bubbles: true }));
    await element.updateComplete;

    expect(slot.getBoundingClientRect().width).toBe(300);
    expect(resizer.getBoundingClientRect().width).toBeGreaterThan(300);
    expect(slot.getBoundingClientRect().height).toBe(resizer.getBoundingClientRect().height);
  });

  it('uses server-provided source without assigning the source property', async () => {
    expect(code.textContent).toBe(initialSource);
    globalThis.document.body.append(element);

    await expect.poll(() => element.shadowRoot?.querySelector('nve-code-block')).toMatchObject({ code: initialSource });
    expect(element.shadowRoot?.querySelector('nve-copy-button')).toMatchObject({ value: initialSource });
    expect(element.source).toBeUndefined();
  });

  it('updates displayed and copied source when the slotted fallback is replaced', async () => {
    globalThis.document.body.append(element);
    await expect.poll(() => element.shadowRoot?.querySelector('nve-code-block')).toMatchObject({ code: initialSource });
    expect(element.source).toBeUndefined();

    const slot = element.shadowRoot?.querySelector('slot');
    if (!slot) throw new Error('Expected the preview slot');
    const changed = new Promise<void>(resolve => slot.addEventListener('slotchange', () => resolve(), { once: true }));
    const pre = globalThis.document.createElement('pre');
    const replacementCode = globalThis.document.createElement('code');
    replacementCode.textContent = updatedSource;
    pre.append(replacementCode);
    element.replaceChildren(pre);
    await changed;
    await element.updateComplete;

    expect(element.source).toBeUndefined();
    expect(element.shadowRoot?.querySelector('nve-code-block')).toMatchObject({ code: updatedSource });
    expect(element.shadowRoot?.querySelector('nve-copy-button')).toMatchObject({ value: updatedSource });
  });

  it('updates displayed and copied source through the property without modifying slotted content', async () => {
    globalThis.document.body.append(element);
    await element.updateComplete;
    element.source = updatedSource;
    await element.updateComplete;

    expect(element.shadowRoot?.querySelector('nve-code-block')).toMatchObject({ code: updatedSource });
    expect(element.shadowRoot?.querySelector('nve-copy-button')).toMatchObject({ value: updatedSource });
    expect(code.textContent).toBe(initialSource);

    const slot = element.shadowRoot?.querySelector('slot');
    if (!slot) throw new Error('Expected the preview slot');
    const changed = new Promise<void>(resolve => slot.addEventListener('slotchange', () => resolve(), { once: true }));
    element.append(globalThis.document.createElement('div'));
    await changed;
    await element.updateComplete;

    expect(element.source).toBe(updatedSource);
    expect(element.shadowRoot?.querySelector('nve-code-block')).toMatchObject({ code: updatedSource });
    expect(element.shadowRoot?.querySelector('nve-copy-button')).toMatchObject({ value: updatedSource });
  });

  it('gives a property supplied before connection precedence over slotted source', async () => {
    element.source = updatedSource;
    globalThis.document.body.append(element);

    await expect.poll(() => element.shadowRoot?.querySelector('nve-code-block')).toMatchObject({ code: updatedSource });
    expect(element.shadowRoot?.querySelector('nve-copy-button')).toMatchObject({ value: updatedSource });
    expect(code.textContent).toBe(initialSource);
  });

  it('clears source with an empty string and restores the fallback only when the property is unset', async () => {
    element.source = '';
    globalThis.document.body.append(element);
    await element.updateComplete;

    expect(element.formattedSource).toBe('');
    expect(element.shadowRoot?.querySelector('nve-code-block')).toBeNull();
    expect(element.shadowRoot?.querySelector('nve-copy-button')).toMatchObject({ value: '' });

    element.source = undefined;
    await element.updateComplete;

    expect(element.shadowRoot?.querySelector('nve-code-block')).toMatchObject({ code: initialSource });
    expect(element.shadowRoot?.querySelector('nve-copy-button')).toMatchObject({ value: initialSource });
  });
});
