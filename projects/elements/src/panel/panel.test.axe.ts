import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Panel } from '@elements/elements/panel';
import '@elements/elements/panel/define.js';

describe('nve-panel', () => {
  let fixture: HTMLElement;
  let element: Panel;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-panel behavior-expand expanded style="width:280px; height:100vh">
        <nve-panel-header>
          <div slot="title">Title</div>
          <div slot="subtitle"></div>
        </nve-panel-header>

        <nve-panel-content nve-layout="column gap:md">
          <p nve-text="body">content</p>
        </nve-panel-content>
      </nve-panel>
    `);
    element = fixture.querySelector('nve-panel');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-panel']);
    expect(results.violations.length).toBe(0);
  });
});
