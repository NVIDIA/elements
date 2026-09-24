// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { PreferencesInput, PreferencesInputValue } from '@nvidia-elements/core/preferences-input';
import type { SystemSettings } from './system-settings.js';
import './system-settings.js';

describe('nvd-system-settings', () => {
  let element: SystemSettings;
  let iframe: HTMLIFrameElement;

  function getClassicInput() {
    const input = element.shadowRoot?.querySelector<HTMLInputElement>('input[value="classic"]');
    if (!input) throw new Error('Expected a Classic theme input');
    return input;
  }

  async function setColorScheme(colorScheme: PreferencesInputValue['color-scheme']) {
    const preferences = element.shadowRoot?.querySelector<PreferencesInput>('nve-preferences-input');
    if (!preferences) throw new Error('Expected a preferences input');
    preferences.value = { 'color-scheme': colorScheme, 'reduced-motion': false, scale: 'default' };
    preferences.dispatchEvent(new Event('change'));
    await element.updateComplete;
  }

  beforeEach(async () => {
    localStorage.setItem('elements-sb-globals', JSON.stringify({ theme: 'dark', classic: 'classic' }));
    const link = globalThis.document.createElement('link');
    link.id = 'classic-theme-stylesheet';
    globalThis.document.head.append(link);
    element = globalThis.document.createElement('nvd-system-settings') as SystemSettings;
    globalThis.document.body.append(element);
    iframe = globalThis.document.createElement('iframe');
    globalThis.document.body.append(iframe);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
    iframe.remove();
    globalThis.document.querySelector('#classic-theme-stylesheet')?.remove();
    globalThis.document.documentElement.removeAttribute('nve-theme');
    localStorage.removeItem('elements-sb-globals');
  });

  it('should disable Classic while high contrast is selected', async () => {
    await setColorScheme('high-contrast');

    expect(getClassicInput().disabled).toBe(true);
    expect(globalThis.document.documentElement.getAttribute('nve-theme')).toBe('high-contrast');
    expect(iframe.contentDocument?.documentElement.getAttribute('nve-theme')).toBe('high-contrast');
    expect(globalThis.document.querySelector('#classic-theme-stylesheet')).toBeNull();
    expect(JSON.parse(localStorage.getItem('elements-sb-globals') ?? '{}').classic).toBe('classic');

    await setColorScheme('dark');

    expect(getClassicInput().disabled).toBe(false);
    expect(globalThis.document.documentElement.getAttribute('nve-theme')).toBe('dark classic-dark');
    expect(iframe.contentDocument?.documentElement.getAttribute('nve-theme')).toBe('dark classic-dark');
    expect(globalThis.document.querySelector('#classic-theme-stylesheet')).not.toBeNull();
  });
});
