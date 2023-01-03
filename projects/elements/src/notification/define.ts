import { defineElement } from '@elements/elements/internal';
import { Notification, NotificationGroup } from '@elements/elements/notification';
import '@elements/elements/icon-button/define.js';

defineElement('nve-notification', Notification);
defineElement('nve-notification-group', NotificationGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-notification': Notification;
    'nve-notification-group': NotificationGroup;
  }
}
