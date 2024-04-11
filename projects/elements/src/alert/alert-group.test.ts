import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Alert, AlertGroup } from '@nvidia-elements/core/alert';
import '@nvidia-elements/core/alert/define.js';

describe('mlv-alert-group', () => {
  let fixture: HTMLElement;
  let alerts: NodeListOf<Alert>;
  let alertGroup: AlertGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-alert-group>
        <mlv-alert>alert</mlv-alert>
        <mlv-alert>alert</mlv-alert>
      </mlv-alert-group>
    `);
    alerts = fixture.querySelectorAll('mlv-alert');
    alertGroup = fixture.querySelector('mlv-alert-group');
    await elementIsStable(alertGroup);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define elements', () => {
    expect(customElements.get('mlv-alert')).toBeDefined();
    expect(customElements.get('mlv-alert-group')).toBeDefined();
  });

  it('should provide a aria role of group to describe content', async () => {
    await elementIsStable(alertGroup);
    expect(alertGroup._internals.role).toBe('group');
  });

  it('should sync group status to all child alerts within group', async () => {
    await elementIsStable(alertGroup);
    expect(alerts[0].status).toBe(undefined);
    expect(alerts[1].status).toBe(undefined);

    alertGroup.status = 'success';
    await elementIsStable(alertGroup);
    expect(alerts[0].status).toBe('success');
    expect(alerts[1].status).toBe('success');
  });

  it('should sync group status to newly added alerts', async () => {
    alertGroup.status = 'success';
    await elementIsStable(alertGroup);
    const alert = document.createElement('mlv-alert');
    expect(alert.status).toBe(undefined);

    alertGroup.appendChild(alert);
    await elementIsStable(alertGroup);
    await elementIsStable(alert);
    expect(alert.status).toBe('success');
  });
});
