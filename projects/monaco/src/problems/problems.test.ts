import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@nvidia-elements/testing';

import type * as monaco from '@nvidia-elements/monaco';
import { MonacoEditor } from '@nvidia-elements/monaco/editor';

import { MonacoProblems, ProblemSeverity } from '@nvidia-elements/monaco/problems';
import type { Problem } from '@nvidia-elements/monaco/problems';

import '@nvidia-elements/monaco/problems/define.js';

// test helpers

async function eventAfter<T extends Event & { detail?: unknown }>(
  element: HTMLElement | Document,
  event: string,
  trigger: (() => void) | (() => Promise<void>)
): Promise<T> {
  const eventPromise: Promise<T> = untilEvent(element, event);
  await trigger();
  return eventPromise;
}

// user gesture emulation helpers for monaco-editor

function emulateArrowDownKey(editor: monaco.editor.IStandaloneCodeEditor) {
  const textarea = editor.getDomNode().querySelector<HTMLTextAreaElement>('textarea');
  textarea.focus();
  editor.trigger('keyboard', 'cursorDown', {});
  textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown', bubbles: true }));
}

function emulateArrowUpKey(editor: monaco.editor.IStandaloneCodeEditor) {
  const textarea = editor.getDomNode().querySelector<HTMLTextAreaElement>('textarea');
  textarea.focus();
  editor.trigger('keyboard', 'cursorUp', {});
  textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
  textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp', bubbles: true }));
}

function emulateEnterKey(editor: monaco.editor.IStandaloneCodeEditor) {
  const textarea = editor.getDomNode().querySelector<HTMLTextAreaElement>('textarea');
  textarea.focus();
  textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
}

function emulateSpaceKey(editor: monaco.editor.IStandaloneCodeEditor) {
  const textarea = editor.getDomNode().querySelector<HTMLTextAreaElement>('textarea');
  textarea.focus();
  textarea.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
  textarea.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
}

function emulateShiftF10Key(editor: monaco.editor.IStandaloneCodeEditor) {
  const textarea = editor.getDomNode().querySelector<HTMLTextAreaElement>('textarea');
  textarea.focus();
  textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'F10', shiftKey: true, bubbles: true }));
  textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'F10', shiftKey: true, bubbles: true }));
}

function emulateSelectionExpand(editor: monaco.editor.IStandaloneCodeEditor, line: number, to: 'down' | 'up' = 'down') {
  editor.trigger('keyboard', 'cursorMove', { to, by: 'line', value: 1, select: true });
  emulateClick(getEditorLineElement(editor, line), { detail: 2 });
}

function getEditorLineElement(editor: monaco.editor.IStandaloneCodeEditor, line: number): HTMLElement {
  return editor.getDomNode().querySelector<HTMLElement>(`.view-line:nth-child(${line})`);
}

function getCenterCoordinates(element: HTMLElement): {
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
} {
  const rect = element.getBoundingClientRect();
  const clientX = rect.left + rect.width / 2;
  const clientY = rect.top + rect.height / 2;
  const offsetX = clientX - rect.left;
  const offsetY = clientY - rect.top;
  return { clientX, clientY, offsetX, offsetY };
}

function emulateMouseDown(element: HTMLElement, options: { detail?: number; button?: number } = {}) {
  const coordinates = getCenterCoordinates(element);
  element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, ...coordinates, ...options }));
}

function emulateMouseUp(element: HTMLElement, options: { detail?: number; button?: number } = {}) {
  const coordinates = getCenterCoordinates(element);
  element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, ...coordinates, ...options }));
}

function emulateClick(element: HTMLElement, options: { detail?: number; button?: number } = {}) {
  const coordinates = getCenterCoordinates(element);

  element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, ...coordinates, ...options }));
  element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, ...coordinates, ...options }));
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, ...coordinates, ...options }));
}

function emulateLineClick(
  editor: monaco.editor.IStandaloneCodeEditor,
  line: number,
  options: { detail?: number; button?: number } = {}
) {
  const element = getEditorLineElement(editor, line);
  emulateClick(element, options);
}

function emulateMouseMove(element: HTMLElement) {
  const coordinates = getCenterCoordinates(element);
  element.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, ...coordinates }));
}

function emulateMouseLeave(element: HTMLElement) {
  const coordinates = getCenterCoordinates(element);
  element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true, ...coordinates }));
}

// test fixtures

const problems: Problem[] = [
  {
    resource: 'file:///src/components/Button.ts',
    message: "'index' is declared but its value is never read.",
    severity: ProblemSeverity.Warning,
    startLineNumber: 16,
    startColumn: 5,
    endLineNumber: 16,
    endColumn: 10,
    source: 'ts(6133)',
    owner: 'typescript'
  },
  {
    resource: 'file:///src/components/Button.ts',
    message: "Type 'string' is not assignable to type 'number'.",
    severity: ProblemSeverity.Error,
    startLineNumber: 14,
    startColumn: 8,
    endLineNumber: 14,
    endColumn: 24,
    source: 'ts(2322)',
    owner: 'typescript'
  },
  {
    resource: 'file:///src/utils/styles.css',
    message: "Unknown property 'colr'. Did you mean 'color'?",
    severity: ProblemSeverity.Info,
    startLineNumber: 40,
    startColumn: 2,
    endLineNumber: 40,
    endColumn: 6,
    source: 'css',
    owner: 'css'
  },
  {
    resource: 'file:///src/utils/formatDate.ts',
    message: "Convert 'var' to 'let' or 'const'.",
    severity: ProblemSeverity.Hint,
    startLineNumber: 57,
    startColumn: 1,
    endLineNumber: 57,
    endColumn: 4,
    source: 'eslint',
    owner: 'eslint'
  }
];

const problemsText = `\
"Button.ts" "/src/components/Button.ts" 2
	error "Type 'string' is not assignable to type 'number'." "ts(2322)" [Ln 14, Col 8]
	warning "'index' is declared but its value is never read." "ts(6133)" [Ln 16, Col 5]
"formatDate.ts" "/src/utils/formatDate.ts" 1
	hint "Convert 'var' to 'let' or 'const'." "eslint" [Ln 57, Col 1]
"styles.css" "/src/utils/styles.css" 1
	info "Unknown property 'colr'. Did you mean 'color'?" "css" [Ln 40, Col 2]`;

const expectedRows = [
  { type: 'file' },
  { type: 'problem', problem: problems[1] },
  { type: 'problem', problem: problems[0] },
  { type: 'file' },
  { type: 'problem', problem: problems[3] },
  { type: 'file' },
  { type: 'problem', problem: problems[2] }
];

// tests

describe('nve-monaco-problems', () => {
  let fixture: HTMLElement;
  let element: MonacoProblems;

  let editorEl: MonacoEditor;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let model: monaco.editor.ITextModel;

  let dispatchEventSpy: Mock<(event: Event) => void>;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-monaco-problems></nve-monaco-problems>
    `);
    element = fixture.querySelector(MonacoProblems.metadata.tag) as MonacoProblems;

    await untilEvent(element, 'ready');
    await elementIsStable(element);

    editorEl = element.shadowRoot.querySelector<MonacoEditor>(MonacoEditor.metadata.tag);
    editor = editorEl.editor!;
    model = editor.getModel();

    dispatchEventSpy = vi.spyOn(element, 'dispatchEvent');
  });

  afterEach(() => {
    dispatchEventSpy.mockRestore();

    removeFixture(fixture);
  });

  it('should define element', async () => {
    expect(customElements.get(MonacoProblems.metadata.tag)).toBeDefined();
  });

  it('should instantiate editor', async () => {
    expect(element.shadowRoot.querySelector(MonacoProblems.metadata.tag)).toBeDefined();
  });

  it('should render empty slot when no problems are provided', async () => {
    element.problems = [];

    await elementIsStable(element);

    const emptySlot = element.shadowRoot.querySelector<HTMLSlotElement>('slot[name="empty"]');

    expect(emptySlot).toBeDefined();
    expect(emptySlot.hidden).toBe(false);
  });

  it('should not render empty slot when problems are provided', async () => {
    element.problems = problems;
    await elementIsStable(element);

    const emptySlot = element.shadowRoot.querySelector<HTMLSlotElement>('slot[name="empty"]');

    expect(emptySlot).toBeDefined();
    expect(emptySlot.hidden).toBe(true);
  });

  it('should render problems', async () => {
    element.problems = problems;
    await elementIsStable(element);
    expect(model.getLineCount()).toBe(expectedRows.length);
    await expect.poll(() => editorEl.shadowRoot.querySelectorAll('.view-line').length).toBe(expectedRows.length);

    expect(model.getValue()).toBe(problemsText);
  });

  it('should gracefully handle connect/disconnect during initialization', async () => {
    const { parentElement } = element;

    element.remove();

    const canceledEvent = untilEvent(element, 'canceled');
    parentElement.appendChild(element);
    element.remove();
    await canceledEvent;

    const readyEvent = untilEvent(element, 'ready');
    parentElement.appendChild(element);
    await readyEvent;
  });

  it('should not re-insert editor styles when reconnected to DOM', async () => {
    const initialStyleSheets = editorEl.shadowRoot.adoptedStyleSheets.length;

    fixture.removeChild(element);

    await elementIsStable(element);

    fixture.appendChild(element);

    await untilEvent(element, 'ready');
    await elementIsStable(element);

    expect(editorEl.shadowRoot.adoptedStyleSheets.length).toBe(initialStyleSheets);
  });

  it('should navigate via arrow keys and dispatch relevant events for each row', async () => {
    element.problems = problems;
    await elementIsStable(element);
    expect(model.getLineCount()).toBe(expectedRows.length);
    await expect.poll(() => editorEl.shadowRoot.querySelectorAll('.view-line').length).toBe(expectedRows.length);

    // prettier-ignore
    async function expectFileRowActionEvents(childLineCount: number) {
      dispatchEventSpy.mockClear();

      emulateEnterKey(editor);
      await expect.poll(() => editorEl.shadowRoot.querySelectorAll('.view-line').length).toBe(expectedRows.length - childLineCount);

      emulateSpaceKey(editor);
      await expect.poll(() => editorEl.shadowRoot.querySelectorAll('.view-line').length).toBe(expectedRows.length);

      expect(() => emulateShiftF10Key(editor)).not.toThrow();
      expect(dispatchEventSpy).not.toHaveBeenCalled();
    }

    // prettier-ignore
    async function expectProblemRowActionEvents(problem: Problem) {
      await expect(eventAfter(element, 'problem-activated', () => emulateEnterKey(editor))).resolves.toHaveProperty('detail', { problem });
      await expect(eventAfter(element, 'problem-activated', () => emulateSpaceKey(editor))).resolves.toHaveProperty('detail', { problem });
      await expect(eventAfter(element, 'problem-context-menu', () => emulateShiftF10Key(editor))).resolves.toHaveProperty('detail', { problem });
    }

    await expectFileRowActionEvents(2);

    await expect(eventAfter(element, 'problem-selected', () => emulateArrowDownKey(editor))).resolves.toStrictEqual(
      expect.objectContaining({ detail: { problem: expectedRows[1].problem } })
    );
    await expectProblemRowActionEvents(expectedRows[1].problem);

    await expect(eventAfter(element, 'problem-selected', () => emulateArrowDownKey(editor))).resolves.toStrictEqual(
      expect.objectContaining({ detail: { problem: expectedRows[2].problem } })
    );
    await expectProblemRowActionEvents(expectedRows[2].problem);

    emulateArrowDownKey(editor);
    await expectFileRowActionEvents(1);

    await expect(eventAfter(element, 'problem-selected', () => emulateArrowDownKey(editor))).resolves.toStrictEqual(
      expect.objectContaining({ detail: { problem: expectedRows[4].problem } })
    );
    await expectProblemRowActionEvents(expectedRows[4].problem);

    emulateArrowDownKey(editor);
    await expectFileRowActionEvents(1);

    await expect(eventAfter(element, 'problem-selected', () => emulateArrowDownKey(editor))).resolves.toStrictEqual(
      expect.objectContaining({ detail: { problem: expectedRows[6].problem } })
    );
    await expectProblemRowActionEvents(expectedRows[6].problem);

    emulateArrowUpKey(editor);
    await expectFileRowActionEvents(1);

    await expect(eventAfter(element, 'problem-selected', () => emulateArrowUpKey(editor))).resolves.toStrictEqual(
      expect.objectContaining({ detail: { problem: expectedRows[4].problem } })
    );
    await expectProblemRowActionEvents(expectedRows[4].problem);

    emulateArrowUpKey(editor);
    await expectFileRowActionEvents(1);

    await expect(eventAfter(element, 'problem-selected', () => emulateArrowUpKey(editor))).resolves.toStrictEqual(
      expect.objectContaining({ detail: { problem: expectedRows[2].problem } })
    );
    await expectProblemRowActionEvents(expectedRows[2].problem);

    await expect(eventAfter(element, 'problem-selected', () => emulateArrowUpKey(editor))).resolves.toStrictEqual(
      expect.objectContaining({ detail: { problem: expectedRows[1].problem } })
    );
    await expectProblemRowActionEvents(expectedRows[1].problem);

    emulateArrowUpKey(editor);
    await expectFileRowActionEvents(2);
  });

  it('should gracefully ignore smart select expand and retain existing selection', async () => {
    element.problems = problems;
    await elementIsStable(element);
    expect(model.getLineCount()).toBe(expectedRows.length);
    await expect.poll(() => editorEl.shadowRoot.querySelectorAll('.view-line').length).toBe(expectedRows.length);

    const { startColumn, endColumn, startLineNumber, endLineNumber } = editor.getSelection();

    expect(() => emulateSelectionExpand(editor, startLineNumber)).not.toThrow();
    expect(editor.getSelection()).toMatchObject({ startColumn, endColumn, startLineNumber, endLineNumber });
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('should gracefully handle keyboard events when empty', async () => {
    element.problems = [];
    await elementIsStable(element);
    expect(model.getValue()).toBe('');
    await expect.poll(() => editorEl.shadowRoot.querySelectorAll('.view-line').length).toBe(1);

    expect(() => emulateArrowDownKey(editor)).not.toThrow();
    expect(dispatchEventSpy).not.toHaveBeenCalled();

    expect(() => emulateArrowUpKey(editor)).not.toThrow();
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('should decorate hovered lines', async () => {
    element.problems = problems;
    await elementIsStable(element);
    expect(model.getLineCount()).toBe(expectedRows.length);
    await expect.poll(() => editorEl.shadowRoot.querySelectorAll('.view-line').length).toBe(expectedRows.length);

    function getHoveredLineElement(line: number) {
      return editorEl.shadowRoot.querySelector<HTMLElement>(
        `.view-overlays div:nth-child(${line}) .problems-line-hovered`
      );
    }
    function getHoveredLineElements() {
      return editorEl.shadowRoot.querySelectorAll<HTMLElement>('.view-overlays .problems-line-hovered');
    }

    emulateMouseMove(getEditorLineElement(editor, 1));
    await expect.poll(() => getHoveredLineElement(1)).not.toBeNull();
    expect(getHoveredLineElements().length).toBe(1);
    emulateMouseLeave(getEditorLineElement(editor, 1));
    await expect.poll(() => getHoveredLineElements().length).toBe(0);

    emulateMouseMove(getEditorLineElement(editor, 2));
    await expect.poll(() => getHoveredLineElement(2)).not.toBeNull();
    expect(getHoveredLineElements().length).toBe(1);
    emulateMouseLeave(getEditorLineElement(editor, 2));
    await expect.poll(() => getHoveredLineElements().length).toBe(0);

    emulateMouseMove(getEditorLineElement(editor, 3));
    await expect.poll(() => getHoveredLineElement(3)).not.toBeNull();
    expect(getHoveredLineElements().length).toBe(1);
    emulateMouseLeave(getEditorLineElement(editor, 3));
    await expect.poll(() => getHoveredLineElements().length).toBe(0);

    emulateMouseMove(getEditorLineElement(editor, 4));
    await expect.poll(() => getHoveredLineElement(4)).not.toBeNull();
    expect(getHoveredLineElements().length).toBe(1);
    emulateMouseLeave(getEditorLineElement(editor, 4));
    await expect.poll(() => getHoveredLineElements().length).toBe(0);

    emulateMouseMove(editorEl.shadowRoot.querySelector<HTMLElement>('.view-lines'));
    await expect.poll(() => getHoveredLineElements().length).toBe(0);
  });

  it('should navigate via mouse and dispatch relevant events for each row', async () => {
    element.problems = problems;
    await elementIsStable(element);
    expect(model.getLineCount()).toBe(expectedRows.length);
    await expect.poll(() => editorEl.shadowRoot.querySelectorAll('.view-line').length).toBe(expectedRows.length);

    // prettier-ignore
    async function expectFileRowActionEvents(line: number, childLineCount: number) {
      dispatchEventSpy.mockClear();

      emulateLineClick(editor, line);
      await expect.poll(() => editorEl.shadowRoot.querySelectorAll('.view-line').length).toBe(expectedRows.length - childLineCount);

      emulateLineClick(editor, line);
      await expect.poll(() => editorEl.shadowRoot.querySelectorAll('.view-line').length).toBe(expectedRows.length);
    }

    // prettier-ignore
    async function expectProblemRowActionEvents(line: number, problem: Problem) {
      await expect(eventAfter(element, 'problem-selected', () => emulateLineClick(editor, line))).resolves.toHaveProperty('detail', { problem });
      await expect(eventAfter(element, 'problem-activated', () => emulateLineClick(editor, line, { detail: 2 }))).resolves.toHaveProperty('detail', { problem });
      await expect(eventAfter(element, 'problem-context-menu', () => emulateLineClick(editor, line, { button: 2 }))).resolves.toHaveProperty('detail', { problem });
    }

    await expectFileRowActionEvents(1, 2);
    await expectProblemRowActionEvents(2, problems[1]);
    await expectProblemRowActionEvents(3, problems[0]);
    await expectFileRowActionEvents(4, 1);
    await expectProblemRowActionEvents(5, problems[3]);
    await expectFileRowActionEvents(6, 1);
    await expectProblemRowActionEvents(7, problems[2]);
  });

  it('should not interfere with the built-in folding behavior', async () => {
    element.problems = problems;
    await elementIsStable(element);

    await expect.poll(() => editorEl.shadowRoot.querySelectorAll('.view-line').length).toBe(expectedRows.length);

    const firstLineOverlay = `.margin-view-overlays div:first-child`;
    await expect
      .poll(() => editorEl.shadowRoot.querySelector(`${firstLineOverlay} .codicon-folding-expanded`))
      .not.toBeNull();

    const foldingExpandedEl = editorEl.shadowRoot.querySelector<HTMLElement>(
      `${firstLineOverlay} .codicon-folding-expanded`
    );
    emulateClick(foldingExpandedEl);
    await expect
      .poll(() => editorEl.shadowRoot.querySelector(`${firstLineOverlay} .codicon-folding-collapsed`))
      .not.toBeNull();

    const foldingCollapsedEl = editorEl.shadowRoot.querySelector<HTMLElement>(
      `${firstLineOverlay} .codicon-folding-collapsed`
    );
    emulateClick(foldingCollapsedEl);
    await expect
      .poll(() => editorEl.shadowRoot.querySelector(`${firstLineOverlay} .codicon-folding-expanded`))
      .not.toBeNull();
  });

  it('should gracefully handle mouse gestures that span multiple lines', async () => {
    element.problems = problems;
    await elementIsStable(element);
    expect(model.getLineCount()).toBe(expectedRows.length);
    await expect.poll(() => editorEl.shadowRoot.querySelectorAll('.view-line').length).toBe(expectedRows.length);

    expect(() => {
      const line1El = getEditorLineElement(editor, 1);
      const line2El = getEditorLineElement(editor, 2);
      emulateMouseDown(line1El);
      emulateMouseUp(line2El);
    }).not.toThrow();
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('should gracefully handle mouse events when empty', async () => {
    element.problems = [];
    await elementIsStable(element);
    expect(model.getValue()).toBe('');
    await expect.poll(() => editorEl.shadowRoot.querySelectorAll('.view-line').length).toBe(1);

    expect(() => emulateLineClick(editor, 1)).not.toThrow();
    expect(() => emulateMouseDown(getEditorLineElement(editor, 1))).not.toThrow();
    expect(() => emulateMouseUp(getEditorLineElement(editor, 1))).not.toThrow();
    expect(() => emulateMouseMove(getEditorLineElement(editor, 1))).not.toThrow();
    expect(() => emulateMouseLeave(getEditorLineElement(editor, 1))).not.toThrow();
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });
});
