import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/password/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/radio/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/time/define.js';
import '@nvidia-elements/core/date/define.js';
import '@nvidia-elements/core/color/define.js';
import '@nvidia-elements/core/datetime/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/switch/define.js';
import '@nvidia-elements/core/week/define.js';
import '@nvidia-elements/core/file/define.js';
import '@nvidia-elements/core/month/define.js';
import '@nvidia-elements/core/textarea/define.js';

export default {
  title: 'Elements/Forms'
}

export const KitchenSink = {
  render: () => html`
<div style="display: grid; gap: 36px 48px; grid-template-columns: 1fr 1fr; max-width: 1400px;">
    <nve-input layout="vertical-inline">
      <label>text label</label>
      <input />
      <nve-control-message>message</nve-control-message>
    </nve-input>

    <nve-search layout="vertical-inline">
      <label>search label</label>
      <input type="search" placeholder="search" />
      <nve-control-message>message</nve-control-message>
    </nve-search>

    <nve-password layout="vertical-inline">
      <label>password label</label>
      <input type="password" value="123456" autocomplete="off" />
      <nve-control-message>message</nve-control-message>
    </nve-password>

    <nve-select layout="vertical-inline">
      <label>select label</label>
      <select>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </select>
      <nve-control-message>message</nve-control-message>
    </nve-select>

    <nve-date layout="vertical-inline">
      <label>date label</label>
      <input type="date" />
      <nve-control-message>message</nve-control-message>
    </nve-date>

    <nve-datetime layout="vertical-inline">
      <label>datetime label</label>
      <input type="datetime-local" />
      <nve-control-message>message</nve-control-message>
    </nve-datetime>

    <nve-month layout="vertical-inline">
      <label>month label</label>
      <input type="month" />
      <nve-control-message>message</nve-control-message>
    </nve-month>

    <nve-week layout="vertical-inline">
      <label>week label</label>
      <input type="week" />
      <nve-control-message>message</nve-control-message>
    </nve-week>

    <nve-time layout="vertical-inline">
      <label>time label</label>
      <input type="time" />
      <nve-control-message>message</nve-control-message>
    </nve-time>

    <nve-color layout="vertical-inline">
      <label>color label</label>
      <input type="color" />
      <nve-control-message>message</nve-control-message>
    </nve-color>

    <nve-input layout="vertical-inline">
      <label>prefix/suffix label</label>
      <nve-button container="flat" readonly>https://</nve-button>
      <input type="text" />
      <nve-button container="flat" readonly>.com</nve-button>
      <nve-control-message>message</nve-control-message>
    </nve-input>

    <nve-input layout="vertical-inline">
      <label>actions label</label>
      <nve-icon-button icon-name="search" container="flat" readonly></nve-icon-button>
      <input type="text" />
      <nve-icon-button icon-name="cancel" container="flat" aria-label="clear"></nve-icon-button>
      <nve-control-message>message</nve-control-message>
    </nve-input>

    <nve-input-group layout="vertical-inline">
      <label>date range</label>
      <nve-date>
        <input type="date" aria-label="start date" value="2018-07-22" />
      </nve-date>
      <nve-date>
        <input type="date" aria-label="end date" value="2022-07-22" />
      </nve-date>
      <nve-control-message>message</nve-control-message>
    </nve-input-group>

    <nve-input-group layout="vertical-inline">
      <label>domain</label>
      <nve-select style="width: 120px">
        <select aria-label="protocol">
          <option>https://</option>
          <option>http://</option>
        </select>
      </nve-select>
      <nve-input>
        <input placeholder="example" aria-label="host" />
        <nve-button container="flat" readonly="">.com</nve-button>
      </nve-input>
      <nve-control-message>Host ID: 123456</nve-control-message>
    </nve-input-group>

    <nve-range layout="vertical-inline">
      <label>range label</label>
      <input type="range" />
      <nve-control-message>message</nve-control-message>
    </nve-range>

    <nve-checkbox-group layout="vertical-inline">
      <label>checkbox group label</label>
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

    <nve-radio-group layout="vertical-inline">
      <label>radio group label</label>
      <nve-radio>
        <label>radio 1</label>
        <input type="radio" checked />
      </nve-radio>

      <nve-radio>
        <label>radio 2</label>
        <input type="radio" />
      </nve-radio>

      <nve-radio>
        <label>radio 3</label>
        <input type="radio" />
      </nve-radio>
      <nve-control-message>message</nve-control-message>
    </nve-radio-group>

    <nve-switch-group layout="vertical-inline">
      <label>switch group label</label>
      <nve-switch>
        <label>switch 1</label>
        <input type="checkbox" />
      </nve-switch>

      <nve-switch>
        <label>switch 2</label>
        <input type="checkbox" checked />
      </nve-switch>
      <nve-control-message>message</nve-control-message>
    </nve-switch-group>

    <nve-select layout="vertical-inline">
      <label>select multiple label</label>
      <select multiple>
        <option value="1">Option 1</option>
        <option selected value="2">Option 2</option>
        <option selected value="3">Option 3</option>
        <option selected value="3">Option 3</option>
        <option value="4">Option 4</option>
        <option value="5">Option 5</option>
      </select>
      <nve-control-message>message</nve-control-message>
    </nve-select>

    <nve-textarea layout="vertical-inline">
      <label>textarea label</label>
      <textarea></textarea>
      <nve-control-message>message</nve-control-message>
    </nve-textarea>

    <nve-file>
      <label>file label</label>
      <input type="file" />
      <nve-control-message>message</nve-control-message>
    </nve-file>

    <nve-search rounded>
      <input type="search" aria-label="search" placeholder="search" />
      <datalist>
        <option value="search result 1"></option>
        <option value="search result 2"></option>
        <option value="search result 3"></option>
      </datalist>
    </nve-search>

    <nve-input layout="vertical-inline">
      <label>disabled</label>
      <input disabled />
      <nve-control-message>message</nve-control-message>
    </nve-input>

    <nve-input layout="vertical-inline">
      <label>success</label>
      <input />
      <nve-control-message status="success">message</nve-control-message>
    </nve-input>

    <nve-input layout="vertical-inline">
      <label>error</label>
      <input />
      <nve-control-message status="error">message</nve-control-message>
    </nve-input>
</div>
  `
}

export const Vertical = () => {
  return html`
<div nve-layout="column gap:lg">
  <nve-input>
    <label>text label</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-search>
    <label>search label</label>
    <input type="search" placeholder="search" />
    <nve-control-message>message</nve-control-message>
  </nve-search>

  <nve-password>
    <label>password label</label>
    <input type="password" value="123456" autocomplete="off" />
    <nve-control-message>message</nve-control-message>
  </nve-password>

  <nve-select>
    <label>select label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-range>
    <label>range label</label>
    <input type="range" />
    <nve-control-message>message</nve-control-message>
  </nve-range>

  <nve-checkbox-group>
    <label>checkbox group label</label>
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

  <nve-radio-group>
    <label>radio group label</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message>message</nve-control-message>
  </nve-radio-group>

  <nve-switch-group>
    <label>switch group label</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" checked />
    </nve-switch>
    <nve-control-message>message</nve-control-message>
  </nve-switch-group>

  <nve-select>
    <label>select multiple label</label>
    <select multiple>
      <option value="1">Option 1</option>
      <option selected value="2">Option 2</option>
      <option selected value="3">Option 3</option>
      <option selected value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-textarea>
    <label>textarea label</label>
    <textarea></textarea>
    <nve-control-message>message</nve-control-message>
  </nve-textarea>
</div>
  `;
};

export const VerticalInline = () => {
  return html`
<div nve-layout="column gap:lg">
  <nve-input layout="vertical-inline">
    <label>text label</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-search layout="vertical-inline">
    <label>search label</label>
    <input type="search" placeholder="search" />
    <nve-control-message>message</nve-control-message>
  </nve-search>

  <nve-password layout="vertical-inline">
    <label>password label</label>
    <input type="password" value="123456" autocomplete="off" />
    <nve-control-message>message</nve-control-message>
  </nve-password>

  <nve-select layout="vertical-inline">
    <label>select label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-range layout="vertical-inline">
    <label>range label</label>
    <input type="range" />
    <nve-control-message>message</nve-control-message>
  </nve-range>

  <nve-checkbox-group layout="vertical-inline">
    <label>checkbox group label</label>
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

  <nve-radio-group layout="vertical-inline">
    <label>radio group label</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message>message</nve-control-message>
  </nve-radio-group>

  <nve-switch-group layout="vertical-inline">
    <label>switch group label</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" checked />
    </nve-switch>
    <nve-control-message>message</nve-control-message>
  </nve-switch-group>

  <nve-select layout="vertical-inline">
    <label>select multiple label</label>
    <select multiple>
      <option value="1">Option 1</option>
      <option selected value="2">Option 2</option>
      <option selected value="3">Option 3</option>
      <option selected value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-textarea layout="vertical-inline">
    <label>textarea label</label>
    <textarea></textarea>
    <nve-control-message>message</nve-control-message>
  </nve-textarea>
</div>
  `;
};

export const Horizontal = () => {
  return html`
<div nve-layout="column gap:lg">
  <nve-input layout="horizontal">
    <label>text label</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-search layout="horizontal">
    <label>search label</label>
    <input type="search" placeholder="search" />
    <nve-control-message>message</nve-control-message>
  </nve-search>

  <nve-password layout="horizontal">
    <label>password label</label>
    <input type="password" value="123456" autocomplete="off" />
    <nve-control-message>message</nve-control-message>
  </nve-password>

  <nve-select layout="horizontal">
    <label>select label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-range layout="horizontal">
    <label>range label</label>
    <input type="range" />
    <nve-control-message>message</nve-control-message>
  </nve-range>

  <nve-checkbox-group layout="horizontal">
    <label>checkbox group label</label>
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

  <nve-radio-group layout="horizontal">
    <label>radio group label</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message>message</nve-control-message>
  </nve-radio-group>

  <nve-switch-group layout="horizontal">
    <label>switch group label</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" checked />
    </nve-switch>
    <nve-control-message>message</nve-control-message>
  </nve-switch-group>

  <nve-select layout="horizontal">
    <label>select multiple label</label>
    <select multiple>
      <option value="1">Option 1</option>
      <option selected value="2">Option 2</option>
      <option selected value="3">Option 3</option>
      <option selected value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-textarea layout="horizontal">
    <label>textarea label</label>
    <textarea></textarea>
    <nve-control-message>message</nve-control-message>
  </nve-textarea>
</div>
  `;
};

export const HorizontalInline = () => {
  return html`
<div nve-layout="column gap:lg">
  <nve-input layout="horizontal-inline">
    <label>text label</label>
    <input />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-search layout="horizontal-inline">
    <label>search label</label>
    <input type="search" placeholder="search" />
    <nve-control-message>message</nve-control-message>
  </nve-search>

  <nve-password layout="horizontal-inline">
    <label>password label</label>
    <input type="password" value="123456" autocomplete="off" />
    <nve-control-message>message</nve-control-message>
  </nve-password>

  <nve-select layout="horizontal-inline">
    <label>select label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-range layout="horizontal-inline">
    <label>range label</label>
    <input type="range" />
    <nve-control-message>message</nve-control-message>
  </nve-range>

  <nve-checkbox-group layout="horizontal-inline">
    <label>checkbox group label</label>
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

  <nve-radio-group layout="horizontal-inline">
    <label>radio group label</label>
    <nve-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </nve-radio>

    <nve-radio>
      <label>radio 2</label>
      <input type="radio" />
    </nve-radio>

    <nve-radio>
      <label>radio 3</label>
      <input type="radio" />
    </nve-radio>
    <nve-control-message>message</nve-control-message>
  </nve-radio-group>

  <nve-switch-group layout="horizontal-inline">
    <label>switch group label</label>
    <nve-switch>
      <label>switch 1</label>
      <input type="checkbox" />
    </nve-switch>

    <nve-switch>
      <label>switch 2</label>
      <input type="checkbox" checked />
    </nve-switch>
    <nve-control-message>message</nve-control-message>
  </nve-switch-group>

  <nve-select layout="horizontal-inline">
    <label>select multiple label</label>
    <select multiple>
      <option value="1">Option 1</option>
      <option selected value="2">Option 2</option>
      <option selected value="3">Option 3</option>
      <option selected value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-textarea layout="horizontal-inline">
    <label>textarea label</label>
    <textarea></textarea>
    <nve-control-message>message</nve-control-message>
  </nve-textarea>
</div>
  `;
};


export const FitText = {
  render: () => html`
<section nve-layout="column gap:md">
  <nve-date fit-text>
    <label>date</label>
    <input type="date" value="2017-06-01" />
    <nve-control-message>message</nve-control-message>
  </nve-date>

  <nve-input fit-text>
    <label>label</label>
    <input value="123456789012345678901234567890" />
    <nve-control-message>message</nve-control-message>
  </nve-input>

  <nve-select fit-text>
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 1234</option>
      <option value="3">Option 1234567809</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>
</section>
`
};
