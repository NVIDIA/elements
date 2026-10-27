// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { attachInternals } from '@nvidia-elements/foundations/internal/a11y';

@customElement('element-internals-test-element')
class ElementInternalsTestElement extends LitElement {
  declare _internals: ElementInternals;

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
  }
}

describe('attachInternals', () => {
  let element: ElementInternalsTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<element-internals-test-element></element-internals-test-element>`);
    element = fixture.querySelector('element-internals-test-element') as ElementInternalsTestElement;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should attach an instance of element internals to a custom element', async () => {
    expect(element._internals).toBeDefined();
  });

  it('should prevent a element internals from being called multiple times', async () => {
    attachInternals(element); // should not throw if called multiple times
    expect(element._internals).toBeDefined();
  });
});
