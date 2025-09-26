import { html } from 'lit';
import '@nvidia-elements/core/accordion/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/button/define.js';

export default {
  title: 'Elements/Accordion',
  component: 'nve-accordion',
};

/**
 * @summary Basic accordion component for collapsible content sections with expand/collapse functionality
 */
export const Default = {
  render: () => html`
    <nve-accordion behavior-expand>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Heading</h2>
      </nve-accordion-header>
      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
  `
};

/**
 * @summary Accordion with additional header content for richer information display in collapsed state
 */
export const Full = {
  render: () => html`
    <nve-accordion behavior-expand>
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Heading</h2>
        <p nve-text="body">some additional content</p>
      </nve-accordion-header>
      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
  `
};

/**
 * @summary Accordion with custom CSS transitions for smooth expand/collapse animations
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
 * @summary Disabled accordion state for read-only content display without interaction
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
 * @summary Accordion with inset container styling for embedded content sections
 */
export const Inset = {
  render: () => html`
    <nve-accordion behavior-expand container="inset">
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Heading</h2>
        <p nve-text="body">some additional content</p>
      </nve-accordion-header>
      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
`
};

/**
 * @summary Accordion with flat container styling for minimal visual appearance
 */
export const Flat = {
  render: () => html`
    <nve-accordion behavior-expand container="flat">
      <nve-accordion-header>
        <h2 nve-text="heading xs medium" slot="prefix">Heading</h2>
        <p nve-text="body">some additional content</p>
      </nve-accordion-header>
      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
`
};

/**
 * @summary Accordion with custom interactive icon button for enhanced user control and visual feedback
 */
export const CustomIconButtonInteractive = {
  render: () => html`
<nve-accordion id="custom-icon-button-accordion">
  <nve-icon-button slot="icon-button" icon-name="add" size="sm" container="flat"></nve-icon-button>
  <nve-accordion-header>
    <div slot="title">Heading</div>
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
 * @summary Accordion group allowing multiple sections to be expanded simultaneously
 */
export const AccordionGroupFull = {
  render: () => html`
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

      <nve-accordion>
        <nve-accordion-header>
          <h2 nve-text="heading xs medium" slot="prefix">Heading 3</h2>
        </nve-accordion-header>
        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>
    </nve-accordion-group>
  `
};

/**
 * @summary Accordion group with inset styling for embedded multi-section content organization
 */
export const AccordionGroupInset = {
  render: () => html`
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

      <nve-accordion>
        <nve-accordion-header>
          <h2 nve-text="heading xs medium" slot="prefix">Heading 3</h2>
        </nve-accordion-header>
        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>
    </nve-accordion-group>
  `
};

/**
 * @summary Accordion group with flat styling for minimal multi-section content display
 */
export const AccordionGroupFlat = {
  render: () => html`
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

      <nve-accordion>
        <nve-accordion-header>
          <h2 nve-text="heading xs medium" slot="prefix">Heading 3</h2>
        </nve-accordion-header>
        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>
    </nve-accordion-group>
  `
};

/**
 * @summary Accordion group with single-expand behavior for mutually exclusive content sections
 */
export const AccordionGroupExpandSingle = {
  render: () => html`
    <nve-accordion-group behavior-expand-single>
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

      <nve-accordion>
        <nve-accordion-header>
          <h2 nve-text="heading xs medium" slot="prefix">Heading 3</h2>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>
    </nve-accordion-group>
  `
};

/**
 * @summary Accordion with action buttons in header for interactive content management
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
 * @summary Demonstrates accordion content with nested interactive elements like tooltips and popovers
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
 * @summary Demonstrates deprecated slot patterns for backward compatibility reference
 */
export const DeprecatedSlots = {
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
