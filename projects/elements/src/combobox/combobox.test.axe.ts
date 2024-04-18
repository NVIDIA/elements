import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Combobox } from '@nvidia-elements/core/combobox';
import '@nvidia-elements/core/combobox/define.js';

describe(Combobox.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Combobox;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <datalist>
          <option value="Option 1"></option>
          <option value="Option 2"></option>
          <option value="Option 3"></option>
        </datalist>
        <nve-control-message>message</nve-control-message>
      </nve-combobox>
    `);
    element = fixture.querySelector(Combobox.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Combobox.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
