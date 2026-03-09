import { LitElement } from 'lit';
import type { TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

import { useStyles } from '@nvidia-elements/core/internal';

import { FormControlMixin } from '@nvidia-elements/forms/mixin';

import type * as monaco from '@nvidia-elements/monaco';
import type { Monaco } from '@nvidia-elements/monaco';
import type { MonacoEditor } from '@nvidia-elements/monaco/editor';

import type { BaseMonacoEditor } from './editor.js';

import styles from './input.css?inline';
import loadingStyles from './loading.css?inline';

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

const SYNTAX_VALIDATABLE_LANGUAGES: SuggestedLanguages[] = ['css', 'json', 'javascript', 'typescript'];

export type JSONSchema = monaco.json.JSONSchema;

// Derived from: monaco.editor.LineNumbersType
export type LineNumberFormatter = (lineNumber: number) => string;
export type LineNumbersType = 'on' | 'off' | 'relative' | 'interval' | LineNumberFormatter;

// Derived from: monaco.editor.IEditorOptions['wordWrap']
export type WordWrapOptions = 'off' | 'on' | 'wordWrapColumn' | 'bounded';

function isSyntaxValidationAvailable(language: string): boolean {
  return SYNTAX_VALIDATABLE_LANGUAGES.includes(language as (typeof SYNTAX_VALIDATABLE_LANGUAGES)[number]);
}

function setJSONSchemaForModel(monaco: Monaco, model: monaco.editor.ITextModel, schema: JSONSchema | undefined) {
  const options = monaco.json.jsonDefaults.diagnosticsOptions;
  const uri = model.uri.toString();

  const otherSchemas = options.schemas!.filter(
    ({ fileMatch }) => fileMatch && fileMatch.length === 1 && fileMatch[0] !== uri
  );
  const schemasForThisModel = schema ? [{ uri, fileMatch: [uri], schema }] : [];

  monaco.json.jsonDefaults.setDiagnosticsOptions({
    ...options,
    validate: true,
    schemaValidation: 'error',
    schemas: [...otherSchemas, ...schemasForThisModel]
  });
}

/**
 * Base class for Monaco input wrapper custom elements.
 * @cssprop --background
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --min-height
 * @cssprop --padding
 * @event canceled - Dispatched when the editor cancels initialization.
 * @event ready - Dispatched when the editor finishes initialization and becomes ready.
 * @event input - Dispatched when the element's value changes as a result of a user action.
 * @event change - Dispatched when the user modifies and commits the element's value.
 * @event reset - Dispatched when the control state is reset to its initial value.
 * @event invalid - Dispatched when the control is invalid.
 * @event syntax-validation-changed - Dispatched when syntax validation state changes.
 */
export abstract class BaseMonacoInput<
  T extends BaseMonacoEditor<TEditor>,
  TEditor extends monaco.editor.IEditor
> extends FormControlMixin<typeof LitElement, string>(LitElement) {
  static styles = useStyles([styles, loadingStyles]);

  #monaco: Monaco | undefined;
  #editor: monaco.editor.IStandaloneCodeEditor | undefined;
  #model: monaco.editor.ITextModel | null;
  #isProgrammaticChange = false;

  /**
   * Defines the programming language for syntax highlighting and validation.
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
   * Determines whether the editor supports code folding.
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
   * Determines whether the input requires a value.
   */
  get required(): boolean {
    return super.required;
  }
  set required(value: boolean) {
    super.required = value;
    this.#updateValidationState();
  }

  /**
   * JSON schema for validation when the language equals 'json'.
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
    const previous = this.value;
    super.value = value;
    if (value !== previous) {
      this.#applyValue();
    }
  }

  /**
   * Controls how the editor wraps text.
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
    return this.#noValidate;
  }
  set noValidate(value: boolean) {
    this.#noValidate = value;
    this.#updateValidationState();
  }
  #noValidate = false;

  async connectedCallback() {
    super.connectedCallback();

    this.tabIndex = 0;
    this.#updateValidationState();

    await this.updateComplete;

    this._editor?.addEventListener('ready', this.#editorReady);
    this._editor?.addEventListener('canceled', this.#editorCanceled);
  }

  disconnectedCallback() {
    this._editor?.removeEventListener('ready', this.#editorReady);
    this._editor?.removeEventListener('canceled', this.#editorCanceled);

    this.#clearSchema();
    this.#clearValidation();

    this.#editor?.dispose();
    this.#editor = undefined;
    this.#model = null;

    this._internals.states.delete('ready');
  }

  focus() {
    this.#editor?.focus();
  }

  #applyLanguage() {
    this.#model && this.#monaco?.editor.setModelLanguage(this.#model, this.language);
    this.#applySchema();
    this.#updateValidationState();
  }

  #applySchema() {
    this.#clearSchema();

    if (!this.schema || this.language !== 'json' || !this.#monaco || !this.#model) {
      return;
    }

    setJSONSchemaForModel(this.#monaco, this.#model, this.schema);
  }

  #applyOptions() {
    this._updateEditorOptions({
      folding: this.folding,
      insertSpaces: this.insertSpaces,
      lineNumbers: this.lineNumbers,
      minimap: { ...this.#editor?.getOption(81 /* EditorOption.minimap */), enabled: this.minimap },
      readOnly: this.readOnly || this.disabled,
      tabSize: this.tabSize,
      wordWrap: this.wordWrap
    });
  }

  #applyValue() {
    this.#isProgrammaticChange = true;
    this.#updateValidationState();
    this.#model?.setValue(this.value);
    this.#isProgrammaticChange = false;
  }

  abstract render(): TemplateResult;

  // NOTE: We don't use Lit's lifecycle to apply properties that overlap with updateOptions(), to avoid batched updates becoming desynchronized.
  updateEditorOptions(options: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions) {
    if ('folding' in options) {
      this.#folding = options.folding!;
    }
    if ('insertSpaces' in options) {
      this.#insertSpaces = options.insertSpaces!;
    }
    if ('lineNumbers' in options) {
      this.#lineNumbers = options.lineNumbers!;
    }
    if ('minimap' in options) {
      this.#minimap = options.minimap?.enabled!;
    }
    if ('readOnly' in options) {
      super.readOnly = options.readOnly!;
    }
    if ('tabSize' in options) {
      this.#tabSize = options.tabSize!;
    }
    if ('wordWrap' in options) {
      this.#wordWrap = options.wordWrap!;
    }
    this._updateEditorOptions(options);
  }

  #shouldValidateSyntax(): boolean {
    return !this.noValidate && isSyntaxValidationAvailable(this.language);
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
    this._internals.states.add('validating');
    this._internals.setValidity({ customError: true }, 'Validating syntax...');
  }

  #setSyntaxValidationError(errors: string[]) {
    this._internals.states.delete('validating');
    this._internals.setValidity({ customError: true }, errors.join('\n'));
  }

  #clearValidation() {
    this._internals.states.delete('validating');
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

  #clearSchema() {
    if (!this.#monaco || !this.#model) {
      return;
    }

    setJSONSchemaForModel(this.#monaco, this.#model, undefined);
  }

  #editorReady = (event: Event) => {
    const editorEl = event.target as MonacoEditor;

    const monaco = editorEl.monaco!;
    const editor = this._createEditor(monaco);
    const model = editor.getModel()!;

    // Tweak the default options to be more visually and behaviorally consistent with an input control
    editor.updateOptions({
      renderLineHighlight: 'none',
      scrollBeyondLastLine: false,
      scrollbar: { alwaysConsumeMouseWheel: false }
    });

    const didChangeContentListener = model.onDidChangeContent(() => {
      this.#updateValidationState();

      // Emulate "input" events
      const newValue = model.getValue();
      super.value = newValue;
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

      const markers = this.#monaco!.editor.getModelMarkers({ resource: model.uri });
      const errors = markers.filter(m => m.severity === this.#monaco!.MarkerSeverity.Error);

      if (errors.length > 0) {
        this.#setSyntaxValidationError(errors.map(e => e.message));
      } else {
        this.#clearValidation();
      }

      this.dispatchEvent(new CustomEvent('syntax-validation-changed', { bubbles: true }));
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

    this.dispatchEvent(new CustomEvent('ready', { bubbles: true }));
  };

  #editorCanceled = (event: Event) => {
    event.stopPropagation();

    this.dispatchEvent(new CustomEvent('canceled', { bubbles: true }));
  };

  protected abstract get _editor(): T;

  protected abstract _createEditor(monaco: Monaco): monaco.editor.IStandaloneCodeEditor;

  protected _updateEditorOptions(options: Partial<monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions>) {
    this.#editor?.updateOptions(options);
  }
}
