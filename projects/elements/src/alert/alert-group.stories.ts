import { html } from 'lit';
import { AlertGroup } from '@elements/elements/alert';
import '@elements/elements/alert/define.js';
import '@elements/elements/button/define.js';

export default {
  title: 'Elements/Alert Group/Examples',
  component: 'mlv-alert-group',
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
    <mlv-alert-group .status=${args.status}>
      <mlv-alert>alert message</mlv-alert>
    </mlv-alert-group>
    `,
    args: { status: undefined }
};

export const Status = {
  render: () => html`
    <div mlv-layout="column gap:md">
      <mlv-alert-group>
        <mlv-alert>default</mlv-alert>
        <mlv-alert>default</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="accent">
        <mlv-alert>default</mlv-alert>
        <mlv-alert>default</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="warning">
        <mlv-alert>warning</mlv-alert>
        <mlv-alert>warning</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="success">
        <mlv-alert>success</mlv-alert>
        <mlv-alert>success</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="danger">
        <mlv-alert>danger</mlv-alert>
        <mlv-alert>danger</mlv-alert>
      </mlv-alert-group>
    </div>
  `
}

export const Closable = {
  render: () => html`
    <div mlv-layout="column gap:md">
      <mlv-alert-group>
        <mlv-alert closable>default</mlv-alert>
        <mlv-alert closable>default</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="accent">
        <mlv-alert closable>accent</mlv-alert>
        <mlv-alert closable>accent</mlv-alert>
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
    </div>
  `
}

export const Actions = {
  render: () => html`
  <div mlv-layout="column gap:md">
    <mlv-alert-group>
      <mlv-alert>
        default <mlv-button slot="actions" interaction="ghost">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
    <mlv-alert-group status="accent">
      <mlv-alert>
        accent <mlv-button slot="actions" interaction="ghost">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
    <mlv-alert-group status="warning">
      <mlv-alert>
        warning <mlv-button slot="actions" interaction="ghost">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
    <mlv-alert-group status="success">
      <mlv-alert>
        success <mlv-button slot="actions" interaction="ghost">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
    <mlv-alert-group status="danger">
      <mlv-alert>
        danger <mlv-button slot="actions" interaction="ghost">action</mlv-button>
      </mlv-alert>
    </mlv-alert-group>
  </div>
  `
}

export const Themes = {
  render: () => html`
    <div mlv-theme="root light" mlv-layout="column gap:md pad:md">
      <mlv-alert-group>
        <mlv-alert>default</mlv-alert>
        <mlv-alert>default</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="accent">
        <mlv-alert>accent</mlv-alert>
        <mlv-alert>accent</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="warning">
        <mlv-alert>warning</mlv-alert>
        <mlv-alert>warning</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="success">
        <mlv-alert>success</mlv-alert>
        <mlv-alert>success</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="danger">
        <mlv-alert>danger</mlv-alert>
        <mlv-alert>danger</mlv-alert>
      </mlv-alert-group>
    </div>
    <div mlv-theme="root dark" mlv-layout="column gap:md pad:md">
      <mlv-alert-group>
        <mlv-alert>default</mlv-alert>
        <mlv-alert>default</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="accent">
        <mlv-alert>accent</mlv-alert>
        <mlv-alert>accent</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="warning">
        <mlv-alert>warning</mlv-alert>
        <mlv-alert>warning</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="success">
        <mlv-alert>success</mlv-alert>
        <mlv-alert>success</mlv-alert>
      </mlv-alert-group>

      <mlv-alert-group status="danger">
        <mlv-alert>danger</mlv-alert>
        <mlv-alert>danger</mlv-alert>
      </mlv-alert-group>
    </div>
  `
}
