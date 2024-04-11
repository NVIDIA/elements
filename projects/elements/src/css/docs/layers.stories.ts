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
  title: 'Foundations/Tokens/Examples'
};

export const LayersDemo = {
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
      <nve-dialog size="sm" closable position="top" alignment="end">
        <h3 nve-text="heading">Dialog</h3>
        <p nve-text="body" style="margin-bottom: 48px">hello there</p>
        <nve-button id="dropdown-btn">button</nve-button>
        <nve-dropdown anchor="dropdown-btn" closable position="bottom" alignment="start">
          <nve-tooltip anchor="tooltip-btn" position="top">tooltip</nve-tooltip>
          <nve-search rounded>
            <label>dropdown content</label>
            <nve-icon-button id="tooltip-btn" icon-name="information-circle-stroke" container="flat" aria-label="more details" slot="label"></nve-icon-button>
            <input type="search" placeholder="search" />
          </nve-search>
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
      <nve-dialog size="sm" closable position="bottom" alignment="end" anchor="dark">
        <h3 nve-text="heading">Dialog</h3>
        <p nve-text="body" style="margin-bottom: 48px">hello there</p>
        <nve-button id="dropdown-btn">button</nve-button>
        <nve-dropdown anchor="dropdown-btn" closable position="bottom" alignment="start">
          <nve-tooltip anchor="tooltip-btn" position="top">tooltip</nve-tooltip>
          <nve-search rounded>
            <label>dropdown content</label>
            <nve-icon-button id="tooltip-btn" icon-name="information-circle-stroke" container="flat" aria-label="more details" slot="label"></nve-icon-button>
            <input type="search" placeholder="search" />
          </nve-search>
        </nve-dropdown>
      </nve-dialog>
    </div>
  `
}
