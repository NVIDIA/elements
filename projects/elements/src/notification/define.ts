import { defineElement } from '@elements/elements/internal';
import { Notification, NotificationGroup } from '@elements/elements/notification';
import '@elements/elements/icon-button/define.js';

defineElement('mlv-notification', Notification);
defineElement('mlv-notification-group', NotificationGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-notification': Notification;
    'mlv-notification-group': NotificationGroup;
  }
}
