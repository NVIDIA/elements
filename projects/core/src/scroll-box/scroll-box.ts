// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './scroll-box.css?inline';

/**
 * @element nve-scroll-box
 * @description A scrollable container for arbitrary content with optional edge shadows and native scrolling APIs.
 * @documentation https://nvidia.github.io/elements/docs/elements/scroll-box/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/scroll-box
 * @slot - Content to scroll. Use light DOM elements to arrange the content.
 * @cssprop --scrollbar-color - Native scrollbar thumb and track colors.
 * @cssprop --scrollbar-width - Native scrollbar width. Set to none to hide scrollbars.
 * @cssprop --shadow-color - Optional edge tint. Transparent uses the theme shadow.
 * @cssprop --shadow-size - Size of the edge shadows.
 */
export class ScrollBox extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-scroll-box',
    version: '0.0.0'
  };

  static get observedAttributes() {
    return [...super.observedAttributes, 'tabindex'];
  }

  /** Determines which axes allow user scrolling. */
  @property({ type: String, reflect: true }) orientation: 'horizontal' | 'vertical' | 'both' = 'both';

  /** Shows shadows at edges where more content is available. */
  @property({ type: Boolean, reflect: true, attribute: 'scroll-shadow' }) scrollShadow = false;

  #resizeObserver?: ResizeObserver;
  #mutationObserver?: MutationObserver;
  #frame?: number;
  #authorTabIndex = false;
  #settingTabIndex = false;

  render() {
    return html`
      <div internal-host class="content"><slot @slotchange=${this.#scheduleMeasure}></slot></div>
      ${
        this.scrollShadow
          ? html`
        <div class="shadow-layer" aria-hidden="true" hidden>
          <div class="shadows">
            <div class="edge top"></div>
            <div class="edge right"></div>
            <div class="edge bottom"></div>
            <div class="edge left"></div>
          </div>
        </div>
      `
          : nothing
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.#observe();
  }

  firstUpdated() {
    this.#observe();
  }

  updated() {
    this.#scheduleMeasure();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#resizeObserver?.disconnect();
    this.#mutationObserver?.disconnect();
    this.removeEventListener('load', this.#scheduleMeasure, true);
    this.ownerDocument.fonts.removeEventListener('loadingdone', this.#scheduleMeasure);
    if (this.#frame !== undefined) cancelAnimationFrame(this.#frame);
    this.#frame = undefined;
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'tabindex' && !this.#settingTabIndex) {
      this.#authorTabIndex = newValue !== null;
      this.#scheduleMeasure();
    }
  }

  #observe() {
    if (!this.isConnected) return;
    this.#resizeObserver = new ResizeObserver(this.#scheduleMeasure);
    this.#observeSizes();
    this.#mutationObserver = new MutationObserver(records => {
      if (records.some(record => record.type === 'childList')) this.#observeSizes();
      this.#scheduleMeasure();
    });
    this.#mutationObserver.observe(this, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });
    this.addEventListener('load', this.#scheduleMeasure, true);
    this.ownerDocument.fonts.addEventListener('loadingdone', this.#scheduleMeasure);
    this.#scheduleMeasure();
  }

  #observeSizes() {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver?.observe(this);
    const content = this.renderRoot.querySelector('.content');
    if (content) this.#resizeObserver?.observe(content);
    // Descendants can overflow a fixed-size slotted wrapper without resizing it.
    this.querySelectorAll('*').forEach(element => this.#resizeObserver?.observe(element));
  }

  #scheduleMeasure = () => {
    if (!this.isConnected || !this.hasUpdated || this.#frame !== undefined) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = undefined;
      this.#measure();
    });
  };

  #measure() {
    const layer = this.renderRoot.querySelector<HTMLElement>('.shadow-layer');
    // Exclude the decorative layer so content can shrink after a previous overflow.
    if (layer) layer.hidden = true;
    this.#syncTabIndex();

    const shadows = layer?.querySelector<HTMLElement>('.shadows');
    if (!layer || !shadows) return;
    this.#sizeShadows(layer, shadows);
  }

  #sizeShadows(layer: HTMLElement, shadows: HTMLElement) {
    const { clientWidth, clientHeight, scrollWidth, scrollHeight } = this;
    const style = getComputedStyle(this);
    layer.style.width = `${scrollWidth}px`;
    layer.style.height = `${scrollHeight}px`;
    shadows.style.width = `${clientWidth}px`;
    shadows.style.height = `${clientHeight}px`;
    shadows.style.setProperty('--_height', `${clientHeight}px`);
    // Guard disabled axes because scroll-state queries can include hidden overflow.
    shadows.style.setProperty('--_shadow-x', ['auto', 'scroll'].includes(style.overflowX) ? '1' : '0');
    shadows.style.setProperty('--_shadow-y', ['auto', 'scroll'].includes(style.overflowY) ? '1' : '0');
    // Sticky offsets start inside the scrollport's padding.
    shadows.style.inset = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]
      .map(value => `${-parseFloat(value)}px`)
      .join(' ');
    layer.hidden = clientWidth === 0 || clientHeight === 0;
  }

  #syncTabIndex() {
    if (this.#authorTabIndex) return;
    const { clientWidth, clientHeight, scrollWidth, scrollHeight } = this;
    const style = getComputedStyle(this);
    const horizontal = ['auto', 'scroll'].includes(style.overflowX) && scrollWidth > clientWidth;
    const vertical = ['auto', 'scroll'].includes(style.overflowY) && scrollHeight > clientHeight;

    const value = clientWidth > 0 && clientHeight > 0 && (horizontal || vertical) ? '0' : null;
    if (this.getAttribute('tabindex') === value) return;
    this.#settingTabIndex = true;
    try {
      if (value === null) this.removeAttribute('tabindex');
      else this.setAttribute('tabindex', value);
    } finally {
      this.#settingTabIndex = false;
    }
  }
}
