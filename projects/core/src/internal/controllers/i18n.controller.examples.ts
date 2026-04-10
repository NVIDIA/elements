// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { I18nController } from '@nvidia-elements/core/internal';
import { I18nService } from '@nvidia-elements/core';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';

export default {
  title: 'Internal/Controllers'
}

class I18nItem extends LitElement {
  #i18nController: I18nController<this> = new I18nController<this>(this);
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  render() {
    return html`<nve-card><pre style="padding: 24px">${JSON.stringify(this.i18n, null, 2)}</pre></nve-card>`
  }
}
customElements.get('i18n-item') || customElements.define('i18n-item', I18nItem);

class I18nDemo extends LitElement {
  render() {
    return html`
    <div nve-layout="column gap:md">
      <div nve-layout="row gap:sm">
        <nve-button @click=${() => this.#english()}>English</nve-button>
        <nve-button @click=${() => this.#french()}>French</nve-button>
      </div>
      
      <div nve-layout="grid span-items:6 gap:sm">
        <i18n-item .i18n=${{ "close": "dismiss task failure warning" }}></i18n-item>
        <i18n-item></i18n-item>
      </div>
    </div>
    `
  }

  createRenderRoot() {
    return this;
  }

  #french() {
    I18nService.update({
      close: 'fermer',
      expand: 'étendre',
      sort: 'classer',
      show: 'montrer',
      hide: 'cacher',
      loading: 'bourrage'
    });
  }

  #english() {
    I18nService.update({
      close: 'close',
      expand: 'expand',
      sort: 'sort',
      show: 'show',
      hide: 'hide',
      loading: 'loading'
    });
  }
}
customElements.get('i18n-demo') || customElements.define('i18n-demo', I18nDemo);

/**
 * @summary Internationalization controller with dynamic language switching between English and French.
 * @tags test-case
 */
export const I18nControllerDemo = {
  render: () => html`<i18n-demo></i18n-demo>`
}
