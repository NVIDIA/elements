import { html } from 'lit';
import { AlertGroup } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';

export default {
  title: 'Elements/Alert Group/Examples',
  component: 'nve-alert-group',
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
    <nve-alert-group .status=${args.status}>
      <nve-alert>alert message</nve-alert>
    </nve-alert-group>
    `,
    args: { status: undefined }
};

export const Status = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-alert-group>
        <nve-alert>default</nve-alert>
        <nve-alert>default</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="accent">
        <nve-alert>default</nve-alert>
        <nve-alert>default</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning">
        <nve-alert>warning</nve-alert>
        <nve-alert>warning</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success">
        <nve-alert>success</nve-alert>
        <nve-alert>success</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger">
        <nve-alert>danger</nve-alert>
        <nve-alert>danger</nve-alert>
      </nve-alert-group>
    </div>
  `
}

export const Closable = {
  render: () => html`
    <div nve-layout="column gap:md">
      <nve-alert-group>
        <nve-alert closable>default</nve-alert>
        <nve-alert closable>default</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="accent">
        <nve-alert closable>accent</nve-alert>
        <nve-alert closable>accent</nve-alert>
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
    </div>
  `
}

export const Actions = {
  render: () => html`
  <div nve-layout="column gap:md">
    <nve-alert-group>
      <nve-alert>
        default <nve-button slot="actions" interaction="ghost">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="accent">
      <nve-alert>
        accent <nve-button slot="actions" interaction="ghost">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="warning">
      <nve-alert>
        warning <nve-button slot="actions" interaction="ghost">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="success">
      <nve-alert>
        success <nve-button slot="actions" interaction="ghost">action</nve-button>
      </nve-alert>
    </nve-alert-group>
    <nve-alert-group status="danger">
      <nve-alert>
        danger <nve-button slot="actions" interaction="ghost">action</nve-button>
      </nve-alert>
    </nve-alert-group>
  </div>
  `
}

export const Themes = {
  render: () => html`
    <div nve-theme="root light" nve-layout="column gap:md pad:md">
      <nve-alert-group>
        <nve-alert>default</nve-alert>
        <nve-alert>default</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="accent">
        <nve-alert>accent</nve-alert>
        <nve-alert>accent</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning">
        <nve-alert>warning</nve-alert>
        <nve-alert>warning</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success">
        <nve-alert>success</nve-alert>
        <nve-alert>success</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger">
        <nve-alert>danger</nve-alert>
        <nve-alert>danger</nve-alert>
      </nve-alert-group>
    </div>
    <div nve-theme="root dark" nve-layout="column gap:md pad:md">
      <nve-alert-group>
        <nve-alert>default</nve-alert>
        <nve-alert>default</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="accent">
        <nve-alert>accent</nve-alert>
        <nve-alert>accent</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="warning">
        <nve-alert>warning</nve-alert>
        <nve-alert>warning</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="success">
        <nve-alert>success</nve-alert>
        <nve-alert>success</nve-alert>
      </nve-alert-group>

      <nve-alert-group status="danger">
        <nve-alert>danger</nve-alert>
        <nve-alert>danger</nve-alert>
      </nve-alert-group>
    </div>
  `
}
