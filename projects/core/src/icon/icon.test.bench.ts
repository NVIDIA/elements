// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import type { BenchFnOptions, BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { IconName } from '@nvidia-elements/core/icon';
import { Icon } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/icon/define.js';

const iconNames: IconName[] = ['book', 'bookmark'];
const iconListTemplate = html`${Array.from({ length: 100 }, () => html`<nve-icon name="book"></nve-icon>`)}`;
const runOptions = {
  iterations: 10,
  throws: true,
  time: 500,
  warmupIterations: 5,
  warmupTime: 100
} satisfies BenchRunOptions;

async function updateIcon(icon: Icon, name: IconName) {
  icon.name = name;
  await elementIsStable(icon);
  await Promise.resolve();
  await elementIsStable(icon);
}

describe(Icon.metadata.tag, () => {
  let listFixture: HTMLElement;
  let listIconNameIndex = 0;
  let listIcons: Icon[];
  let singleFixture: HTMLElement;
  let singleIcon: Icon;
  let singleIconNameIndex = 0;

  const singleOptions: BenchFnOptions = {
    async beforeAll() {
      singleFixture = await createFixture(html`<nve-icon name="book"></nve-icon>`);
      singleIcon = singleFixture.querySelector<Icon>(Icon.metadata.tag)!;
      await elementIsStable(singleIcon);
    },
    afterAll() {
      removeFixture(singleFixture);
    }
  };

  const listOptions: BenchFnOptions = {
    async beforeAll() {
      listFixture = await createFixture(iconListTemplate);
      listIcons = Array.from(listFixture.querySelectorAll<Icon>(Icon.metadata.tag));
      await Promise.all(listIcons.map(icon => elementIsStable(icon)));
    },
    afterAll() {
      removeFixture(listFixture);
    }
  };

  test('updates a named icon', async ({ bench }) => {
    await bench('updates a named icon', singleOptions, async () => {
      await updateIcon(singleIcon, iconNames[++singleIconNameIndex % iconNames.length]!);
    }).run(runOptions);
  });

  test('updates 100 named icons', async ({ bench }) => {
    await bench('updates 100 named icons', listOptions, async () => {
      const name = iconNames[++listIconNameIndex % iconNames.length]!;
      await Promise.all(listIcons.map(icon => updateIcon(icon, name)));
    }).run(runOptions);
  });
});
