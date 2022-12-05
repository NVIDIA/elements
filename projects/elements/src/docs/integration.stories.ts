import { html, unsafeCSS, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import typography from '@elements/elements/css/module.typography.css';
import layout from '@elements/elements/css/module.layout.css';

export default {
  title: 'Internal/Integration'
};

@customElement('my-element')
class MyElement extends LitElement {

  static styles = [unsafeCSS(`${typography}${layout}`)];

  render() {
    return html`
      <div nve-layout="column gap:lg">
        <p nve-text="display">display</p>
        <p nve-text="heading">heading</p>
        <p nve-text="body">body</p>
        <p nve-text="label">label</p>
        <p nve-text="eyebrow">eyebrow</p>
      </div>
    `;
  }
}

export const Lit = {
  render: () => html`<my-element></my-element>`
}

// used to trigger global option updates (theming) when all stories are isolated in iframes
export const Empty = {
  render: () => html``
}