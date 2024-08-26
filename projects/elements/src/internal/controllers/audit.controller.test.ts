import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { audit, GlobalStateService } from '@nvidia-elements/core/internal';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';

@customElement('audit-test-element')
@audit({ excessiveInstanceLimit: 1, auditSlots: true })
class AuditTestElement extends LitElement {
  static readonly metadata = {
    tag: 'audit-test-element',
    version: '0.0.0',
    children: ['audit-test-element-slotted']
  };

  render() {
    return html`<slot></slot>`;
  }
}

describe('audit.controller instance tracking', () => {
  let element: AuditTestElement;
  let fixture: HTMLElement;
  let originalWarn = console.warn;

  beforeEach(async () => {
    console.warn = () => null;
    vi.spyOn(console, 'warn');

    fixture = await createFixture(html`
      <audit-test-element></audit-test-element>
      <audit-test-element></audit-test-element>
      <audit-test-element></audit-test-element>`);
    element = fixture.querySelector<AuditTestElement>('audit-test-element');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
    console.warn = originalWarn;
  });

  it('should track audit instance count and warn if exceeded', () => {
    expect(GlobalStateService.state.env).toBe('development');
    expect(GlobalStateService.state.audit['audit-test-element'].count).toBe(3);
    expect(console.warn).toHaveBeenCalledWith(
      '@nve: Excessive rendering of 2 audit-test-element were detected in DOM. Recycle/reuse elements when possible to improve application performance.'
    );
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
      '@nve: Invalid slotted elements detected in audit-test-element. Allowed: template, audit-test-element-slotted'
    );
  });
});
