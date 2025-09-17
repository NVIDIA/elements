import { html } from 'lit';
import '@nvidia-elements/core/alert/define.js';

/* eslint-disable @nvidia-elements/lint/no-deprecated-tags */

export default {
  title: 'Deprecated/Alert Banner',
  component: 'nve-alert-banner'
};

export const Default = {
  render: () =>
    html`
<nve-alert-banner>
  <nve-alert closable>
    <span slot="prefix">Standard</span> banner message
  </nve-alert>
</nve-alert-banner>
    `
};

export const Status = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-alert-banner>
    <nve-alert closable>
      <span slot="prefix">Standard</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="accent">
    <nve-alert closable>
      <span slot="prefix">Accent</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="warning">
    <nve-alert closable>
      <span slot="prefix">Warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="success">
    <nve-alert closable>
      <span slot="prefix">Success</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="danger">
    <nve-alert closable>
      <span slot="prefix">Danger</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
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
      <span slot="prefix">Standard</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="accent">
    <nve-alert closable>
      <span slot="prefix">Accent</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="warning">
    <nve-alert closable>
      <span slot="prefix">Warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="success">
    <nve-alert closable>
      <span slot="prefix">Success</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="danger">
    <nve-alert closable>
      <span slot="prefix">Danger</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
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
      <span slot="prefix">Standard</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="accent">
    <nve-alert closable>
      <span slot="prefix">Accent</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="warning">
    <nve-alert closable>
      <span slot="prefix">Warning</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="success">
    <nve-alert closable>
      <span slot="prefix">Success</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>

  <nve-alert-banner status="danger">
    <nve-alert closable>
      <span slot="prefix">Danger</span> banner message <a href="#" nve-text="link" slot="actions">view details</a>
    </nve-alert>
  </nve-alert-banner>
</div>
  `
}