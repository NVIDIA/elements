// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';

import {
  attachInternals,
  getFlattenedDOMTree,
  getHostAnchor,
  getStringValue,
  hasAttributeValue,
  isFormElement,
  isObjectLiteral,
  onKeys,
  removeEmptyTextNode,
  setAttributeValue,
  toggleState
} from './utils.js';
import type { PopoverAnchorElement } from './utils.js';

class UtilsInternalsTestElement extends HTMLElement {
  static formAssociated = true;

  _internals?: ElementInternals;
}

if (!customElements.get('utils-internals-test-element')) {
  customElements.define('utils-internals-test-element', UtilsInternalsTestElement);
}

describe('isObjectLiteral', () => {
  it('should return true for an object literal', () => {
    const obj = { a: 1, b: 2 };
    expect(isObjectLiteral(obj)).toBe(true);
  });

  it('should return false for non object literals', () => {
    expect(isObjectLiteral(null)).toBe(false);
    expect(isObjectLiteral(undefined)).toBe(false);
    expect(isObjectLiteral(1)).toBe(false);
    expect(isObjectLiteral('string')).toBe(false);
    expect(isObjectLiteral(true)).toBe(false);
    expect(isObjectLiteral([])).toBe(false);
  });
});

describe('form internals utilities', () => {
  it('should attach internals once', () => {
    const element = document.createElement('utils-internals-test-element') as UtilsInternalsTestElement;
    const internals = attachInternals(element);

    expect(attachInternals(element)).toBe(internals);
    expect(element._internals).toBe(internals);
  });

  it('should toggle custom states', () => {
    const element = document.createElement('utils-internals-test-element') as UtilsInternalsTestElement;
    const internals = attachInternals(element);

    toggleState(internals, 'active', true);
    expect(internals.states.has('active')).toBe(true);

    toggleState(internals, 'active', false);
    expect(internals.states.has('active')).toBe(false);
  });

  it('should identify form elements', () => {
    expect(isFormElement(document.createElement('form'))).toBe(true);
    expect(isFormElement(document.createElement('div'))).toBe(false);
    expect(isFormElement(null)).toBe(false);
  });
});

describe('dom tree utilities', () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
      fixture = undefined;
    }
  });

  it('should flatten element children', async () => {
    fixture = await createFixture(html`
      <div id="root">
        <section id="section">
          <button id="button" aria-label="test"></button>
        </section>
      </div>
    `);

    expect(getFlattenedDOMTree(fixture).map(element => element.id)).toEqual(['root', 'section', 'button']);
  });

  it('should flatten document children', async () => {
    fixture = await createFixture(html`<div id="document-child"></div>`);

    expect(getFlattenedDOMTree(document).some(element => element.id === 'document-child')).toBe(true);
  });

  it('should flatten shadow root children', () => {
    const host = document.createElement('div');
    host.attachShadow({ mode: 'open' });
    host.shadowRoot!.innerHTML = '<span id="shadow-child"><span id="shadow-descendant"></span></span>';

    expect(getFlattenedDOMTree(host).map(element => element.id)).toEqual(['shadow-child', 'shadow-descendant']);
  });

  it('should flatten assigned slot children', () => {
    const host = document.createElement('div');
    const child = document.createElement('span');
    host.attachShadow({ mode: 'open' });
    host.shadowRoot!.innerHTML = '<slot></slot>';
    child.id = 'slotted-child';
    host.appendChild(child);

    expect(getFlattenedDOMTree(host.shadowRoot!).map(element => element.id)).toContain('slotted-child');
  });

  it('should flatten fallback slot children', () => {
    const host = document.createElement('div');
    host.attachShadow({ mode: 'open' });
    host.shadowRoot!.innerHTML = '<slot><span id="fallback-child"></span></slot>';

    expect(getFlattenedDOMTree(host.shadowRoot!).map(element => element.id)).toContain('fallback-child');
  });

  it('should resolve popover host anchors', async () => {
    fixture = await createFixture(html`
      <div>
        <button id="anchor" aria-label="anchor"></button>
        <div id="host"></div>
      </div>
    `);
    const anchor = fixture.querySelector<HTMLElement>('#anchor')!;
    const host = fixture.querySelector<PopoverAnchorElement>('#host')!;

    host.anchor = 'anchor';
    expect(getHostAnchor(host)).toBe(anchor);

    host.anchor = anchor;
    expect(getHostAnchor(host)).toBe(anchor);

    host.anchor = undefined;
    host._activeTrigger = anchor;
    expect(getHostAnchor(host)).toBe(anchor);
  });

  it('should fall back to body for unresolved popover host anchors', () => {
    const host = document.createElement('div') as PopoverAnchorElement;
    host.anchor = 'missing';
    document.body.appendChild(host);

    expect(getHostAnchor(host)).toBe(document.body);
    host.remove();
  });

  it('should fall back to body for detached popover host string anchors', () => {
    const host = document.createElement('div') as PopoverAnchorElement;
    host.anchor = 'missing';

    expect(getHostAnchor(host)).toBe(document.body);
  });

  it('should remove empty text nodes', () => {
    const parent = document.createElement('div');
    const emptyText = document.createTextNode('  ');
    const separator = document.createElement('span');
    const text = document.createTextNode('label');
    parent.append(emptyText, separator, text);

    removeEmptyTextNode(emptyText);
    removeEmptyTextNode(text);

    expect(parent.childNodes.length).toBe(2);
    expect(parent.childNodes[0]).toBe(separator);
    expect(parent.childNodes[1]).toBe(text);
  });
});

describe('event and value utilities', () => {
  it('should normalize string values', () => {
    expect(getStringValue('value')).toBe('value');
    expect(getStringValue('')).toBe('');
    expect(getStringValue(1)).toBe(null);
    expect(getStringValue(null)).toBe(null);
  });

  it('should call a callback when the keyboard event matches', () => {
    const callback = vi.fn();

    onKeys(['Enter', 'Space'], new KeyboardEvent('keyup', { code: 'Enter' }), callback);
    onKeys(['Enter', 'Space'], new KeyboardEvent('keyup', { code: 'KeyA' }), callback);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('attribute utilities', () => {
  it('should test attribute values', () => {
    const element = document.createElement('div');

    expect(hasAttributeValue(element, 'data-state', null)).toBe(true);

    element.setAttribute('data-state', '');
    expect(hasAttributeValue(element, 'data-state', '')).toBe(true);
    expect(hasAttributeValue(element, 'data-state', null)).toBe(false);

    element.setAttribute('data-state', 'active');
    expect(hasAttributeValue(element, 'data-state', 'active')).toBe(true);
    expect(hasAttributeValue(element, 'data-state', 'inactive')).toBe(false);
  });

  it('should set and remove attribute values', () => {
    const element = document.createElement('div');

    setAttributeValue(element, 'data-state', 'active');
    expect(element.getAttribute('data-state')).toBe('active');

    setAttributeValue(element, 'data-state', '');
    expect(element.getAttribute('data-state')).toBe('');

    setAttributeValue(element, 'data-state', null);
    expect(element.hasAttribute('data-state')).toBe(false);
  });
});
