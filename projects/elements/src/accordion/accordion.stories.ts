import { html } from 'lit';
import '@nvidia-elements/core/accordion/define.js';

export default {
  title: 'Elements/Accordion/Examples',
  component: 'nve-accordion',
};

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
