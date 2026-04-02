// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/dialog/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/tooltip/define.js';

export default {
  title: 'Themes/Examples',
  component: 'nve-internal-patterns'
};

/**
 * @summary Theme layer stacking (canvas, container, overlay, popover) in light and dark modes.
 */
export const Layers = {
  render: () => html`
    <style>
      body {
        padding: 0 !important;
      }
    </style>
    <div nve-theme="light root" nve-layout="column gap:lg pad:lg" style="height: 50vh;">
      <nve-card style="width: 500px; height: 300px;">
        <nve-card-header>
          <div slot="title">Card</div>
          <div slot="subtitle">Sub Title</div>
        </nve-card-header>
        <nve-card-content>
          <nve-input>
            <label>label</label>
            <input type="text" value="input" />
            <nve-control-message>message</nve-control-message>
          </nve-input>
        </nve-card-content>
        <nve-card-footer>
          <nve-button>button <nve-icon name="arrow" direction="right"></nve-icon></nve-button>
        </nve-card-footer>
      </nve-card>
      <div nve-layout="column gap:md">
        <nve-input>
          <label>label</label>
          <input type="text" value="input" />
          <nve-control-message>message</nve-control-message>
        </nve-input>
        <nve-button>button <nve-icon name="arrow" direction="right"></nve-icon></nve-button>
      </div>
      <nve-dialog size="sm" closable position="top" alignment="end" style="--min-width: 400px">
        <h3 nve-text="heading">Dialog</h3>
        <p nve-text="body" style="margin-bottom: 48px">hello there</p>
        <nve-button id="dropdown-btn">button</nve-button>
        <nve-dropdown anchor="dropdown-btn" closable position="bottom" alignment="start">
          <nve-search rounded>
            <label>dropdown content</label>
            <nve-icon-button id="tooltip-btn-1" icon-name="information-circle-stroke" container="flat" aria-label="more details" slot="label"></nve-icon-button>
            <input type="search" placeholder="search" />
          </nve-search>
          <nve-tooltip anchor="tooltip-btn-1" position="top">tooltip</nve-tooltip>
        </nve-dropdown>
      </nve-dialog>
    </div>

    <div nve-theme="dark root" nve-layout="column gap:lg pad:lg" style="height: 50vh; position: relative;">
      <nve-card style="width: 500px; height: 300px;">
        <nve-card-header>
          <div slot="title">Card</div>
          <div slot="subtitle">Sub Title</div>
        </nve-card-header>
        <nve-card-content>
          <nve-input>
            <label>label</label>
            <input type="text" value="input" />
            <nve-control-message>message</nve-control-message>
          </nve-input>
        </nve-card-content>
        <nve-card-footer>
          <nve-button>button <nve-icon name="arrow" direction="right"></nve-icon></nve-button>
        </nve-card-footer>
      </nve-card>
      <div nve-layout="column gap:md">
        <nve-input>
          <label>label</label>
          <input type="text" value="input" />
          <nve-control-message>message</nve-control-message>
        </nve-input>
        <nve-button>button <nve-icon name="arrow" direction="right"></nve-icon></nve-button>
      </div>
      <div id="dark" style="position: absolute; right: 48px; top: 0;"></div>
      <nve-dialog size="sm" closable position="bottom" alignment="end" anchor="dark" style="--min-width: 400px">
        <h3 nve-text="heading">Dialog</h3>
        <p nve-text="body" style="margin-bottom: 48px">hello there</p>
        <nve-button id="dropdown-btn">button</nve-button>
        <nve-dropdown anchor="dropdown-btn" closable position="bottom" alignment="start">
          <nve-search rounded>
            <label>dropdown content</label>
            <nve-icon-button id="tooltip-btn-2" icon-name="information-circle-stroke" container="flat" aria-label="more details" slot="label"></nve-icon-button>
            <input type="search" placeholder="search" />
          </nve-search>
          <nve-tooltip anchor="tooltip-btn-2" position="top">tooltip</nve-tooltip>
        </nve-dropdown>
      </nve-dialog>
    </div>
  `
}

/**
 * @summary Theme layer object reference showing semantic backgrounds for canvas, container, overlay, and popover.
 */
export const Objects = {
  render: () => html`
    <style>
      .layer-demo {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 48px;
        padding: 24px;
        background: var(--nve-sys-layer-canvas-background);
      }

      .layer-demo h2,
      .layer-demo ul {
        margin: 0 0 12px 0;
        font-weight: normal;
      }

      .canvas {
        background: var(--nve-sys-layer-canvas-background);
        color: var(--nve-sys-layer-canvas-color);
        padding: var(--nve-ref-size-600);
      }

      .container {
        background: var(--nve-sys-layer-container-background);
        color: var(--nve-sys-layer-container-color);
        padding: var(--nve-ref-size-500);
        box-shadow: var(--nve-ref-shadow-100);
        border-radius: var(--nve-ref-border-radius-lg);
        width: 400px;
        height: 300px;
      }

      .overlay {
        background: var(--nve-sys-layer-overlay-background);
        color: var(--nve-sys-layer-overlay-color);
        padding: var(--nve-ref-size-600);
        box-shadow: var(--nve-ref-shadow-200);
        border-radius: var(--nve-ref-border-radius-lg);
        width: 400px;
        height: 300px;
      }

      .backdrop {
        background: var(--nve-sys-layer-backdrop-background);
        padding: 24px;
        width: 400px;
        height: 300px;
        display: flex;
        place-content: center;
        place-items: center;
      }

      .backdrop .overlay {
        width: 300px;
        height: 200px;
      }

      .popover {
        background: var(--nve-sys-layer-popover-background);
        color: var(--nve-sys-layer-popover-color);
        padding: var(--nve-ref-size-400);
        box-shadow: var(--nve-ref-shadow-300);
        border-radius: var(--nve-ref-border-radius-md);
        width: 400px;
        height: 130px;
      }
    </style>

    <section class="layer-demo">
      <div class="canvas">
        <h2>canvas</h2>
        <ul>
          <li>document</li>
          <li>body</li>
        </ul>
      </div>
      <div class="container">
        <h2>container</h2>
        <ul>
          <li>cards</li>
          <li>steps</li>
          <li>tabs</li>
        </ul>
      </div>
      <div class="backdrop">
        <div class="overlay">
          <h2>overlay/backdrop</h2>
          <ul>
            <li>modals</li>
            <li>drawers</li>
            <li>dropdown menus</li>
          </ul>
        </div>
      </div>
      <div class="popover">
        <h2>popover</h2>
        <ul>
          <li>tooltips</li>
          <li>toasts</li>
          <li>notifications</li>
        </ul>
      </div>
    </section>
  `
}

/**
 * @summary Reduced-motion theme setting that disables animations for accessibility.
 */
export const ReducedMotion = {
  render: () => html`
<style>
  @keyframes slide-demo {
    0% {
      left: 0;
    }

    50% {
      left: calc(100% - 25px);
    }

    100% {
      left: 0;
    }
  }

  .animation,
  .animation[nve-theme] {
    width: 150px;
    height: 50px;
    border: 1px solid #ccc;
    position: relative;
    padding: 0;
  }

  .animation div {
    width: 20px;
    height: 50px;
    background-color: #ccc;
    animation: slide-demo var(--nve-ref-animation-duration-400);
    animation-timing-function: var(--nve-ref-animation-easing-100);
    animation-iteration-count: infinite;
    animation-delay: 500ms;
    width: 25px;
    height: 50px;
    position: absolute;
    left: 0;
  }
</style>
<div nve-layout="row gap:md">
  <section nve-layout="column gap:sm">
    <code>nve-theme=""</code>
    <div class="animation" nve-theme="">
      <div></div>
    </div>
  </section>
  <section nve-layout="column gap:sm">
    <code>nve-theme="reduced-motion"</code>
    <div class="animation" nve-theme="reduced-motion">
      <div></div>
    </div>
  </section>
</div>`
}


/**
 * @summary Theme interaction state system for buttons showing hover, active, selected, and disabled states.
 */
export const ButtonInteractions = {
  render() {
    return html`
<style>
  button {
    background: color-mix(in oklab, var(--nve-sys-interaction-state-base) 100%, var(--nve-sys-interaction-state-mix) var(--nve-sys-interaction-state-ratio, 0%));
    color: var(--nve-sys-interaction-color);
    border: 0;
    padding: 12px;
    cursor: pointer;
    margin-bottom: 6px;
    width: 100px;
  }

  button:hover,
  button[hover] {
    --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-hover);
  }

  button:active,
  button[active] {
    --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-active);
  }

  button:disabled,
  button[disabled] {
    --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-disabled);
  }

  button[selected] {
    --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-selected);
  }
</style>
<section>
  <button>button</button>
  <button hover>hover</button>
  <button active>active</button>
  <button selected>selected</button>
  <button disabled>disabled</button>
</section>
<section style="--nve-sys-interaction-state-base: var(--nve-sys-interaction-emphasis-background)">
  <button>button</button>
  <button hover>hover</button>
  <button active>active</button>
  <button selected>selected</button>
  <button disabled>disabled</button>
</section>
    `;
  }
}

/**
 * @summary Theme interaction state system for menu items with all interactive states in both themes.
 */
export const Interactions = {
  render: () => html`
    <style>
      .menu {
        display: flex;
        flex-direction: column;
        max-width: 200px;
        width: 100%;
        margin: 0;
        padding: 0;
      }

      .menu-item {
        width: 100%;
        display: block;
        border: 0;
        cursor: pointer;
        text-align: left;
        padding: var(--nve-ref-size-200) var(--nve-ref-size-300);
        color: var(--nve-sys-interaction-color);
        font-size: var(--nve-ref-font-size-300);
        border-radius: var(--nve-ref-border-radius-xs);
        background-image: linear-gradient(color-mix(in oklab, var(--nve-sys-interaction-state-base) 100%, var(--nve-sys-interaction-state-mix) var(--nve-sys-interaction-state-ratio)) 0 0) !important;
      }

      .menu-item:hover,
      .menu-item[hover] {
        --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-hover);
      }

      .menu-item:active,
      .menu-item[active] {
        --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-active);
      }

      .menu-item[selected] {
        --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-selected);
      }

      .menu-item[disabled] {
        --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-disabled);
        cursor: not-allowed;
      }

      .menu-item[readonly] {
        --nve-sys-interaction-state-ratio: 0;
      }

      .menu-item:focus,
      .menu-item[focused] {
        outline-offset: -3px;
        outline: 5px auto -webkit-focus-ring-color;
        outline: Highlight solid 2px;
      }
    </style>
    <div nve-layout="grid gap:md">
      <section nve-theme="root light" nve-layout="span:12 row gap:sm pad:md align:stretch">
        <div class="menu">
          <div class="menu-item">item</div>
          <div class="menu-item">default</div>
          <div class="menu-item">item</div>
        </div>
        <div class="menu">
          <div class="menu-item">item</div>
          <div class="menu-item" hover>hover</div>
          <div class="menu-item">item</div>
        </div>
        <div class="menu">
          <div class="menu-item">item</div>
          <div class="menu-item" active>active</div>
          <div class="menu-item">item</div>
        </div>
        <div class="menu">
          <div class="menu-item">item</div>
          <div class="menu-item" selected>selected</div>
          <div class="menu-item">item</div>
        </div>
        <div class="menu">
          <div class="menu-item">item</div>
          <div class="menu-item" disabled>disabled</div>
          <div class="menu-item">item</div>
        </div>
        <div class="menu">
          <div class="menu-item">item</div>
          <div class="menu-item" focused>focused</div>
          <div class="menu-item">item</div>
        </div>
      </section>
      <section nve-theme="root dark" nve-layout="span:12 row gap:sm pad:md align:stretch">
        <div class="menu">
          <div class="menu-item">item</div>
          <div class="menu-item">default</div>
          <div class="menu-item">item</div>
        </div>
        <div class="menu">
          <div class="menu-item">item</div>
          <div class="menu-item" hover>hover</div>
          <div class="menu-item">item</div>
        </div>
        <div class="menu">
          <div class="menu-item">item</div>
          <div class="menu-item" active>active</div>
          <div class="menu-item">item</div>
        </div>
        <div class="menu">
          <div class="menu-item">item</div>
          <div class="menu-item" selected>selected</div>
          <div class="menu-item">item</div>
        </div>
        <div class="menu">
          <div class="menu-item">item</div>
          <div class="menu-item" disabled>disabled</div>
          <div class="menu-item">item</div>
        </div>
        <div class="menu">
          <div class="menu-item">item</div>
          <div class="menu-item" focused>focused</div>
          <div class="menu-item">item</div>
        </div>
      </section>
      <section nve-theme="root light" nve-layout="span:6 pad:md align:stretch">
        <nve-card>
          <nve-card-content nve-layout="grid gap:md">
            <div nve-layout="span:5 column gap:xs">
              <div class="menu-item">default</div>
              <div class="menu-item" hover>hover</div>
              <div class="menu-item" active>active</div>
              <div class="menu-item" selected>selected</div>
              <div class="menu-item" disabled>disabled</div>
              <div class="menu-item" focused>focused</div>
            </div>
            <div nve-layout="span:7">container</div>
          </nve-card-content>
        </nve-card>
      </section>
      <section nve-theme="root dark" nve-layout="span:6 pad:md align:stretch">
        <nve-card>
          <nve-card-content nve-layout="grid gap:md">
            <div nve-layout="span:5 column gap:xs">
              <div class="menu-item">default</div>
              <div class="menu-item" hover>hover</div>
              <div class="menu-item" active>active</div>
              <div class="menu-item" selected>selected</div>
              <div class="menu-item" disabled>disabled</div>
              <div class="menu-item" focused>focused</div>
            </div>
            <div nve-layout="span:7">container</div>
          </nve-card-content>
        </nve-card>
      </section>
    </div>`
};
