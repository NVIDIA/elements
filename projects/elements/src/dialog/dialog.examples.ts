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

/* eslint-disable @nvidia-elements/lint/no-missing-popover-trigger */

/**
 * @summary Basic modal dialog for focused user interactions. Use dialogs for confirmations, simple forms, or important information that requires user attention before continuing, creating a modal overlay that blocks interaction with the underlying page until dismissed.
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
 * @summary Use the `commandfor` and `command` attributes to trigger custom Invoker Commands, such as toggling a dialog.
 */
export const InvokerCommand = {
  render: () => html`
<nve-button commandfor="dialog" command="toggle-popover">toggle popover</nve-button>
<nve-dialog id="dialog" modal closable>
  <nve-dialog-header>
    <h3 nve-text="heading semibold">title</h3>
  </nve-dialog-header>
  <p nve-text="body">some text content in a closable dialog</p>
</nve-dialog>
`
};

/**
 * @summary Dialog with event listeners for state change tracking. Use dialog events (beforetoggle, toggle, open, close) to trigger side effects like loading data on open, cleaning up resources on close, or preventing closure based on validation state.
 * @tags test-case
 */
export const Events = {
  inline: false,
  render: () => html`
<nve-dialog id="dialog" modal closable>
  <nve-dialog-header>
    <h3 nve-text="heading semibold">title</h3>
  </nve-dialog-header>
  <p nve-text="body">some text content in a closable dialog</p>
</nve-dialog>
<nve-button popovertarget="dialog">button</nve-button>
<script type="module">
  const dialog = document.querySelector('nve-dialog');
  dialog.addEventListener('beforetoggle', () => console.log('beforetoggle'));
  dialog.addEventListener('toggle', () => console.log('toggle'));
  dialog.addEventListener('open', () => console.log('open'));
  dialog.addEventListener('close', () => console.log('close'));
</script>
  `
};

/**
 * @summary Dialog with header, content, and footer structure for complete user interactions. Use the footer for action buttons, organizing the dialog into clear sections that guide users through the information hierarchy and toward decision-making.
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
 * @summary Dialog with primary and secondary actions in footer. Use cancel + emphasized action pattern for confirmations or decisions where you need to present a choice, with emphasis on the primary action guiding users toward the preferred or expected path.
 * @tags test-case
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
 * @summary Small dialog size for brief confirmations or single-field inputs. Use size="sm" for simple yes/no confirmations, quick edits, or minimal interactions that don't require significant screen space, keeping the interface uncluttered.
 * @tags test-case
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
 * @summary Medium dialog size (default) for standard forms and content. Use size="md" for typical dialogs containing short forms (3-5 fields), moderate content, or standard user interactions that need balanced space without overwhelming the interface.
 * @tags test-case
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
 * @summary Large dialog size for complex forms or extensive content. Use size="lg" for multi-section forms, detailed settings panels, or content-rich interactions where users need more space to work comfortably, but consider using a drawer for large content areas.
 * @tags test-case
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
 * @summary Dialog with text wrapping behavior, where content adapts to dialog constraints and maintains readability in limited space.
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
 * @summary Non-closable dialog requiring explicit action through buttons. Use non-closable dialogs sparingly for critical decisions (like irreversible deletions) or required acknowledgments where you must ensure users make a conscious choice rather than accidentally dismissing the dialog.
 * @tags test-case
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
 * @summary Dialog positioning and alignment options for contextual placement. While center positioning is standard, use edge positioning (top/bottom/left/right) for contextually relevant dialogs that relate to specific interface regions or when working with limited vertical space.
 * @tags test-case
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
 * @summary Specific dialog positioning example, with placement in optimal locations for user interaction and visual hierarchy.
 * @tags test-case
 */
export const Position = {
  render: () => html`
  <style>
    body {
      min-height: 200vh;
    }
  </style>
<nve-dialog size="sm" position="bottom" alignment="end" closable>
  <h3 nve-text="heading">Position</h3>
  <p nve-text="body">some text content in a small dialog</p>
</nve-dialog>
  `
};

/* eslint-disable @nvidia-elements/lint/no-deprecated-popover-attributes */

/**
 * @deprecated
 * @summary Legacy trigger mechanism for dialog opening, with backward compatibility and alternative interaction patterns for dialog activation.
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
      <h2 nve-text="heading xs medium" slot="prefix">Heading</h2>
    </nve-accordion-header>
    <nve-accordion-content>Adjust workspace preferences including theme, notification settings, and default project configurations to customize your experience.</nve-accordion-content>
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
      <h2 nve-text="heading xs medium" slot="prefix">Heading</h2>
    </nve-accordion-header>
    <nve-accordion-content>Adjust workspace preferences including theme, notification settings, and default project configurations to customize your experience.</nve-accordion-content>
  </nve-accordion>
</nve-dialog>
  `
};

/**
 * @summary Dialog functionality within shadow DOM, with proper dialog behavior in encapsulated component environments and custom elements.
 * @tags test-case
 */
export const ShadowRoot = {
  render: () => html`
<dialog-test-shadow-root>
  <template shadowrootmode="open">
    <style>:host { box-sizing: border-box; display: block; margin: 25vh auto; width: 400px; height: 400px; background: red; visibility: visible !important; }</style>
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
  </template>
</dialog-test-shadow-root>
  `
};

/**
 * @summary Dialog with scrollable content while keeping header and footer fixed. Use scrollable content areas for dialogs with variable or lengthy content (like terms of service or detailed descriptions) while keeping action buttons always visible, ensuring users can complete the task without scrolling to find buttons.
 * @tags test-case
 */
export const ScrollContent = {
  render: () => html`
<nve-dialog id="dialog" modal closable style="height: 400px">
  <nve-dialog-header>
    <h3 nve-text="heading semibold">title</h3>
  </nve-dialog-header>
  <p nve-text="body" style="height: 600px">some tall content</p>
  <p nve-text="body">some overflow content</p>
  <nve-dialog-footer>
    <nve-button id="cancel-btn">cancel</nve-button>
  </nve-dialog-footer>
</nve-dialog>
`
};

/**
 * @summary Modal dialog with inert behavior, including proper focus management and accessibility compliance for modal overlays and user interaction.
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

/**
 * @summary Dialog with different container styles, including custom padding and layout options.
 * @tags test-case
 */
export const ContainerStyles = {
  render: () => html`
<nve-dialog id="slots-dialog" closable popover="manual" position="top">
  <nve-dialog-header>
    <h3 nve-text="heading semibold">default</h3>
  </nve-dialog-header>
  <p nve-text="body">default dialog with header and footer components</p>
  <nve-dialog-footer>
    <nve-button>button</nve-button>
  </nve-dialog-footer>
</nve-dialog>

<nve-dialog id="content-dialog" closable popover="manual" position="right">
  <h3 nve-text="heading semibold">title</h3>
  <p nve-text="body">dialog with only content and no header or footer components</p>
  <nve-button>button</nve-button>
</nve-dialog>

<nve-dialog id="custom-dialog" closable style="--padding: 0" position="bottom">
  <h3 nve-text="heading semibold">title</h3>
  <p nve-text="body">dialog with only content and no header or footer components and --padding set to 0</p>
  <nve-button>button</nve-button>
</nve-dialog>

<nve-dialog id="custom-slots" closable style="--padding: 48px;" position="left">
  <nve-dialog-header>
    <h3 nve-text="heading semibold">title</h3>
  </nve-dialog-header>
  <p nve-text="body">dialog with header and footer components with --padding set to 48px</p>
  <nve-dialog-footer>
    <nve-button>button</nve-button>
  </nve-dialog-footer>
</nve-dialog>
`
};

/**
 * @summary Dialog with overflow content, including max-height constraints and a scrollable content area.
 * @tags test-case
 */
export const MaxHeight = {
  render: () => html`
<nve-dialog id="dialog" modal closable>
  <nve-dialog-header>
    <h3 nve-text="heading semibold">title</h3>
  </nve-dialog-header>
  <p nve-text="body">some overflow content</p>
  <p nve-text="body" style="min-height: 1000px">some overflow content</p>
  <nve-button>button</nve-button>
  <nve-dialog-footer>
    <nve-button id="cancel-btn">cancel</nve-button>
  </nve-dialog-footer>
</nve-dialog>
  `
}

/**
 * @summary Legacy DOM Creation
 * @deprecated
 * @tags test-case
 */
export const LegacyDOMCreation = {
  render: () => html`
<nve-button id="dialog-btn">button</nve-button>
<script type="module">
  import '@nvidia-elements/core/dialog/define.js';
  import '@nvidia-elements/core/button/define.js';

  document.querySelector('#dialog-btn').addEventListener('click', () => {
    const dialog = document.createElement('nve-dialog');
    dialog.id = 'dialog-dom-creation';
    dialog.modal = true;
    dialog.closable = true;
    
    dialog.addEventListener('close', () => {
      document.body.removeChild(dialog);
    }, { once: true });

    document.body.appendChild(dialog);
  });
</script>
`
};


/**
 * @summary Center alignment with anchor body
 * @tags test-case
 */
export const CenterAlignment = {
  render: () => html`
<style>
  body {
    min-height: 200vh;
  }
</style>
<nve-button popovertarget="dialog">button</nve-button>
<nve-dialog id="dialog" closable>
  <nve-dialog-header>
    <h3 nve-text="heading semibold">title</h3>
  </nve-dialog-header>
  <p nve-text="body">some text content in a closable dialog</p>
  <nve-select>
    <select aria-label="select">
      <option>one</option>
      <option>two</option>
      <option>three</option>
    </select>
  </nve-select>
</nve-dialog>
`
};
