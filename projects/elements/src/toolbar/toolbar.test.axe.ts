import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Toolbar } from '@elements/elements/toolbar';
import '@elements/elements/toolbar/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/button-group/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/divider/define.js';

describe('mlv-toolbar axe', () => {
  let fixture: HTMLElement;
  let element: Toolbar;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <mlv-toolbar>
      <mlv-button-group behavior-select="single" container="flat">
        <mlv-icon-button pressed icon-name="bars-3-bottom-left" aria-label="align left"></mlv-icon-button>
        <mlv-icon-button icon-name="bars-3-bottom-right" aria-label="align right"></mlv-icon-button>
        <mlv-icon-button icon-name="bars-4" aria-label="align"></mlv-icon-button>
      </mlv-button-group>

      <mlv-divider orientation="vertical"></mlv-divider>

      <mlv-button-group behavior-select="multi" container="flat">
        <mlv-icon-button icon-name="bold" size="sm" aria-label="bold"></mlv-icon-button>
        <mlv-icon-button icon-name="italic" size="sm" aria-label="italic"></mlv-icon-button>
        <mlv-icon-button icon-name="strikethrough" size="sm" aria-label="strikethrough"></mlv-icon-button>
      </mlv-button-group>

      <mlv-button slot="suffix" container="flat">Save</mlv-button>
    </mlv-toolbar>
    `);
    element = fixture.querySelector('mlv-toolbar');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-toolbar']);
    expect(results.violations.length).toBe(0);
  });
});
