// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Monaco } from '@nvidia-elements/monaco';
import type * as monaco from '@nvidia-elements/monaco';

import type { Problem } from '../types/index.js';

interface ColumnRange {
  startColumn: number;
  endColumn: number;
}

function toRange(monaco: Monaco, lineNumber: number, columns: ColumnRange): monaco.Range {
  return new monaco.Range(lineNumber, columns.startColumn, lineNumber, columns.endColumn);
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
  decoration: ColumnRange & { className: string }
): monaco.editor.IModelDeltaDecoration {
  return {
    range: toRange(monaco, lineNumber, decoration),
    options: {
      inlineClassName: `problems-decoration ${decoration.className}`
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
  decoration: ColumnRange & { className: string; severityLabel: SeverityLabel }
): monaco.editor.IModelDeltaDecoration {
  return {
    range: toRange(monaco, lineNumber, decoration),
    options: {
      beforeContentClassName: `problems-decoration codicon ${toSeverityIcon(decoration.severityLabel)}`,
      inlineClassName: `problems-decoration ${decoration.className}`
    }
  };
}

interface DecoratedLine {
  text: string;
  decorations: monaco.editor.IModelDeltaDecoration[];
}

interface LineBuilder {
  monaco: Monaco;
  lineNumber: number;
  decorations: monaco.editor.IModelDeltaDecoration[];
  text: string;
}

function appendSpan(builder: LineBuilder, segment: string, className: string): void {
  const startColumn = builder.text.length + 1;
  builder.text += segment;
  const endColumn = builder.text.length + 1;
  builder.decorations.push(
    toRangeDecoration(builder.monaco, builder.lineNumber, { startColumn, endColumn, className })
  );
}

function appendIconSpan(
  builder: LineBuilder,
  segment: string,
  options: { className: string; severityLabel: SeverityLabel }
): void {
  const startColumn = builder.text.length + 1;
  builder.text += segment;
  const endColumn = builder.text.length + 1;
  builder.decorations.push(
    toIconDecoration(builder.monaco, builder.lineNumber, { startColumn, endColumn, ...options })
  );
}

function basename(path: string): string {
  return path.split('/').filter(Boolean).pop() ?? '';
}

function toFileLine(monaco: Monaco, lineNumber: number, file: { uri: string; problems: Problem[] }): DecoratedLine {
  const pathname = decodeURIComponent(new URL(file.uri).pathname);
  const decorations: monaco.editor.IModelDeltaDecoration[] = [toLineDecoration(monaco, lineNumber, 'problems-line')];
  const builder: LineBuilder = { monaco, lineNumber, decorations, text: '' };

  appendSpan(builder, basename(pathname), 'problem-file');
  builder.text += ' ';
  appendSpan(builder, pathname, 'problem-path');
  builder.text += ' ';
  appendSpan(builder, String(file.problems.length), 'problem-count');

  return { text: builder.text, decorations };
}

function toProblemLine(monaco: Monaco, lineNumber: number, problem: Problem): DecoratedLine {
  const severity = toSeverityLabel(problem.severity);
  const message = problem.message.split('\n')[0]!;
  const source = problem.source ?? '';
  const code = (typeof problem.code === 'object' ? problem.code?.value : problem.code) ?? '';
  const target = typeof problem.code === 'object' ? problem.code?.target : undefined;
  const position = `[Ln ${problem.startLineNumber}, Col ${problem.startColumn}]`;
  const decorations: monaco.editor.IModelDeltaDecoration[] = [toLineDecoration(monaco, lineNumber, 'problems-line')];
  const builder: LineBuilder = { monaco, lineNumber, decorations, text: '  ' };

  appendIconSpan(builder, severity, { className: 'severity-label', severityLabel: severity });
  builder.text += ' ';
  appendSpan(builder, message, 'problem-message');
  builder.text += ' ';
  appendSourceCode(builder, { source, code, target });
  appendSpan(builder, position, 'problem-position');

  return { text: builder.text, decorations };
}

function appendSourceCode(
  builder: LineBuilder,
  ctx: { source: string; code: string; target: string | { toString(): string } | undefined }
): void {
  const { source, code, target } = ctx;
  if (source.length === 0 && code.length === 0) {
    return;
  }

  const sourceStart = builder.text.length + 1;
  builder.text += source;
  if (code.length > 0) {
    const codeStart = builder.text.length + 1;
    builder.text += `(${code})`;
    if (target) {
      builder.decorations.push(
        toRangeDecoration(builder.monaco, builder.lineNumber, {
          startColumn: codeStart + 1,
          endColumn: codeStart + code.length + 1,
          className: 'problem-source-target'
        })
      );
    }
  }
  builder.decorations.push(
    toRangeDecoration(builder.monaco, builder.lineNumber, {
      startColumn: sourceStart,
      endColumn: builder.text.length + 1,
      className: 'problem-source-code'
    })
  );
  builder.text += ' ';
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
    const fileLine = toFileLine(monaco, lineNumber, { uri, problems: sortedProblems });
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
    // eslint-disable-next-line no-shadow
    getProblemByLine: lineNumber => problemsByLine.get(lineNumber)
  };
}
