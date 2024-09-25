import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Notification } from '@nvidia-elements/core/notification';
import '@nvidia-elements/core/notification/define.js';

describe(Notification.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <button popovertarget="notification">button</button>
      <nve-notification id="notification" closable>hello</nve-notification>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-notification')).toBe(true);
  });

  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
      <button popovertarget="notification-group">button</button>
      <nve-notification-group id="notification-group">
        <nve-notification closable>hello</nve-notification>
      </nve-notification-group>
    `);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-notification-group')).toBe(true);
    expect(result.includes('nve-notification')).toBe(true);
  });
});
