import { Notification, NotificationGroup } from '@elements/elements/notification';
import '@elements/elements/icon-button/define.js';

customElements.get('nve-notification') || customElements.define('nve-notification', Notification);
customElements.get('nve-notification-group') || customElements.define('nve-notification-group', NotificationGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-notification': Notification;
    'nve-notification-group': NotificationGroup;
  }
}
