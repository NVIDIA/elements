import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@nvidia-elements/testing';
import { NotificationGroup } from '@nvidia-elements/core/notification';
import '@nvidia-elements/core/notification/define.js';

describe(NotificationGroup.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: NotificationGroup;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <mlv-notification-group>

      </mlv-notification-group>
    `);
    element = fixture.querySelector(NotificationGroup.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(NotificationGroup.metadata.tag)).toBeDefined();
  });
});
