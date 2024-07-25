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
  title: 'Foundations/Forms/Examples'
}

export const KitchenSink = {
  render: () => html`
<div style="display: grid; gap: 36px 48px; grid-template-columns: 1fr 1fr; max-width: 1400px;">
    <mlv-input layout="vertical-inline">
      <label>text label</label>
      <input />
      <mlv-control-message>message</mlv-control-message>
    </mlv-input>

    <mlv-search layout="vertical-inline">
      <label>search label</label>
      <input type="search" placeholder="search" />
      <mlv-control-message>message</mlv-control-message>
    </mlv-search>

    <mlv-password layout="vertical-inline">
      <label>password label</label>
      <input type="password" value="123456" autocomplete="off" />
      <mlv-control-message>message</mlv-control-message>
    </mlv-password>

    <mlv-select layout="vertical-inline">
      <label>select label</label>
      <select>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </select>
      <mlv-control-message>message</mlv-control-message>
    </mlv-select>

    <mlv-date layout="vertical-inline">
      <label>date label</label>
      <input type="date" />
      <mlv-control-message>message</mlv-control-message>
    </mlv-date>

    <mlv-datetime layout="vertical-inline">
      <label>datetime label</label>
      <input type="datetime-local" />
      <mlv-control-message>message</mlv-control-message>
    </mlv-datetime>

    <mlv-month layout="vertical-inline">
      <label>month label</label>
      <input type="month" />
      <mlv-control-message>message</mlv-control-message>
    </mlv-month>

    <mlv-week layout="vertical-inline">
      <label>week label</label>
      <input type="week" />
      <mlv-control-message>message</mlv-control-message>
    </mlv-week>

    <mlv-time layout="vertical-inline">
      <label>time label</label>
      <input type="time" />
      <mlv-control-message>message</mlv-control-message>
    </mlv-time>

    <mlv-color layout="vertical-inline">
      <label>color label</label>
      <input type="color" />
      <mlv-control-message>message</mlv-control-message>
    </mlv-color>

    <mlv-input layout="vertical-inline">
      <label>prefix/suffix label</label>
      <mlv-button container="flat" readonly>https://</mlv-button>
      <input type="text" />
      <mlv-button container="flat" readonly>.com</mlv-button>
      <mlv-control-message>message</mlv-control-message>
    </mlv-input>

    <mlv-input layout="vertical-inline">
      <label>actions label</label>
      <mlv-icon-button icon-name="search" container="flat" readonly></mlv-icon-button>
      <input type="text" />
      <mlv-icon-button icon-name="cancel" container="flat" aria-label="clear"></mlv-icon-button>
      <mlv-control-message>message</mlv-control-message>
    </mlv-input>

    <mlv-input-group layout="vertical-inline">
      <label>date range</label>
      <mlv-date>
        <input type="date" aria-label="start date" value="2018-07-22" />
      </mlv-date>
      <mlv-date>
        <input type="date" aria-label="end date" value="2022-07-22" />
      </mlv-date>
      <mlv-control-message>message</mlv-control-message>
    </mlv-input-group>

    <mlv-input-group layout="vertical-inline">
      <label>domain</label>
      <mlv-select style="width: 120px">
        <select aria-label="protocol">
          <option>https://</option>
          <option>http://</option>
        </select>
      </mlv-select>
      <mlv-input>
        <input placeholder="example" aria-label="host" />
        <mlv-button container="flat" readonly="">.com</mlv-button>
      </mlv-input>
      <mlv-control-message>Host ID: 123456</mlv-control-message>
    </mlv-input-group>

    <mlv-range layout="vertical-inline">
      <label>range label</label>
      <input type="range" />
      <mlv-control-message>message</mlv-control-message>
    </mlv-range>

    <mlv-checkbox-group layout="vertical-inline">
      <label>checkbox group label</label>
      <mlv-checkbox>
        <label>checkbox 1</label>
        <input type="checkbox" checked />
      </mlv-checkbox>

      <mlv-checkbox>
        <label>checkbox 2</label>
        <input type="checkbox" />
      </mlv-checkbox>

      <mlv-checkbox>
        <label>checkbox 3</label>
        <input type="checkbox" />
      </mlv-checkbox>
      <mlv-control-message>message</mlv-control-message>
    </mlv-checkbox-group>

    <mlv-radio-group layout="vertical-inline">
      <label>radio group label</label>
      <mlv-radio>
        <label>radio 1</label>
        <input type="radio" checked />
      </mlv-radio>

      <mlv-radio>
        <label>radio 2</label>
        <input type="radio" />
      </mlv-radio>

      <mlv-radio>
        <label>radio 3</label>
        <input type="radio" />
      </mlv-radio>
      <mlv-control-message>message</mlv-control-message>
    </mlv-radio-group>

    <mlv-switch-group layout="vertical-inline">
      <label>switch group label</label>
      <mlv-switch>
        <label>switch 1</label>
        <input type="checkbox" />
      </mlv-switch>

      <mlv-switch>
        <label>switch 2</label>
        <input type="checkbox" checked />
      </mlv-switch>
      <mlv-control-message>message</mlv-control-message>
    </mlv-switch-group>

    <mlv-select layout="vertical-inline">
      <label>select multiple label</label>
      <select multiple>
        <option value="1">Option 1</option>
        <option selected value="2">Option 2</option>
        <option selected value="3">Option 3</option>
        <option selected value="3">Option 3</option>
        <option value="4">Option 4</option>
        <option value="5">Option 5</option>
      </select>
      <mlv-control-message>message</mlv-control-message>
    </mlv-select>

    <mlv-textarea layout="vertical-inline">
      <label>textarea label</label>
      <textarea></textarea>
      <mlv-control-message>message</mlv-control-message>
    </mlv-textarea>

    <mlv-file>
      <label>file label</label>
      <input type="file" />
      <mlv-control-message>message</mlv-control-message>
    </mlv-file>

    <mlv-search rounded>
      <input type="search" aria-label="search" placeholder="search" />
      <datalist>
        <option value="search result 1"></option>
        <option value="search result 2"></option>
        <option value="search result 3"></option>
      </datalist>
    </mlv-search>

    <mlv-input layout="vertical-inline">
      <label>disabled</label>
      <input disabled />
      <mlv-control-message>message</mlv-control-message>
    </mlv-input>

    <mlv-input layout="vertical-inline">
      <label>success</label>
      <input />
      <mlv-control-message status="success">message</mlv-control-message>
    </mlv-input>

    <mlv-input layout="vertical-inline">
      <label>error</label>
      <input />
      <mlv-control-message status="error">message</mlv-control-message>
    </mlv-input>
</div>
  `
}

export const Vertical = () => {
  return html`
<div nve-layout="column gap:lg">
  <mlv-input>
    <label>text label</label>
    <input />
    <mlv-control-message>message</mlv-control-message>
  </mlv-input>

  <mlv-search>
    <label>search label</label>
    <input type="search" placeholder="search" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-search>

  <mlv-password>
    <label>password label</label>
    <input type="password" value="123456" autocomplete="off" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-password>

  <mlv-select>
    <label>select label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-range>
    <label>range label</label>
    <input type="range" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-range>

  <mlv-checkbox-group>
    <label>checkbox group label</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message>message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-radio-group>
    <label>radio group label</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message>message</mlv-control-message>
  </mlv-radio-group>

  <mlv-switch-group>
    <label>switch group label</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" checked />
    </mlv-switch>
    <mlv-control-message>message</mlv-control-message>
  </mlv-switch-group>

  <mlv-select>
    <label>select multiple label</label>
    <select multiple>
      <option value="1">Option 1</option>
      <option selected value="2">Option 2</option>
      <option selected value="3">Option 3</option>
      <option selected value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-textarea>
    <label>textarea label</label>
    <textarea></textarea>
    <mlv-control-message>message</mlv-control-message>
  </mlv-textarea>
</div>
  `;
};

export const VerticalInline = () => {
  return html`
<div nve-layout="column gap:lg">
  <mlv-input layout="vertical-inline">
    <label>text label</label>
    <input />
    <mlv-control-message>message</mlv-control-message>
  </mlv-input>

  <mlv-search layout="vertical-inline">
    <label>search label</label>
    <input type="search" placeholder="search" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-search>

  <mlv-password layout="vertical-inline">
    <label>password label</label>
    <input type="password" value="123456" autocomplete="off" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-password>

  <mlv-select layout="vertical-inline">
    <label>select label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-range layout="vertical-inline">
    <label>range label</label>
    <input type="range" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-range>

  <mlv-checkbox-group layout="vertical-inline">
    <label>checkbox group label</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message>message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-radio-group layout="vertical-inline">
    <label>radio group label</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message>message</mlv-control-message>
  </mlv-radio-group>

  <mlv-switch-group layout="vertical-inline">
    <label>switch group label</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" checked />
    </mlv-switch>
    <mlv-control-message>message</mlv-control-message>
  </mlv-switch-group>

  <mlv-select layout="vertical-inline">
    <label>select multiple label</label>
    <select multiple>
      <option value="1">Option 1</option>
      <option selected value="2">Option 2</option>
      <option selected value="3">Option 3</option>
      <option selected value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-textarea layout="vertical-inline">
    <label>textarea label</label>
    <textarea></textarea>
    <mlv-control-message>message</mlv-control-message>
  </mlv-textarea>
</div>
  `;
};

export const Horizontal = () => {
  return html`
<div nve-layout="column gap:lg">
  <mlv-input layout="horizontal">
    <label>text label</label>
    <input />
    <mlv-control-message>message</mlv-control-message>
  </mlv-input>

  <mlv-search layout="horizontal">
    <label>search label</label>
    <input type="search" placeholder="search" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-search>

  <mlv-password layout="horizontal">
    <label>password label</label>
    <input type="password" value="123456" autocomplete="off" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-password>

  <mlv-select layout="horizontal">
    <label>select label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-range layout="horizontal">
    <label>range label</label>
    <input type="range" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-range>

  <mlv-checkbox-group layout="horizontal">
    <label>checkbox group label</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message>message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-radio-group layout="horizontal">
    <label>radio group label</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message>message</mlv-control-message>
  </mlv-radio-group>

  <mlv-switch-group layout="horizontal">
    <label>switch group label</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" checked />
    </mlv-switch>
    <mlv-control-message>message</mlv-control-message>
  </mlv-switch-group>

  <mlv-select layout="horizontal">
    <label>select multiple label</label>
    <select multiple>
      <option value="1">Option 1</option>
      <option selected value="2">Option 2</option>
      <option selected value="3">Option 3</option>
      <option selected value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-textarea layout="horizontal">
    <label>textarea label</label>
    <textarea></textarea>
    <mlv-control-message>message</mlv-control-message>
  </mlv-textarea>
</div>
  `;
};

export const HorizontalInline = () => {
  return html`
<div nve-layout="column gap:lg">
  <mlv-input layout="horizontal-inline">
    <label>text label</label>
    <input />
    <mlv-control-message>message</mlv-control-message>
  </mlv-input>

  <mlv-search layout="horizontal-inline">
    <label>search label</label>
    <input type="search" placeholder="search" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-search>

  <mlv-password layout="horizontal-inline">
    <label>password label</label>
    <input type="password" value="123456" autocomplete="off" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-password>

  <mlv-select layout="horizontal-inline">
    <label>select label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-range layout="horizontal-inline">
    <label>range label</label>
    <input type="range" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-range>

  <mlv-checkbox-group layout="horizontal-inline">
    <label>checkbox group label</label>
    <mlv-checkbox>
      <label>checkbox 1</label>
      <input type="checkbox" checked />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 2</label>
      <input type="checkbox" />
    </mlv-checkbox>

    <mlv-checkbox>
      <label>checkbox 3</label>
      <input type="checkbox" />
    </mlv-checkbox>
    <mlv-control-message>message</mlv-control-message>
  </mlv-checkbox-group>

  <mlv-radio-group layout="horizontal-inline">
    <label>radio group label</label>
    <mlv-radio>
      <label>radio 1</label>
      <input type="radio" checked />
    </mlv-radio>

    <mlv-radio>
      <label>radio 2</label>
      <input type="radio" />
    </mlv-radio>

    <mlv-radio>
      <label>radio 3</label>
      <input type="radio" />
    </mlv-radio>
    <mlv-control-message>message</mlv-control-message>
  </mlv-radio-group>

  <mlv-switch-group layout="horizontal-inline">
    <label>switch group label</label>
    <mlv-switch>
      <label>switch 1</label>
      <input type="checkbox" />
    </mlv-switch>

    <mlv-switch>
      <label>switch 2</label>
      <input type="checkbox" checked />
    </mlv-switch>
    <mlv-control-message>message</mlv-control-message>
  </mlv-switch-group>

  <mlv-select layout="horizontal-inline">
    <label>select multiple label</label>
    <select multiple>
      <option value="1">Option 1</option>
      <option selected value="2">Option 2</option>
      <option selected value="3">Option 3</option>
      <option selected value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>

  <mlv-textarea layout="horizontal-inline">
    <label>textarea label</label>
    <textarea></textarea>
    <mlv-control-message>message</mlv-control-message>
  </mlv-textarea>
</div>
  `;
};


export const FitText = {
  render: () => html`
<section nve-layout="column gap:md">
  <mlv-date fit-text>
    <label>date</label>
    <input type="date" value="2017-06-01" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-date>

  <mlv-input fit-text>
    <label>label</label>
    <input value="123456789012345678901234567890" />
    <mlv-control-message>message</mlv-control-message>
  </mlv-input>

  <mlv-select fit-text>
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 1234</option>
      <option value="3">Option 1234567809</option>
    </select>
    <mlv-control-message>message</mlv-control-message>
  </mlv-select>
</section>
`
};
