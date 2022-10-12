import { html, unsafeCSS, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import typography from '@elements/elements/css/module.typography.css';
import layout from '@elements/elements/css/module.layout.css';

export default {
  title: 'Internal/Examples/Integration'
};

@customElement('my-element')
class MyElement extends LitElement {

  static styles = [unsafeCSS(`${typography}${layout}`)];

  render() {
    return html`
      <div mlv-layout="column gap:lg">
        <p mlv-text="display">display</p>
        <p mlv-text="heading">heading</p>
        <p mlv-text="body">body</p>
        <p mlv-text="label">label</p>
        <p mlv-text="eyebrow">eyebrow</p>
      </div>
    `;
  }
}

export const Lit = {
  render: () => html`<my-element></my-element>`
}
