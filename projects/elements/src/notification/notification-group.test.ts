import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { NotificationGroup } from '@nvidia-elements/core/notification';
import '@nvidia-elements/core/notification/define.js';

describe('nve-notification', () => {
  let fixture: HTMLElement;
  let element: NotificationGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-notification-group>

      </nve-notification-group>
    `);
    element = fixture.querySelector('nve-notification-group');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-notification-group')).toBeDefined();
  });
});
