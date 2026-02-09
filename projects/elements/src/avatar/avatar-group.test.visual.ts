import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('avatar-group visual', () => {
  test('avatar-group should match visual baseline', async () => {
    const report = await visualRunner.render('avatar-group', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('avatar-group should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('avatar-group.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/avatar/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="column gap:sm pad:sm">
    <nve-avatar-group>
        <nve-avatar color="red-cardinal">..</nve-avatar>
        <nve-avatar color="blue-cobalt">..</nve-avatar>
        <nve-avatar color="green-grass">..</nve-avatar>
        <nve-avatar>+3</nve-avatar>
    </nve-avatar-group>
  </div>
  `;
}
