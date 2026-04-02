// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ProblemSeverity } from './index.js';

const problems = JSON.stringify([
  {
    resource: 'file:///src/components/Button.ts',
    message: "'index' is declared but its value is never read.",
    severity: ProblemSeverity.Warning,
    startLineNumber: 16,
    startColumn: 5,
    endLineNumber: 16,
    endColumn: 10,
    source: 'ts',
    code: '6133',
    owner: 'typescript'
  },
  {
    resource: 'file:///src/components/Button.ts',
    message: "Type '\"success\"' is not assignable to type 'number'.",
    severity: ProblemSeverity.Error,
    startLineNumber: 14,
    startColumn: 8,
    endLineNumber: 14,
    endColumn: 24,
    source: 'ts',
    code: '2322',
    owner: 'typescript'
  },
  {
    resource: 'file:///src/components/Button.ts',
    message: `Unable to resolve signature of class decorator when called as an expression.
  Argument of type 'typeof Button' is not assignable to parameter of type 'CustomElementClass'.
    Types of property 'prototype' are incompatible.
      Type 'Button' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, dir, and 294 more.`,
    severity: ProblemSeverity.Error,
    startLineNumber: 8,
    startColumn: 2,
    endLineNumber: 8,
    endColumn: 30,
    source: 'ts',
    code: '1238',
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
    code: {
      value: 'no-var',
      target: 'https://eslint.org/docs/rules/no-var'
    },
    owner: 'eslint'
  }
]);

function escapeQuotes(value: string): string {
  return value.replaceAll("'", '&apos;').replaceAll('"', '&quot;');
}

export function readyCheck(evaluate: (fn: () => boolean) => Promise<boolean>) {
  return evaluate(() => document.querySelectorAll('nve-monaco-problems:state(ready)').length === 3);
}

export function template() {
  return /* html */ `
  <div nve-layout="column gap:md" style="width: 640px;">
    <nve-monaco-problems problems='${escapeQuotes(problems)}'></nve-monaco-problems>
    <nve-monaco-problems></nve-monaco-problems>
    <nve-monaco-problems>
      <div slot="empty" nve-layout="column align:center full">
        Custom Empty Slot Content
      </div>
    </nve-monaco-problems>
  </div>
  `;
}
