import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { state } from 'lit/decorators/state.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/copy-button/define.js';
import '@nvidia-elements/core/resize-handle/define.js';
import '@nvidia-elements/monaco/input/define.js';
import '@nvidia-elements/code/codeblock/languages/html.js';
import '@nvidia-elements/code/codeblock/define.js';
import { PlaygroundService } from '@internals/tools/playground';
import { PackagesService } from '@internals/tools/packages';

import styles from './canvas-editable.css?inline';

declare const __ELEMENTS_CDN_BASE_URL__: string;

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
  @state() private previewWidth: number = 500;
  @state() private packageVersions: {
    elements: string;
    themes: string;
    styles: string;
  } = {
    elements: '1.65.6',
    themes: '1.12.1',
    styles: '1.13.3'
  };

  protected firstUpdated() {
    // Set previewWidth after determining if the layout is horizontal or not
    this.previewWidth = this.horizontalLayout ? 500 : 1260;
  }

  static metadata = {
    tag: 'nvd-canvas-editable',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  connectedCallback() {
    super.connectedCallback();
    this.editableSource = this.source;
    void this.#loadPackageVersions();
    globalThis.document.addEventListener('nve-theme-change', this.#handleThemeChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    globalThis.document.removeEventListener('nve-theme-change', this.#handleThemeChange);
  }

  willUpdate(changedProperties: Map<PropertyKey, unknown>) {
    if (changedProperties.has('source')) {
      this.editableSource = this.source;
    }
  }

  render() {
    return html`
      <div internal-host class=${this.horizontalLayout ? 'horizontal-layout' : ''}>
        ${this.#renderResizer()}
        ${this.#renderHorizontalResizeHandle()}
        ${this.#renderCodeSection()}
        ${this.#renderToolbar()}
      </div>
    `;
  }

  #renderResizer() {
    return html`
      <div class="resizer">
        <div class="preview-wrapper" style=${!this.horizontalLayout ? `width: ${this.previewWidth}px` : ''}>
          <div class="preview" style=${this.horizontalLayout ? `width: ${this.previewWidth}px` : ''}>
            ${this.readonly && !this.#isPopoverElement(this.tag) ? this.#renderInlinePreview() : this.#renderSandboxedPreview()}
          </div>
          ${this.#renderVerticalResizeHandle()}
        </div>
        <div class="preview-backdrop" .hidden=${this.horizontalLayout}></div>
      </div>
    `;
  }

  #renderVerticalResizeHandle() {
    if (!this.horizontalLayout) {
      return html`<nve-resize-handle 
        class="preview-resize-handle" 
        orientation="vertical" 
        min="300" 
        max="1260" 
        value="${this.previewWidth}" 
        step="1"
        @input=${this.#handleResize}></nve-resize-handle>`;
    }
    return '';
  }

  #renderHorizontalResizeHandle() {
    if (this.horizontalLayout) {
      return html`<nve-resize-handle 
        class="horizontal-resize-handle"
        orientation="vertical" 
        min="150" 
        max="800" 
        value="${this.previewWidth}" 
        step="1"
        @input=${this.#handleResize}></nve-resize-handle>`;
    }
    return '';
  }

  #renderCodeSection() {
    return html`
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
        <nve-button .hidden=${!this.horizontalLayout} @click=${this.#handlePlaygroundClick}>Open in Playground</nve-button>
      </div>
    `;
  }

  #renderToolbar() {
    return html`
      <div class="toolbar" .hidden=${this.horizontalLayout}>
        <nve-button container="flat" @click=${this.#handleSourceClick}>Source <nve-icon name="caret" size="sm" .direction=${this.showSource ? 'up' : 'down'}></nve-icon></nve-button>

        <div>
          <slot name="suffix"></slot>

          <nve-button container="flat" .hidden=${this.horizontalLayout} @click=${this.#handlePlaygroundClick}>Open in Playground</nve-button>
        </div>
      </div>
    `;
  }

  #renderSandboxedPreview() {
    const srcdoc = this.editableSource ?? '';
    const { elements, themes, styles } = this.#bundleUrls;
    return html`
      <iframe
        sandbox=${'allow-scripts allow-modals allow-forms allow-popups allow-same-origin' as unknown as 'allow-scripts'}
        .srcdoc=${`
          <!DOCTYPE html>
          <html nve-theme="${globalThis.document.documentElement.getAttribute('nve-theme')}" nve-transition="auto">
            <head>
              <style>
                :root { color-scheme: light dark; }
                html, body { margin: 0; min-height: 100%; }
                body {
                  transition: opacity 120ms ease-out;
                  opacity: 1;
                }
                body:has(:not(:defined)) {
                  opacity: 0;
                }
                body:has([nve-popover]) { display: flex; align-items: center; justify-content: center; height: 100vh; width: 100vw; }
              </style>

              <script async type="module" src="${elements}"></script>
              <link rel="stylesheet" type="text/css" href="${themes}" />
              <link rel="stylesheet" type="text/css" href="${styles}" />
            </head>
            <body>
              ${srcdoc}
            </body>
          </html>
        `}
      ></iframe>
    `;
  }

  /**
   * On localhost, loads bundles from the local Eleventy dev server
   * (passthrough-copied from dist/bundles/) so iframe previews reflect
   * local builds. In production, falls back to the versioned CDN.
   */
  get #bundleUrls() {
    if (globalThis.location?.hostname === 'localhost') {
      const base = globalThis.document.querySelector('base')?.getAttribute('href') ?? '/elements/';
      return {
        elements: `${base}local-bundles/elements/index.js`,
        themes: `${base}local-bundles/themes/index.css`,
        styles: `${base}local-bundles/styles/index.css`
      };
    }

    return {
      elements: `${__ELEMENTS_CDN_BASE_URL__}/@nvidia-elements/core/${this.packageVersions.elements}/dist/bundles/index.js`,
      themes: `${__ELEMENTS_CDN_BASE_URL__}/@nvidia-elements/themes/${this.packageVersions.themes}/dist/bundles/index.css`,
      styles: `${__ELEMENTS_CDN_BASE_URL__}/@nvidia-elements/styles/${this.packageVersions.styles}/dist/bundles/index.css`
    };
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
  #handleThemeChange = (e: Event) => {
    const theme = (e as CustomEvent).detail.theme;
    const iframe = this.shadowRoot?.querySelector('iframe');
    iframe?.contentDocument?.documentElement.setAttribute('nve-theme', theme);
  };

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

  #handleResize(event: Event) {
    const handle = event.target as HTMLInputElement;
    this.previewWidth = Number(handle.value);
  }

  async #loadPackageVersions() {
    try {
      const versions = await PackagesService.versions();
      this.packageVersions = {
        elements: versions['@nvidia-elements/core'] ?? this.packageVersions.elements,
        themes: versions['@nvidia-elements/themes'] ?? this.packageVersions.themes,
        styles: versions['@nvidia-elements/styles'] ?? this.packageVersions.styles
      };
    } catch (error) {
      console.warn('Unable to load latest package versions for canvas preview.', error);
    }
  }

  async #handlePlaygroundClick() {
    const playgroundResult = await PlaygroundService.create({ template: this.editableSource });
    if (typeof playgroundResult !== 'string') {
      return;
    }

    globalThis.open(playgroundResult, '_blank');

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
