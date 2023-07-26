import { html } from 'lit';
import { spread } from '@elements/elements/internal';
import { Dialog } from '@elements/elements/dialog';
import '@elements/elements/card/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/dialog/define.js';

export default {
  title: 'Elements/Dialog/Examples',
  component: 'mlv-dialog',
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
    <mlv-dialog ${spread(args)} closable>
      <h3 mlv-text="heading semibold sm">Title</h3>
      <p mlv-text="body">some text content in a closable dialog</p>
    </mlv-dialog>
  `,
  args: { textContent: 'hello there' }
};

export const Interactive = {
  inline: false,
  render: () => html`
<mlv-button id="dialog-btn">open</mlv-button>
<mlv-dialog closable modal hidden>
  <h3 mlv-text="heading">Title</h3>
  <p mlv-text="body">some text content in a closable dialog</p>
</mlv-dialog>
<script>
  const dialog = document.querySelector('mlv-dialog');
  const btn = document.querySelector('#dialog-btn');
  btn.addEventListener('click', () => dialog.hidden = false);
  dialog.addEventListener('close', () => dialog.hidden = true);
</script>
  `
};

export const Content = {
  inline: false,
  render: () => html`
<mlv-dialog closable>
  <mlv-dialog-header>
    <h3 mlv-text="heading semibold">title</h3>
  </mlv-dialog-header>
  <p mlv-text="body">some text content in a closable dialog</p>
  <mlv-dialog-footer>
    <mlv-button>cancel</mlv-button>
    <mlv-button interaction="emphasize">action</mlv-button>
  </mlv-dialog-footer>
</mlv-dialog>
  `
};

export const Small = {
  render: () => html`
<mlv-dialog size="sm" closable>
  <h3 mlv-text="heading">Small</h3>
  <p mlv-text="body">some text content in a small dialog</p>
</mlv-dialog>
  `
};

export const Medium = {
  render: () => html`
<mlv-dialog size="md" closable>
  <h3 mlv-text="heading">Medium</h3>
  <p mlv-text="body">some text content in a medium dialog</p>
</mlv-dialog>
  `
};

export const Large = {
  render: () => html`
<mlv-dialog size="lg" closable>
  <h3 mlv-text="heading">Large</h3>
  <p mlv-text="body">some text content in a large dialog</p>
</mlv-dialog>
  `
};

export const NonClosable = {
  render: () => html`
<mlv-button id="open-btn">open</mlv-button>
<mlv-dialog hidden modal>
  <h3 mlv-text="heading">Non-Closable Dialog</h3>
  <p mlv-text="body">escape key and light dismiss will not work here</p>
  <mlv-dialog-footer>
    <mlv-button id="cancel-btn">cancel</mlv-button>
  </mlv-dialog-footer>
</mlv-dialog>
<script>
  const dialog = document.querySelector('mlv-dialog');
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
  <mlv-dialog position="top">top center</mlv-dialog>
  <mlv-dialog position="top" alignment="start">top start</mlv-dialog>
  <mlv-dialog position="top">top center</mlv-dialog>
  <mlv-dialog position="top" alignment="end">top end</mlv-dialog>

  <mlv-dialog position="right" alignment="start">right start</mlv-dialog>
  <mlv-dialog position="right">right center</mlv-dialog>
  <mlv-dialog position="right" alignment="end">right end</mlv-dialog>

  <mlv-dialog position="bottom" alignment="start">bottom start</mlv-dialog>
  <mlv-dialog position="bottom">bottom center</mlv-dialog>
  <mlv-dialog position="bottom" alignment="end">bottom end</mlv-dialog>

  <mlv-dialog position="left" alignment="start">left start</mlv-dialog>
  <mlv-dialog position="left">left center</mlv-dialog>
  <mlv-dialog position="left" alignment="end">left end</mlv-dialog>
  `
};

export const Position = {
  render: () => html`
<mlv-dialog size="sm" position="bottom" alignment="end" closable>
  <h3 mlv-text="heading">Position</h3>
  <p mlv-text="body">some text content in a small dialog</p>
</mlv-dialog>
  `
};