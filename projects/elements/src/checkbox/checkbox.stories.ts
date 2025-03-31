import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/checkbox/define.js';

export default {
  title: 'Elements/Checkbox/Examples',
  component: 'nve-checkbox',
};

export const Default = () => {
  return html`
<nve-checkbox-group>
  <nve-checkbox>
    <label>checkbox 1</label>
    <input type="checkbox" checked />
  </nve-checkbox>
  <nve-checkbox>
    <label>checkbox 2</label>
    <input type="checkbox" />
  </nve-checkbox>
  <nve-checkbox>
    <label>checkbox 3</label>
    <input type="checkbox" />
  </nve-checkbox>
</nve-checkbox-group>`
};

export const States = () => {
  return html`
<div nve-layout="column gap:lg align:stretch">
  <nve-checkbox>
    <label>label</label>
    <input type="checkbox" />
    <nve-control-message>message</nve-control-message>
  </nve-checkbox>

  <nve-checkbox>
    <label>disabled</label>
    <input type="checkbox" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-checkbox>

  <nve-checkbox>
    <label>success</label>
    <input type="checkbox" />
    <nve-control-message status="success">message</nve-control-message>
  </nve-checkbox>

  <nve-checkbox>
    <label>error</label>
    <input type="checkbox" />
    <nve-control-message status="error">message</nve-control-message>
  </nve-checkbox>
</div>`
};

export const VerticalGroup = () => {
  return html`
<div nve-layout="column gap:lg align:stretch">
  <nve-checkbox-group>
    <label>label</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message>message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group>
    <label>disabled</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" disabled />
    </nve-checkbox>
    <nve-control-message>disabled message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group>
    <label>success</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group>
    <label>error</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-checkbox-group>
</div>
`
};

export const VerticalInlineGroup = () => {
  return html`
<div nve-layout="column gap:lg align:stretch">
  <nve-checkbox-group layout="vertical-inline">
    <label>label</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message>message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="vertical-inline">
    <label>disabled</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" disabled />
    </nve-checkbox>
    <nve-control-message>disabled message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="vertical-inline">
    <label>success</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="vertical-inline">
    <label>error</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-checkbox-group>
</div>
`
};

export const HorizontalGroup = () => {
  return html`
<div nve-layout="column gap:lg align:stretch">
  <nve-checkbox-group layout="horizontal">
    <label>label</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message>message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="horizontal">
    <label>disabled</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" disabled />
    </nve-checkbox>
    <nve-control-message>disabled message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="horizontal">
    <label>success</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="horizontal">
    <label>error</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-checkbox-group>
</div>
`
};

export const HorizontalInlineGroup = () => {
  return html`
<div nve-layout="column gap:lg align:stretch">
  <nve-checkbox-group layout="horizontal-inline">
    <label>label</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message>message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="horizontal-inline">
    <label>disabled</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" disabled />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" disabled />
    </nve-checkbox>
    <nve-control-message>disabled message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="horizontal-inline">
    <label>success</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="success">success message</nve-control-message>
  </nve-checkbox-group>

  <nve-checkbox-group layout="horizontal-inline">
    <label>error</label>
    <nve-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </nve-checkbox>

    <nve-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </nve-checkbox>
    <nve-control-message status="error">error message</nve-control-message>
  </nve-checkbox-group>
</div>
`
};


export const Indeterminate = () => {
  return html`
<nve-checkbox>
  <label>checkbox 1</label>
  <input type="checkbox" checked id="indeterminate" />
</nve-checkbox>
<script type="module">
  document.querySelector('#indeterminate').indeterminate = true;
</script>
`
};