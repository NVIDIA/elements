import type { Monaco } from '@nvidia-elements/monaco';
import type * as monaco from '@nvidia-elements/monaco';

import type { Problem } from '../types/index.js';

type RegExpIndices = [number, number];

function toRange(monaco: Monaco, lineNumber: number, [startIndex, endIndex]: RegExpIndices): monaco.Range {
  return new monaco.Range(lineNumber, startIndex + 1, lineNumber, endIndex + 1);
}

function toLineDecoration(monaco: Monaco, lineNumber: number, className: string): monaco.editor.IModelDeltaDecoration {
  return {
    range: new monaco.Range(lineNumber, 1, lineNumber, 1),
    options: {
      isWholeLine: true,
      className: `problems-decoration ${className}`
    }
  };
}

function toRangeDecoration(
  monaco: Monaco,
  lineNumber: number,
  indices: RegExpIndices,
  className: string
): monaco.editor.IModelDeltaDecoration {
  return {
    range: toRange(monaco, lineNumber, indices),
    options: {
      inlineClassName: `problems-decoration ${className}`
    }
  };
}

export type SeverityLabel = 'hint' | 'info' | 'warning' | 'error';

export function toSeverityLabel(severity: number): SeverityLabel {
  switch (severity) {
    case 1: // ProblemSeverity.Hint:
      return 'hint';
    case 2: // ProblemSeverity.Info:
      return 'info';
    case 4: // ProblemSeverity.Warning:
      return 'warning';
    case 8: // ProblemSeverity.Error:
      return 'error';
    default:
      throw new Error(`Unknown severity: ${severity}`);
  }
}

export function toSeverityIcon(severityLabel: SeverityLabel): string {
  switch (severityLabel) {
    case 'hint':
      return 'codicon-info';
    case 'info':
      return 'codicon-info';
    case 'warning':
      return 'codicon-warning';
    case 'error':
      return 'codicon-error';
    default:
      const _exhaustiveCheck: never = severityLabel;
      throw new Error(`Unknown severity label: ${severityLabel}`);
  }
}

function toIconDecoration(
  monaco: Monaco,
  lineNumber: number,
  indices: RegExpIndices,
  className: string,
  severityLabel: SeverityLabel
): monaco.editor.IModelDeltaDecoration {
  return {
    range: toRange(monaco, lineNumber, indices),
    options: {
      beforeContentClassName: `problems-decoration codicon ${toSeverityIcon(severityLabel)}`,
      inlineClassName: `problems-decoration ${className}`
    }
  };
}

function escapeQuotes(text: string): string {
  return text.replace(/"/g, '\\"');
}

const FILE_LINE_PATTERN = /^(")((?:[^"\\]|\\.)*)(") (")((?:[^"\\]|\\.)*)(") (\d+)$/d;

function basename(path: string): string {
  return path.split('/').filter(Boolean).pop();
}

function toFileLine(uri: string, problems: Problem[]): string {
  const url = new URL(uri);
  const file = escapeQuotes(basename(url.pathname));
  const path = escapeQuotes(url.pathname);

  return `"${file}" "${path}" ${problems.length}`;
}

function toFileLineDecorations(
  monaco: Monaco,
  lineNumber: number,
  indices: RegExpIndicesArray
): monaco.editor.IModelDeltaDecoration[] {
  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  decorations.push(toLineDecoration(monaco, lineNumber, 'problems-line'));
  decorations.push(toRangeDecoration(monaco, lineNumber, indices[1], 'problem-quote'));
  decorations.push(toRangeDecoration(monaco, lineNumber, indices[2], 'problem-file'));
  decorations.push(toRangeDecoration(monaco, lineNumber, indices[3], 'problem-quote'));
  decorations.push(toRangeDecoration(monaco, lineNumber, indices[4], 'problem-quote'));
  decorations.push(toRangeDecoration(monaco, lineNumber, indices[5], 'problem-path'));
  decorations.push(toRangeDecoration(monaco, lineNumber, indices[6], 'problem-quote'));
  decorations.push(toRangeDecoration(monaco, lineNumber, indices[7], 'problem-count'));
  return decorations;
}

const MARKER_LINE_PATTERN =
  /^\t(hint|info|warning|error) (")((?:[^"\\]|\\.)*)(") (")((?:[^"\\]|\\.)*)(") (\[Ln \d+, Col \d+\])$/d;

function toProblemLine(problem: Problem): string {
  const severity = toSeverityLabel(problem.severity);
  const message = escapeQuotes(problem.message);
  const source = escapeQuotes(problem.source ?? '');

  return `\t${severity} "${message}" "${source}" [Ln ${problem.startLineNumber}, Col ${problem.startColumn}]`;
}

function toProblemLineDecorations(
  monaco: Monaco,
  lineNumber: number,
  indices: RegExpIndicesArray,
  line: string
): monaco.editor.IModelDeltaDecoration[] {
  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  decorations.push(toLineDecoration(monaco, lineNumber, 'problems-line'));
  decorations.push(
    toIconDecoration(monaco, lineNumber, indices[1], 'severity-label', line.substring(...indices[1]) as SeverityLabel)
  );
  decorations.push(toRangeDecoration(monaco, lineNumber, indices[2], 'problem-quote'));
  decorations.push(toRangeDecoration(monaco, lineNumber, indices[3], 'problem-message'));
  decorations.push(toRangeDecoration(monaco, lineNumber, indices[4], 'problem-quote'));
  decorations.push(toRangeDecoration(monaco, lineNumber, indices[5], 'problem-quote'));
  decorations.push(toRangeDecoration(monaco, lineNumber, indices[6], 'problem-code'));
  decorations.push(toRangeDecoration(monaco, lineNumber, indices[7], 'problem-quote'));
  decorations.push(toRangeDecoration(monaco, lineNumber, indices[8], 'problem-position'));
  return decorations;
}

function isMatchWithIndices(
  results: RegExpExecArray | null
): results is RegExpExecArray & { indices: RegExpIndicesArray } {
  return results !== null && results.indices !== undefined;
}

function toLineDecorations(monaco: Monaco, model: monaco.editor.ITextModel): monaco.editor.IModelDeltaDecoration[] {
  const lineCount = model.getLineCount();
  if (lineCount === 1 && model.getLineLength(1) === 0) {
    return [];
  }
  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
    const line = model.getLineContent(lineNumber);
    let matches: RegExpExecArray | null;
    switch (true) {
      case isMatchWithIndices((matches = FILE_LINE_PATTERN.exec(line))): {
        const { indices } = matches;
        decorations.push(...toFileLineDecorations(monaco, lineNumber, indices));
        break;
      }
      case isMatchWithIndices((matches = MARKER_LINE_PATTERN.exec(line))): {
        const { indices } = matches;
        decorations.push(...toProblemLineDecorations(monaco, lineNumber, indices, line));
        break;
      }
      default:
        throw new Error(`Invalid input: "${line}"`);
    }
  }
  return decorations;
}

function toSelectedLineDecorations(
  monaco: Monaco,
  lineNumber: number | undefined
): monaco.editor.IModelDeltaDecoration[] {
  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  if (lineNumber) {
    decorations.push(toLineDecoration(monaco, lineNumber, 'problems-line-selected'));
  }
  return decorations;
}

function toHoveredLineDecorations(
  monaco: Monaco,
  lineNumber: number | undefined
): monaco.editor.IModelDeltaDecoration[] {
  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  if (lineNumber) {
    decorations.push(toLineDecoration(monaco, lineNumber, 'problems-line-hovered'));
  }
  return decorations;
}

function groupProblemsByFile(problems: Problem[]): Map<string, Problem[]> {
  const problemsByFile = new Map<string, Problem[]>();
  for (const problem of problems) {
    const uri = problem.resource.toString();
    (problemsByFile.get(uri) ?? problemsByFile.set(uri, []).get(uri)!).push(problem);
  }
  return problemsByFile;
}

function compareProblems(a: Problem, b: Problem): number {
  return b.severity - a.severity || a.startLineNumber - b.startLineNumber || a.startColumn - b.startColumn;
}

export interface ProblemsFormat {
  text: string;
  getProblemByLine: (lineNumber: number) => Problem | undefined;
}

export function toProblemsFormat(problems: Problem[]): ProblemsFormat {
  const problemsByFile = groupProblemsByFile(problems);

  const lines: string[] = [];
  const problemsByLine: Map<number, Problem> = new Map();

  const sortedUris = Array.from(problemsByFile.keys()).sort();
  for (const uri of sortedUris) {
    const sortedProblems = problemsByFile.get(uri)!.sort(compareProblems);
    lines.push(toFileLine(uri, sortedProblems));
    for (const problem of sortedProblems) {
      lines.push(toProblemLine(problem));
      problemsByLine.set(lines.length, problem);
    }
  }

  return { text: lines.join('\n'), getProblemByLine: lineNumber => problemsByLine.get(lineNumber) };
}

export class EditorDecorator {
  #monaco: Monaco;

  #lineDecorations: monaco.editor.IEditorDecorationsCollection;
  #selectedLineDecorations: monaco.editor.IEditorDecorationsCollection;
  #hoveredLineDecorations: monaco.editor.IEditorDecorationsCollection;

  constructor(monaco: Monaco, editor: monaco.editor.IStandaloneCodeEditor) {
    this.#monaco = monaco;

    this.#lineDecorations = editor.createDecorationsCollection([]);
    this.#selectedLineDecorations = editor.createDecorationsCollection([]);
    this.#hoveredLineDecorations = editor.createDecorationsCollection([]);
  }

  decorateLines(model: monaco.editor.ITextModel) {
    this.#lineDecorations.set(toLineDecorations(this.#monaco, model));
  }

  decorateSelectedLine(lineNumber: number | undefined) {
    this.#selectedLineDecorations.set(toSelectedLineDecorations(this.#monaco, lineNumber));
  }

  decorateHoveredLine(lineNumber: number | undefined) {
    this.#hoveredLineDecorations.set(toHoveredLineDecorations(this.#monaco, lineNumber));
  }
}
