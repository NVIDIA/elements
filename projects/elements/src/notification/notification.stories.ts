import { html } from 'lit';
import '@nvidia-elements/core/notification/define.js';
import '@nvidia-elements/core/dialog/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/drawer/define.js';

export default {
  title: 'Elements/Notification/Examples',
  component: 'nve-notification',
  parameters: {
    layout: 'centered'
  }
};

export const Default = {
  render: () => html`
<nve-notification id="notification" position="top" close-timeout="2000">
  <h3 nve-text="label">Notification</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-button popovertarget="notification">button</nve-button>
`
};

export const Visual = {
  render: () => html`
<nve-notification position="center">
  <h3 nve-text="label">Notification</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
`
};

export const ContentWrap = {
  render: () => html`
<nve-notification position="center">
  <h3 nve-text="label">Notification</h3>
  <p nve-text="body" style="width: 230px">some text content in a notification with some really long text in it that just keeps going...</p>
</nve-notification>
  `
};

export const Events = {
  render: () => html`
<nve-notification id="notification" position="top" close-timeout="2000" closable>
  <h3 nve-text="label">Notification</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-button popovertarget="notification">button</nve-button>
<script type="module">
  const notification = document.querySelector('nve-notification');
  notification.addEventListener('close', () => console.log('close'));
  notification.addEventListener('open', () => console.log('open'));
</script>
`
};

export const InteractiveGroup = {
  render: () => html`
<nve-notification-group position="bottom" alignment="end" id="group"></nve-notification-group>
<nve-button>generate</nve-button>

<script type="module">
  const button = document.querySelector('nve-button');
  button.addEventListener('click', () => {
    const notification = document.createElement('nve-notification');
    notification.closable = true;
    notification.status = ['warning', 'danger', 'success', 'accent', undefined][Math.floor(Math.random() * 5)];
    notification.innerHTML = '<h3 nve-text="label">' + (notification.status ?? 'default') + '</h3><p nve-text="body">some text content in a notification</p>';
    notification.closeTimeout = 1000 * (document.querySelectorAll('nve-notification').length + 1);
    notification.addEventListener('close', () => notification.remove(), { once: true });
    notification.position = 'bottom';
    notification.alignment = 'end';

    document.querySelector('nve-notification-group').prepend(notification);
  });
</script>
`
};

export const Status = {
  render: () => html`
<nve-notification-group position="center">
  <nve-notification>
    <h3 nve-text="label">Default</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification status="accent">
    <h3 nve-text="label">Accent</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification status="success">
    <h3 nve-text="label">Success</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification status="warning">
    <h3 nve-text="label">Warning</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification status="danger">
    <h3 nve-text="label">Danger</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
</nve-notification-group>
  `
};

export const Alignment = {
  render: () => html`
<nve-notification position="top">
  <h3 nve-text="label">Top</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-notification position="top" alignment="start">
  <h3 nve-text="label">Top Start</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-notification position="top" alignment="end">
  <h3 nve-text="label">Top End</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>

<nve-notification position="right">
  <h3 nve-text="label">Right</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-notification position="right" alignment="start">
  <h3 nve-text="label">Right Start</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-notification position="right" alignment="end">
  <h3 nve-text="label">Right End</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>

<nve-notification position="bottom">
  <h3 nve-text="label">Bottom</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-notification position="bottom" alignment="start">
  <h3 nve-text="label">Bottom Start</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-notification position="bottom" alignment="end">
  <h3 nve-text="label">Bottom End</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>

<nve-notification position="left">
  <h3 nve-text="label">Left</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-notification position="left" alignment="start">
  <h3 nve-text="label">Left Start</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-notification position="left" alignment="end">
  <h3 nve-text="label">Left End</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
  `
};

export const Position = {
  render: () => html`
<nve-notification position="top">
  <h3 nve-text="label">Position Top</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-notification position="right">
  <h3 nve-text="label">Position Right</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-notification position="bottom">
  <h3 nve-text="label">Position Bottom</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-notification position="left">
  <h3 nve-text="label">Position Left</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
  `
};

export const PositionGroup = {
  render: () => html`
<nve-notification-group position="top">
  <nve-notification closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
</nve-notification-group>

<nve-notification-group position="right">
  <nve-notification closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
</nve-notification-group>

<nve-notification-group position="bottom">
  <nve-notification closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
</nve-notification-group>

<nve-notification-group position="left">
  <nve-notification closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification closable>
    <h3 nve-text="label">Notification</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification closable>
    <h3 nve-text="label">Notification</h3>
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

export const ShadowRoot = {
  render: () => html`
<test-notification-shadow-root></test-notification-shadow-root>
<script type="module">
  customElements.define('test-notification-shadow-root', class TestNotificationShadowRoot extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({mode: 'open'});

      const template = document.createElement('template');
      template.innerHTML = \`
        <nve-notification position="top">
          top
        </nve-notification>
        <nve-notification position="top" alignment="start">
          top start
        </nve-notification>
        <nve-notification position="top" alignment="end">
          top end
        </nve-notification>

        <nve-notification position="right">
          right
        </nve-notification>
        <nve-notification position="right" alignment="start">
          right start
        </nve-notification>
        <nve-notification position="right" alignment="end">
          right end
        </nve-notification>

        <nve-notification position="bottom">
          bottom
        </nve-notification>
        <nve-notification position="bottom" alignment="start">
          bottom start
        </nve-notification>
        <nve-notification position="bottom" alignment="end">
          bottom end
        </nve-notification>

        <nve-notification position="left">
          left
        </nve-notification>
        <nve-notification position="left" alignment="start">
          left start
        </nve-notification>
        <nve-notification position="left" alignment="end">
          left end
        </nve-notification>
      \`;
      this._shadow.appendChild(template.content);
    }
  });
</script>
  `
};

export const LegacyBehaviorTrigger = {
  render: () => html`
<nve-notification trigger="notification-btn" behavior-trigger hidden closable position="bottom" close-timeout="2000">
  <h3 nve-text="label">notification</h3>
  <p nve-text="body">some text content in a notification</p>
</nve-notification>
<nve-button id="notification-btn">show</nve-button>
`
};


export const Layers = {
  render: () => html`
<nve-button>Notification</nve-button>
<nve-button popovertarget="dialog">Dialog</nve-button>
<nve-notification-group position="bottom" alignment="end" id="group"></nve-notification-group>
<nve-dialog id="dialog" modal closable>
  <nve-dialog-header>
    <h3 nve-text="heading semibold">Notification</h3>
  </nve-dialog-header>
  <p nve-text="body">This should not cause the dialog to close</p>
</nve-dialog>

<script type="module">
  const button = document.querySelector('nve-button');
  button.addEventListener('click', () => {
    const notification = document.createElement('nve-notification');
    notification.closable = true;
    notification.status = ['warning', 'danger', 'success', 'accent', undefined][Math.floor(Math.random() * 5)];
    notification.innerHTML =
      '<h3 nve-text="label">' +
      (notification.status ?? "default") +
      '</h3><p nve-text="body">some text content in a notification</p>';
    notification.closeTimeout = 3000 * (document.querySelectorAll('nve-notification').length + 1);
    notification.addEventListener('close', () => notification.remove(), { once: true });
    notification.position = 'bottom';
    notification.alignment = 'end';
    document.querySelector('nve-notification-group').prepend(notification);
  });
</script>
`
};