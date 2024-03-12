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
    <div mlv-layout="row align:center" style="height: 250px">
      <div mlv-layout="row gap:xs">
        <mlv-button id="action-btn-1">button 1</mlv-button>
        <mlv-button id="action-btn-2">button 2</mlv-button>
      </div>
      <mlv-tooltip anchor="action-btn-2" trigger="action-btn-1" hidden>tooltip 1</mlv-tooltip>
      <mlv-tooltip anchor="action-btn-1" trigger="action-btn-2" hidden>tooltip 2</mlv-tooltip>
      <script type="module">
        Array.from(document.querySelectorAll('mlv-tooltip')).forEach(tooltip => {
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
<mlv-dialog closable modal>
  <h3 mlv-text="heading">Dialog</h3>
  <p mlv-text="body" style="margin-bottom: 48px">hello there</p>

  <mlv-button id="dropdown-btn">search</mlv-button>
  <mlv-dropdown anchor="dropdown-btn" closable position="bottom" alignment="start">
    <mlv-tooltip anchor="tooltip-btn" position="top">hello there</mlv-tooltip>
    <mlv-search rounded>
      <label>search dataset</label>
      <mlv-icon-button id="tooltip-btn" icon-name="information-circle-stroke" container="flat" aria-label="more details" slot="label"></mlv-icon-button>
      <input type="search" placeholder="search" />
    </mlv-search>
  </mlv-dropdown>
</mlv-dialog>

<mlv-notification closable position="bottom" alignment="end">
  <h3 mlv-text="label">notification</h3>
  <p mlv-text="body">some text content in a notification</p>  
</mlv-notification>
  `
}

export const Interactive = {
  render: () => html`
    <div mlv-layout="row align:center gap:xl" style="height: 300px">
      <mlv-tooltip trigger="tooltip-btn" behavior-trigger position="top" hidden>hello there</mlv-tooltip>
      <mlv-button id="tooltip-btn">tooltip</mlv-button>

      <mlv-button id="toast-btn">toast</mlv-button>
      <mlv-toast trigger="toast-btn" behavior-trigger position="top" close-timeout="1500" hidden>copied!</mlv-toast>

      <mlv-button id="drawer-btn" size="sm">drawer</mlv-button>
      <mlv-drawer trigger="drawer-btn" behavior-trigger hidden closable modal>
        <mlv-drawer-header>
          <h3 mlv-text="heading semibold sm">Title</h3>
        </mlv-drawer-header>
        <p mlv-text="body">some text content in a drawer</p>
      </mlv-drawer>

      <mlv-button id="dropdown-btn">dropdown</mlv-button>
      <mlv-dropdown trigger="dropdown-btn" behavior-trigger closable hidden>
        <h3 mlv-text="heading">Title</h3>
        <p mlv-text="body">some text content in a dropdown</p>
      </mlv-dropdown>

      <mlv-button id="dialog-btn">dialog</mlv-button>
      <mlv-dialog trigger="dialog-btn" behavior-trigger closable modal hidden>
        <h3 mlv-text="heading">Title</h3>
        <p mlv-text="body">some text content in a closable dialog</p>
      </mlv-dialog>

      <mlv-button id="notification-btn">notification snackbar</mlv-button>
      <mlv-notification trigger="notification-btn" behavior-trigger hidden closable position="bottom" alignment="end" close-timeout="2000">
        <h3 mlv-text="label">notification</h3>
        <p mlv-text="body">some text content in a notification</p>  
      </mlv-notification>
    </div>
  `
}
