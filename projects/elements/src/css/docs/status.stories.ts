import { html } from 'lit';
import '@elements/elements/alert/define.js';
import '@elements/elements/notification/define.js';

export default {
  title: 'Foundations/Tokens/Examples'
};

export const Status = {
  render: () => html`
    <section nve-theme="root dark" nve-layout="column gap:md">
      <div nve-layout="grid span-items:6">
        <div nve-layout="column gap:md">
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
        </div>
        <div nve-layout="column gap:md">
          <nve-alert>default</nve-alert>
          <nve-alert status="warning">warning</nve-alert>
          <nve-alert status="success">success</nve-alert>
          <nve-alert status="danger">danger</nve-alert>
        </div>
      </div>
      <nve-alert-group>
        <nve-alert closable>default</nve-alert>
        <nve-alert closable>default</nve-alert>
      </nve-alert-group>
      <nve-alert-group status="warning">
        <nve-alert closable>warning</nve-alert>
        <nve-alert closable>warning</nve-alert>
      </nve-alert-group>
      <nve-alert-group status="success">
        <nve-alert closable>success</nve-alert>
        <nve-alert closable>success</nve-alert>
      </nve-alert-group>
      <nve-alert-group status="danger">
        <nve-alert closable>danger</nve-alert>
        <nve-alert closable>danger</nve-alert>
      </nve-alert-group>
    </section>
    <section nve-theme="root light" nve-layout="column gap:md">
      <div nve-layout="grid span-items:6">
        <div nve-layout="column gap:md">
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
        </div>
        <div nve-layout="column gap:md">
          <nve-alert>default</nve-alert>
          <nve-alert status="warning">warning</nve-alert>
          <nve-alert status="success">success</nve-alert>
          <nve-alert status="danger">danger</nve-alert>
        </div>
      </div>
      <nve-alert-group>
        <nve-alert closable>default</nve-alert>
        <nve-alert closable>default</nve-alert>
      </nve-alert-group>
      <nve-alert-group status="warning">
        <nve-alert closable>warning</nve-alert>
        <nve-alert closable>warning</nve-alert>
      </nve-alert-group>
      <nve-alert-group status="success">
        <nve-alert closable>success</nve-alert>
        <nve-alert closable>success</nve-alert>
      </nve-alert-group>
      <nve-alert-group status="danger">
        <nve-alert closable>danger</nve-alert>
        <nve-alert closable>danger</nve-alert>
      </nve-alert-group>
    </section>
  `
}
