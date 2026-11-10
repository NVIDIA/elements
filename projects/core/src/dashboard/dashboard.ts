// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, isServer, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { styleMap } from 'lit/directives/style-map.js';

import { scopedRegistry } from '@nvidia-elements/foundations/internal/decorators';
import { I18nController, type I18nDefaults } from '@nvidia-elements/foundations/internal/i18n';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';

import { Ghost } from '@nvidia-elements/core/ghost';

import { DashboardArrangementController } from './controllers/arrangement.controller.js';
import { DashboardCommandController } from './controllers/command.controller.js';
import { DashboardCompositionController } from './controllers/composition.controller.js';
import { DashboardFullscreenController } from './controllers/fullscreen.controller.js';
import { DashboardInteractionController } from './controllers/interaction.controller.js';
import { DashboardMeasurementController } from './controllers/measurement.controller.js';
import { getDashboardCanvasSize, getDashboardPixelPlacement } from './utils/geometry.utils.js';
import {
  createDefaultDashboardLayout,
  parseDashboardValue,
  reconcileDashboard,
  serializeDashboardValue
} from './utils/layout.utils.js';
import { resolveDashboardTarget } from './utils/movement.utils.js';

import type { DashboardPointerPresentation } from './controllers/interaction.controller.js';
import type { DashboardPixelPlacement } from './utils/geometry.utils.js';

import type { DashboardCommandContext, DashboardGridPlacement, DashboardLayout } from './dashboard.types.js';

import styles from './dashboard.css?inline';

const i18nDefaults = {
  move: 'move',
  resize: 'resize',
  enterFullscreen: 'enter full screen',
  exitFullscreen: 'exit full screen',
  placementUnavailable: 'placement unavailable',
  gridPlacement: 'column {column}, row {row}, column span {columnSpan}, row span {rowSpan}'
} satisfies I18nDefaults;

/**
 * @element nve-dashboard
 * @description A dashboard arranges application panels on a resizable grid with a restorable layout.
 * @documentation https://nvidia.github.io/elements/docs/elements/dashboard/
 * @since 0.0.0
 * @stable false
 * @entrypoint \@nvidia-elements/core/dashboard
 * @command --enter-fullscreen - Present the invoking panel in native fullscreen.
 * @command --exit-fullscreen - Exit native fullscreen.
 * @command --toggle-fullscreen - Toggle native fullscreen for the invoking panel.
 * @command --place - Apply the invoking control's integer grid placement without pointer target snapping. Target a panel directly or identify it with value when targeting the dashboard. Anchored span changes require resizing; other position changes require movement.
 * @command --move-left - Move left through the same contact-aware movement step as a movement-handle arrow key. Target a panel directly or identify it with value on an invoker targeting the dashboard.
 * @command --move-right - Move right through the same contact-aware movement step as a movement-handle arrow key. Target a panel directly or identify it with value on an invoker targeting the dashboard.
 * @command --move-up - Move up through the same contact-aware movement step as a movement-handle arrow key. Target a panel directly or identify it with value on an invoker targeting the dashboard.
 * @command --move-down - Move down through the same contact-aware movement step as a movement-handle arrow key. Target a panel directly or identify it with value on an invoker targeting the dashboard.
 * @command --move-to-start - Place at the growth-axis start, using available space before making room. Keep the bounded-axis coordinate unless placement supplies another. Uses the same operation as Home on the movement grip.
 * @command --increase-width - Increase width by one cell, subject to panel constraints. Target a panel directly or identify it with value on an invoker targeting the dashboard.
 * @command --decrease-width - Decrease width by one cell, subject to panel constraints. Target a panel directly or identify it with value on an invoker targeting the dashboard.
 * @command --increase-height - Increase height by one cell, subject to panel constraints. Target a panel directly or identify it with value on an invoker targeting the dashboard.
 * @command --decrease-height - Decrease height by one cell, subject to panel constraints. Target a panel directly or identify it with value on an invoker targeting the dashboard.
 * @slot - Direct dashboard panels with unique durable IDs, required headers, and application dropdown groups. DOM order remains application authored. Native reading order follows committed placement where supported; previews preserve that order.
 * @event change - Announces one committed arrangement after interaction, commands, or panel membership and span-constraint reconciliation. Read value on the dashboard; authored content events still bubble normally.
 * @event {Event} commandavailabilitychange - Arrangement or fullscreen command availability may have changed.
 * @cssprop --column-size - Single-cell outer column length in fixed sizing or horizontal flow. Defaults to 160px.
 * @cssprop --row-size - Single-cell outer row length in fixed sizing or vertical flow. Defaults to 120px.
 * @cssprop --gap - Nonnegative CSS length between cells. Include units, including 0px for no gap. At zero, uniform used border widths overlap; unequal widths keep independent geometry. Shared seams assume square panels with solid opaque borders.
 * @cssprop --guide-color - Color of the circular cell-center guides. Defaults to the muted border color.
 * @cssprop --guide-size - Nonnegative CSS length for the guide circle diameter. Defaults to 8px. Include units, including 0px to hide the circles.
 * @cssprop --height - Default viewport height. Defaults to 400px; horizontal fit needs a definite height.
 * @cssprop --animation-duration - Duration of panel geometry, destination ghost geometry, and arrangement control transitions. Defaults to 150ms; reduced motion uses 0ms. Panel geometry follows external container resizing immediately; explicit arrangement and sizing changes use transitions. Animation never delays logical placement commits.
 * @cssprop --animation-easing - Easing of panel and destination ghost geometry transitions.
 * @csspart ghost - Inert placement preview shown during pointer arrangement.
 */
@scopedRegistry()
export class Dashboard extends LitElement {
  static styles = useStyles([styles]);
  static readonly metadata = {
    tag: 'nve-dashboard',
    version: '0.0.0',
    children: ['nve-dashboard-panel']
  };
  static elementDefinitions = { [Ghost.metadata.tag]: Ghost };
  readonly #i18nController: I18nController<this> = new I18nController<this>(this, i18nDefaults);

  /** Localized labels and placement announcements. Grid placement placeholders are column, row, columnSpan, and rowSpan. */
  @property({ type: Object, attribute: false }) i18n = this.#i18nController.i18n;

  /** Enables moving and resizing panels through controls and placement commands. */
  @property({ type: Boolean, reflect: true }) rearrangeable = false;

  /** Enables native fullscreen commands and a header control for each panel. Turning this off preserves an accepted session and its exit control. Fullscreen does not change the saved arrangement. */
  @property({ type: Boolean, reflect: true }) fullscreenable = false;

  /** Selects panel content framing. */
  @property({ reflect: true }) container?: 'inset' | 'flat' | 'full';

  /** Cell sizing, defaulting to fit. Fit sizing fits bounded tracks to the viewport and scrolls along the growth axis. Fixed sizing uses the configured --column-size and --row-size dimensions and may scroll on both axes. Does not change value. */
  @property({ reflect: true }) sizing: 'fit' | 'fixed' = 'fit';

  /** Guide visibility: auto shows circular cell-center guides during pointer arrangement, visible always shows them, and hidden hides them while keeping the destination preview. Attribute keywords ignore case; missing, empty, or unrecognized values use auto. Does not change value or interaction permissions. */
  @property({ type: String, reflect: true }) guides: 'auto' | 'visible' | 'hidden' = 'auto';

  /** Closes growth-axis gaps toward top in vertical flow or inline start in horizontal flow, preserving bounded-axis positions and spans. Defaults to false. Enabling silently canonicalizes the current arrangement; disabling keeps current coordinates. This policy is independent of value. */
  @property({ type: Boolean, reflect: true, attribute: 'autosettle' })
  get autoSettle(): boolean {
    return this.#autoSettle;
  }

  set autoSettle(value: boolean) {
    const previous = this.#autoSettle;
    if (previous === value) return;
    if (
      !isServer &&
      this.isConnected &&
      this.#composition.catalogueReady &&
      this.#layout &&
      !reconcileDashboard(
        this.#layout,
        this.#composition.ownedPanels.map(panel => panel._getSpanConstraints()),
        { autoSettle: value, hidden: this.#composition.hiddenPanelIds }
      )
    ) {
      throw new RangeError('Dashboard arrangement conflicts with panel constraints');
    }

    this.#interaction.cancel();
    this.#autoSettle = value;
    this.value = this.#value;
    this.#commands.invalidate();
    this.requestUpdate('autoSettle', previous);
  }

  /** Version 1 JSON with grid {flow, tracks} and items {id, column, row, columnSpan, rowSpan}. Positions are zero-based cells from inline start and top; column zero is at the right in RTL. Spans count columns and rows. Defaults to an empty string, which seeds one-cell panels in DOM order. Assignment validates the saved model immediately and normalizes panels once their upgrades and unique nonempty IDs are ready; restoration is silent. Intentional gaps remain when autoSettle is false. After successful reconciliation, only direct default-slot panel children remain in the value, including hidden children. Removed panels lose their placement. Applications own content data, persistence, and any saved placement history. */
  @property({ type: String })
  get value(): string {
    return this.#value;
  }

  set value(value: string) {
    const parsed = parseDashboardValue(value);
    const layout =
      parsed && !isServer && this.isConnected && this.#composition.catalogueReady
        ? reconcileDashboard(
            parsed,
            this.#composition.ownedPanels.map(panel => panel._getSpanConstraints()),
            { autoSettle: this.autoSettle, hidden: this.#composition.hiddenPanelIds }
          )
        : parsed;
    if (parsed && !layout) throw new RangeError('Dashboard arrangement conflicts with panel constraints');

    this.#interaction.cancel();

    const old = this.#value;

    this.#setLayout(layout);
    this.#reconciliation = 'pending';
    this.#restoring = true;
    this.requestUpdate('value', old);
  }

  /** Growth direction, defaulting to vertical with bounded columns. Horizontal flow bounds rows. Changing flow does not transpose panel coordinates or spans. Assignment updates the arrangement silently; changes that conflict with panel constraints throw before changing the arrangement. */
  @property({ type: String })
  get flow(): 'vertical' | 'horizontal' {
    return this.#layout?.grid.flow ?? 'vertical';
  }

  set flow(value: 'vertical' | 'horizontal') {
    if (value !== 'vertical' && value !== 'horizontal') throw new TypeError('Invalid dashboard flow');

    if (this.flow !== value) {
      this.#configureGrid({ ...this.#current.grid, flow: value });
    }
  }

  /** Bounded-axis track count, defaulting to 12. Valid integers range from 1 through 1000000. Assignment updates the arrangement silently and rejects changes that conflict with panel constraints. */
  @property({ type: Number })
  get tracks(): number {
    return this.#layout?.grid.tracks ?? 12;
  }

  set tracks(value: number) {
    if (!Number.isSafeInteger(value) || value < 1 || value > 1_000_000) {
      throw new TypeError('Invalid dashboard tracks');
    }

    if (this.tracks !== value) {
      this.#configureGrid({ ...this.#current.grid, tracks: value });
    }
  }

  #labels: Readonly<Record<string, string>> = {};
  #labelsSource?: typeof this.i18n;
  #layout?: DashboardLayout;
  #value = '';
  #autoSettle = false;
  #reconciliation: 'pending' | 'unchanged' | 'changed' = 'pending';
  #restoring = true;
  #known = new Set<string>();
  #preview?: DashboardLayout;
  #pointerPresentation?: DashboardPointerPresentation;
  @state() private announcement = '';

  readonly #fullscreen: DashboardFullscreenController = new DashboardFullscreenController(this, {
    hasPanel: id => this.#composition.hasPresentablePanel(id),
    cancelInteractions: () => this.#interaction.cancel(),
    invalidateCommandAvailability: () => {
      this.#interaction.cancel();
      this.#commands.invalidate();
      this.requestUpdate();
    }
  });

  readonly #composition: DashboardCompositionController = new DashboardCompositionController(this, {
    getLayout: () => (this.#reconciliation === 'pending' ? undefined : this.#layout),
    getCanonicalLayout: () => this.#canonicalLayout,
    getPreview: () => this.#preview,
    getPointerPresentation: () => this.#pointerPresentation,
    getMetrics: () => this.#measurement.metrics,
    getLabels: () => this.#labels,
    isActionAllowed: (panel, action) => this.#arrangement.isActionAllowed(panel, action),
    fullscreen: this.#fullscreen,
    measure: () => this.#measurement.measure(),
    changed: catalogue => {
      if (catalogue) {
        this.#interaction.cancel();
      }

      this.#commands.invalidate();
      this.requestUpdate();
    }
  });
  readonly #measurement: DashboardMeasurementController = new DashboardMeasurementController(this, {
    getPanels: () => this.#composition.panels,
    getViewport: () => this.#composition.viewport,
    getGrid: () => this.#composition.pendingPresentation?.layout?.grid ?? this.#current.grid,
    getSizing: () => this.#composition.pendingPresentation?.sizing ?? this.sizing,
    pitchChanged: () => this.#interaction.cancel()
  });
  readonly #arrangement: DashboardArrangementController = new DashboardArrangementController(this, {
    getPanels: () => this.#composition.panels,
    getOwnedPanels: () => this.#composition.ownedPanels,
    isReady: () => this.#composition.catalogueReady,
    getKnown: () => this.#known,
    getLayout: () => this.#canonicalLayout,
    isFullscreenActive: () => this.#fullscreen.active,
    cancel: () => this.#interaction.cancel(),
    commit: layout => this.#commit(layout)
  });
  readonly #commands: DashboardCommandController = new DashboardCommandController(this, {
    getPanels: () => this.#composition.panels,
    getLayout: () => this.#canonicalLayout,
    findLayoutProposal: (layout, id, request) => this.#arrangement.findLayoutProposal(layout, id, request),
    canCommit: layout => this.#arrangement.canCommit(layout),
    cancel: () => this.#interaction.cancel(),
    commit: layout => this.#commit(layout),
    fullscreen: this.#fullscreen
  });

  readonly #interaction: DashboardInteractionController = new DashboardInteractionController(this, {
    getLayout: () => this.#canonicalLayout,
    getArrangementStateKey: () => this.#arrangement.getArrangementStateKey(),
    getMetrics: () => {
      this.#measurement.measure();
      return this.#measurement.metrics;
    },
    getViewport: () => this.#composition.viewport,
    isActionAllowed: (panel, action) => this.#arrangement.isActionAllowed(panel, action),
    findPointerProposal: (layout, request) => this.#arrangement.findLayoutProposal(layout, request.id, request.intent),
    getMovementTarget: resolveDashboardTarget,
    findCommandProposal: (layout, id, request) =>
      this.#arrangement.findLayoutProposal(layout, id, { kind: 'command', ...request }),
    present: (layout, presentation) => {
      this.#preview = layout;
      this.#composition.captureCorners(presentation?.panel);
      this.#pointerPresentation = presentation;
      this.requestUpdate();
    },
    commit: layout => this.#commit(layout),
    reveal: (layout, control) => {
      void this.#composition.revealKeyboardControl(layout, control);
    },
    announce: (id, placement, valid) => {
      this.announcement = `${this.#composition.getPanelLabel(id)}: ${
        valid
          ? (this.i18n.gridPlacement ?? i18nDefaults.gridPlacement)
              .replace('{column}', `${placement.column + 1}`)
              .replace('{row}', `${placement.row + 1}`)
              .replace('{columnSpan}', `${placement.columnSpan}`)
              .replace('{rowSpan}', `${placement.rowSpan}`)
          : (this.i18n.placementUnavailable ?? i18nDefaults.placementUnavailable)
      }`;
    }
  });

  protected firstUpdated() {
    if (isServer) return;

    this.#measurement.observe();
    this.#measurement.measure();
  }

  protected willUpdate(changed: PropertyValues<this>) {
    if (changed.has('sizing') || changed.has('rearrangeable')) {
      this.#interaction.cancel();
    }

    if (changed.has('rearrangeable') || changed.has('fullscreenable')) {
      this.#commands.invalidate();
    }

    if (isServer) return;

    this.#reconcilePanels();
  }

  #reconcilePanels() {
    this.#reconciliation = 'pending';
    if (!this.isConnected || !this.#composition.catalogueReady) return;

    const panels = this.#composition.panels;
    const constraints = this.#composition.ownedPanels.map(panel => panel._getSpanConstraints());
    const next = reconcileDashboard(this.#current, constraints, {
      priority: this.#restoring ? undefined : this.#known,
      autoSettle: this.autoSettle,
      hidden: this.#composition.hiddenPanelIds
    });
    if (!next) return;

    const previous = this.#value;

    this.#setLayout(next);
    this.#reconciliation = !this.#restoring && previous !== this.#value ? 'changed' : 'unchanged';
    this.#known = new Set(panels.map(panel => panel.id));
    this.#restoring = false;
  }

  protected updated() {
    if (isServer) return;

    this.#measurement.observePanels();
    this.#measurement.measure();

    if (this.#reconciliation !== 'pending') {
      this.#updateLabels();
    }

    this.#composition.present();

    if (this.#reconciliation === 'changed') {
      this.#reconciliation = 'unchanged';
      this.#emitChange();
    }

    this.#commands.flush();
  }

  /** Requests an integer placement without gesture target snapping. Anchored span changes use resizing permission, including left and top edges that change the origin; other position changes require movement. Directional collisions and optional growth-axis settling determine the final arrangement. Returns false for unavailable, invalid, or unchanged normalized placement. Successful placement emits one change. */
  place(id: string, placement: DashboardGridPlacement): boolean {
    return this.#arrangement.place(id, placement);
  }

  /** Queries arrangement and fullscreen commands using a panel ID. A placement supplies the full grid placement for --place, or the desired bounded-axis coordinate for --move-to-start. Availability compares the complete normalized proposal with the current arrangement. Directional movement derives from grid placement and panel permissions without requiring rendered controls. Native fullscreen admission remains subject to browser permission. */
  isCommandAvailable(command: string, context: DashboardCommandContext = {}): boolean {
    return this.#commands.isCommandAvailable(command, context);
  }

  get #canonicalLayout() {
    if (!this.#composition.catalogueReady) return undefined;

    return reconcileDashboard(
      this.#current,
      this.#composition.ownedPanels.map(panel => panel._getSpanConstraints()),
      { priority: this.#known, autoSettle: this.autoSettle, hidden: this.#composition.hiddenPanelIds }
    );
  }

  get #current() {
    return this.#layout ?? createDefaultDashboardLayout();
  }

  #configureGrid(grid: DashboardLayout['grid']) {
    const old = this.#value;
    const items = this.#current.items.map(item => ({
      ...item,
      column:
        grid.flow === 'vertical' ? Math.min(item.column, Math.max(0, grid.tracks - item.columnSpan)) : item.column,
      row: grid.flow === 'horizontal' ? Math.min(item.row, Math.max(0, grid.tracks - item.rowSpan)) : item.row,
      columnSpan: grid.flow === 'vertical' ? Math.min(item.columnSpan, grid.tracks) : item.columnSpan,
      rowSpan: grid.flow === 'horizontal' ? Math.min(item.rowSpan, grid.tracks) : item.rowSpan
    }));
    const proposed: DashboardLayout = { version: 1, grid, items };
    const next =
      this.isConnected && this.#composition.catalogueReady
        ? reconcileDashboard(
            proposed,
            this.#composition.ownedPanels.map(panel => panel._getSpanConstraints()),
            { autoSettle: this.autoSettle, hidden: this.#composition.hiddenPanelIds }
          )
        : proposed;
    if (!next) throw new RangeError('Dashboard grid conflicts with panel constraints');

    this.#interaction.cancel();
    this.#setLayout(next);
    this.#reconciliation = 'pending';
    this.#restoring = true;
    this.requestUpdate('value', old);
  }

  #setLayout(layout: DashboardLayout | undefined) {
    const value = serializeDashboardValue(layout);

    if (value !== this.#value) {
      this.#commands.invalidate();
    }

    this.#layout = layout;
    this.#value = value;
  }

  #commit(layout: DashboardLayout): boolean {
    if (!this.#arrangement.canCommit(layout)) return false;

    this.#setLayout(layout);
    this.#known = new Set(this.#composition.panels.map(panel => panel.id));
    this.#restoring = false;
    this.#reconciliation = 'unchanged';
    this.#emitChange();
    this.requestUpdate();

    return true;
  }

  #emitChange() {
    this.#commands.invalidate();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  #updateLabels() {
    if (this.#labelsSource !== this.i18n) {
      this.#labelsSource = this.i18n;
      this.#labels = {
        move: this.i18n.move ?? i18nDefaults.move,
        resize: this.i18n.resize ?? i18nDefaults.resize,
        enterFullscreen: this.i18n.enterFullscreen ?? i18nDefaults.enterFullscreen,
        exitFullscreen: this.i18n.exitFullscreen ?? i18nDefaults.exitFullscreen
      };
    }
  }

  #getCanvasStyle(geometry: { width: number; height: number; grid: DashboardLayout['grid']; sizing: 'fit' | 'fixed' }) {
    if (this.#fullscreen.active) return { width: '100%', height: '100%' };

    const { width, height, grid, sizing } = geometry;

    if (grid.flow === 'vertical') {
      const boundedWidth =
        sizing === 'fit'
          ? '100%'
          : 'calc(var(--_tracks) * (var(--column-size) + var(--_geometry-spacing)) - var(--_geometry-spacing))';

      return { width: boundedWidth, height: `${height}px`, '--_tracks': `${grid.tracks}` };
    }

    const boundedHeight =
      sizing === 'fit'
        ? '100%'
        : 'calc(var(--_tracks) * (var(--row-size) + var(--_geometry-spacing)) - var(--_geometry-spacing))';

    return {
      width: `${width}px`,
      height: boundedHeight,
      '--_tracks': `${grid.tracks}`
    };
  }

  #getGhostPixelPlacement(items: DashboardLayout['items']) {
    const source =
      this.#pointerPresentation?.preview &&
      (this.#pointerPresentation.rejected
        ? this.#pointerPresentation.initialPlacement
        : items.find(item => item.id === this.#pointerPresentation?.panel.id));
    return source && this.#measurement.metrics
      ? getDashboardPixelPlacement(source, this.#measurement.metrics)
      : undefined;
  }

  get #canvasFloor() {
    const viewport = this.#composition.viewport;
    if (!this.#pointerPresentation?.canvasPlacement || !viewport) return undefined;

    return {
      width: Math.abs(viewport.scrollLeft) + viewport.clientWidth,
      height: viewport.scrollTop + viewport.clientHeight
    };
  }

  #getPresentationModel() {
    const previous = this.#composition.pendingPresentation;
    const panels = isServer ? [] : this.#composition.panels;

    if (previous) {
      return {
        layout: previous.layout ?? this.#current,
        metrics: this.#measurement.metrics ?? previous.metrics,
        items: panels.flatMap(panel => {
          const item = previous.panels.get(panel);
          return item ? [item] : [];
        }),
        sizing: previous.sizing,
        presented: true
      };
    }

    const layout = this.#preview ?? this.#layout ?? this.#current;
    const available = new Set(panels.map(panel => panel.id));

    return {
      layout,
      metrics: this.#measurement.metrics,
      items: layout.items.filter(item => available.has(item.id)),
      sizing: this.sizing,
      presented: false
    };
  }

  #getRenderGeometry() {
    const model = this.#getPresentationModel();
    const { layout, metrics, items, sizing, presented } = model;
    const size = metrics
      ? getDashboardCanvasSize({ layout, metrics, sizing, items, floor: this.#canvasFloor })
      : { width: 0, height: 0 };

    return { ...size, grid: layout.grid, sizing, presented, preview: this.#getGhostPixelPlacement(items) };
  }

  #renderStartCue() {
    return this.#pointerPresentation?.preview && this.#pointerPresentation.start && !this.#pointerPresentation.rejected
      ? html`<div class="start-cue" aria-hidden="true" inert></div>`
      : null;
  }

  #renderGhost(preview: DashboardPixelPlacement | undefined) {
    return preview
      ? html`<nve-ghost part="ghost" style=${styleMap({ '--_dashboard-inline-start': `${preview.inlineStart}px`, top: `${preview.top}px`, width: `${preview.width}px`, height: `${preview.height}px`, ...this.#composition.ghostCorners })}></nve-ghost>`
      : null;
  }

  render() {
    const geometry = this.#getRenderGeometry();
    const { preview, grid, sizing } = geometry;
    return html`
      <div internal-host>
        <div class="viewport" data-flow=${grid.flow} data-sizing=${sizing} ?data-fullscreen=${this.#fullscreen.active}>
          <div
            class="canvas"
            ?hidden=${!isServer && this.#restoring && !geometry.presented}
            ?data-arranging=${!!this.#pointerPresentation?.preview}
            style=${styleMap(this.#getCanvasStyle(geometry))}
          >
            <slot @slotchange=${() => this.requestUpdate()}></slot>
            ${this.#renderStartCue()} ${this.#renderGhost(preview)}
          </div>
        </div>
        <div class="metric" aria-hidden="true"></div>
        <div class="gap-metric" aria-hidden="true"></div>
        <div
          class="announcement"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          ${this.announcement}
        </div>
      </div>
    `;
  }
}
