import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import type { editor } from 'monaco-editor';
import { loadMonaco } from '../monaco.js';
import styles from './editor.css?inline';

/**
 * @element nve-monaco-editor
 * @description A thin client wrapper around the Monaco Editor.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/monaco/editor
 * @cssprop --background
 * @storybook https://NVIDIA.github.io/elements/docs/labs/monaco/
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-Nvidia-Elements-Design-Catalog?node-id=12947-3101&p=f&t=PNLgvP1PAy5fn1KW-0
 * @stable false
 */
export class Editor extends LitElement {
  @property({ type: String })
  language: 'json' | 'css' | 'html' | 'typescript' | 'javascript' = 'html';

  @property({ type: String })
  source: string = '';

  get value() {
    return this.#editor?.getModel()?.getValue() ?? '';
  }

  static readonly metadata = {
    tag: 'nve-monaco-editor',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  #editor: editor.IStandaloneCodeEditor;

  render() {
    return html`
      <div internal-host>
        <div id="loading">loading...</div>
        <div id="editor"></div>
      </div>
    `;
  }

  async connectedCallback() {
    super.connectedCallback();

    if (!this.#editor) {
      const { monaco, styles } = await loadMonaco();
      this.shadowRoot.adoptedStyleSheets = [styles, ...this.shadowRoot.adoptedStyleSheets];

      monaco.editor.onDidCreateEditor(() => {
        this.dispatchEvent(new CustomEvent('init', { bubbles: true }));
      });

      this.#editor = monaco.editor.create(this.shadowRoot.querySelector('#editor'), {
        value: this.source,
        language: this.language
      });

      this.#editor?.getModel()?.onDidChangeContent(() => {
        this.dispatchEvent(new InputEvent('input', { bubbles: true, data: this.value }));
      });
    }
  }

  disconnectedCallback() {
    this.#editor?.dispose();
  }
}
