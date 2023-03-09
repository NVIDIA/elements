import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/search/define.js';
import '@elements/elements/textarea/define.js';
import '@elements/elements/select/define.js';
import '@elements/elements/dialog/define.js';
import '@elements/elements/tooltip/define.js';
import '@elements/elements/toast/define.js';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/notification/define.js';
import '@elements/elements/input/define.js';

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
      <nve-notification hidden closable position="bottom" alignment="end" trigger="notification-btn" close-timeout="2000">
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
<nve-dropdown hidden id="feedback-dropdown" position="top" alignment="start" size="sm" anchor="feedback-btn" trigger="feedback-btn" style="--width: 368px">
  <form id="feedback-form" nve-layout="column gap:lg align:horizontal-stretch">
    <nve-select>
      <label>Feedback type</label>
      <select name="type">
        <option value="1">Feature Request</option>
        <option value="2">Bug/Issue</option>
        <option value="3">Other</option>
      </select>
    </nve-select>
    <nve-select>
      <label>Product</label>
      <select name="product">
        <option value="1">Dashboard</option>
        <option value="2">Analytics</option>
        <option value="3">Tasks</option>
      </select>
    </nve-select>
    <nve-input>
      <label>Location</label>
      <input type="url" placeholder="https://example.com" name="url" />
    </nve-input>
    <nve-textarea>
      <label>Feedback</label>
      <textarea placeholder="description..." rows="8" required name="description"></textarea>
      <nve-control-message error="valueMissing">required</nve-control-message>
    </nve-textarea>
    <nve-control style="">
      <label>How satisfied are you with this product?</label>
      <section nve-control class="rating-radio">
        <input type="radio" aria-label="1" value="1" name="radio-rating" />
        <input type="radio" aria-label="2" value="2" name="radio-rating" />
        <input type="radio" aria-label="3" value="3" name="radio-rating" />
        <input type="radio" aria-label="4" value="4" name="radio-rating" />
        <input type="radio" aria-label="5" value="5" name="radio-rating" />
      </section>
      <nve-control-message style="width: 100%;">
        <div style="display: flex; width: 100%;">
          <span>Not satisfied</span>
          <span style="margin-inline-start: auto">Very satisfied</span>
        </div>
      </nve-control-message>
    </nve-control>
    <nve-button id="submit-btn">Submit Feedback</nve-button>
  </form>
</nve-dropdown>
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
    --background: var(--nve-sys-interaction-background);
    background-image: linear-gradient(color-mix(in oklab, var(--background) 100%, var(--nve-sys-interaction-state-mix) var(--nve-sys-interaction-state-ratio)) 0 0) !important;
    background: var(--background);
    color: var(--nve-sys-interaction-color);
    border-radius: var(--nve-ref-border-radius-md);
    height: var(--nve-ref-size-1000);
    content: attr(value) ' ';
    justify-content: center;
    place-items: center;
    display: flex;
    width: 100%;
  }

  .rating-radio input:checked::after {
    --background: var(--nve-sys-accent-secondary-background);
    color: var(--nve-sys-text-white-color);
  }

  .rating-radio input:focus::after {
    outline: Highlight solid 2px;
    outline: 5px auto -webkit-focus-ring-color;
  }

  .rating-radio input:hover {
    --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-hover);
  }

  #feedback-section {
    inset: auto var(--nve-ref-size-900) var(--nve-ref-size-900) auto;
    height: var(--nve-ref-size-1000);
    width: var(--nve-ref-size-1000);
    position: fixed;
  }

  #dismiss-btn {
    position: absolute;
    inset: auto calc(-1 * var(--nve-ref-size-400)) var(--nve-ref-size-600) auto;
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
