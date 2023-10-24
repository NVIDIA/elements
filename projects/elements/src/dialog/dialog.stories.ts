import { html } from 'lit';
import { spread } from '@elements/elements/internal';
import { Dialog } from '@elements/elements/dialog';
import '@elements/elements/card/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/dialog/define.js';

export default {
  title: 'Elements/Dialog/Examples',
  component: 'nve-dialog',
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
      <h3 nve-text="heading semibold sm">Title</h3>
      <p nve-text="body">some text content in a closable dialog</p>
    </nve-dialog>
  `,
  args: { textContent: 'hello there' }
};

export const Interactive = {
  inline: false,
  render: () => html`
<nve-button id="dialog-btn">open</nve-button>
<nve-dialog trigger="dialog-btn" closable modal hidden>
  <h3 nve-text="heading">Title</h3>
  <p nve-text="body">some text content in a closable dialog</p>
</nve-dialog>
<script type="module">
  const dialog = document.querySelector('nve-dialog');
  dialog.addEventListener('open', () => dialog.hidden = false);
  dialog.addEventListener('close', () => dialog.hidden = true);
</script>
  `
};

export const BehaviorTrigger = {
  inline: false,
  render: () => html`
<nve-button id="dialog-btn">open</nve-button>
<nve-dialog trigger="dialog-btn" behavior-trigger closable modal hidden>
  <h3 nve-text="heading">Title</h3>
  <p nve-text="body">some text content in a closable dialog</p>
</nve-dialog>
  `
};

export const Content = {
  inline: false,
  render: () => html`
<nve-dialog closable>
  <nve-dialog-header>
    <h3 nve-text="heading semibold">title</h3>
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

export const NonClosable = {
  render: () => html`
<nve-button id="open-btn">open</nve-button>
<nve-dialog hidden modal>
  <h3 nve-text="heading">Non-Closable Dialog</h3>
  <p nve-text="body">escape key and light dismiss will not work here</p>
  <nve-dialog-footer>
    <nve-button id="cancel-btn">cancel</nve-button>
  </nve-dialog-footer>
</nve-dialog>
<script type="module">
  const dialog = document.querySelector('nve-dialog');
  const open = document.querySelector('#open-btn');
  const cancel = document.querySelector('#cancel-btn');
  open.addEventListener('click', () => dialog.hidden = false);
  cancel.addEventListener('click', () => dialog.hidden = true);
</script>
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
<nve-dialog size="sm" position="bottom" alignment="end" closable>
  <h3 nve-text="heading">Position</h3>
  <p nve-text="body">some text content in a small dialog</p>
</nve-dialog>
  `
};