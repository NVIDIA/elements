import { html } from 'lit';

export default {
  title: 'Elements/Popovers/Examples'
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

export const Interactive = {
  render: () => html`
    <div nve-layout="row align:center gap:xl" style="height: 300px">
      <nve-tooltip anchor="tooltip-btn" trigger="tooltip-btn" position="top" hidden>hello there</nve-tooltip>
      <nve-button id="tooltip-btn">tooltip</nve-button>

      <nve-button id="toast-btn">toast</nve-button>
      <nve-toast anchor="toast-btn" trigger="toast-btn" position="top" close-timeout="1500" hidden>copied!</nve-toast>

      <nve-button id="dropdown-btn">dropdown</nve-button>
      <nve-dropdown anchor="dropdown-btn" trigger="dropdown-btn" closable hidden>
        <h3 nve-text="heading">Title</h3>
        <p nve-text="body">some text content in a dropdown</p>
      </nve-dropdown>

      <nve-button id="dialog-btn">dialog</nve-button>
      <nve-dialog trigger="dialog-btn" closable modal hidden>
        <h3 nve-text="heading">Title</h3>
        <p nve-text="body">some text content in a closable dialog</p>
      </nve-dialog>

      <nve-button id="notification-btn">notification snackbar</nve-button>
      <nve-notification hidden closable position="bottom" alignment="end" trigger="notification-btn" close-timeout="2000" status="accent">
        <h3 nve-text="label">notification</h3>
        <p nve-text="body">some text content in a notification</p>  
      </nve-notification>

      <script type="module">
        const tooltip = document.querySelector('nve-tooltip');
        tooltip.addEventListener('open', () => tooltip.hidden = false);
        tooltip.addEventListener('close', () => tooltip.hidden = true);

        const toast = document.querySelector('nve-toast');
        toast.addEventListener('open', () => toast.hidden = false);
        toast.addEventListener('close', () => toast.hidden = true);

        const dropdown = document.querySelector('nve-dropdown');
        dropdown.addEventListener('open', () => dropdown.hidden = false);
        dropdown.addEventListener('close', () => dropdown.hidden = true);

        const dialog = document.querySelector('nve-dialog');
        dialog.addEventListener('open', () => dialog.hidden = false);
        dialog.addEventListener('close', () => dialog.hidden = true);

        const notification = document.querySelector('nve-notification');
        notification.addEventListener('open', () => notification.hidden = false);
        notification.addEventListener('close', () => notification.hidden = true);
      </script>
    </div>
  `
}

export const FeedbackPattern = {
  render: () => html`
<section id="feedback-section">
  <nve-icon-button aria-label="open feedback form" id="feedback-btn" icon-name="support" interaction="emphasize" size="lg"></nve-icon-button>
  <nve-icon-button aria-label="dismiss feedback" id="dismiss-btn" icon-name="cancel" interaction="inverse" hidden></nve-icon-button>
  <nve-tooltip id="feedback-tooltip" anchor="feedback-btn" alignment="end" hidden>Share Feedback</nve-tooltip>
</section>
<nve-notification id="feedback-notification" close-timeout="3000" position="bottom" alignment="end" status="success" hidden>
  <h3 nve-text="label">Submitted</h3>
  <p nve-text="body">Feedback will be sent to the team.</p>
</nve-notification>
<nve-dropdown id="feedback-dropdown" position="top" alignment="start" size="sm" anchor="feedback-btn" trigger="feedback-btn" hidden style="--width: 368px">
  <div nve-layout="column gap:lg align:horizontal-stretch">
    <nve-select>
      <label>Feedback type</label>
      <select autofocus>
        <option value="1">Feature Request</option>
        <option value="2">Bug/Issue</option>
        <option value="3">Other</option>
      </select>
    </nve-select>
    <nve-select>
      <label>Product</label>
      <select>
        <option value="1">Dashboard</option>
        <option value="2">Analytics</option>
        <option value="3">Tasks</option>
      </select>
    </nve-select>
    <nve-input>
      <label>Location</label>
      <input type="url" placeholder="https://example.com" />
    </nve-input>
    <nve-textarea>
      <label>Feedback</label>
      <textarea placeholder="description..." rows="8"></textarea>
    </nve-textarea>
    <nve-button id="submit-btn">Submit Feedback</nve-button>
  </div>
</nve-dropdown>
<style>
  #feedback-section {
    position: absolute;
    inset: auto 36px 36px auto;
    width: 44px;
    height: 44px;
  }

  #dismiss-btn {
    position: absolute;
    inset: auto -12px 28px auto;
    z-index: 99;
  }
</style>
<script type="module">
  const section = document.querySelector('#feedback-section');
  const tooltip = document.querySelector('#feedback-tooltip');
  const notification = document.querySelector('#feedback-notification');
  const dropdown = document.querySelector('#feedback-dropdown');
  const button = document.querySelector('#feedback-btn');
  const dismissButton = document.querySelector('#dismiss-btn');
  const submitButton = document.querySelector('#submit-btn');

  notification.addEventListener('close', () => notification.hidden = true);
  dropdown.addEventListener('close', () => toggleFeedback(true));
  dropdown.addEventListener('open', () => toggleFeedback(false));
  submitButton.addEventListener('click', () => submitFeedback());
  dismissButton.addEventListener('click', () => dismissFeedback());

  ['mousemove', 'focusin'].forEach(e => section.addEventListener(e, () => {
    if (dropdown.hidden) {
      tooltip.hidden = false;
      dismissButton.hidden = false;
    }
  }));

  ['mouseleave', 'focusout'].forEach(e => section.addEventListener(e, (event) => {
    if (!section.contains(event.relatedTarget)) {
      tooltip.hidden = true;
      dismissButton.hidden = true;
    }
  }));

  function submitFeedback() {
    toggleFeedback(true);
    notification.hidden = false;
  }

  function dismissFeedback() {
    toggleFeedback(true);
    section.hidden = true;
  }

  function toggleFeedback(hidden) {
    dropdown.hidden = hidden;
    tooltip.hidden = hidden;
    dismissButton.hidden = hidden;
    button.iconName = hidden ? 'support' : 'cancel';
  }
</script>
  `
};
