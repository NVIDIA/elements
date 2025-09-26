import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dialog/define.js';
import '@nvidia-elements/core/accordion/define.js';
import '@nvidia-elements/core/dropdown/define.js';

export default {
  title: 'Elements/Dialog',
  component: 'nve-dialog',
  parameters: {
    layout: 'centered'
  }
};

/**
 * @summary Basic modal dialog with header and content, providing a standard overlay for user interactions and information display.
 */
export const Default = {
  render: () => html`
<nve-button popovertarget="dialog">button</nve-button>
<nve-dialog id="dialog" modal closable>
  <nve-dialog-header>
    <h3 nve-text="heading semibold">title</h3>
  </nve-dialog-header>
  <p nve-text="body">some text content in a closable dialog</p>
</nve-dialog>
`
};

/**
 * @summary Visual dialog example with header, content, and footer, demonstrating complete dialog structure for comprehensive user interfaces.
 */
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

/**
 * @summary Dialog with action buttons in footer, enabling user decisions and providing clear interaction paths for dialog completion.
 */
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

/**
 * @summary Small dialog size for compact interactions and brief information display, optimizing space usage for simple user tasks.
 */
export const Small = {
  render: () => html`
<nve-dialog size="sm" closable>
  <h3 nve-text="heading">Small</h3>
  <p nve-text="body">some text content in a small dialog</p>
</nve-dialog>
  `
};

/**
 * @summary Medium dialog size for balanced content presentation, providing optimal space for standard user interactions and information display.
 */
export const Medium = {
  render: () => html`
<nve-dialog size="md" closable>
  <h3 nve-text="heading">Medium</h3>
  <p nve-text="body">some text content in a medium dialog</p>
</nve-dialog>
  `
};

/**
 * @summary Large dialog size for comprehensive content display, accommodating complex forms, detailed information, and extensive user interactions.
 */
export const Large = {
  render: () => html`
<nve-dialog size="lg" closable>
  <h3 nve-text="heading">Large</h3>
  <p nve-text="body">some text content in a large dialog</p>
</nve-dialog>
  `
};

/**
 * @summary Dialog with text wrapping behavior, demonstrating how content adapts to dialog constraints and maintains readability in limited space.
 * @tags test-case
 */
export const TextWrap = {
  render: () => html`
<nve-dialog  closable>
  <h3 nve-text="heading">Text Wrap</h3>
  <p nve-text="body">
    Some text wrapped content in a small dialog.  Some text wrapped content in a small dialog.  Some text wrapped content in a small dialog.
    Some text wrapped content in a small dialog.  Some text wrapped content in a small dialog.  Some text wrapped content in a small dialog.
    Some text wrapped content in a small dialog.  Some text wrapped content in a small dialog.  Some text wrapped content in a small dialog.
    Some text wrapped content in a small dialog.  Some text wrapped content in a small dialog.  Some text wrapped content in a small dialog.
  </p>
</nve-dialog>
  `
};

/**
 * @summary Non-closable dialog requiring explicit user action, ensuring critical interactions are completed and preventing accidental dismissal.
 */
export const NonClosable = {
  render: () => html`
<nve-button popovertarget="dialog">open</nve-button>
<nve-dialog id="dialog" modal>
  <h3 nve-text="heading">Non-Closable Dialog</h3>
  <p nve-text="body">Clicking the background to dismiss will not work here</p>
  <nve-dialog-footer>
    <nve-button popovertarget="dialog" popovertargetaction="hide">cancel</nve-button>
  </nve-dialog-footer>
</nve-dialog>
  `
};

/**
 * @summary Dialog positioning options for flexible placement, enabling contextual positioning based on user interface requirements and screen space.
 */
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

/**
 * @summary Specific dialog positioning example, demonstrating how to place dialogs in optimal locations for user interaction and visual hierarchy.
 * @tags test-case
 */
export const Position = {
  render: () => html`
<nve-dialog size="sm" position="bottom" alignment="end" closable>
  <h3 nve-text="heading">Position</h3>
  <p nve-text="body">some text content in a small dialog</p>
</nve-dialog>
  `
};

/* eslint-disable @nvidia-elements/lint/no-deprecated-popover-attributes */

/**
 * @deprecated
 * @summary Legacy trigger mechanism for dialog opening, demonstrating backward compatibility and alternative interaction patterns for dialog activation.
 * @tags test-case
 */
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
<script type="module">
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

/**
 * @deprecated
 * @summary Legacy behavior trigger for dialog management, showing traditional dialog control patterns and event handling for dialog lifecycle.
 * @tags test-case
 */
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

/**
 * @summary Dialog functionality within shadow DOM, demonstrating proper dialog behavior in encapsulated component environments and custom elements.
 * @tags test-case
 */
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

/**
 * @summary Dialog with scrollable content area, handling overflow content gracefully while maintaining dialog structure and user interaction patterns.
 */
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

/**
 * @summary Modal dialog with inert behavior, demonstrating proper focus management and accessibility compliance for modal overlays and user interaction.
 * @tags test-case
 */
export const InertModal = {
  render: () => html`
<style>
  body {
    display: block !important;
    padding: 24px;
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