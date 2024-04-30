import { html, unsafeCSS, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import typography from '@nvidia-elements/core/css/module.typography.css?inline';
import layout from '@nvidia-elements/core/css/module.layout.css?inline';
import { defineScopedElement } from '@nvidia-elements/core/scoped';
import { IconButton } from '@nvidia-elements/core/icon-button';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/notification/define.js';
import '@nvidia-elements/core/password/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/button/define.js';

defineScopedElement('plugin', IconButton);

export default {
  title: 'Internal/Integration'
};

@customElement('my-element')
class MyElementDemo extends LitElement {
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

export const ScopedElement = {
  render: () => html`<mlv-icon-button-plugin icon-name="cancel"></mlv-icon-button-plugin>`
}

// used to trigger global option updates (theming) when all stories are isolated in iframes
export const Empty = {
  render: () => html`&nbsp;`
}
