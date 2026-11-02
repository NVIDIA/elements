---
{
  title: 'Data Grid Performance',
  description: 'Use a fixed-height virtual list to keep large data grids responsive, or choose pagination and external virtualization.',
  layout: 'docs.11ty.js',
  tag: 'nve-grid',
  associatedElements: ['nve-grid-header', 'nve-grid-column', 'nve-grid-row', 'nve-grid-cell'],
  hideStatus: true
}
---

## Virtual scrolling

For large datasets with fixed row heights, compose one `nve-virtual-list` directly inside the grid. The list owns vertical scrolling and requests a bounded range; your application renders its data into the default slot. The grid's surrounding scroll container moves the header and rows horizontally together. Native slot changes position and reveal replacement rows automatically. Headers and footer stay outside the list. The grid uses its existing navigation for the rendered rows. The renderer supplies total row counts and logical row indices.

{% example '@nvidia-elements/core/grid/grid.examples.json' 'PerformanceVirtualScroll' '{ "inline": false, "height": "520px" }' %}

Import both `@nvidia-elements/core/grid/define.js` and `@nvidia-elements/foundations/virtual-list/define.js`. Configure `item-count`, `item-height`, and a bounded `--scroll-height` on the list. Each rendered row occupies exactly `itemHeight` pixels including borders; long content cannot increase it. Variable heights, row groups, detail panels, and column virtualization aren't supported. The list rejects configurations where `item-count * item-height` exceeds 16,000,000 CSS pixels. Use pagination for larger datasets.

The `virtual-change` event is an immutable `{ start, end, count }` request, including buffered rows. Replace or reorder assigned row elements to render `[start, end)`. For asynchronous rendering, check that `list.range === request` immediately before changing DOM and discard obsolete work. Content stays hidden while a different window awaits new assigned elements. Updating only the content or properties of the same elements cannot signal a new window. Attach the listener before initialization, or render `list.range` once after attaching it.

Use data identity keys when rendering with a framework. Write `aria-rowcount` on the grid and explicit `aria-rowindex` during each render: `logicalIndex + 1 + headerRowCount`. Keep selection in application data and reapply `selected` to rendered rows. See [Virtual List](/docs/foundations/virtual-list/) for working consumers and API details.

## Angular Virtual Grid

```typescript
{% raw %}
import { CUSTOM_ELEMENTS_SCHEMA, Component, computed, signal } from '@angular/core';
import { VirtualList, type VirtualRange } from '@nvidia-elements/foundations/virtual-list';
import '@nvidia-elements/foundations/virtual-list/define.js';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/button/define.js';

@Component({
  selector: 'app-virtual-grid',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
<section nve-layout="column gap:md">
  <h2 nve-text="heading">Virtualized training jobs</h2>
  <p nve-text="body">Scroll through 10,000 jobs. Only the requested rows are mounted.</p>
  <p nve-text="body sm">Mounted rows: {{ rows().length }}. Requested jobs: {{ (range()?.start ?? -1) + 1 }}–{{ range()?.end ?? 0 }} of 10,000.</p>
  <nve-grid aria-label="Training jobs" aria-rowcount="10001">
    <nve-grid-header aria-rowindex="1">
      <nve-grid-column>Job</nve-grid-column>
      <nve-grid-column>Status</nve-grid-column>
      <nve-grid-column>Queue</nve-grid-column>
      <nve-grid-column>Owner</nve-grid-column>
    </nve-grid-header>
    <nve-virtual-list
      id="virtual-jobs"
      [itemCount]="10000"
      [itemHeight]="44"
      style="--scroll-height: 400px"
      (virtual-change)="updateRange($event)">
      @for (index of rows(); track index) {
      <nve-grid-row [attr.aria-rowindex]="index + 2">
        <nve-grid-cell>Job {{ index + 1 }}</nve-grid-cell>
        <nve-grid-cell>{{ index % 3 === 0 ? 'Queued' : 'Running' }}</nve-grid-cell>
        <nve-grid-cell>Queue {{ index % 5 + 1 }}</nve-grid-cell>
        <nve-grid-cell>Team {{ index % 10 + 1 }}</nve-grid-cell>
      </nve-grid-row>
      }
    </nve-virtual-list>
  </nve-grid>
</section>`
})
export class VirtualGrid {
  readonly range = signal<VirtualRange | undefined>(undefined);
  readonly rows = computed(() => {
    const range = this.range();
    return range ? Array.from({ length: range.end - range.start }, (_, offset) => range.start + offset) : [];
  });

  updateRange(event: Event) {
    if (event.currentTarget instanceof VirtualList) this.range.set(event.currentTarget.range);
  }
}
{% endraw %}
```

## React Virtual Grid

```tsx
{% raw %}
import React, { useEffect, useRef, useState } from 'react';
import { VirtualList, type VirtualRange } from '@nvidia-elements/foundations/virtual-list';
import '@nvidia-elements/foundations/virtual-list/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/grid/define.js';

export default function VirtualGrid() {
  const list = useRef<VirtualList>(null);
  const [range, setRange] = useState<VirtualRange>();

  useEffect(() => {
    const viewport = list.current;
    if (!viewport) return;
    const update = () => setRange(viewport.range);
    viewport.addEventListener('virtual-change', update);
    update();
    return () => viewport.removeEventListener('virtual-change', update);
  }, []);

  const rows = range ? Array.from({ length: range.end - range.start }, (_, offset) => range.start + offset) : [];

  return (
    <section nve-layout="column gap:md">
      <p nve-text="body sm">Mounted rows: {rows.length}. Requested jobs: {range ? range.start + 1 : 0}–{range?.end ?? 0} of 10,000.</p>
      <nve-grid aria-label="Training jobs" aria-rowcount="10001">
        <nve-grid-header aria-rowindex="1">
          <nve-grid-column>Job</nve-grid-column>
          <nve-grid-column>Status</nve-grid-column>
          <nve-grid-column>Queue</nve-grid-column>
          <nve-grid-column>Owner</nve-grid-column>
        </nve-grid-header>
        <nve-virtual-list
          ref={list}
          id="virtual-jobs"
          itemCount={10000}
          itemHeight={44}
          style={{ '--scroll-height': '400px' }}>
          {rows.map(index => (
            <nve-grid-row key={index} aria-rowindex={index + 2}>
              <nve-grid-cell>Job {index + 1}</nve-grid-cell>
              <nve-grid-cell>{index % 3 === 0 ? 'Queued' : 'Running'}</nve-grid-cell>
              <nve-grid-cell>Queue {(index % 5) + 1}</nve-grid-cell>
              <nve-grid-cell>Team {(index % 10) + 1}</nve-grid-cell>
            </nve-grid-row>
          ))}
        </nve-virtual-list>
      </nve-grid>
    </section>
  );
}
{% endraw %}
```

## Vue Virtual Grid

```html
{% raw %}
<script setup lang="ts">
import { computed, onMounted, shallowRef, useTemplateRef } from 'vue';
import { VirtualList, type VirtualRange } from '@nvidia-elements/foundations/virtual-list';
import '@nvidia-elements/foundations/virtual-list/define.js';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/button/define.js';

const list = useTemplateRef<VirtualList>('list');
const range = shallowRef<VirtualRange>();
const rows = computed(() => {
  const current = range.value;
  return current ? Array.from({ length: current.end - current.start }, (_, offset) => current.start + offset) : [];
});

function updateRange() {
  range.value = list.value?.range;
}

// Read the current request if it fired before the template listener attached.
onMounted(updateRange);
</script>

<template>
  <section nve-layout="column gap:md">
    <h2 nve-text="heading">Virtualized training jobs</h2>
    <p nve-text="body">Scroll through 10,000 jobs. Only the requested rows are mounted.</p>
    <div nve-layout="row gap:sm">
      <nve-button commandfor="virtual-jobs" command="--scroll-to-index" value="0">First job</nve-button>
      <nve-button commandfor="virtual-jobs" command="--scroll-to-index" value="5000">Middle job</nve-button>
      <nve-button commandfor="virtual-jobs" command="--scroll-to-index" value="9999">Last job</nve-button>
    </div>
    <p nve-text="body sm">Mounted rows: {{ rows.length }}. Requested jobs: {{ range ? range.start + 1 : 0 }}–{{ range?.end ?? 0 }} of 10,000.</p>
    <nve-grid aria-label="Training jobs" aria-rowcount="10001" stripe>
      <nve-grid-header aria-rowindex="1">
        <nve-grid-column>Job</nve-grid-column>
        <nve-grid-column>Status</nve-grid-column>
        <nve-grid-column>Queue</nve-grid-column>
        <nve-grid-column>Owner</nve-grid-column>
      </nve-grid-header>
      <nve-virtual-list ref="list" id="virtual-jobs" :itemCount="10000" :itemHeight="44" style="--scroll-height: 400px" @virtual-change="updateRange">
        <nve-grid-row v-for="index in rows" :key="index" :aria-rowindex="index + 2">
          <nve-grid-cell>Job {{ index + 1 }}</nve-grid-cell>
          <nve-grid-cell>{{ index % 3 === 0 ? 'Queued' : 'Running' }}</nve-grid-cell>
          <nve-grid-cell>Queue {{ index % 5 + 1 }}</nve-grid-cell>
          <nve-grid-cell>Team {{ index % 10 + 1 }}</nve-grid-cell>
        </nve-grid-row>
      </nve-virtual-list>
    </nve-grid>
  </section>
</template>
{% endraw %}
```

## External virtualization

The `scroller` escape hatch remains available for external libraries such as `@lit-labs/virtualizer` and Angular CDK. Put `scroller` on the external scrolling container. The grid navigates rendered rows for both built-in and external viewports. Consumers supply logical accessibility metadata.

```typescript
import '@lit-labs/virtualizer';
import '@nvidia-elements/core/grid/define.js';

html`
  <nve-grid aria-label="Jobs" aria-rowcount=${items.length + 1}>
    <nve-grid-header aria-rowindex="1"><nve-grid-column>Job</nve-grid-column></nve-grid-header>
    <lit-virtualizer scroller style="height: 400px" .items=${items}
      .renderItem=${(item, index) => html`
        <nve-grid-row aria-rowindex=${index + 2}><nve-grid-cell>${item.name}</nve-grid-cell></nve-grid-row>`}>
    </lit-virtualizer>
  </nve-grid>`;
```

## Render budgets

The ordinary grid uses CSS containment and content visibility. It still creates every row and cell, so extra controls and duplicate popovers increase DOM and initialization costs. Virtual scrolling keeps rendered row count proportional to viewport height and buffer size. Use fixed column widths when appropriate and share tooltips or other overlays across cells.

The existing 1,000-row, four-cell example remains available as an ordinary grid baseline:

{% example '@nvidia-elements/core/grid/grid.examples.json' 'Performance' '{ "inline": false, "height": "520px" }' %}

## Infinite scrolling

For append-only datasets, listen to `scrollboxend` and append the next batch. It fires when native scrolling ends at the bottom. If a batch leaves the content shorter than or equal to the viewport, load additional batches until scrolling is possible or you reach the end of the dataset; no native scroll-end event fires while the viewport cannot scroll. Batching limits initial work, but DOM size continues growing. Use pagination or virtual scrolling when users must traverse large datasets repeatedly.
