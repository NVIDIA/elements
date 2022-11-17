import { Notification, NotificationGroup } from '@elements/elements/notification';

customElements.get('nve-notification') || customElements.define('nve-notification', Notification);
customElements.get('nve-notification-group') || customElements.define('nve-notification-group', NotificationGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-notification': Notification;
    'nve-notification-group': NotificationGroup;
  }
}
