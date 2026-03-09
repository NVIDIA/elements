import { html } from 'lit';
import { property } from 'lit/decorators.js';

import type * as monaco from '@nvidia-elements/monaco';
import type { Monaco } from '@nvidia-elements/monaco';

import { MonacoDiffEditor } from '../diff-editor/diff-editor.js';

import { BaseMonacoInput } from '../internal/base/input.js';
import type { SuggestedLanguages } from '../internal/base/input.js';

/**
 * @element nve-monaco-diff-input
 * @description An input control for editing diffs for JSON, YAML and code with syntax highlighting and validation.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/monaco/diff-input
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea
 * @stable false
 */
export class MonacoDiffInput extends BaseMonacoInput<MonacoDiffEditor, monaco.editor.IStandaloneDiffEditor> {
  static readonly metadata = {
    tag: 'nve-monaco-diff-input',
    version: '0.0.0',
    valueSchema: {
      type: 'string' as const
    }
  };

  static elementDefinitions = {
    [MonacoDiffEditor.metadata.tag]: MonacoDiffEditor
  };

  /**
   * Determines whether the input prevents editing.
   */
  get disabled(): boolean {
    return super.disabled;
  }
  set disabled(value: boolean) {
    super.disabled = value;
    this.#applyOptions();
  }

  /**
   * Defines the programming language for syntax highlighting and validation.
   */
  get language(): SuggestedLanguages | string {
    return super.language;
  }
  set language(value: SuggestedLanguages | string) {
    super.language = value;
    this.#applyOriginalLanguage();
  }

  /**
   * Defines the original value of the diff.
   */
  @property({ type: String })
  get original(): string {
    return this.#original ?? '';
  }
  set original(value: string) {
    const previous = this.original;
    this.#original = value;
    if (value !== previous) {
      this.#applyOriginal();
    }
  }
  #original: string = '';

  /**
   * Defines the programming language for syntax highlighting of the original value.
   * Falls back to the language property if not set.
   */
  @property({ type: String })
  get originalLanguage(): SuggestedLanguages | string {
    return this.#originalLanguage;
  }
  set originalLanguage(value: SuggestedLanguages | string) {
    this.#originalLanguage = value;
    this.#applyOriginalLanguage();
  }
  #originalLanguage: SuggestedLanguages | string = '';

  /**
   * Determines whether the editor is in read-only mode.
   */
  get readOnly(): boolean {
    return super.readOnly;
  }
  set readOnly(value: boolean) {
    super.readOnly = value;
    this.#applyOptions();
  }

  /**
   * Defines whether to render the diff in side-by-side mode (if enough width is available).
   */
  @property({ type: Boolean, attribute: 'side-by-side' })
  get sideBySide(): boolean {
    return this.#sideBySide;
  }
  set sideBySide(value: boolean) {
    this.#sideBySide = value;
    this.#applyOptions();
  }
  #sideBySide: boolean = false;

  #monaco: Monaco | undefined;
  #diffEditor: monaco.editor.IStandaloneDiffEditor | undefined;
  #diffModel: monaco.editor.IDiffEditorModel | undefined;

  protected get _editor(): MonacoDiffEditor {
    return this.shadowRoot?.querySelector<MonacoDiffEditor>(MonacoDiffEditor.metadata.tag)!;
  }

  protected _createEditor(monaco: Monaco): monaco.editor.IStandaloneCodeEditor {
    this.#monaco = monaco;

    this.#diffEditor = this.shadowRoot?.querySelector<MonacoDiffEditor>(MonacoDiffEditor.metadata.tag)?.editor;

    const uuid = crypto.randomUUID();
    const original = monaco.editor.createModel(
      this.original,
      this.originalLanguage || this.language,
      monaco.Uri.parse(`diff:///diff-input-${uuid}`)
    );
    const modified = monaco.editor.createModel(
      this.value,
      this.language,
      monaco.Uri.parse(`inmemory:///diff-input-${uuid}`)
    );
    this.#diffModel = { original, modified };
    this.#diffEditor?.setModel(this.#diffModel);

    const diffEditor = this.#diffEditor!;

    const didDisposeListener = diffEditor.onDidDispose(() => {
      didDisposeListener.dispose();
      diffEditor.setModel(null);
      original.dispose();
      modified.dispose();
    });

    this.#applyOptions();

    return this.#diffEditor?.getModifiedEditor()!;
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.#diffEditor?.dispose();
    this.#diffEditor = undefined;
    this.#diffModel = undefined;
  }

  /* eslint-disable local/required-css-parts */
  render() {
    return html`
      <div internal-host>
        <nve-monaco-diff-editor></nve-monaco-diff-editor>
      </div>
    `;
  }

  updateOptions(options: monaco.editor.IDiffEditorOptions) {
    if ('renderSideBySide' in options) {
      this.#sideBySide = options.renderSideBySide ?? this.#sideBySide;
    }
    if ('originalEditable' in options && options.originalEditable) {
      console.warn('Editing the original model is not supported, use nve-monaco-editor instead.');
    }
    this.#diffEditor?.updateOptions({
      ...options,
      originalEditable: false
    });
  }

  updateOriginalEditorOptions(options: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions) {
    this.#diffEditor?.getOriginalEditor()?.updateOptions({
      ...options,
      readOnly: true
    });
  }

  #applyOptions() {
    this.updateOptions({
      readOnly: this.disabled || this.readOnly,
      renderSideBySide: this.sideBySide
    });
  }

  #applyOriginal() {
    if (!this.#diffModel) {
      return;
    }
    this.#diffModel.original.setValue(this.original);
  }

  #applyOriginalLanguage() {
    if (!this.#diffModel) {
      return;
    }
    this.#monaco?.editor.setModelLanguage(this.#diffModel.original, this.originalLanguage || this.language);
  }

  protected _updateEditorOptions(options: Partial<monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions>) {
    super._updateEditorOptions(options);

    this.updateOriginalEditorOptions(options);
  }
}
