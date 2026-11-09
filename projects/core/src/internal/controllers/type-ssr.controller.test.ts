// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { TypeSSRController } from './type-ssr.controller.js';

class SSRTestHost extends LitElement {
  renderOptions = { host: this };
  _internals = this.attachInternals();
  update() {
    super.update(new Map());
  }
  render() {
    return html`<slot></slot><span>rendered</span>`;
  }
}
const tag = 'nve-ssr-controller-test-host';
if (!customElements.get(tag)) customElements.define(tag, SSRTestHost);

describe('TypeSSRController', () => {
  let fixture: HTMLElement;
  let host: SSRTestHost;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = document.createElement(tag) as SSRTestHost;
    fixture.append(host);
    await elementIsStable(host);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    removeFixture(fixture);
  });

  it('leaves successful updates intact and returns the original update method', () => {
    const update = vi.spyOn(host, 'update').mockImplementation(() => {});
    const controller = new TypeSSRController(host, { log: false });
    expect(controller.didSSR).toBe(true);
    expect(host.update()).toBe(update);
    expect(update).toHaveBeenCalledOnce();
  });

  it('recovers a failed hydration render and emits slotchange only once', () => {
    const serverHost = document.createElement(tag) as SSRTestHost;
    const root = serverHost.attachShadow({ mode: 'open' });
    root.innerHTML = '<!--lit-part server--><span>server content</span>';
    Object.defineProperty(serverHost, 'renderRoot', { value: root });
    vi.spyOn(serverHost, 'update').mockImplementation(() => {
      throw new Error('hydration mismatch');
    });
    const controller = new TypeSSRController(serverHost, { log: false });
    serverHost.update();
    expect(root.textContent).toContain('rendered');
    const slot = root.querySelector('slot');
    if (!slot) throw new Error('Expected slot');
    const changed = vi.fn();
    slot.addEventListener('slotchange', changed);
    serverHost._internals.role = 'group';
    controller.hostUpdated();
    controller.hostUpdated();
    expect(changed).toHaveBeenCalledOnce();
    expect(serverHost.getAttribute('role')).toBe('group');
  });

  it('does not wrap a host with no existing shadow root', () => {
    const fresh = document.createElement(tag) as SSRTestHost;
    const original = fresh.update;
    const controller = new TypeSSRController(fresh, { log: false });
    expect(controller.didSSR).toBe(false);
    expect(fresh.update).toBe(original);
  });
});
