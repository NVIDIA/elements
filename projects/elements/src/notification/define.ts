import { define } from '@elements/elements/internal';
import { Notification, NotificationGroup } from '@elements/elements/notification';
import '@elements/elements/icon-button/define.js';

define(Notification);
define(NotificationGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-notification': Notification;
    'mlv-notification-group': NotificationGroup;
  }
}
