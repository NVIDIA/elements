import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Button } from '@nvidia-elements/core/button';
import { JSONNode } from './node.js';
import '@nvidia-elements/core/json-viewer/define.js';

/* eslint-disable @nvidia-elements/lint/no-unknown-tags */

describe(JSONNode.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: JSONNode;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-json-node></nve-json-node>
    `);
    element = fixture.querySelector(JSONNode.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(JSONNode.metadata.tag)).toBeDefined();
  });

  it('should render a link if value is a url', async () => {
    element.value = 'https://nvidia.com';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('a')).toBeTruthy();
  });

  it('should render a pre block if value is a long string', async () => {
    element.value = '...';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('pre')).toBe(null);

    element.value = Array(1000).join('.');
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('pre')).toBeTruthy();
  });

  it('should render property name as button if available and an object or array value', async () => {
    element.value = { url: 'https://nvidia.com' };
    element.prop = 'site';
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(Button.metadata.tag).textContent.trim()).toBe('site:');
  });

  it('should render icon button if property name is not available and an object or array value', async () => {
    element.value = { url: 'https://nvidia.com' };
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBeTruthy();
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).direction).toBe('right');

    element.expanded = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).direction).toBe('down');
  });

  it('should expand if icon button clicked', async () => {
    element.value = { url: 'https://nvidia.com' };
    await elementIsStable(element);
    expect(element.expanded).toBe(false);

    element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();
    await elementIsStable(element);
    expect(element.expanded).toBe(true);
  });

  it('should expand if property button clicked', async () => {
    element.value = { url: 'https://nvidia.com' };
    element.prop = 'site';
    await elementIsStable(element);
    expect(element.expanded).toBe(false);

    element.shadowRoot.querySelector<Button>(Button.metadata.tag).click();
    await elementIsStable(element);
    expect(element.expanded).toBe(true);
  });
});
