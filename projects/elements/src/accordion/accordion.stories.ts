import { html } from 'lit';
import '@nvidia-elements/core/accordion/define.js';

export default {
  title: 'Elements/Accordion/Examples',
  component: 'mlv-accordion',
};

export const Default = {
  render: () => html`
  <div>
    <mlv-accordion>
      <mlv-accordion-header>
        <div slot="title">Heading</div>
      </mlv-accordion-header>

      <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
    </mlv-accordion>
  </div>
  `
};

export const Full = {
  render: () => html`
  <div>
    <mlv-accordion behavior-expand>
      <mlv-accordion-header>
        <div slot="title">Heading</div>
      </mlv-accordion-header>

      <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
    </mlv-accordion>
  </div>
  `
};

export const Disabled = {
  render: () => html`
  <div>
    <mlv-accordion behavior-expand disabled>
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
  <div>
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
  <div>
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
  <div>
      <mlv-accordion behavior-expand>
        <mlv-accordion-header>
          <div slot="title">Heading</div>

          <mlv-icon-button container="flat" icon-name="add" size="sm" slot="actions"></mlv-icon-button>
          <mlv-icon-button container="flat" icon-name="delete" size="sm" slot="actions"></mlv-icon-button>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>
  </div>
  `
};

export const AccordionGroupFull = {
  render: () => html`
  <div>
    <mlv-accordion-group behavior-expand>
      <mlv-accordion>
        <mlv-accordion-header>
          <div slot="title">Heading 1</div>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>

      <mlv-accordion>
        <mlv-accordion-header>
          <div slot="title">Heading 2</div>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>

      <mlv-accordion>
        <mlv-accordion-header>
          <div slot="title">Heading 3</div>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>
    </mlv-accordion-group>
  </div>
  `
};

export const AccordionGroupInset = {
  render: () => html`
  <div>
    <mlv-accordion-group container="inset" behavior-expand>
      <mlv-accordion>
        <mlv-accordion-header>
          <div slot="title">Heading 1</div>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>

      <mlv-accordion>
        <mlv-accordion-header>
          <div slot="title">Heading 2</div>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>

      <mlv-accordion>
        <mlv-accordion-header>
          <div slot="title">Heading 3</div>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>
    </mlv-accordion-group>
  </div>
  `
};

export const AccordionGroupFlat = {
  render: () => html`
  <div>
    <mlv-accordion-group container="flat" behavior-expand>
      <mlv-accordion>
        <mlv-accordion-header>
          <div slot="title">Heading 1</div>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>

      <mlv-accordion>
        <mlv-accordion-header>
          <div slot="title">Heading 2</div>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>

      <mlv-accordion>
        <mlv-accordion-header>
          <div slot="title">Heading 3</div>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>
    </mlv-accordion-group>
  </div>
  `
};

export const AccordionGroupExpandSingle = {
  render: () => html`
  <div>
    <mlv-accordion-group behavior-expand-single>
      <mlv-accordion>
        <mlv-accordion-header>
          <div slot="title">Heading 1</div>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>

      <mlv-accordion>
        <mlv-accordion-header>
          <div slot="title">Heading 2</div>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>

      <mlv-accordion>
        <mlv-accordion-header>
          <div slot="title">Heading 3</div>
        </mlv-accordion-header>

        <mlv-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </mlv-accordion-content>
      </mlv-accordion>
    </mlv-accordion-group>
  </div>
  `
};
