// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, isServer, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import { Button } from '@nvidia-elements/core/button';
import { DragHandle } from '@nvidia-elements/core/drag-handle';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Tabs, TabsItem, TabsItemGroup } from '@nvidia-elements/core/tabs';
import { Ghost } from '@nvidia-elements/core/ghost';
import { Icon } from '@nvidia-elements/core/icon';
import {
  useStyles,
  I18nController,
  scopedRegistry,
  appendRootNodeStyle,
  type GestureInput
} from '@nvidia-elements/core/internal';
import { ResizeHandle } from '@nvidia-elements/core/resize-handle';
import { selectedPlacementPlan } from './workspace-acquisition-sizing.utils.js';
import { WorkspaceCommandController } from './workspace-command.controller.js';
import { WorkspaceFullscreenController } from './workspace-fullscreen.controller.js';
import { WorkspaceChromeController, type WorkspaceChrome } from './workspace-chrome.controller.js';
import {
  resolveWorkspacePlacement,
  isWorkspacePlacement,
  type WorkspacePlacement,
  type WorkspacePlacementIntent,
  type WorkspaceCommandContext
} from './workspace-command.utils.js';
import {
  computedTabHeader,
  projectTabMembership,
  tabRecipient,
  isNonOrderPreview,
  isOverlayDetachedPreview,
  workspaceInputCatalog,
  computedReservation,
  canvasClientRect,
  initialDragCue,
  interactionBounds
} from './workspace-computed-targets.utils.js';
import { labelWorkspaceTabs, workspaceCompositionChanged } from './workspace-composition.utils.js';
import { allocateContextProxies } from './workspace-context.utils.js';
import { WorkspaceScene } from './workspace-scene.utils.js';
import type { WorkspaceDropIntent } from './workspace-drag-preview.utils.js';
import { parseLayout, resizeSizes, type WorkspaceLayout } from './workspace-layout.utils.js';
import { offerPresentation, offerAllocation } from './workspace-offer-presentation.utils.js';
import {
  findGroup,
  fullscreenWorkspaceLayout,
  detachedLayout,
  closePanel,
  openPanel,
  selectPanel,
  reconcilePanels,
  projectLayout
} from './workspace-operations.utils.js';
import { initialReservation } from './workspace-origin.utils.js';
import type { WorkspacePanelHeader } from './workspace-panel-header.js';
import { WorkspacePanel } from './workspace-panel.js';
import { decidePlacement } from './workspace-placement-decision.utils.js';
import { type WorkspaceBoundary as Boundary, type WorkspacePlacedRegion } from './workspace-placement.utils.js';
import { planWorkspacePlacement, type WorkspacePlacementPlan } from './workspace-planner.utils.js';
import { settlePreviewReturn, renderPreview, previewAllocation } from './workspace-preview.utils.js';
import {
  WorkspaceRearrangeController,
  type WorkspaceDragPreview,
  type WorkspaceDragOffer,
  type WorkspaceOfferContext,
  type WorkspaceDragCue,
  type WorkspaceRect as Rect
} from './workspace-rearrange.controller.js';
import { rebaseProjectedSplit } from './workspace-resize.utils.js';
import { admitsWorkspaceMove, workspaceRequirements } from './workspace-sizing.utils.js';
import { captureTabScroll, tabStripIdentity, reservedTabCue, allocatedTabWidth } from './workspace-tabs.utils.js';
import {
  renderChromeProbe,
  renderTabStrip,
  configureTabGroups,
  presentedTabGroups,
  panelLabel,
  type WorkspaceTabGroup as TabGroup
} from './workspace-tabstrip.utils.js';
import styles from './workspace.css?inline';
import globalStyles from './workspace.global.css?inline';

/**
 * @element nve-workspace
 * @description Owns a restorable arrangement of stable application panels.
 * @documentation https://nvidia.github.io/elements/docs/elements/workspace/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/workspace
 * @command --enter-fullscreen - Present the invoking panel's group in native fullscreen.
 * @command --exit-fullscreen - Exit native fullscreen.
 * @command --toggle-fullscreen - Toggle native fullscreen for the invoking panel's group.
 * @command --open - Open and activate the targeted supplied panel. Repeated activation is silent.
 * @command --close - Close the targeted panel when its workspace is closable.
 * @command --select - Activate an open supplied panel without reopening a closed panel.
 * @command --place - Apply the invoker's typed placement request when rearrangeable.
 * @slot - Workspace panels with durable IDs and application dropdown groups.
 * @event workspacechange - Announces a committed arrangement value.
 * @event commandavailabilitychange - Command availability may have changed; query relevant commands again.
 * @cssprop --gap - Space between groups as one nonnegative CSS length.
 * @cssprop --border-radius - Corner radius of contained groups.
 * @cssprop --animation-duration - Duration of coordinated layout and placement transitions.
 * @cssprop --resize-line-width - Painted separator thickness, limited by the group gap.
 * @cssprop --gutter-background - Idle separator fill.
 * @cssprop --gutter-hover-background - Separator fill on hover.
 * @csspart tabs - Tab strips.
 * @csspart tab - View selection controls.
 * @csspart tabs-item-group - Tab and accessory layouts.
 * @csspart close-button - View closing controls.
 * @csspart button - Fullscreen exit control.
 * @csspart resize-handle - Separator control.
 * @csspart ghost - Animated insertion cue.
 * @csspart carried-ghost - Pointer-following carried view titles.
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
    [ResizeHandle.metadata.tag]: ResizeHandle,
    [Ghost.metadata.tag]: Ghost,
    [Icon.metadata.tag]: Icon,
    [IconButton.metadata.tag]: IconButton,
    [Tabs.metadata.tag]: Tabs,
    [TabsItem.metadata.tag]: TabsItem,
    [TabsItemGroup.metadata.tag]: TabsItemGroup,
    [DragHandle.metadata.tag]: DragHandle,
    [Button.metadata.tag]: Button
  };

  readonly #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Overrides localized workspace controls. */
  @property({ type: Object, attribute: false }) i18n = this.#i18nController.i18n;

  /** Enables separator resizing. */
  @property({ type: Boolean, reflect: true }) resizable = false;

  /** Enables moving tabs and groups. */
  @property({ type: Boolean, reflect: true }) rearrangeable = false;

  /** Radial pointer distance in CSS pixels before a carried source detaches. Captured at gesture press. */
  @property({ type: Number, attribute: 'detach-threshold' }) detachThreshold = 48;

  /** Enables closing supplied panels. */
  @property({ type: Boolean, reflect: true }) closable = false;

  /** Selects separator constraint behavior. */
  @property({ attribute: 'resize-policy' }) resizePolicy: 'stop' | 'propagate' = 'stop';

  /** Selects panel content framing. */
  @property({ reflect: true }) container?: 'inset' | 'flat' | 'full';

  /** Versioned JSON arrangement. Assignment restores without emitting workspacechange. */
  @property({ type: String })
  get value(): string {
    return this.#layout ? JSON.stringify(this.#layout) : '';
  }

  set value(value: string) {
    const next = value ? parseLayout(value) : undefined;
    this.#rearrange.cancel();
    const old = this.value;
    this.#cancelled = this.#cancelled || this.#pointerSession || this.#baseline !== undefined;
    this.#layout = next;
    this.#restoring = true;
    this.#preview = undefined;
    this.#baseline = undefined;
    this.#origin = undefined;
    this.requestUpdate('value', old);
  }

  /** Reports whether a command can change the panel identified by `context.value` in the current arrangement. Native fullscreen admission remains subject to browser permission. */
  isCommandAvailable(command: string, context: WorkspaceCommandContext = {}): boolean {
    return this.#commands.isCommandAvailable(command, context);
  }

  #layout?: WorkspaceLayout;
  #restoring = false;
  #dragPreview?: WorkspaceDragPreview;

  readonly #commands = new WorkspaceCommandController(this, {
    state: () => ({
      panels: this.#panels,
      layout: this.#layout,
      closable: this.closable,
      rearrangeable: this.rearrangeable && !this.#fullscreen.active
    }),
    placementAvailable: (source, intent) => this.#withScene(() => this.#admits(source, intent)),
    fullscreenAvailable: (command, anchor) => this.#fullscreen.isCommandAvailable(command, anchor),
    fullscreen: (command, anchor, source) => this.#fullscreen.command(command, anchor, source),
    activate: (anchor, operation) => this.#activatePanel(anchor, operation),
    close: anchor => this.#close(anchor),
    place: (anchor, placement) => this.#placeCommand(anchor, placement)
  });

  readonly #fullscreen = new WorkspaceFullscreenController(this, {
    supplied: anchor => this.#panels.some(panel => panel.id === anchor),
    group: anchor => findGroup(this.#project(this.#currentLayout).root, anchor)?.panels ?? [],
    cancel: () => {
      this.#rearrange.cancel();
      this.#cancel();
    },
    focus: anchor => this.#focusPanel(findGroup(this.#project(this.#currentLayout).root, anchor)?.active),
    availabilityChanged: () => this.#commands.invalidateAvailability()
  });

  readonly #rearrange = new WorkspaceRearrangeController(this, {
    evaluate: work => this.#withScene(work),
    enabled: () => this.rearrangeable && !this.#fullscreen.active,
    detachThreshold: () => this.detachThreshold,
    activate: (source, group) => {
      if (group) return;
      this.#select(new CustomEvent('nve-workspace-select', { detail: source[0] }));
      this.#focusPanel(
        source.find(id => !this.#layout?.closed.includes(id) && this.#panels.some(panel => panel.id === id))
      );
    },
    restoreFocus: (source, group) => this.#returnFocus(source, group),
    groupSource: anchor => [...(findGroup(this.#layout?.root ?? null, anchor)?.panels ?? [])],
    catalog: source => this.#targetCatalog(source),
    header: (source, point) => computedTabHeader(this.#frameHeaderInput(source, point)),
    reservation: point =>
      computedReservation({
        ...this.#frameHeaderInput(this.#dragPreview?.source ?? [], point),
        groups: this.#renderGeometry().groups
      }),
    capturePresentation: () => captureTabScroll(this),
    resolve: input =>
      decidePlacement({
        ...input,
        gap: this.#chrome.gap,
        saved: this.#currentLayout,
        available: this.#available
      }),
    initialPlacement: (source, cue) =>
      this.#layout
        ? initialReservation({
            layout: this.#layout,
            source,
            cue,
            available: this.#available,
            evaluate: intent => this.#offer(source, intent)
          })
        : undefined,
    initialCue: (source, group) => this.#initialCue(source, group),
    offer: (source, intent, context) => this.#offer(source, intent, context),
    preview: preview => {
      this.#dragPreview = preview;
      this.requestUpdate();
    },
    returnPreview: preview => {
      this.#dragPreview = preview;
      this.requestUpdate();
      return settlePreviewReturn(this, () => this.#dragPreview === preview);
    },
    commit: (source, intent, layout) => this.#move(source, intent, layout)
  });

  #preview?: WorkspaceLayout;
  #baseline?: WorkspaceLayout;
  #origin?: Boundary;
  #tablists: TabGroup[] = [];
  #cancelled = false;
  #pointerSession = false;
  #boundaries: Boundary[] = [];
  #chrome: WorkspaceChrome = {
    gap: 0,
    headerHeight: 0,
    gripWidth: 0,
    actionWidth: 0,
    tabWidth: 0,
    width: 0,
    height: 0
  };

  readonly #chromeController = new WorkspaceChromeController(this, {
    panels: () => this.#panels,
    presented: id => !this.#isCarried(id) && this.#tablists.some(group => group.panels.some(panel => panel.id === id)),
    carried: id => !this.#layout?.closed.includes(id) && this.#isCarried(id),
    change: chrome => {
      const viewportChanged =
        chrome.width !== this.#chrome.width || chrome.height !== this.#chrome.height || chrome.gap !== this.#chrome.gap;
      this.#chrome = chrome;
      this.#commands.invalidateAvailability();
      this.#cancel();
      if (viewportChanged) this.#rearrange.cancel();
      else this.#rearrange.refresh();
    }
  });

  #mutation?: MutationObserver;

  #evaluation?: WorkspaceScene;

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
    this.#mutation = new MutationObserver(records => this.#observeContent(records));
    this.#mutation.observe(this, {
      childList: true,
      characterData: true,
      attributes: true,
      subtree: true,
      attributeFilter: ['id', 'min-width', 'min-height', 'slot']
    });
    this.addEventListener('nve-workspace-select', this.#select as EventListener);
    this.addEventListener('keydown', this.#keydown);
    this.ownerDocument.addEventListener('keydown', this.#globalKeydown);
  }

  disconnectedCallback() {
    this.#rearrange.cancel();
    this.#mutation?.disconnect();
    this.removeEventListener('nve-workspace-select', this.#select as EventListener);
    this.removeEventListener('keydown', this.#keydown);
    this.ownerDocument.removeEventListener('keydown', this.#globalKeydown);
    super.disconnectedCallback();
  }

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    if (['value', 'closable', 'rearrangeable', 'resizePolicy'].some(key => changed.has(key)))
      this.#commands.invalidateAvailability();
    if (changed.has('resizePolicy')) this.#cancel();
    if (changed.has('rearrangeable') && !this.rearrangeable) {
      this.#rearrange.cancel();
    }
    if (changed.has('resizable') && !this.resizable && (this.#preview || this.#pointerSession)) {
      this.#cancel();
      this.#pointerSession = false;
    }
    this.#reconcile();
    this.#restoring = false;
  }

  protected updated() {
    labelWorkspaceTabs(this, this.#tablists, { panels: this.#panels, carried: id => this.#isCarried(id) });
    this.#commands.flushAvailability();
  }

  render() {
    return this.#withScene(scene => this.#renderWorkspace(scene));
  }

  #renderWorkspace(scene: WorkspaceScene) {
    const drag = this.#dragPreview;
    const geometry = this.#renderGeometry();
    this.#tablists = presentedTabGroups(geometry.groups, this.#layout?.root ?? null, this.#dragPreview?.source);
    this.#boundaries = geometry.boundaries;
    const preview = this.#renderDragPreview(geometry.regions);
    const presentations = this.#tablists.map(group => ({
      group,
      scrollLeft: this.#scroll(group)
    }));
    configureTabGroups({
      groups: presentations,
      extent: geometry,
      container: this.container,
      chrome: this.#chrome,
      closable: this.closable,
      animate: !!drag,
      source: drag?.source ?? []
    });
    const visible = new Set(this.#tablists.flatMap(group => group.panels));
    this.#panels.forEach(panel => {
      panel._present(visible.has(panel) && !this.#isCarried(panel.id));
    });
    return html`
      <div internal-host ?data-fullscreen=${this.#fullscreen.active} ?data-rearranging=${!!drag} ?data-peer-preview=${!!drag} data-preview-allocation=${ifDefined(previewAllocation(drag))} style=${`--_minimum-height:${scene.minimum(this.#project(this.#currentLayout).root).height}px`}>
        <div class="viewport" @scroll=${() => this.#rearrange.refresh()}><div class="canvas" style=${`min-width:${geometry.minimum.width}px;min-height:${geometry.minimum.height}px`}>
          ${repeat(
            this.#tablists,
            group => this.#groupIdentity(group),
            group => this.#renderTabs(group)
          )}
          <slot @slotchange=${() => this.requestUpdate()}></slot>
          ${
            this.#canResize
              ? repeat(
                  this.#boundaries,
                  item => item.key,
                  item => this.#renderHandle(item)
                )
              : null
          }
          <div class="preview-layer" data-drag-phase=${ifDefined(this.#dragPreview?.phase)}>${preview}</div>
        </div></div>
        ${this.#fullscreen.active ? html`<nve-button class="fullscreen-exit" part="button" @click=${() => this.#fullscreen.exit()}>${this.i18n.exitFullscreen}</nve-button>` : null}
        ${renderChromeProbe(this)}
      </div>
    `;
  }

  get #currentLayout(): WorkspaceLayout {
    return this.#layout ?? { version: 1, root: null, closed: [] };
  }

  get #canResize() {
    return this.resizable && !this.#fullscreen.active;
  }

  get #effectivePolicy(): 'stop' | 'propagate' {
    return this.resizePolicy === 'propagate' ? 'propagate' : 'stop';
  }

  get #panels(): WorkspacePanel[] {
    if (this.#evaluation) return this.#evaluation.panels;
    return isServer
      ? []
      : [...this.children].filter((child): child is WorkspacePanel => child instanceof WorkspacePanel);
  }

  #observeContent(records: MutationRecord[]) {
    const catalogue = records.some(
      record =>
        record.target === this ||
        (record.type === 'attributes' &&
          record.target instanceof WorkspacePanel &&
          record.target.parentElement === this)
    );
    const labels = records.some(record => workspaceCompositionChanged(this, record));
    if (catalogue) {
      this.#commands.invalidateAvailability();
      this.#cancel();
      this.#rearrange.cancel();
    }
    if (catalogue || labels) this.requestUpdate();
  }

  #select = (event: CustomEvent<string>) => {
    this.#activatePanel(event.detail, 'select');
  };

  #activatePanel(id: string, operation: 'open' | 'select') {
    if (!this.#layout || !this.#panels.some(panel => panel.id === id)) return;
    const opened = operation === 'open' ? (openPanel(this.#layout, id) ?? this.#layout) : this.#layout;
    const next = selectPanel(opened, id) ?? (opened !== this.#layout ? opened : undefined);
    if (!next) return;
    this.#rearrange.cancel();
    this.#cancel();
    this.#layout = next;
    this.#commit();
  }

  #placeCommand(anchor: string, placement: unknown) {
    if (!this.rearrangeable || this.#fullscreen.active || !isWorkspacePlacement(placement)) return;
    const request = this.#resolvePlacement(anchor, placement);
    if (request) this.#move(request.source, request.intent);
  }

  #resolvePlacement(anchor: string, placement: WorkspacePlacement) {
    return this.#layout
      ? resolveWorkspacePlacement({
          layout: this.#layout,
          anchor,
          placement,
          available: this.#available
        })
      : undefined;
  }

  #gesture = (event: CustomEvent<GestureInput>) => {
    if (
      !this.#canResize ||
      !event.composedPath().some(item => item instanceof ResizeHandle && item.getRootNode() === this.shadowRoot)
    )
      return;
    const input = event.detail;
    if (input.kind === 'pointerdown' && input.event.button === 0 && input.event.isPrimary) {
      this.#pointerSession = true;
      this.#cancelled = false;
      this.#origin = undefined;
      this.#baseline = this.#layout ? structuredClone(this.#layout) : undefined;
    }
    if (input.kind === 'pointerend') {
      this.#pointerSession = false;
      if (input.interrupted) this.#cancel();
      if (this.#cancelled) this.#resetHandle(event.currentTarget);
    }
  };

  #resetHandle(target: EventTarget | null) {
    if (!(target instanceof ResizeHandle)) return;
    void this.updateComplete.then(() => {
      const boundary = this.#boundaries.find(item => item.key === target.dataset.boundary);
      if (boundary) target.valueAsNumber = boundary.value;
    });
  }

  #globalKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.#pointerSession) {
      event.preventDefault();
      this.#cancel();
    }
  };

  #keydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.#cancel();
      this.#rearrange.cancelForUser();
      return;
    }
    if (!this.#pointerSession && this.resizable && event.composedPath().some(item => item instanceof ResizeHandle))
      this.#cancelled = false;
  };

  #cancel() {
    this.#preview = undefined;
    this.#baseline = undefined;
    this.#origin = undefined;
    this.#cancelled = true;
    this.requestUpdate();
  }

  #commit(cause: 'interaction' | 'content' = 'interaction') {
    this.#commands.invalidateAvailability();
    this.dispatchEvent(
      new CustomEvent('workspacechange', { bubbles: true, composed: true, detail: { value: this.value, cause } })
    );
  }

  #withScene<T>(work: (scene: WorkspaceScene) => T): T {
    if (this.#evaluation) return work(this.#evaluation);
    this.#evaluation = new WorkspaceScene(this, {
      panels: this.#panels,
      layout: this.#currentLayout,
      source: this.#dragPreview?.source ?? [],
      chrome: this.#chrome,
      policy: this.#effectivePolicy,
      strip: group => this.#strip(group)
    });
    try {
      return work(this.#evaluation);
    } finally {
      this.#evaluation = undefined;
    }
  }

  #requirements() {
    return this.#evaluation?.requirements ?? workspaceRequirements({ chrome: this.#chrome, panels: this.#panels });
  }

  #geometry(layout: WorkspaceLayout, extent = layout) {
    return this.#evaluation?.geometry(layout, extent) ?? this.#withScene(scene => scene.geometry(layout, extent));
  }

  #isCarried(id: string) {
    return this.#dragPreview?.source.includes(id) ?? false;
  }

  #project(layout: WorkspaceLayout) {
    if (this.#evaluation) return this.#evaluation.project(layout);
    return projectLayout(layout, this.#available);
  }

  #dragGeometry(source: string[]) {
    if (this.#evaluation) return this.#evaluation.detached(source);
    const saved = this.#layout ?? { version: 1 as const, root: null, closed: [] };
    return this.#geometry(this.#project(detachedLayout(saved, source)), this.#project(saved));
  }

  #initialCue(source: string[], groupDrag: boolean): WorkspaceDragCue {
    return initialDragCue({
      groups: this.#geometry(this.#project(this.#currentLayout)).groups,
      source,
      groupDrag,
      bounds: this.#bounds(),
      client: rect => this.#client(rect),
      chrome: this.#chrome,
      width: group => this.#tabWidth(group),
      scroll: group => this.#scroll(group)
    });
  }

  #offer(
    source: string[],
    intent: WorkspaceDropIntent,
    context?: WorkspaceOfferContext
  ): WorkspaceDragOffer | undefined {
    return this.#withScene(() => this.#evaluateOffer(source, intent, context));
  }

  #evaluateOffer(source: string[], intent: WorkspaceDropIntent, context?: WorkspaceOfferContext) {
    if (!this.#layout || intent.kind === 'invalid') return undefined;
    const acquisition = context?.acquisition;
    const plan = acquisition?.plan ?? this.#candidate(source, intent);
    if (!plan) return undefined;
    const { width, height } = this.#geometry(this.#project(plan.layout));
    const fit = selectedPlacementPlan({
      plan,
      source,
      available: this.#available,
      previous: context?.selected,
      intent,
      acquisition,
      current: this.#renderGeometry().regions,
      rect: { x: 0, y: 0, width, height },
      origin: this.#client({ x: 0, y: 0, width: 0, height: 0 }),
      requirements: this.#requirements()
    });
    const selected = fit ?? plan;
    return this.#placementOffer({
      plan: selected,
      feasible: !!fit,
      candidate: this.#project(selected.layout),
      source,
      intent
    });
  }

  #placementOffer(input: {
    plan: WorkspacePlacementPlan;
    candidate: WorkspaceLayout;
    feasible?: boolean;
    source: string[];
    intent: Exclude<WorkspaceDropIntent, { kind: 'invalid' }>;
  }): WorkspaceDragOffer | undefined {
    const { plan, candidate, source, intent } = input;
    const geometry = this.#geometry(candidate);
    const group = geometry.groups.find(item => item.panels.some(panel => source.includes(panel.id)));
    if (!group) return undefined;
    const rect = this.#client(group.rect);
    const { cue, bounds } =
      intent.kind === 'tab' ? this.#tabCue({ group, source, intent }) : { cue: rect, bounds: this.#bounds() };
    const feasible = input.feasible !== false && this.#candidateFits(candidate);
    const presentation = offerPresentation({
      plan,
      regions: geometry.regions,
      sourceKey: group.key,
      sourceRect: rect,
      cue,
      bounds,
      destination: intent.destination,
      feasible,
      split: intent.kind === 'split' ? { ...this.#dragGeometry(source), source } : undefined,
      client: targetRect => this.#client(targetRect)
    });
    if (intent.kind !== 'tab' && (presentation.cue.width === 0 || presentation.cue.height === 0)) return undefined;
    return {
      ...presentation,
      cue: { kind: intent.kind === 'tab' ? ('tab' as const) : ('group' as const), rect: presentation.cue },
      feasible,
      ...offerAllocation(plan, feasible)
    };
  }

  #tabCue({
    group,
    source,
    intent
  }: {
    group: TabGroup;
    source: string[];
    intent: Exclude<WorkspaceDropIntent, { kind: 'invalid' }>;
  }) {
    const tabs = presentedTabGroups(
      [tabRecipient({ group, intent, spatial: () => this.#dragGeometry(source).groups })],
      this.#layout?.root ?? null,
      source
    )[0]!;
    return reservedTabCue({
      rect: this.#client(tabs.rect),
      viewport: this.#bounds(),
      grip: tabs.gripWidth,
      suffixWidth: this.#suffixWidth(tabs),
      headerHeight: this.#chrome.headerHeight,
      tabWidth: this.#tabWidth(tabs),
      panels: tabs.panels.map(panel => panel.id),
      source,
      scroll: this.#scroll(tabs)
    });
  }

  #candidate(source: string[], intent: WorkspacePlacementIntent): WorkspacePlacementPlan | undefined {
    if (!this.#layout) return undefined;
    return planWorkspacePlacement({
      layout: this.#layout,
      source,
      destination: intent.destination,
      operation: intent.kind,
      available: this.#available,
      preference:
        intent.kind === 'split'
          ? { allocation: this.#dragGeometry(source).regions, requirements: this.#requirements() }
          : undefined
    });
  }

  #candidateFits(candidate: WorkspaceLayout) {
    return admitsWorkspaceMove({
      current: this.#project(this.#currentLayout).root,
      candidate: candidate.root,
      viewport: { width: this.#chrome.width, height: this.#chrome.height },
      requirements: this.#requirements()
    });
  }

  #targetCatalog(source: string[], allocation = this.#nonOrderGeometry(source)) {
    const saved = this.#layout ?? { version: 1 as const, root: null, closed: [] };
    return workspaceInputCatalog({
      gap: this.#chrome.gap,
      saved,
      catalog: this.#geometry(this.#project(saved)).regions,
      allocation,
      reservation: this.#renderGeometry(),
      preview: this.#dragPreview,
      source,
      available: this.#available,
      bounds: this.#bounds(),
      client: rect => this.#client(rect),
      headerHeight: this.#chrome.headerHeight
    });
  }

  #resize(event: Event, boundary: Boundary, committed: boolean) {
    event.stopPropagation();
    if (!this.#layout || this.#cancelled || !this.#canResize) return;
    const handle = event.currentTarget;
    if (!(handle instanceof HTMLElement) || handle.localName !== 'nve-resize-handle') return;
    const value = (handle as ResizeHandle).valueAsNumber;
    this.#origin ??= boundary;
    const origin = this.#origin;
    this.#baseline ??= structuredClone(this.#layout);
    const preview = this.#resizePreview(value, origin);
    if (!preview) return;
    this.#preview = preview;
    if (committed) this.#commitPreview(preview);
    else this.requestUpdate();
  }

  #commitPreview(preview: WorkspaceLayout) {
    const changed = this.value !== JSON.stringify(preview);
    this.#layout = preview;
    this.#preview = undefined;
    this.#baseline = undefined;
    this.#origin = undefined;
    if (changed) this.#commit();
    else this.requestUpdate();
  }

  #resizePreview(value: number, origin: Boundary): WorkspaceLayout | undefined {
    if (!this.#baseline) return;
    const delta = (value - origin.value) * (origin.branch.axis === 'horizontal' ? 1 : -1);
    const sizes = resizeSizes(origin.sizes, origin.minima, {
      boundary: origin.index,
      delta,
      policy: this.#effectivePolicy
    });
    if (!sizes.some((size, index) => Math.abs(size - origin.sizes[index]!) > 0.001))
      return structuredClone(this.#baseline);
    return rebaseProjectedSplit(this.#baseline, origin.branch, sizes, this.#available);
  }

  #reconcile() {
    const ids = this.#available;
    if (!ids.every(Boolean) || new Set(ids).size !== ids.length) return;
    if (!this.#layout) {
      if (ids.length) this.#layout = { version: 1, root: { type: 'group', panels: ids, active: ids[0]! }, closed: [] };
      return;
    }
    const next = reconcilePanels(this.#layout, ids);
    if (JSON.stringify(next) === this.value) return;
    this.#layout = next;
    if (!this.#restoring) this.#commit('content');
  }

  #reserved(preview = this.#dragPreview) {
    return !!preview && 'allocation' in preview && preview.allocation !== 'overlay';
  }

  #renderGeometry() {
    const fullscreen = fullscreenWorkspaceLayout(this.#project(this.#currentLayout), this.#fullscreen.anchor);
    if (fullscreen) return this.#geometry(fullscreen);
    const drag = this.#dragPreview;
    if (isNonOrderPreview(drag)) return this.#nonOrderGeometry(drag.source);
    if (drag && 'allocation' in drag && drag.allocation === 'reserved')
      return this.#geometry(this.#project(drag.layout));
    if (isOverlayDetachedPreview(drag)) return this.#dragGeometry(drag.source);
    return this.#geometry(this.#project(this.#preview ?? this.#currentLayout));
  }

  #nonOrderGeometry(source: string[]) {
    const spatial = this.#dragGeometry(source);
    const drag = this.#dragPreview;
    return drag?.phase === 'detached' && drag.intent.kind === 'tab' && drag.allocation === 'reserved'
      ? { ...spatial, groups: projectTabMembership(spatial.groups, this.#geometry(this.#project(drag.layout)).groups) }
      : spatial;
  }

  #frameHeaderInput(source: string[], point: { x: number; y: number }) {
    return {
      groups: presentedTabGroups(this.#nonOrderGeometry(source).groups, this.#layout?.root ?? null, source),
      chrome: this.#chrome,
      source,
      point,
      bounds: this.#bounds(),
      client: (rect: Rect) => this.#client(rect),
      scroll: (group: TabGroup) => this.#scroll(group)
    };
  }

  #suffixWidth(group: TabGroup) {
    return this.#chrome.panels?.[group.active]?.suffixWidth ?? 0;
  }

  #tabWidth(group: TabGroup) {
    return allocatedTabWidth(group, this.#chrome);
  }

  #groupIdentity(group: TabGroup) {
    return tabStripIdentity(
      this.#layout?.root ?? null,
      group.panels.map(panel => panel.id),
      this.#dragPreview?.source ?? []
    );
  }

  get #available() {
    return this.#evaluation?.available ?? this.#panels.map(panel => panel.id);
  }

  #bounds() {
    return this.#evaluation?.bounds() ?? interactionBounds(this);
  }

  #client(rect: Rect) {
    return this.#evaluation?.client(rect) ?? canvasClientRect(this, rect);
  }

  #scroll(group: TabGroup) {
    return this.#evaluation?.scroll(group) ?? this.#strip(group)?.scrollLeft ?? 0;
  }

  #strip(group: TabGroup) {
    return this.shadowRoot?.querySelector<HTMLElement>(`[data-group="${CSS.escape(this.#groupIdentity(group))}"]`);
  }

  #renderTabs(group: TabGroup) {
    return renderTabStrip({
      group,
      identity: this.#groupIdentity(group),
      chrome: this.#chrome,
      width: this.#tabWidth(group),
      source: this.#dragPreview?.source ?? [],
      reserved: this.#reserved(),
      rearrangeable: this.rearrangeable && !this.#fullscreen.active,
      closable: this.closable,
      strings: this.i18n,
      label: id => panelLabel(this.#panels, id),
      scrollChanged: () => {
        this.requestUpdate();
        this.#rearrange.refresh();
      },
      select: id => {
        if (!this.#rearrange.suppressSelection) this.#select(new CustomEvent('nve-workspace-select', { detail: id }));
      },
      close: id => this.#close(id),
      hover: (id, hovered) =>
        this.#panels
          .find(panel => panel.id === id)
          ?.querySelector<WorkspacePanelHeader>(':scope > nve-workspace-panel-header')
          ?._hover(hovered),
      suffixWidth: this.#suffixWidth(group)
    });
  }

  #admits(source: string[], intent: WorkspacePlacementIntent) {
    if (!this.#layout) return false;
    const next = this.#candidate(source, intent);
    return !!next && JSON.stringify(next.layout) !== this.value && this.#candidateFits(this.#project(next.layout));
  }

  #move(source: string[], intent: WorkspacePlacementIntent, layout?: WorkspaceLayout) {
    if (!this.rearrangeable || this.#fullscreen.active || !this.#layout) return false;
    const next = layout ? { layout } : this.#candidate(source, intent);
    if (!next || JSON.stringify(next.layout) === this.value || !this.#candidateFits(this.#project(next.layout)))
      return false;
    this.#rearrange.cancel();
    this.#cancel();
    this.#layout = next.layout;
    this.#commit();
    this.#focusPanel(
      source.find(id => !this.#layout?.closed.includes(id) && this.#panels.some(panel => panel.id === id))
    );
    return true;
  }

  #close(id: string) {
    if (!this.closable || !this.#layout) return;
    const next = closePanel(this.#layout, id);
    if (!next) return;
    this.#rearrange.cancel();
    this.#cancel();
    this.#layout = next;
    this.#commit();
    const group = this.#tablists.find(item => item.panels.some(panel => panel.id === id));
    this.#focusPanel(group?.panels.find(panel => panel.id !== id)?.id);
  }

  #returnFocus(source: string[], group: boolean) {
    const id = source.find(
      candidate => !this.#layout?.closed.includes(candidate) && this.#panels.some(panel => panel.id === candidate)
    );
    if (!group || !id) {
      this.#focusPanel(id, { preserveScroll: true });
      return;
    }
    void this.updateComplete.then(() =>
      this.shadowRoot
        ?.querySelector<HTMLElement>(`[data-drag-group="${CSS.escape(id)}"]`)
        ?.focus({ preventScroll: true })
    );
  }

  #focusPanel(id?: string, options?: { preserveScroll: boolean }) {
    void this.updateComplete.then(() => {
      const root = this.shadowRoot;
      if (!root) return;
      const target =
        (id ? root.querySelector<HTMLElement>(`[data-panel="${CSS.escape(id)}"]`) : null) ??
        root.querySelector<HTMLElement>('nve-tabs-item[selected]');
      if (!target) return;
      target.focus({ preventScroll: options?.preserveScroll });
      if (!options?.preserveScroll)
        target.closest('nve-tabs-item-group')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }

  #renderDragPreview(allocation: WorkspacePlacedRegion[]) {
    const preview = this.#dragPreview;
    if (!preview) return null;
    const { x, y } = this.#client({ x: 0, y: 0, width: 0, height: 0 });
    const title = preview.source
      .filter(id => !this.#layout?.closed.includes(id) && this.#panels.some(panel => panel.id === id))
      .map(id => panelLabel(this.#panels, id))
      .join(', ');
    const saved = this.#layout ?? { version: 1 as const, root: null, closed: [] };
    const catalog = this.#geometry(this.#project(saved)).regions;
    const contexts = allocateContextProxies({ catalog, allocation, source: preview.source });
    const bounds = this.#bounds();
    const scene = { ...this.#targetCatalog(preview.source), preview, x, y };
    return renderPreview({
      preview,
      contexts,
      regions: allocation,
      x,
      y,
      bounds,
      title,
      hint:
        preview.phase === 'detached' && preview.point
          ? decidePlacement({
              ...scene,
              source: preview.source,
              point: preview.point,
              local: preview.intent,
              header: false,
              saved,
              available: this.#available
            }).hint
          : undefined
    });
  }

  #renderHandle(item: Boundary) {
    const flush = this.#chrome.gap === 0;
    const centered =
      item.branch.axis === 'horizontal'
        ? `left:50%;top:0;height:${item.rect.height}px;transform:translateX(-50%)`
        : `left:0;top:50%;width:${item.rect.width}px;transform:translateY(-50%)`;
    const handleStyle = flush ? centered : `left:0;top:0;width:${item.rect.width}px;height:${item.rect.height}px`;
    return html`
      <div class="gutter" ?data-flush=${flush} style=${`left:${item.rect.x}px;top:${item.rect.y}px;width:${item.rect.width}px;height:${item.rect.height}px`}><nve-resize-handle data-boundary=${item.key} part="resize-handle" style=${handleStyle} orientation=${item.branch.axis === 'horizontal' ? 'vertical' : 'horizontal'} .min=${item.min} .max=${item.max} .step=${10} .value=${item.value} @nve-gesture-input=${this.#gesture} @toggle=${(event: Event) => event.preventDefault()} @input=${(event: Event) => this.#resize(event, item, false)} @change=${(event: Event) => this.#resize(event, item, true)}></nve-resize-handle></div>
    `;
  }
}
