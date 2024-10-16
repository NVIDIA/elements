import { LitElement, html } from 'lit';
import { state } from 'lit/decorators/state.js';
import '@nvidia-elements/core/accordion/define.js';

export default {
  title: 'Elements/Accordion/Examples',
  component: 'nve-accordion',
};

export const Default = {
  render: () => html`
  <div>
    <nve-accordion>
      <nve-accordion-header>
        <div slot="title">Heading</div>
      </nve-accordion-header>

      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
  </div>
  `
};

export const Full = {
  render: () => html`
  <div>
    <nve-accordion behavior-expand>
      <nve-accordion-header>
        <div slot="title">Heading</div>
      </nve-accordion-header>

      <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
    </nve-accordion>
  </div>
  `
};

export const Animated = {
  render: () => html`
  <div>
    <nve-accordion behavior-expand style="--transition: height 0.3s ease-in-out">
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
  <div>
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
  render: () => html`
  <div>
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
  render: () => html`
  <div>
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

class CustomIconButtonDemo extends LitElement {
  @state() private expanded = false;

  toggleExpanded() {
    this.expanded = !this.expanded;
  }

  render() {
    return html`
    <div>
      <nve-accordion .expanded=${this.expanded}>
        <nve-icon-button slot="icon-button" icon-name=${this.expanded ? "minus" : "add"} size="sm" container="flat" @click=${this.toggleExpanded}></nve-icon-button>

        <nve-accordion-header @click=${this.toggleExpanded}>
          <div slot="title">Heading</div>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>
    </div>
    `;
  }
}

customElements.get('custom-icon-button-demo') || customElements.define('custom-icon-button-demo', CustomIconButtonDemo);

export const CustomIconButtonInteractive = {
  render: () => html`<custom-icon-button-demo></custom-icon-button-demo>`
};

export const WithActions = {
  render: () => html`
  <div>
      <nve-accordion behavior-expand>
        <nve-accordion-header>
          <div slot="title">Heading</div>

          <nve-icon-button container="flat" icon-name="add" size="sm" slot="actions"></nve-icon-button>
          <nve-icon-button container="flat" icon-name="delete" size="sm" slot="actions"></nve-icon-button>
        </nve-accordion-header>

        <nve-accordion-content> Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet. </nve-accordion-content>
      </nve-accordion>
  </div>
  `
};

export const AccordionGroupFull = {
  render: () => html`
  <div>
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
  <div>
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
  <div>
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
  <div>
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
