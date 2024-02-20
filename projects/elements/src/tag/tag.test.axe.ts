import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Tag } from '@elements/elements/tag';
import '@elements/elements/tag/define.js';

describe('mlv-tag', () => {
  let fixture: HTMLElement;
  let element: Tag;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-tag>tag</mlv-tag>
      <mlv-tag closable>closable</mlv-tag>
      <mlv-tag color="red-cardinal">red-cardinal</mlv-tag>
      <mlv-tag color="gray-slate">gray-slate</mlv-tag>
      <mlv-tag color="gray-denim">gray-denim</mlv-tag>
      <mlv-tag color="blue-indigo">blue-indigo</mlv-tag>
      <mlv-tag color="blue-cobalt">blue-cobalt</mlv-tag>
      <mlv-tag color="blue-sky">blue-sky</mlv-tag>
      <mlv-tag color="teal-cyan">teal-cyan</mlv-tag>
      <mlv-tag color="green-mint">green-mint</mlv-tag>
      <mlv-tag color="teal-seafoam">teal-seafoam</mlv-tag>
      <mlv-tag color="green-grass">green-grass</mlv-tag>
      <mlv-tag color="yellow-amber">yellow-amber</mlv-tag>
      <mlv-tag color="orange-pumpkin">orange-pumpkin</mlv-tag>
      <mlv-tag color="red-tomato">red-tomato</mlv-tag>
      <mlv-tag color="pink-magenta">pink-magenta</mlv-tag>
      <mlv-tag color="purple-plum">purple-plum</mlv-tag>
      <mlv-tag color="purple-violet">purple-violet</mlv-tag>
      <mlv-tag color="purple-lavender">purple-lavender</mlv-tag>
      <mlv-tag color="pink-rose">pink-rose</mlv-tag>
      <mlv-tag color="green-jade">green-jade</mlv-tag>
      <mlv-tag color="lime-pear">lime-pear</mlv-tag>
      <mlv-tag color="yellow-nova">yellow-nova</mlv-tag>
      <mlv-tag color="brand-green">brand-green</mlv-tag>
    `);
    element = fixture.querySelector('mlv-tag');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-tag']);
    expect(results.violations.length).toBe(0);
  });
});
