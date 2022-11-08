import { html } from 'lit';
import { spread } from '@elements/elements/internal';
import { Dialog } from '@elements/elements/dialog';
import '@elements/elements/card/define.js';
import '@elements/elements/dialog/define.js';

export default {
  title: 'Elements/Dialog/Examples',
  component: 'nve-dialog',
  parameters: { badges: ['alpha'] },
  inline: false,
  argTypes: {
    position: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left'],
      defaultValue: 'center'
    },
    alignment: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      defaultValue: 'center'
    }
  }
};

type ArgTypes = Dialog;

export const Default = {
  inline: false,
  render: (args: ArgTypes) => html`
    <nve-dialog ${spread(args)} closable>
      <h3 nve-text="heading">Title</h3>
      <p nve-text="body">some text content in a closable dialog</p>
    </nve-dialog>
  `,
  args: { textContent: 'hello there' }
};

export const Interactive = {
  inline: false,
  render: () => html`
<nve-button id="dialog-btn">open</nve-button>
<nve-dialog closable modal hidden>
  <h3 nve-text="heading">Title</h3>
  <p nve-text="body">some text content in a closable dialog</p>
</nve-dialog>
<script>
  const dialog = document.querySelector('nve-dialog');
  const btn = document.querySelector('#dialog-btn');
  btn.addEventListener('click', () => dialog.hidden = false);
  dialog.addEventListener('close', () => dialog.hidden = true);
</script>
  `
};

export const Content = {
  inline: false,
  render: () => html`
<nve-dialog closable>
  <nve-dialog-header>
    <h3 nve-text="heading">title</h3>
  </nve-dialog-header>
  <p nve-text="body">some text content in a closable dialog</p>
  <nve-dialog-footer>
    <nve-button>cancel</nve-button>
    <nve-button interaction="emphasize">action</nve-button>
  </nve-dialog-footer>
</nve-dialog>
  `
};

export const Small = {
  render: () => html`
<nve-dialog size="sm" closable>
  <h3 nve-text="heading">Small</h3>
  <p nve-text="body">some text content in a small dialog</p>
</nve-dialog>
  `
};

export const Medium = {
  render: () => html`
<nve-dialog size="md" closable>
  <h3 nve-text="heading">Medium</h3>
  <p nve-text="body">some text content in a medium dialog</p>
</nve-dialog>
  `
};

export const Large = {
  render: () => html`
<nve-dialog size="lg" closable>
  <h3 nve-text="heading">Large</h3>
  <p nve-text="body">some text content in a large dialog</p>
</nve-dialog>
  `
};

export const Alignment = {
  inline: false,
  render: () => html`
  <nve-dialog position="top">top center</nve-dialog>
  <nve-dialog position="top" alignment="start">top start</nve-dialog>
  <nve-dialog position="top">top center</nve-dialog>
  <nve-dialog position="top" alignment="end">top end</nve-dialog>

  <nve-dialog position="right" alignment="start">right start</nve-dialog>
  <nve-dialog position="right">right center</nve-dialog>
  <nve-dialog position="right" alignment="end">right end</nve-dialog>

  <nve-dialog position="bottom" alignment="start">bottom start</nve-dialog>
  <nve-dialog position="bottom">bottom center</nve-dialog>
  <nve-dialog position="bottom" alignment="end">bottom end</nve-dialog>

  <nve-dialog position="left" alignment="start">left start</nve-dialog>
  <nve-dialog position="left">left center</nve-dialog>
  <nve-dialog position="left" alignment="end">left end</nve-dialog>
  `
};

export const Position = {
  render: () => html`
<style>
  #feedback-btn {
    --padding: 12px;
    position: absolute;
    inset: auto 36px 36px auto;
  }

  #feedback-dialog {
    --max-width: 400px;
    --nve-sys-layer-popup-offset: 8px;
  }
</style>
<nve-icon-button id="feedback-btn" icon-name="cancel" interaction="emphasize"></nve-icon-button>
<nve-dialog id="feedback-dialog" position="top" alignment="start" anchor="feedback-btn">
  <div nve-layout="column gap:lg">
    <nve-select>
      <label>Feedback type</label>
      <select>
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
    <nve-button style="--width: 100%">Submit Feedback</nve-button>
  </div>
</nve-dialog>
  `
};