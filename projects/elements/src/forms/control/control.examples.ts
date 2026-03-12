import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/textarea/define.js';
import '@nvidia-elements/core/checkbox/define.js';

export default {
  title: 'Elements/Forms',
  component: 'nve-control'
}

/**
 * @summary Basic form control wrapper with label, input, and validation message structure.
 * @tags test-case
 */
export const Default = {
  render: () => html`
<nve-control>
  <label>label</label>
  <input />
  <nve-control-message>message</nve-control-message>
</nve-control>`
};

/**
 * @summary Responsive form controls with layout adaptation in resizable containers.
 * @tags test-case
 */
export const Responsive = {
  render: () => html`
  <div nve-layout="column gap:lg" style="padding: 12px; border: 1px solid #ccc; overflow-y: auto; resize: horizontal; max-width: 600px;">
    <nve-input layout="horizontal">
      <label>text label</label>
      <input />
      <nve-control-message>message</nve-control-message>
    </nve-input>
    <nve-select layout="horizontal">
      <label>select label</label>
      <select>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </select>
      <nve-control-message>message</nve-control-message>
    </nve-select>
    <nve-search layout="horizontal-inline">
      <label>search label</label>
      <input type="search" placeholder="search" />
    </nve-search>
    <nve-checkbox-group layout="horizontal-inline">
      <label>checkbox label</label>
      <nve-checkbox>
        <label>local</label>
        <input type="checkbox" name="checkbox-group" value="1" checked />
      </nve-checkbox>
      <nve-checkbox>
        <label>staging</label>
        <input type="checkbox" name="checkbox-group" value="2" />
      </nve-checkbox>
      <nve-checkbox>
        <label>production</label>
        <input type="checkbox" name="checkbox-group" value="3" />
      </nve-checkbox>
      <nve-control-message>message</nve-control-message>
    </nve-checkbox-group>
    <nve-range layout="horizontal-inline">
      <label>label</label>
      <input type="range" />
      <nve-control-message>message</nve-control-message>
    </nve-range>
    <nve-textarea layout="horizontal-inline">
      <label>label</label>
      <textarea></textarea>
    </nve-textarea>
  </div>
  `
};

/**
 * @summary All control and control-group layout variations (vertical, horizontal, inline) with visual debugging.
 * @tags test-case
 */
export const Layout = {
  render: () => html`
<style>
  #control-layout {
    display: flex;
    gap: 48px;
    flex-direction: column;
    min-width: 300px;

    nve-control {
      outline: 1px solid red;
    }

    nve-control-group {
      outline: 1px solid blue;
    }
  }
</style>
<div id="control-layout">
  <nve-control>
    <label>vertical</label>
    <input />
  </nve-control>

  <nve-control>
    <label>vertical</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-control>

  <nve-control layout="horizontal">
    <label>horizontal</label>
    <input />
  </nve-control>

  <nve-control layout="horizontal">
    <label>horizontal</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-control>

  <nve-control-group layout="vertical">
    <label>vertical</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
    <nve-control-message>message</nve-control-message>
  </nve-control-group>

  <nve-control-group layout="vertical">
    <label>vertical</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
  </nve-control-group>

  <nve-control-group layout="vertical-inline">
    <label>vertical-inline</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
    <nve-control-message>message</nve-control-message>
  </nve-control-group>

  <nve-control-group layout="vertical-inline">
    <label>vertical-inline</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
  </nve-control-group>

  <nve-control-group layout="horizontal">
    <label>horizontal</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
    <nve-control-message>message</nve-control-message>
  </nve-control-group>

  <nve-control-group layout="horizontal">
    <label>horizontal</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
  </nve-control-group>

  <nve-control-group layout="horizontal-inline">
    <label>horizontal-inline</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
    <nve-control-message>message</nve-control-message>
  </nve-control-group>

  <nve-control-group layout="horizontal-inline">
    <label>horizontal-inline</label>
    <nve-control>
      <label>local</label>
      <input type="checkbox" name="checkbox-group" value="1" checked />
    </nve-control>
    <nve-control>
      <label>staging</label>
      <input type="checkbox" name="checkbox-group" value="2" />
    </nve-control>
    <nve-control>
      <label>production</label>
      <input type="checkbox" name="checkbox-group" value="3" />
    </nve-control>
  </nve-control-group>
</div>`
};

/**
 * @summary Form control with HTML5 validation showing required field error messaging.
 * @tags test-case
 */
export const RequiredField = {
  render: () => html`
<nve-control>
  <label>validation</label>
  <input required />
  <nve-control-message>message</nve-control-message>
  <nve-control-message error="valueMissing">required</nve-control-message>
</nve-control>`
};

/**
 * @summary Form control without visible label using aria-label for accessibility in compact layouts.
 * @tags test-case
 */
export const NoLabelControl = {
  render: () => html`
<nve-control>
  <input type="search" aria-label="search" placeholder="search" />
</nve-control>`
};

/**
 * @summary Inline control layout with checkbox positioned before its label for toggle-style inputs.
 * @tags test-case
 */
export const InlineControl = {
  render: () => html`
<nve-control>
  <label>enable logging</label>
  <input type="checkbox" checked />
</nve-control>`
};

/**
 * @summary Control group organizing related radio buttons and checkboxes with shared label and messaging.
 * @tags test-case
 */
export const Group = {
  render: () => html`
<nve-control-group>
  <label>environment</label>
  <nve-control>
    <label>local</label>
    <input type="radio" name="radio-group" value="1" checked />
  </nve-control>
  <nve-control>
    <label>staging</label>
    <input type="radio" name="radio-group" value="2" />
  </nve-control>
  <nve-control>
    <label>production</label>
    <input type="radio" name="radio-group" value="3" />
  </nve-control>
  <nve-control-message>message</nve-control-message>
</nve-control-group>

<br />

<nve-control-group>
  <label>environment</label>
  <nve-control>
    <label>local</label>
    <input type="checkbox" name="checkbox-group" value="1" checked />
  </nve-control>
  <nve-control>
    <label>staging</label>
    <input type="checkbox" name="checkbox-group" value="2" />
  </nve-control>
  <nve-control>
    <label>production</label>
    <input type="checkbox" name="checkbox-group" value="3" />
  </nve-control>
  <nve-control-message>message</nve-control-message>
</nve-control-group>
`
};

/**
 * @summary Form control wrapping a native date input with label and message support.
 * @tags test-case
 */
export const DateControl = {
  render: () => html`
<nve-control>
  <label>date</label>
  <input type="date" />
  <nve-control-message>message</nve-control-message>
</nve-control>`
};

/**
 * @summary Form control wrapping a textarea element for multi-line text input.
 * @tags test-case
 */
export const TextareaControl = {
  render: () => html`
<nve-control>
  <label>about</label>
  <textarea></textarea>
  <nve-control-message>message</nve-control-message>
</nve-control>`
};

/**
 * @summary Form control with datalist providing autocomplete suggestions for search input.
 * @tags test-case
 */
export const Datalist = {
  render: () => html`
<nve-control>
  <label>search</label>
  <input type="search" />
  <datalist>
    <option value="option 1"></option>
    <option value="option 2"></option>
    <option value="option 3"></option>
  </datalist>
</nve-control>`
};

/**
 * @summary Form controls showing all status states (default, disabled, success, error) for validation feedback.
 * @tags test-case
 */
export const Status = {
  render: () => html`
<div nve-layout="column gap:md">
  <nve-control>
    <label>label</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-control>

  <nve-control>
    <label>disabled</label>
    <input disabled />
    <nve-control-message>message</nve-control-message>
  </nve-control>

  <nve-control>
    <label>success</label>
    <input />
    <nve-control-message status="success">message</nve-control-message>
  </nve-control>

  <nve-control>
    <label>error</label>
    <input />
    <nve-control-message status="error">message</nve-control-message>
  </nve-control>
</div>`
};
