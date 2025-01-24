import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './canvas.css?inline';

export class Canvas extends LitElement {
  @property({ type: String }) source: string;

  @property({ type: Boolean }) showSource = false;

  static metadata = {
    tag: 'nve-api-canvas',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  render() {
    return html`
      <div internal-host>
        <div class="resizer">
          <slot @slotchange=${() => this.#updateSource()}></slot>
          <div class="preview-backdrop"></div>
        </div>
        <div class="code" .hidden=${!this.showSource}>
          ${this.source ? html`<nve-codeblock language="html" .code=${this.source ? this.source : this.innerHTML}></nve-codeblock>` : nothing}
          <nve-copy-button container="flat" behavior-copy .value=${this.source?.trim()}></nve-copy-button>
        </div>
        <div style="width: 100%">
          <nve-toolbar container="flat">
            <nve-button container="flat" @click=${() => (this['showSource'] = !this.showSource)}>Source <nve-icon name="caret" size="sm" .direction=${this.showSource ? 'up' : 'down'}></nve-icon></nve-button>
            <slot name="suffix"></slot>
          </nve-toolbar>
        </div>
      </div>
    `;
  }

  get #template() {
    return this.shadowRoot
      .querySelector('slot')
      .assignedNodes()
      .find(node => (node as HTMLElement).tagName === 'TEMPLATE') as HTMLTemplateElement;
  }

  #updateSource() {
    const template = this.#template;
    // eslint-disable-next-line rulesdir/stateless-property
    this.source = template ? unescapeHtml(template.innerHTML) : this.source;
  }
}

function unescapeHtml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}
