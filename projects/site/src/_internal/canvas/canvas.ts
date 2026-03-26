import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { state } from 'lit/decorators/state.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/copy-button/define.js';
import '@nvidia-elements/core/resize-handle/define.js';
import '@nvidia-elements/code/codeblock/define.js';
import '@nvidia-elements/code/codeblock/languages/html.js';
import '@nvidia-elements/code/codeblock/languages/typescript.js';
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

  @property({ type: String, reflect: true }) align?: 'center';

  @property({ type: String, reflect: true }) layer?: 'container' | 'canvas' | 'highlight';

  @property({ type: Number }) min: number = 200;

  @property({ type: Number }) max: number = 1260;

  @state() private showSource = false;

  @state() private sourceType: 'html' | 'react' = 'html';

  @state() private previewWidth: number;

  @state() private maxPreviewWidth: number;

  static metadata = {
    tag: 'nvd-canvas',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  connectedCallback() {
    super.connectedCallback();
    // Initialize state values from properties
    this.previewWidth = this.max;
    this.maxPreviewWidth = this.max;

    // Initialize previewWidth based on parent container width if possible
    requestAnimationFrame(() => {
      const containerWidth = this.offsetWidth - 3;
      const maxWidth = Math.min(containerWidth, this.max);
      if (maxWidth > this.min) {
        this.maxPreviewWidth = maxWidth;
        this.previewWidth = maxWidth;
      }
    });
  }

  get formattedSource() {
    const source = (this.source ? this.source : this.innerHTML).trim();
    return this.sourceType === 'react' ? convertToJsxElement(source) : source;
  }

  render() {
    return html`
      <div internal-host>
        <div class="resizer" style="--preview-width: ${this.previewWidth}px">
          <slot @slotchange=${() => this.#updateSource()}></slot>
          <nve-resize-handle 
            class="preview-resize-handle" 
            orientation="vertical" 
            min="${this.min}" 
            max="${this.maxPreviewWidth}" 
            value="${this.previewWidth}" 
            step="1"
            @input=${this.#handleResize}>
          </nve-resize-handle>
        </div>
        <div class="code" .hidden=${!this.showSource}>
          ${this.source ? html`<nve-codeblock language="html" .code=${this.formattedSource}></nve-codeblock>` : nothing}
          <nve-copy-button container="flat" @click=${this.#handleCopyClick} behavior-copy .value=${this.formattedSource}></nve-copy-button>
        </div>
        <div class="toolbar">
          <nve-button class="source-button" container="flat" @click=${this.#handleSourceClick}>Source <nve-icon name="caret" size="sm" .direction=${this.showSource ? 'up' : 'down'}></nve-icon></nve-button>
          <slot name="suffix"></slot>
        </div>
      </div>
    `;
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

  #handleSourceClick() {
    this.showSource = !this.showSource;
    this.#sendAnalyticsEvent('elements-docs-source-click');
  }

  #handleCopyClick() {
    this.#sendAnalyticsEvent('elements-docs-source-copy');
  }

  #handleResize(event: Event) {
    const handle = event.target as HTMLInputElement;
    // Update max based on current container size when user is actively resizing
    const containerWidth = this.offsetWidth - 3;
    const maxWidth = Math.min(containerWidth, this.max);
    if (maxWidth > this.min) {
      this.maxPreviewWidth = maxWidth;
    }
    this.previewWidth = Number(handle.value);
  }

  #sendAnalyticsEvent(eventName: string) {
    if (globalThis.gtag) {
      globalThis.gtag('event', eventName, { tag: this.id });
    }
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
