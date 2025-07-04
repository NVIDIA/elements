import { LitElement } from 'lit';
import type { TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

import { useStyles } from '@nvidia-elements/core/internal';

import type * as monaco from '@nvidia-elements/monaco';
import type { Monaco } from '@nvidia-elements/monaco';

import { updateThemeForColorScheme } from '../../themes/index.js';
import { loadEditorStyles, loadMonaco } from '../../monaco.js';

import styles from './editor.css?inline';

/**
 * Base class for Monaco editor wrapper custom elements.
 * @cssprop --background
 * @cssprop --min-height
 * @event canceled - Dispatched when editor initialization is canceled.
 * @event ready - Dispatched when the editor is initialized and ready.
 */
export abstract class BaseMonacoEditor<T extends monaco.editor.IEditor> extends LitElement {
  static styles = useStyles([styles]);

  /**
   * Provides access to the Monaco Editor instance.
   */
  @property({ type: Object })
  get editor(): T | undefined {
    return this.#editor;
  }

  /**
   * Provides access to the Monaco Editor API.
   */
  @property({ type: Object })
  get monaco(): Monaco | undefined {
    return this.#monaco;
  }

  #editor?: T;
  #monaco?: Monaco;
  #loadedEditorStyles = false;

  get #colorSchemeProbe(): HTMLElement | null {
    return this.shadowRoot?.querySelector('#color-scheme-probe');
  }

  get #editorContainer(): HTMLElement | null {
    return this.shadowRoot?.querySelector('#editor');
  }

  protected abstract _createEditor(container: HTMLElement, monaco: Monaco): T;

  async connectedCallback() {
    super.connectedCallback();

    await this.updateComplete;

    this.#initialize(); // eslint-disable-line @typescript-eslint/no-floating-promises

    this.#colorSchemeProbe?.addEventListener('transitionrun', this.#updateThemeForColorScheme);

    this.#editorContainer?.addEventListener('input', this.#stopPropagation);
    this.#editorContainer?.addEventListener('change', this.#stopPropagation);
  }

  disconnectedCallback() {
    this.#colorSchemeProbe?.removeEventListener('transitionrun', this.#updateThemeForColorScheme);

    this.#editorContainer?.removeEventListener('input', this.#stopPropagation);
    this.#editorContainer?.removeEventListener('change', this.#stopPropagation);

    this.#editor?.dispose();
    this.#editor = undefined;
  }

  abstract render(): TemplateResult;

  async #loadEditorStyles() {
    if (this.#loadedEditorStyles) {
      return;
    }
    const styles = await loadEditorStyles();
    this.shadowRoot!.adoptedStyleSheets = [styles, ...this.shadowRoot!.adoptedStyleSheets];
    this.#loadedEditorStyles = true;
  }

  async #initialize() {
    await this.#loadEditorStyles();

    const monaco = await loadMonaco();

    if (!this.isConnected) {
      this.dispatchEvent(new Event('canceled'));
      return;
    }

    this.#monaco = monaco;

    const container = this.#editorContainer as HTMLElement;
    this.#editor = this._createEditor(container, monaco);

    this.#updateThemeForColorScheme();

    this.dispatchEvent(new Event('ready'));
  }

  #updateThemeForColorScheme = () => {
    if (!this.#monaco) {
      return;
    }

    updateThemeForColorScheme(this.#monaco, this);
  };

  #stopPropagation = (e: Event) => {
    e.stopPropagation();
  };
}
