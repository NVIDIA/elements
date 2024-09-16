import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dialog/define.js';
import '@nvidia-elements/core/accordion/define.js';

export default {
  title: 'Elements/Dialog/Examples',
  component: 'nve-dialog',
  parameters: {
    layout: 'centered'
  }
};

export const Default = {
  render: () => html`
<nve-dialog id="dialog" modal closable>
  <nve-dialog-header>
    <h3 nve-text="heading semibold">title</h3>
  </nve-dialog-header>
  <p nve-text="body">some text content in a closable dialog</p>
</nve-dialog>
<nve-button popovertarget="dialog">button</nve-button>
`
};

export const Visual = {
  render: () => html`
<nve-dialog closable>
  <nve-dialog-header>
    <h3 nve-text="heading semibold">title</h3>
  </nve-dialog-header>
  <p nve-text="body">some text content in a closable dialog</p>
  <nve-dialog-footer>
    <nve-button>button</nve-button>
  </nve-dialog-footer>
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
    <nve-button interaction="emphasis">action</nve-button>
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

export const LegacyBehaviorTrigger = {
  inline: false,
  render: () => html`
<nve-button id="dialog-btn">open</nve-button>
<nve-dialog trigger="dialog-btn" behavior-trigger closable modal hidden>
  <h3 nve-text="heading">Title</h3>
  <p nve-text="body">some text content in a closable dialog</p>

  <nve-accordion behavior-expand>
    <nve-accordion-header>
      <div slot="title">Heading</div>
    </nve-accordion-header>

    <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
  </nve-accordion>
</nve-dialog>
  `
};