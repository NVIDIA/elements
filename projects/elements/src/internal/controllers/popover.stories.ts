import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/dialog/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/toast/define.js';
import '@nvidia-elements/core/drawer/define.js';
import '@nvidia-elements/core/dropdown/define.js';
import '@nvidia-elements/core/notification/define.js';
import '@nvidia-elements/core/toggletip/define.js';

export default {
  title: 'Elements/Popovers',
  parameters: {
    layout: 'centered'
  }
}

export const Anchor = {
  render: () => html`
    <nve-tooltip id="popover-1" anchor="btn-2">tooltip 1</nve-tooltip>
    <nve-tooltip id="popover-2" anchor="btn-1">tooltip 2</nve-tooltip>
    <div nve-layout="row gap:xs">
      <nve-button id="btn-1" popovertarget="popover-1">button 1</nve-button>
      <nve-button id="btn-2" popovertarget="popover-2">button 2</nve-button>
    </div>
  `
}

export const Nested = {
  render: () => html`
<style>
  #root-inner { height: 2000px;}
</style>
<nve-dialog closable modal>
  <h3 nve-text="heading">Dialog</h3>
  <p nve-text="body" style="margin-bottom: 48px">hello there</p>

  <nve-button id="dropdown-btn">search</nve-button>
  <nve-dropdown anchor="dropdown-btn" closable position="bottom" alignment="start">
    <nve-search rounded>
      <label>search dataset</label>
      <nve-icon-button id="tooltip-btn" icon-name="information-circle-stroke" container="flat" aria-label="more details" slot="label"></nve-icon-button>
      <input type="search" placeholder="search" />
    </nve-search>
    <nve-tooltip anchor="tooltip-btn" position="top">hello there</nve-tooltip>
  </nve-dropdown>
</nve-dialog>

<nve-notification closable position="bottom" alignment="end">
  <h3 nve-text="label">notification</h3>
  <p nve-text="body">some text content in a notification</p>  
</nve-notification>
  `
}

export const Interactive = {
  render: () => html`
    <div nve-layout="row align:center gap:xl" style="height: 300px">
      <nve-tooltip id="tooltip">hello there</nve-tooltip>
      <nve-button popovertarget="tooltip">tooltip</nve-button>

      <nve-toast id="toast" close-timeout="1500">copied!</nve-toast>
      <nve-button popovertarget="toast">toast</nve-button>

      <nve-drawer id="drawer" closable modal>
        <nve-drawer-header>
          <h3 nve-text="heading semibold sm">Title</h3>
        </nve-drawer-header>
        <p nve-text="body">some text content in a drawer</p>
      </nve-drawer>
      <nve-button popovertarget="drawer">drawer</nve-button>

      <nve-dropdown id="dropdown" closable>
        <h3 nve-text="heading">Title</h3>
        <p nve-text="body">some text content in a dropdown</p>
      </nve-dropdown>
      <nve-button popovertarget="dropdown">dropdown</nve-button>

      <nve-dialog id="dialog" closable modal>
        <h3 nve-text="heading">Title</h3>
        <p nve-text="body">some text content in a closable dialog</p>
      </nve-dialog>
      <nve-button popovertarget="dialog">dialog</nve-button>

      <nve-notification id="notification" closable position="bottom" alignment="end" close-timeout="2000">
        <h3 nve-text="label">notification</h3>
        <p nve-text="body">some text content in a notification</p>  
      </nve-notification>
      <nve-button popovertarget="notification">notification snackbar</nve-button>
    </div>
  `
}

export const LegacyInteractive = {
  render: () => html`
    <div nve-layout="row align:center gap:xl" style="height: 300px">
      <nve-tooltip trigger="tooltip-btn" behavior-trigger position="top" hidden>hello there</nve-tooltip>
      <nve-button id="tooltip-btn">tooltip</nve-button>

      <nve-button id="toast-btn">toast</nve-button>
      <nve-toast trigger="toast-btn" behavior-trigger position="top" close-timeout="1500" hidden>copied!</nve-toast>

      <nve-button id="drawer-btn" size="sm">drawer</nve-button>
      <nve-drawer trigger="drawer-btn" behavior-trigger hidden closable modal>
        <nve-drawer-header>
          <h3 nve-text="heading semibold sm">Title</h3>
        </nve-drawer-header>
        <p nve-text="body">some text content in a drawer</p>
      </nve-drawer>

      <nve-button id="dropdown-btn">dropdown</nve-button>
      <nve-dropdown trigger="dropdown-btn" behavior-trigger closable hidden>
        <h3 nve-text="heading">Title</h3>
        <p nve-text="body">some text content in a dropdown</p>
      </nve-dropdown>

      <nve-button id="dialog-btn">dialog</nve-button>
      <nve-dialog trigger="dialog-btn" behavior-trigger closable modal hidden>
        <h3 nve-text="heading">Title</h3>
        <p nve-text="body">some text content in a closable dialog</p>
      </nve-dialog>

      <nve-button id="notification-btn">notification snackbar</nve-button>
      <nve-notification trigger="notification-btn" behavior-trigger hidden closable position="bottom" alignment="end" close-timeout="2000">
        <h3 nve-text="label">notification</h3>
        <p nve-text="body">some text content in a notification</p>  
      </nve-notification>
    </div>
  `
}

export const Closable = {
  render: () => html`
    <nve-button popovertarget="popover">open dialog</nve-button>
    <nve-dialog id="popover" modal>
      <p nve-text="body">Press "escape" key to close.</p>
    </nve-dialog>
  `
}

/**
 * @description example of declarative popovers using the Invoker Commands API
 * https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API
 * https://open-ui.org/components/invokers.explainer/#defaults
 */
export const InvokerCommand = {
  render: () => html`
    <nve-button commandfor="popover" command="toggle-popover">toggle-popover</nve-button>
    <nve-button commandfor="popover" command="show-popover">show-popover</nve-button>
    <nve-toggletip id="popover">
      toggletip
      <nve-button commandfor="popover" command="hide-popover">hide-popover</nve-button>
    </nve-toggletip>
  `
};
