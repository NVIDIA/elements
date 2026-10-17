// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, isServer, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import { Button } from '@nvidia-elements/core/button';
import { DragHandle } from '@nvidia-elements/core/drag-handle';
import { Dropdown } from '@nvidia-elements/core/dropdown';
import { Ghost } from '@nvidia-elements/core/ghost';
import { Icon } from '@nvidia-elements/core/icon';
import { useStyles, I18nController, scopedRegistry, type GestureInput } from '@nvidia-elements/core/internal';
import { ResizeHandle } from '@nvidia-elements/core/resize-handle';
import { Select } from '@nvidia-elements/core/select';
import { selectedPlacementPlan } from './workspace-acquisition-sizing.utils.js';
import { WorkspaceActionsController } from './workspace-actions.controller.js';
import { WorkspaceChromeController, type WorkspaceChrome } from './workspace-chrome.controller.js';
import {
  resolveWorkspacePlacement,
  isWorkspacePlacement,
  type WorkspacePlacement,
  type WorkspacePlacementIntent,
  type WorkspaceCommandEvent
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
import { allocateContextProxies } from './workspace-context.utils.js';
import type { WorkspaceDropIntent } from './workspace-drag-preview.utils.js';
import { parseLayout, resizeSizes, type WorkspaceLayout } from './workspace-layout.utils.js';
import { offerPresentation, offerAllocation } from './workspace-offer-presentation.utils.js';
import {
  findPane,
  detachedLayout,
  closePanel,
  openPanel,
  selectPanel,
  reconcilePanels,
  projectLayout
} from './workspace-operations.utils.js';
import { initialReservation } from './workspace-origin.utils.js';
import { WorkspacePanel } from './workspace-panel.js';
import { decidePlacement } from './workspace-placement-decision.utils.js';
import {
  allocateWorkspace,
  type WorkspaceBoundary as Boundary,
  type WorkspacePlacedRegion
} from './workspace-placement.utils.js';
import { planWorkspacePlacement, type WorkspacePlacementPlan } from './workspace-planner.utils.js';
import { settlePreviewReturn, renderPreview } from './workspace-preview.utils.js';
import {
  WorkspaceRearrangeController,
  type WorkspaceDragPreview,
  type WorkspaceDragOffer,
  type WorkspaceOfferContext,
  type WorkspaceDragCue,
  type WorkspaceRect as Rect
} from './workspace-rearrange.controller.js';
import { rebaseProjectedSplit } from './workspace-resize.utils.js';
import { admitsWorkspaceMove, minimumWorkspace, workspaceRequirements } from './workspace-sizing.utils.js';
import { captureTabScroll, tabStripIdentity, reservedTabCue } from './workspace-tabs.utils.js';
import {
  renderChromeProbe,
  navigateTabStrip,
  renderTabStrip,
  createTabGroups,
  presentedTabGroups,
  panelLabel,
  type WorkspaceTabGroup as TabGroup
} from './workspace-tabstrip.utils.js';
import styles from './workspace.css?inline';

/**
 * @element nve-workspace
 * @description Owns a restorable arrangement of stable application panels.
 * @documentation https://nvidia.github.io/elements/docs/elements/workspace/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/workspace
 * @command --open - Open and activate the targeted supplied panel. Repeated activation is silent.
 * @command --close - Close the targeted panel when its workspace is closable.
 * @command --select - Activate an open supplied panel without reopening a closed panel.
 * @command --arrange - Open arrangement actions for the targeted panel when rearrangeable.
 * @command --arrange-pane - Open arrangement actions for its whole tabbed pane when rearrangeable.
 * @command --place - Apply the invoker's typed placement request when rearrangeable.
 * @slot - Workspace panels with durable IDs.
 * @event workspacechange - Announces a committed arrangement value.
 * @cssprop --animation-duration - Duration of coordinated layout and placement transitions.
 * @cssprop --gutter-background - Idle separator fill.
 * @cssprop --gutter-hover-background - Separator fill on hover.
 * @csspart resize-handle - Separator control.
 * @csspart ghost - Animated insertion cue.
 * @csspart carried-ghost - Pointer-following carried view titles.
 * @csspart blocked-icon - Unavailable placement indicator.
 * @csspart drag-handle - Group movement control.
 * @csspart dropdown - Anchored arrangement actions.
 * @csspart select - Arrangement choice control.
 * @csspart button - Arrangement action.
 */
@scopedRegistry()
export class Workspace extends LitElement {
  static styles = useStyles([styles]);

  static elementDefinitions = {
    [ResizeHandle.metadata.tag]: ResizeHandle,
    [Ghost.metadata.tag]: Ghost,
    [Icon.metadata.tag]: Icon,
    [Dropdown.metadata.tag]: Dropdown,
    [DragHandle.metadata.tag]: DragHandle,
    [Select.metadata.tag]: Select,
    [Button.metadata.tag]: Button
  };

  static readonly metadata = { tag: 'nve-workspace', version: '0.0.0', children: ['nve-workspace-panel'] };

  readonly #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Overrides localized workspace commands. */
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
  @property({ reflect: true }) presentation: 'inset' | 'flush' = 'inset';

  #layout?: WorkspaceLayout;
  #restoring = false;
  #dragPreview?: WorkspaceDragPreview;

  readonly #actions = new WorkspaceActionsController(this, {
    strings: () => this.i18n,
    admits: (anchor, placement) => {
      const request = this.#resolvePlacement(anchor, placement);
      return !!request && this.#admits(request.source, request.intent);
    },
    groupSource: id => this.#groupSource(id),
    groups: () => this.#tablists.map(group => group.panels.map(panel => panel.id)),
    label: id => panelLabel(this.#panels, id),
    move: (anchor, placement) => {
      const request = this.#resolvePlacement(anchor, placement);
      if (request) this.#move(request.source, request.intent);
    }
  });

  readonly #rearrange = new WorkspaceRearrangeController(this, {
    enabled: () => this.rearrangeable,
    detachThreshold: () => this.detachThreshold,
    activate: (source, group) => {
      if (group) return;
      this.#select(new CustomEvent('nve-workspace-select', { detail: source[0] }));
      this.#focusPanel(
        source.find(id => !this.#layout?.closed.includes(id) && this.#panels.some(panel => panel.id === id))
      );
    },
    restoreFocus: (source, group) => this.#returnFocus(source, group),
    groupSource: anchor => this.#groupSource(anchor),
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
        saved: this.#layout ?? { version: 1, root: null, closed: [] },
        available: this.#panels.map(panel => panel.id)
      }),
    initialPlacement: (source, cue) =>
      this.#layout
        ? initialReservation({
            layout: this.#layout,
            source,
            cue,
            available: this.#panels.map(panel => panel.id),
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
      this.#chrome = chrome;
      this.#cancel();
      this.#rearrange.cancel();
    }
  });

  #mutation?: MutationObserver;

  /** Versioned JSON arrangement. Assignment restores silently. */
  @property({ type: String })
  get value(): string {
    return this.#layout ? JSON.stringify(this.#layout) : '';
  }

  set value(value: string) {
    const next = value ? parseLayout(value) : undefined;
    this.#rearrange.cancel();
    this.#actions.clear();
    const old = this.value;
    this.#cancelled = this.#cancelled || this.#pointerSession || this.#baseline !== undefined;
    this.#layout = next;
    this.#restoring = true;
    this.#preview = undefined;
    this.#baseline = undefined;
    this.#origin = undefined;
    this.requestUpdate('value', old);
  }

  connectedCallback() {
    super.connectedCallback();
    this.#mutation = new MutationObserver(records => this.#observeContent(records));
    this.#mutation.observe(this, {
      childList: true,
      characterData: true,
      attributes: true,
      subtree: true,
      attributeFilter: ['id', 'min-width', 'min-height', 'slot']
    });
    this.addEventListener('command', this.#command, true);
    this.addEventListener('nve-workspace-select', this.#select as EventListener);
    this.addEventListener('keydown', this.#keydown);
    this.ownerDocument.addEventListener('keydown', this.#globalKeydown);
  }

  disconnectedCallback() {
    this.#rearrange.cancel();
    this.#mutation?.disconnect();
    this.removeEventListener('command', this.#command, true);
    this.removeEventListener('nve-workspace-select', this.#select as EventListener);
    this.removeEventListener('keydown', this.#keydown);
    this.ownerDocument.removeEventListener('keydown', this.#globalKeydown);
    super.disconnectedCallback();
  }

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    if (changed.has('resizePolicy')) this.#cancel();
    if (changed.has('rearrangeable') && !this.rearrangeable) {
      this.#rearrange.cancel();
      this.#actions.clear();
    }
    if (changed.has('closable') && !this.closable) this.#actions.clear();
    if (changed.has('resizable') && !this.resizable && (this.#preview || this.#pointerSession)) {
      this.#cancel();
      this.#pointerSession = false;
    }
    this.#reconcile();
    this.#restoring = false;
  }

  protected updated() {
    this.#tablists.forEach(group => {
      group.panels.forEach(panel => {
        if (this.#isCarried(panel.id)) return;
        const button = this.shadowRoot?.querySelector<HTMLButtonElement>(`[data-panel="${CSS.escape(panel.id)}"]`);
        if (!button) return;
        button.ariaControlsElements = [panel];
        const labels = [...panel.querySelectorAll(':scope > [slot="label"]')];
        button.setAttribute('aria-label', panelLabel(this.#panels, panel.id));
        button.ariaLabelledByElements = labels;
        panel.setAttribute(
          'aria-label',
          labels
            .map(label => label.textContent)
            .join(' ')
            .trim() || panel.id
        );
      });
    });
  }

  render() {
    const drag = this.#dragPreview;
    const geometry = this.#renderGeometry();
    const minimum = minimumWorkspace(
      this.#project(this.#layout ?? { version: 1, root: null, closed: [] }).root,
      this.#requirements()
    );
    this.#tablists = presentedTabGroups(geometry.groups, this.#layout?.root ?? null, this.#dragPreview?.source);
    const headers = this.#tablists;
    const receiving = geometry.regions;
    this.#boundaries = geometry.boundaries;
    this.#tablists.forEach(group => this.#configureGroup(group));
    const visible = new Set(this.#tablists.flatMap(group => group.panels));
    this.#panels.forEach(panel => {
      panel._present(visible.has(panel) && !this.#isCarried(panel.id));
    });
    return html`
      <div internal-host ?data-rearranging=${!!drag} ?data-peer-preview=${!!drag} data-preview-allocation=${ifDefined(drag && 'allocation' in drag ? drag.allocation : undefined)} style=${`--_minimum-height:${minimum.height}px`}>
        <div class="viewport" @scroll=${() => this.#rearrange.refresh()}><div class="canvas" style=${`min-width:${geometry.minimum.width}px;min-height:${geometry.minimum.height}px`}>
          ${repeat(
            headers,
            group => this.#groupIdentity(group),
            group => this.#renderTabs(group)
          )}
          <slot @slotchange=${() => this.requestUpdate()}></slot>
          ${
            this.resizable
              ? repeat(
                  this.#boundaries,
                  item => item.key,
                  item => this.#renderHandle(item)
                )
              : null
          }
          <div class="preview-layer" data-drag-phase=${ifDefined(this.#dragPreview?.phase)}>${this.#renderDragPreview(receiving)}</div>
        </div></div>
        ${this.rearrangeable ? this.#actions.renderActions() : null}
        ${renderChromeProbe(this)}
      </div>
    `;
  }

  get #effectivePolicy(): 'stop' | 'propagate' {
    return this.resizePolicy === 'propagate' ? 'propagate' : 'stop';
  }

  get #panels(): WorkspacePanel[] {
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
    const labels = records.some(record => this.#labelMutation(record));
    if (catalogue) {
      this.#cancel();
      this.#rearrange.cancel();
    }
    if (catalogue || labels) this.requestUpdate();
  }

  #ownsPanel(node: Node | null | undefined) {
    return node instanceof WorkspacePanel && node.parentElement === this;
  }

  #labelMutation(record: MutationRecord) {
    if (this.#ownsPanel(record.target)) {
      return [...record.addedNodes, ...record.removedNodes].some(
        node => node instanceof Element && node.getAttribute('slot') === 'label'
      );
    }
    const element = record.target instanceof Element ? record.target : record.target.parentElement;
    if (record.attributeName === 'slot' && this.#ownsPanel(element?.parentElement)) return true;
    const label = element?.closest('[slot="label"]');
    return this.#ownsPanel(label?.parentElement);
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
    this.#actions.clear();
    this.#layout = next;
    this.#commit();
  }

  #command = (event: WorkspaceCommandEvent) => {
    if (event.defaultPrevented || event.source?.disabled || event.source?.readOnly) return;
    const panel = this.#commandPanel(event);
    if (!panel) return;
    this.#dispatchCommand(panel, event);
  };

  #dispatchCommand(panel: WorkspacePanel, event: WorkspaceCommandEvent) {
    switch (event.command) {
      case '--open':
        this.#activatePanel(panel.id, 'open');
        break;
      case '--select':
        this.#activatePanel(panel.id, 'select');
        break;
      case '--close':
        this.#close(panel.id);
        break;
      case '--arrange':
        this.#arrangeCommand(panel, event.source, false);
        break;
      case '--arrange-pane':
        this.#arrangeCommand(panel, event.source, true);
        break;
      case '--place':
        this.#placeCommand(panel.id, event.source?.placement);
        break;
      case undefined:
        break;
    }
  }

  #arrangeCommand(panel: WorkspacePanel, source: HTMLElement | null | undefined, wholePane: boolean) {
    if (!this.rearrangeable || this.#layout?.closed.includes(panel.id)) return;
    this.#rearrange.cancel();
    this.#cancel();
    this.#actions.open(panel.id, source ?? panel, wholePane);
  }

  #placeCommand(anchor: string, placement: unknown) {
    if (!this.rearrangeable || !isWorkspacePlacement(placement)) return;
    const request = this.#resolvePlacement(anchor, placement);
    if (request) this.#move(request.source, request.intent);
  }

  #commandPanel(event: WorkspaceCommandEvent) {
    if (event.target === this) {
      const id = event.source?.value;
      return typeof id === 'string' ? this.#panels.find(panel => panel.id === id) : undefined;
    }
    return event.target instanceof WorkspacePanel && event.target.parentElement === this ? event.target : undefined;
  }

  #resolvePlacement(anchor: string, placement: WorkspacePlacement) {
    return this.#layout
      ? resolveWorkspacePlacement({
          layout: this.#layout,
          anchor,
          placement,
          available: this.#panels.map(panel => panel.id)
        })
      : undefined;
  }

  #gesture = (event: CustomEvent<GestureInput>) => {
    if (!event.composedPath().some(item => item instanceof HTMLElement && item.localName === 'nve-resize-handle'))
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
    navigateTabStrip(this, event, { panels: this.#panels, groups: this.#tablists, select: this.#select });
  };

  #cancel() {
    this.#preview = undefined;
    this.#baseline = undefined;
    this.#origin = undefined;
    this.#cancelled = true;
    this.requestUpdate();
  }

  #commit(cause: 'interaction' | 'content' = 'interaction') {
    this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent('workspacechange', { bubbles: true, composed: true, detail: { value: this.value, cause } })
    );
  }

  #requirements() {
    return workspaceRequirements({ chrome: this.#chrome, panels: this.#panels });
  }

  #geometry(layout: WorkspaceLayout, extent = layout) {
    const requirements = this.#requirements();
    const minimum = minimumWorkspace(extent.root, requirements);
    const width = Math.max(this.#chrome.width, minimum.width);
    const height = Math.max(this.#chrome.height, minimum.height);
    const allocated = allocateWorkspace({
      root: layout.root,
      rect: { x: 0, y: 0, width, height },
      minimum: node => minimumWorkspace(node, requirements),
      policy: this.#effectivePolicy
    });
    const groups = createTabGroups({
      groups: allocated.groups,
      panels: this.#panels,
      root: this.#layout?.root ?? null,
      source: this.#dragPreview?.source ?? [],
      gripWidth: this.#chrome.gripWidth
    });
    return { ...allocated, width, height, minimum, groups };
  }

  #configureGroup(group: TabGroup) {
    group.panels.forEach((panel, index) => {
      if (this.#isCarried(panel.id)) return;
      if (panel.getAttribute('presentation') !== this.presentation)
        panel.setAttribute('presentation', this.presentation);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-hidden', String(group.active !== panel.id));
      const rect = group.rect;
      Object.assign(panel.style, {
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
      });
      const { headerHeight, actionWidth } = this.#chrome;
      const tabWidth = this.#tabWidth(group);
      const scroll = this.#strip(group)?.scrollLeft ?? 0;
      panel._configure({
        selected: group.active === panel.id,
        offset: group.gripWidth + index * tabWidth,
        scrollLeft: scroll,
        animate: !!this.#dragPreview,
        tabWidth: Math.max(0, tabWidth - actionWidth * (Number(this.rearrangeable) + Number(this.closable))),
        headerHeight,
        clipLeft: group.gripWidth,
        clipWidth: Math.max(0, rect.width - group.gripWidth)
      });
    });
  }

  #isCarried(id: string) {
    return this.#dragPreview?.source.includes(id) ?? false;
  }

  #project(layout: WorkspaceLayout) {
    return projectLayout(
      layout,
      this.#panels.map(panel => panel.id)
    );
  }

  #dragGeometry(source: string[]) {
    const saved = this.#layout ?? { version: 1 as const, root: null, closed: [] };
    return this.#geometry(this.#project(detachedLayout(saved, source)), this.#project(saved));
  }

  #initialCue(source: string[], groupDrag: boolean): WorkspaceDragCue {
    return initialDragCue({
      groups: this.#geometry(this.#project(this.#layout ?? { version: 1, root: null, closed: [] })).groups,
      source,
      groupDrag,
      bounds: interactionBounds(this),
      client: rect => canvasClientRect(this, rect),
      chrome: this.#chrome,
      width: group => this.#tabWidth(group),
      scroll: group => this.#strip(group)?.scrollLeft ?? 0
    });
  }

  #offer(source: string[], intent: WorkspaceDropIntent, context?: WorkspaceOfferContext) {
    if (!this.#layout || intent.kind === 'invalid') return undefined;
    const acquisition = context?.acquisition;
    const plan = acquisition?.plan ?? this.#candidate(source, intent);
    if (!plan) return undefined;
    const { width, height } = this.#geometry(this.#project(plan.layout));
    const fit = selectedPlacementPlan({
      plan,
      source,
      available: this.#panels.map(panel => panel.id),
      previous: context?.selected,
      intent,
      acquisition,
      current: this.#renderGeometry().regions,
      rect: { x: 0, y: 0, width, height },
      origin: canvasClientRect(this, { x: 0, y: 0, width: 0, height: 0 }),
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
    const rect = canvasClientRect(this, group.rect);
    const { cue, bounds } =
      intent.kind === 'tab' ? this.#tabCue({ group, source, intent }) : { cue: rect, bounds: interactionBounds(this) };
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
      client: targetRect => canvasClientRect(this, targetRect)
    });
    if (intent.kind !== 'tab' && (presentation.cue.width === 0 || presentation.cue.height === 0)) return undefined;
    return {
      ...presentation,
      cue: { kind: intent.kind === 'tab' ? ('tab' as const) : ('pane' as const), rect: presentation.cue },
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
    const tabs = tabRecipient({
      group,
      intent,
      spatial: () => this.#dragGeometry(source).groups
    });
    return reservedTabCue({
      rect: canvasClientRect(this, tabs.rect),
      viewport: interactionBounds(this),
      grip: tabs.gripWidth,
      headerHeight: this.#chrome.headerHeight,
      tabWidth: this.#tabWidth(tabs),
      panels: tabs.panels.map(panel => panel.id),
      source,
      scroll: this.#strip(tabs)?.scrollLeft ?? 0
    });
  }

  #candidate(source: string[], intent: WorkspacePlacementIntent): WorkspacePlacementPlan | undefined {
    if (!this.#layout) return undefined;
    return planWorkspacePlacement({
      layout: this.#layout,
      source,
      destination: intent.destination,
      operation: intent.kind,
      available: this.#panels.map(panel => panel.id),
      preference:
        intent.kind === 'split'
          ? { allocation: this.#dragGeometry(source).regions, requirements: this.#requirements() }
          : undefined
    });
  }

  #candidateFits(candidate: WorkspaceLayout) {
    return admitsWorkspaceMove({
      current: this.#project(this.#layout ?? { version: 1, root: null, closed: [] }).root,
      candidate: candidate.root,
      viewport: { width: this.#chrome.width, height: this.#chrome.height },
      requirements: this.#requirements()
    });
  }

  #targetCatalog(source: string[], allocation = this.#nonOrderGeometry(source)) {
    const saved = this.#layout ?? { version: 1 as const, root: null, closed: [] };
    return workspaceInputCatalog({
      saved,
      catalog: this.#geometry(this.#project(saved)).regions,
      allocation,
      reservation: this.#renderGeometry(),
      preview: this.#dragPreview,
      source,
      available: this.#panels.map(panel => panel.id),
      bounds: interactionBounds(this),
      client: rect => canvasClientRect(this, rect),
      headerHeight: this.#chrome.headerHeight
    });
  }

  #resize(event: Event, boundary: Boundary, committed: boolean) {
    event.stopPropagation();
    if (!this.#layout || this.#cancelled || !this.resizable) return;
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
    return rebaseProjectedSplit(
      this.#baseline,
      origin.branch,
      sizes,
      this.#panels.map(panel => panel.id)
    );
  }

  #reconcile() {
    const ids = this.#panels.map(panel => panel.id);
    if (!ids.every(Boolean) || new Set(ids).size !== ids.length) return;
    if (!this.#layout) {
      if (ids.length) this.#layout = { version: 1, root: { type: 'pane', panels: ids, active: ids[0]! }, closed: [] };
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
    const drag = this.#dragPreview;
    if (isNonOrderPreview(drag)) return this.#nonOrderGeometry(drag.source);
    if (drag && 'allocation' in drag && drag.allocation === 'reserved')
      return this.#geometry(this.#project(drag.layout));
    if (isOverlayDetachedPreview(drag)) return this.#dragGeometry(drag.source);
    return this.#geometry(this.#project(this.#preview ?? this.#layout ?? { version: 1, root: null, closed: [] }));
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
      groups: this.#nonOrderGeometry(source).groups,
      chrome: this.#chrome,
      source,
      point,
      bounds: interactionBounds(this),
      client: (rect: Rect) => canvasClientRect(this, rect),
      scroll: (group: TabGroup) => this.#strip(group)?.scrollLeft ?? 0
    };
  }

  #tabWidth(group: TabGroup) {
    return Math.max(this.#chrome.tabWidth, (group.rect.width - group.gripWidth) / group.panels.length);
  }

  #groupIdentity(group: TabGroup) {
    return tabStripIdentity(
      this.#layout?.root ?? null,
      group.panels.map(panel => panel.id),
      this.#dragPreview?.source ?? []
    );
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
      scroll: this.#strip(group)?.scrollLeft ?? 0,
      source: this.#dragPreview?.source ?? [],
      reserved: this.#reserved(),
      rearrangeable: this.rearrangeable,
      closable: this.closable,
      strings: this.i18n,
      label: id => panelLabel(this.#panels, id),
      scrollChanged: () => {
        this.requestUpdate();
        this.#rearrange.refresh();
      },
      select: id => this.#select(new CustomEvent('nve-workspace-select', { detail: id })),
      close: id => this.#close(id),
      actions: (id, trigger) => this.#actions.prepare(id, trigger)
    });
  }

  #groupSource(anchor: string): string[] {
    return [...(findPane(this.#layout?.root ?? null, anchor)?.panels ?? [])];
  }

  #admits(source: string[], intent: WorkspacePlacementIntent) {
    if (!this.#layout) return false;
    const next = this.#candidate(source, intent);
    return !!next && JSON.stringify(next.layout) !== this.value && this.#candidateFits(this.#project(next.layout));
  }

  #move(source: string[], intent: WorkspacePlacementIntent, layout?: WorkspaceLayout) {
    if (!this.rearrangeable || !this.#layout) return false;
    const next = layout ? { layout } : this.#candidate(source, intent);
    if (!next || JSON.stringify(next.layout) === this.value || !this.#candidateFits(this.#project(next.layout)))
      return false;
    this.#rearrange.cancel();
    this.#cancel();
    this.#layout = next.layout;
    this.#actions.clear();
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
    this.#actions.clear();
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
      const target = id ? this.shadowRoot?.querySelector<HTMLElement>(`[data-panel="${CSS.escape(id)}"]`) : undefined;
      (target ?? this.shadowRoot?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]'))?.focus({
        preventScroll: options?.preserveScroll
      });
      if (!options?.preserveScroll) target?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }

  #renderDragPreview(allocation: WorkspacePlacedRegion[]) {
    const preview = this.#dragPreview;
    if (!preview) return null;
    const { x, y } = canvasClientRect(this, { x: 0, y: 0, width: 0, height: 0 });
    const title = preview.source
      .filter(id => !this.#layout?.closed.includes(id) && this.#panels.some(panel => panel.id === id))
      .map(id => panelLabel(this.#panels, id))
      .join(', ');
    const saved = this.#layout ?? { version: 1 as const, root: null, closed: [] };
    const catalog = this.#geometry(this.#project(saved)).regions;
    const contexts = allocateContextProxies({ catalog, allocation, source: preview.source });
    const bounds = interactionBounds(this);
    const scene = { ...this.#targetCatalog(preview.source), preview, x, y };
    return renderPreview({
      preview,
      contexts,
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
              available: this.#panels.map(panel => panel.id)
            }).hint
          : undefined
    });
  }

  #renderHandle(item: Boundary) {
    return html`
      <nve-resize-handle data-boundary=${item.key} part="resize-handle" style=${`left:${item.rect.x}px;top:${item.rect.y}px;width:${item.rect.width}px;height:${item.rect.height}px`} orientation=${item.branch.axis === 'horizontal' ? 'vertical' : 'horizontal'} aria-label=${ifDefined(this.i18n.workspaceResize)} .min=${item.min} .max=${item.max} .step=${10} .value=${item.value} @nve-gesture-input=${this.#gesture} @toggle=${(event: Event) => event.preventDefault()} @input=${(event: Event) => this.#resize(event, item, false)} @change=${(event: Event) => this.#resize(event, item, true)}></nve-resize-handle>
    `;
  }
}
