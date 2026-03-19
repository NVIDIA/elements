// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('logo visual', () => {
  test('logo should match visual baseline', async () => {
    const report = await visualRunner.render('logo', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('logo should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('logo.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/icon/define.js';
    import '@nvidia-elements/core/logo/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="row gap:xs">
    <nve-logo size="sm" aria-label="NVIDIA"></nve-logo>
    <nve-logo aria-label="NVIDIA" ></nve-logo>
    <nve-logo size="lg" aria-label="NVIDIA"></nve-logo>
  </div>

  <div nve-layout="row gap:xs">
    <nve-logo size="sm" color="green-mint" aria-label="green mint">•︎•︎</nve-logo>
    <nve-logo color="green-mint" aria-label="green mint">•︎•︎</nve-logo>
    <nve-logo size="lg" color="green-mint" aria-label="green mint">•︎•︎</nve-logo>
  </div>

  <div nve-layout="row gap:xs">
    <nve-logo color="pink-rose" aria-label="pink rose large" size="lg">
      <nve-icon name="star"></nve-icon>
    </nve-logo>
    <nve-logo color="pink-rose" aria-label="pink rose medium" size="md">
      <nve-icon name="star"></nve-icon>
    </nve-logo>
    <nve-logo color="pink-rose" aria-label="pink rose small" size="sm">
      <nve-icon name="star"></nve-icon>
    </nve-logo>
    <nve-logo color="red-cardinal" aria-label="red cardinal">
      <nve-icon name="star"></nve-icon>
    </nve-logo>
    <nve-logo color="green-grass" aria-label="green grass">
      <nve-icon name="star"></nve-icon>
    </nve-logo>
    <nve-logo color="blue-cobalt" aria-label="blue cobalt">
      <nve-icon name="star"></nve-icon>
    </nve-logo>
  </div>

  <div nve-layout="row gap:xs align:wrap">
    <nve-logo aria-label="NVIDIA"></nve-logo>
    <nve-logo color="red-cardinal" aria-label="red cardinal">•︎•︎</nve-logo>
    <nve-logo color="gray-slate" aria-label="gray slate">•︎•︎</nve-logo>
    <nve-logo color="gray-denim" aria-label="gray denim">•︎•︎</nve-logo>
    <nve-logo color="blue-indigo" aria-label="blue indigo">•︎•︎</nve-logo>
    <nve-logo color="blue-cobalt" aria-label="blue cobalt">•︎•︎</nve-logo>
    <nve-logo color="blue-sky" aria-label="blue sky">•︎•︎</nve-logo>
    <nve-logo color="teal-cyan" aria-label="teal cyan">•︎•︎</nve-logo>
    <nve-logo color="green-mint" aria-label="green mint">•︎•︎</nve-logo>
    <nve-logo color="teal-seafoam" aria-label="teal seafoam">•︎•︎</nve-logo>
    <nve-logo color="green-grass" aria-label="green grass">•︎•︎</nve-logo>
    <nve-logo color="yellow-amber" aria-label="yellow amber">•︎•︎</nve-logo>
    <nve-logo color="orange-pumpkin" aria-label="orange pumpkin">•︎•︎</nve-logo>
    <nve-logo color="red-tomato" aria-label="red tomato">•︎•︎</nve-logo>
    <nve-logo color="pink-magenta" aria-label="pink magenta">•︎•︎</nve-logo>
    <nve-logo color="purple-plum" aria-label="purple plum">•︎•︎</nve-logo>
    <nve-logo color="purple-violet" aria-label="purple violet">•︎•︎</nve-logo>
    <nve-logo color="purple-lavender" aria-label="purple lavender">•︎•︎</nve-logo>
    <nve-logo color="pink-rose" aria-label="pink rose">•︎•︎</nve-logo>
    <nve-logo color="green-jade" aria-label="green jade">•︎•︎</nve-logo>
    <nve-logo color="lime-pear" aria-label="lime pear">•︎•︎</nve-logo>
    <nve-logo color="yellow-nova" aria-label="yellow nova">•︎•︎</nve-logo>
    <nve-logo color="brand-green" aria-label="brand green">•︎•︎</nve-logo>
  </div>
  `;
}
