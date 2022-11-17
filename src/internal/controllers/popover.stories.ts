import { html } from 'lit';

export default {
  title: 'Elements/Popovers/Examples'
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

export const Interactive = {
  render: () => html`
    <div mlv-layout="row align:center gap:xl" style="height: 300px">
      <mlv-tooltip anchor="tooltip-btn" trigger="tooltip-btn" position="top" hidden>hello there</mlv-tooltip>
      <mlv-button id="tooltip-btn">tooltip</mlv-button>

      <mlv-button id="toast-btn">toast</mlv-button>
      <mlv-toast anchor="toast-btn" trigger="toast-btn" position="top" close-timeout="1500" hidden>copied!</mlv-toast>

      <mlv-button id="dropdown-btn">dropdown</mlv-button>
      <mlv-dropdown anchor="dropdown-btn" trigger="dropdown-btn" closable hidden>
        <h3 mlv-text="heading">Title</h3>
        <p mlv-text="body">some text content in a dropdown</p>
      </mlv-dropdown>

      <mlv-button id="dialog-btn">dialog</mlv-button>
      <mlv-dialog trigger="dialog-btn" closable modal hidden>
        <h3 mlv-text="heading">Title</h3>
        <p mlv-text="body">some text content in a closable dialog</p>
      </mlv-dialog>

      <mlv-button id="notification-btn">notification snackbar</mlv-button>
      <mlv-notification hidden closable position="bottom" alignment="end" trigger="notification-btn" close-timeout="2000" status="accent">
        <h3 mlv-text="label">notification</h3>
        <p mlv-text="body">some text content in a notification</p>  
      </mlv-notification>

      <script type="module">
        const tooltip = document.querySelector('mlv-tooltip');
        tooltip.addEventListener('open', () => tooltip.hidden = false);
        tooltip.addEventListener('close', () => tooltip.hidden = true);

        const toast = document.querySelector('mlv-toast');
        toast.addEventListener('open', () => toast.hidden = false);
        toast.addEventListener('close', () => toast.hidden = true);

        const dropdown = document.querySelector('mlv-dropdown');
        dropdown.addEventListener('open', () => dropdown.hidden = false);
        dropdown.addEventListener('close', () => dropdown.hidden = true);

        const dialog = document.querySelector('mlv-dialog');
        dialog.addEventListener('open', () => dialog.hidden = false);
        dialog.addEventListener('close', () => dialog.hidden = true);

        const notification = document.querySelector('mlv-notification');
        notification.addEventListener('open', () => notification.hidden = false);
        notification.addEventListener('close', () => notification.hidden = true);
      </script>
    </div>
  `
}

export const FeedbackPattern = {
  render: () => html`
<section id="feedback-section">
  <mlv-icon-button aria-label="open feedback form" id="feedback-btn" icon-name="support" interaction="emphasize" size="lg"></mlv-icon-button>
  <mlv-icon-button aria-label="dismiss feedback" id="dismiss-btn" icon-name="cancel" interaction="inverse" hidden></mlv-icon-button>
  <mlv-tooltip id="feedback-tooltip" anchor="feedback-btn" alignment="end" hidden>Share Feedback</mlv-tooltip>
</section>
<mlv-notification id="feedback-notification" close-timeout="3000" position="bottom" alignment="end" status="success" hidden>
  <h3 mlv-text="label">Submitted</h3>
  <p mlv-text="body">Feedback will be sent to the team.</p>
</mlv-notification>
<mlv-dropdown id="feedback-dropdown" position="top" alignment="start" size="sm" anchor="feedback-btn" trigger="feedback-btn" hidden style="--width: 368px">
  <div mlv-layout="column gap:lg align:horizontal-stretch">
    <mlv-select>
      <label>Feedback type</label>
      <select autofocus>
        <option value="1">Feature Request</option>
        <option value="2">Bug/Issue</option>
        <option value="3">Other</option>
      </select>
    </mlv-select>
    <mlv-select>
      <label>Product</label>
      <select>
        <option value="1">Dashboard</option>
        <option value="2">Analytics</option>
        <option value="3">Tasks</option>
      </select>
    </mlv-select>
    <mlv-input>
      <label>Location</label>
      <input type="url" placeholder="https://example.com" />
    </mlv-input>
    <mlv-textarea>
      <label>Feedback</label>
      <textarea placeholder="description..." rows="8"></textarea>
    </mlv-textarea>
    <mlv-button id="submit-btn">Submit Feedback</mlv-button>
  </div>
</mlv-dropdown>
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
