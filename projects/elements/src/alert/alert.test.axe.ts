import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Alert } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

describe('mlv-alert axe', () => {
  let fixture: HTMLElement;
  let alert: Alert;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-alert>default</mlv-alert>
      <mlv-alert status="accent">accent</mlv-alert>
      <mlv-alert status="warning">warning</mlv-alert>
      <mlv-alert status="success">success</mlv-alert>
      <mlv-alert status="danger">danger</mlv-alert>
    `);
    alert = fixture.querySelector('mlv-alert');
    await elementIsStable(alert);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-alert']);
    expect(results.violations.length).toBe(0);
  });
});
