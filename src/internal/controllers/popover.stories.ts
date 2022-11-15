import { html } from 'lit';

export default {
  title: 'Internal/Popover'
}

export const nested = {
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
      <nve-icon-button id="tooltip-btn" icon-name="information" interaction="ghost" aria-label="more details" slot="label"></nve-icon-button>
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

export const interactive = {
  render: () => html`
    <div nve-layout="row align:center gap:xl" style="height: 300px">
      <nve-tooltip anchor="tooltip-btn" position="top" hidden>hello there</nve-tooltip>
      <nve-button id="tooltip-btn">tooltip</nve-button>

      <nve-button id="toast-btn">toast</nve-button>
      <nve-toast anchor="toast-btn" position="top" auto-close="1500" hidden>copied!</nve-toast>

      <nve-button id="dropdown-btn">dropdown</nve-button>
      <nve-dropdown anchor="dropdown-btn" closable hidden>
        <h3 nve-text="heading">Title</h3>
        <p nve-text="body">some text content in a dropdown</p>
      </nve-dropdown>

      <nve-button id="dialog-btn">dialog</nve-button>
      <nve-dialog closable modal hidden>
        <h3 nve-text="heading">Title</h3>
        <p nve-text="body">some text content in a closable dialog</p>
      </nve-dialog>

      <nve-notification hidden closable position="bottom" alignment="end" auto-close="2000">
        <h3 nve-text="label">notification</h3>
        <p nve-text="body">some text content in a notification</p>  
      </nve-notification>
      <nve-button id="notification-btn">notification snackbar</nve-button>

      <script type="module">
        const tooltip = document.querySelector('nve-tooltip');
        const tooltipBtn = document.querySelector('#tooltip-btn');
        tooltipBtn.addEventListener('mousemove', () => tooltip.hidden = false);
        tooltipBtn.addEventListener('mouseleave', () => tooltip.hidden = true);

        const toast = document.querySelector('nve-toast');
        const toastBtn = document.querySelector('#toast-btn');
        toastBtn.addEventListener('click', () => toast.hidden = false);
        toast.addEventListener('close', () => toast.hidden = true);

        const dropdown = document.querySelector('nve-dropdown');
        const dropdownBtn = document.querySelector('#dropdown-btn');
        dropdownBtn.addEventListener('click', () => dropdown.hidden = false);
        dropdown.addEventListener('close', () => dropdown.hidden = true);

        const dialog = document.querySelector('nve-dialog');
        const dialogBtn = document.querySelector('#dialog-btn');
        dialogBtn.addEventListener('click', () => dialog.hidden = false);
        dialog.addEventListener('close', () => dialog.hidden = true);

        const notification = document.querySelector('nve-notification');
        const notificationBtn = document.querySelector('#notification-btn');
        notificationBtn.addEventListener('click', () => notification.hidden = false);
        notification.addEventListener('close', () => notification.hidden = true);
      </script>
    </div>
  `
}