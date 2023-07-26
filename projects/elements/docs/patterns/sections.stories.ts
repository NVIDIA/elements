import { html } from 'lit';
import '@elements/elements/badge/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/card/define.js';
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
  title: 'Section Patterns/Examples'
};

export const Header = {
  render: () => html`
    <div nve-theme="root">
      <nve-card style="--border-radius: none">
        <section nve-layout="column gap:lg align:stretch pad-top:md pad-right:xl pad-bottom:md pad-left:xl">
          <div nve-layout="row gap:md align:center">
            <h1 nve-text="heading lg semibold">Page Title</h1>

            <div nve-layout="row gap:sm" style="margin-left: auto">
              <nve-icon-button icon-name="information-circle-stroke" aria-label="information"></nve-icon-button>
              <nve-icon-button icon-name="edit" aria-label="edit"></nve-icon-button>
              <nve-icon-button icon-name="more-actions" aria-label="additional actions"></nve-icon-button>
            </div>
          </div>

          <div nve-layout="row gap:xl align:vertical-center">
            <section nve-layout="row gap:xs align:center">
              <span nve-text="body sm muted">Session ID</span>
              <a nve-text="body sm bold link" href="#">13245768</a>
            </section>

            <section nve-layout="row gap:xs align:center">
              <span nve-text="body sm muted">Driver</span>
              <span nve-text="body sm bold">Jane Doe</span>
            </section>

            <section nve-layout="row gap:xs align:center">
              <span nve-text="body sm muted">Co-Pilot</span>
              <span nve-text="body sm bold">John Doe</span>
            </section>

            <section nve-layout="row gap:xs align:center">
              <span nve-text="body sm muted">Route</span>
              <span nve-text="body sm bold">Santa Clara</span>
            </section>

            <section nve-layout="row gap:xs align:center">
              <span nve-text="body sm muted">Status</span>
              <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
            </section>
          </div>
        </section>
      </nve-card>
    </div>
  `
}

export const Feedback = {
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
}

export const Row = {
  render: () => html`
  <div nve-theme="root">
    <section role="list" nve-layout="column gap:md pad:md">
      <nve-card role="listitem">
        <nve-card-content nve-layout="grid align:vertical-center align:space-between gap:md">
          <div nve-layout="span:4 row gap:md align:vertical-center">
            <img src="https://placehold.co/600x400" style="max-width: 100px" />
            <div nve-layout="column gap:sm">
              <h2 nve-text="heading sm medium">Activity Dashboard</h2>
              <p nve-text="body muted">Last saved: Oct 19, 21 by Camru</p>
            </div>
          </div>
          <p nve-text="body" nve-layout="span:5">A dashboard displaying current project activity grouped by User, Host or IP. Authors: * Camden Rudisill camden@comet.ml</p>
          <div nve-layout="span:3 row gap:sm align:right">
            <div nve-layout="row gap:xs">
              <nve-icon-button icon-name="eye"></nve-icon-button>
              <nve-icon-button icon-name="copy"></nve-icon-button>
              <nve-icon-button icon-name="delete"></nve-icon-button>
            </div>
            <nve-divider orientation="vertical"></nve-divider>
            <nve-button>Add Panel</nve-button>
          </div>
        </nve-card-content>
      </nve-card>
      <nve-card role="listitem">
        <nve-card-content nve-layout="grid align:vertical-center align:space-between gap:md">
          <div nve-layout="span:4 row gap:md align:vertical-center">
            <img src="https://placehold.co/600x400" style="max-width: 100px" />
            <div nve-layout="column gap:sm">
              <h2 nve-text="heading sm medium">Activity Dashboard</h2>
              <p nve-text="body muted">Last saved: Oct 19, 21 by Camru</p>
            </div>
          </div>
          <p nve-text="body" nve-layout="span:5">A dashboard displaying current project activity grouped by User, Host or IP. Authors: * Camden Rudisill camden@comet.ml</p>
          <div nve-layout="span:3 row gap:sm align:right">
            <div nve-layout="row gap:xs">
              <nve-icon-button icon-name="eye"></nve-icon-button>
              <nve-icon-button icon-name="copy"></nve-icon-button>
              <nve-icon-button icon-name="delete"></nve-icon-button>
            </div>
            <nve-divider orientation="vertical"></nve-divider>
            <nve-button>Add Panel</nve-button>
          </div>
        </nve-card-content>
      </nve-card>
    </section>
  </div>
  `
}