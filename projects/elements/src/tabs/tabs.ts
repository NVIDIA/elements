import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { MlvBaseButton, stateSelected, useStyles, keyNavigationList, KeynavListConfig, attachInternals } from '@elements/elements/internal';
import tabsItemStyleSheet from './tabs-item.css?inline';
import tabsStyleSheet from './tabs.css?inline';

/**
 * @element mlv-tabs-item
 * @slot - default slot for content
 * @cssprop --font-size
 * @cssprop --font-weight
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-tabs-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-55&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 * @stable false
 * @responsive false
 */

@stateSelected<TabsItem>()
export class TabsItem extends MlvBaseButton {
  /**
   * Determines which tab item is selected, defaults to false.
   */
  @property({ type: Boolean, reflect: true }) selected = false;

  static styles = useStyles([tabsItemStyleSheet]);

  static readonly metadata = {
    tag: 'mlv-tabs-item',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`
      <div internal-host focus-within>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'tab';
  }
}


/**
 * @element mlv-tabs
 * @slot - default slot for mlv-tab-item
 * @cssprop --gap
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-tabs-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-55&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 * @responsive false
 * @stable false
 */
@keyNavigationList<Tabs>()
export class Tabs extends LitElement {
  declare _internals: ElementInternals;

  /** @private */
  get keynavListConfig(): KeynavListConfig {
    return {
      items: this.querySelectorAll<HTMLElement>('mlv-tabs-item'),
      layout: this.vertical ? 'vertical' : 'horizontal'
    }
  }
  /**
   * Determines whether or not the tabs should display in a vertical layout vs. defaulting to horizontal.
   */
  @property({ type: Boolean }) vertical = false;
  /**
   * Determines whether or not the tabs should display a border on selected items vs. defaults to show border.
   */
  @property({ type: Boolean}) borderless = false;
  /**
   * Determines whether or not the tabs should handle selection behavior vs. defaults to off.
   */
  @property({ type: Boolean, attribute: 'behavior-select'}) behaviorSelect = false;

  static styles = useStyles([tabsStyleSheet]);

  static readonly metadata = {
    tag: 'mlv-tabs',
    version: 'PACKAGE_VERSION'
  };

  #selectTab(tabItem) {
    if (!this.behaviorSelect || tabItem.tagName !== 'MLV-TABS-ITEM' || tabItem.disabled) {
      return;
    }

    this.keynavListConfig.items.forEach((i: TabsItem) => i.selected = false);
    tabItem.selected = true;
  }

  render() {
    return html`
      <div internal-host @click=${(e: CustomEvent) => (this.#selectTab(e.target))}>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'tablist';
    this._internals.ariaOrientation = this.vertical ? 'vertical' : 'horizontal';
  }
}
