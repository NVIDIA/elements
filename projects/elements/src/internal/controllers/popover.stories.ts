import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/search/define.js';
import '@elements/elements/dialog/define.js';
import '@elements/elements/tooltip/define.js';
import '@elements/elements/toast/define.js';
import '@elements/elements/drawer/define.js';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/notification/define.js';

export default {
  title: 'Foundations/Popovers/Examples'
}

export const Trigger = {
  render: () => html`
    <div nve-layout="row align:center" style="height: 250px">
      <div nve-layout="row gap:xs">
        <nve-button id="action-btn-1">button 1</nve-button>
        <nve-button id="action-btn-2">button 2</nve-button>
      </div>
      <nve-tooltip anchor="action-btn-2" trigger="action-btn-1" hidden>tooltip 1</nve-tooltip>
      <nve-tooltip anchor="action-btn-1" trigger="action-btn-2" hidden>tooltip 2</nve-tooltip>
      <script type="module">
        Array.from(document.querySelectorAll('nve-tooltip')).forEach(tooltip => {
          tooltip.addEventListener('close', () => tooltip.hidden = true);
          tooltip.addEventListener('open', () => tooltip.hidden = false);
        });
      </script>
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
    <nve-tooltip anchor="tooltip-btn" position="top">hello there</nve-tooltip>
    <nve-search rounded>
      <label>search dataset</label>
      <nve-icon-button id="tooltip-btn" icon-name="information-circle-stroke" container="flat" aria-label="more details" slot="label"></nve-icon-button>
      <input type="search" placeholder="search" />
    </nve-search>
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
