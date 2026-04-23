// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { stateHighlighted } from '@nvidia-elements/core/internal';

@stateHighlighted<StateHighlightedControllerTestElement>()
@customElement('state-highlighted-controller-test-element')
class StateHighlightedControllerTestElement extends LitElement {
  @property({ type: Boolean }) highlighted: boolean;
  declare _internals: ElementInternals;
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 */
describe('state-highlighted.controller', () => {
  let element: StateHighlightedControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<state-highlighted-controller-test-element></state-highlighted-controller-test-element>`
    );
    element = fixture.querySelector<StateHighlightedControllerTestElement>('state-highlighted-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should apply highlighted state if highlighted property is set', async () => {
    expect(element.matches(':state(highlighted)')).toBe(false);

    element.highlighted = true;
    await elementIsStable(element);
    expect(element.matches(':state(highlighted)')).toBe(true);
  });

  it('should remove highlighted state when set to false', async () => {
    element.highlighted = true;
    await elementIsStable(element);
    expect(element.matches(':state(highlighted)')).toBe(true);

    element.highlighted = false;
    await elementIsStable(element);
    expect(element.matches(':state(highlighted)')).toBe(false);
  });

  it('should not have highlighted state when initialized without highlighted', async () => {
    await elementIsStable(element);
    expect(element.matches(':state(highlighted)')).toBe(false);
  });

  it('should toggle highlighted state on and off', async () => {
    element.highlighted = true;
    await elementIsStable(element);
    expect(element.matches(':state(highlighted)')).toBe(true);

    element.highlighted = false;
    await elementIsStable(element);
    expect(element.matches(':state(highlighted)')).toBe(false);

    element.highlighted = true;
    await elementIsStable(element);
    expect(element.matches(':state(highlighted)')).toBe(true);
  });
});
