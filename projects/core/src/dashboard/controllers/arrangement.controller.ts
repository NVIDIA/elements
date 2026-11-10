// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { planDashboardAction } from '../utils/action.utils.js';
import { getDashboardResizeCorner } from '../utils/geometry.utils.js';
import { reconcileDashboard, serializeDashboardValue } from '../utils/layout.utils.js';

import type { DashboardAction, DashboardArrangementRequest } from '../utils/intent.types.js';

import type { DashboardPanel } from '../panel/panel.js';

import type { DashboardGridPlacement, DashboardLayout } from '../dashboard.types.js';

interface DashboardArrangementHost {
  readonly value: string;
  readonly rearrangeable: boolean;
  readonly autoSettle: boolean;
  matches(selectors: string): boolean;
}

interface DashboardArrangementDelegate {
  getPanels(): DashboardPanel[];
  getOwnedPanels(): DashboardPanel[];
  isReady(): boolean;
  getKnown(): ReadonlySet<string>;
  getLayout(): DashboardLayout | undefined;
  isFullscreenActive(): boolean;
  cancel(): void;
  commit(layout: DashboardLayout): boolean;
}

/** Applies arrangement permissions and operations to the current supplied panels. */
export class DashboardArrangementController {
  readonly #host: DashboardArrangementHost;
  readonly #delegate: DashboardArrangementDelegate;

  constructor(host: DashboardArrangementHost, delegate: DashboardArrangementDelegate) {
    this.#host = host;
    this.#delegate = delegate;
  }

  place(id: string, placement: DashboardGridPlacement): boolean {
    this.#delegate.cancel();

    const layout = this.#delegate.getLayout();
    if (!layout) return false;

    const next = this.findLayoutProposal(layout, id, { kind: 'command', command: '--place', placement });

    return next ? this.#delegate.commit(next) : false;
  }

  getArrangementStateKey(): string {
    return JSON.stringify({
      value: this.#host.value,
      settle: this.#host.autoSettle,
      rearrangeable: this.#host.rearrangeable,
      readingDirection: this.#host.matches(':dir(rtl)') ? 'rtl' : 'ltr',
      panels: this.#delegate.getPanels().map(panel => ({
        ...panel._getSpanConstraints(),
        moveDisabled: panel.moveDisabled,
        resizeDisabled: panel.resizeDisabled,
        resizeCorner: getDashboardResizeCorner(panel)
      }))
    });
  }

  findLayoutProposal(layout: DashboardLayout, id: string, request: DashboardArrangementRequest) {
    const panel = this.#delegate.getPanels().find(candidate => candidate.id === id);
    if (!panel || !this.#delegate.isReady()) return undefined;

    return planDashboardAction({
      layout,
      id,
      request,
      panels: this.#delegate.getPanels().map(candidate => candidate._getSpanConstraints()),
      movable: this.isActionAllowed(panel, 'move'),
      resizable: this.isActionAllowed(panel, 'resize'),
      autoSettle: this.#host.autoSettle,
      readingDirection: this.#host.matches(':dir(rtl)') ? 'rtl' : 'ltr',
      resizeEdge: getDashboardResizeCorner(panel)
    });
  }

  isActionAllowed(panel: DashboardPanel, action: DashboardAction) {
    return (
      this.#delegate.isReady() &&
      this.#delegate.getPanels().includes(panel) &&
      !this.#delegate.isFullscreenActive() &&
      this.#host.rearrangeable &&
      (action === 'move' ? !panel.moveDisabled : !panel.resizeDisabled)
    );
  }

  canCommit(layout: DashboardLayout): boolean {
    return this.#isProposalValid(layout) && serializeDashboardValue(layout) !== this.#host.value;
  }

  #isProposalValid(layout: DashboardLayout): boolean {
    if (!this.#delegate.isReady()) return false;

    const panels = this.#delegate.getOwnedPanels();
    const reconciled = reconcileDashboard(
      layout,
      panels.map(panel => panel._getSpanConstraints()),
      {
        priority: this.#delegate.getKnown(),
        autoSettle: this.#host.autoSettle,
        hidden: new Set(panels.filter(panel => panel.hidden).map(panel => panel.id))
      }
    );

    return !!reconciled && serializeDashboardValue(reconciled) === serializeDashboardValue(layout);
  }
}
