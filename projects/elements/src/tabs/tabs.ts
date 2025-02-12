import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import type { KeynavListConfig } from '@nvidia-elements/core/internal';
import { BaseButton, stateSelected, useStyles, keyNavigationList, attachInternals } from '@nvidia-elements/core/internal';
import tabsItemStyleSheet from './tabs-item.css?inline';
import tabsStyleSheet from './tabs.css?inline';

/**
 * @element nve-tabs-item
 * @since 0.10.0
 * @slot - default slot for content
 * @cssprop --font-size
 * @cssprop --border-width
 * @cssprop --border-height
 * @cssprop --border-top
 * @cssprop --border-background
 * @cssprop --width
 * @cssprop --font-size
 * @cssprop --font-weight
 * @cssprop --border-radius
 * @cssprop --color
 * @cssprop --height
 * @cssprop --cursor
 * @cssprop --text-transform
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-tabs-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-55&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 * @responsive false
 */
@stateSelected<TabsItem>()
export class TabsItem extends BaseButton {
  /**
   * Determines which tab item is selected, defaults to false.
   */
  @property({ type: Boolean, reflect: true }) selected = false;

  static styles = useStyles([tabsItemStyleSheet]);

  static readonly metadata = {
    tag: 'nve-tabs-item',
    version: '0.0.0'
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
}

/**
 * @element nve-tabs
 * @description Tabs provide a selection UX, typically used for swapping content shown on a page, or within a navigation context.
 * @since 0.10.0
 * @slot - default slot for tab-item
 * @cssprop --gap
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-tabs-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-55&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 * @responsive false
 */
@keyNavigationList<Tabs>()
export class Tabs extends LitElement {
  /**
   * Determines whether or not the tabs should display in a vertical layout vs. defaulting to horizontal.
   */
  @property({ type: Boolean, reflect: true }) vertical = false;

  /**
   * Determines whether or not the tabs should display a border on selected items vs. defaults to show border.
   */
  @property({ type: Boolean, reflect: true }) borderless = false;

  /**
   * Determines whether or not the tabs should handle selection behavior vs. defaults to off.
   */
  @property({ type: Boolean, attribute: 'behavior-select' }) behaviorSelect = false;

  static styles = useStyles([tabsStyleSheet]);

  static readonly metadata = {
    tag: 'nve-tabs',
    version: '0.0.0'
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

  #selectTab(tabItem) {
    if (!this.behaviorSelect || !tabItem.matches('nve-tabs-item, mlv-tabs-item') || tabItem.disabled) {
      return;
    }

    this.keynavListConfig.items.forEach((i: TabsItem) => (i.selected = false));
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
    attachInternals(this);
    this._internals.role = 'tablist';
    this.addEventListener('click', (e: CustomEvent) => this.#selectTab(e.target));
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this._internals.ariaOrientation = this.vertical ? 'vertical' : 'horizontal';
  }
}
