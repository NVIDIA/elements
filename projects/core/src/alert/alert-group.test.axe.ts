import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { AlertGroup } from '@nvidia-elements/core/alert';
import '@nvidia-elements/core/alert/define.js';

describe(AlertGroup.metadata.tag, () => {
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
    alertGroup = fixture.querySelector(AlertGroup.metadata.tag);
    await elementIsStable(alertGroup);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([AlertGroup.metadata.tag]);
    expect(results.violations.length).toBe(0);
  });
});
