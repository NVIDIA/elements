import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Notification } from '@nvidia-elements/core/notification';
import '@nvidia-elements/core/notification/define.js';

describe('mlv-notification', () => {
  let fixture: HTMLElement;
  let element: Notification;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-notification>hello</mlv-notification>
    `);
    element = fixture.querySelector('mlv-notification');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should pass axe check', async () => {
    const results = await runAxe(['mlv-notification']);
    expect(results.violations.length).toBe(0);
  });
});
