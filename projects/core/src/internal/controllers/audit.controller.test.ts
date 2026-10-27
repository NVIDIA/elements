// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GlobalStateService } from '@nvidia-elements/foundations/internal/state';
import { audit, AuditController } from '@nvidia-elements/core/internal';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/dialog/define.js';
import '@nvidia-elements/core/drawer/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/toggletip/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/tabs/define.js';
import '@nvidia-elements/core/steps/define.js';
import '@nvidia-elements/core/tree/define.js';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import { DOCS_LOG_URL } from '../utils/audit-logs.js';

@customElement('audit-controller-test-element')
@audit({ excessiveInstanceLimit: 1 })
class AuditTestElement extends LitElement {
  static readonly metadata = {
    tag: 'audit-controller-test-element',
    version: '0.0.0',
    children: ['audit-controller-test-element-slotted', 'p']
  };

  render() {
    return html`<slot></slot>`;
  }
}

@audit()
@customElement('audit-controller-test-parent-element')
class AuditTestParentElement extends LitElement {
  static readonly metadata = {
    tag: 'audit-controller-test-parent-element',
    version: '0.0.0',
    parents: ['valid-audit-controller-test-parent-element']
  };
}

@customElement('audit-controller-test-budget')
@audit({ excessiveInstanceLimit: 50 })
class TestAuditBudgetElement extends LitElement {
  static readonly metadata = { tag: 'audit-controller-test-budget', version: '0.0.0' };
}

@customElement('audit-controller-test-zero')
@audit({ excessiveInstanceLimit: 0 })
class TestAuditZeroElement extends LitElement {
  static readonly metadata = { tag: 'audit-controller-test-zero', version: '0.0.0' };
}

@customElement('audit-controller-test-manual')
class TestAuditManualElement extends LitElement {
  static readonly metadata = { tag: 'audit-controller-test-manual', version: '0.0.0' };
}

describe('audit.controller instance tracking', () => {
  let fixture: HTMLElement;
  const originalWarn = console.warn;

  beforeEach(async () => {
    globalThis.NVE_ELEMENTS.state.env = 'development';
    console.warn = () => null;
    vi.spyOn(console, 'warn');
    fixture = await createFixture(html` `);
  });

  afterEach(() => {
    globalThis.NVE_ELEMENTS.state.env = 'development';
    removeFixture(fixture);
    console.warn = originalWarn;
  });

  it('should not have audit registry by default', () => {
    expect(GlobalStateService.state.env).toBe('development');
    expect(GlobalStateService.state.audit['audit-controller-test-element']).toBe(undefined);
  });

  it('should NOT create audit registry when element created in a production env', async () => {
    globalThis.NVE_ELEMENTS.state.env = 'production';
    expect(GlobalStateService.state.env).toBe('production');
    const elementOne = document.createElement('audit-controller-test-element');
    fixture.appendChild(elementOne);
    await elementIsStable(elementOne);
    expect(GlobalStateService.state.audit['audit-controller-test-element']).toBe(undefined);
  });

  it('should create audit registry when element created', async () => {
    document.createElement('audit-controller-test-element');
    expect(GlobalStateService.state.audit['audit-controller-test-element'].count).toBe(0);
  });

  it('should increment count when element added to DOM', async () => {
    const elementOne = document.createElement('audit-controller-test-element');
    fixture.appendChild(elementOne);
    await elementIsStable(elementOne);
    expect(console.warn).not.toHaveBeenCalled();
    expect(GlobalStateService.state.audit['audit-controller-test-element'].count).toBe(1);
  });

  it('should track audit instance count and warn if exceeded', async () => {
    const elementOne = document.createElement('audit-controller-test-element');
    const elementTwo = document.createElement('audit-controller-test-element');
    const elementThree = document.createElement('audit-controller-test-element');
    fixture.appendChild(elementOne);
    fixture.appendChild(elementTwo);
    fixture.appendChild(elementThree);
    await elementIsStable(elementTwo);
    await elementIsStable(elementThree);

    expect(GlobalStateService.state.audit['audit-controller-test-element'].count).toBe(3);
    expect(console.warn).toHaveBeenCalledOnce();
    expect(console.warn).toHaveBeenCalledWith(
      `@nve: Excessive rendering of 2 audit-controller-test-element were detected in DOM. Recycle/reuse elements when possible to improve application performance. ${DOCS_LOG_URL}#excessive-instance-limit`
    );

    vi.clearAllMocks();
    elementTwo.remove();
    elementThree.remove();
    expect(GlobalStateService.state.audit['audit-controller-test-element'].count).toBe(1);
    expect(console.warn).not.toHaveBeenCalled();
  });
});

describe('audit.controller count boundaries', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    GlobalStateService.state.env = 'development';
    GlobalStateService.state.audit = {};
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    fixture = await createFixture(html` `);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  function appendInstances(count: number) {
    const elements = Array.from({ length: count }, () => document.createElement('audit-controller-test-budget'));
    fixture.append(...elements);
    return elements;
  }

  it('should warn at the first instance above the limit with the crossing count', async () => {
    const elements = appendInstances(50);
    expect(GlobalStateService.state.audit['audit-controller-test-budget'].count).toBe(50);
    expect(console.warn).not.toHaveBeenCalled();

    elements.push(...appendInstances(1));
    expect(console.warn).toHaveBeenCalledOnce();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Excessive rendering of 51 audit-controller-test-budget')
    );
    await Promise.all(elements.map(element => elementIsStable(element)));
  });

  it('should warn once when hundreds of instances connect in one batch', async () => {
    const elements = appendInstances(300);
    await Promise.all(elements.map(element => elementIsStable(element)));

    expect(GlobalStateService.state.audit['audit-controller-test-budget'].count).toBe(300);
    expect(console.warn).toHaveBeenCalledOnce();
  });

  it('should rearm only after the count returns within the limit', async () => {
    const elements = appendInstances(300);
    await Promise.all(elements.map(element => elementIsStable(element)));
    expect(console.warn).toHaveBeenCalledOnce();

    const first = elements[0];
    expect(first).toBeDefined();
    first?.remove();
    fixture.append(...elements.slice(0, 1));
    await Promise.all(elements.map(element => elementIsStable(element)));
    expect(console.warn).toHaveBeenCalledOnce();

    elements.slice(50).forEach(element => element.remove());
    expect(GlobalStateService.state.audit['audit-controller-test-budget'].count).toBe(50);
    const extra = appendInstances(1);
    await Promise.all(extra.map(element => elementIsStable(element)));
    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  it('should clean up a zero budget and rearm on reconnect', async () => {
    const element = document.createElement('audit-controller-test-zero');
    fixture.append(element);
    await elementIsStable(element);
    element.remove();
    expect(GlobalStateService.state.audit['audit-controller-test-zero'].count).toBe(0);

    fixture.append(element);
    await elementIsStable(element);
    expect(GlobalStateService.state.audit['audit-controller-test-zero'].count).toBe(1);
    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  it('should balance a connection removed before its first update and ignore duplicate callbacks', async () => {
    const element = new TestAuditManualElement();
    const controller = new AuditController(element, { excessiveInstanceLimit: 1 });
    fixture.append(element);
    const connected = controller.hostConnected();
    expect(GlobalStateService.state.audit['audit-controller-test-manual'].count).toBe(1);

    element.remove();
    controller.hostDisconnected();
    await connected;
    expect(GlobalStateService.state.audit['audit-controller-test-manual'].count).toBe(0);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should use a separate page shell warning and clean up every page', async () => {
    const pages = [document.createElement('nve-page'), document.createElement('nve-page')];
    fixture.append(...pages);
    await Promise.all(pages.map(page => elementIsStable(page)));

    expect(console.warn).toHaveBeenCalledOnce();
    expect(console.warn).toHaveBeenCalledWith(
      `@nve: Detected 2 nve-page elements. Use one nve-page as the application shell. ${DOCS_LOG_URL}#page-shell-count`
    );
    pages.forEach(page => page.remove());
    expect(GlobalStateService.state.audit['nve-page'].count).toBe(0);
  });
});

describe('audit.controller slotted validation', () => {
  let element: AuditTestElement;
  let fixture: HTMLElement;
  const originalWarn = console.warn;

  beforeEach(async () => {
    console.warn = () => null;
    vi.spyOn(console, 'warn');

    fixture = await createFixture(html`
      <audit-controller-test-element>
        <div></div>
      </audit-controller-test-element>`);
    element = fixture.querySelector<AuditTestElement>('audit-controller-test-element');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
    console.warn = originalWarn;
  });

  it('should leave slotted child validation to ESLint', async () => {
    expect(GlobalStateService.state.env).toBe('development');
    await vi.dynamicImportSettled();
    expect(console.warn).not.toHaveBeenCalled();
  });
});

describe('audit.controller parent validation', () => {
  let element: AuditTestParentElement;
  let fixture: HTMLElement;
  const originalWarn = console.warn;
  let logEvent: Promise<Event>;

  beforeEach(async () => {
    globalThis.NVE_ELEMENTS.state.env = 'development';
    console.warn = () => null;
    vi.spyOn(console, 'warn');

    logEvent = untilEvent(document, 'NVE_ELEMENTS_LOG');

    fixture = await createFixture(html`
      <div>
        <audit-controller-test-parent-element></audit-controller-test-parent-element>
      </div>`);
    element = fixture.querySelector<AuditTestParentElement>('audit-controller-test-parent-element');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
    globalThis.NVE_ELEMENTS.state.env = 'development';
    console.warn = originalWarn;
  });

  it('should validate the parent element', async () => {
    expect(GlobalStateService.state.env).toBe('development');
    await logEvent;
    expect(console.warn).toHaveBeenCalledWith(
      `@nve: Element audit-controller-test-parent-element can only be used as a direct child of valid-audit-controller-test-parent-element. ${DOCS_LOG_URL}#invalid-parent`
    );
  });
});

describe('component parent diagnostics', () => {
  let fixture: HTMLElement;

  beforeEach(async () => {
    GlobalStateService.state.env = 'development';
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    fixture = await createFixture(html` `);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('should leave layout parent contracts to ESLint', async () => {
    const tags = [
      'nve-card-header',
      'nve-card-content',
      'nve-card-footer',
      'nve-dialog-header',
      'nve-dialog-footer',
      'nve-drawer-header',
      'nve-drawer-content',
      'nve-drawer-footer',
      'nve-dropdown-header',
      'nve-dropdown-footer',
      'nve-toggletip-header',
      'nve-toggletip-footer',
      'nve-page-panel'
    ];
    const elements = tags.map(tag => document.createElement(tag));
    fixture.append(...elements);
    await Promise.all(elements.map(element => elementIsStable(element)));
    await vi.dynamicImportSettled();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should warn for dynamically created controls without their required owners', async () => {
    const tags = ['nve-menu-item', 'nve-tabs-item', 'nve-tabs-item-group', 'nve-steps-item', 'nve-tree-node'];
    const elements = tags.map(tag => document.createElement(tag));
    fixture.append(...elements);
    await Promise.all(elements.map(element => elementIsStable(element)));
    await vi.dynamicImportSettled();

    expect(console.warn).toHaveBeenCalledTimes(tags.length);
    for (const tag of tags)
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(`Element ${tag} can only be used as a direct child`)
      );
  });

  it('should check the current owner after a control moves before its first update', async () => {
    const item = document.createElement('nve-menu-item');
    const menu = document.createElement('nve-menu');
    fixture.append(item, menu);
    menu.append(item);
    await elementIsStable(menu);
    await elementIsStable(item);
    await vi.dynamicImportSettled();
    expect(console.warn).not.toHaveBeenCalled();
  });
});
