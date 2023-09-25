import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { AlertGroup } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

describe('nve-alert-group axe', () => {
  let fixture: HTMLElement;
  let alertGroup: AlertGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-alert-group>
        <nve-alert>default</nve-alert>
        <nve-alert>default</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="accent">
        <nve-alert>default</nve-alert>
        <nve-alert>default</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning">
        <nve-alert>warning</nve-alert>
        <nve-alert>warning</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success">
        <nve-alert>success</nve-alert>
        <nve-alert>success</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger">
        <nve-alert>danger</nve-alert>
        <nve-alert>danger</nve-alert>
      </nve-alert-group>
    `);
    alertGroup = fixture.querySelector('nve-alert-group');
    await elementIsStable(alertGroup);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-alert-group']);
    expect(results.violations.length).toBe(0);
  });
});
