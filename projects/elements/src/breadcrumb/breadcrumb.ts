import { html, LitElement } from 'lit';
import { state } from 'lit/decorators/state.js';
import { useStyles, keyNavigationList, KeynavListConfig, attachInternals, generateId } from '@elements/elements/internal';
import styles from './breadcrumb.css?inline';
import { Icon } from '@elements/elements/icon';
import { IconButton } from '@elements/elements/icon-button';
import { Button } from '@elements/elements/button';

type BreadcrumbFocusable = IconButton | Button;

let idCounter = 0;

export function getBreadcrumbItemId() {
  return `${idCounter++}_${generateId()}`;
}

export function addSlotsAndAttributesToItems(items: Element[]): Element[] {
  const clickableItemTags = ['MLV-BUTTON', 'MLV-ICON-BUTTON'];

  return items.filter(el => {
    const tagName = el.tagName;
    return [...clickableItemTags, 'SPAN'].indexOf(tagName) > -1;
  }).map((el, idx, ary) => {
    const tagName = el.tagName;
    const isLastItem = (idx === ary.length - 1);

    el.setAttribute('slot', getBreadcrumbItemId());

    if (clickableItemTags.indexOf(tagName) > -1) {
      el.setAttribute('interaction', 'ghost');
    }

    if (isLastItem) {
      el.setAttribute('last-item', '');
    }
    return el;
  });
}

/**
 * @element nve-breadcrumb
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-breadcrumb-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=173%3A29384&t=iXgqa5cQO84PPz1R-1
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/navigation_role
 * @stable false
 */
@keyNavigationList<Breadcrumb>()
export class Breadcrumb extends LitElement {
  get keynavListConfig(): KeynavListConfig {
    return {
      items: Array.from(this.querySelectorAll<BreadcrumbFocusable>('nve-button, nve-icon-button'))
    }
  }

  declare _internals: ElementInternals;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-breadcrumb',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'nve-icon': Icon
  };

  @state() private breadcrumbItems: Element[] = [];

  render() {
    const slotNames = this.slotNames;
    const penultimateSlotLength = slotNames.length - 1;
    return html`<div internal-host><ol>
      ${slotNames.map(
        (slotName, idx) => html`
          <li>
            <slot name="${slotName}"></slot>
            ${(idx < penultimateSlotLength) ? this.separator : ''}
          </li>
        `)}</ol></div><slot hidden-slot @slotchange=${this.#slotUpdate}></slot>`;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'navigation';
  }

  private get separator() {
    return html`<nve-icon separator aria-hidden="true" name="chevron-right" size="sm"></nve-icon>`;
  }

  #slotUpdate() {
    this.breadcrumbItems = addSlotsAndAttributesToItems(Array.from(this.children));
  }

  private get slotNames(): string[] {
    return this.breadcrumbItems.map(el => el.slot);
  }
}
