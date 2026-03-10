import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import type { KeynavListConfig } from '@nvidia-elements/core/internal';
import {
  BaseButton,
  stateSelected,
  useStyles,
  keyNavigationList,
  attachInternals,
  audit,
  appendRootNodeStyle,
  appendAnchorName,
  removeAnchorName
} from '@nvidia-elements/core/internal';
import globalStyles from './tabs.global.css?inline';
import tabsItemStyleSheet from './tabs-item.css?inline';
import tabsStyleSheet from './tabs.css?inline';

/**
 * @element nve-tabs-item
 * @description Represents an individual tab within a tablist, providing a selectable button for switching between content views.
 * @since 0.10.0
 * @entrypoint \@nvidia-elements/core/tabs
 * @slot - default slot for content
 * @cssprop --font-size
 * @cssprop --border-width
 * @cssprop --border-height
 * @cssprop --border-top
 * @cssprop --border-background
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
export class TabsItem extends BaseButton {
  /**
   * Determines which tab item the user selects, defaults to false.
   */
  @property({ type: Boolean, reflect: true }) selected = false;

  static styles = useStyles([tabsItemStyleSheet]);

  static readonly metadata = {
    tag: 'nve-tabs-item',
    version: '0.0.0',
    parents: ['nve-tabs']
  };

  render() {
    return html`
      <div internal-host focus-within>
        <slot></slot>
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
 * @since 0.10.0
 * @entrypoint \@nvidia-elements/core/tabs
 * @slot - default slot for tab-item
 * @cssprop --gap
 * @cssprop --indicator-background
 * @cssprop --indicator-border-radius
 * @cssprop --indicator-height
 * @cssprop --border-inset
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 * @responsive false
 */
@audit()
@keyNavigationList<Tabs>()
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
    children: ['nve-tabs-item']
  };

  /** @private */
  get keynavListConfig(): KeynavListConfig {
    return {
      items: this.items,
      layout: this.vertical ? 'vertical' : 'horizontal'
    };
  }

  @queryAssignedElements() private items!: TabsItem[];

  /** @private */
  declare _internals: ElementInternals;

  #selectTab(tabItem: HTMLElement & { matches: Element['matches']; disabled?: boolean; selected?: boolean }) {
    if (!this.behaviorSelect || !tabItem.matches('nve-tabs-item, nve-tabs-item') || tabItem.disabled) {
      return;
    }

    this.keynavListConfig.items.forEach((i: HTMLElement) => ((i as TabsItem).selected = false));
    tabItem.selected = true;
  }

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
    attachInternals(this);
    this._internals.role = 'tablist';
    this.addEventListener('click', (e: Event) =>
      this.#selectTab(e.target as HTMLElement & { matches: Element['matches']; disabled?: boolean; selected?: boolean })
    );
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this._internals.ariaOrientation = this.vertical ? 'vertical' : 'horizontal';
  }
}
