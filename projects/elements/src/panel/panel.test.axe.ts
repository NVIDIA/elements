import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Panel } from '@nvidia-elements/core/panel';
import '@nvidia-elements/core/panel/define.js';

describe('mlv-panel', () => {
  let fixture: HTMLElement;
  let element: Panel;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-panel behavior-expand expanded style="width:280px; height:100vh">
        <mlv-panel-header>
          <div slot="title">Title</div>
          <div slot="subtitle"></div>
        </mlv-panel-header>

        <mlv-panel-content mlv-layout="column gap:md">
          <p mlv-text="body">content</p>
        </mlv-panel-content>
      </mlv-panel>
    `);
    element = fixture.querySelector('mlv-panel');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-panel']);
    expect(results.violations.length).toBe(0);
  });
});
