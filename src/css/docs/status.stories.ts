import { html } from 'lit';

export default {
  title: 'Foundations/Tokens/Examples'
};

export const Status = {
  render: () => html`
    <section mlv-theme="root dark" mlv-layout="column gap:md">
      <div mlv-layout="grid span-items:6">
        <div mlv-layout="column gap:md">
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
        </div>
        <div mlv-layout="column gap:md">
          <mlv-alert>default</mlv-alert>
          <mlv-alert status="warning">warning</mlv-alert>
          <mlv-alert status="success">success</mlv-alert>
          <mlv-alert status="danger">danger</mlv-alert>
        </div>
      </div>
      <mlv-alert-group>
        <mlv-alert closable>default</mlv-alert>
        <mlv-alert closable>default</mlv-alert>
      </mlv-alert-group>
      <mlv-alert-group status="warning">
        <mlv-alert closable>warning</mlv-alert>
        <mlv-alert closable>warning</mlv-alert>
      </mlv-alert-group>
      <mlv-alert-group status="success">
        <mlv-alert closable>success</mlv-alert>
        <mlv-alert closable>success</mlv-alert>
      </mlv-alert-group>
      <mlv-alert-group status="danger">
        <mlv-alert closable>danger</mlv-alert>
        <mlv-alert closable>danger</mlv-alert>
      </mlv-alert-group>
    </section>
    <section mlv-theme="root light" mlv-layout="column gap:md">
      <div mlv-layout="grid span-items:6">
        <div mlv-layout="column gap:md">
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
        </div>
        <div mlv-layout="column gap:md">
          <mlv-alert>default</mlv-alert>
          <mlv-alert status="warning">warning</mlv-alert>
          <mlv-alert status="success">success</mlv-alert>
          <mlv-alert status="danger">danger</mlv-alert>
        </div>
      </div>
      <mlv-alert-group>
        <mlv-alert closable>default</mlv-alert>
        <mlv-alert closable>default</mlv-alert>
      </mlv-alert-group>
      <mlv-alert-group status="warning">
        <mlv-alert closable>warning</mlv-alert>
        <mlv-alert closable>warning</mlv-alert>
      </mlv-alert-group>
      <mlv-alert-group status="success">
        <mlv-alert closable>success</mlv-alert>
        <mlv-alert closable>success</mlv-alert>
      </mlv-alert-group>
      <mlv-alert-group status="danger">
        <mlv-alert closable>danger</mlv-alert>
        <mlv-alert closable>danger</mlv-alert>
      </mlv-alert-group>
    </section>
  `
}
