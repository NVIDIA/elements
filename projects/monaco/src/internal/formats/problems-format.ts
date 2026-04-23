// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Monaco } from '@nvidia-elements/monaco';
import type * as monaco from '@nvidia-elements/monaco';

import type { Problem } from '../types/index.js';

function toRange(monaco: Monaco, lineNumber: number, startColumn: number, endColumn: number): monaco.Range {
  return new monaco.Range(lineNumber, startColumn, lineNumber, endColumn);
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
  startColumn: number,
  endColumn: number,
  className: string
): monaco.editor.IModelDeltaDecoration {
  return {
    range: toRange(monaco, lineNumber, startColumn, endColumn),
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
  startColumn: number,
  endColumn: number,
  className: string,
  severityLabel: SeverityLabel
): monaco.editor.IModelDeltaDecoration {
  return {
    range: toRange(monaco, lineNumber, startColumn, endColumn),
    options: {
      beforeContentClassName: `problems-decoration codicon ${toSeverityIcon(severityLabel)}`,
      inlineClassName: `problems-decoration ${className}`
    }
  };
}

interface DecoratedLine {
  text: string;
  decorations: monaco.editor.IModelDeltaDecoration[];
}

function basename(path: string): string {
  return path.split('/').filter(Boolean).pop() ?? '';
}

function toFileLine(monaco: Monaco, lineNumber: number, uri: string, problems: Problem[]): DecoratedLine {
  const pathname = decodeURIComponent(new URL(uri).pathname);
  const file = basename(pathname);
  const path = pathname;
  const count = String(problems.length);

  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  decorations.push(toLineDecoration(monaco, lineNumber, 'problems-line'));

  let text = '';

  // file
  const fileStart = text.length + 1;
  text += file;
  decorations.push(toRangeDecoration(monaco, lineNumber, fileStart, text.length + 1, 'problem-file'));

  // separator
  text += ' ';

  // path
  const pathStart = text.length + 1;
  text += path;
  decorations.push(toRangeDecoration(monaco, lineNumber, pathStart, text.length + 1, 'problem-path'));

  // separator
  text += ' ';

  // count
  const countStart = text.length + 1;
  text += count;
  decorations.push(toRangeDecoration(monaco, lineNumber, countStart, text.length + 1, 'problem-count'));

  return { text, decorations };
}

function toProblemLine(monaco: Monaco, lineNumber: number, problem: Problem): DecoratedLine {
  const severity = toSeverityLabel(problem.severity);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const message = problem.message.split('\n')[0]!;
  const source = problem.source ?? '';
  const code = (typeof problem.code === 'object' ? problem.code?.value : problem.code) ?? '';
  const target = typeof problem.code === 'object' ? problem.code?.target : undefined;
  const position = `[Ln ${problem.startLineNumber}, Col ${problem.startColumn}]`;

  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  decorations.push(toLineDecoration(monaco, lineNumber, 'problems-line'));

  let text = '';

  // indent
  text += '  ';

  // severity
  const severityStart = text.length + 1;
  text += severity;
  decorations.push(
    toIconDecoration(monaco, lineNumber, severityStart, text.length + 1, 'severity-label', severity as SeverityLabel)
  );

  // separator
  text += ' ';

  // message
  const messageStart = text.length + 1;
  text += message;
  decorations.push(toRangeDecoration(monaco, lineNumber, messageStart, text.length + 1, 'problem-message'));

  // separator
  text += ' ';

  // source + code
  text = appendSourceCode(monaco, lineNumber, decorations, text, source, code, target);

  // position
  const positionStart = text.length + 1;
  text += position;
  decorations.push(toRangeDecoration(monaco, lineNumber, positionStart, text.length + 1, 'problem-position'));

  return { text, decorations };
}

function appendSourceCode(
  monaco: Monaco,
  lineNumber: number,
  decorations: monaco.editor.IModelDeltaDecoration[],
  text: string,
  source: string,
  code: string,
  target: string | { toString(): string } | undefined
): string {
  if (source.length === 0 && code.length === 0) {
    return text;
  }

  const sourceStart = text.length + 1;
  text += source;
  if (code.length > 0) {
    const codeStart = text.length + 1;
    text += `(${code})`;
    if (target) {
      decorations.push(
        toRangeDecoration(monaco, lineNumber, codeStart + 1, codeStart + code.length + 1, 'problem-source-target')
      );
    }
  }
  decorations.push(toRangeDecoration(monaco, lineNumber, sourceStart, text.length + 1, 'problem-source-code'));
  text += ' ';

  return text;
}

export function toSelectedLineDecorations(
  monaco: Monaco,
  lineNumber: number | undefined
): monaco.editor.IModelDeltaDecoration[] {
  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  if (lineNumber) {
    decorations.push(toLineDecoration(monaco, lineNumber, 'problems-line-selected'));
  }
  return decorations;
}

export function toHoveredLineDecorations(
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
  decorations: monaco.editor.IModelDeltaDecoration[];
  getProblemByLine: (lineNumber: number) => Problem | undefined;
}

export function toProblemsFormat(monaco: Monaco, problems: Problem[]): ProblemsFormat {
  const problemsByFile = groupProblemsByFile(problems);

  const lines: string[] = [];
  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  const problemsByLine: Map<number, Problem> = new Map();

  let lineNumber = 0;
  const sortedUris = Array.from(problemsByFile.keys()).sort();
  for (const uri of sortedUris) {
    const sortedProblems = problemsByFile.get(uri)!.sort(compareProblems);

    lineNumber++;
    const fileLine = toFileLine(monaco, lineNumber, uri, sortedProblems);
    lines.push(fileLine.text);
    decorations.push(...fileLine.decorations);

    for (const problem of sortedProblems) {
      lineNumber++;
      const problemLine = toProblemLine(monaco, lineNumber, problem);
      lines.push(problemLine.text);
      decorations.push(...problemLine.decorations);
      problemsByLine.set(lineNumber, problem);
    }
  }

  return {
    text: lines.join('\n'),
    decorations,
    getProblemByLine: lineNumber => problemsByLine.get(lineNumber)
  };
}
