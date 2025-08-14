import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { state } from 'lit/decorators/state.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/copy-button/define.js';
import '@nvidia-elements/monaco/input/define.js';
import '@nvidia-elements/code/codeblock/languages/html.js';
import '@nvidia-elements/code/codeblock/define.js';
import { PlaygroundService } from '@internals/tools/playground';

// eslint-disable-next-line no-inline-css/no-restricted-imports
import themeStyles from '@nvidia-elements/themes/index.css?inline'; // temporary workaround as latest version is not published yet
// eslint-disable-next-line no-inline-css/no-restricted-imports
import darkThemeStyles from '@nvidia-elements/themes/dark.css?inline'; // temporary workaround as latest version is not published yet
// eslint-disable-next-line no-inline-css/no-restricted-imports
import typographyStyles from '@nvidia-elements/styles/typography.css?inline'; // temporary workaround as latest version is not published yet
// eslint-disable-next-line no-inline-css/no-restricted-imports
import layoutStyles from '@nvidia-elements/styles/layout.css?inline'; // temporary workaround as latest version is not published yet
// eslint-disable-next-line no-inline-css/no-restricted-imports
import layoutLabsViewportStyles from '@nvidia-elements/styles/labs/layout-viewport.css?inline'; // temporary workaround as latest version is not published yet
// eslint-disable-next-line no-inline-css/no-restricted-imports
import layoutLabsContainerStyles from '@nvidia-elements/styles/labs/layout-container.css?inline'; // temporary workaround as latest version is not published yet
import styles from './canvas-editable.css?inline';

declare global {
  var gtag: (command: string, action: string, params?: Record<string, unknown>) => void;
}

@customElement('nvd-canvas-editable')
export class CanvasEditable extends LitElement {
  @property({ type: String }) source: string = '';
  @property({ type: Boolean }) readonly: boolean = false;
  @property({ type: Boolean, attribute: 'horizontal-layout' }) horizontalLayout: boolean = false;
  @property({ type: String }) tag: string = '';

  @state() private showSource = false;
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
      <div internal-host class=${this.horizontalLayout ? 'horizontal-layout' : ''}>
        <div class="resizer">
          <div class="preview">
            ${this.readonly && !this.#isPopoverElement(this.tag) ? this.#renderInlinePreview() : this.#renderSandboxedPreview()}
          </div>
          <div class="preview-backdrop" .hidden=${this.horizontalLayout}></div>
        </div>

        <div class="code" .hidden=${!this.horizontalLayout && !this.showSource}>
          ${
            !this.readonly
              ? html`<nve-monaco-input 
                  language="html" 
                  .value=${this.editableSource}
                  line-numbers="on"
                  @input=${this.#handleInput}
                  @change=${this.#handleChange}></nve-monaco-input>`
              : html`<nve-codeblock language="html" .code=${this.editableSource}></nve-codeblock>`
          }
          <nve-copy-button container="flat" @click=${this.#handleCopyClick} behavior-copy .value=${this.editableSource}></nve-copy-button>
          <nve-button @click=${this.#handlePlaygroundClick}>View in Playground</nve-button>
        </div>
        
        <div class="toolbar" .hidden=${this.horizontalLayout}>
          <nve-button container="flat" @click=${this.#handleSourceClick}>Source <nve-icon name="caret" size="sm" .direction=${this.showSource ? 'up' : 'down'}></nve-icon></nve-button>
          <slot name="suffix"></slot>
        </div>
      </div>
    `;
  }

  #renderSandboxedPreview() {
    // Use an iframe to sandbox the preview content
    // We use a key to force re-render when editableSource changes
    const srcdoc = this.editableSource ?? '';
    // Use a unique key to force iframe reload on source change
    const key = String(srcdoc.length) + String(Date.now());
    return html`
      <iframe
        sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
        .srcdoc=${`
          <!DOCTYPE html>
          <html nve-theme="${globalThis.document.documentElement.getAttribute('nve-theme')}" nve-transition="auto">
            <head>
              <style>
                ${themeStyles}
                ${darkThemeStyles}
                ${typographyStyles}
                ${layoutStyles}
                ${layoutLabsViewportStyles}
                ${layoutLabsContainerStyles}
              </style>

              <script async type="module" src="https://esm.nvidia.com/@nvidia-elements/core@latest/dist/bundles/index.js"></script>
            </head>
            <body>
              ${srcdoc}
            </body>
          </html>
        `}
        loading="lazy"
        key=${key}
      ></iframe>
    `;
  }

  #renderInlinePreview() {
    try {
      const template = globalThis.document.createElement('template');
      template.innerHTML = this.source;
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

  async #handlePlaygroundClick() {
    const playgroundUrl = await PlaygroundService.create({ html: this.editableSource });

    globalThis.open(playgroundUrl, '_blank');

    this.#sendAnalyticsEvent('elements-docs-source-playground');
  }

  #sendAnalyticsEvent(eventName: string) {
    if (globalThis.gtag) {
      globalThis.gtag('event', eventName, { tag: this.id });
    }
  }

  #isPopoverElement(tag: string): boolean {
    const popoverElements = [
      'nve-dialog',
      'nve-drawer',
      'nve-dropdown',
      'nve-input-group',
      'nve-menu',
      'nve-notification',
      'nve-page',
      'nve-page-loader',
      'nve-toast',
      'nve-toolbar',
      'nve-toggletip',
      'nve-tooltip'
    ];
    return popoverElements.includes(tag);
  }
}
