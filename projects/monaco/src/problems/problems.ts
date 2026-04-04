// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import type { PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { attachInternals, useStyles } from '@nvidia-elements/core/internal';

import type * as monaco from '@nvidia-elements/monaco';
import type { Monaco } from '@nvidia-elements/monaco';
import { MonacoEditor } from '@nvidia-elements/monaco/editor';

import {
  toHoveredLineDecorations,
  toProblemsFormat,
  toSelectedLineDecorations
} from '../internal/formats/problems-format.js';
import type { Problem, ProblemCode } from '../internal/types/index.js';
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
 * @event canceled - Dispatched when the editor cancels initialization.
 * @event ready - Dispatched when the editor finishes initialization and becomes ready.
 * @event problem-selected - Dispatched when the user selects a problem.
 * @event problem-activated - Dispatched when the user activates a problem.
 * @event problem-context-menu - Dispatched when the user requests a problem's context menu.
 * @slot empty - Slot for displaying a message when empty.
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea
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

  static elementDefinitions = {
    [MonacoEditor.metadata.tag]: MonacoEditor
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

  #lineDecorations?: monaco.editor.IEditorDecorationsCollection;
  #selectedLineDecorations?: monaco.editor.IEditorDecorationsCollection;
  #hoveredLineDecorations?: monaco.editor.IEditorDecorationsCollection;

  #selectedLineNumber: number | undefined = undefined;
  #downLineNumber: number | undefined = undefined;

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
  }

  /* eslint-disable local/required-css-parts */
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
    editorEl.shadowRoot!.adoptedStyleSheets = [problemsStyles, ...editorEl.shadowRoot!.adoptedStyleSheets];
    this.#injectedStyles = true;
  };

  #editorReady = async (event: Event) => {
    const editorEl = event.target as MonacoEditor;

    await this.#injectStyles(editorEl);

    const editor = editorEl.editor!;
    const monaco = editorEl.monaco!;

    this.#monaco = monaco;
    this.#editor = editor;
    this.#model = editor.getModel()!;

    this.#lineDecorations = editor.createDecorationsCollection([]);
    this.#selectedLineDecorations = editor.createDecorationsCollection([]);
    this.#hoveredLineDecorations = editor.createDecorationsCollection([]);

    this.#selectedLineNumber = undefined;
    this.#downLineNumber = undefined;

    this.#setupEditor(editor);

    this.requestUpdate('problems');

    this._internals.states.add('ready');
    this.dispatchEvent(new CustomEvent('ready', { bubbles: true, composed: true }));
  };

  #editorCanceled = (_event: Event) => {
    this.dispatchEvent(new CustomEvent('canceled', { bubbles: true, composed: true }));
  };

  #setupEditor(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.updateOptions(EDITOR_OPTIONS);

    const editorEl = editor.getDomNode()!;
    editorEl.addEventListener('contextmenu', this.#onContextMenu);

    const onDidChangeModelContentListener = editor.onDidChangeModelContent(this.#onDidChangeModelContent);
    const onDidChangeCursorSelectionListener = editor.onDidChangeCursorSelection(this.#onDidChangeCursorSelection);
    const onEditorKeyUpListener = editor.onKeyUp(this.#onKeyUp);
    const onMouseUpListener = editor.onMouseUp(this.#onMouseUp);
    const onMouseDownListener = editor.onMouseDown(this.#onMouseDown);
    const onMouseMoveListener = editor.onMouseMove(this.#onMouseMove);
    const onMouseLeaveListener = editor.onMouseLeave(this.#onMouseLeave);

    const hoverProvider = this.#monaco!.languages.registerHoverProvider('*', {
      provideHover: this.#provideHover
    });

    const didDisposeListener = editor.onDidDispose(() => {
      didDisposeListener.dispose();
      onDidChangeModelContentListener.dispose();
      onDidChangeCursorSelectionListener.dispose();
      onEditorKeyUpListener.dispose();
      onMouseDownListener.dispose();
      onMouseUpListener.dispose();
      onMouseMoveListener.dispose();
      onMouseLeaveListener.dispose();

      hoverProvider.dispose();

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

  #isProblemCodeDecoration(position: monaco.Position): boolean {
    const { lineNumber, column } = position;
    const decorations = this.#editor!.getDecorationsInRange(
      new this.#monaco!.Range(lineNumber, column, lineNumber, column)
    );
    return decorations!.some(decoration => decoration.options.inlineClassName?.includes('problem-source-target'));
  }

  #provideHover = (
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.languages.ProviderResult<monaco.languages.Hover> => {
    if (model !== this.#model) {
      return;
    }
    const { lineNumber } = position;
    const problem = this.#getProblemByLine?.(lineNumber);
    if (!problem) {
      return;
    }
    const range = new this.#monaco!.Range(lineNumber, 1, lineNumber, 1);

    // code with target
    if (this.#isProblemCodeDecoration(position)) {
      return { contents: [{ value: (problem.code as ProblemCode).target.toString(), isTrusted: false }], range };
    }

    // multi-line message
    if (problem.message.includes('\n')) {
      return { contents: [{ value: '```\n' + problem.message + '\n```', isTrusted: false }], range };
    }

    return undefined;
  };

  #selectProblem(problem: Problem) {
    this.dispatchEvent(new CustomEvent('problem-selected', { bubbles: true, composed: true, detail: { problem } }));
  }

  #activateProblem(problem: Problem) {
    this.dispatchEvent(new CustomEvent('problem-activated', { bubbles: true, composed: true, detail: { problem } }));
  }

  #toggleContextMenu(problem: Problem) {
    this.dispatchEvent(new CustomEvent('problem-context-menu', { bubbles: true, composed: true, detail: { problem } }));
  }

  #isEmptyModel() {
    return this.#model!.getLineCount() === 1 && this.#model!.getLineLength(1) === 0;
  }

  #toggleFold() {
    this.#editor!.trigger('api', 'editor.toggleFold', {});
  }

  #selectLine(lineNumber: number) {
    this.#selectedLineNumber = lineNumber;
    const range = new this.#monaco!.Range(this.#selectedLineNumber, 1, this.#selectedLineNumber, 1);
    this.#editor!.setPosition(range.getStartPosition());
    this.#editor!.setSelection(range);
    this.#selectedLineDecorations!.set(toSelectedLineDecorations(this.#monaco!, this.#selectedLineNumber));
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
      const selection = this.#editor!.getSelection();
      if (selection && selection.startLineNumber === selection.endLineNumber) {
        this.#selectedLineNumber = selection.startLineNumber;
      }
    }
    this.#selectedLineDecorations!.set(toSelectedLineDecorations(this.#monaco!, this.#selectedLineNumber));
  };

  #onKeyUp = (e: monaco.IKeyboardEvent) => {
    if (this.#isEmptyModel()) {
      return;
    }

    const positionLineNumber = this.#editor!.getPosition()!.lineNumber;

    this.#selectLine(positionLineNumber);
    this.#handleKey(e.browserEvent, positionLineNumber);
  };

  #handleKey(event: KeyboardEvent, lineNumber: number) {
    const { key, shiftKey } = event;

    if (shiftKey && key === 'F10') {
      return this.#handleKeyProblemAction(lineNumber, p => this.#toggleContextMenu(p));
    }

    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown':
        return this.#handleKeyProblemAction(lineNumber, p => this.#selectProblem(p));
      case 'Enter':
      case ' ':
        return this.#handleKeyActivateOrFold(lineNumber);
    }
  }

  #handleKeyProblemAction(lineNumber: number, action: (problem: Problem) => void) {
    const problem = this.#getProblemByLine?.(lineNumber);
    if (problem) {
      action(problem);
    }
  }

  #handleKeyActivateOrFold(lineNumber: number) {
    const problem = this.#getProblemByLine?.(lineNumber);
    if (problem) {
      this.#activateProblem(problem);
    } else {
      this.#toggleFold();
    }
  }

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

    const { element, position } = e.target;
    const lineNumber = position?.lineNumber;

    if (this.#downLineNumber !== lineNumber || lineNumber === undefined || !element) {
      return;
    }

    this.#selectLine(lineNumber);

    const problem = this.#getProblemByLine?.(lineNumber);
    if (problem) {
      this.#handleProblemClick(e.event, position!, problem);
    } else {
      this.#handleNonProblemClick(element);
    }
  };

  #handleProblemClick(event: monaco.IMouseEvent, position: monaco.Position, problem: Problem) {
    if (event.leftButton) {
      if (this.#isProblemCodeDecoration(position)) {
        globalThis.open((problem.code as ProblemCode).target.toString(), '_blank');
        return;
      }
      if (event.detail === 1) {
        this.#selectProblem(problem);
      }
      if (event.detail === 2) {
        this.#activateProblem(problem);
      }
    }
    if (event.rightButton) {
      this.#toggleContextMenu(problem);
    }
  }

  #handleNonProblemClick(element: HTMLElement) {
    if (
      !element.classList.contains('codicon-folding-expanded') &&
      !element.classList.contains('codicon-folding-collapsed')
    ) {
      this.#toggleFold();
    }
  }

  #onMouseMove = (e: monaco.editor.IEditorMouseEvent) => {
    const { element, position } = e.target;
    const lineNumber =
      !this.#isEmptyModel() && element && !element.classList.contains('view-lines') ? position?.lineNumber : undefined;
    this.#hoveredLineDecorations!.set(toHoveredLineDecorations(this.#monaco!, lineNumber));
  };

  #onMouseLeave = () => {
    this.#hoveredLineDecorations!.set(toHoveredLineDecorations(this.#monaco!, undefined));
  };
}
