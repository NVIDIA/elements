import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Select } from '@nvidia-elements/core/select';
import '@nvidia-elements/core/select/define.js';

describe(Select.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Select;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-select>
        <label>label</label>
        <select>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">
            Option 3
            <template>
              Option 3
              <span>Custom Content</span> 
            </template>
          </option>
        </select>
      </nve-select>
    `);
    element = fixture.querySelector(Select.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([Select.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });

  it('should pass axe check with multiple select', async () => {
    const multiFixture = await createFixture(html`
      <nve-select>
        <label>label</label>
        <select multiple>
          <option value="1" selected>Option 1</option>
          <option value="2" selected>Option 2</option>
          <option value="3">Option 3</option>
        </select>
      </nve-select>
    `);
    await elementIsStable(multiFixture.querySelector(Select.metadata.tag));
    const results = await runAxe([Select.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(multiFixture);
  });

  it('should pass axe check with size select', async () => {
    const sizeFixture = await createFixture(html`
      <nve-select>
        <label>label</label>
        <select size="3">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
      </nve-select>
    `);
    await elementIsStable(sizeFixture.querySelector(Select.metadata.tag));
    const results = await runAxe([Select.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(sizeFixture);
  });

  it('should pass axe check with multiple and size select', async () => {
    const multiSizeFixture = await createFixture(html`
      <nve-select>
        <label>label</label>
        <select multiple size="3">
          <option value="1" selected>Option 1</option>
          <option value="2" selected>Option 2</option>
          <option value="3">Option 3</option>
        </select>
      </nve-select>
    `);
    await elementIsStable(multiSizeFixture.querySelector(Select.metadata.tag));
    const results = await runAxe([Select.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(multiSizeFixture);
  });
});
