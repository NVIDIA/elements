import { define } from '@nvidia-elements/core/internal';
import { Notification, NotificationGroup } from '@nvidia-elements/core/notification';

define(Notification);
define(NotificationGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-notification': Notification;
    'nve-notification-group': NotificationGroup;
  }
}
