// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Tag } from '@nvidia-elements/core/tag';
import '@nvidia-elements/core/tag/define.js';

describe(Tag.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Tag;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-tag>tag</nve-tag>
      <nve-tag closable>closable</nve-tag>
      <nve-tag color="red-cardinal">red-cardinal</nve-tag>
      <nve-tag color="gray-slate">gray-slate</nve-tag>
      <nve-tag color="gray-denim">gray-denim</nve-tag>
      <nve-tag color="blue-indigo">blue-indigo</nve-tag>
      <nve-tag color="blue-cobalt">blue-cobalt</nve-tag>
      <nve-tag color="blue-sky">blue-sky</nve-tag>
      <nve-tag color="teal-cyan">teal-cyan</nve-tag>
      <nve-tag color="green-mint">green-mint</nve-tag>
      <nve-tag color="teal-seafoam">teal-seafoam</nve-tag>
      <nve-tag color="green-grass">green-grass</nve-tag>
      <nve-tag color="yellow-amber">yellow-amber</nve-tag>
      <nve-tag color="orange-pumpkin">orange-pumpkin</nve-tag>
      <nve-tag color="red-tomato">red-tomato</nve-tag>
      <nve-tag color="pink-magenta">pink-magenta</nve-tag>
      <nve-tag color="purple-plum">purple-plum</nve-tag>
      <nve-tag color="purple-violet">purple-violet</nve-tag>
      <nve-tag color="purple-lavender">purple-lavender</nve-tag>
      <nve-tag color="pink-rose">pink-rose</nve-tag>
      <nve-tag color="green-jade">green-jade</nve-tag>
      <nve-tag color="lime-pear">lime-pear</nve-tag>
      <nve-tag color="yellow-nova">yellow-nova</nve-tag>
      <nve-tag color="brand-green">brand-green</nve-tag>
    `);
    element = fixture.querySelector(Tag.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Tag.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
