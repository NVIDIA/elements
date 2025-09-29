import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { auditSlots, auditParentElement } from './audit.js';
import { createFixture, removeFixture } from '@nvidia-elements/testing';

@customElement('audit-test-element')
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

@customElement('audit-test-parent-element')
class AuditTestParentElement extends LitElement {
  static readonly metadata = {
    tag: 'audit-test-parent-element',
    version: '0.0.0',
    parents: ['valid-audit-test-parent-element']
  };
}

describe('audit', () => {
  let fixture: HTMLElement;
  let element: AuditTestElement;
  let parent: AuditTestParentElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <audit-test-parent-element>
      <audit-test-element><p></p></audit-test-element>
    </audit-test-parent-element>`);
    element = fixture.querySelector('audit-test-element') as AuditTestElement;
    parent = fixture.querySelector('audit-test-parent-element') as AuditTestParentElement;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('auditSlots should return invalid elements and valid elements', () => {
    const [invalidElements, validElements] = auditSlots(
      element as unknown as HTMLElement & {
        constructor: { metadata?: { children?: string[]; disallowedChildren?: string[] } };
      }
    );
    expect(invalidElements.length).toBe(0);
    expect(validElements).toEqual(['template', 'audit-test-element-slotted', 'p']);
  });

  it('auditParentElement should return parent elements', () => {
    const [valid, validParents] = auditParentElement(
      parent as unknown as HTMLElement & { constructor: { metadata?: { parents?: string[] } } }
    );
    expect(valid).toBe(false);
    expect(validParents[0]).toBe('valid-audit-test-parent-element');
  });
});
