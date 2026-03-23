import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Avatar } from '@nvidia-elements/core/avatar';
import '@nvidia-elements/core/avatar/define.js';

describe(Avatar.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Avatar;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-avatar>AV</nve-avatar>
      <nve-avatar color="red-cardinal">AV</nve-avatar>
      <nve-avatar color="gray-slate">AV</nve-avatar>
      <nve-avatar color="gray-denim">AV</nve-avatar>
      <nve-avatar color="blue-indigo">AV</nve-avatar>
      <nve-avatar color="blue-cobalt">AV</nve-avatar>
      <nve-avatar color="blue-sky">AV</nve-avatar>
      <nve-avatar color="teal-cyan">AV</nve-avatar>
      <nve-avatar color="green-mint">AV</nve-avatar>
      <nve-avatar color="teal-seafoam">AV</nve-avatar>
      <nve-avatar color="green-grass">AV</nve-avatar>
      <nve-avatar color="yellow-amber">AV</nve-avatar>
      <nve-avatar color="orange-pumpkin">AV</nve-avatar>
      <nve-avatar color="red-tomato">AV</nve-avatar>
      <nve-avatar color="pink-magenta">AV</nve-avatar>
      <nve-avatar color="purple-plum">AV</nve-avatar>
      <nve-avatar color="purple-violet">AV</nve-avatar>
      <nve-avatar color="purple-lavender">AV</nve-avatar>
      <nve-avatar color="pink-rose">AV</nve-avatar>
      <nve-avatar color="green-jade">AV</nve-avatar>
      <nve-avatar color="lime-pear">AV</nve-avatar>
      <nve-avatar color="yellow-nova">AV</nve-avatar>
      <nve-avatar color="brand-green">AV</nve-avatar>
    `);
    element = fixture.querySelector(Avatar.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Avatar.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
