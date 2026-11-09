// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, isServer, LitElement, type PropertyValues, svg } from 'lit';
import { property } from 'lit/decorators/property.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';

import { matchesElementName, type Point, type Rect, scopedRegistry, useStyles } from '@nvidia-elements/core/internal';
import { I18nController, type I18nDefaults } from '@nvidia-elements/foundations/internal/i18n';

import { DragHandle } from '@nvidia-elements/core/drag-handle';
import { Ghost } from '@nvidia-elements/core/ghost';
import { Icon } from '@nvidia-elements/core/icon';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { ResizeHandle } from '@nvidia-elements/core/resize-handle';
import { Tabs, TabsItem, TabsItemGroup } from '@nvidia-elements/core/tabs';

import { WorkspaceCommandController } from './controllers/workspace-command.controller.js';
import { WorkspaceCompositionController } from './controllers/workspace-composition.controller.js';
import { WorkspaceFullscreenController } from './controllers/workspace-fullscreen.controller.js';
import { WorkspaceMeasurementController } from './controllers/workspace-measurement.controller.js';
import { WorkspaceRearrangeController } from './controllers/workspace-rearrange.controller.js';
import { WorkspaceResizeController } from './controllers/workspace-resize.controller.js';
import { WorkspaceRestorationController } from './controllers/workspace-restoration.controller.js';
import { getPanelMembershipKey } from './utils/model/membership.utils.js';
import {
  closePanel,
  findGroup,
  openPanel,
  projectLayout,
  reconcilePanels,
  selectPanel
} from './utils/model/operations.utils.js';
import { parseWorkspaceValue, sameWorkspaceLayout, serializeWorkspaceValue } from './utils/model/value.utils.js';
import { getAdmissiblePlacementLayout } from './utils/placement/preparation.utils.js';
import {
  focusWorkspacePanel,
  getPanelLabel,
  shouldFocusAfterWorkspaceClose
} from './utils/presentation/composition.utils.js';
import { getAllocatedTabWidth, preserveRecipientSelection } from './utils/presentation/groups.utils.js';
import {
  getRegionCornerStyle,
  preparePreviewBoundaries,
  shouldEmphasizeReservedDestination
} from './utils/presentation/preview.utils.js';
import { WorkspaceEvaluationCache } from './utils/evaluation.utils.js';

import { WorkspacePanel } from './panel/panel.js';

import type { WorkspaceRearrangeCapabilities } from './controllers/workspace-rearrange.controller.js';
import type { WorkspaceBoundary, WorkspacePlacedRegion } from './utils/geometry/allocation.utils.js';
import type { WorkspaceCommandContext, WorkspacePlacementIntent } from './utils/interaction/command.utils.js';
import type { WorkspaceDragPreview } from './utils/interaction/drag-preview.utils.js';
import type { WorkspaceInsertionOffer } from './utils/interaction/insertion-offers.utils.js';
import type { WorkspaceLayout } from './utils/model/layout.utils.js';
import type { WorkspacePresentedGroup } from './utils/presentation/groups.utils.js';
import type { WorkspaceMeasurementChange, WorkspaceMeasurements } from './utils/presentation/measurements.utils.js';
import type { PreviewBoundary } from './utils/presentation/preview.utils.js';
import type { WorkspaceEvaluation, WorkspaceEvaluationDelegate } from './utils/evaluation.utils.js';

import type { WorkspaceAnimationOptions } from './workspace.types.js';

import styles from './workspace.css?inline';

interface CachedPreviewBoundaries {
  catalogRegions: WorkspacePlacedRegion[];
  placedRegions: WorkspacePlacedRegion[];
  sourcePanelIds: string[];
  boundaries: PreviewBoundary[];
}

const i18nDefaults = {
  close: 'close',
  move: 'move',
  enterFullscreen: 'enter full screen',
  exitFullscreen: 'exit full screen'
} satisfies I18nDefaults;

/**
 * @element nve-workspace
 * @description A workspace provides a malleable arrangement of application panels in a restorable layout.
 * @documentation https://nvidia.github.io/elements/docs/elements/workspace/
 * @since 0.0.0
 * @stable false
 * @entrypoint \@nvidia-elements/core/workspace
 * @command --enter-fullscreen - Present the invoking panel's group in native fullscreen.
 * @command --exit-fullscreen - Exit native fullscreen.
 * @command --toggle-fullscreen - Toggle native fullscreen for the invoking panel's group.
 * @command --open - Open and activate the targeted supplied panel. Repeated activation is silent.
 * @command --close - Close the targeted panel when its workspace is closable.
 * @command --select - Activate an open supplied panel without reopening a closed panel.
 * @command --place - Apply the invoker's typed placement request when rearrangeable; membership changes also require groupable.
 * @slot - Workspace panels with durable IDs and application dropdown groups.
 * @event change - Announces a committed arrangement value after interaction, commands, or reconciliation of newly supplied panels. Read value on the workspace.
 * @event commandavailabilitychange - Command availability may have changed; query relevant commands again.
 * @cssprop --gap - Space between groups as one nonnegative CSS length.
 * @cssprop --border-radius - Corner radius of contained groups.
 * @cssprop --tab-min-width - Smallest tab width before scrolling.
 * @cssprop --tab-border - Border between tabs, after the drag handle, and before group controls without an authored suffix.
 * @cssprop --header-control-size - Size of built-in header buttons and the base drag handle width.
 * @cssprop --header-control-inset - Horizontal spacing around fullscreen and the drag handle.
 * @cssprop --close-button-inset - Space after each panel close control.
 * @cssprop --animation-duration - Duration of coordinated layout and placement transitions.
 * @cssprop --animation-easing - Easing of coordinated layout and placement transitions.
 * @cssprop --gutter-background - Idle separator fill.
 * @cssprop --gutter-hover-background - Separator fill on hover.
 * @csspart tabs - Tab strips.
 * @csspart tabs-item - Panel selection controls.
 * @csspart tab - Alias for panel selection controls.
 * @csspart tabs-item-group - Tab and accessory layouts.
 * @csspart icon-button - Built-in header icon controls.
 * @csspart fullscreen-button - Group fullscreen control.
 * @csspart close-button - Panel closing controls.
 * @csspart resize-handle - Separator control.
 * @csspart ghost - Destination and carried previews.
 * @csspart destination-ghost - Animated insertion cue.
 * @csspart carried-ghost - Pointer-following carried panel previews.
 * @csspart icon - Placement status icons.
 * @csspart blocked-icon - Unavailable placement indicator.
 * @csspart drag-handle - Group movement control.
 */
@scopedRegistry()
export class Workspace extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-workspace',
    version: '0.0.0',
    children: ['nve-workspace-panel', 'nve-dropdown-group']
  };

  static elementDefinitions = {
    [DragHandle.metadata.tag]: DragHandle,
    [Ghost.metadata.tag]: Ghost,
    [Icon.metadata.tag]: Icon,
    [IconButton.metadata.tag]: IconButton,
    [ResizeHandle.metadata.tag]: ResizeHandle,
    [Tabs.metadata.tag]: Tabs,
    [TabsItem.metadata.tag]: TabsItem,
    [TabsItemGroup.metadata.tag]: TabsItemGroup
  };

  readonly #i18nController: I18nController<this> = new I18nController<this>(this, i18nDefaults);

  /** Overrides localized workspace controls. */
  @property({ type: Object, attribute: false }) i18n = this.#i18nController.i18n;

  /** Enables separator resizing. */
  @property({ type: Boolean, reflect: true }) resizable = false;

  /** Enables moving groups and placement commands. Dragging individual tabs also requires groupable. */
  @property({ type: Boolean, reflect: true }) rearrangeable = false;

  /** Enables dragging individual tabs, joining panels, and extracting panels when rearrangeable. */
  @property({ type: Boolean, reflect: true }) groupable = false;

  /** Enables native fullscreen commands and one persistent control per group. Turning this off preserves an accepted session and its exit control. Fullscreen does not change the saved arrangement. */
  @property({ type: Boolean, reflect: true }) fullscreenable = false;

  /** Radial pointer distance in CSS pixels before a carried source detaches. Captured at gesture press. */
  @property({ type: Number, attribute: 'detach-threshold' }) detachThreshold = 48;

  /** Enables closing supplied panels. */
  @property({ type: Boolean, reflect: true }) closable = false;

  /** Selects separator constraint behavior. */
  @property({ attribute: 'resize-policy' }) resizePolicy: 'stop' | 'propagate' = 'stop';

  /** Selects panel content framing. */
  @property({ reflect: true }) container?: 'inset' | 'flat' | 'full';

  /** Versioned JSON arrangement. Assignment restores without emitting change. */
  @property({ type: String })
  get value(): string {
    return this.#value;
  }

  set value(value: string) {
    const next = parseWorkspaceValue(value);
    this.#restoration.finish();
    this.#restore(next);
  }

  #layout?: WorkspaceLayout;
  #value = '';
  #restoring = false;
  #dragPreview?: WorkspaceDragPreview;
  #cachedPreviewBoundaries?: CachedPreviewBoundaries;
  readonly #evaluationCache = new WorkspaceEvaluationCache(this);

  readonly #restoration = new WorkspaceRestorationController(this, {
    getLayout: () => this.#layout,
    applyLayout: layout => this.#restore(layout),
    getTransitionTargets: () => this.#composition.getTransitionTargets()
  });

  readonly #commands = new WorkspaceCommandController(this, {
    getState: () => ({
      panels: this.#panels,
      layout: this.#layout
    }),
    isRearrangementAllowed: () => !this.#fullscreen.active,
    isPlacementAvailable: (source, intent) => !!this.#getPlacementLayout(source, intent),
    canEnterFullscreen: targetPanelId => this.#fullscreen.canEnter(targetPanelId),
    canExitFullscreen: () => this.#fullscreen.canExit,
    isFullscreenGroup: targetPanelId => this.#fullscreen.isSelectedGroup(targetPanelId),
    enterFullscreen: targetPanelId => this.#fullscreen.enter(targetPanelId),
    exitFullscreen: () => this.#fullscreen.exit(),
    activatePanel: (anchor, operation) => this.#activatePanel(anchor, operation),
    closePanel: anchor => this.#close(anchor),
    placePanel: (source, intent) => this.#move(source, intent)
  });

  readonly #fullscreen = new WorkspaceFullscreenController(this, {
    getGroup: targetPanelId =>
      findGroup(this.#getProjectedLayout(this.#currentLayout).root, targetPanelId)?.panels ?? [],
    cancelInteractions: () => {
      this.#restoration.finish();
      this.#rearrange.cancel();
      this.#resize.cancel();
    },
    invalidateCommandAvailability: () => {
      this.#commands.invalidateAvailability();
      this.#measurementController.invalidate();
    }
  });

  readonly #rearrange: WorkspaceRearrangeController = new WorkspaceRearrangeController(this, {
    evaluateWithContext: work => this.#withEvaluation(work),
    isRearrangementAllowed: () => !this.#fullscreen.active && !this.#restoration.active,
    getLayout: () => this.#layout,
    getMeasurements: () => this.#measurements,
    getAvailablePanels: () => this.#available,
    activateSource: (source, group) => this.#activateSource(source, group),
    applyPreview: preview => {
      if (preview?.phase !== 'detached') {
        this.#evaluationCache.clear();
        this.#cachedPreviewBoundaries = undefined;
      }
      this.#dragPreview = preview;
      this.requestUpdate();
    },
    commitPlacement: (source, intent, layout) =>
      this.#move(source, intent, { layout, capabilities: this.#placementCapabilities, focus: false })
  });

  #presentedGroups: WorkspacePresentedGroup[] = [];
  #boundaries: WorkspaceBoundary[] = [];

  #latestMeasurements: WorkspaceMeasurements = {
    gap: 0,
    headerHeight: 0,
    gripWidth: 0,
    actionWidth: 0,
    groupActionWidth: 0,
    tabWidth: 0,
    tabMinWidth: 0,
    width: 0,
    height: 0
  };

  readonly #resize: WorkspaceResizeController = new WorkspaceResizeController(this, {
    isEnabled: () => this.#canResize,
    getLayout: () => this.#layout,
    getBoundaries: () => this.#boundaries,
    getAvailablePanels: () => this.#available,
    getPresentation: () => ({
      measurements: this.#measurements,
      rearrangeable: this.#placementCapabilities.rearrangeable,
      closable: this.closable,
      fullscreenable: this.fullscreenable
    }),
    cancelForUser: () => this.#restoration.transition(() => this.#resize.cancel()),
    commitLayout: layout => this.#commitResize(layout)
  });

  readonly #measurementController = new WorkspaceMeasurementController(this, {
    getPanels: () => this.#panels,
    isPresented: id =>
      !this.#isCarried(id) && this.#presentedGroups.some(group => group.panels.some(panel => panel.id === id)),
    isCarried: id => !this.#layout?.closed.includes(id) && this.#isCarried(id),
    applyMeasurements: change => this.#applyMeasurements(change)
  });

  readonly #composition = new WorkspaceCompositionController(this, {
    getPanels: () => this.#panels,
    getGroups: () => this.#presentedGroups,
    getLayout: () => this.#layout,
    getPreview: () => this.#dragPreview,
    scrollChanged: () => this.#rearrange.refresh(),
    contentChanged: kind => {
      if (kind === 'panels') {
        this.#restoration.finish();
        this.#commands.invalidateAvailability();
        this.#resize.cancel();
        this.#rearrange.cancel();
      }
      this.#measurementController.invalidate();
      this.requestUpdate();
    }
  });

  readonly #evaluationDelegate: WorkspaceEvaluationDelegate = {
    getCurrentLayout: () => this.#currentLayout,
    getCurrentMeasurements: () => this.#measurements,
    getCurrentPreview: () => this.#dragPreview,
    getFullscreenTarget: () => this.#fullscreen.targetPanelId,
    getResizePreview: () => this.#resize.preview
  };

  connectedCallback() {
    super.connectedCallback();
    this.#composition.startObserving();
  }

  disconnectedCallback() {
    this.#evaluationCache.clear();
    this.#cachedPreviewBoundaries = undefined;
    this.#rearrange.cancel();
    this.#composition.stopObserving();
    super.disconnectedCallback();
  }

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    this.#composition.captureFocus();

    if (
      ['value', 'fullscreenable', 'closable', 'rearrangeable', 'groupable', 'resizePolicy'].some(key =>
        changed.has(key)
      )
    ) {
      this.#commands.invalidateAvailability();
    }
    if (['fullscreenable', 'closable', 'rearrangeable', 'groupable'].some(key => changed.has(key))) {
      this.#measurementController.invalidate();
    }

    this.#reconcile();
    this.#restoring = false;
  }

  protected updated() {
    this.#composition.sync();
    this.#commands.flushAvailability();
  }

  /** Restores an arrangement with animated geometry while retaining application content. */
  animateTo(value: string, options: WorkspaceAnimationOptions = {}): void {
    const next = parseWorkspaceValue(value);
    this.#restoration.animateTo(next, options);
  }

  /** Reports whether a command can change the panel identified by `context.value` in the current arrangement. Native fullscreen admission remains subject to browser permission. */
  isCommandAvailable(command: string, context: WorkspaceCommandContext = {}): boolean {
    return this.#commands.isCommandAvailable(command, context);
  }

  get #currentLayout(): WorkspaceLayout {
    return this.#layout ?? { version: 1, root: null, closed: [] };
  }

  get #panels(): WorkspacePanel[] {
    const evaluation = this.#evaluationCache.current;
    if (evaluation) return evaluation.panels;
    return isServer
      ? []
      : [...this.children].filter((child): child is WorkspacePanel => matchesElementName(child, WorkspacePanel));
  }

  get #available() {
    return this.#evaluationCache.current?.available ?? this.#panels.map(panel => panel.id);
  }

  get #measurements(): WorkspaceMeasurements {
    return this.#resize.presentation?.measurements ?? this.#latestMeasurements;
  }

  get #placementCapabilities() {
    return this.#rearrange.capabilities ?? { rearrangeable: this.rearrangeable, groupable: this.groupable };
  }

  get #presentationClosable() {
    return this.#resize.presentation?.closable ?? this.closable;
  }

  get #canResize() {
    return this.resizable && !this.#fullscreen.active;
  }

  get #showResizeHandles() {
    return this.#canResize || this.#resize.retainingHandles;
  }

  #reconcile() {
    const ids = this.#available;
    if (!ids.every(Boolean) || new Set(ids).size !== ids.length) return;
    if (!this.#layout) {
      if (ids.length) {
        this.#setLayout({ version: 1, root: { type: 'group', panels: ids, active: ids[0]! }, closed: [] });
      }
      return;
    }
    const next = reconcilePanels(this.#layout, ids);
    if (next === this.#layout) return;
    this.#setLayout(next);
    if (!this.#restoring) this.#commit();
  }

  #applyMeasurements(change: WorkspaceMeasurementChange) {
    this.#latestMeasurements = change.measurements;
    this.#commands.invalidateAvailability();
    this.requestUpdate();
    this.#resize.handleMeasurementsChange(change);
    this.#restoration.handleMeasurementsChange(change);
    this.#rearrange.handleMeasurementsChange(change);
  }

  #setLayout(layout: WorkspaceLayout | undefined) {
    if (layout === this.#layout) return;
    const value = serializeWorkspaceValue(layout);
    this.#layout = layout;
    this.#value = value;
  }

  #restore(next: WorkspaceLayout | undefined) {
    this.#rearrange.cancel();
    const old = this.value;
    this.#resize.resetForRestore();
    this.#setLayout(next);
    this.#restoring = true;
    this.requestUpdate('value', old);
  }

  #commit() {
    this.#commands.invalidateAvailability();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  #commitResize(layout: WorkspaceLayout) {
    const changed = !sameWorkspaceLayout(this.#layout, layout);
    if (changed) {
      this.#setLayout(layout);
      this.#commit();
    } else {
      this.requestUpdate();
    }
  }

  #activateSource(source: string[], group: boolean) {
    if (group) return;

    const anchor = source.find(id => !this.#layout?.closed.includes(id) && this.#available.includes(id));
    if (!anchor || !this.shadowRoot?.querySelector(`nve-tabs-item[data-panel="${CSS.escape(anchor)}"]`)) return;

    this.#activatePanel(anchor, 'select');
    this.#focusPanel(anchor);
  }

  #activatePanel(id: string, operation: 'open' | 'select') {
    this.#restoration.finish();
    if (!this.#layout || !this.#panels.some(panel => panel.id === id)) return;

    let opened = this.#layout;
    if (operation === 'open') {
      opened = openPanel(this.#layout, id) ?? this.#layout;
    }
    let next = selectPanel(opened, id);
    if (next === undefined && opened !== this.#layout) {
      next = opened;
    }
    if (!next) return;

    this.#rearrange.cancel();
    this.#resize.cancel();
    this.#setLayout(next);
    this.#commit();
  }

  #selectTab(id: string) {
    if (!this.#rearrange.suppressSelection) this.#activatePanel(id, 'select');
  }

  #move(
    source: string[],
    intent: WorkspacePlacementIntent,
    options: { layout?: WorkspaceLayout; capabilities?: WorkspaceRearrangeCapabilities; focus?: boolean } = {}
  ) {
    const capabilities = options.capabilities ?? { rearrangeable: this.rearrangeable, groupable: this.groupable };
    if (!capabilities.rearrangeable || this.#fullscreen.active) return false;

    const next = this.#getPlacementLayout(source, intent, {
      candidate: options.layout,
      groupable: capabilities.groupable
    });
    if (!next) return false;

    this.#restoration.finish();
    this.#rearrange.cancel();
    this.#resize.cancel();
    this.#setLayout(next);
    this.#commit();
    this.#focusPlacement(source, options);
    return true;
  }

  #close(id: string) {
    this.#restoration.finish();
    if (!this.closable || !this.#layout) return;
    const next = closePanel(this.#layout, id);
    if (!next) return;
    const recoverFocus = shouldFocusAfterWorkspaceClose(this, id);
    this.#rearrange.cancel();
    this.#resize.cancel();
    this.#setLayout(next);
    this.#commit();
    const group = this.#presentedGroups.find(item => item.panels.some(panel => panel.id === id));
    if (recoverFocus) {
      this.#focusPanel(group?.panels.find(panel => panel.id !== id)?.id);
    }
  }

  #focusPlacement(source: string[], options: { focus?: boolean }) {
    if (options.focus === false) return;
    this.#focusPanel(
      source.find(id => !this.#layout?.closed.includes(id) && this.#panels.some(panel => panel.id === id))
    );
  }

  #focusPanel(id?: string) {
    void focusWorkspacePanel(this, { id });
  }

  #withEvaluation<T>(work: (evaluation: WorkspaceEvaluation) => T): T {
    const current = this.#evaluationCache.current;
    if (current) return work(current);
    const inputs = {
      panels: this.#panels,
      layout: this.#currentLayout,
      source: this.#dragPreview?.source ?? [],
      measurements: this.#measurements,
      policy: this.#resize.policy,
      strip: (group: WorkspacePresentedGroup) => this.#composition.findTabStrip(group)
    };
    return this.#evaluationCache.run(inputs, this.#evaluationDelegate, work);
  }

  #getProjectedLayout(layout: WorkspaceLayout) {
    return this.#evaluationCache.current?.project(layout) ?? projectLayout(layout, this.#available);
  }

  #getPlacementLayout(
    source: string[],
    intent: WorkspacePlacementIntent,
    options: { candidate?: WorkspaceLayout; groupable?: boolean } = {}
  ) {
    if (!this.#layout) return undefined;
    return this.#withEvaluation(evaluation =>
      getAdmissiblePlacementLayout({
        evaluation,
        layout: this.#currentLayout,
        measurements: this.#measurements,
        source,
        intent,
        groupable: options.groupable ?? this.groupable,
        candidate: options.candidate
      })
    );
  }

  #getCarriedPreviewContent(source: string[]) {
    const panels = this.#panels;
    const carried = source.filter(id => !this.#layout?.closed.includes(id) && panels.some(panel => panel.id === id));
    const active = findGroup(this.#layout?.root ?? null, carried[0])?.active;
    const front = active && carried.includes(active) ? active : carried[0];
    const frontPanel = front ? panels.find(panel => panel.id === front) : undefined;
    return { title: frontPanel ? getPanelLabel(frontPanel) : (front ?? ''), layers: Math.min(carried.length, 3) };
  }

  #isCarried(id: string) {
    return this.#dragPreview?.source.includes(id) ?? false;
  }

  #retainsPreviewSpace(preview = this.#dragPreview) {
    return !!preview && 'allocation' in preview && preview.allocation !== 'overlay';
  }

  render() {
    return this.#withEvaluation(evaluation => this.#renderWorkspace(evaluation));
  }

  #renderWorkspace(evaluation: WorkspaceEvaluation) {
    const drag = this.#dragPreview;
    const geometry = evaluation.presentationGeometry();
    this.#presentedGroups = preserveRecipientSelection(
      geometry.groups,
      this.#layout?.root ?? null,
      this.#dragPreview?.source
    );
    this.#boundaries = geometry.boundaries;
    const preview = this.#renderDragPreview(geometry.regions, evaluation);
    this.#composition.applyPresentation({
      groups: this.#presentedGroups,
      extent: geometry,
      container: this.container,
      measurements: this.#measurements,
      closable: this.#presentationClosable,
      animate: !!drag,
      source: drag?.source ?? [],
      scroll: group => evaluation.scroll(group)
    });
    return html`
      <div internal-host
        ?data-resizing=${this.#resize.resizing}
        ?data-fullscreen=${this.#fullscreen.active}
        ?data-rearranging=${!!drag}
        data-preview-allocation=${ifDefined(drag && 'allocation' in drag ? drag.allocation : undefined)}
        style=${`--_minimum-height:${evaluation.minimum(evaluation.project(this.#currentLayout).root).height}px`}>
        <div class="viewport" @scroll=${() => this.#rearrange.refresh()}>
          <div class="canvas" style=${`min-width:${geometry.minimum.width}px;min-height:${geometry.minimum.height}px`}>
            ${repeat(
              this.#presentedGroups,
              group => this.#composition.getGroupIdentity(group),
              group => this.#renderTabs(group)
            )}
            <slot @slotchange=${() => this.requestUpdate()}></slot>
            ${this.#renderResizeHandles()}
            <div class="preview-layer" data-drag-phase=${ifDefined(this.#dragPreview?.phase)}>${preview}</div>
          </div>
        </div>
        ${this.#renderMeasurementProbe()}
      </div>
    `;
  }

  #getPreviewBoundaries(
    catalogRegions: WorkspacePlacedRegion[],
    placedRegions: WorkspacePlacedRegion[],
    sourcePanelIds: string[]
  ): PreviewBoundary[] {
    const eligible = this.isConnected && this.#dragPreview?.phase === 'detached';
    const previous = this.#cachedPreviewBoundaries;
    if (
      eligible &&
      previous &&
      previous.catalogRegions === catalogRegions &&
      previous.placedRegions === placedRegions &&
      previous.sourcePanelIds.length === sourcePanelIds.length &&
      previous.sourcePanelIds.every((id, index) => id === sourcePanelIds[index])
    )
      return previous.boundaries;
    this.#cachedPreviewBoundaries = undefined;
    const boundaries = preparePreviewBoundaries(catalogRegions, placedRegions, sourcePanelIds);
    if (eligible) {
      this.#cachedPreviewBoundaries = {
        catalogRegions,
        placedRegions,
        sourcePanelIds: sourcePanelIds.slice(),
        boundaries
      };
    }
    return boundaries;
  }

  #renderPreviewBoundaries(boundaries: PreviewBoundary[], preview: WorkspaceDragPreview) {
    const activeKey = preview.scope && getPanelMembershipKey(preview.scope.members);
    return repeat(
      boundaries,
      boundary => boundary.key,
      boundary => html`
      <div class="scope-boundary"
        data-scope-boundary=${boundary.key}
        ?data-active=${boundary.key === activeKey}
        inert aria-hidden="true"
        style=${boundary.style}></div>
    `
    );
  }

  #renderDragPreview(placedRegions: WorkspacePlacedRegion[], evaluation: WorkspaceEvaluation) {
    const preview = this.#dragPreview;
    if (!preview) return null;
    const { x, y } = evaluation.client({ x: 0, y: 0, width: 0, height: 0 });
    const { title, layers } = this.#getCarriedPreviewContent(preview.source);
    const catalogRegions = evaluation.geometry(evaluation.project(this.#currentLayout)).regions;
    const boundaries = this.#getPreviewBoundaries(catalogRegions, placedRegions, preview.source);
    const bounds = evaluation.bounds();
    const hint = this.#rearrange.getPreviewHint(preview, evaluation);
    const { rect, kind } = preview.cue;
    const destination = { ...rect, x: rect.x - x, y: rect.y - y };
    const point = preview.point;
    return html`
      ${this.#renderPlacementHint(hint, x, y)}${this.#renderPreviewBoundaries(boundaries, preview)}
      <nve-ghost class="destination" part="ghost destination-ghost" data-destination-ghost
        ?data-cue-clipped=${rect.width <= 0 || rect.height <= 0}
        data-drag-phase=${preview.phase}
        ?data-drop-blocked=${preview.blocked}
        data-destination-kind=${kind}
        ?data-reserved-placement=${shouldEmphasizeReservedDestination(preview)}
        style=${`transform:translate(${rect.x - x}px,${rect.y - y}px);width:${rect.width}px;height:${rect.height}px;${getRegionCornerStyle(destination, placedRegions)}`}>
        ${
          preview.blocked
            ? html`
              <nve-icon part="icon blocked-icon" name="cancel" status="danger" size="lg" aria-hidden="true"></nve-icon>
            `
            : null
        }${this.#renderSeamBadges(preview)}
      </nve-ghost>
      ${point ? this.#renderCarriedPreview({ point, x, y, bounds, title, layers }) : null}
    `;
  }

  #renderPlacementHint(hint: WorkspaceInsertionOffer | undefined, x: number, y: number) {
    if (!hint) return null;

    return html`
      <div class="order-overlay"
        data-insertion-index=${hint.insertion.index}
        data-placement-hint=${hint.kind}
        inert aria-hidden="true"
        style=${`left:${hint.rect.x - x}px;top:${hint.rect.y - y}px;width:${hint.rect.width}px;height:${hint.rect.height}px`}></div>
    `;
  }

  #renderSeamBadges(preview: WorkspaceDragPreview | undefined) {
    if (!preview || preview.phase !== 'detached' || preview.blocked || !preview.seams) return null;
    const { kind, edges } = preview.seams;
    return html`
      ${edges.map(edge => {
        const vertical = edge.side === 'left' || edge.side === 'right';
        const normal =
          edge.side === 'left' || edge.side === 'top' ? `-${edge.offset}px` : `calc(100% + ${edge.offset}px)`;
        const position = vertical
          ? `left:${normal};top:${edge.fraction * 100}%`
          : `left:${edge.fraction * 100}%;top:${normal}`;
        const rotation = { right: 0, bottom: 90, left: 180, top: 270 }[edge.side];
        return html`
          <div class="seam-badge"
            data-seam-badge=${kind}
            data-seam-side=${edge.side}
            inert aria-hidden="true"
            style=${position}>
            <svg
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round"
              style=${`transform:rotate(${rotation}deg)`}>
              ${kind === 'split' ? this.#renderSplitSeamBadge() : this.#renderInsertSeamBadge()}
            </svg>
          </div>
        `;
      })}
    `;
  }

  #renderSplitSeamBadge() {
    return svg`<path d="M3 4h9v16H3z" fill="currentColor" fill-opacity=".2" stroke="none"></path><rect x="2" y="4" width="20" height="16" rx="1"></rect><path d="M12 4v16"></path>`;
  }

  #renderInsertSeamBadge() {
    return svg`<rect x="2" y="7" width="7" height="10" rx="1" fill="currentColor" fill-opacity=".2"></rect><path d="M22 4h-9v16h9"></path>`;
  }

  #renderCarriedPreview(input: { point: Point; x: number; y: number; bounds: Rect; title: string; layers: number }) {
    const { point, x, y, bounds, title, layers } = input;
    const right = bounds.x + bounds.width;
    const bottom = bounds.y + bounds.height;
    const px = Math.max(bounds.x, Math.min(point.x + 12, right));
    const py = Math.max(bounds.y, Math.min(point.y + 12, bottom));
    return html`
      <nve-ghost
        class="carried" part="ghost carried-ghost" data-carried-ghost .layers=${layers}
        style=${`left:${px - x}px;top:${py - y}px;width:max-content;max-width:${Math.max(0, Math.min(240, bounds.width))}px;max-height:${bounds.height}px;transform:translate(min(0px,calc(${right - px}px - 100%)),min(0px,calc(${bottom - py}px - 100%)))`}>${title}</nve-ghost>
    `;
  }

  #renderTabs(group: WorkspacePresentedGroup) {
    const measurements = this.#measurements;
    const { headerHeight } = measurements;
    const carried = this.#retainsPreviewSpace() && group.panels.every(panel => this.#isCarried(panel.id));
    const fullscreenSelected = this.#fullscreen.isSelectedGroup(group.active);
    const fullscreen = (this.#resize.presentation?.fullscreenable ?? this.fullscreenable) || fullscreenSelected;
    const actionWidth = fullscreen ? (measurements.groupActionWidth ?? 0) : 0;
    return html`
      <div class="group-chrome"
        style=${`left:${group.rect.x}px;top:${group.rect.y}px;width:${group.rect.width}px;height:${group.rect.height}px`}>
        <div class="tabs"
          ?data-carried-reservation=${carried}
          ?inert=${carried}
          aria-hidden=${ifDefined(carried ? 'true' : undefined)}
          style=${`height:${headerHeight}px`}>
          ${this.#renderGroupGrip(group)} ${this.#renderTabStrip(group, actionWidth)}
          ${fullscreen ? this.#renderFullscreenControl(group, fullscreenSelected) : null}
        </div>
      </div>
    `;
  }

  #renderGroupGrip(group: WorkspacePresentedGroup) {
    const rearrangeable =
      (this.#resize.presentation?.rearrangeable ?? this.#placementCapabilities.rearrangeable) &&
      !this.#fullscreen.active;
    return rearrangeable && group.gripWidth > 0
      ? html`
          <nve-drag-handle part="drag-handle"
            data-drag-group=${group.panels[0]?.id ?? ''}
            draggable="false"
            aria-label=${ifDefined(this.i18n.move)}
            @click=${(event: Event) => event.preventDefault()}></nve-drag-handle>
        `
      : null;
  }

  #renderTabStrip(group: WorkspacePresentedGroup, actionWidth: number) {
    const width = getAllocatedTabWidth(group, this.#measurements);
    const suffixWidth = this.#measurements.panels?.[group.active]?.suffixWidth ?? 0;
    return html`
      <div class="tablist"
        ?data-scrollable=${group.panels.length > 1}
        style=${`width:${Math.max(0, group.rect.width - group.gripWidth - suffixWidth - actionWidth)}px;margin-right:${suffixWidth}px`}
        data-group=${this.#composition.getGroupIdentity(group)}
        @scroll=${(event: Event) => this.#composition.handleScroll(group, event)}>
        ${this.#renderTabTrack(group, width)}
      </div>
    `;
  }

  #renderTabTrack(group: WorkspacePresentedGroup, width: number) {
    const entries = repeat(
      group.panels,
      panel => panel.id,
      (panel, index) => this.#renderTabEntry(group, panel, { left: index * width, width })
    );
    return group.tabbed
      ? html`
          <nve-tabs part="tabs" class="tab-track"
            @nve-key-change=${(event: CustomEvent<{ activeItem: HTMLElement }>) => {
              const id = event.detail.activeItem.dataset.panel;
              if (id) {
                this.#selectTab(id);
              }
            }}
            style=${`width:${group.panels.length * width}px`}>
            ${entries}
          </nve-tabs>
        `
      : html`
          <div class="tab-track" style=${`width:${group.panels.length * width}px`}>${entries}</div>
        `;
  }

  #renderTabEntry(group: WorkspacePresentedGroup, panel: WorkspacePanel, position: { left: number; width: number }) {
    const style = styleMap({
      left: `${position.left}px`,
      width: `${position.width}px`,
      '--height': `${this.#measurements.headerHeight}px`
    });
    const carried = this.#isCarried(panel.id);
    const title = panel.querySelector(':scope > nve-workspace-panel-header')
      ? null
      : html`<span class="fallback-title">${panel.id}</span>`;
    const close = this.#presentationClosable
      ? html`
          <nve-icon-button
            slot=${ifDefined(group.tabbed ? 'suffix' : undefined)}
            part="icon-button close-button" icon-name="cancel" container="flat" size="sm"
            data-close=${panel.id}
            aria-label=${`${this.i18n.close} ${getPanelLabel(panel)}`}
            @click=${() => this.#close(panel.id)}></nve-icon-button>
        `
      : null;
    return group.tabbed
      ? html`
          <nve-tabs-item-group part="tabs-item-group" class="tab-entry"
            ?data-carried-tab=${carried} ?inert=${carried}
            aria-hidden=${ifDefined(carried ? 'true' : undefined)}
            style=${style}>
            <nve-tabs-item part="tabs-item tab"
              data-panel=${panel.id}
              ?selected=${group.active === panel.id}
              aria-label=${panel.id}
              @pointerenter=${() => this.#composition.setHeaderHovered(panel.id, true)}
              @pointerleave=${() => this.#composition.setHeaderHovered(panel.id, false)}
              @click=${() => this.#selectTab(panel.id)}>${title}</nve-tabs-item>
            ${close}
          </nve-tabs-item-group>
        `
      : html`
          <div class="tab-entry panel-entry"
            ?data-carried-tab=${carried} ?inert=${carried}
            aria-hidden=${ifDefined(carried ? 'true' : undefined)}
            style=${style}>
            <div class="panel-title" data-panel=${panel.id} aria-hidden="true">${title}</div>
            ${close}
          </div>
        `;
  }

  #renderFullscreenControl(group: WorkspacePresentedGroup, selected: boolean) {
    const suffixWidth = this.#measurements.panels?.[group.active]?.suffixWidth ?? 0;
    const disabled = !this.isCommandAvailable('--toggle-fullscreen', { value: group.active });
    return html`
      <div class="group-actions" ?data-authored-suffix=${suffixWidth > 0}>
        <nve-icon-button part="icon-button fullscreen-button"
          icon-name=${selected ? 'minimize' : 'maximize'}
          container="flat" size="sm" command="--toggle-fullscreen"
          .commandForElement=${group.panels.find(panel => panel.id === group.active) ?? null}
          ?disabled=${disabled}
          aria-label=${ifDefined(selected ? this.i18n.exitFullscreen : this.i18n.enterFullscreen)}></nve-icon-button>
      </div>
    `;
  }

  #renderResizeHandles() {
    if (!this.#showResizeHandles) return null;

    return repeat(
      this.#boundaries,
      item => item.key,
      item => this.#renderHandle(item)
    );
  }

  #renderHandle(item: WorkspaceBoundary) {
    return html`
      <div class="gutter"
        style=${`left:${item.rect.x}px;top:${item.rect.y}px;width:${item.rect.width}px;height:${item.rect.height}px`}>
        <nve-resize-handle
          data-boundary=${item.key}
          part="resize-handle"
          orientation=${item.branch.axis === 'horizontal' ? 'vertical' : 'horizontal'}
          .min=${item.min}
          .max=${item.max}
          .step=${10}
          .value=${item.value}
          @nve-gesture-input=${this.#resize.gesture}
          @toggle=${(event: Event) => event.preventDefault()}
          @input=${(event: Event) => this.#resize.input(event, item)}
          @change=${(event: Event) => this.#resize.change(event, item)}></nve-resize-handle>
      </div>
    `;
  }

  #renderMeasurementProbe() {
    const { rearrangeable } = this.#placementCapabilities;
    const fullscreenable =
      this.fullscreenable || this.#presentedGroups.some(group => this.#fullscreen.isSelectedGroup(group.active));
    return html`
      <div class="chrome" data-chrome inert aria-hidden="true">
        <div class="gap-probe"></div>
        <div class="tab-min-probe"></div>
        <div class="chrome-header">
          <nve-tabs part="tabs">
            <nve-tabs-item-group part="tabs-item-group" class="tab-entry tab-probe">
              <nve-tabs-item part="tabs-item tab" tabindex="-1">&nbsp;</nve-tabs-item>
              ${
                this.closable
                  ? html`
                    <nve-icon-button
                      slot="suffix" part="icon-button close-button" icon-name="cancel" container="flat" size="sm"
                      tabindex="-1"></nve-icon-button>
                  `
                  : null
              }
            </nve-tabs-item-group>
          </nve-tabs>
          ${
            rearrangeable
              ? html`
                <nve-drag-handle part="drag-handle" draggable="false"></nve-drag-handle>
              `
              : null
          }${
            fullscreenable
              ? html`
                <div class="group-actions">
                  <nve-icon-button
                    part="icon-button fullscreen-button" icon-name="maximize" container="flat" size="sm"
                    tabindex="-1"></nve-icon-button>
                </div>
              `
              : null
          }
        </div>
      </div>
    `;
  }
}
