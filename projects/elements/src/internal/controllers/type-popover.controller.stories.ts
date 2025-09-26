import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import type { PopoverPosition, PopoverAlign, PopoverType } from '@nvidia-elements/core/internal';
import { popoverStyles, TypeNativePopoverController, useStyles, TypeNativeAnchorController } from '@nvidia-elements/core/internal';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/dropdown/define.js';

export default {
  title: 'Internal/Controllers'
}

class PopoverDemo extends LitElement {
  @property({ type: String }) anchor: string | HTMLElement;

  @property({ type: String }) trigger: string | HTMLElement;

  @property({ type: String, reflect: true }) position: PopoverPosition = 'top';

  @property({ type: String, reflect: true }) alignment: PopoverAlign = 'center';

  @property({ type: Boolean }) arrow = true;

  @query('.arrow') popoverArrow: HTMLElement;

  static styles = useStyles([popoverStyles, css`
    :host {
      --nve-sys-layer-popover-arrow-padding: 6px;
      --nve-sys-layer-popover-arrow-offset: 2px;
      --nve-sys-layer-popover-offset: 2px;
    }

    [internal-host] {
      padding: 18px;
      min-width: 80px;
      text-align: center;
      background: #fff;
      color: #2d2d2d;
    }

    :host::backdrop {
      background: none;
    }

    .arrow {
      width: 12px;
      height: 12px;
      background: #fff;
      position: absolute;
    }
  `]);

  /** @private */
  readonly popoverType: PopoverType = 'auto';

  protected typeNativeAnchorController = new TypeNativeAnchorController<PopoverDemo>(this);

  protected typeNativePopoverController = new TypeNativePopoverController<PopoverDemo>(this);

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
    <div internal-host>
      <div id="content">
        <slot></slot>
      </div>
    </div>
    ${this.arrow ? html`<div class="arrow"></div>` : ''}
  `;
  }
}
customElements.get('ui-popover') || customElements.define('ui-popover', PopoverDemo);

/**
 * @tags test-case
 */
export const TypePopoverControllerDemo = {
  render: () => html`
    <style>
      #root-inner {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: 100%;
        height: 100vh;
      }
    </style>
    <ui-popover id="type-popover">popover</ui-popover>
    <nve-button popovertarget="type-popover">toggle</nve-button>
  `
};

/**
 * @tags test-case
 */
export const TypePopoverControllerAlignmentDemo = {
  render: () => html`
  <nve-card id="card" style="width: 450px; height: 300px;"></nve-card>
  <ui-popover anchor="card" popover-type="manual" position="top" alignment="start">top start</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="top">top center</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="top" alignment="end">top end</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="right" alignment="start">right start</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="right">right center</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="right" alignment="end">right end</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="bottom" alignment="start">bottom start</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="bottom">bottom center</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="bottom" alignment="end">bottom end</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="left" alignment="start">left start</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="left">left center</ui-popover>
  <ui-popover anchor="card" popover-type="manual" position="left" alignment="end">left end</ui-popover>

  <ui-popover popover-type="manual" position="center">center</ui-popover>
  <ui-popover popover-type="manual" position="top" alignment="start">top start</ui-popover>
  <ui-popover popover-type="manual" position="top">top center</ui-popover>
  <ui-popover popover-type="manual" position="top" alignment="end">top end</ui-popover>
  <ui-popover popover-type="manual" position="right" alignment="start">right start</ui-popover>
  <ui-popover popover-type="manual" position="right">right center</ui-popover>
  <ui-popover popover-type="manual" position="right" alignment="end">right end</ui-popover>
  <ui-popover popover-type="manual" position="bottom" alignment="start">bottom start</ui-popover>
  <ui-popover popover-type="manual" position="bottom">bottom center</ui-popover>
  <ui-popover popover-type="manual" position="bottom" alignment="end">bottom end</ui-popover>
  <ui-popover popover-type="manual" position="left" alignment="start">left start</ui-popover>
  <ui-popover popover-type="manual" position="left">left center</ui-popover>
  <ui-popover popover-type="manual" position="left" alignment="end">left end</ui-popover>
  `
}

/**
 * @tags test-case
 */
export const AbsolutePositioningFallback = {
  render: () => html`
  <div nve-layout="row align-center pad:lg">
    <nve-dropdown id="dropdown" position-strategy="absolute">dropdown content</nve-dropdown>
    <nve-icon-button popovertarget="dropdown" icon-name="refresh"></nve-icon-button>
  </div>
  `
}

class MyElement extends LitElement {
  render() {
    return html`
      <div style="width: 250px; height: 100px; resize: both; overflow: scroll; border: 1px solid white;">
        <nve-dropdown id="my-dropdown">dropdown content</nve-dropdown>
        <nve-icon-button id="my-dropdown-anchor" popovertarget="my-dropdown" icon-name="refresh"></nve-icon-button>
      </div>
    `;
  }
}

customElements.get('my-element') || customElements.define('my-element', MyElement);