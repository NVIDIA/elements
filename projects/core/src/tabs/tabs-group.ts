// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import { state } from 'lit/decorators/state.js';
import {
  attachInternals,
  audit,
  generateId,
  sameOrderedStringArray,
  uniqueNonEmptyStrings,
  useStyles
} from '@nvidia-elements/core/internal';
import { Tabs, type TabsItem } from './tabs.js';
import styles from './tabs-group.css?inline';

/** Invoker command source for `--toggle` (e.g. `nve-tabs-item` with `value`). */
type TabsGroupCommandSource = HTMLElement & {
  disabled?: boolean;
  value?: string | null;
};

/** `command` event from Invoker Commands; `source` is the control that fired. */
type TabsGroupCommandEvent = Event & {
  command?: string;
  source?: TabsGroupCommandSource | null;
};

/** Payload for the composed `select` event when the active tab value changes via command. */
type TabsGroupSelectDetail = { value: string };

/** Arranges the tab strip and slot-matched panels: stacked column (`top`), or sidebar row with tabs at inline-start (`start`) or inline-end (`end`). */
export type TabsGroupAlignment = 'top' | 'start' | 'end';

/**
 * @element nve-tabs-group
 * @description Coordinates tabs with matching panel content using Invoker Commands and slot-matched panels.
 * @since 1.67.0
 * @entrypoint \@nvidia-elements/core/tabs
 * @command --toggle - Select the matching tab and reveal the panel whose slot matches the invoker value.
 * @event select - Dispatched when the selected tab value changes after an invoker `--toggle` updates selection
 * @slot - Default slot for a single nve-tabs element. Do not use behavior-select on nve-tabs when using this group.
 * @slot {value} - Named panel content where the slot name matches a nve-tabs-item value.
 * @cssprop --padding
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 * @responsive false
 */
@audit()
export class TabsGroup extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-tabs-group',
    version: '0.0.0',
    children: ['nve-tabs']
  };

  /** Options for observing the slotted `nve-tabs` subtree (tab list / item attribute changes). */
  protected static readonly subtreeObserverInit = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled', 'id', 'selected', 'value']
  } as const satisfies MutationObserverInit;

  @queryAssignedElements({ flatten: true }) private defaultSlotElements!: HTMLElement[];

  /**
   * Arranges the tab strip relative to slot-matched panels: stacked column (`top`), or sidebar row with tabs at
   * inline-start (`start`) or inline-end (`end`) beside the panel region.
   */
  @property({ type: String, reflect: true }) alignment: TabsGroupAlignment = 'top';

  @state() private panelValues: string[] = [];

  @state() private selectedValue = '';

  /** @private */
  declare _internals: ElementInternals;

  #tabsObserver?: MutationObserver;

  /**
   * Renders the default slot (single `nve-tabs`) plus one named `<slot name={value}>` per distinct selectable
   * `nve-tabs-item` value. `#syncPanelSlot` applies panel visibility and ARIA from `selectedValue`.
   */
  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${this.#handleDefaultSlotChange}></slot>
        ${this.panelValues.map(value => html`<slot name=${value} @slotchange=${this.#handlePanelSlotChange}></slot>`)}
      </div>
    `;
  }

  // --- Lifecycle & command ---

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'group';
    this.addEventListener('command', this.#handleCommand as EventListener);
  }

  firstUpdated() {
    void this.updateComplete.then(() => {
      if (!this.isConnected) {
        return;
      }

      this.#syncFromTabs();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('command', this.#handleCommand as EventListener);
    this.#tabsObserver?.disconnect();
  }

  updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);

    if (!this.#tabsObserver) {
      this.#observeTabs();
    }

    // `@state()` fields are not in `PropertyValues<this>` keys; cast for membership checks.
    const props = changedProperties as ReadonlyMap<PropertyKey, unknown>;
    if (props.has('panelValues') || props.has('selectedValue')) {
      this.#syncPanels();
    }
  }

  #handleDefaultSlotChange = (): void => {
    this.#observeTabs();
    this.#syncFromTabs();
  };

  #handlePanelSlotChange = (): void => {
    this.#syncPanels();
  };

  /**
   * Handles Invoker `--toggle` on a tab item: selects the matching `nve-tabs-item` and syncs panels.
   * Ignores non-toggle commands and invokers without a non-empty string `value`.
   */
  #handleCommand = (event: TabsGroupCommandEvent): void => {
    if (event.command !== '--toggle') {
      return;
    }

    const value = event.source?.value;
    if (typeof value !== 'string' || !value.length) {
      return;
    }

    const tabItems = this.#getTabItems();
    const tabItem = tabItems.find(item => this.#isSelectableTab(item) && item.value === value);
    if (!tabItem) {
      return;
    }

    this.#setActiveTab(tabItems, tabItem, { emitEvent: true });
  };

  // --- Tab strip sync (tabs → state) ---

  /** Attaches a single `MutationObserver` on the slotted `nve-tabs` element to mirror tab list changes into state. */
  #observeTabs(): void {
    this.#tabsObserver?.disconnect();

    const tabs = this.#getTabsElement();
    if (!tabs) {
      return;
    }

    this.#tabsObserver = new MutationObserver(() => this.#syncFromTabs());
    this.#tabsObserver.observe(tabs, TabsGroup.subtreeObserverInit);
  }

  /**
   * Reads the current tab items: derives ordered `panelValues` for render, resolves which tab should be active,
   * and commits selection. Called on slot change, subtree mutations, and after mount.
   */
  #syncFromTabs(): void {
    const tabItems = this.#getTabItems();
    const nextPanelValues = uniqueNonEmptyStrings(tabItems.map(item => item.value));

    const selectedTab = this.#resolveSelectedTab(tabItems);

    if (!selectedTab) {
      tabItems.forEach(item => (item.selected = false));
      this.#commitState(nextPanelValues, '');
      return;
    }

    this.#setActiveTab(tabItems, selectedTab, { emitEvent: false, nextPanelValues });
  }

  /**
   * Sets exactly one selected tab, updates `panelValues` / `selectedValue`, and optionally dispatches `select`.
   *
   * @param emitEvent - When true (command path), dispatches `select` if selection actually changed.
   */
  #setActiveTab(
    tabItems: TabsItem[],
    nextTab: TabsItem,
    options: { emitEvent: boolean; nextPanelValues?: string[] }
  ): void {
    const { emitEvent } = options;
    const nextPanelValues = options.nextPanelValues ?? uniqueNonEmptyStrings(tabItems.map(item => item.value));
    // True when the effective selection differs from the prior committed state (value, flags, or multi-select).
    // `select` is only dispatched when both `emitEvent` (invoker/command path) and `changed` are true.
    const changed =
      this.selectedValue !== nextTab.value ||
      !nextTab.selected ||
      tabItems.some(item => item !== nextTab && item.selected);

    tabItems.forEach(item => {
      item.selected = item === nextTab;
    });

    this.#commitState(nextPanelValues, nextTab.value);

    if (emitEvent && changed) {
      this.dispatchEvent(
        new CustomEvent<TabsGroupSelectDetail>('select', {
          bubbles: true,
          composed: true,
          detail: { value: nextTab.value }
        })
      );
    }
  }

  /** Updates reactive state for panel slot names and the active tab value without touching the tab items. */
  #commitState(nextPanelValues: string[], nextSelectedValue: string): void {
    if (!sameOrderedStringArray(this.panelValues, nextPanelValues)) {
      this.panelValues = nextPanelValues;
    }

    if (this.selectedValue !== nextSelectedValue) {
      this.selectedValue = nextSelectedValue;
    }
  }

  // --- Panel sync (state → panels & ARIA) ---

  /** For each named panel slot, wires `hidden` and tab↔panel ARIA ids to match `selectedValue`. */
  #syncPanels(): void {
    const tabItems = this.#getTabItems();
    const tabMap = new Map(
      tabItems.filter(item => this.#isSelectableTab(item)).map(item => [item.value, item] satisfies [string, TabsItem])
    );

    this.#getPanelSlots().forEach(slot => {
      this.#syncPanelSlot(slot, tabMap);
    });
  }

  /**
   * If no selectable tab exists for `slot.name`, hides all assigned nodes. Otherwise shows only the panel(s)
   * for the active value and assigns `role="tabpanel"` / `aria-labelledby` when missing.
   */
  #syncPanelSlot(slot: HTMLSlotElement, tabMap: ReadonlyMap<string, TabsItem>): void {
    const tabItem = tabMap.get(slot.name);
    const panels = slot.assignedElements({ flatten: true }) as HTMLElement[];

    if (!tabItem) {
      panels.forEach(panel => {
        panel.hidden = true;
      });
      return;
    }

    tabItem.id ||= generateId();

    panels.forEach((panel, index) => {
      panel.id ||= generateId();

      if (!tabItem.hasAttribute('aria-controls') && index === 0) {
        tabItem.setAttribute('aria-controls', panel.id);
      }

      if (!panel.hasAttribute('aria-labelledby')) {
        panel.setAttribute('aria-labelledby', tabItem.id);
      }

      if (!panel.hasAttribute('role')) {
        panel.setAttribute('role', 'tabpanel');
      }

      const isActive = slot.name === this.selectedValue;
      panel.hidden = !isActive;
    });
  }

  // --- DOM queries ---

  /** Resolves the single slotted `nve-tabs` (default slot), with a light-DOM fallback for edge timing. */
  #getTabsElement(): Tabs | undefined {
    const el =
      this.defaultSlotElements.find(element => element.localName === Tabs.metadata.tag) ??
      this.querySelector(Tabs.metadata.tag);
    return el instanceof Tabs ? el : undefined;
  }

  #getTabItems(): TabsItem[] {
    return Array.from(this.#getTabsElement()?.querySelectorAll<TabsItem>('nve-tabs-item') ?? []);
  }

  #getPanelSlots(): HTMLSlotElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLSlotElement>('slot[name]'));
  }

  /** Selectable tabs have a non-empty `value` and are not `disabled`. */
  #isSelectableTab(tabItem: TabsItem): tabItem is TabsItem & { value: string } {
    return typeof tabItem.value === 'string' && tabItem.value.length > 0 && !tabItem.disabled;
  }

  /** Prefer the selectable tab that is already selected; otherwise the first selectable tab. */
  #resolveSelectedTab(tabItems: readonly TabsItem[]): TabsItem | undefined {
    return (
      tabItems.find(item => this.#isSelectableTab(item) && item.selected) ??
      tabItems.find(item => this.#isSelectableTab(item))
    );
  }
}
