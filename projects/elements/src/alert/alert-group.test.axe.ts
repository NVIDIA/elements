import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { AlertGroup } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

describe('mlv-alert-group axe', () => {
  let fixture: HTMLElement;
  let alertGroup: AlertGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-alert-group>
        <mlv-alert>default</mlv-alert>
        <mlv-alert>default</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="accent">
        <mlv-alert>default</mlv-alert>
        <mlv-alert>default</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="warning">
        <mlv-alert>warning</mlv-alert>
        <mlv-alert>warning</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="success">
        <mlv-alert>success</mlv-alert>
        <mlv-alert>success</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="danger">
        <mlv-alert>danger</mlv-alert>
        <mlv-alert>danger</mlv-alert>
      </mlv-alert-group>
    `);
    alertGroup = fixture.querySelector('mlv-alert-group');
    await elementIsStable(alertGroup);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-alert-group']);
    expect(results.violations.length).toBe(0);
  });
});
