import { html } from 'lit';
import '@nvidia-elements/core/progressive-filter-chip/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/select/define.js';

export default {
  title: 'Elements/Progressive Filter Chip',
  component: 'nve-progressive-filter-chip',
};

export const Default = {
  render: () => html`
    <nve-progressive-filter-chip closable>
      <nve-select>
        <select aria-label="dataset">
          <option>workload</option>
          <option selected>instance</option>
        </select>
      </nve-select>
      <nve-select>
        <select aria-label="condition">
          <option>sort by</option>
          <option selected>filter by</option>
        </select>
      </nve-select>
      <nve-select>
        <select aria-label="filter">
          <option selected>utilization</option>
          <option>status</option>
        </select>
      </nve-select>
    </nve-progressive-filter-chip>
  `
}

export const Layer = {
  render: () => html`
    <nve-progressive-filter-chip closable>
      <nve-select>
        <select aria-label="dataset">
          <option>workload</option>
          <option selected>instance</option>
        </select>
      </nve-select>
      <nve-select>
        <select aria-label="condition">
          <option>sort by</option>
          <option selected>filter by</option>
        </select>
      </nve-select>
      <nve-select>
        <select aria-label="filter">
          <option selected>utilization</option>
          <option>status</option>
        </select>
      </nve-select>
    </nve-progressive-filter-chip>
  `
}

export const Multiple = {
render: () => html`
    <nve-progressive-filter-chip closable>
      <nve-select>
        <select aria-label="dataset">
          <option selected>status</option>
          <option>workload</option>
        </select>
      </nve-select>
      <nve-select>
        <select aria-label="condition">
          <option selected>filter by</option>
          <option>sort by</option>
        </select>
      </nve-select>
      <nve-select>
        <select multiple aria-label="filter">
          <option selected>progress</option>
          <option>pending</option>
          <option>success</option>
          <option>failed</option>
        </select>
      </nve-select>
    </nve-progressive-filter-chip>
  `
}

export const TextInput = {
  render: () => html`
    <nve-progressive-filter-chip closable>
      <nve-select>
        <select aria-label="dataset">
          <option selected>memory</option>
          <option>CPU</option>
        </select>
      </nve-select>
      <nve-select>
        <select aria-label="condition">
          <option selected>greater than</option>
          <option>less than</option>
          <option>equal to</option>
        </select>
      </nve-select>
      <nve-input>
        <input type="number" min="0" max="100" value="50" aria-label="filter" />
      </nve-input>
    </nve-progressive-filter-chip>
  `
}

export const DateRange = {
  render: () => html`
    <nve-progressive-filter-chip>
      <nve-select>
        <select aria-label="date type">
          <option>recording date</option>
          <option>process date</option>
        </select>
      </nve-select>
      <nve-date>
        <input type="date" value="2022-05-11" aria-label="start date" />
      </nve-date>
      <nve-date>
        <input type="date" value="2022-12-07" aria-label="end date" />
      </nve-date>
    </nve-progressive-filter-chip>
    `
}

export const Custom = {
  render: () => html`
    <nve-progressive-filter-chip closable>
      <nve-select>
        <select aria-label="dataset">
          <option>GPS</option>
          <option selected>Cellular</option>
        </select>
      </nve-select>
      <nve-select>
        <select aria-label="condition">
          <option>contains</option>
          <option>excludes</option>
        </select>
      </nve-select>
      <nve-button style="width: 190px" id="map-btn">37.3706254,-121.9671894</nve-button>
    </nve-progressive-filter-chip>
    <nve-dropdown anchor="map-btn" trigger="map-btn">
      <nve-input>
        <nve-icon-button icon-name="map-pin" readonly></nve-icon-button>
        <input value="37.3706254,-121.9671894" disabled />
      </nve-input>
      <img src="static/images/test-map-2.webp" width="300px" alt="non-interactive demo map" />
    </nve-dropdown>
  `
}

export const Validation = {
  render: () => html`
<div nve-layout="column gap:lg">
  <nve-progressive-filter-chip closable>
    <nve-input>
      <input type="text" value="validation" required />
      <nve-control-message error="valueMissing">required</nve-control-message>
    </nve-input>
    <nve-input>
      <input type="text" />
    </nve-input>
  </nve-progressive-filter-chip>

  <nve-progressive-filter-chip closable>
    <nve-input status="error">
      <input type="text" value="manual validation" formnovalidate />
    </nve-input>
    <nve-input>
      <input type="text" />
    </nve-input>
  </nve-progressive-filter-chip>
</div>
  `
}
