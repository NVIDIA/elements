// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/icon-button/define.js';


export default {
  title: 'Elements/InputGroup',
  component: 'nve-input-group'
};

/**
 * @summary Input group combining select, input, and button for composite controls like domain URL entry.
 */
export const Default = {
  render: () => html`
<nve-input-group>
  <label>domain</label>
  <nve-select style="width: 130px">
    <select aria-label="protocol">
      <option>https://</option>
      <option>http://</option>
    </select>
  </nve-select>
  <nve-input>
    <input placeholder="example" type="url" aria-label="host" />
    <nve-button container="flat" readonly="">.com</nve-button>
  </nve-input>
  <nve-control-message>host: 123456</nve-control-message>
</nve-input-group>
`
};

/**
 * @summary Input group with date range filters combining select and date inputs for filtering data by time periods.
 */
export const FilterGroupRange = {
  render: () => html`
<div nve-layout="row align:vertical-center">
  <nve-input-group>
    <nve-select style="width:150px">
      <select aria-label="date type">
        <option value="1">recording date</option>
        <option value="2">process date</option>
      </select>
    </nve-select>
    <nve-date style="width:220px">
      <nve-button container="flat" readonly="">start</nve-button>
      <input type="date" value="2022-05-11" aria-label="start date" />
    </nve-date>
    <nve-date style="width:220px">
      <nve-button container="flat" readonly="">end</nve-button>
      <input type="date" value="2022-12-07" aria-label="end date" />
    </nve-date>
    <nve-icon-button aria-label="remove filter" icon-name="cancel"></nve-icon-button>
  </nve-input-group>
</div>
    `
}
