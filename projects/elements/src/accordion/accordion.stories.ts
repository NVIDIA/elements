import { html } from 'lit';
import '@elements/elements/accordion/define.js';

export default {
  title: 'Elements/Accordion/Examples',
  component: 'mlv-accordion',
};

export const Default = {
  render: () => html`
  <div mlv-theme="root">
    <mlv-accordion behavior-expand>
      <mlv-accordion-header>
        <div slot="title">Heading</div>
      </mlv-accordion-header>

      <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
    </mlv-accordion>
  </div>
  `
};

export const Inset = {
  render: () =>  html`
  <div mlv-theme="root">
    <mlv-accordion behavior-expand container="inset">
      <mlv-accordion-header>
        <div slot="title">Heading</div>
        <div slot="subtitle">Subheading</div>
      </mlv-accordion-header>

      <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
    </mlv-accordion>
  </div>
`
};

export const Flat = {
  render: () =>  html`
  <div mlv-theme="root">
    <mlv-accordion behavior-expand container="flat">
        <mlv-accordion-header>
          <div slot="title">Heading</div>
          <div slot="subtitle">Subheading</div>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>
  </div>
`
};

export const WithActions = {
  render: () => html`
  <div mlv-theme="root">
      <mlv-accordion behavior-expand>
        <mlv-accordion-header>
          <div slot="title">Heading</div>

          <mlv-icon-button interaction="ghost" icon-name="plus" size="sm" slot="actions"></mlv-icon-button>
          <mlv-icon-button interaction="ghost" icon-name="delete" size="sm" slot="actions"></mlv-icon-button>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>
  </div>
  `
};
