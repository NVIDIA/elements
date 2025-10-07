import { describe, expect, it } from 'vitest';
import { ProblemSeverity } from '../types/index.js';
import type { Problem } from '../types/index.js';
import { equalsProblem, equalsProblems } from './problem-utils.js';

const problem1: Problem = {
  resource: 'file:///src/components/Button.ts',
  message: "'index' is declared but its value is never read.",
  severity: ProblemSeverity.Warning,
  startLineNumber: 16,
  startColumn: 5,
  endLineNumber: 16,
  endColumn: 10,
  source: 'ts(6133)',
  owner: 'typescript'
};

const problem2: Problem = {
  resource: 'file:///src/components/Button.ts',
  message: `Type '"success"' is not assignable to type 'number'.`,
  severity: ProblemSeverity.Error,
  startLineNumber: 22,
  startColumn: 8,
  endLineNumber: 22,
  endColumn: 24,
  source: 'ts(2322)',
  owner: 'typescript'
};

const problem3: Problem = {
  resource: 'file:///src/utils/styles.css',
  message: "Unknown property 'colr'. Did you mean 'color'?",
  severity: ProblemSeverity.Info,
  startLineNumber: 40,
  startColumn: 2,
  endLineNumber: 40,
  endColumn: 6,
  source: 'css',
  owner: 'css'
};

describe('equalsProblem', () => {
  it('should return true for identical problems', () => {
    const problemA: Problem = { ...problem1 };
    const problemB: Problem = { ...problem1 };

    expect(equalsProblem(problemA, problemB)).toBe(true);
    expect(equalsProblem(problem1, problem1)).toBe(true);
  });

  it.each([
    ['owner', { owner: 'eslint' }],
    ['resource', { resource: 'file:///src/utils/helper.ts' }],
    ['severity', { severity: ProblemSeverity.Error }],
    ['message', { message: 'Different error message' }],
    ['source', { source: 'ts(2322)' }],
    ['startLineNumber', { startLineNumber: 20 }],
    ['startColumn', { startColumn: 8 }],
    ['endLineNumber', { endLineNumber: 17 }],
    ['endColumn', { endColumn: 15 }]
  ])('should return false when %s differs', (_, changes) => {
    const problemA: Problem = { ...problem1 };
    const problemB: Problem = { ...problem1, ...changes };

    expect(equalsProblem(problemA, problemB)).toBe(false);
  });

  it('should handle problems without source property', () => {
    const problemWithoutSource: Problem = {
      resource: 'file:///src/test.ts',
      message: 'Some error',
      severity: ProblemSeverity.Error,
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 5,
      owner: 'custom'
    };

    const sameProblem: Problem = { ...problemWithoutSource };
    expect(equalsProblem(problemWithoutSource, sameProblem)).toBe(true);
  });
});

describe('equalsProblems', () => {
  it('should return true for identical problem arrays', () => {
    const problemsA = [problem1, problem2, problem3];
    const problemsB = [problem1, problem2, problem3];

    expect(equalsProblems(problemsA, problemsB)).toBe(true);
    expect(equalsProblems(problemsA, problemsA)).toBe(true);
  });

  it('should return true for empty arrays', () => {
    expect(equalsProblems([], [])).toBe(true);
  });

  it('should return false when array lengths differ', () => {
    const problemsA = [problem1, problem2];
    const problemsB = [problem1, problem2, problem3];

    expect(equalsProblems(problemsA, problemsB)).toBe(false);
  });

  it('should return false when problem order differs', () => {
    const problemsA = [problem1, problem2, problem3];
    const problemsB = [problem1, problem3, problem2];

    expect(equalsProblems(problemsA, problemsB)).toBe(false);
  });

  it('should return false when any problem differs', () => {
    const modifiedProblem2: Problem = { ...problem2, severity: ProblemSeverity.Warning };
    const problemsA = [problem1, problem2, problem3];
    const problemsB = [problem1, modifiedProblem2, problem3];

    expect(equalsProblems(problemsA, problemsB)).toBe(false);
  });
});
