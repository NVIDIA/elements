// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { stateExpanded } from '@nvidia-elements/core/internal';

@stateExpanded<StateExpandedControllerTestElement>()
@customElement('state-expanded-controller-test-element')
class StateExpandedControllerTestElement extends LitElement {
  @property({ type: Boolean }) expanded: boolean;
  @property({ type: Boolean }) readonly: boolean;
  declare _internals: ElementInternals;
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 */
describe('state-expanded.controller', () => {
  let element: StateExpandedControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<state-expanded-controller-test-element></state-expanded-controller-test-element>`
    );
    element = fixture.querySelector<StateExpandedControllerTestElement>('state-expanded-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should initialize aria-expanded as null', async () => {
    await elementIsStable(element);
    expect(element._internals.ariaExpanded).toBe(null);
    expect(element.matches(':state(expanded)')).toBe(false);
  });

  it('should initialize aria-expanded as null if expanded not applied', async () => {
    await elementIsStable(element);
    expect(element._internals.ariaExpanded).toBe(null);
    expect(element.matches(':state(expanded)')).toBe(false);
  });

  it('should initialize aria-expanded as true if expanded applied', async () => {
    element.expanded = true;
    await elementIsStable(element);
    expect(element._internals.ariaExpanded).toBe('true');
    expect(element.matches(':state(expanded)')).toBe(true);
  });

  it('should initialize aria-expanded as false if expanded=false is applied', async () => {
    element.expanded = false;
    await elementIsStable(element);
    expect(element._internals.ariaExpanded).toBe('false');
    expect(element.matches(':state(expanded)')).toBe(false);
  });

  it('should remove aria-expanded if readonly', async () => {
    element.expanded = true;
    await elementIsStable(element);
    expect(element._internals.ariaExpanded).toBe('true');
    expect(element.matches(':state(expanded)')).toBe(true);

    element.readonly = true;
    await elementIsStable(element);
    expect(element._internals.ariaExpanded).toBe(null);
    expect(element.matches(':state(expanded)')).toBe(false);
  });
});
