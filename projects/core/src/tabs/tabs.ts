// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import { ButtonFormControlMixin } from '@nvidia-elements/forms/mixins';
import type { KeynavListConfig } from '@nvidia-elements/core/internal';
import {
  stateSelected,
  useStyles,
  KeyNavigationListController,
  attachInternals,
  audit,
  appendRootNodeStyle,
  appendAnchorName,
  removeAnchorName
} from '@nvidia-elements/core/internal';
import type { TabsItemGroup } from './tabs-item-group.js';
import { getTabItems, isTabItemTabbable } from './utils.js';
import globalStyles from './tabs.global.css?inline';
import tabsItemStyleSheet from './tabs-item.css?inline';
import tabsItemPresentation from './tabs-item.presentation.css?inline';
import tabsStyleSheet from './tabs.css?inline';

/**
 * @element nve-tabs-item
 * @description Represents an individual tab within a tablist, providing a selectable button for switching between content views.
 * @documentation https://nvidia.github.io/elements/docs/elements/tabs/
 * @since 0.10.0
 * @entrypoint \@nvidia-elements/core/tabs
 * @slot - The label displayed for the tab.
 * @slot prefix - Decoration before the label.
 * @slot suffix - Supporting content after the label.
 * @cssprop --gap - Spacing between the label and decoration.
 * @cssprop --font-size
 * @cssprop --width
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --font-weight
 * @cssprop --border-radius
 * @cssprop --color
 * @cssprop --height
 * @cssprop --cursor
 * @cssprop --text-transform
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 * @responsive false
 */
@audit()
@stateSelected<TabsItem>()
export class TabsItem extends ButtonFormControlMixin(LitElement) {
  /**
   * Determines which tab item the user selects, defaults to false.
   */
  @property({ type: Boolean, reflect: true }) selected = false;

  static styles = useStyles([tabsItemPresentation, tabsItemStyleSheet]);

  static readonly metadata = {
    tag: 'nve-tabs-item',
    version: '0.0.0',
    parents: ['nve-tabs', 'nve-tabs-item-group']
  };

  render() {
    return html`
      <div internal-host focus-within>
        <slot name="prefix"></slot>
        <div id="label"><slot></slot></div>
        <slot name="suffix"></slot>
      </div>
    `;
  }

  constructor() {
    super();
    this.type = 'button';
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'tab';
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);

    if (props.has('selected')) {
      if (this.selected) {
        appendAnchorName(this, '--selected');
      } else {
        removeAnchorName(this, '--selected');
      }
    }
  }
}

/**
 * @element nve-tabs
 * @description Tabs provide a selection UX, typically used for swapping content shown on a page, or within a navigation context.
 * @documentation https://nvidia.github.io/elements/docs/elements/tabs/
 * @since 0.10.0
 * @entrypoint \@nvidia-elements/core/tabs
 * @slot - default slot for tab-item
 * @cssprop --gap
 * @cssprop --indicator-animation-duration - Duration of selection indicator movement.
 * @cssprop --indicator-background
 * @cssprop --indicator-border-radius
 * @cssprop --indicator-height
 * @cssprop --border-inset
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 * @responsive false
 */
@audit()
export class Tabs extends LitElement {
  /**
   * Determines whether the tabs should display in a vertical layout vs. defaulting to horizontal.
   */
  @property({ type: Boolean, reflect: true }) vertical = false;

  /**
   * Determines whether the tabs should display a border on selected items vs. defaults to show border.
   */
  @property({ type: Boolean, reflect: true }) borderless = false;

  /**
   * Determines whether the tabs should handle selection behavior vs. defaults to off.
   */
  @property({ type: Boolean, attribute: 'behavior-select' }) behaviorSelect = false;

  static styles = useStyles([tabsStyleSheet]);

  static readonly metadata = {
    tag: 'nve-tabs',
    version: '0.0.0',
    children: ['nve-tabs-item', 'nve-tabs-item-group']
  };

  /** @private */
  get keynavListConfig(): KeynavListConfig {
    const items = this.#items;
    return {
      items,
      initialItem: items.find(item => item.selected),
      layout: this.vertical ? 'vertical' : 'horizontal',
      dir: getComputedStyle(this).direction
    };
  }

  @queryAssignedElements() private entries!: HTMLElement[];

  get #items(): TabsItem[] {
    return getTabItems(this.entries ?? []);
  }

  #keynavController = new KeyNavigationListController(this);
  #knownItems: TabsItem[] = [];
  #itemsObserver?: MutationObserver;

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${this.#syncItems}></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
    attachInternals(this);
    this._internals.role = 'tablist';
    this.addEventListener('click', this.#onClick);
    this.#observeItems();
    if (this.hasUpdated) this.#syncAccessoryTabState();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#onClick);
    this.#itemsObserver?.disconnect();
  }

  firstUpdated() {
    this.#itemsObserver = new MutationObserver(this.#syncFromItems);
    this.#observeItems();
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this._internals.ariaOrientation = this.vertical ? 'vertical' : 'horizontal';
  }

  #observeItems() {
    this.#itemsObserver?.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tabindex', 'href', 'slot']
    });
  }

  #syncFromItems = (records: MutationRecord[]) => {
    if (records.some(record => record.type === 'childList' || record.attributeName === 'slot')) {
      void this.#syncItems();
    } else if (records.some(record => this.#items.some(item => item.contains(record.target)))) {
      this.#syncAccessoryTabState();
    }
  };

  #syncItems = async () => {
    const items = this.#items;
    if (items.length === this.#knownItems.length && items.every((item, index) => item === this.#knownItems[index])) {
      this.#syncAccessoryTabState();
      return;
    }

    const previousItems = this.#knownItems;
    this.#knownItems = items;
    await Promise.all(items.map(item => item.updateComplete));
    if (items !== this.#knownItems) return;

    this.#keynavController.refreshItems(previousItems);
    this.#syncAccessoryTabState();
  };

  #syncAccessoryTabState() {
    this.querySelectorAll<TabsItemGroup>(':scope > nve-tabs-item-group').forEach(group => {
      const item = getTabItems([group])[0];
      group.accessoryTabEnabled = !!item && isTabItemTabbable(item);
    });
  }

  #selectTab(tabItem: HTMLElement & { matches: Element['matches']; disabled?: boolean; selected?: boolean }) {
    if (!this.behaviorSelect || !tabItem.matches('nve-tabs-item') || tabItem.disabled) {
      return;
    }

    this.keynavListConfig.items.forEach((i: HTMLElement) => ((i as TabsItem).selected = false));
    tabItem.selected = true;
  }

  #onClick = (event: Event) => {
    const path = event.composedPath();
    const item = this.#items.find(candidate => path.includes(candidate));
    if (item) this.#selectTab(item);
  };
}
