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
      <h2 nve-text="heading xs medium" slot="prefix">Workspace Settings</h2>
    </nve-accordion-header>
    <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
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
    <h2 nve-text="heading xs medium" slot="prefix">Admin Settings</h2>
    <p nve-text="body">Requires administrator access</p>
  </nve-accordion-header>
  <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
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
        <h2 nve-text="heading xs medium" slot="prefix">General</h2>
      </nve-accordion-header>
      <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
    </nve-accordion>
    <nve-accordion>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Settings</h2>
      </nve-accordion-header>
      <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
    </nve-accordion>
  </nve-accordion-group>
  <nve-accordion-group container="inset" behavior-expand>
    <nve-accordion>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">General</h2>
      </nve-accordion-header>
      <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
    </nve-accordion>
    <nve-accordion>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Settings</h2>
      </nve-accordion-header>
      <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
    </nve-accordion>
  </nve-accordion-group>
  <nve-accordion-group container="flat" behavior-expand>
    <nve-accordion>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">General</h2>
      </nve-accordion-header>
      <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
    </nve-accordion>
    <nve-accordion>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Settings</h2>
      </nve-accordion-header>
      <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
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
        <h2 nve-text="heading xs medium" slot="prefix">Release Notes</h2>
        <p nve-text="body">Version 3.2.0</p>
      </nve-accordion-header>
      <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
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
      <h2 nve-text="heading xs medium" slot="prefix">Account Settings</h2>
    </nve-accordion-header>
    <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
  </nve-accordion>
  <nve-accordion>
    <nve-accordion-header>
      <h2 nve-text="heading xs medium" slot="prefix">Security</h2>
    </nve-accordion-header>
    <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
  </nve-accordion>
</nve-accordion-group>
  `
};

/**
 * @summary Accordion with custom icon button that changes based on state. Use custom icons to provide more semantic indicators (e.g., plus/minus for add/remove patterns, chevron for expand/collapse).
 * @tags test-case
 */
export const CustomIconButton = {
  render: () => html`
<nve-accordion id="custom-icon-button-accordion">
  <nve-icon-button slot="icon-button" icon-name="add" size="sm" container="flat"></nve-icon-button>
  <nve-accordion-header>
    <h2 nve-text="heading xs medium" slot="prefix">Additional Resources</h2>
  </nve-accordion-header>
  <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
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
        <h2 nve-text="heading xs medium" slot="prefix">Pipeline Configuration</h2>
        <p nve-text="body">Last updated 2 hours ago <nve-button container="inline">view history</nve-button></p>
        <nve-icon-button container="flat" icon-name="add" size="sm" slot="suffix"></nve-icon-button>
        <nve-icon-button container="flat" icon-name="delete" size="sm" slot="suffix"></nve-icon-button>
      </nve-accordion-header>
      <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
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
        <nve-accordion-header>Details</nve-accordion-header>
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
        <div slot="title">Project Details</div>
        <div slot="subtitle">Last modified today</div>
        <nve-icon-button container="flat" icon-name="add" size="sm" slot="actions"></nve-icon-button>
        <nve-icon-button container="flat" icon-name="delete" size="sm" slot="actions"></nve-icon-button>
      </nve-accordion-header>
      <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
    </nve-accordion>
  `
};

/**
 * @summary Basic accordion component for collapsible content sections with expand/collapse functionality.
 * @tags test-case
 */
export const Single = {
  render: () => html`
<nve-accordion-group behavior-expand>
  <nve-accordion>
    <nve-accordion-header>
      <h2 nve-text="heading xs medium" slot="prefix">Appearance</h2>
    </nve-accordion-header>
    <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
  </nve-accordion>
</nve-accordion-group>
  `
};

/**
 * @summary Brings together many accordion components for embedded multi-section content organization.
 * @tags test-case
 */
export const Multiple = {
  render: () => html`
<nve-accordion-group behavior-expand>
  <nve-accordion>
    <nve-accordion-header>
      <h2 nve-text="heading xs medium" slot="prefix">Account Settings</h2>
    </nve-accordion-header>
    <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
  </nve-accordion>
  <nve-accordion>
    <nve-accordion-header>
      <h2 nve-text="heading xs medium" slot="prefix">Privacy</h2>
    </nve-accordion-header>
    <nve-accordion-content>Adjust workspace preferences and project configurations to customize your experience.</nve-accordion-content>
  </nve-accordion>
</nve-accordion-group>
  `
};