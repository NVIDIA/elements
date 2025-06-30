import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('button lighthouse report', () => {
  test('chat-message should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-chat-message', /* html */`
      <nve-chat-message>message</nve-chat-message>
      <script type="module">
        import '@nvidia-elements/core/button/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(12.0);
  });
});
