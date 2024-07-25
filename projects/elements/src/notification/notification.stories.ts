import { html } from 'lit';
import '@nvidia-elements/core/notification/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/drawer/define.js';

export default {
  title: 'Elements/Notification/Examples',
  component: 'mlv-notification'
};

export const Default = {
  render: () => html`
<mlv-notification>
  <h3 nve-text="label">Title</h3>
  <p nve-text="body">some text content in a notification</p>
</mlv-notification>
`,
  args: { position: 'bottom', alignment: 'center', closable: true }
};

export const Content = {
  render: () => html`
<mlv-notification closable>
  <h3 nve-text="label">Title</h3>
  <p nve-text="body">some text content in a notification</p>
</mlv-notification>
  `
};

export const ContentWrap = {
  render: () => html`
<mlv-notification closable>
  <h3 nve-text="label">Title</h3>
  <p nve-text="body" style="width: 230px">some text content in a notification with some really long text in it that just keeps going...</p>
</mlv-notification>
  `
};

export const Interactive = {
  render: () => html`
<mlv-notification hidden closable position="bottom" close-timeout="2000">
  <h3 nve-text="label">notification</h3>
  <p nve-text="body">some text content in a notification</p>
</mlv-notification>
<mlv-button>show</mlv-button>

<script type="module">
  const notification = document.querySelector('mlv-notification');
  const button = document.querySelector('mlv-button');
  notification.addEventListener('close', () => notification.hidden = true);
  button.addEventListener('click', () => notification.hidden = false);
</script>
`
};

export const InteractiveStack = {
  render: () => html`
<mlv-notification-group position="bottom" alignment="end"></mlv-notification-group>
<mlv-button>generate</mlv-button>

<script type="module">
  document.querySelector('mlv-button').addEventListener('click', () => {
    const notification = document.createElement('mlv-notification');
    notification.closable = true;
    notification.status = ['warning', 'danger', 'success', 'accent', undefined][Math.floor(Math.random() * 5)];
    notification.innerHTML = '<h3 nve-text="label">' + (notification.status ?? 'default') + '</h3><p nve-text="body">some text content in a notification</p>';
    notification.closeTimeout = 2000 * (document.querySelectorAll('mlv-notification').length + 1);
    notification.addEventListener('close', () => notification.remove(), { once: true });
    document.querySelector('mlv-notification-group').prepend(notification);
  });
</script>
`
};

export const BehaviorTrigger = {
  render: () => html`
<mlv-notification trigger="notification-btn" behavior-trigger hidden closable position="bottom" close-timeout="2000">
  <h3 nve-text="label">notification</h3>
  <p nve-text="body">some text content in a notification</p>
</mlv-notification>
<mlv-button id="notification-btn">show</mlv-button>
`
};

export const Status = {
  render: () => html`
<mlv-notification-group position="center">
  <mlv-notification closable>
    <h3 nve-text="label">Default</h3>
    <p nve-text="body">some text content in a notification</p>
  </mlv-notification>
  <mlv-notification status="accent" closable>
    <h3 nve-text="label">Accent</h3>
    <p nve-text="body">some text content in a notification</p>
  </mlv-notification>
  <mlv-notification status="success" closable>
    <h3 nve-text="label">Success</h3>
    <p nve-text="body">some text content in a notification</p>
  </mlv-notification>
  <mlv-notification status="warning" closable>
    <h3 nve-text="label">Warning</h3>
    <p nve-text="body">some text content in a notification</p>
  </mlv-notification>
  <mlv-notification status="danger" closable>
    <h3 nve-text="label">Danger</h3>
    <p nve-text="body">some text content in a notification</p>
  </mlv-notification>
</mlv-notification-group>
  `
};

export const Position = {
  render: () => html`
<mlv-notification-group position="bottom">
  <mlv-notification closable>
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content in a notification</p>
  </mlv-notification>
  <mlv-notification closable>
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content in a notification</p>
  </mlv-notification>
  <mlv-notification closable>
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content in a notification</p>
  </mlv-notification>
</mlv-notification-group>
  `
};

export const Drawer = {
  render: () => html`
<mlv-drawer closable position="right">
  <mlv-drawer-header>
    <h3 nve-text="heading semibold sm">Notifications</h3>
  </mlv-drawer-header>
  <mlv-notification closable container="flat">
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
  </mlv-notification>
  <mlv-notification status="accent" container="flat" closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
  </mlv-notification>
  <mlv-notification status="success" container="flat" closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
  </mlv-notification>
  <mlv-notification status="warning" container="flat" closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
  </mlv-notification>
  <mlv-notification status="danger" container="flat" closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">This is a notification in a notification drawer, messages should be succinct.</p>
  </mlv-notification>
  <mlv-drawer-footer>
    <div nve-layout="grid gap:sm span-items:6">
      <mlv-button interaction="flat-destructive">Clear All</mlv-button>
      <mlv-button>Mark All as Read</mlv-button>
    </div>
  </mlv-drawer-footer>
</mlv-drawer>
  `,
};
