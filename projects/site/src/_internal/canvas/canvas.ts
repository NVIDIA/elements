import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { state } from 'lit/decorators/state.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/copy-button/define.js';
import styles from './canvas.css?inline';

function convertToJsxElement(html: string): string {
  return html.replace(/<(\/?)([a-z]+(?:-[a-z]+)+)([^>]*)>/g, (_match, closingSlash, tagName, attributes) => {
    const jsxTagName = tagName
      .split('-')
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    return `<${closingSlash}${jsxTagName}${attributes}>`;
  });
}

@customElement('nvd-canvas')
export class Canvas extends LitElement {
  @property({ type: String }) source: string = '';

  @state() private showSource = false;

  @state() private sourceType: 'html' | 'react' = 'html';

  static metadata = {
    tag: 'nvd-canvas',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  get formattedSource() {
    const source = (this.source ? this.source : this.innerHTML).trim();
    return this.sourceType === 'react' ? convertToJsxElement(source) : source;
  }

  render() {
    return html`
      <div internal-host>
        <div class="resizer">
          <slot @slotchange=${() => this.#updateSource()}></slot>
          <div class="preview-backdrop"></div>
        </div>
        <div class="code" .hidden=${!this.showSource}>
          ${this.source ? html`<nve-codeblock language="html" .code=${this.formattedSource}></nve-codeblock>` : nothing}
          <nve-copy-button container="flat" behavior-copy .value=${this.formattedSource}></nve-copy-button>
        </div>
        <div class="toolbar">
          <nve-button container="flat" @click=${() => (this['showSource'] = !this.showSource)}>Source <nve-icon name="caret" size="sm" .direction=${this.showSource ? 'up' : 'down'}></nve-icon></nve-button>
          <nve-select container="flat" fit-text>
            <select @change=${(e: Event) => this.#updateSourceType(e)} aria-label="source type">
              <option value="html">HTML&nbsp;</option>
              <option value="react">React</option>
            </select>
          </nve-select>
          <slot name="suffix"></slot>
        </div>
      </div>
    `;
  }

  #updateSourceType(event: Event) {
    this.sourceType = (event.target as HTMLSelectElement).value as 'html' | 'react';
    this.showSource = true;
  }

  get #template() {
    return this.shadowRoot
      ?.querySelector('slot')
      ?.assignedNodes()
      .find(node => (node as HTMLElement).tagName === 'TEMPLATE') as HTMLTemplateElement;
  }

  #updateSource() {
    const template = this.#template;
    this.source = template ? unescapeHtml(template.innerHTML) : this.source;
  }
}

function unescapeHtml(str: string) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}
