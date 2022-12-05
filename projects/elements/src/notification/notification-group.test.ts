import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { NotificationGroup } from '@elements/elements/notification';
import '@elements/elements/notification/define.js';

describe('mlv-notification', () => {
  let fixture: HTMLElement;
  let element: NotificationGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-notification-group>

      </mlv-notification-group>
    `);
    element = fixture.querySelector('mlv-notification-group');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('mlv-notification-group')).toBeDefined();
  });
});
