import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('avatar visual', () => {
  test('avatar should match visual baseline', async () => {
    const report = await visualRunner.render('avatar', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('avatar should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('avatar.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/avatar/define.js';
    import '@nvidia-elements/core/icon/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="row gap:xs">
    <nve-avatar>..</nve-avatar>
  </div>

  <div nve-layout="row gap:sm align:wrap">
    <nve-avatar>
        <nve-icon name="star"></nve-icon>
    </nve-avatar>
    <nve-avatar>
        <nve-icon name="person"></nve-icon>
    </nve-avatar>
  </div>

  <div nve-layout="row gap:sm align:wrap">
    <nve-avatar size="sm">..</nve-avatar>
    <nve-avatar>..</nve-avatar>
    <nve-avatar size="lg">..</nve-avatar>
  </div>

  <div nve-layout="row gap:sm align:wrap">
    <nve-avatar color="red-cardinal">..</nve-avatar>
    <nve-avatar color="gray-slate">..</nve-avatar>
    <nve-avatar color="gray-denim">..</nve-avatar>
    <nve-avatar color="blue-indigo">..</nve-avatar>
    <nve-avatar color="blue-cobalt">..</nve-avatar>
    <nve-avatar color="blue-sky">..</nve-avatar>
    <nve-avatar color="teal-cyan">..</nve-avatar>
    <nve-avatar color="green-mint">..</nve-avatar>
    <nve-avatar color="teal-seafoam">..</nve-avatar>
    <nve-avatar color="green-grass">..</nve-avatar>
    <nve-avatar color="yellow-amber">..</nve-avatar>
    <nve-avatar color="orange-pumpkin">..</nve-avatar>
    <nve-avatar color="red-tomato">..</nve-avatar>
    <nve-avatar color="pink-magenta">..</nve-avatar>
    <nve-avatar color="purple-plum">..</nve-avatar>
    <nve-avatar color="purple-violet">..</nve-avatar>
    <nve-avatar color="purple-lavender">..</nve-avatar>
    <nve-avatar color="pink-rose">..</nve-avatar>
    <nve-avatar color="green-jade">..</nve-avatar>
    <nve-avatar color="lime-pear">..</nve-avatar>
    <nve-avatar color="yellow-nova">..</nve-avatar>
    <nve-avatar color="brand-green">..</nve-avatar>
 </div>
  `;
}
