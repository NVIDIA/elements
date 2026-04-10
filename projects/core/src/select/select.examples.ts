// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/logo/define.js';

export default {
  title: 'Elements/Select',
  component: 'nve-select',
};

/**
 * @summary Basic select component with label, options, and message.
 */
export const Default = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

/**
 * @summary Rich option rendering with custom slots containing logos and descriptions for each option.
 * @tags test-case
 */
export const CustomOptionRender = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select id="complex">
    <option value="1">
      Debugger
    </option>
    <option value="2">
      Task Manager
    </option>
    <option value="3">
      CI Services
    </option>
  </select>
    <div slot="option-1" nve-layout="row gap:xs align:vertical-center">
      <nve-logo color="pink-rose">Db</nve-logo>
      <p nve-text="body" nve-layout="column gap:xs">
        <span nve-text="label">Debugger</span>
        <span nve-text="body muted">some details on option 1</span>
      </p>
    </div>
    <div slot="option-2" nve-layout="row gap:xs align:vertical-center">
      <nve-logo color="blue-cobalt">TM</nve-logo>
      <p nve-text="body" nve-layout="column gap:xs">
        <span nve-text="label">Task Manager</span>
        <span nve-text="body muted">some details on option 2</span>
      </p>
    </div>
    <div slot="option-3" nve-layout="row gap:xs align:vertical-center">
      <nve-logo color="green-mint">CI</nve-logo>
      <p nve-text="body" nve-layout="column gap:xs">
        <span nve-text="label">CI Services</span>
        <span nve-text="body muted">some details on option 3</span>
      </p>
    </div>
  <nve-control-message>message</nve-control-message>
</nve-select>
  `
}

/**
 * @summary Select with a prefix button to provide extra context or categorization.
 */
export const Prefix = {
  render: () => html`
  <nve-select>
    <nve-button container="flat" readonly>location</nve-button>
    <select aria-label="location">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
  </nve-select>
  `
};

/**
 * @summary Flat container style for single and multi select, providing a minimal visual treatment.
 */
export const Flat = {
  render: () => html`
<div nve-layout="column gap:xl align:stretch">
  <nve-select container="flat">
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select container="flat">
    <label>multiple</label>
    <select multiple>
      <option selected value="1">Option 1</option>
      <option selected value="2">Option 2</option>
      <option selected value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select container="flat">
    <label>multiple + size</label>
    <select multiple size="5">
      <option selected value="1">Option 1</option>
      <option selected value="2">Option 2</option>
      <option selected value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>
</div>`
};

/**
 * @summary Vertical layout showcasing states: default, disabled, success, and error.
 * @tags test-case
 */
export const Vertical = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-select>
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select>
    <label>disabled</label>
    <select disabled>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select>
    <label>success</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message status="success">message</nve-control-message>
  </nve-select>

  <nve-select>
    <label>error</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message status="error">message</nve-control-message>
  </nve-select>
</div>`
};

/**
 * @summary Horizontal layout showcasing states: default, disabled, success, and error.
 * @tags test-case
 */
export const Horizontal = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-select layout="horizontal">
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select layout="horizontal">
    <label>disabled</label>
    <select disabled>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select layout="horizontal">
    <label>success</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message status="success">message</nve-control-message>
  </nve-select>

  <nve-select layout="horizontal">
    <label>error</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <nve-control-message status="error">message</nve-control-message>
  </nve-select>
</div>`
};

/**
 * @summary Many-selection mode allowing users to select many options simultaneously.
 */
export const Multiple = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select multiple>
    <option value="1">Option 1</option>
    <option value="2" selected>Option 2</option>
    <option value="3" selected>Option 3</option>
    <option value="4" selected>Option 4</option>
    <option value="5">Option 5</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

/**
 * @summary Multi-selection in disabled state, showing read-only selected options.
 */
export const MultipleDisabled = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select multiple disabled>
    <option value="1">Option 1</option>
    <option value="2" selected>Option 2</option>
    <option value="3" selected>Option 3</option>
    <option value="4" selected>Option 4</option>
    <option value="5">Option 5</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

/**
 * @summary Multi-selection with constrained width to show overflow handling of selected options.
 */
export const MultipleOverflow = {
  render: () => html`
<nve-select style="--width: 250px">
  <label>label</label>
  <select multiple>
    <option value="1">Option 1</option>
    <option value="2" selected>Option 2</option>
    <option value="3" selected>Option 3</option>
    <option value="4" selected>Option 4</option>
    <option value="5" selected>Option 5</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

/**
 * @summary Size attribute controls the number of visible options without scrolling.
 */
export const Size = {
  render: () => html`
<div nve-layout="column gap:xl">
  <nve-select>
    <label>label</label>
    <select size="5">
      <option value="1">Option 1</option>
      <option value="2" selected>Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select>
    <label>label</label>
    <select size="3">
      <option value="1">Option 1</option>
      <option value="2" selected>Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>
</div>`
};

/**
 * @summary Custom scroll height for dropdown with many options to control vertical space usage.
 * @tags test-case
 */
export const Height = {
  render: () => html`
<div nve-layout="column gap:lg align:stretch">
  <nve-select style="--scroll-height: 150px">
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
      <option value="6">Option 6</option>
      <option value="7">Option 7</option>
      <option value="8">Option 8</option>
      <option value="9">Option 9</option>
      <option value="10">Option 10</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select>
    <label>label</label>
    <select>
      ${new Array(100).fill('').map((_, i) => html`<option>Option ${i + 1}</option>`)}
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>
</div>`
};

/**
 * @summary Select width dynamically adjusts to fit the currently selected option text.
 * @tags test-case
 */
export const FitText = {
  render: () => html`
<nve-select fit-text>
  <label>label</label>
  <select>
    <option value="1">Option 1</option>
    <option value="2">Option 1234</option>
    <option value="3">Option 1234567809</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

/**
 * @summary Select width adjusts to fit the longest option in both vertical and horizontal layouts.
 * @tags test-case
 */
export const FitContent = {
  render: () => html`
<div nve-layout="column gap:lg">
  <nve-select fit-content>
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 1234</option>
      <option value="3">Option 1234567809</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>

  <nve-select fit-content layout="horizontal">
    <label>label</label>
    <select>
      <option value="1">Option 1</option>
      <option value="2">Option 1234</option>
      <option value="3">Option 1234567809</option>
    </select>
    <nve-control-message>message</nve-control-message>
  </nve-select>
</div>`
};

/**
 * @summary Placeholder text prompts users to make a selection when no option exists yet.
 */
export const Placeholder = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select>
    <option value="" selected disabled hidden>Select Option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

/**
 * @summary Placeholder text in multi-selection mode guides users before they select any options.
 */
export const PlaceholderMultiple = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select multiple>
    <option value="" selected disabled hidden>Select Option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

/**
 * @summary Disable individual options to prevent selection while keeping them visible.
 */
export const Disabled = {
  render: () => html`
<nve-select>
  <label>label</label>
  <select>
    <option value="1">Option 1</option>
    <option value="2" disabled>Option 2</option>
    <option value="3">Option 3</option>
  </select>
  <nve-control-message>message</nve-control-message>
</nve-select>`
};

/**
 * @summary Viewport overflow test for select element
 * @tags test-case
 */
export const ViewportOverflow = {
  render: () => html`
<nve-select layout="horizontal-inline" style="margin: 30vh 0 0 60vw; max-width: 500px">
  <label>label</label>
  <select>
    <option value="1">Option 1 asfd asdf asdf asdf asdf asdf asdfasdf asdf asdf asdf asdf asdf asdf asdf</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
</nve-select>
<nve-select layout="horizontal-inline" style="margin: 55vh 0 0 60vw; max-width: 500px">
  <label>label</label>
  <select>
    <option value="1">Option 1 asfd asdf asdf asdf asdf asdf asdfasdf asdf asdf asdf asdf asdf asdf asdf</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
</nve-select>`
};

/**
 * @summary Performance test for select element with 1000 options
 * @tags test-case performance
 */
export const Performance = {
  render: () => html`
  <nve-select id="performance-select">
    <label>1000 options</label>
    <select></select>
  </nve-select>
  <script type="module">
    const select = document.querySelector('#performance-select select');
    const options = new Array(1000).fill('').map((_, i) => {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i + ' item';
      return option;
    });
    select.append(...options);
  </script>
  `
}
