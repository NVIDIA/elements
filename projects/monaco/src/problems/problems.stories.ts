import { html } from 'lit';
import '@nvidia-elements/monaco/problems/define.js';

export default {
  title: 'Monaco/Problems',
  component: 'nve-monaco-problems'
};

/**
 * @summary Monaco Problems element rendering hint, info, warning and error
 * problems assigned from various different sources and files. Also 
 * demonstrates listening for when the user selects, activates, or triggers
 * the context menu for a problem.
 */
export const Default = {
  render: () => html`
<nve-monaco-problems></nve-monaco-problems>
<script type="module">
  const problemsEl = document.querySelector('nve-monaco-problems');
  problemsEl.problems = [
    {
      resource: 'file:///src/components/Button.ts',
      message: "Type 'string' is not assignable to type 'number'.",
      severity: 8, // ProblemSeverity.Error
      startLineNumber: 14,
      startColumn: 8,
      endLineNumber: 14,
      endColumn: 24,
      source: 'ts(2322)',
      owner: 'typescript',
    },
    {
      resource: 'file:///src/components/Button.ts',
      message: "'index' is declared but its value is never read.",
      severity: 4, // ProblemSeverity.Warning
      startLineNumber: 16,
      startColumn: 5,
      endLineNumber: 16,
      endColumn: 10,
      source: 'ts(6133)',
      owner: 'typescript',
    },
    {
      resource: 'file:///src/utils/styles.css',
      message: "Unknown property 'colr'. Did you mean 'color'?",
      severity: 2, // ProblemSeverity.Info
      startLineNumber: 40,
      startColumn: 2,
      endLineNumber: 40,
      endColumn: 6,
      source: 'css',
      owner: 'css',
    },
    {
      resource: 'file:///src/utils/formatDate.ts',
      message: "Convert 'var' to 'let' or 'const'.",
      severity: 1, // ProblemSeverity.Hint
      startLineNumber: 57,
      startColumn: 1,
      endLineNumber: 57,
      endColumn: 4,
      source: 'eslint',
      owner: 'eslint',
    },
  ];
  problemsEl.addEventListener('problem-selected', e => {
    console.log('problem-selected', e.detail.problem);
  });
  problemsEl.addEventListener('problem-activated', e => {
    console.log('problem-activated', e.detail.problem);
  });
  problemsEl.addEventListener('problem-context-menu', e => { 
    console.log('problem-context-menu', e.detail.problem);
  });
</script>
`
};

/**
 * @summary Monaco Problems element with the default message shown
 * when no problems are assigned.
 */
export const Empty = {
  render: () => html`
  <nve-monaco-problems></nve-monaco-problems>
`
};

/**
 * @summary Monaco Problems element with a custom message in the empty slot
 * shown when no problems are assigned.
 */
export const CustomEmptySlot = {
  render: () => html`
  <nve-monaco-problems>
    <div slot="empty" nve-layout="column align:center full">
      Custom Empty Slot Content
    </div>
  </nve-monaco-problems>
`
};
