import { html } from 'lit';

export default {
  title: 'Internal/Popover'
}

export const nested = {
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
      <mlv-icon-button id="tooltip-btn" icon-name="information" interaction="ghost" aria-label="more details" slot="label"></mlv-icon-button>
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

export const interactive = {
  render: () => html`
    <div mlv-layout="row align:center gap:xl" style="height: 300px">
      <mlv-tooltip anchor="tooltip-btn" position="top" hidden>hello there</mlv-tooltip>
      <mlv-button id="tooltip-btn">tooltip</mlv-button>

      <mlv-button id="toast-btn">toast</mlv-button>
      <mlv-toast anchor="toast-btn" position="top" auto-close="1500" hidden>copied!</mlv-toast>

      <mlv-button id="dropdown-btn">dropdown</mlv-button>
      <mlv-dropdown anchor="dropdown-btn" closable hidden>
        <h3 mlv-text="heading">Title</h3>
        <p mlv-text="body">some text content in a dropdown</p>
      </mlv-dropdown>

      <mlv-button id="dialog-btn">dialog</mlv-button>
      <mlv-dialog closable modal hidden>
        <h3 mlv-text="heading">Title</h3>
        <p mlv-text="body">some text content in a closable dialog</p>
      </mlv-dialog>

      <mlv-notification hidden closable position="bottom" alignment="end" auto-close="2000">
        <h3 mlv-text="label">notification</h3>
        <p mlv-text="body">some text content in a notification</p>  
      </mlv-notification>
      <mlv-button id="notification-btn">notification snackbar</mlv-button>

      <script type="module">
        const tooltip = document.querySelector('mlv-tooltip');
        const tooltipBtn = document.querySelector('#tooltip-btn');
        tooltipBtn.addEventListener('mousemove', () => tooltip.hidden = false);
        tooltipBtn.addEventListener('mouseleave', () => tooltip.hidden = true);

        const toast = document.querySelector('mlv-toast');
        const toastBtn = document.querySelector('#toast-btn');
        toastBtn.addEventListener('click', () => toast.hidden = false);
        toast.addEventListener('close', () => toast.hidden = true);

        const dropdown = document.querySelector('mlv-dropdown');
        const dropdownBtn = document.querySelector('#dropdown-btn');
        dropdownBtn.addEventListener('click', () => dropdown.hidden = false);
        dropdown.addEventListener('close', () => dropdown.hidden = true);

        const dialog = document.querySelector('mlv-dialog');
        const dialogBtn = document.querySelector('#dialog-btn');
        dialogBtn.addEventListener('click', () => dialog.hidden = false);
        dialog.addEventListener('close', () => dialog.hidden = true);

        const notification = document.querySelector('mlv-notification');
        const notificationBtn = document.querySelector('#notification-btn');
        notificationBtn.addEventListener('click', () => notification.hidden = false);
        notification.addEventListener('close', () => notification.hidden = true);
      </script>
    </div>
  `
}