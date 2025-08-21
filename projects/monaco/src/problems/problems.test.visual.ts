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
]);

function escapeSingleQuotes(value: string): string {
  return value.replaceAll("'", '&#39;');
}

export function template() {
  return /* html */ `
  <div nve-layout="column gap:md" style="width: 640px;">
    <nve-monaco-problems problems='${escapeSingleQuotes(problems)}'></nve-monaco-problems>
    <nve-monaco-problems></nve-monaco-problems>
    <nve-monaco-problems>
      <div slot="empty" nve-layout="column align:center full">
        Custom Empty Slot Content
      </div>
    </nve-monaco-problems>
  </div>
  `;
}
