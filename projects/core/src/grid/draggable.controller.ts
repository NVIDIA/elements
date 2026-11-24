// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { DraggableListController } from '@nvidia-elements/foundations/draggable-list';
import type { Grid } from './grid.js';

/** Row adapter for the shared Foundations drag behavior. */
// eslint-disable-next-line local/require-component-metadata -- This adapter extends a reactive controller, not a custom element.
export class DraggableGridRowController extends DraggableListController {
  constructor(host: Grid, announce?: (message: string) => void) {
    super(host, () => ({
      get items() {
        return host.querySelectorAll<HTMLElement>(':scope > nve-grid-row, :scope > nve-virtual-list > nve-grid-row');
      },
      get dropZones() {
        return host.querySelectorAll<HTMLElement>(':scope > nve-grid-placeholder');
      },
      disabled: !host.draggableRows,
      orientation: 'vertical',
      handlesOnly: true,
      accepts: (source, container) => source.localName === 'nve-grid-row' && container.localName === 'nve-grid',
      announce
    }));
  }
}

/** Column adapter; columns only reorder within their current grid. */
// eslint-disable-next-line local/require-component-metadata -- This adapter extends a reactive controller, not a custom element.
export class DraggableGridColumnController extends DraggableListController {
  constructor(host: Grid, announce?: (message: string) => void) {
    super(host, () => ({
      get items() {
        return host.querySelectorAll<HTMLElement>(':scope > nve-grid-header > nve-grid-column');
      },
      disabled: !host.draggableColumns,
      orientation: 'horizontal',
      handlesOnly: true,
      accepts: (source, container) => source.localName === 'nve-grid-column' && container === host,
      announce
    }));
  }
}
