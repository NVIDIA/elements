import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { AlertBanner } from '@nvidia-elements/core/alert';
import '@nvidia-elements/core/alert/define.js';

describe(AlertBanner.metadata.tag, () => {
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
    alertGroup = fixture.querySelector(AlertBanner.metadata.tag);
    await elementIsStable(alertGroup);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe([AlertBanner.metadata.tag], {
      rules: {
        'color-contrast': { enabled: false },
        'aria-prohibited-attr': { enabled: false }
      }
    });
    expect(results.violations.length).toBe(0);
  });
});
