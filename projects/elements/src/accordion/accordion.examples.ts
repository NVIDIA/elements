import { html } from 'lit';
import '@nvidia-elements/core/accordion/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/button/define.js';

export default {
  title: 'Elements/Accordion',
  component: 'nve-accordion',
};

/**
 * @summary Basic accordion component for collapsible content sections. Use accordions to progressively disclose information, helping users focus on relevant content while keeping the interface compact and scannable.
 */
export const Default = {
  render: () => html`
<nve-accordion-group behavior-expand>
  <nve-accordion>
    <nve-accordion-header>
      <h2 nve-text="heading xs medium" slot="prefix">Heading</h2>
    </nve-accordion-header>
    <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
  </nve-accordion>
</nve-accordion-group>
  `
};

/**
 * @summary Disabled accordion state for read-only content display. Use when accordion sections are temporarily unavailable or conditionally accessible based on user permissions, providing visual feedback about inaccessible content.
 */
export const Disabled = {
  render: () => html`
<nve-accordion behavior-expand disabled>
  <nve-accordion-header>
    <h2 nve-text="heading xs medium" slot="prefix">Heading</h2>
    <p nve-text="body">some additional content</p>
  </nve-accordion-header>
  <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
</nve-accordion>
  `
};


/**
 * @summary Accordion container variants for different visual emphasis levels. Use default for standard sections, inset for elevated content within cards, and flat for minimal visual weight in dense layouts or sidebars.
 */
export const Container = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-accordion-group behavior-expand>
    <nve-accordion>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Heading 1</h2>
      </nve-accordion-header>
      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
    <nve-accordion>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Heading 2</h2>
      </nve-accordion-header>
      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
  </nve-accordion-group>
  <nve-accordion-group container="inset" behavior-expand>
    <nve-accordion>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Heading 1</h2>
      </nve-accordion-header>
      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
    <nve-accordion>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Heading 2</h2>
      </nve-accordion-header>
      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
  </nve-accordion-group>
  <nve-accordion-group container="flat" behavior-expand>
    <nve-accordion>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Heading 1</h2>
      </nve-accordion-header>
      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
    <nve-accordion>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Heading 2</h2>
      </nve-accordion-header>
      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
  </nve-accordion-group>
</div>
  `
};

/**
 * @summary Accordion with custom CSS transitions for enhanced visual feedback during state changes. Use animated accordions to provide smoother, more polished interactions, particularly in content-heavy interfaces where transitions help users track what changed.
 * @tags test-case
 */
export const Animated = {
  render: () => html`
    <nve-accordion behavior-expand style="--transition: height 0.3s ease-in-out">
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Heading</h2>
        <p nve-text="body">some additional content</p>
      </nve-accordion-header>
      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
  `
};

/**
 * @summary Accordion group allowing only one section expanded at a time, automatically closing others. Use single-expand behavior when content sections are mutually exclusive or when you want to maintain compact vertical space by limiting expanded content to one section.
 */
export const BehaviorExpandSingle = {
  render: () => html`
<nve-accordion-group behavior-expand-single>
  <nve-accordion>
    <nve-accordion-header>
      <h2 nve-text="heading xs medium" slot="prefix">Heading</h2>
    </nve-accordion-header>
    <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
  </nve-accordion>
  <nve-accordion>
    <nve-accordion-header>
      <h2 nve-text="heading xs medium" slot="prefix">Heading</h2>
    </nve-accordion-header>
    <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
  </nve-accordion>
</nve-accordion-group>
  `
};

/**
 * @summary Accordion with custom icon button that changes based on state. Use custom icons to provide more semantic indicators (e.g., plus/minus for add/remove patterns, chevron for expand/collapse).
 * @tags test-case
 */
export const CustomIconButtonInteractive = {
  render: () => html`
<nve-accordion id="custom-icon-button-accordion">
  <nve-icon-button slot="icon-button" icon-name="add" size="sm" container="flat"></nve-icon-button>
  <nve-accordion-header>
    <h2 nve-text="heading xs medium" slot="prefix">Heading</h2>
  </nve-accordion-header>
  <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
</nve-accordion>
<script type="module">
  const accordion = document.querySelector('#custom-icon-button-accordion');
  const accordionHeader = accordion.querySelector('nve-accordion-header');
  const iconButton = accordion.querySelector('nve-icon-button');
  accordionHeader.addEventListener('click', () => toggle());
  iconButton.addEventListener('click', () => toggle());

  function toggle() {
    accordion.expanded = !accordion.expanded;
    iconButton.iconName = accordion.expanded ? 'minus' : 'add';
  }
</script>
  `
};

/**
 * @summary Accordion with action buttons in header for quick operations without expanding. Perfect for list items where users need both to view details and perform actions like edit, delete, or add, keeping common actions immediately accessible.
 */
export const WithActions = {
  render: () => html`
    <nve-accordion behavior-expand>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Heading</h2>
        <p nve-text="body">some additional content <nve-button container="inline">button</nve-button></p>
        <nve-icon-button container="flat" icon-name="add" size="sm" slot="suffix"></nve-icon-button>
        <nve-icon-button container="flat" icon-name="delete" size="sm" slot="suffix"></nve-icon-button>
      </nve-accordion-header>
      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
  `
};

/**
 * @summary Accordion with nested interactive elements like tooltips and popovers. Ensures proper event handling when accordion content contains interactive components, preventing unintended state changes and maintaining smooth user interactions.
 * @tags test-case
 */
export const NestedOpenEvent = {
  render: () => html`
    <nve-accordion-group behavior-expand-single>
      <nve-accordion>
        <nve-accordion-header>accordion</nve-accordion-header>
        <nve-accordion-content>
          <nve-tooltip id="tooltip">tooltip</nve-tooltip>
          <nve-button popovertarget="tooltip">button</nve-button>
        </nve-accordion-content>
      </nve-accordion>
    </nve-accordion-group>
  `
};

/**
 * @summary Legacy slot patterns (title, subtitle, actions) for backward compatibility. Deprecated in favor of prefix/suffix slots for more flexible content layout, but maintained to support existing implementations during migration.
 * @tags test-case
*/
export const DeprecatedSlots = {
  /* eslint-disable @nvidia-elements/lint/no-deprecated-slots */
  /* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value */
  render: () => html`
    <nve-accordion behavior-expand>
      <nve-accordion-header>
        <div slot="title">Heading</div>
        <div slot="subtitle">Subheading</div>
        <nve-icon-button container="flat" icon-name="add" size="sm" slot="actions"></nve-icon-button>
        <nve-icon-button container="flat" icon-name="delete" size="sm" slot="actions"></nve-icon-button>
      </nve-accordion-header>
      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
  `
};
