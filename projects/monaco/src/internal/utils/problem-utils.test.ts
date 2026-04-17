// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { ProblemSeverity } from '../types/index.js';
import type { Problem } from '../types/index.js';
import { equalsProblem, equalsProblems } from './problem-utils.js';

const problem1: Problem = {
  owner: 'typescript',
  resource: 'file:///src/components/Button.ts',
  severity: ProblemSeverity.Warning,
  message: "'index' is declared but its value is never read.",
  source: 'ts',
  code: '6133',
  startLineNumber: 16,
  startColumn: 5,
  endLineNumber: 16,
  endColumn: 10
};

const problem2: Problem = {
  owner: 'typescript',
  resource: 'file:///src/components/Button.ts',
  severity: ProblemSeverity.Error,
  message: `Type '"success"' is not assignable to type 'number'.`,
  source: 'ts',
  code: '2322',
  startLineNumber: 22,
  startColumn: 8,
  endLineNumber: 22,
  endColumn: 24
};

const problem3: Problem = {
  owner: 'css',
  resource: 'file:///src/utils/styles.css',
  severity: ProblemSeverity.Info,
  message: "Unknown property 'colr'. Did you mean 'color'?",
  source: 'css',
  startLineNumber: 40,
  startColumn: 2,
  endLineNumber: 40,
  endColumn: 6
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
    ['source', { source: 'eslint' }],
    ['code', { code: 'no-var' }],
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
      ...problem1,
      source: undefined
    };

    expect(equalsProblem(problemWithoutSource, problem1)).toBe(false);
    const sameProblem: Problem = { ...problemWithoutSource };
    expect(equalsProblem(problemWithoutSource, sameProblem)).toBe(true);
  });

  it('should handle problems without code property', () => {
    const problemWithoutCode: Problem = {
      ...problem1,
      code: undefined
    };

    expect(equalsProblem(problemWithoutCode, problem1)).toBe(false);
    const sameProblem: Problem = { ...problemWithoutCode };
    expect(equalsProblem(problemWithoutCode, sameProblem)).toBe(true);
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
