import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { PreferencesInput } from '@nvidia-elements/core/preferences-input';
import '@nvidia-elements/core/preferences-input/define.js';

describe(PreferencesInput.metadata.tag, () => {
  it('should pass axe check', async () => {
    const fixture = await createFixture(html`
      <nve-preferences-input></nve-preferences-input>
    `);

    const style = document.createElement('style');
    document.head.appendChild(style);
    style.textContent = `
      :root {
       --nve-config-light: true;
       --nve-config-dark: true;
       --nve-config-high-contrast: true;
       --nve-config-compact: true;
       --nve-config-reduced-motion: true;
      }
    `;

    await elementIsStable(fixture.querySelector(PreferencesInput.metadata.tag));
    const results = await runAxe([PreferencesInput.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
