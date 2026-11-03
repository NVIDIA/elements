// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { popoverStyles, useStyles } from '@nvidia-elements/core/internal';

@customElement('popover-styles-position-area-test-element')
class PopoverStylesPositionAreaTestElement extends LitElement {
  @property({ type: String, reflect: true }) position = 'top';

  static styles = useStyles([popoverStyles]);

  render() {
    return html`<div internal-host></div>`;
  }
}

function adoptedStyleText(element: LitElement) {
  return element
    .shadowRoot!.adoptedStyleSheets.flatMap(sheet => Array.from(sheet.cssRules))
    .map(rule => rule.cssText)
    .join('\n');
}

describe('popover styles', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should position with native position-area in the target browser', async () => {
    expect(CSS.supports('position-area', 'top')).toBe(true);
    expect(CSS.supports('inset-area', 'top')).toBe(false);

    fixture = await createFixture(
      html`<popover-styles-position-area-test-element></popover-styles-position-area-test-element>`
    );
    const element = fixture.querySelector<PopoverStylesPositionAreaTestElement>(
      'popover-styles-position-area-test-element'
    )!;
    await elementIsStable(element);

    const css = adoptedStyleText(element);
    expect(css).toContain('position-area: center top');
    expect(css).not.toContain('inset-area');

    const positionArea = (getComputedStyle(element) as CSSStyleDeclaration & { positionArea: string }).positionArea;
    expect(positionArea).toBe('center top');
  });
});
