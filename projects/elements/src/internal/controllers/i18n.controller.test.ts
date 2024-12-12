import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { i18n, I18nController } from '@nvidia-elements/core/internal';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';

@i18n<I18nTestElement>()
@customElement('i18n-test-element')
class I18nTestElement extends LitElement {
  #i18nController: I18nController<this> = new I18nController<this>(this);

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

    expect(element.i18n).toStrictEqual({
      __set: false,
      close: 'close',
      currentPage: 'current page',
      expand: 'expand',
      select: 'select',
      selected: 'selected',
      sort: 'sort',
      show: 'show',
      hide: 'hide',
      loading: 'loading',
      previous: 'previous',
      next: 'next',
      start: 'start',
      end: 'end',
      noResults: 'no results',
      status: 'status',
      information: 'information',
      warning: 'warning',
      success: 'success',
      danger: 'danger',
      trend: 'trend',
      down: 'down',
      up: 'up',
      neutral: 'neutral',
      copy: 'copy',
      copied: 'copied',
      of: 'of'
    });
  });

  it('should merge global default and element instance override', async () => {
    element.i18n = { close: 'close override' };
    await elementIsStable(element);

    expect(element.i18n).toStrictEqual({
      __set: true,
      close: 'close override',
      currentPage: 'current page',
      expand: 'expand',
      select: 'select',
      selected: 'selected',
      sort: 'sort',
      show: 'show',
      hide: 'hide',
      loading: 'loading',
      previous: 'previous',
      next: 'next',
      start: 'start',
      end: 'end',
      noResults: 'no results',
      status: 'status',
      information: 'information',
      warning: 'warning',
      success: 'success',
      danger: 'danger',
      trend: 'trend',
      down: 'down',
      up: 'up',
      neutral: 'neutral',
      copy: 'copy',
      copied: 'copied',
      of: 'of'
    });
  });
});
