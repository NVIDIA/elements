import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('badge visual', () => {
  test('badge should match visual baseline', async () => {
    const report = await visualRunner.render('badge', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('badge should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('badge.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/badge/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <div nve-layout="row gap:xs align:wrap">
    <nve-badge status="scheduled">•︎•︎•︎</nve-badge>
    <nve-badge status="queued">•︎•︎•︎</nve-badge>
    <nve-badge status="pending">•︎•︎•︎</nve-badge>
    <nve-badge status="starting">•︎•︎•︎</nve-badge>
    <nve-badge status="running">•︎•︎•︎</nve-badge>
    <nve-badge status="restarting">•︎•︎•︎</nve-badge>
    <nve-badge status="stopping">•︎•︎•︎</nve-badge>
    <nve-badge status="finished">•︎•︎•︎</nve-badge>
    <nve-badge status="failed">•︎•︎•︎</nve-badge>
    <nve-badge status="unknown">•︎•︎•︎</nve-badge>
    <nve-badge status="ignored">•︎•︎•︎</nve-badge>
  </div>
  <div nve-layout="row gap:xs align:wrap">
    <nve-badge container="flat" status="scheduled">•︎•︎•︎</nve-badge>
    <nve-badge container="flat" status="queued">•︎•︎•︎</nve-badge>
    <nve-badge container="flat" status="pending">•︎•︎•︎</nve-badge>
    <nve-badge container="flat" status="starting">•︎•︎•︎</nve-badge>
    <nve-badge container="flat" status="running">•︎•︎•︎</nve-badge>
    <nve-badge container="flat" status="restarting">•︎•︎•︎</nve-badge>
    <nve-badge container="flat" status="stopping">•︎•︎•︎</nve-badge>
    <nve-badge container="flat" status="finished">•︎•︎•︎</nve-badge>
    <nve-badge container="flat" status="failed">•︎•︎•︎</nve-badge>
    <nve-badge container="flat" status="unknown">•︎•︎•︎</nve-badge>
    <nve-badge container="flat" status="ignored">•︎•︎•︎</nve-badge>
  </div>
  <div nve-layout="row gap:xs align:wrap">
    <nve-badge container="flat" status="scheduled" aria-label="scheduled"></nve-badge>
    <nve-badge container="flat" status="queued" aria-label="queued"></nve-badge>
    <nve-badge container="flat" status="pending" aria-label="pending"></nve-badge>
    <nve-badge container="flat" status="starting" aria-label="starting"></nve-badge>
    <nve-badge container="flat" status="running" aria-label="running"></nve-badge>
    <nve-badge container="flat" status="restarting" aria-label="restarting"></nve-badge>
    <nve-badge container="flat" status="stopping" aria-label="stopping"></nve-badge>
    <nve-badge container="flat" status="finished" aria-label="finished"></nve-badge>
    <nve-badge container="flat" status="failed" aria-label="failed"></nve-badge>
    <nve-badge container="flat" status="unknown" aria-label="unknown"></nve-badge>
    <nve-badge container="flat" status="ignored" aria-label="ignored"></nve-badge>
  </div>
  <div nve-layout="row gap:sm align:wrap">
    <nve-badge color="red-cardinal"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="gray-slate"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="gray-denim"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="blue-indigo"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="blue-cobalt"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="blue-sky"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="teal-cyan"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="green-mint"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="teal-seafoam"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="green-grass"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="yellow-amber"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="orange-pumpkin"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="red-tomato"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="pink-magenta"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="purple-plum"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="purple-violet"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="purple-lavender"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="pink-rose"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="green-jade"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="lime-pear"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="yellow-nova"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge color="brand-green"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
  </div>
  <div nve-layout="row gap:sm align:wrap">
    <nve-badge container="flat" color="red-cardinal"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="gray-slate"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="gray-denim"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="blue-indigo"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="blue-cobalt"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="blue-sky"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="teal-cyan"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="green-mint"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="teal-seafoam"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="green-grass"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="yellow-amber"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="orange-pumpkin"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="red-tomato"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="pink-magenta"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="purple-plum"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="purple-violet"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="purple-lavender"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="pink-rose"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="green-jade"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="lime-pear"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="yellow-nova"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge container="flat" color="brand-green"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
  </div>
  <div nve-layout="row gap:sm align:wrap">
    <nve-badge prominence="emphasis" color="red-cardinal"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="gray-slate"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="gray-denim"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="blue-indigo"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="blue-cobalt"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="blue-sky"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="teal-cyan"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="green-mint"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="teal-seafoam"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="green-grass"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="yellow-amber"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="orange-pumpkin"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="red-tomato"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="pink-magenta"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="purple-plum"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="purple-violet"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="purple-lavender"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="pink-rose"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="green-jade"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="lime-pear"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="yellow-nova"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
    <nve-badge prominence="emphasis" color="brand-green"><nve-icon name="placeholder"></nve-icon> •︎•︎•︎</nve-badge>
  </div>
  `;
}
