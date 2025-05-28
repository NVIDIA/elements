import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { FormControlMixin } from '@nvidia-elements/forms/mixin';

import type { monaco } from '../types.js';

import styles from './input.css?inline';

import type { MonacoEditor } from '@nvidia-elements/monaco/editor';

const SYNTAX_VALIDATABLE_LANGUAGES = ['css', 'json', 'javascript', 'typescript'] as const;

function isSyntaxValidationAvailable(language: string): boolean {
  return SYNTAX_VALIDATABLE_LANGUAGES.includes(language as (typeof SYNTAX_VALIDATABLE_LANGUAGES)[number]);
}

export type SuggestedLanguages =
  | 'css'
  | 'go'
  | 'html'
  | 'javascript'
  | 'json'
  | 'markdown'
  | 'plaintext'
  | 'python'
  | 'shell'
  | 'sql'
  | 'typescript'
  | 'yaml';

export type JSONSchema = monaco.languages.json.JSONSchema;

// Derived from: monaco.editor.LineNumbersType
export type LineNumberFormatter = (lineNumber: number) => string;
export type LineNumbersType = 'on' | 'off' | 'relative' | 'interval' | LineNumberFormatter;

// Derived from: monaco.editor.IEditorOptions['wordWrap']
export type WordWrapOptions = 'off' | 'on' | 'wordWrapColumn' | 'bounded';

function setJSONSchemaForModel(
  _monaco: typeof monaco,
  model: monaco.editor.ITextModel,
  schema: JSONSchema | undefined
) {
  const options = _monaco.languages.json.jsonDefaults.diagnosticsOptions;
  const uri = model.uri.toString();

  const otherSchemas = options.schemas.filter(({ fileMatch }) => fileMatch.length === 1 && fileMatch[0] !== uri);
  const schemasForThisModel = schema ? [{ uri, fileMatch: [uri], schema }] : [];

  _monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    ...options,
    validate: true,
    schemaValidation: 'error',
    schemas: [...otherSchemas, ...schemasForThisModel]
  });
}

/**
 * @element nve-monaco-input
 * @description An input control for editing JSON, YAML and code with syntax highlighting and validation.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/monaco/input
 * @cssprop --background
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --min-height
 * @cssprop --padding
 * @event canceled - Dispatched when editor initialization is canceled.
 * @event ready - Dispatched when the editor is initialized and ready.
 * @event syntax-validation-changed - Dispatched when syntax validation state changes.
 * @storybook https://NVIDIA.github.io/elements/docs/labs/monaco/input/
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-Nvidia-Elements-Design-Catalog?node-id=12947-3101&p=f&t=PNLgvP1PAy5fn1KW-0
 * @stable false
 */
export class MonacoInput extends FormControlMixin<typeof LitElement, string>(LitElement) {
  static readonly metadata = {
    tag: 'nve-monaco-input',
    version: '0.0.0',
    valueSchema: {
      type: 'string' as const
    }
  };

  /**
   * Defines the programming language to be used for syntax highlighting and validation.
   */
  @property({ type: String })
  get language(): SuggestedLanguages | string {
    return this.#language;
  }
  set language(value: SuggestedLanguages | string) {
    this.#language = value;
    this.#applyLanguage();
  }
  #language: SuggestedLanguages | string = 'javascript';

  /**
   * Determines whether the input is disabled and cannot be edited.
   */
  get disabled(): boolean {
    return super.disabled;
  }
  set disabled(value: boolean) {
    super.disabled = value;
    this.#applyOptions();
  }

  /**
   * Determines whether code folding is enabled in the editor.
   */
  @property({ type: Boolean })
  get folding(): boolean {
    return this.#folding;
  }
  set folding(value: boolean) {
    this.#folding = value;
    this.#applyOptions();
  }
  #folding = false;

  /**
   * Determines whether to insert spaces instead of tabs when pressing the tab key.
   */
  @property({ attribute: 'insert-spaces', type: Boolean })
  get insertSpaces(): boolean {
    return this.#insertSpaces;
  }
  set insertSpaces(value: boolean) {
    this.#insertSpaces = value;
    this.#applyOptions();
  }
  #insertSpaces = false;

  /**
   * Controls the display of line numbers in the editor.
   */
  @property({ attribute: 'line-numbers', type: String })
  get lineNumbers(): LineNumbersType {
    return this.#lineNumbers;
  }
  set lineNumbers(value: LineNumbersType) {
    this.#lineNumbers = value;
    this.#applyOptions();
  }
  #lineNumbers: LineNumbersType = 'off';

  /**
   * Determines whether to show the minimap (code overview) on the right side of the editor.
   */
  @property({ type: Boolean })
  get minimap(): boolean {
    return this.#minimap;
  }
  set minimap(value: boolean) {
    this.#minimap = value;
    this.#applyOptions();
  }
  #minimap = false;

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
   * Determines whether the input is required to have a value.
   */
  get required(): boolean {
    return super.required;
  }
  set required(value: boolean) {
    super.required = value;
    this.#updateValidationState();
  }

  /**
   * JSON schema to use for validation when language is set to 'json'.
   * https://json-schema.org/
   */
  @property({ type: Object })
  get schema(): JSONSchema | undefined {
    return this.#schema;
  }
  set schema(value: JSONSchema | undefined) {
    this.#schema = value;
    this.#applySchema();
  }
  #schema?: JSONSchema;

  /**
   * Determines the number of spaces to use for indentation.
   */
  @property({ attribute: 'tab-size', type: Number })
  get tabSize(): number {
    return this.#tabSize;
  }
  set tabSize(value: number) {
    this.#tabSize = value;
    this.#applyOptions();
  }
  #tabSize = 2;

  /**
   * The current value/content of the editor.
   */
  override get value(): string {
    return super.value ?? '';
  }
  override set value(value: string) {
    super.value = value;
    this.#applyValue();
  }

  /**
   * Controls how text wrapping is handled in the editor.
   */
  @property({ attribute: 'word-wrap', type: String, reflect: true })
  get wordWrap(): WordWrapOptions {
    return this.#wordWrap;
  }
  set wordWrap(value: WordWrapOptions) {
    this.#wordWrap = value;
    this.#applyOptions();
  }
  #wordWrap: WordWrapOptions = 'off';

  /**
   * Determines whether to disable validation of the input.
   */
  get noValidate(): boolean {
    return super.noValidate;
  }
  set noValidate(value: boolean) {
    super.noValidate = value;
    this.#updateValidationState();
  }

  #monaco: typeof monaco | undefined;
  #editor: monaco.editor.IStandaloneCodeEditor | undefined;
  #model: monaco.editor.ITextModel | null;
  #isProgrammaticChange = false;

  static styles = useStyles([styles]);

  connectedCallback() {
    super.connectedCallback();

    this.tabIndex = 0;
    this.#updateValidationState();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.#clearSchema();
    this.#clearValidation();

    this.#editor?.dispose();
    this.#editor = undefined;
    this.#model = undefined;

    this._internals.states.delete('ready');
  }

  render() {
    return html`
      <div internal-host>
        <nve-monaco-editor @ready=${this.#editorReady} @canceled=${this.#editorCanceled}></nve-monaco-editor>
      </div>
    `;
  }

  focus() {
    this.#editor?.focus();
  }

  // NOTE: We don't use Lit's lifecycle to apply properties that overlap with updateOptions(), in order to avoid batched updates becoming desynchronized.

  updateOptions(options: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions) {
    if ('folding' in options) {
      this.#folding = options.folding;
    }
    if ('insertSpaces' in options) {
      this.#insertSpaces = options.insertSpaces;
    }
    if ('lineNumbers' in options) {
      this.#lineNumbers = options.lineNumbers;
    }
    if ('minimap' in options) {
      this.#minimap = options.minimap.enabled;
    }
    if ('readOnly' in options) {
      super.readOnly = options.readOnly;
    }
    if ('tabSize' in options) {
      this.#tabSize = options.tabSize;
    }
    if ('wordWrap' in options) {
      this.#wordWrap = options.wordWrap;
    }
    this.#editor?.updateOptions(options);
  }

  #editorReady(event: Event) {
    const editorEl = event.target as MonacoEditor;

    const monaco = editorEl.monaco;
    const editor = editorEl.editor;
    const model = editor.getModel();

    // Tweak the default options to be more visually and behaviorally consistent with an input control
    editor.updateOptions({
      renderLineHighlight: 'none',
      scrollbar: { alwaysConsumeMouseWheel: false }
    });

    const didChangeContentListener = model.onDidChangeContent(() => {
      this.#updateValidationState();

      // Emulate "input" events
      super.value = model.getValue();
      if (!this.#isProgrammaticChange) {
        this.dispatchInputEvent();
      }
    });

    let lastCommittedVersionId = model.getVersionId();
    const didFocusListener = editor.onDidFocusEditorText(() => {
      editor.updateOptions({ scrollbar: { alwaysConsumeMouseWheel: true } });

      lastCommittedVersionId = model.getVersionId();
    });
    const didBlurListener = editor.onDidBlurEditorText(() => {
      editor.updateOptions({ scrollbar: { alwaysConsumeMouseWheel: false } });

      // Emulate "change" events
      const currentVersionId = model.getVersionId();
      if (lastCommittedVersionId !== currentVersionId) {
        lastCommittedVersionId = currentVersionId;
        this.dispatchChangeEvent();
      }
    });

    // Listen for validation state changes
    const didValidateModelVersionListener = model.onDidValidateVersion(versionId => {
      if (!this.#shouldValidateSyntax()) {
        return;
      }
      const currentVersionId = model.getVersionId();
      if (versionId !== currentVersionId) {
        return;
      }

      if (this.#isRequiredAndEmpty()) {
        this.#setRequiredValidationError();
        return;
      }

      const markers = monaco.editor.getModelMarkers({ resource: model.uri });
      const errors = markers.filter(m => m.severity === monaco.MarkerSeverity.Error);

      if (errors.length > 0) {
        this.#setSyntaxValidationError(errors.map(e => e.message));
      } else {
        this.#clearValidation();
      }

      this.dispatchEvent(new Event('syntax-validation-changed'));
    });

    // Update the dispose listener to include the new listener
    const didDisposeListener = editor.onDidDispose(() => {
      didDisposeListener.dispose();
      didChangeContentListener.dispose();
      didFocusListener.dispose();
      didBlurListener.dispose();
      didValidateModelVersionListener.dispose();
    });

    this.#monaco = monaco;
    this.#editor = editor;
    this.#model = model;

    // Apply initial state from properties
    this.#applyLanguage();
    this.#applyOptions();
    this.#applyValue();

    this._internals.states.add('ready');

    this.dispatchEvent(new Event('ready'));
  }

  #editorCanceled(_event: Event) {
    this.dispatchEvent(new Event('canceled'));
  }

  #applyLanguage() {
    this.#model && this.#monaco?.editor.setModelLanguage(this.#model, this.#language);
    this.#applySchema();
    this.#updateValidationState();
  }

  #applyOptions() {
    this.#editor?.updateOptions({
      folding: this.#folding,
      insertSpaces: this.#insertSpaces,
      lineDecorationsWidth: this.#lineNumbers !== 'off' || this.#folding ? 10 : 0,
      lineNumbers: this.#lineNumbers,
      minimap: { ...this.#editor?.getOption(73 /* EditorOption.minimap */), enabled: this.#minimap },
      readOnly: this.readOnly || this.disabled,
      tabSize: this.#tabSize,
      wordWrap: this.#wordWrap
    });
  }

  #applyValue() {
    this.#isProgrammaticChange = true;
    this.#updateValidationState();
    this.#model?.setValue(this.value);
    this.#isProgrammaticChange = false;
  }

  #shouldValidateSyntax(): boolean {
    return !this.noValidate && isSyntaxValidationAvailable(this.#language);
  }

  #shouldValidate(): boolean {
    return !this.noValidate;
  }

  #isRequiredAndEmpty(): boolean {
    return this.required && !this.value;
  }

  #setRequiredValidationError() {
    this._internals.setValidity({ valueMissing: true }, 'This field is required');
  }

  #setSyntaxValidationPending() {
    this._internals.states.add('validating-syntax');
    this._internals.setValidity({ customError: true }, 'Validating syntax...');
  }

  #setSyntaxValidationError(errors: string[]) {
    this._internals.states.delete('validating-syntax');
    this._internals.setValidity({ customError: true }, errors.join('\n'));
  }

  #clearValidation() {
    this._internals.states.delete('validating-syntax');
    this._internals.setValidity({});
  }

  #updateValidationState() {
    if (!this.#shouldValidate()) {
      this.#clearValidation();
      return;
    }

    if (this.#isRequiredAndEmpty()) {
      this.#setRequiredValidationError();
    } else if (this.#shouldValidateSyntax()) {
      this.#setSyntaxValidationPending();
    } else {
      this.#clearValidation();
    }
  }

  #applySchema() {
    this.#clearSchema();

    if (!this.#schema || this.#language !== 'json' || !this.#monaco || !this.#model) {
      return;
    }

    setJSONSchemaForModel(this.#monaco, this.#model, this.#schema);
  }

  #clearSchema() {
    if (!this.#monaco || !this.#model) {
      return;
    }

    setJSONSchemaForModel(this.#monaco, this.#model, undefined);
  }
}
