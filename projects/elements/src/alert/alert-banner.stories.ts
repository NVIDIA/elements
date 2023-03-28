import { html } from 'lit';
import { AlertGroup } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

export default {
  title: 'Elements/Alert Banner/Examples',
  component: 'nve-alert-banner',
  parameters: { badges: ['alpha'] },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['', 'accent', 'warning', 'danger', 'success']
    }
  }
};

type ArgTypes = AlertGroup;

export const Default = {
  render: (args: ArgTypes) =>
    html`
<nve-alert-banner .status=${args.status}>
  <nve-alert closable>
    <span slot="prefix">default</span> banner message
  </nve-alert>
</nve-alert-banner>
    `,
    args: { status: undefined }
};

export const Status = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-alert-banner>
    <nve-alert closable>
      <span slot="prefix">default</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="accent">
    <nve-alert closable>
      <span slot="prefix">accent</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="warning">
    <nve-alert closable>
      <span slot="prefix">warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="success">
    <nve-alert closable>
      <span slot="prefix">success</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="danger">
    <nve-alert closable>
      <span slot="prefix">danger</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>
</div>
  `
}

export const LightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="column gap:md pad:md">
  <nve-alert-banner>
    <nve-alert closable>
      <span slot="prefix">default</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="accent">
    <nve-alert closable>
      <span slot="prefix">accent</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="warning">
    <nve-alert closable>
      <span slot="prefix">warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="success">
    <nve-alert closable>
      <span slot="prefix">success</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="danger">
    <nve-alert closable>
      <span slot="prefix">danger</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="column gap:md pad:md">
<nve-alert-banner>
    <nve-alert closable>
      <span slot="prefix">default</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="accent">
    <nve-alert closable>
      <span slot="prefix">accent</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="warning">
    <nve-alert closable>
      <span slot="prefix">warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="success">
    <nve-alert closable>
      <span slot="prefix">success</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="danger">
    <nve-alert closable>
      <span slot="prefix">danger</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>
</div>
  `
}