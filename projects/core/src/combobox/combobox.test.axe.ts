import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
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

  it('should pass axe check with single select', async () => {
    const selectFixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <select>
          <option selected value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
      </nve-combobox>
    `);
    await elementIsStable(selectFixture.querySelector(Combobox.metadata.tag));
    const results = await runAxe([Combobox.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(selectFixture);
  });

  it('should pass axe check with multi select', async () => {
    const multiFixture = await createFixture(html`
      <nve-combobox>
        <label>combobox</label>
        <input type="search" />
        <select multiple>
          <option selected value="1">Option 1</option>
          <option selected value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
      </nve-combobox>
    `);
    await elementIsStable(multiFixture.querySelector(Combobox.metadata.tag));
    const results = await runAxe([Combobox.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(multiFixture);
  });

  it('should pass axe check with notags multi select', async () => {
    const notagsFixture = await createFixture(html`
      <nve-combobox notags>
        <label>combobox</label>
        <input type="search" />
        <select multiple>
          <option selected value="1">Option 1</option>
          <option selected value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
      </nve-combobox>
    `);
    await elementIsStable(notagsFixture.querySelector(Combobox.metadata.tag));
    const results = await runAxe([Combobox.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(notagsFixture);
  });
});
