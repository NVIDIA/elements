import { html, unsafeCSS, LitElement } from 'lit';
import typography from '@nvidia-elements/core/css/module.typography.css?inline';
import layout from '@nvidia-elements/core/css/module.layout.css?inline';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/notification/define.js';
import '@nvidia-elements/core/password/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/button/define.js';

export default {
  title: 'Internal/Integration'
};

class MyElementDemo extends LitElement {
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

customElements.get('my-element') || customElements.define('my-element', MyElementDemo);

export const Lit = {
  render: () => html`<my-element></my-element>`
}

// used to trigger global option updates (theming) when all stories are isolated in iframes
export const Empty = {
  render: () => html`&nbsp;`
}
