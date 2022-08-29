import { html } from 'lit';
import '@elements/elements/select/define.js';

export default {
  title: 'Forms/Select/Examples',
  component: 'mlv-select',
  parameters: { badges: ['beta'] }
};

export const Select = {
  render: () => html`
<mlv-select>
  <label>label</label>
  <select>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
  <mlv-control-message>message</mlv-control-message>
</mlv-select>`
};

export const Vertical = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-select>
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-select>
    <label>disabled</label>
    <select disabled>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-select>
    <label>success</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-select>

  <mlv-select>
    <label>error</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-select>
</div>`
};

export const Horizontal = {
  render: () => html`
<div mlv-layout="column gap:lg align:stretch">
  <mlv-select layout="horizontal">
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-select layout="horizontal">
    <label>disabled</label>
    <select disabled>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-select layout="horizontal">
    <label>success</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message status="success">message</mlv-control-message>
  </mlv-select>

  <mlv-select layout="horizontal">
    <label>error</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message status="error">message</mlv-control-message>
  </mlv-select>
</div>`
};

export const Multiple = {
  render: () => html`
<mlv-select>
  <label>label</label>
  <select multiple>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
    <option value="3">Option 3</option>
    <option value="4">Option 4</option>
    <option value="5">Option 5</option>
  </select>
  <mlv-control-message>message</mlv-control-message>
</mlv-select>`
};

export const Size = {
  render: () => html`
<mlv-select>
  <label>label</label>
  <select size="3">
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
    <option value="4">Option 4</option>
    <option value="5">Option 5</option>
  </select>
  <mlv-control-message>message</mlv-control-message>
</mlv-select>`
};