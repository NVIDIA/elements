// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { i18n, I18nController, I18nService, type I18nDefaults } from '@nvidia-elements/foundations/internal/i18n';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';

const i18nDefaults = {
  close: 'close',
  previous: 'previous'
} satisfies I18nDefaults;

@i18n<I18nTestElement>()
@customElement('i18n-test-element')
class I18nTestElement extends LitElement {
  #i18nController: I18nController<this> = new I18nController<this>(this, i18nDefaults);

  @property({ type: Object }) i18n = this.#i18nController.i18n;

  render() {
    return html`${JSON.stringify(this.i18n, null, 2)}`;
  }
}

describe('i18n.controller', () => {
  let element: I18nTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<i18n-test-element></i18n-test-element>`);
    element = fixture.querySelector<I18nTestElement>('i18n-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should initialize i18n state', async () => {
    await elementIsStable(element);

    expect(element.i18n).toMatchObject({
      __set: false,
      close: 'close',
      previous: 'previous'
    });
  });

  it('should update i18n when global NVE_ELEMENTS_I18N_UPDATE event is dispatched', async () => {
    await elementIsStable(element);
    const initialI18n = { ...element.i18n };

    document.dispatchEvent(new Event('NVE_ELEMENTS_I18N_UPDATE'));
    await elementIsStable(element);

    expect(element.i18n.__set).toBe(true);
    expect(element.i18n.close).toBe(initialI18n.close);
  });

  it('should merge global default and element instance override', async () => {
    element.i18n = { close: 'close override' };
    await elementIsStable(element);

    expect(element.i18n).toMatchObject({
      __set: true,
      close: 'close override',
      previous: 'previous'
    });
  });

  it('should preserve global translations when a component registers defaults', async () => {
    I18nService.update({ close: 'fermer' });
    const translatedFixture = await createFixture(html`<i18n-test-element></i18n-test-element>`);
    try {
      const translatedElement = translatedFixture.querySelector<I18nTestElement>('i18n-test-element');
      await elementIsStable(translatedElement);

      expect(translatedElement.i18n.close).toBe('fermer');
      expect(I18nService.i18n.close).toBe('fermer');
    } finally {
      removeFixture(translatedFixture);
      I18nService.update({ close: 'close' });
    }
  });
});
