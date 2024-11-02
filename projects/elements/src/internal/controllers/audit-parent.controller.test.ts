import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { auditParent, GlobalStateService } from '@nvidia-elements/core/internal';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';

@customElement('audit-test-parent-element')
@auditParent()
class AuditTestParentElement extends LitElement {
  static readonly metadata = {
    tag: 'audit-test-parent-element',
    version: '0.0.0',
    parent: ['valid-audit-test-parent-element']
  };
}

describe('audit-parent.controller validation', () => {
  let element: AuditTestParentElement;
  let fixture: HTMLElement;
  let originalWarn = console.warn;

  beforeEach(async () => {
    globalThis.NVE_ELEMENTS.state.env = 'development';
    console.warn = () => null;
    vi.spyOn(console, 'warn');

    fixture = await createFixture(html`
      <div>
        <audit-test-parent-element></audit-test-parent-element>
      </div>`);
    element = fixture.querySelector<AuditTestParentElement>('audit-test-parent-element');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
    globalThis.NVE_ELEMENTS.state.env = 'development';
    console.warn = originalWarn;
  });

  it('should validate allowed slotted elements', () => {
    expect(GlobalStateService.state.env).toBe('development');
    expect(console.warn).toHaveBeenCalledWith(
      '@nve: Element audit-test-parent-element can only be used as a direct child of valid-audit-test-parent-element.'
    );
  });
});

describe('audit-parent.controller production', () => {
  let fixture: HTMLElement;
  let originalWarn = console.warn;

  beforeEach(async () => {
    globalThis.NVE_ELEMENTS.state.env = 'production';
    console.warn = () => null;
    vi.spyOn(console, 'warn');
    fixture = await createFixture(html``);
  });

  afterEach(() => {
    removeFixture(fixture);
    globalThis.NVE_ELEMENTS.state.env = 'development';
    console.warn = originalWarn;
  });

  it('should not validate when in production', async () => {
    expect(GlobalStateService.state.env).toBe('production');
    const element = document.createElement('audit-test-parent-element');
    fixture.appendChild(element);
    await elementIsStable(element);
    expect(console.warn).not.toHaveBeenCalled();
  });
});
