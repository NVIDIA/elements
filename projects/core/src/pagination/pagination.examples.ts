// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/core/pagination/define.js';
import '@nvidia-elements/core/button/define.js';

export default {
  title: 'Elements/Pagination',
  component: 'nve-pagination',
};

/**
 * @summary Basic pagination component with default styling and behavior.
 */
export const Default = {
  render: () => html`
  <nve-pagination value="1" items="100" step="10"></nve-pagination>
  <script type="module">
    const pagination = document.querySelector('nve-pagination');
    pagination.addEventListener('change', e => console.log(e.target.value));
  </script>
  `
};

/**
 * @summary Pagination with skip buttons to navigate to first and last pages quickly.
 */
export const Skippable = {
  render: () => html`
    <nve-pagination value="1" items="100" step="10" skippable></nve-pagination>
  `
};

/**
 * @summary Disabled pagination component that prevents user interaction.
 */
export const Disabled = {
  render: () => html`
    <nve-pagination disabled value="1" items="100" step="10" skippable></nve-pagination>
  `
};

/**
 * @summary Pagination with flat container styling for a more minimal appearance.
 */
export const Flat = {
  render: () => html`
    <nve-pagination container="flat" value="1" items="100" step="10" skippable></nve-pagination>
  `
};

/**
 * @summary Inline pagination layout that fits inline with content.
 */
export const Inline = {
  render: () => html`
    <nve-pagination container="inline" value="1" items="100" step="10"></nve-pagination>
  `
};

/**
 * @summary Inline pagination with disabled step selector to prevent page size changes.
 */
export const DisableStep = {
  render: () => html`
    <nve-pagination disable-step container="inline" value="1" items="100" step="10"></nve-pagination>
  `
};

/**
 * @summary Pagination as a form associated component that participates in form submission and emits change, input, and step-change events. Use when page selection needs to integrate with form data collection or server-side form handling.
 */
export const Forms = {
  render: () => html`
    <form id="pagination-form" nve-layout="column gap:md">
      <nve-pagination name="page" value="1" items="100" step="10" aria-label="pagination controls"></nve-pagination>
      <nve-button>submit page 10</nve-button>
      <pre></pre>
    </form>
    <script type="module">
      const form = document.querySelector('form');
      const pre = document.querySelector('form pre');

      form.addEventListener('change', updateValues);
      form.addEventListener('input', updateValues);
      form.addEventListener('submit', updateValues);
      form.addEventListener('step-change', updateValues);

      function updateValues(e) {
        e.preventDefault();
        console.log(e);
        pre.innerText = JSON.stringify({ ...Object.fromEntries(new FormData(form)), step: form.elements.page.step }, null, 2);
      }
    </script>
  `
};

/**
 * @summary Pagination without items count display, useful when total count is unknown.
 */
export const NoItemsCount = {
  render: () => html`
    <form id="pagination-form" nve-layout="column gap:md">
      <nve-pagination name="page" value="1" step="10" aria-label="pagination controls"></nve-pagination>
      <pre></pre>
    </form>
    <script type="module">
      const form = document.querySelector('form');
      const pre = document.querySelector('form pre');
      form.addEventListener('input', updateValues);
      form.addEventListener('step-change', updateValues);
      function updateValues(e) {
        e.preventDefault();
        pre.innerText = JSON.stringify({ ...Object.fromEntries(new FormData(form)), step: form.elements.page.step }, null, 2);
      }
    </script>
  `
};

/**
 * @summary Pagination handling large datasets with higher step values for efficient navigation.
 */
export const LargeValues = {
  render: () => html`
    <nve-pagination container="inline" value="1" items="10000" step="100"></nve-pagination>
  `
}

/**
 * @summary If the upper bound of items is unknown, use the `last-page` event
 * to determine when to load more data and update the pagination
 * with the latest total of items.
 * @tags test-case
 */
export const DynamicItems = {
  render: () => html`
    <nve-pagination disable-step container="inline" value="1" items="100" step="20"></nve-pagination>

    <script type="module">
      const pagination = document.querySelector('nve-pagination');
      let items = loadItems();

      pagination.addEventListener('last-page', async () => {
        items = [...items, ...loadItems()];
        pagination.items = items.length;
      });

      function loadItems() {
        return new Array(100).fill('');
      }
    </script>
  `
}

/**
 * @summary When a custom step exists, the select options dynamically
 * adapt to the step and append to the default option list.
 */
export const DynamicStepSize = {
  render: () => html`
  <!-- javascript property binding -->
  <nve-pagination value="1" items="10000" step="100" step-sizes="[100, 500, 1000]"></nve-pagination>
  `
};

/**
 * @summary Use the `suffix-label` slot to customize the "of total" label
 * when dealing with approximated totals from API responses. This is useful
 * when the API returns a limited count but indicates there are more items
 * available.
 * @tags test-case
 */
export const SuffixLabel = {
  render: () => html`
    <nve-pagination value="1" items="50000" step="100">
      <span slot="suffix-label">of 50,000+</span>
    </nve-pagination>
  `
};

/**
 * @summary Custom pagination pattern using toolbar with numbered page buttons and navigation arrows.
 */
export const PageListPattern = {
  render: () => html`
    <nve-toolbar container="inset">
      <nve-button disabled container="flat"><nve-icon name="chevron" direction="left" size="sm"></nve-icon> previous</nve-button>
      <nve-button container="flat" selected>1</nve-button>
      <nve-button container="flat">2</nve-button>
      <nve-button container="flat">3</nve-button>
      <nve-button container="flat">4</nve-button>
      <nve-button container="flat">next <nve-icon name="chevron" direction="right" size="sm"></nve-icon></nve-button>
    </nve-toolbar>
  `
};

/**
 * @summary Enhanced pagination pattern with first/last page buttons and numbered page navigation.
 */
export const SkipPattern = {
  render: () => html`
    <nve-toolbar container="inset">
      <nve-icon-button container="flat" icon-name="arrow-stop" direction="left" aria-label="first" disabled></nve-icon-button>
      <nve-icon-button container="flat" icon-name="chevron" direction="left" aria-label="previous"></nve-icon-button>
      <nve-button container="flat" selected>1</nve-button>
      <nve-button container="flat">2</nve-button>
      <nve-button container="flat">3</nve-button>
      <nve-button container="flat">4</nve-button>
      <nve-icon-button icon-name="chevron" direction="right" aria-label="next"></nve-icon-button>
      <nve-icon-button icon-name="arrow-stop" direction="right" aria-label="last"></nve-icon-button>
    </nve-toolbar>
  `
};

/**
 * @summary Vertical pagination pattern with up/down navigation arrows for compact layouts.
 */
export const VerticalPattern = {
  render: () => html`
    <nve-toolbar container="inset">
      <label nve-text="body muted sm">1 of 13</label>
      <nve-icon-button container="flat" size="sm" icon-name="chevron" direction="up" aria-label="previous"></nve-icon-button>
      <nve-icon-button container="flat" size="sm" icon-name="chevron" direction="down" aria-label="next"></nve-icon-button>
    </nve-toolbar>
  `
};

/**
 * @summary Custom pagination with select dropdown for page size and navigation arrows.
 */
export const CustomSelectPattern = {
  render: () => html`
    <nve-toolbar container="inset">
      <nve-select style="--width: 80px">
        <select aria-label="page size">
          <option value="10">1-10</option>
        </select>
      </nve-select>
      <label nve-text="label muted sm" style="width: 40px">of ~13</label>
      <nve-icon-button container="flat" icon-name="chevron" direction="left" aria-label="previous" disabled></nve-icon-button>
      <nve-icon-button container="flat" icon-name="chevron" direction="right" aria-label="next"></nve-icon-button>
    </nve-toolbar>
  `
};
