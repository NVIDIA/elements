// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/accordion/define.js';
import '@nvidia-elements/core/avatar/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/date/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/progress-bar/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/sort-button/define.js';
import '@nvidia-elements/core/toolbar/define.js';
import '@nvidia-elements/core/tree/define.js';

export default {
  title: 'Patterns/Browse',
  component: 'nve-patterns'
};

/**
 * @summary Use for browsable content lists with a horizontal card showing thumbnail, title, description, and icon button actions.
 * @tags pattern
 */
export const ContentRow = {
  render: () => html`
  <nve-card role="listitem" container="flat">
    <nve-card-content>
      <div nve-layout="grid align:vertical-center align:space-between gap:md">
        <div nve-layout="span:4 row gap:md align:vertical-center">
          <div aria-hidden="true" nve-layout="row align:center" style="width: 100px; aspect-ratio: 3 / 2;">
            <nve-icon name="image" size="lg"></nve-icon>
          </div>
          <div nve-layout="column gap:sm">
            <h2 nve-text="label medium">Activity Dashboard</h2>
            <p nve-text="body sm muted">Last saved: Oct 19, 21 by Camru</p>
          </div>
        </div>
        <p nve-text="body sm" nve-layout="span:5">A dashboard displaying current project activity grouped by User, Host or IP</p>
        <div nve-layout="span:3 row gap:sm align:right">
          <div nve-layout="row gap:xs">
            <nve-icon-button icon-name="eye"></nve-icon-button>
            <nve-icon-button icon-name="copy"></nve-icon-button>
            <nve-icon-button icon-name="delete"></nve-icon-button>
          </div>
          <nve-divider orientation="vertical"></nve-divider>
          <nve-button>Add Panel</nve-button>
        </div>
      </div>
    </nve-card-content>
  </nve-card>
  `
};

/**
 * @summary Searchable collection with a persistent facet panel, active-filter feedback, result counts, and sorting. Use when people need to narrow a broad catalog without losing filter context.
 * @tags pattern
 */
export const FilterableBrowse = {
  render() {
    return html`
<nve-page id="filterable-browse-pattern">
  <style>
    #filterable-browse-pattern nve-accordion {
      --header-padding: var(--nve-ref-size-200) var(--nve-ref-size-400);
    }
  </style>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 slot="prefix" nve-text="heading">Model Registry</h2>
  </nve-page-header>
  <nve-page-panel slot="subheader">
    <nve-page-panel-content>
      <div nve-layout="row gap:md align:wrap align:space-between align:vertical-center">
        <div nve-layout="column gap:xs">
          <h1 id="filterable-browse-title" nve-text="heading lg">Model catalog</h1>
          <p nve-text="body sm muted">Find a deployable model by capability, lifecycle status, and owner.</p>
        </div>
        <nve-search style="width: 220px">
          <input id="filterable-browse-search" type="search" aria-label="Search models" placeholder="Search name or capability" />
        </nve-search>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="left" size="sm" aria-label="Model filters">
    <nve-page-panel-content style="--padding: 0">
        <nve-accordion-group container="flat" behavior-expand>
          <nve-accordion expanded>
            <nve-accordion-header>
              <h3 nve-text="label medium">Status</h3>
            </nve-accordion-header>
            <nve-accordion-content>
              <div nve-layout="column gap:sm">
                <nve-checkbox>
                  <label>Ready <span nve-text="body sm muted">(2)</span></label>
                  <input type="checkbox" data-filter-key="status" value="Ready" />
                </nve-checkbox>
                <nve-checkbox>
                  <label>Preview <span nve-text="body sm muted">(1)</span></label>
                  <input type="checkbox" data-filter-key="status" value="Preview" />
                </nve-checkbox>
              </div>
            </nve-accordion-content>
          </nve-accordion>
          <nve-accordion expanded>
            <nve-accordion-header>
              <h3 nve-text="label medium">Capability</h3>
            </nve-accordion-header>
            <nve-accordion-content>
              <div nve-layout="column gap:sm">
                <nve-checkbox>
                  <label>Vision <span nve-text="body sm muted">(1)</span></label>
                  <input type="checkbox" data-filter-key="capability" value="Vision" />
                </nve-checkbox>
                <nve-checkbox>
                  <label>Language <span nve-text="body sm muted">(1)</span></label>
                  <input type="checkbox" data-filter-key="capability" value="Language" />
                </nve-checkbox>
                <nve-checkbox>
                  <label>Simulation <span nve-text="body sm muted">(1)</span></label>
                  <input type="checkbox" data-filter-key="capability" value="Simulation" />
                </nve-checkbox>
              </div>
            </nve-accordion-content>
          </nve-accordion>
        </nve-accordion-group>
    </nve-page-panel-content>
  </nve-page-panel>
  <main nve-layout="column gap:md pad:lg">
    <div nve-layout="row gap:sm align:wrap align:space-between align:bottom">
      <div nve-layout="column gap:xs">
        <p id="filterable-browse-count" nve-text="body semibold" aria-live="polite">3 models</p>
        <p id="filterable-browse-summary" nve-text="body sm muted">No filters applied</p>
      </div>
      <nve-select fit-content>
        <label>Sort by</label>
        <select id="filterable-browse-sort">
          <option value="updated">Recently updated</option>
          <option value="name">Name</option>
        </select>
      </nve-select>
    </div>
    <div id="filterable-browse-results" role="list" nve-layout="column gap:sm">
      <nve-card role="listitem" container="flat" data-name="Sim Predict" data-status="ready" data-capability="simulation" data-updated="4">
        <nve-card-content>
          <div nve-layout="row gap:lg align:space-between">
            <div nve-layout="row gap:sm align:vertical-center">
              <nve-icon name="sparkles" size="lg" status="accent"></nve-icon>
              <div nve-layout="column gap:xs">
                <a href="#" nve-text="label medium">Sim Predict</a>
                <span nve-text="body sm muted">Simulation</span>
              </div>
            </div>
            <p nve-text="body sm">Generates world states for physical AI validation and planning.</p>
            <nve-badge status="success">Ready</nve-badge>
          </div>
        </nve-card-content>
      </nve-card>
      <nve-card role="listitem" container="flat" data-name="Vision Inspect" data-status="ready" data-capability="vision" data-updated="3">
        <nve-card-content>
          <div nve-layout="row gap:lg align:space-between">
            <div nve-layout="row gap:sm align:vertical-center">
              <nve-icon name="eye" size="lg" status="accent"></nve-icon>
              <div nve-layout="column gap:xs">
                <a href="#" nve-text="label medium">Vision Inspect</a>
                <span nve-text="body sm muted">Vision</span>
              </div>
            </div>
            <p nve-text="body sm">Detects surface defects in high-throughput manufacturing images.</p>
            <nve-badge status="success">Ready</nve-badge>
          </div>
        </nve-card-content>
      </nve-card>
      <nve-card role="listitem" container="flat" data-name="Document Reasoner" data-status="preview" data-capability="language" data-updated="2">
        <nve-card-content>
          <div nve-layout="row gap:lg align:space-between">
            <div nve-layout="row gap:sm align:vertical-center">
              <nve-icon name="document" size="lg" status="accent"></nve-icon>
              <div nve-layout="column gap:xs">
                <a href="#" nve-text="label medium">Document Reasoner</a>
                <span nve-text="body sm muted">Language</span>
              </div>
            </div>
            <p nve-text="body sm">Answers grounded questions across technical document collections.</p>
            <nve-badge status="warning">Preview</nve-badge>
          </div>
        </nve-card-content>
      </nve-card>
    </div>
  </main>
</nve-page>
<script type="module">
  const root = document.querySelector('#filterable-browse-pattern');
  if (root) {
    const search = root.querySelector('#filterable-browse-search');
    const sort = root.querySelector('#filterable-browse-sort');
    const count = root.querySelector('#filterable-browse-count');
    const summary = root.querySelector('#filterable-browse-summary');
    const results = root.querySelector('#filterable-browse-results');
    const cards = [...root.querySelectorAll('[data-name]')];
    const filters = [...root.querySelectorAll('[data-filter-key]')];

    const update = () => {
      const query = search.value.trim().toLowerCase();
      const active = filters.filter(filter => filter.checked);
      const valuesByKey = new Map();
      active.forEach(filter => {
        const values = valuesByKey.get(filter.dataset.filterKey) ?? [];
        values.push(filter.value.toLowerCase());
        valuesByKey.set(filter.dataset.filterKey, values);
      });

      let visible = 0;
      cards.forEach(card => {
        const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
        const matchesFilters = [...valuesByKey].every(([key, values]) => values.includes(card.dataset[key]));
        card.hidden = !(matchesQuery && matchesFilters);
        if (!card.hidden) visible += 1;
      });

      const orderedCards = [...cards].sort((left, right) => {
        if (sort.value === 'name') return left.dataset.name.localeCompare(right.dataset.name);
        return Number(right.dataset.updated) - Number(left.dataset.updated);
      });
      orderedCards.forEach(card => results.append(card));

      count.textContent = visible + (visible === 1 ? ' model' : ' models');
      const labels = active.map(filter => filter.value);
      summary.textContent = labels.length ? 'Active filters: ' + labels.join(', ') : 'No filters applied';
    };
    root.addEventListener('input', update);
    root.addEventListener('change', update);
  }
</script>
    `;
  }
};

/**
 * @summary Persistent hierarchy in a page navigation panel that scopes the adjacent collection. Use when people need to move among nested domains while retaining location context and direct access to nearby scopes.
 * @tags pattern
 */
export const TreeScopedBrowse = {
  render() {
    return html`
<nve-page id="tree-scoped-browse-pattern">
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 slot="prefix" nve-text="heading">Asset Library</h2>
  </nve-page-header>
  <nve-page-panel slot="subheader">
    <nve-page-panel-content>
      <div nve-layout="row gap:md align:wrap align:space-between align:vertical-center">
        <div nve-layout="column gap:xs">
          <h1 id="tree-scoped-browse-page-title" nve-text="heading lg">Asset catalog</h1>
          <p nve-text="body sm muted">Browse records within a persistent collection hierarchy.</p>
        </div>
        <nve-button><nve-icon name="add"></nve-icon>Add asset</nve-button>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>
  <nve-page-panel slot="left" size="sm" aria-label="Asset collection navigation">
    <nve-page-panel-content>
      <section nve-layout="column gap:md">
        <nve-tree id="tree-scoped-browse-tree" behavior-expand behavior-select selectable="single">
          <nve-tree-node data-scope="all" data-label="All assets" selected expanded>
            All assets
            <nve-tree-node data-scope="vision" data-label="Vision assets" expanded>
              Vision
              <nve-tree-node data-scope="cameras" data-label="Camera assets">Cameras</nve-tree-node>
              <nve-tree-node data-scope="lidar" data-label="LiDAR assets">LiDAR</nve-tree-node>
            </nve-tree-node>
            <nve-tree-node data-scope="language" data-label="Language assets" expanded>
              Language
              <nve-tree-node data-scope="documents" data-label="Document assets">Documents</nve-tree-node>
              <nve-tree-node data-scope="assistants" data-label="Assistant assets">Assistants</nve-tree-node>
            </nve-tree-node>
          </nve-tree-node>
        </nve-tree>
      </section>
    </nve-page-panel-content>
  </nve-page-panel>
  <main nve-layout="column gap:md pad:lg">
    <header nve-layout="row gap:sm align:space-between align:bottom">
      <div nve-layout="column gap:xs">
        <h2 id="tree-scoped-browse-title" nve-text="heading md">All assets</h2>
        <p id="tree-scoped-browse-count" nve-text="body sm muted" aria-live="polite">5 records</p>
      </div>
    </header>
    <div id="tree-scoped-browse-results" role="list" nve-layout="column gap:sm">
      <nve-card role="listitem" container="flat" data-scopes="all vision cameras">
        <nve-card-content>
          <div nve-layout="row gap:md align:space-between align:vertical-center">
            <div nve-layout="column gap:xs">
              <a href="#" nve-text="label medium">Loading dock camera set</a>
              <span nve-text="body sm muted">Cameras · 12,480 frames</span>
            </div>
            <nve-badge status="success">Ready</nve-badge>
          </div>
        </nve-card-content>
      </nve-card>
      <nve-card role="listitem" container="flat" data-scopes="all vision cameras">
        <nve-card-content>
          <div nve-layout="row gap:md align:space-between align:vertical-center">
            <div nve-layout="column gap:xs">
              <a href="#" nve-text="label medium">Aisle obstruction images</a>
              <span nve-text="body sm muted">Cameras · 8,220 frames</span>
            </div>
            <nve-badge status="pending">Processing</nve-badge>
          </div>
        </nve-card-content>
      </nve-card>
      <nve-card role="listitem" container="flat" data-scopes="all vision lidar">
        <nve-card-content>
          <div nve-layout="row gap:md align:space-between align:vertical-center">
            <div nve-layout="column gap:xs">
              <a href="#" nve-text="label medium">Warehouse point clouds</a>
              <span nve-text="body sm muted">LiDAR · 3,160 captures</span>
            </div>
            <nve-badge status="success">Ready</nve-badge>
          </div>
        </nve-card-content>
      </nve-card>
      <nve-card role="listitem" container="flat" data-scopes="all language documents">
        <nve-card-content>
          <div nve-layout="row gap:md align:space-between align:vertical-center">
            <div nve-layout="column gap:xs">
              <a href="#" nve-text="label medium">Service manuals</a>
              <span nve-text="body sm muted">Documents · 246 files</span>
            </div>
            <nve-badge status="success">Indexed</nve-badge>
          </div>
        </nve-card-content>
      </nve-card>
        <nve-card role="listitem" container="flat" data-scopes="all language assistants">
        <nve-card-content>
          <div nve-layout="row gap:md align:space-between align:vertical-center">
            <div nve-layout="column gap:xs">
              <a href="#" nve-text="label medium">Operator assistant prompts</a>
              <span nve-text="body sm muted">Assistants · 86 conversations</span>
            </div>
            <nve-badge status="warning">Review</nve-badge>
          </div>
        </nve-card-content>
        </nve-card>
    </div>
  </main>
</nve-page>
<script type="module">
  const root = document.querySelector('#tree-scoped-browse-pattern');
  if (root) {
    const tree = root.querySelector('#tree-scoped-browse-tree');
    const title = root.querySelector('#tree-scoped-browse-title');
    const count = root.querySelector('#tree-scoped-browse-count');
    const cards = [...root.querySelectorAll('[data-scopes]')];
    tree.addEventListener('select', event => {
      const node = event.detail;
      const scope = node.dataset.scope;
      if (!scope) return;
      let visible = 0;
      cards.forEach(card => {
        card.hidden = !card.dataset.scopes.split(' ').includes(scope);
        if (!card.hidden) visible += 1;
      });
      title.textContent = node.dataset.label;
      count.textContent = visible + (visible === 1 ? ' record' : ' records');
    });
  }
</script>
    `;
  }
};

/**
 * @summary Directly editable data grid with text, select, checkbox, and date controls visible in every row. Use for compact settings tables where frequent edits should not require a separate edit mode.
 * @tags pattern
 */
export const EditableGrid = {
  render: () => html`
<nve-page id="editable-grid-page">
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 slot="prefix" nve-text="heading">Deployment Manager</h2>
  </nve-page-header>
  <nve-page-panel slot="subheader">
    <nve-page-panel-content>
      <div nve-layout="column gap:xs">
        <h1 id="editable-grid-title" nve-text="heading lg">Deployment settings</h1>
        <p nve-text="body sm muted">Edit values directly in the grid without entering a separate edit mode.</p>
      </div>
    </nve-page-panel-content>
  </nve-page-panel>
  <main nve-layout="column gap:md pad:lg">
    <nve-grid id="editable-grid-pattern" container="flat" stripe>
      <nve-grid-header>
        <nve-grid-column>Name</nve-grid-column>
        <nve-grid-column>Environment</nve-grid-column>
        <nve-grid-column>Review date</nve-grid-column>
        <nve-grid-column>Auto deploy</nve-grid-column>
      </nve-grid-header>
      <nve-grid-row>
        <nve-grid-cell>
          <nve-input container="flat">
            <input type="text" value="Batch evaluator" required aria-label="Batch evaluator name" />
          </nve-input>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-select container="flat">
            <select aria-label="Batch evaluator environment">
              <option>Development</option>
              <option selected>Staging</option>
              <option>Production</option>
            </select>
          </nve-select>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-date container="flat">
            <input type="date" value="2026-11-03" aria-label="Batch evaluator review date" />
          </nve-date>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-checkbox>
            <label>Enable</label>
            <input type="checkbox" aria-label="Enable batch evaluator auto deploy" />
          </nve-checkbox>
        </nve-grid-cell>
      </nve-grid-row>
      <nve-grid-row>
        <nve-grid-cell>
          <nve-input container="flat">
            <input type="text" value="Safety monitor" required aria-label="Safety monitor name" />
          </nve-input>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-select container="flat">
            <select aria-label="Safety monitor environment">
              <option selected>Development</option>
              <option>Staging</option>
              <option>Production</option>
            </select>
          </nve-select>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-date container="flat">
            <input type="date" value="2026-12-12" aria-label="Safety monitor review date" />
          </nve-date>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-checkbox>
            <label>Enable</label>
            <input type="checkbox" checked aria-label="Enable safety monitor auto deploy" />
          </nve-checkbox>
        </nve-grid-cell>
      </nve-grid-row>
      <nve-grid-row>
        <nve-grid-cell>
          <nve-input container="flat">
            <input type="text" value="Edge inference" required aria-label="Edge inference name" />
          </nve-input>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-select container="flat">
            <select aria-label="Edge inference environment">
              <option>Development</option>
              <option>Staging</option>
              <option selected>Production</option>
            </select>
          </nve-select>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-date container="flat">
            <input type="date" value="2026-10-15" aria-label="Edge inference review date" />
          </nve-date>
        </nve-grid-cell>
        <nve-grid-cell>
          <nve-checkbox>
            <label>Enable</label>
            <input type="checkbox" checked aria-label="Enable edge inference auto deploy" />
          </nve-checkbox>
        </nve-grid-cell>
      </nve-grid-row>
    </nve-grid>
  </main>
</nve-page>
  `
};
