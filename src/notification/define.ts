import { Notification, NotificationGroup } from '@elements/elements/notification';

customElements.get('mlv-notification') || customElements.define('mlv-notification', Notification);
customElements.get('mlv-notification-group') || customElements.define('mlv-notification-group', NotificationGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-notification': Notification;
    'mlv-notification-group': NotificationGroup;
  }
}
