// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { auditParentElement } from './audit.js';
import { createFixture, removeFixture } from '@internals/testing';

@customElement('audit-test-parent-element')
class AuditTestParentElement extends LitElement {
  static readonly metadata = {
    tag: 'audit-test-parent-element',
    version: '0.0.0',
    parents: ['valid-audit-test-parent-element']
  };
}

@customElement('valid-audit-test-parent-element')
class ValidAuditTestParentElement extends LitElement {
  render() {
    return html`<slot></slot>`;
  }
}

@customElement('audit-forwarded-test-element')
class AuditForwardedTestElement extends LitElement {
  render() {
    return html`<valid-audit-test-parent-element><slot></slot></valid-audit-test-parent-element>`;
  }
}

@customElement('audit-forwarded-slots-test-element')
class AuditForwardedSlotsTestElement extends LitElement {
  render() {
    return html`<div><slot></slot></div>`;
  }
}

describe('audit', () => {
  let fixture: HTMLElement;
  let parent: AuditTestParentElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<audit-test-parent-element></audit-test-parent-element>`);
    parent = fixture.querySelector('audit-test-parent-element') as AuditTestParentElement;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('auditParentElement should return parent elements', () => {
    const [valid, validParents] = auditParentElement(
      parent as unknown as HTMLElement & { constructor: { metadata?: { parents?: string[] } } }
    );
    expect(valid).toBe(false);
    expect(validParents[0]).toBe('valid-audit-test-parent-element');
  });

  it('auditParentElement should accept a valid parent element', async () => {
    const parentFixture = await createFixture(html`
      <valid-audit-test-parent-element>
        <audit-test-parent-element></audit-test-parent-element>
      </valid-audit-test-parent-element>
    `);
    const validParent = parentFixture.querySelector('valid-audit-test-parent-element') as ValidAuditTestParentElement;
    const child = parentFixture.querySelector('audit-test-parent-element') as AuditTestParentElement;

    const [valid, validParents] = auditParentElement(
      child as unknown as HTMLElement & { constructor: { metadata?: { parents?: string[] } } }
    );

    expect(valid).toBe(true);
    expect(child.parentElement).toBe(validParent);
    expect(validParents).toEqual(['valid-audit-test-parent-element']);
    removeFixture(parentFixture);
  });

  it('auditParentElement should accept elements without parent metadata', () => {
    const [valid, validParents] = auditParentElement(
      document.createElement('div') as HTMLElement & { constructor: { metadata?: { parents?: string[] } } }
    );

    expect(valid).toBe(true);
    expect(validParents).toEqual([]);
  });
});

describe('audit forwarded content', () => {
  let fixture: HTMLElement;

  afterEach(() => removeFixture(fixture));

  it('accepts a valid immediate slot parent without changing physical ownership', async () => {
    fixture = await createFixture(
      html`<audit-forwarded-test-element><audit-test-parent-element></audit-test-parent-element></audit-forwarded-test-element>`
    );
    const child = fixture.querySelector<AuditTestParentElement>('audit-test-parent-element')!;
    const [valid] = auditParentElement(
      child as AuditTestParentElement & { constructor: typeof AuditTestParentElement }
    );
    expect(valid).toBe(true);
    expect(child.parentElement?.localName).toBe('audit-forwarded-test-element');
    expect(child.assignedSlot?.parentElement?.localName).toBe('valid-audit-test-parent-element');
  });

  it('rejects an invalid immediate slot parent', async () => {
    fixture = await createFixture(
      html`<audit-forwarded-slots-test-element><audit-test-parent-element></audit-test-parent-element></audit-forwarded-slots-test-element>`
    );
    const child = fixture.querySelector<AuditTestParentElement>('audit-test-parent-element')!;
    const [valid] = auditParentElement(
      child as AuditTestParentElement & { constructor: typeof AuditTestParentElement }
    );
    expect(valid).toBe(false);
  });
});
