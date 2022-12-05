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
      <mlv-notification hidden closable position="bottom" alignment="end" trigger="notification-btn" close-timeout="2000">
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
<mlv-dropdown hidden id="feedback-dropdown" position="top" alignment="start" size="sm" anchor="feedback-btn" trigger="feedback-btn" style="--width: 368px">
  <form id="feedback-form" mlv-layout="column gap:lg align:horizontal-stretch">
    <mlv-select>
      <label>Feedback type</label>
      <select autofocus name="type">
        <option value="1">Feature Request</option>
        <option value="2">Bug/Issue</option>
        <option value="3">Other</option>
      </select>
    </mlv-select>
    <mlv-select>
      <label>Product</label>
      <select name="product">
        <option value="1">Dashboard</option>
        <option value="2">Analytics</option>
        <option value="3">Tasks</option>
      </select>
    </mlv-select>
    <mlv-input>
      <label>Location</label>
      <input type="url" placeholder="https://example.com" name="url" />
    </mlv-input>
    <mlv-textarea>
      <label>Feedback</label>
      <textarea placeholder="description..." rows="8" required name="description"></textarea>
      <mlv-control-message error="valueMissing">required</mlv-control-message>
    </mlv-textarea>
    <mlv-control style="">
      <label>How satisfied are you with this product?</label>
      <section mlv-control class="rating-radio">
        <input type="radio" aria-label="1" value="1" name="radio-rating" />
        <input type="radio" aria-label="2" value="2" name="radio-rating" />
        <input type="radio" aria-label="3" value="3" name="radio-rating" />
        <input type="radio" aria-label="4" value="4" name="radio-rating" />
        <input type="radio" aria-label="5" value="5" name="radio-rating" />
      </section>
      <mlv-control-message style="width: 100%;">
        <div style="display: flex; width: 100%;">
          <span>Not satisfied</span>
          <span style="margin-inline-start: auto">Very satisfied</span>
        </div>
      </mlv-control-message>
    </mlv-control>
    <mlv-button id="submit-btn">Submit Feedback</mlv-button>
  </form>
</mlv-dropdown>
<style>
  .rating-radio {
    display: grid;
    grid-template-columns: repeat(5, 18.4%);
    width: 102%;
    gap: 2%;
    outline: 0;
  }

  .rating-radio input {
    width: 100%;
    height: 40px;
    margin: 0;
    outline-offset: 4px;
    cursor: pointer;
    outline: 0;
  }

  .rating-radio input::after {
    background: var(--mlv-sys-interaction-default-background);
    background-image: linear-gradient(hsla(0, 0%, var(--mlv-sys-interaction-state-lightness), var(--mlv-sys-interaction-state-alpha)) 0 0);
    color: var(--mlv-sys-interaction-default-color);
    border-radius: var(--mlv-ref-border-radius-md);
    height: var(--mlv-ref-size-1000);
    content: attr(value) ' ';
    justify-content: center;
    place-items: center;
    display: flex;
    width: 100%;
  }

  .rating-radio input:checked::after {
    background: var(--mlv-sys-accent-secondary-background);
    color: var(--mlv-sys-text-white-color);
  }

  .rating-radio input:focus::after {
    outline: Highlight solid 2px;
    outline: 5px auto -webkit-focus-ring-color;
  }

  .rating-radio input:hover {
    --mlv-sys-interaction-state-alpha: var(--mlv-sys-interaction-state-hover-alpha);
  }

  #feedback-section {
    inset: auto var(--mlv-ref-size-900) var(--mlv-ref-size-900) auto;
    height: var(--mlv-ref-size-1000);
    width: var(--mlv-ref-size-1000);
    position: fixed;
  }

  #dismiss-btn {
    position: absolute;
    inset: auto calc(-1 * var(--mlv-ref-size-400)) var(--mlv-ref-size-600) auto;
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
  const feedbackForm = document.querySelector('#feedback-form');

  notification.addEventListener('close', () => notification.hidden = true);
  dropdown.addEventListener('close', () => toggleFeedback(true));
  dropdown.addEventListener('open', () => toggleFeedback(false));
  dismissButton.addEventListener('click', () => dismissFeedback());

  feedbackForm.addEventListener('submit', e => {
    e.preventDefault();
    toggleFeedback(true);
    notification.hidden = false;
    console.log(Object.fromEntries(new FormData(e.target)));
  });

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
