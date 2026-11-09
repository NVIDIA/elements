// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { colorStateStyles, statusStateStyles, supportStateStyles } from './index.js';

describe('state styles', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
  });

  afterEach(() => removeFixture(fixture));

  it.each([
    {
      name: 'color',
      styles: colorStateStyles,
      attribute: 'color',
      value: 'red-cardinal',
      property: '--state-color-base',
      token: '--nve-ref-color-red-cardinal-1100'
    },
    {
      name: 'status',
      styles: statusStateStyles,
      attribute: 'status',
      value: 'scheduled',
      property: '--status-color',
      token: '--nve-sys-status-scheduled-color'
    },
    {
      name: 'support',
      styles: supportStateStyles,
      attribute: 'status',
      value: 'success',
      property: '--status-color',
      token: '--nve-sys-support-success-emphasis-color'
    }
  ])('exports usable $name state styles', ({ styles, attribute, value, property, token }) => {
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    root.adoptedStyleSheets = [sheet];
    host.style.setProperty(token, 'rgb(10, 20, 30)');
    host.setAttribute(attribute, value);
    fixture.append(host);

    expect(getComputedStyle(host).getPropertyValue(property).trim()).toBe('rgb(10, 20, 30)');
  });
});
