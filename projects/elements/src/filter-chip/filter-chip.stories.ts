import { html } from 'lit';
import '@elements/elements/filter-chip/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/select/define.js';

export default {
  title: 'Elements/Filter Chip/Examples',
  component: 'nve-filter-chip',
};

export const Default = {
  render: () => html`
    <nve-filter-chip closable>
      <select aria-label="dataset">
        <option>workload</option>
        <option selected>instance</option>
      </select>
      <select aria-label="condition">
        <option>sort by</option>
        <option selected>filter by</option>
      </select>
      <select aria-label="filter">
        <option>utilization</option>
        <option selected>status</option>
      </select>
    </nve-filter-chip>
  `
}

export const Multiple = {
  render: () => html`
    <nve-filter-chip closable>
      <select aria-label="dataset">
        <option selected>status</option>
        <option>workload</option>
      </select>
      <select aria-label="condition">
        <option selected>filter by</option>
        <option>sort by</option>
      </select>
      <select multiple aria-label="filter">
        <option selected>progress</option>
        <option>pending</option>
        <option>success</option>
        <option>failed</option>
      </select>
    </nve-filter-chip>
  `
}

export const TextInput = {
  render: () => html`
    <nve-filter-chip closable>
      <select aria-label="dataset">
        <option>memory</option>
        <option selected>CPU</option>
      </select>
      <select aria-label="condition">
        <option>greater than</option>
        <option selected>less than</option>
        <option>equal to</option>
      </select>
      <input type="number" min="0" max="100" value="50" aria-label="filter" />
    </nve-filter-chip>
  `
}

export const DateRange = {
  render: () => html`
    <nve-filter-chip>
      <select aria-label="date type">
        <option>recording date</option>
        <option>process date</option>
      </select>
      <input type="date" value="2022-05-11" aria-label="start date" />
      <input type="date" value="2022-12-07" aria-label="end date" />
    </nve-filter-chip>
    `
}

export const Custom = {
  render: () => html`
    <nve-filter-chip closable>
      <select aria-label="dataset">
        <option>GPS</option>
        <option>Cellular</option>
      </select>
      <select aria-label="condition">
        <option>contains</option>
        <option>excludes</option>
      </select>
      <nve-button style="width: 190px" id="map-btn">37.3706254,-121.9671894</nve-button>
    </nve-filter-chip>
    <nve-dropdown anchor="map-btn" trigger="map-btn">
      <nve-input>
        <nve-icon-button icon-name="map-pin" readonly></nve-icon-button>
        <input value="37.3706254,-121.9671894" disabled />
      </nve-input>
      <img src="images/test-map-2.webp" width="300px" alt="non-interactive demo map" />
    </nve-dropdown>
  `
}
