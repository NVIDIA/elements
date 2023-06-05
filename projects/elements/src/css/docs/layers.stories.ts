import { html } from 'lit';
import '@elements/elements/card/define.js';
import '@elements/elements/forms/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/dialog/define.js';
import '@elements/elements/tooltip/define.js';
import '@elements/elements/search/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/tooltip/define.js';

export default {
  title: 'Foundations/Tokens/Examples'
};

export const layersDemo = {
  render: () => html`
    <style>
      body {
        padding: 0 !important;
      }
    </style>
    <div mlv-theme="light root" mlv-layout="column gap:lg pad:lg" style="height: 50vh;">
      <mlv-card style="width: 500px; height: 300px;">
        <mlv-card-header>
          <div slot="title">Card</div>
          <div slot="subtitle">Sub Title</div>
        </mlv-card-header>
        <mlv-card-content>
          <mlv-input>
            <label>label</label>
            <input type="text" value="input" />
            <mlv-control-message>message</mlv-control-message>
          </mlv-input>
        </mlv-card-content>
        <mlv-card-footer>
          <mlv-button>button <mlv-icon name="navigate-to"></mlv-icon></mlv-button>
        </mlv-card-footer>
      </mlv-card>
      <div mlv-layout="column gap:md">
        <mlv-input>
          <label>label</label>
          <input type="text" value="input" />
          <mlv-control-message>message</mlv-control-message>
        </mlv-input>
        <mlv-button>button <mlv-icon name="navigate-to"></mlv-icon></mlv-button>
      </div>
      <mlv-dialog size="sm" closable position="top" alignment="end">
        <h3 mlv-text="heading">Dialog</h3>
        <p mlv-text="body" style="margin-bottom: 48px">hello there</p>
        <mlv-button id="dropdown-btn">button</mlv-button>
        <mlv-dropdown anchor="dropdown-btn" closable position="bottom" alignment="start">
          <mlv-tooltip anchor="tooltip-btn" position="top">tooltip</mlv-tooltip>
          <mlv-search rounded>
            <label>dropdown content</label>
            <mlv-icon-button id="tooltip-btn" icon-name="information" interaction="ghost" aria-label="more details" slot="label"></mlv-icon-button>
            <input type="search" placeholder="search" />
          </mlv-search>
        </mlv-dropdown>
      </mlv-dialog>
    </div>

    <div mlv-theme="dark root" mlv-layout="column gap:lg pad:lg" style="height: 50vh; position: relative;">
      <mlv-card style="width: 500px; height: 300px;">
        <mlv-card-header>
          <div slot="title">Card</div>
          <div slot="subtitle">Sub Title</div>
        </mlv-card-header>
        <mlv-card-content>
          <mlv-input>
            <label>label</label>
            <input type="text" value="input" />
            <mlv-control-message>message</mlv-control-message>
          </mlv-input>
        </mlv-card-content>
        <mlv-card-footer>
          <mlv-button>button <mlv-icon name="navigate-to"></mlv-icon></mlv-button>
        </mlv-card-footer>
      </mlv-card>
      <div mlv-layout="column gap:md">
        <mlv-input>
          <label>label</label>
          <input type="text" value="input" />
          <mlv-control-message>message</mlv-control-message>
        </mlv-input>
        <mlv-button>button <mlv-icon name="navigate-to"></mlv-icon></mlv-button>
      </div>
      <div id="dark" style="position: absolute; right: 48px; top: 0;"></div>
      <mlv-dialog size="sm" closable position="bottom" alignment="end" anchor="dark">
        <h3 mlv-text="heading">Dialog</h3>
        <p mlv-text="body" style="margin-bottom: 48px">hello there</p>
        <mlv-button id="dropdown-btn">button</mlv-button>
        <mlv-dropdown anchor="dropdown-btn" closable position="bottom" alignment="start">
          <mlv-tooltip anchor="tooltip-btn" position="top">tooltip</mlv-tooltip>
          <mlv-search rounded>
            <label>dropdown content</label>
            <mlv-icon-button id="tooltip-btn" icon-name="information" interaction="ghost" aria-label="more details" slot="label"></mlv-icon-button>
            <input type="search" placeholder="search" />
          </mlv-search>
        </mlv-dropdown>
      </mlv-dialog>
    </div>
  `
}
