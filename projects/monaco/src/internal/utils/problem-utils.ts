import type { Problem } from '../types/index.js';

export function equalsProblem(a: Problem, b: Problem): boolean {
  return (
    a.owner === b.owner &&
    a.resource === b.resource &&
    a.severity === b.severity &&
    a.message === b.message &&
    a.source === b.source &&
    a.code === b.code &&
    a.startLineNumber === b.startLineNumber &&
    a.startColumn === b.startColumn &&
    a.endLineNumber === b.endLineNumber &&
    a.endColumn === b.endColumn
  );
}

export function equalsProblems(a: Problem[], b: Problem[]): boolean {
  return a.length === b.length && a.every((problem, index) => equalsProblem(problem, b[index]!));
}
