import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { state } from 'lit/decorators/state.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/copy-button/define.js';
import '@nvidia-elements/monaco/input/define.js';
import styles from './canvas-editable.css?inline';

declare global {
  var gtag: (command: string, action: string, params?: Record<string, unknown>) => void;
}

@customElement('nvd-canvas-editable')
export class CanvasEditable extends LitElement {
  @property({ type: String }) source: string = '';

  @state() private showSource = true;
  @state() private editableSource: string = '';

  static metadata = {
    tag: 'nvd-canvas-editable',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  connectedCallback() {
    super.connectedCallback();
    this.editableSource = this.source;
  }

  willUpdate(changedProperties: Map<PropertyKey, unknown>) {
    if (changedProperties.has('source')) {
      this.editableSource = this.source;
    }
  }

  render() {
    return html`
      <div internal-host>
        <div class="resizer">
          <div class="preview">
            ${this.#renderPreview()}
          </div>
          <div class="preview-backdrop"></div>
        </div>
        <div class="code" .hidden=${!this.showSource}>
          ${
            this.source
              ? html`<nve-monaco-input 
            language="html" 
            .value=${this.editableSource}
            line-numbers="on"
            @input=${this.#handleInput}
            @change=${this.#handleChange}
          ></nve-monaco-input>`
              : nothing
          }
          <nve-copy-button container="flat" @click=${this.#handleCopyClick} behavior-copy .value=${this.editableSource}></nve-copy-button>
        </div>
        <div class="toolbar">
          <nve-button container="flat" @click=${this.#handleSourceClick}>Source <nve-icon name="caret" size="sm" .direction=${this.showSource ? 'up' : 'down'}></nve-icon></nve-button>
          <slot name="suffix"></slot>
        </div>
      </div>
    `;
  }

  #renderPreview() {
    try {
      const template = globalThis.document.createElement('template');
      template.innerHTML = this.editableSource;
      return template.content.cloneNode(true);
    } catch (error) {
      console.error('Error rendering preview:', error);
      return html`<div class="error">Error rendering preview</div>`;
    }
  }

  #handleSourceClick() {
    this.showSource = !this.showSource;
    this.#sendAnalyticsEvent('elements-docs-source-click');
  }

  #handleCopyClick() {
    this.#sendAnalyticsEvent('elements-docs-source-copy');
  }

  #handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.editableSource = input.value;
  }

  #handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.editableSource = input.value;
  }

  #sendAnalyticsEvent(eventName: string) {
    if (globalThis.gtag) {
      globalThis.gtag('event', eventName, { tag: this.id });
    }
  }
}
