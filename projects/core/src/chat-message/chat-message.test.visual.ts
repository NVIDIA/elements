// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('chat-message visual', () => {
  test('chat-message should match visual baseline', async () => {
    const report = await visualRunner.render('chat-message', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('chat-message should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('chat-message.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/chat-message/define.js';
    import '@nvidia-elements/core/avatar/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-chat-message>
  •︎•︎•︎•︎•︎•︎
  </nve-chat-message>

  <section nve-layout="column gap:lg">
    <nve-chat-message arrow-position="top-start">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message arrow-position="top-end">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message arrow-position="bottom-start">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message arrow-position="bottom-end">•︎•︎•︎•︎•︎•︎</nve-chat-message>
  </section>

  <section nve-layout="column gap:lg full">
  <nve-chat-message container="flat">
    <nve-avatar slot="prefix" color="green-grass">•︎•︎</nve-avatar>
    •︎•︎•︎•︎•︎•︎
  </nve-chat-message>
   <nve-chat-message container="flat">
    <nve-avatar slot="suffix" color="green-grass">•︎•︎</nve-avatar>
    •︎•︎•︎•︎•︎•︎
  </nve-chat-message>
  </section>
  
  <section nve-layout="column gap:md">
    <nve-chat-message>•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="red-cardinal">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="gray-slate">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="gray-denim">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="blue-indigo">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="blue-cobalt">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="blue-sky">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="teal-cyan">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="green-mint">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="teal-seafoam">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="green-grass">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="yellow-amber">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="orange-pumpkin">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="red-tomato">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="pink-magenta">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="purple-plum">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="purple-violet">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="purple-lavender">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="pink-rose">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="green-jade">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="lime-pear">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="yellow-nova">•︎•︎•︎•︎•︎•︎</nve-chat-message>
    <nve-chat-message color="brand-green">•︎•︎•︎•︎•︎•︎</nve-chat-message>
</section>
  `;
}
