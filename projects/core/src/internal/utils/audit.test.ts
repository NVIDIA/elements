// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { auditSlots, auditParentElement } from './audit.js';
import { createFixture, removeFixture } from '@internals/testing';

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

@customElement('audit-test-filter-element')
class AuditTestFilterElement extends LitElement {
  static readonly metadata = {
    tag: 'audit-test-filter-element',
    version: '0.0.0',
    children: ['p', 1]
  };

  render() {
    return html`<slot></slot>`;
  }
}

@customElement('audit-test-no-metadata-element')
class AuditTestNoMetadataElement extends LitElement {
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

@customElement('valid-audit-test-parent-element')
class ValidAuditTestParentElement extends LitElement {}

describe('audit', () => {
  let fixture: HTMLElement;
  let element: AuditTestElement;
  let parent: AuditTestParentElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <audit-test-parent-element>
      <audit-test-element>
        <p nve-text="body"></p>
        <span></span>
      </audit-test-element>
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
    expect(invalidElements.map(e => e.localName)).toEqual(['span']);
    expect(validElements).toEqual(['template', 'audit-test-element-slotted', 'p']);
  });

  it('auditSlots should filter non-string child metadata', async () => {
    const filterFixture = await createFixture(html`
      <audit-test-filter-element>
        <p nve-text="body"></p>
        <span></span>
      </audit-test-filter-element>
    `);
    const filterElement = filterFixture.querySelector('audit-test-filter-element') as AuditTestFilterElement;

    const [invalidElements, validElements] = auditSlots(
      filterElement as unknown as HTMLElement & {
        constructor: { metadata?: { children?: string[]; disallowedChildren?: string[] } };
      }
    );

    expect(invalidElements.map(e => e.localName)).toEqual(['span']);
    expect(validElements).toEqual(['template', 'p']);
    removeFixture(filterFixture);
  });

  it('auditSlots should default to template when child metadata is missing', async () => {
    const noMetadataFixture = await createFixture(html`
      <audit-test-no-metadata-element>
        <template></template>
        <p nve-text="body"></p>
      </audit-test-no-metadata-element>
    `);
    const noMetadataElement = noMetadataFixture.querySelector(
      'audit-test-no-metadata-element'
    ) as AuditTestNoMetadataElement;

    const [invalidElements, validElements] = auditSlots(
      noMetadataElement as unknown as HTMLElement & {
        constructor: { metadata?: { children?: string[]; disallowedChildren?: string[] } };
      }
    );

    expect(invalidElements.map(e => e.localName)).toEqual(['p']);
    expect(validElements).toEqual(['template']);
    removeFixture(noMetadataFixture);
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
