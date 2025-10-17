import { html, LitElement } from 'lit';
import type { PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { attachInternals, useStyles } from '@nvidia-elements/core/internal';

import type * as monaco from '@nvidia-elements/monaco';
import type { Monaco } from '@nvidia-elements/monaco';
import type { MonacoEditor } from '@nvidia-elements/monaco/editor';

import {
  toHoveredLineDecorations,
  toProblemsFormat,
  toSelectedLineDecorations
} from '../internal/formats/problems-format.js';
import type { Problem } from '../internal/types/index.js';
import { equalsProblems } from '../internal/utils/problem-utils.js';

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
  scrollBeyondLastLine: false,
  showFoldingControls: 'always',
  tabSize: 2
};

function hasProblemsChanged(value: Problem[], oldValue: Problem[] | undefined) {
  return !equalsProblems(value, oldValue ?? []);
}

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
 * @slot empty - Slot for displaying empty state messages.
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

  @property({ type: Array, hasChanged: hasProblemsChanged })
  get problems(): Problem[] {
    return this.#problems;
  }
  set problems(value: Problem[]) {
    this.#problems = value;
  }
  #problems: Problem[] = [];

  #injectedStyles = false;

  #monaco?: Monaco;
  #editor?: monaco.editor.IStandaloneCodeEditor;
  #model?: monaco.editor.ITextModel;

  #lineDecorations: monaco.editor.IEditorDecorationsCollection;
  #selectedLineDecorations: monaco.editor.IEditorDecorationsCollection;
  #hoveredLineDecorations: monaco.editor.IEditorDecorationsCollection;

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

  updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('problems')) {
      this.#applyProblems();
    }
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

    this.#lineDecorations = editor.createDecorationsCollection([]);
    this.#selectedLineDecorations = editor.createDecorationsCollection([]);
    this.#hoveredLineDecorations = editor.createDecorationsCollection([]);

    this.#selectedLineNumber = undefined;
    this.#downLineNumber = undefined;

    this.#setupEditor(this.#editor);

    this.requestUpdate('problems');

    this._internals.states.add('ready');
    this.dispatchEvent(new CustomEvent('ready', { bubbles: true }));
  };

  #editorCanceled = (_event: Event) => {
    this.dispatchEvent(new CustomEvent('canceled', { bubbles: true }));
  };

  #setupEditor(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.updateOptions(EDITOR_OPTIONS);

    const editorEl = editor.getDomNode();
    editorEl.addEventListener('contextmenu', this.#onContextMenu);

    const onDidChangeModelContentListener = editor.onDidChangeModelContent(this.#onDidChangeModelContent);
    const onDidChangeCursorSelectionListener = editor.onDidChangeCursorSelection(this.#onDidChangeCursorSelection);
    const onEditorKeyUpListener = editor.onKeyUp(this.#onKeyUp);
    const onMouseUpListener = editor.onMouseUp(this.#onMouseUp);
    const onMouseDownListener = editor.onMouseDown(this.#onMouseDown);
    const onMouseMoveListener = editor.onMouseMove(this.#onMouseMove);
    const onMouseLeaveListener = editor.onMouseLeave(this.#onMouseLeave);

    const didDisposeListener = editor.onDidDispose(() => {
      didDisposeListener.dispose();
      onDidChangeModelContentListener.dispose();
      onDidChangeCursorSelectionListener.dispose();
      onEditorKeyUpListener.dispose();
      onMouseDownListener.dispose();
      onMouseUpListener.dispose();
      onMouseMoveListener.dispose();
      onMouseLeaveListener.dispose();

      editorEl.removeEventListener('contextmenu', this.#onContextMenu);

      this.#monaco = undefined;
      this.#editor = undefined;
      this.#model = undefined;

      this.#lineDecorations = undefined;
      this.#selectedLineDecorations = undefined;
      this.#hoveredLineDecorations = undefined;

      this.#selectedLineNumber = undefined;
      this.#downLineNumber = undefined;

      this.#getProblemByLine = undefined;
    });
  }

  #getProblemByLine?: (lineNumber: number) => Problem | undefined;

  #applyProblems() {
    if (!this.#monaco) {
      return;
    }
    const { text, decorations, getProblemByLine } = toProblemsFormat(this.#monaco, this.problems);
    this.#model?.setValue(text);
    this.#lineDecorations?.set(decorations);
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
    this.#selectedLineDecorations.set(toSelectedLineDecorations(this.#monaco, this.#selectedLineNumber));
  }

  #onContextMenu = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  #onDidChangeModelContent = () => {
    this.#selectedLineNumber = undefined;
  };

  #onDidChangeCursorSelection = (e: monaco.editor.ICursorSelectionChangedEvent) => {
    if (e.source === 'keyboard') {
      const selection = this.#editor.getSelection();
      if (selection.startLineNumber === selection.endLineNumber) {
        this.#selectedLineNumber = selection.startLineNumber;
      }
    }
    this.#selectedLineDecorations.set(toSelectedLineDecorations(this.#monaco, this.#selectedLineNumber));
  };

  #onKeyUp = (e: monaco.IKeyboardEvent) => {
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

  #onMouseDown = (e: monaco.editor.IEditorMouseEvent) => {
    if (this.#isEmptyModel()) {
      return;
    }

    const { detail: clickCount } = e.event;
    const lineNumber = e.target.position?.lineNumber;
    if (clickCount === 1) {
      this.#downLineNumber = lineNumber;
    }
  };

  #onMouseUp = (e: monaco.editor.IEditorMouseEvent) => {
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

  #onMouseMove = (e: monaco.editor.IEditorMouseEvent) => {
    const { element, position } = e.target;
    const lineNumber =
      !this.#isEmptyModel() && !element.classList.contains('view-lines') ? position?.lineNumber : undefined;
    this.#hoveredLineDecorations.set(toHoveredLineDecorations(this.#monaco, lineNumber));
  };

  #onMouseLeave = () => {
    this.#hoveredLineDecorations.set(toHoveredLineDecorations(this.#monaco, undefined));
  };
}
