import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { useStyles } from '@nvidia-elements/core/internal';

import type * as monaco from '@nvidia-elements/monaco';
import type { Monaco } from '@nvidia-elements/monaco';

import { toggleThemeForColorScheme } from '../themes/index.js';

import { loadEditorStyles, loadMonaco } from '../monaco.js';

import styles from './editor.css?inline';

/**
 * @element nve-monaco-editor
 * @description A low-level Monaco Editor wrapper that provides direct access to an editor instance and API.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/monaco/editor
 * @cssprop --background
 * @cssprop --min-height
 * @event canceled - Dispatched when editor initialization is canceled.
 * @event ready - Dispatched when the editor is initialized and ready.
 * @storybook https://NVIDIA.github.io/elements/docs/labs/monaco/editor/
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-Nvidia-Elements-Design-Catalog?node-id=12947-3101&p=f&t=PNLgvP1PAy5fn1KW-0
 * @stable false
 */
export class MonacoEditor extends LitElement {
  static readonly metadata = {
    tag: 'nve-monaco-editor',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  /**
   * Provides access to the Monaco Editor instance.
   * https://microsoft.github.io/monaco-editor/docs.html#modules/editor.html
   */
  #editor?: monaco.editor.IStandaloneCodeEditor;
  @property({ type: Object })
  get editor(): monaco.editor.IStandaloneCodeEditor | undefined {
    return this.#editor;
  }

  /**
   * Provides access to the Monaco Editor API.
   * https://microsoft.github.io/monaco-editor/docs.html
   */
  #monaco?: Monaco;
  @property({ type: Object })
  get monaco(): Monaco | undefined {
    return this.#monaco;
  }

  render() {
    return html`
      <div internal-host>
        <div id="color-scheme-probe" @transitionrun=${() => toggleThemeForColorScheme(this.#monaco, this)}></div>
        <div id="editor" @input=${e => e.stopPropagation()} @change=${e => e.stopPropagation()}></div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this.#createEditor(); // eslint-disable-line @typescript-eslint/no-floating-promises
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.#editor?.dispose();
    this.#editor = undefined;
  }

  #loadedEditorStyles = false;
  async #loadEditorStyles() {
    if (this.#loadedEditorStyles) {
      return;
    }
    const styles = await loadEditorStyles();
    this.shadowRoot.adoptedStyleSheets = [styles, ...this.shadowRoot.adoptedStyleSheets];
    this.#loadedEditorStyles = true;
  }

  async #createEditor() {
    await this.#loadEditorStyles();

    const monaco = await loadMonaco();

    if (!this.isConnected) {
      this.dispatchEvent(new Event('canceled'));
      return;
    }

    this.#monaco = monaco;

    this.#editor = monaco.editor.create(this.shadowRoot.querySelector('#editor'), {
      automaticLayout: true,
      fontLigatures: '' // Workaround: https://github.com/microsoft/monaco-editor/issues/3217
    });

    this.dispatchEvent(new Event('ready'));
  }
}
