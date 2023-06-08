import { html } from 'lit';
import { spread } from '@elements/elements/internal';
import { Notification } from '@elements/elements/notification';
import '@elements/elements/notification/define.js';
import '@elements/elements/button/define.js';


export default {
  title: 'Elements/Notification/Examples',
  component: 'mlv-notification',
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
<mlv-notification ${spread(args)}>
  <h3 mlv-text="label">Title</h3>
  <p mlv-text="body">some text content in a notification</p>
</mlv-notification>
`,
  args: { position: 'bottom', alignment: 'center', closable: true }
};

export const Content = {
  render: () => html`
<mlv-notification closable>
  <h3 mlv-text="label">Title</h3>
  <p mlv-text="body">some text content in a notification</p>
</mlv-notification>
  `
};

export const ContentWrap = {
  render: () => html`
<mlv-notification closable>
  <h3 mlv-text="label">Title</h3>
  <p mlv-text="body" style="width: 230px">some text content in a notification with some really long text in it that just keeps going...</p>
</mlv-notification>
  `
};

export const Interactive = {
  render: () => html`
<mlv-notification hidden closable position="bottom" close-timeout="2000">
  <h3 mlv-text="label">notification</h3>
  <p mlv-text="body">some text content in a notification</p>
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
    notification.innerHTML = '<h3 mlv-text="label">' + (notification.status ?? 'default') + '</h3><p mlv-text="body">some text content in a notification</p>';
    notification.closeTimeout = 2000 * (document.querySelectorAll('mlv-notification').length + 1);
    notification.addEventListener('close', () => notification.remove(), { once: true });
    document.querySelector('mlv-notification-group').prepend(notification);
  });
</script>
`
};

export const Status = {
  render: () => html`
<mlv-notification-group position="center">
  <mlv-notification closable>
    <h3 mlv-text="label">Default</h3>
    <p mlv-text="body">some text content in a notification</p>
  </mlv-notification>
  <mlv-notification status="accent" closable>
    <h3 mlv-text="label">Accent</h3>
    <p mlv-text="body">some text content in a notification</p>
  </mlv-notification>
  <mlv-notification status="success" closable>
    <h3 mlv-text="label">Success</h3>
    <p mlv-text="body">some text content in a notification</p>
  </mlv-notification>
  <mlv-notification status="warning" closable>
    <h3 mlv-text="label">Warning</h3>
    <p mlv-text="body">some text content in a notification</p>
  </mlv-notification>
  <mlv-notification status="danger" closable>
    <h3 mlv-text="label">Danger</h3>
    <p mlv-text="body">some text content in a notification</p>
  </mlv-notification>
</mlv-notification-group>
  `
};

export const Position = {
  render: () => html`
<mlv-notification-group position="bottom" alignment="end">
  <mlv-notification closable>
    <h3 mlv-text="label">Title</h3>
    <p mlv-text="body">some text content in a notification</p>
  </mlv-notification>
  <mlv-notification status="accent" closable>
    <h3 mlv-text="label">Title</h3>
    <p mlv-text="body">some text content in a notification</p>
  </mlv-notification>
  <mlv-notification status="success" closable>
    <h3 mlv-text="label">Title</h3>
    <p mlv-text="body">some text content in a notification</p>
  </mlv-notification>
  <mlv-notification status="warning" closable>
    <h3 mlv-text="label">Title</h3>
    <p mlv-text="body">some text content in a notification</p>
  </mlv-notification>
  <mlv-notification status="danger" closable>
    <h3 mlv-text="label">Title</h3>
    <p mlv-text="body">some text content in a notification</p>
  </mlv-notification>
</mlv-notification-group>
  `
};
