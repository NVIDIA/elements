import { html } from 'lit';
import '@nvidia-elements/core/notification/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/drawer/define.js';

export default {
  title: 'Elements/Notification/Examples',
  component: 'nve-notification'
};

export const Default = {
  render: () => html`
<nve-notification>
  <h3 nve-text="label">Title</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
`,
  args: { position: 'bottom', alignment: 'center', closable: true }
};

export const Content = {
  render: () => html`
<nve-notification closable>
  <h3 nve-text="label">Title</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
  `
};

export const ContentWrap = {
  render: () => html`
<nve-notification closable>
  <h3 nve-text="label">Title</h3>
  <p nve-text="body" style="width: 230px">some text content in a notification with some really long text in it that just keeps going...</p>
</nve-notification>
  `
};

export const Interactive = {
  render: () => html`
<nve-notification hidden closable position="bottom" close-timeout="2000">
  <h3 nve-text="label">notification</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-button>show</nve-button>

<script type="module">
  const notification = document.querySelector('nve-notification');
  const button = document.querySelector('nve-button');
  notification.addEventListener('close', () => notification.hidden = true);
  button.addEventListener('click', () => notification.hidden = false);
</script>
`
};

export const InteractiveStack = {
  render: () => html`
<nve-notification-group position="bottom" alignment="end"></nve-notification-group>
<nve-button>generate</nve-button>

<script type="module">
  document.querySelector('nve-button').addEventListener('click', () => {
    const notification = document.createElement('nve-notification');
    notification.closable = true;
    notification.status = ['warning', 'danger', 'success', 'accent', undefined][Math.floor(Math.random() * 5)];
    notification.innerHTML = '<h3 nve-text="label">' + (notification.status ?? 'default') + '</h3><p nve-text="body">some text content in a notification</p>';
    notification.closeTimeout = 2000 * (document.querySelectorAll('nve-notification').length + 1);
    notification.addEventListener('close', () => notification.remove(), { once: true });
    document.querySelector('nve-notification-group').prepend(notification);
  });
</script>
`
};

export const BehaviorTrigger = {
  render: () => html`
<nve-notification trigger="notification-btn" behavior-trigger hidden closable position="bottom" close-timeout="2000">
  <h3 nve-text="label">notification</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-button id="notification-btn">show</nve-button>
`
};

export const Status = {
  render: () => html`
<nve-notification-group position="center">
  <nve-notification closable>
    <h3 nve-text="label">Default</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification status="accent" closable>
    <h3 nve-text="label">Accent</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification status="success" closable>
    <h3 nve-text="label">Success</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification status="warning" closable>
    <h3 nve-text="label">Warning</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification status="danger" closable>
    <h3 nve-text="label">Danger</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
</nve-notification-group>
  `
};

export const Position = {
  render: () => html`
<nve-notification-group position="bottom">
  <nve-notification closable>
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification closable>
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification closable>
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
</nve-notification-group>
  `
};

export const Drawer = {
  render: () => html`
<nve-drawer closable position="right">
  <nve-drawer-header>
    <h3 nve-text="heading semibold sm">Notifications</h3>
  </nve-drawer-header>
  <nve-notification closable container="flat">
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
  </nve-notification>
  <nve-notification status="accent" container="flat" closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
  </nve-notification>
  <nve-notification status="success" container="flat" closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
  </nve-notification>
  <nve-notification status="warning" container="flat" closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
  </nve-notification>
  <nve-notification status="danger" container="flat" closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
  </nve-notification>
  <nve-drawer-footer>
    <div nve-layout="grid gap:sm span-items:6">
      <nve-button interaction="flat-destructive">Clear All</nve-button>
      <nve-button>Mark All as Read</nve-button>
    </div>
  </nve-drawer-footer>
</nve-drawer>
  `,
};
