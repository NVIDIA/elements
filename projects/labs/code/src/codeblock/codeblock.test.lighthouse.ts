import { expect, test, describe } from 'vitest';
import { runner } from '@nvidia-elements/testing-lighthouse';

describe('codeblock lighthouse report', () => {
  test('codeblock should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-badge', /* html */`
      <nve-codeblock language="shell">
        pnpm install
      </nve-codeblock>
      <script type="module">
        import '@nvidia-elements/code/codeblock/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(18.5);
  });

  test('codeblock should meet bundle limits for all languages', async () => {
    const report = await runner.getReport('nve-badge', /* html */`
      <script type="module">
      import('@nvidia-elements/code/codeblock/languages/css.js');
      import('@nvidia-elements/code/codeblock/languages/go.js');
      import('@nvidia-elements/code/codeblock/languages/html.js');
      import('@nvidia-elements/code/codeblock/languages/javascript.js');
      import('@nvidia-elements/code/codeblock/languages/json.js');
      import('@nvidia-elements/code/codeblock/languages/markdown.js');
      import('@nvidia-elements/code/codeblock/languages/python.js');
      import('@nvidia-elements/code/codeblock/languages/typescript.js');
      import('@nvidia-elements/code/codeblock/languages/xml.js');
      import('@nvidia-elements/code/codeblock/languages/yaml.js');
      import('@nvidia-elements/code/codeblock/define.js');
      </script>
    `);

    expect(report.payload.javascript.kb).toBeLessThan(38);
    expect(report.payload.javascript.requests['define.js'].kb).toBeLessThan(10);
    expect(report.payload.javascript.requests['core.js'].kb).toBeLessThan(9);
    expect(report.payload.javascript.requests['css.js'].kb).toBeLessThan(4);
    expect(report.payload.javascript.requests['html.js'].kb).toBeLessThan(0.5);
    expect(report.payload.javascript.requests['javascript.js'].kb).toBeLessThan(3);
    expect(report.payload.javascript.requests['json.js'].kb).toBeLessThan(1);
    expect(report.payload.javascript.requests['markdown.js'].kb).toBeLessThan(1.5);
    expect(report.payload.javascript.requests['python.js'].kb).toBeLessThan(2);
    expect(report.payload.javascript.requests['typescript.js'].kb).toBeLessThan(3.5);
    expect(report.payload.javascript.requests['xml.js'].kb).toBeLessThan(0.5);
    expect(report.payload.javascript.requests['yaml.js'].kb).toBeLessThan(1.5);
  });
});
