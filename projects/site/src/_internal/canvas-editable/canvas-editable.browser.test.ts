// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PackagesService } from '@internals/tools/packages';
import type { Iframe } from '@nvidia-elements/core/iframe';
import { CanvasEditable } from './canvas-editable.js';

vi.mock('@internals/tools/packages', () => ({ PackagesService: { versions: vi.fn() } }));
vi.mock('@internals/tools/playground', () => ({ PlaygroundService: { create: vi.fn() } }));

describe('nvd-canvas-editable', () => {
  let element: CanvasEditable;
  let initialTheme: string | null;

  function preview() {
    const component = element.shadowRoot?.querySelector<Iframe>('nve-iframe');
    const iframe = component?.shadowRoot?.querySelector('iframe');
    if (!component || !iframe) throw new Error('Expected an iframe preview');
    return { component, iframe };
  }

  async function mount() {
    globalThis.document.body.append(element);
    await element.updateComplete;
    await expect.poll(() => preview().iframe.srcdoc).toContain(element.source);
  }

  function setTheme(theme: string) {
    globalThis.document.documentElement.setAttribute('nve-theme', theme);
    globalThis.document.dispatchEvent(new CustomEvent('nve-theme-change', { detail: { theme } }));
  }

  beforeEach(() => {
    vi.spyOn(PackagesService, 'versions').mockResolvedValue({
      '@nvidia-elements/core': '0.0.0',
      '@nvidia-elements/styles': '0.0.0',
      '@nvidia-elements/themes': '0.0.0',
      '@nvidia-elements/code': '0.0.0',
      '@nvidia-elements/cli': '0.0.0',
      '@nvidia-elements/lint': '0.0.0',
      '@nvidia-elements/forms': '0.0.0',
      '@nvidia-elements/markdown': '0.0.0',
      '@nvidia-elements/monaco': '0.0.0'
    });
    initialTheme = globalThis.document.documentElement.getAttribute('nve-theme');
    setTheme('light');
    element = new CanvasEditable();
    element.source = '<p>Initial preview</p>';
  });

  afterEach(() => {
    element.remove();
    if (initialTheme === null) globalThis.document.documentElement.removeAttribute('nve-theme');
    else globalThis.document.documentElement.setAttribute('nve-theme', initialTheme);
    vi.restoreAllMocks();
  });

  it('updates isolated content from source and editor events', async () => {
    await mount();
    for (const permission of ['allow-scripts', 'allow-modals', 'allow-forms', 'allow-popups']) {
      expect(preview().iframe.sandbox.contains(permission)).toBe(true);
    }
    expect(preview().iframe.sandbox.contains('allow-same-origin')).toBe(globalThis.location.hostname === 'localhost');
    element.source = '<p>Replacement</p>';
    await expect.poll(() => preview().iframe.srcdoc).toContain('Replacement');
    const editor = element.shadowRoot?.querySelector('nve-monaco-input');
    if (!editor) throw new Error('Expected the editor');
    for (const type of ['input', 'change']) {
      editor.value = `<p>${type}</p>`;
      editor.dispatchEvent(new Event(type));
      await expect.poll(() => preview().iframe.srcdoc).toContain(`<p>${type}</p>`);
    }
  });

  it('keeps body scripts inert in the parent document', async () => {
    let executed = false;
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.data === 'canvas-preview-executed' && event.source === preview().iframe.contentWindow) {
        executed = true;
      }
    };
    globalThis.window.addEventListener('message', handleMessage);
    try {
      element.source =
        '<script>document.body.setAttribute("data-preview-script", "executed");window.parent.postMessage("canvas-preview-executed", "*");</script>';
      await mount();
      await expect.poll(() => executed).toBe(true);
      expect(globalThis.document.body.hasAttribute('data-preview-script')).toBe(false);
      expect(preview().iframe.contentDocument !== null).toBe(globalThis.location.hostname === 'localhost');
    } finally {
      globalThis.window.removeEventListener('message', handleMessage);
    }
  });

  it('bridges themes across the shadow root and updates Classic resources', async () => {
    await mount();
    expect(preview().iframe.srcdoc).toContain('nve-theme="light"');
    const original = preview().iframe.srcdoc;
    setTheme('dark');
    await expect.poll(() => preview().component.getAttribute('nve-theme')).toBe('dark');
    expect(preview().iframe.srcdoc).toBe(original);
    setTheme('dark classic-dark');
    await expect.poll(() => preview().iframe.srcdoc).toContain('id="classic-theme-stylesheet"');
    setTheme('high-contrast');
    await expect.poll(() => preview().iframe.srcdoc).not.toContain('id="classic-theme-stylesheet"');
    element.remove();
    setTheme('light classic');
    await mount();
    expect(preview().component.getAttribute('nve-theme')).toBe('light classic');
  });

  it.each([false, true])('preserves viewport dimensions with horizontal layout %s', async horizontal => {
    element.horizontalLayout = horizontal;
    await mount();
    await expect.poll(() => preview().iframe.getBoundingClientRect().height).toBe(400);
    element.style.setProperty('--height', '240px');
    await expect.poll(() => preview().iframe.getBoundingClientRect().height).toBe(240);
    const handle = element.shadowRoot?.querySelector('nve-resize-handle');
    if (!handle) throw new Error('Expected a resize handle');
    handle.value = 350;
    handle.dispatchEvent(new Event('input'));
    await element.updateComplete;
    expect(preview().iframe.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(
      element.shadowRoot?.querySelector(horizontal ? '.preview' : '.preview-wrapper')?.getAttribute('style')
    ).toContain('350px');
  });

  it('keeps readonly examples inline except for popover examples', async () => {
    element.readonly = true;
    globalThis.document.body.append(element);
    await element.updateComplete;
    expect(element.shadowRoot?.querySelector('nve-iframe')).toBeNull();
    expect(element.shadowRoot?.querySelector('.preview p')?.textContent).toBe('Initial preview');
    element.tag = 'nve-dialog';
    await expect.poll(() => preview().iframe.srcdoc).toContain('Initial preview');
  });
});
