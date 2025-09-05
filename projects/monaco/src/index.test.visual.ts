import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';
import { template as inputTemplate } from './input/input.test.visual.js';
import { template as editorTemplate } from './editor/editor.test.visual.js';
import { template as diffEditorTemplate } from './diff-editor/diff-editor.test.visual.js';
import { template as diffInputTemplate } from './diff-input/diff-input.test.visual.js';

describe('monaco input visual', () => {
  test('input should match visual baseline', async () => {
    const report = await visualRunner.render('monaco', template(''), { network: true });
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(5);
  });

  test('input should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('monaco.dark', template('dark'), { network: true });
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(5);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/forms/define.js';
    import '@nvidia-elements/monaco/input/define.js';
    import '@nvidia-elements/monaco/editor/define.js';
    import '@nvidia-elements/monaco/diff-editor/define.js';
    import '@nvidia-elements/monaco/diff-input/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme} reduced-motion');
  </script>
  <div nve-layout="column gap:lg align:stretch">
    ${inputTemplate()}
    ${editorTemplate()}
    ${diffEditorTemplate()}
    ${diffInputTemplate()}
  </div>`;
}
