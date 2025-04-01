import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { audit, GlobalStateService } from '@nvidia-elements/core/internal';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';

@customElement('audit-test-element')
@audit({ excessiveInstanceLimit: 1, auditSlots: true, alternates: [{ name: 'p', use: 'span' }] })
class AuditTestElement extends LitElement {
  static readonly metadata = {
    tag: 'audit-test-element',
    version: '0.0.0',
    children: ['audit-test-element-slotted', 'p']
  };

  render() {
    return html`<slot></slot>`;
  }
}

describe('audit.controller instance tracking', () => {
  let fixture: HTMLElement;
  let originalWarn = console.warn;

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
    expect(GlobalStateService.state.audit['audit-test-element']).toBe(undefined);
  });

  it('should NOT create audit registry when element created in a production env', async () => {
    globalThis.NVE_ELEMENTS.state.env = 'production';
    expect(GlobalStateService.state.env).toBe('production');
    const elementOne = document.createElement('audit-test-element');
    fixture.appendChild(elementOne);
    await elementIsStable(elementOne);
    expect(GlobalStateService.state.audit['audit-test-element']).toBe(undefined);
  });

  it('should create audit registry when element created', async () => {
    document.createElement('audit-test-element');
    expect(GlobalStateService.state.audit['audit-test-element'].count).toBe(0);
  });

  it('should increment count when element added to DOM', async () => {
    const elementOne = document.createElement('audit-test-element');
    fixture.appendChild(elementOne);
    await elementIsStable(elementOne);
    expect(console.warn).not.toHaveBeenCalled();
    expect(GlobalStateService.state.audit['audit-test-element'].count).toBe(1);
  });

  it('should track audit instance count and warn if exceeded', async () => {
    const elementOne = document.createElement('audit-test-element');
    const elementTwo = document.createElement('audit-test-element');
    const elementThree = document.createElement('audit-test-element');
    fixture.appendChild(elementOne);
    fixture.appendChild(elementTwo);
    fixture.appendChild(elementThree);
    await elementIsStable(elementTwo);
    await elementIsStable(elementThree);

    expect(GlobalStateService.state.audit['audit-test-element'].count).toBe(3);
    expect(console.warn).toHaveBeenCalledWith(
      '@nve: Excessive rendering of 2 audit-test-element were detected in DOM. Recycle/reuse elements when possible to improve application performance.'
    );

    vi.clearAllMocks();
    elementTwo.remove();
    elementThree.remove();
    expect(GlobalStateService.state.audit['audit-test-element'].count).toBe(1);
    expect(console.warn).not.toHaveBeenCalled();
  });
});

describe('audit.controller slotted vailidation', () => {
  let element: AuditTestElement;
  let fixture: HTMLElement;
  let originalWarn = console.warn;

  beforeEach(async () => {
    console.warn = () => null;
    vi.spyOn(console, 'warn');

    fixture = await createFixture(html`
      <audit-test-element>
        <div></div>
      </audit-test-element>`);
    element = fixture.querySelector<AuditTestElement>('audit-test-element');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
    console.warn = originalWarn;
  });

  it('should validate allowed slotted elements', () => {
    expect(GlobalStateService.state.env).toBe('development');
    expect(console.warn).toHaveBeenCalledWith(
      '@nve: Invalid slotted elements detected in audit-test-element. Allowed: template, audit-test-element-slotted, p'
    );
  });
});

describe('audit.controller alternates vailidation', () => {
  let element: AuditTestElement;
  let fixture: HTMLElement;
  let originalWarn = console.warn;

  beforeEach(async () => {
    console.warn = () => null;
    vi.spyOn(console, 'warn');

    fixture = await createFixture(html`
      <audit-test-element>
        <p></p>
      </audit-test-element>`);
    element = fixture.querySelector<AuditTestElement>('audit-test-element');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
    console.warn = originalWarn;
  });

  it('should validate allowed slotted elements', () => {
    expect(GlobalStateService.state.env).toBe('development');
    expect(console.warn).toHaveBeenCalledWith('@nve: Element p found in audit-test-element, use span instead.');
  });
});
