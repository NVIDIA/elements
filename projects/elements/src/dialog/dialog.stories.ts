import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dialog/define.js';
import '@nvidia-elements/core/accordion/define.js';
import '@nvidia-elements/core/dropdown/define.js';

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
<nve-button popovertarget="dialog">open</nve-button>
<nve-dialog id="dialog" modal>
  <h3 nve-text="heading">Non-Closable Dialog</h3>
  <p nve-text="body">escape key and light dismiss will not work here</p>
  <nve-dialog-footer>
    <nve-button popovertarget="dialog" popovertargetaction="hide">cancel</nve-button>
  </nve-dialog-footer>
</nve-dialog>
  `
};

export const Alignment = {
  inline: false,
  render: () => html`
  <nve-dialog>center</nve-dialog>

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

export const LegacyTrigger = {
  inline: false,
  render: () => html`
<nve-button id="dialog-btn">open</nve-button>
<nve-dialog trigger="dialog-btn" closable modal hidden>
  <h3 nve-text="heading">Title</h3>
  <p nve-text="body">some text content in a closable dialog</p>

  <nve-accordion behavior-expand>
    <nve-accordion-header>
      <div slot="title">Heading</div>
    </nve-accordion-header>

    <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
  </nve-accordion>
</nve-dialog>
<script>
  const dialog = document.querySelector('nve-dialog');
  dialog.addEventListener('open', e => {
    console.log(e);
    dialog.hidden = false;
  });

  dialog.addEventListener('close', e => {
    console.log(e);
    dialog.hidden = true;
  });
</script>
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

export const ShadowRoot = {
  render: () => html`
<dialog-test-shadow-root></dialog-test-shadow-root>
<script type="module">
  customElements.define('dialog-test-shadow-root', class DialogTestShadowRoot extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({mode: 'open'});

      const template = document.createElement('template');
      template.innerHTML = \`
        <style>:host { box-sizing: border-box; width: 100vw; height: 100vh; }</style>
        <nve-dialog size="sm">center</nve-dialog>

        <nve-dialog size="sm" position="top">top center</nve-dialog>
        <nve-dialog size="sm" position="top" alignment="start">top start</nve-dialog>
        <nve-dialog size="sm" position="top" alignment="end">top end</nve-dialog>

        <nve-dialog size="sm" position="right" alignment="start">right start</nve-dialog>
        <nve-dialog size="sm" position="right">right center</nve-dialog>
        <nve-dialog size="sm" position="right" alignment="end">right end</nve-dialog>

        <nve-dialog size="sm" position="bottom" alignment="start">bottom start</nve-dialog>
        <nve-dialog size="sm" position="bottom">bottom center</nve-dialog>
        <nve-dialog size="sm" position="bottom" alignment="end">bottom end</nve-dialog>

        <nve-dialog size="sm" position="left" alignment="start">left start</nve-dialog>
        <nve-dialog size="sm" position="left">left center</nve-dialog>
        <nve-dialog size="sm" position="left" alignment="end">left end</nve-dialog>
      \`;
      this._shadow.appendChild(template.content);
    }
  });
</script>
  `
};

export const ScrollContent = {
  render: () => html`
<nve-dialog id="dialog" modal closable style="height: 400px">
  <nve-dialog-header>
    <h3 nve-text="heading semibold">title</h3>
  </nve-dialog-header>
  <div style="overflow: auto; max-height: 350px;">
    <p nve-text="body" style="height: 400px">
      some overflow content
    </p>
  </div>
  <nve-dialog-footer>
    <nve-button id="cancel-btn">cancel</nve-button>
  </nve-dialog-footer>
</nve-dialog>
`
};

export const TallContent = {
  render: () => html`
<nve-dialog id="dialog" modal closable>
  <nve-dialog-header>
    <h3 nve-text="heading semibold">title</h3>
  </nve-dialog-header>
  <p nve-text="body" style="height: 400px">
    some overflow content
  </p>
  <nve-dialog-footer>
    <nve-button id="cancel-btn">cancel</nve-button>
  </nve-dialog-footer>
</nve-dialog>
`
};

export const InertModal = {
  render: () => html`
<style>
  body {
    display: block !important;
    padding: 24px;
  }

  #storybook-root {
    display: block;
    margin: 0 !important;
  }
</style>
<div>
  <button popovertarget="popover">btn</button>
  <div>
    <button popovertarget="popover">btn</button>
    <nve-dialog id="popover" modal>
      <nve-dialog-header>
        <h3 nve-text="heading semibold">title</h3>
      </nve-dialog-header>
      <button popovertarget="dropdown">button</button>
      <nve-dropdown id="dropdown">
        dropdown content
        <button>btn</button>
      </nve-dropdown>
      <p nve-text="body">some text content in a closable dialog</p>
      <button onclick="alert('!')">btn</button>
      <button>btn</button>
      <button>btn</button>
    </nve-dialog>
  </div>
</div>

<button popovertarget="popover">btn</button><br>

<button popovertarget="popover">btn</button>
<div>
  <button popovertarget="popover">btn</button>
  <div>
    <button popovertarget="popover">btn</button>
    <div>
      <button popovertarget="popover">btn</button>
    </div>
  </div>
</div>
`
};