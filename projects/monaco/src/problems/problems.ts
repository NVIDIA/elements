import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { attachInternals, useStyles } from '@nvidia-elements/core/internal';

import type * as monaco from '@nvidia-elements/monaco';
import type { Monaco } from '@nvidia-elements/monaco';
import type { MonacoEditor } from '@nvidia-elements/monaco/editor';

import { EditorDecorator, toProblemsFormat } from '../internal/formats/problems-format.js';
import type { Problem } from '../internal/types/index.js';

import styles from './problems.css?inline';
import loadingStyles from '../internal/base/loading.css?inline';

const EDITOR_OPTIONS: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions = {
  contextmenu: false,
  cursorStyle: 'line',
  domReadOnly: true,
  dragAndDrop: false,
  folding: true,
  foldingStrategy: 'indentation',
  lineHeight: 22,
  lineNumbers: 'off',
  minimap: {
    enabled: false
  },
  multiCursorLimit: 1,
  occurrencesHighlight: 'off',
  readOnly: true,
  renderLineHighlight: 'none',
  renderWhitespace: 'none',
  selectionHighlight: false,
  showFoldingControls: 'always',
  tabSize: 2
};

/**
 * @element nve-monaco-problems
 * @description A Monaco Editor based tree view for presenting problems (i.e. diagnostics markers).
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/monaco/problems
 * @cssprop --background
 * @cssprop --min-height
 * @event canceled - Dispatched when editor initialization is canceled.
 * @event ready - Dispatched when the editor is initialized and ready.
 * @event problem-selected - Dispatched when a problem is selected.
 * @event problem-activated - Dispatched when a problem is activated.
 * @event problem-context-menu - Dispatched when a problem's context menu is requested.
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea
 * @storybook https://NVIDIA.github.io/elements/docs/labs/monaco/problems/
 * @stable false
 */
export class MonacoProblems extends LitElement {
  /** @private */
  declare _internals: ElementInternals;

  static styles = useStyles([styles, loadingStyles]);

  static readonly metadata = {
    tag: 'nve-monaco-problems',
    version: '0.0.0'
  };

  @property({ type: Array })
  get problems(): Problem[] {
    return this.#problems;
  }
  set problems(value: Problem[]) {
    this.#problems = value;
    this.#applyProblems();
  }
  #problems: Problem[] = [];

  #injectedStyles = false;

  #monaco?: Monaco;
  #editor?: monaco.editor.IStandaloneCodeEditor;
  #model?: monaco.editor.ITextModel;
  #decorator?: EditorDecorator;

  #selectedLineNumber: number | undefined = undefined;
  #downLineNumber: number | undefined = undefined;

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
  }

  render() {
    return html`
      <div internal-host>
        <nve-monaco-editor @ready=${this.#editorReady} @canceled=${this.#editorCanceled}></nve-monaco-editor>
        <slot name="empty" ?hidden=${this.#problems.length > 0}>
          <p class="empty-message">No problems detected.</p>
        </slot>
      </div>
    `;
  }

  #injectStyles = async (editorEl: MonacoEditor) => {
    if (this.#injectedStyles) {
      return;
    }
    const problemsCSS = await import('../internal/formats/problems-format.css?inline');
    const problemsStyles = new CSSStyleSheet();
    problemsStyles.replaceSync(problemsCSS.default);
    editorEl.shadowRoot.adoptedStyleSheets = [problemsStyles, ...editorEl.shadowRoot.adoptedStyleSheets];
    this.#injectedStyles = true;
  };

  #editorReady = async (event: Event) => {
    const editorEl = event.target as MonacoEditor;

    await this.#injectStyles(editorEl);

    const { editor, monaco } = editorEl;

    this.#monaco = monaco;
    this.#editor = editor;
    this.#model = editor.getModel();
    this.#decorator = new EditorDecorator(this.#monaco, this.#editor);

    this.#selectedLineNumber = undefined;
    this.#downLineNumber = undefined;

    this.#setupEditor(this.#editor);

    this.#applyProblems();

    this._internals.states.add('ready');
    this.dispatchEvent(new CustomEvent('ready', { bubbles: true }));
  };

  #editorCanceled = (_event: Event) => {
    this.dispatchEvent(new CustomEvent('canceled', { bubbles: true }));
  };

  #setupEditor(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.updateOptions(EDITOR_OPTIONS);

    const onDidChangeModelContentListener = editor.onDidChangeModelContent(this.#onDidChangeModelContent);
    const onDidChangeCursorSelectionListener = editor.onDidChangeCursorSelection(this.#onDidChangeCursorSelection);
    const onEditorKeyUpListener = editor.onKeyUp(this.#onDidKeyUp);
    const onMouseUpListener = editor.onMouseUp(this.#onDidMouseUp);
    const onMouseDownListener = editor.onMouseDown(this.#onDidMouseDown);
    const onMouseMoveListener = editor.onMouseMove(this.#onDidMouseMove);
    const onMouseLeaveListener = editor.onMouseLeave(this.#onDidMouseLeave);

    const didDisposeListener = editor.onDidDispose(() => {
      didDisposeListener.dispose();
      onDidChangeModelContentListener.dispose();
      onDidChangeCursorSelectionListener.dispose();
      onEditorKeyUpListener.dispose();
      onMouseDownListener.dispose();
      onMouseUpListener.dispose();
      onMouseMoveListener.dispose();
      onMouseLeaveListener.dispose();
    });
  }

  #getProblemByLine?: (lineNumber: number) => Problem | undefined;

  #applyProblems() {
    const { text, getProblemByLine } = toProblemsFormat(this.problems);
    this.#model?.setValue(text);
    this.#getProblemByLine = getProblemByLine;
  }

  #selectProblem(problem: Problem) {
    this.dispatchEvent(new CustomEvent('problem-selected', { bubbles: true, detail: { problem } }));
  }

  #activateProblem(problem: Problem) {
    this.dispatchEvent(new CustomEvent('problem-activated', { bubbles: true, detail: { problem } }));
  }

  #toggleContextMenu(problem: Problem) {
    this.dispatchEvent(new CustomEvent('problem-context-menu', { bubbles: true, detail: { problem } }));
  }

  #isEmptyModel() {
    return this.#model.getLineCount() === 1 && this.#model.getLineLength(1) === 0;
  }

  #toggleFold() {
    this.#editor.trigger('api', 'editor.toggleFold', {});
  }

  #selectLine(lineNumber: number) {
    this.#selectedLineNumber = lineNumber;
    const range = new this.#monaco.Range(this.#selectedLineNumber, 1, this.#selectedLineNumber, 1);
    this.#editor.setPosition(range.getStartPosition());
    this.#editor.setSelection(range);
    this.#decorator.decorateSelectedLine(this.#selectedLineNumber);
  }

  #onDidChangeModelContent = () => {
    this.#selectedLineNumber = undefined;
    this.#decorator.decorateLines(this.#model);
  };

  #onDidChangeCursorSelection = (e: monaco.editor.ICursorSelectionChangedEvent) => {
    if (e.source === 'keyboard') {
      const selection = this.#editor.getSelection();
      if (selection.startLineNumber === selection.endLineNumber) {
        this.#selectedLineNumber = selection.startLineNumber;
      }
    }
    this.#decorator.decorateSelectedLine(this.#selectedLineNumber);
  };

  #onDidKeyUp = (e: monaco.IKeyboardEvent) => {
    if (this.#isEmptyModel()) {
      return;
    }

    const { key, shiftKey } = e.browserEvent;

    const positionLineNumber = this.#editor.getPosition().lineNumber;

    this.#selectLine(positionLineNumber);

    if (key === 'ArrowUp' || key === 'ArrowDown') {
      const problem = this.#getProblemByLine(positionLineNumber);
      if (problem) {
        this.#selectProblem(problem);
      }
    }
    if (key === 'Enter' || key === ' ') {
      const problem = this.#getProblemByLine(positionLineNumber);
      if (problem) {
        this.#activateProblem(problem);
      } else {
        this.#toggleFold();
      }
    }
    if (shiftKey && key === 'F10') {
      const problem = this.#getProblemByLine(positionLineNumber);
      if (problem) {
        this.#toggleContextMenu(problem);
      }
    }
  };

  #onDidMouseDown = (e: monaco.editor.IEditorMouseEvent) => {
    if (this.#isEmptyModel()) {
      return;
    }

    const { detail: clickCount } = e.event;
    const lineNumber = e.target.position?.lineNumber;
    if (clickCount === 1) {
      this.#downLineNumber = lineNumber;
    }
  };

  #onDidMouseUp = (e: monaco.editor.IEditorMouseEvent) => {
    if (this.#isEmptyModel()) {
      return;
    }

    const { detail: clickCount, leftButton, rightButton } = e.event;
    const { element } = e.target;
    const lineNumber = e.target.position?.lineNumber;

    if (this.#downLineNumber !== lineNumber) {
      return;
    }

    this.#selectLine(lineNumber);

    const problem = this.#getProblemByLine(lineNumber);
    if (problem) {
      if (leftButton) {
        if (clickCount === 1) {
          this.#selectProblem(problem);
        }
        if (clickCount === 2) {
          this.#activateProblem(problem);
        }
      }
      if (rightButton) {
        this.#toggleContextMenu(problem);
      }
    } else {
      if (
        !element.classList.contains('codicon-folding-expanded') &&
        !element.classList.contains('codicon-folding-collapsed')
      ) {
        this.#toggleFold();
      }
    }
  };

  #onDidMouseMove = (e: monaco.editor.IEditorMouseEvent) => {
    const { element, position } = e.target;
    const lineNumber =
      !this.#isEmptyModel() && !element.classList.contains('view-lines') ? position?.lineNumber : undefined;
    this.#decorator.decorateHoveredLine(lineNumber);
  };

  #onDidMouseLeave = () => {
    this.#decorator.decorateHoveredLine(undefined);
  };
}
