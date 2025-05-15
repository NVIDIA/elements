import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/search/define.js';

export default {
  title: 'Elements/Search',
  component: 'nve-search',
};

export const Default = {
  render: () => html`
<nve-search>
  <label>label</label>
  <input type="search" />
  <nve-control-message>message</nve-control-message>
</nve-search>`
};

export const Inline = {
  render: () => html`
<nve-search rounded>
  <input type="search" aria-label="search" placeholder="search" />
</nve-search>`
};

export const Datalist = () => {
  return html`
<nve-search rounded>
  <input type="search" aria-label="search" placeholder="search" />
  <datalist>
    <option value="search result 1"></option>
    <option value="search result 2"></option>
    <option value="search result 3"></option>
  </datalist>
</nve-search>`;
};

export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-search>
    <label>label</label>
    <input type="search" placeholder="search" />
    <nve-control-message>message</nve-control-message>
  </nve-search>

  <nve-search>
    <label>disabled</label>
    <input type="search" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-search>

  <nve-search>
    <label>success</label>
    <input type="search" placeholder="search" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-search>

  <nve-search>
    <label>error</label>
    <input type="search" placeholder="search" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-search>
</div>`
};

export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-search layout="horizontal">
    <label>label</label>
    <input type="search" placeholder="search" />
    <nve-control-message>message</nve-control-message>
  </nve-search>

  <nve-search layout="horizontal">
    <label>disabled</label>
    <input type="search" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-search>

  <nve-search layout="horizontal">
    <label>success</label>
    <input type="search" placeholder="search" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-search>

  <nve-search layout="horizontal">
    <label>error</label>
    <input type="search" placeholder="search" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-search>
</div>`
};
