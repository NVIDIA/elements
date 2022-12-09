import { html } from 'lit';
import { spread } from '@elements/elements/internal';
import { Notification } from '@elements/elements/notification';
import '@elements/elements/notification/define.js';


export default {
  title: 'Elements/Notification/Examples',
  component: 'nve-notification',
  parameters: { badges: ['alpha'] },
  argTypes: {
    position: {
      control: 'inline-radio',
      options: ['top', 'right', 'bottom', 'left']
    },
    alignment: {
      control: 'inline-radio',
      options: ['start', 'center', 'end']
    }
  }
};

type ArgTypes = Notification;

export const Default = {
  render: (args: ArgTypes) => html`
<nve-notification ${spread(args)}>
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
    notification.addEventListener('close', () => notification.remove(), { once: true });
    document.querySelector('nve-notification-group').prepend(notification);
    setTimeout(() => notification.remove(), 2000 * (document.querySelectorAll('nve-notification').length));
  });
</script>
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
<nve-notification-group position="bottom" alignment="end">
  <nve-notification closable>
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification status="accent" closable>
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification status="success" closable>
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification status="warning" closable>
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
  <nve-notification status="danger" closable>
    <h3 nve-text="label">Title</h3>
    <p nve-text="body">some text content in a notification</p>
  </nve-notification>
</nve-notification-group>
  `
};
