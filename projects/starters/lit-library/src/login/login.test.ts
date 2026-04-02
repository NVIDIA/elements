// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { DomainLogin } from 'lit-library-starter/login';
import 'lit-library-starter/login/define.js';

describe('domain-login', () => {
  let fixture: HTMLElement;
  let element: DomainLogin;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <domain-login></domain-login>
    `);
    element = fixture.querySelector('domain-login') as DomainLogin;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', async () => {
    await elementIsStable(element);
    expect(customElements.get('domain-login')).toBeDefined();
  });

  it('should initialize values to internal controls', async () => {
    expect(element.value).toBe('{ "email": "", "password": "" }');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=email]')?.value).toBe('');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=password]')?.value).toBe('');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=checkbox]')?.value).toBe('on');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=checkbox]')?.checked).toBe(false);

    element.value = '{ "email": "test@nvidia.com", "password": "", "remember": true }';
    await elementIsStable(element);

    expect(element.value).toBe('{ "email": "test@nvidia.com", "password": "", "remember": true }');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=email]')?.value).toBe('test@nvidia.com');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=password]')?.value).toBe('');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=checkbox]')?.value).toBe('on');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=checkbox]')?.checked).toBe(true);
  });

  it('should initialize the validity state', async () => {
    await elementIsStable(element);
    expect(element.validity.valid).toBe(false);
    expect(element.validity.valueMissing).toBe(true);
    expect(element.validity.patternMismatch).toBe(false);
  });

  it('should update validity state', async () => {
    await elementIsStable(element);
    expect(element.validity.valid).toBe(false);
    expect(element.validity.patternMismatch).toBe(false);

    element.value = '{ "email": "test@test.com", "password": "" }';
    await elementIsStable(element);
    element.checkValidity();

    expect(element.validity.valid).toBe(false);
    expect(element.validity.patternMismatch).toBe(true);
  });
});
