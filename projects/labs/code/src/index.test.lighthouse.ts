import { expect, test, describe } from 'vitest';
import { runner } from '@nvidia-elements/testing-lighthouse';

describe('lighthouse report', () => {
  test('@nvidia-elements/code JS Bundles should remain within compressed bundle limits', async () => {
    const report = await runner.getReport('nve-codeblock', /* html */`
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

    expect(report.payload.javascript.kb).toBeLessThan(38.5);
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
