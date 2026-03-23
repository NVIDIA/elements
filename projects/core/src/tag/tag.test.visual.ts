import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('tag visual', () => {
  test('tag should match visual baseline', async () => {
    const report = await visualRunner.render('tag', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('tag should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('tag.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/tag/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="row gap:xs align:wrap">
    <nve-tag>•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="red-cardinal">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="gray-slate">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="gray-denim">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="blue-indigo">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="blue-cobalt">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="blue-sky">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="teal-cyan">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="green-mint">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="teal-seafoam">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="green-grass">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="yellow-amber">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="orange-pumpkin">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="red-tomato">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="pink-magenta">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="purple-plum">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="purple-violet">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="purple-lavender">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="pink-rose">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="green-jade">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="lime-pear">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="yellow-nova">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag color="brand-green">•︎•︎•︎•︎•︎•︎</nve-tag>
  </div>

  <div nve-layout="row gap:xs align:wrap">
    <nve-tag closable>•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="red-cardinal">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="gray-slate">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="gray-denim">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="blue-indigo">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="blue-cobalt">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="blue-sky">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="teal-cyan">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="green-mint">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="teal-seafoam">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="green-grass">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="yellow-amber">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="orange-pumpkin">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="red-tomato">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="pink-magenta">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="purple-plum">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="purple-violet">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="purple-lavender">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="pink-rose">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="green-jade">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="lime-pear">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="yellow-nova">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag closable color="brand-green">•︎•︎•︎•︎•︎•︎</nve-tag>
  </div>

  <div nve-layout="row gap:xs align:wrap">
    <nve-tag prominence="emphasis" color="red-cardinal">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="gray-slate">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="gray-denim">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="blue-indigo">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="blue-cobalt">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="blue-sky">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="teal-cyan">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="green-mint">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="teal-seafoam">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="green-grass">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="yellow-amber">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="orange-pumpkin">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="red-tomato">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="pink-magenta">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="purple-plum">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="purple-violet">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="purple-lavender">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="pink-rose">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="green-jade">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="lime-pear">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="yellow-nova">•︎•︎•︎•︎•︎•︎</nve-tag>
    <nve-tag prominence="emphasis" color="brand-green">•︎•︎•︎•︎•︎•︎</nve-tag>
  </div>
  `;
}
