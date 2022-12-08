import { Notification, NotificationGroup } from '@elements/elements/notification';
import '@elements/elements/icon-button/define.js';

customElements.get('mlv-notification') || customElements.define('mlv-notification', Notification);
customElements.get('mlv-notification-group') || customElements.define('mlv-notification-group', NotificationGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-notification': Notification;
    'mlv-notification-group': NotificationGroup;
  }
}
