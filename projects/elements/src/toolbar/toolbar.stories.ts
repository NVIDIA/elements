import { html } from 'lit';
import '@elements/elements/toolbar/define.js';
import '@elements/elements/combobox/define.js';
import '@elements/elements/button-group/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/divider/define.js';
import '@elements/elements/progressive-filter-chip/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/color/define.js';

import '@elements/elements/bulk-actions/define.js';

export default {
  title: 'Elements/Toolbar/Examples',
  component: 'mlv-toolbar',
};

export const Default = {
  render: () => html`
  <div mlv-theme="root">
    <mlv-toolbar>
      <mlv-button interaction="flat"><mlv-icon name="add"></mlv-icon> create</mlv-button>
      <mlv-button interaction="flat"><mlv-icon name="delete"></mlv-icon> delete</mlv-button>
      <mlv-icon-button interaction="flat" icon-name="gear" slot="suffix" aria-label="settings"></mlv-icon-button>
    </mlv-toolbar>
  </div>
  `
};

export const ContainerFlat = {
  render: () => html`
  <div mlv-theme="root">
    <mlv-toolbar container="flat">
      <mlv-button interaction="flat"><mlv-icon name="add"></mlv-icon> create</mlv-button>
      <mlv-button interaction="flat"><mlv-icon name="delete"></mlv-icon> delete</mlv-button>
      <mlv-icon-button interaction="flat" icon-name="gear" slot="suffix" aria-label="settings"></mlv-icon-button>
    </mlv-toolbar>
  </div>
  `
};

export const ContainerInset = {
  render: () => html`
  <div mlv-theme="root">
    <mlv-toolbar container="inset">
      <mlv-button interaction="flat"><mlv-icon name="add"></mlv-icon> create</mlv-button>
      <mlv-button interaction="flat"><mlv-icon name="delete"></mlv-icon> delete</mlv-button>
      <mlv-icon-button interaction="flat" icon-name="gear" slot="suffix" aria-label="settings"></mlv-icon-button>
    </mlv-toolbar>
  </div>
  `
};

export const Groups = {
  render: () => html`
  <div mlv-theme="root">
    <mlv-toolbar>
      <mlv-select fit-text>
        <select aria-label="element type">
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="p">Paragraph</option>
        </select>
        <div slot="option-1">
          <span mlv-text="heading">Heading 1</span>
        </div>
        <div slot="option-2">
          <span mlv-text="heading sm">Heading 2</span>
        </div>
        <div slot="option-3">
          <span mlv-text="body sm">Paragraph</span>
        </div>
      </mlv-select>

      <mlv-divider></mlv-divider>

      <mlv-button-group>
        <mlv-icon-button pressed icon-name="bars-3-bottom-left"></mlv-icon-button>
        <mlv-icon-button icon-name="bars-3-bottom-right"></mlv-icon-button>
        <mlv-icon-button icon-name="bars-4"></mlv-icon-button>
      </mlv-button-group>

      <mlv-divider></mlv-divider>

      <mlv-button-group>
        <mlv-icon-button icon-name="bold" size="sm"></mlv-icon-button>
        <mlv-icon-button icon-name="italic" size="sm"></mlv-icon-button>
        <mlv-icon-button icon-name="strikethrough" size="sm"></mlv-icon-button>
      </mlv-button-group>

      <mlv-divider></mlv-divider>

      <mlv-button-group>
        <mlv-icon-button icon-name="code"></mlv-icon-button>
        <mlv-icon-button icon-name="fork"></mlv-icon-button>
        <mlv-icon-button icon-name="merge"></mlv-icon-button>
      </mlv-button-group>

      <mlv-button slot="suffix" interaction="flat">Save</mlv-button>
    </mlv-toolbar>
  </div>
  `
};

export const Vertical = {
  render: () => html`
  <div mlv-theme="root">
    <mlv-toolbar orientation="vertical">
      <mlv-button-group>
        <mlv-icon-button pressed icon-name="bars-3-bottom-left"></mlv-icon-button>
        <mlv-icon-button icon-name="bars-3-bottom-right"></mlv-icon-button>
        <mlv-icon-button icon-name="bars-4"></mlv-icon-button>
      </mlv-button-group>

      <mlv-divider></mlv-divider>

      <mlv-button-group>
        <mlv-icon-button icon-name="bold" size="sm"></mlv-icon-button>
        <mlv-icon-button icon-name="italic" size="sm"></mlv-icon-button>
        <mlv-icon-button icon-name="strikethrough"></mlv-icon-button>
      </mlv-button-group>
    </mlv-toolbar>
  </div>
  `
};

export const Filter = {
  render: () => html`
  <div mlv-theme="root">
    <mlv-toolbar container="flat">
      <mlv-icon-button readonly icon-name="filter" interaction="flat" slot="prefix"></mlv-icon-button>
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
      <mlv-combobox container="flat">
        <input type="search" placeholder="Add Filter" />
        <datalist>
          <option value="Status"></option>
          <option value="Priority"></option>
          <option value="Date"></option>
          <option value="Session"></option>
          <option value="Configuration"></option>
          <option value="Contains"></option>
        </datalist>
      </mlv-combobox>
      <mlv-icon-button aria-label="clear filters" icon-name="cancel" slot="suffix"></mlv-icon-button>
      <mlv-button slot="suffix">Save Filters</mlv-button>
    </mlv-toolbar>
  </div>
  `
};

export const Scroll = {
  render: () => html`
  <div mlv-theme="root">
    <mlv-toolbar container="flat">
      <mlv-icon-button readonly icon-name="filter" interaction="flat" slot="prefix"></mlv-icon-button>
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
      <mlv-progressive-filter-chip>
        <select aria-label="date type">
          <option>recording date</option>
          <option>process date</option>
        </select>
        <input type="date" value="2022-05-11" aria-label="start date" />
        <input type="date" value="2022-12-07" aria-label="end date" />
      </mlv-progressive-filter-chip>
      <mlv-combobox container="flat">
        <input type="search" placeholder="Add Filter" />
        <datalist>
          <option value="Status"></option>
          <option value="Priority"></option>
          <option value="Date"></option>
          <option value="Session"></option>
          <option value="Configuration"></option>
          <option value="Contains"></option>
        </datalist>
      </mlv-combobox>
      <mlv-icon-button aria-label="clear filters" icon-name="cancel" slot="suffix"></mlv-icon-button>
      <mlv-button slot="suffix">Save Filters</mlv-button>
    </mlv-toolbar>
  </div>
  `
};

export const Wrap = {
  render: () => html`
  <div mlv-theme="root">
    <mlv-toolbar container="flat" content="wrap">
      <mlv-icon-button readonly icon-name="filter" interaction="flat" slot="prefix"></mlv-icon-button>
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
      <mlv-progressive-filter-chip>
        <select aria-label="date type">
          <option>recording date</option>
          <option>process date</option>
        </select>
        <input type="date" value="2022-05-11" aria-label="start date" />
        <input type="date" value="2022-12-07" aria-label="end date" />
      </mlv-progressive-filter-chip>
      <mlv-combobox container="flat">
        <input type="search" placeholder="Add Filter" />
        <datalist>
          <option value="Status"></option>
          <option value="Priority"></option>
          <option value="Date"></option>
          <option value="Session"></option>
          <option value="Configuration"></option>
          <option value="Contains"></option>
        </datalist>
      </mlv-combobox>
      <mlv-icon-button aria-label="clear filters" icon-name="cancel" slot="suffix"></mlv-icon-button>
      <mlv-button slot="suffix">Save Filters</mlv-button>
    </mlv-toolbar>
  </div>
  `
};

export const Status = {
  render: () => html`
    <div mlv-layout="column gap:lg align:stretch">
      <mlv-toolbar status="accent">
        <mlv-icon-button icon-name="cancel" slot="prefix"></mlv-icon-button>  
        <p mlv-text="body">123 selected</p>
        <mlv-button slot="suffix">delete</mlv-button>
        <mlv-icon-button icon-name="more-actions" slot="suffix"></mlv-icon-button>
      </mlv-toolbar>

      <mlv-toolbar>
        <mlv-icon-button icon-name="cancel" slot="prefix"></mlv-icon-button>  
        <p mlv-text="body">123 selected</p>
        <mlv-button slot="suffix">delete</mlv-button>
        <mlv-icon-button icon-name="more-actions" slot="suffix"></mlv-icon-button>
      </mlv-toolbar>
    </div>
  `
}