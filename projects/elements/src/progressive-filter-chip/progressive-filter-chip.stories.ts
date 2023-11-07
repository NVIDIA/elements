import { html } from 'lit';
import '@elements/elements/progressive-filter-chip/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/select/define.js';

export default {
  title: 'Elements/Progressive Filter Chip/Examples',
  component: 'mlv-progressive-filter-chip',
};

export const Default = {
  render: () => html`
    <mlv-progressive-filter-chip closable>
      <select aria-label="dataset">
        <option>workload</option>
        <option selected>instance</option>
      </select>
      <select aria-label="condition">
        <option>sort by</option>
        <option selected>filter by</option>
      </select>
      <select aria-label="filter">
        <option selected>utilization</option>
        <option>status</option>
      </select>
    </mlv-progressive-filter-chip>
  `
}

export const Layer = {
  render: () => html`
    <mlv-progressive-filter-chip closable>
      <select aria-label="dataset">
        <option>workload</option>
        <option selected>instance</option>
      </select>
      <select aria-label="condition">
        <option>sort by</option>
        <option selected>filter by</option>
      </select>
      <select aria-label="filter">
        <option selected>utilization</option>
        <option>status</option>
      </select>
    </mlv-progressive-filter-chip>
  `
}

export const Multiple = {
render: () => html`
    <mlv-progressive-filter-chip closable>
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
    </mlv-progressive-filter-chip>
  `
}

export const TextInput = {
  render: () => html`
    <mlv-progressive-filter-chip closable>
      <select aria-label="dataset">
        <option selected>memory</option>
        <option>CPU</option>
      </select>
      <select aria-label="condition">
        <option selected>greater than</option>
        <option>less than</option>
        <option>equal to</option>
      </select>
      <input type="number" min="0" max="100" value="50" aria-label="filter" />
    </mlv-progressive-filter-chip>
  `
}

export const DateRange = {
  render: () => html`
    <mlv-progressive-filter-chip>
      <select aria-label="date type">
        <option>recording date</option>
        <option>process date</option>
      </select>
      <input type="date" value="2022-05-11" aria-label="start date" />
      <input type="date" value="2022-12-07" aria-label="end date" />
    </mlv-progressive-filter-chip>
    `
}

export const Custom = {
  render: () => html`
    <mlv-progressive-filter-chip closable>
      <select aria-label="dataset">
        <option>GPS</option>
        <option selected>Cellular</option>
      </select>
      <select aria-label="condition">
        <option>contains</option>
        <option>excludes</option>
      </select>
      <mlv-button style="width: 190px" id="map-btn">37.3706254,-121.9671894</mlv-button>
    </mlv-progressive-filter-chip>
    <mlv-dropdown anchor="map-btn" trigger="map-btn">
      <mlv-input>
        <mlv-icon-button icon-name="map-pin" readonly></mlv-icon-button>
        <input value="37.3706254,-121.9671894" disabled />
      </mlv-input>
      <img src="images/test-map-2.webp" width="300px" alt="non-interactive demo map" />
    </mlv-dropdown>
  `
}
