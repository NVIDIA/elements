// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { define } from '@nvidia-elements/core/internal';
import { scope } from './index.js';

export class TestTwoElement extends LitElement {
  static metadata = {
    tag: 'test-element',
    version: ''
  };
}

export class TestElement extends LitElement {
  static metadata = {
    tag: 'test-element',
    version: ''
  };

  static elementDefinitions = {
    'nve-test-two': TestTwoElement
  };
}

scope(TestTwoElement);
define(TestTwoElement);

describe('scoped element', () => {
  let fixture: HTMLElement;
  let element: TestElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<test-element></test-element>`);
    element = fixture.querySelector('test-element');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('test-element')).toBeDefined();
  });

  it('should have static defined dependencies', () => {
    expect(TestElement.elementDefinitions['nve-test-two']).toBe(TestTwoElement);
  });
});
