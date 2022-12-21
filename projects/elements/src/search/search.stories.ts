import { html } from 'lit';
import '@elements/elements/forms/define.js';
import '@elements/elements/search/define.js';

export default {
  title: 'Elements/Search/Examples',
  component: 'mlv-search',
  parameters: { badges: ['alpha'] }
};

export const Search = {
  render: () => html`
<mlv-search>
  <label>label</label>
  <input type="search" />
  <mlv-control-message>message</mlv-control-message>
</mlv-search>`
};

export const Inline = {
  render: () => html`
<mlv-search rounded>
  <input type="search" aria-label="search" placeholder="search" />
</mlv-search>`
};

export const Datalist = () => {
  return html`
<mlv-search rounded>
  <input type="search" aria-label="search" placeholder="search" />
  <datalist>
    <option value="search result 1"></option>
    <option value="search result 2"></option>
    <option value="search result 3"></option>
  </datalist>
</mlv-search>`;
};

export const Vertical = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-search>
    <label>label</label>
    <input type="search" placeholder="search" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-search>

  <mlv-search>
    <label>disabled</label>
    <input type="search" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-search>

  <mlv-search>
    <label>success</label>
    <input type="search" placeholder="search" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-search>

  <mlv-search>
    <label>error</label>
    <input type="search" placeholder="search" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-search>
</div>`
};

export const Horizontal = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-search layout="horizontal">
    <label>label</label>
    <input type="search" placeholder="search" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-search>

  <mlv-search layout="horizontal">
    <label>disabled</label>
    <input type="search" disabled />
    <mlv-control-message>message</mlv-control-message>
  </mlv-search>

  <mlv-search layout="horizontal">
    <label>success</label>
    <input type="search" placeholder="search" />
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-search>

  <mlv-search layout="horizontal">
    <label>error</label>
    <input type="search" placeholder="search" />
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-search>
</div>`
};
