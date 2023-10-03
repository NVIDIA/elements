import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { Toolbar } from '@elements/elements/toolbar';
import '@elements/elements/toolbar/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/button-group/define.js';
import '@elements/elements/divider/define.js';

describe('nve-toolbar axe', () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <nve-toolbar>
      <nve-button-group behavior-select="single" interaction="flat">
        <nve-icon-button pressed icon-name="bars-3-bottom-left" aria-label="align left"></nve-icon-button>
        <nve-icon-button icon-name="bars-3-bottom-right" aria-label="align right"></nve-icon-button>
        <nve-icon-button icon-name="bars-4" aria-label="align"></nve-icon-button>
      </nve-button-group>

      <nve-divider orientation="vertical"></nve-divider>

      <nve-button-group behavior-select="multi" interaction="flat">
        <nve-icon-button icon-name="bold" size="sm" aria-label="bold"></nve-icon-button>
        <nve-icon-button icon-name="italic" size="sm" aria-label="italic"></nve-icon-button>
        <nve-icon-button icon-name="strikethrough" size="sm" aria-label="strikethrough"></nve-icon-button>
      </nve-button-group>

      <nve-button slot="suffix" interaction="flat">Save</nve-button>
    </nve-toolbar>
    `);
    element = fixture.querySelector('nve-toolbar');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-toolbar']);
    expect(results.violations.length).toBe(0);
  });
});
