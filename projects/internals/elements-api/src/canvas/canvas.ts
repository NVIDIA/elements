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
          <slot @slotchange=${() => this.requestUpdate()}></slot>
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
}
