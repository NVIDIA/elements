import { html } from 'lit';
import '@elements/elements/accordion/define.js';

export default {
  title: 'Elements/Accordion/Examples',
  component: 'nve-accordion',
};

export const Default = {
  render: () => html`
  <div nve-theme="root">
    <nve-accordion behavior-expand>
      <nve-accordion-header>
        <div slot="title">Heading</div>
      </nve-accordion-header>

      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
  </div>
  `
};

export const Disabled = {
  render: () => html`
  <div nve-theme="root">
    <nve-accordion behavior-expand disabled>
      <nve-accordion-header>
        <div slot="title">Heading</div>
      </nve-accordion-header>

      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
  </div>
  `
};

export const Inset = {
  render: () =>  html`
  <div nve-theme="root">
    <nve-accordion behavior-expand container="inset">
      <nve-accordion-header>
        <div slot="title">Heading</div>
        <div slot="subtitle">Subheading</div>
      </nve-accordion-header>

      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
  </div>
`
};

export const Flat = {
  render: () =>  html`
  <div nve-theme="root">
    <nve-accordion behavior-expand container="flat">
        <nve-accordion-header>
          <div slot="title">Heading</div>
          <div slot="subtitle">Subheading</div>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>
  </div>
`
};

export const WithActions = {
  render: () => html`
  <div nve-theme="root">
      <nve-accordion behavior-expand>
        <nve-accordion-header>
          <div slot="title">Heading</div>

          <nve-icon-button interaction="flat" icon-name="add" size="sm" slot="actions"></nve-icon-button>
          <nve-icon-button interaction="flat" icon-name="delete" size="sm" slot="actions"></nve-icon-button>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>
  </div>
  `
};

export const AccordionGroupFull = {
  render: () => html`
  <div nve-theme="root">
    <nve-accordion-group behavior-expand>
      <nve-accordion>
        <nve-accordion-header>
          <div slot="title">Heading 1</div>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>

      <nve-accordion>
        <nve-accordion-header>
          <div slot="title">Heading 2</div>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>

      <nve-accordion>
        <nve-accordion-header>
          <div slot="title">Heading 3</div>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>
    </nve-accordion-group>
  </div>
  `
};

export const AccordionGroupInset = {
  render: () => html`
  <div nve-theme="root">
    <nve-accordion-group container="inset" behavior-expand>
      <nve-accordion>
        <nve-accordion-header>
          <div slot="title">Heading 1</div>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>

      <nve-accordion>
        <nve-accordion-header>
          <div slot="title">Heading 2</div>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>

      <nve-accordion>
        <nve-accordion-header>
          <div slot="title">Heading 3</div>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>
    </nve-accordion-group>
  </div>
  `
};

export const AccordionGroupFlat = {
  render: () => html`
  <div nve-theme="root">
    <nve-accordion-group container="flat" behavior-expand>
      <nve-accordion>
        <nve-accordion-header>
          <div slot="title">Heading 1</div>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>

      <nve-accordion>
        <nve-accordion-header>
          <div slot="title">Heading 2</div>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>

      <nve-accordion>
        <nve-accordion-header>
          <div slot="title">Heading 3</div>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>
    </nve-accordion-group>
  </div>
  `
};

export const AccordionGroupExpandSingle = {
  render: () => html`
  <div nve-theme="root">
    <nve-accordion-group behavior-expand-single>
      <nve-accordion>
        <nve-accordion-header>
          <div slot="title">Heading 1</div>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>

      <nve-accordion>
        <nve-accordion-header>
          <div slot="title">Heading 2</div>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>

      <nve-accordion>
        <nve-accordion-header>
          <div slot="title">Heading 3</div>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>
    </nve-accordion-group>
  </div>
  `
};
