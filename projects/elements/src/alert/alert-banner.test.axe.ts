import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { AlertBanner } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

describe('mlv-alert-banner axe', () => {
  let fixture: HTMLElement;
  let alertGroup: AlertBanner;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-alert-banner>
        <mlv-alert closable>
          <span slot="prefix">default</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
        </mlv-alert>
      </mlv-alert-banner>

      <mlv-alert-banner status="accent">
        <mlv-alert closable>
          <span slot="prefix">accent</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
        </mlv-alert>
      </mlv-alert-banner>

      <mlv-alert-banner status="warning">
        <mlv-alert closable>
          <span slot="prefix">warning</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
        </mlv-alert>
      </mlv-alert-banner>

      <mlv-alert-banner status="success">
        <mlv-alert closable>
          <span slot="prefix">success</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
        </mlv-alert>
      </mlv-alert-banner>

      <mlv-alert-banner status="danger">
        <mlv-alert closable>
          <span slot="prefix">danger</span> banner message <a href="#" mlv-text="link" slot="actions">view details</a>
        </mlv-alert>
      </mlv-alert-banner>
    `);
    alertGroup = fixture.querySelector('mlv-alert-banner');
    await elementIsStable(alertGroup);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-alert-banner'], {
      rules: { 'color-contrast': { enabled: false } }
    });
    expect(results.violations.length).toBe(0);
  });
});
