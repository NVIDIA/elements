import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { runAxe } from '@elements/elements/test/axe.js';
import { AlertBanner } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

describe('nve-alert-banner axe', () => {
  let fixture: HTMLElement;
  let alertGroup: AlertBanner;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-alert-banner>
        <nve-alert closable>
          <span slot="prefix">default</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
        </nve-alert>
      </nve-alert-banner>

      <nve-alert-banner status="accent">
        <nve-alert closable>
          <span slot="prefix">accent</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
        </nve-alert>
      </nve-alert-banner>

      <nve-alert-banner status="warning">
        <nve-alert closable>
          <span slot="prefix">warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
        </nve-alert>
      </nve-alert-banner>

      <nve-alert-banner status="success">
        <nve-alert closable>
          <span slot="prefix">success</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
        </nve-alert>
      </nve-alert-banner>

      <nve-alert-banner status="danger">
        <nve-alert closable>
          <span slot="prefix">danger</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
        </nve-alert>
      </nve-alert-banner>
    `);
    alertGroup = fixture.querySelector('nve-alert-banner');
    await elementIsStable(alertGroup);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['nve-alert-banner']);
    expect(results.violations.length).toBe(0);
  });
});
