import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('format-datetime visual', () => {
  test('format-datetime should match visual baseline', async () => {
    const report = await visualRunner.render('format-datetime', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('format-datetime should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('format-datetime.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/format-datetime/define.js';
    document.documentElement.lang = 'en-US';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <div nve-layout="column gap:sm">
    <nve-format-datetime date-style="full">2023-07-28T04:20:17.434Z</nve-format-datetime>
    <nve-format-datetime date-style="long">2023-07-28T04:20:17.434Z</nve-format-datetime>
    <nve-format-datetime date-style="medium">2023-07-28T04:20:17.434Z</nve-format-datetime>
    <nve-format-datetime date-style="short">2023-07-28T04:20:17.434Z</nve-format-datetime>
    <nve-format-datetime locale="de-DE" date-style="long">2023-07-28T04:20:17.434Z</nve-format-datetime>
  </div>
  `;
}
