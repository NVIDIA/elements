import { html, LitElement, nothing } from 'lit';
import { state } from 'lit/decorators/state.js';
import { useStyles, keyNavigationList, KeynavListConfig, attachInternals, generateId } from '@elements/elements/internal';
import styles from './breadcrumb.css?inline';
import { Icon } from '@elements/elements/icon';
import type { IconButton } from '@elements/elements/icon-button';
import type { Button } from '@elements/elements/button';

type BreadcrumbFocusable = IconButton | Button;

/**
 * @element mlv-breadcrumb
 * @cssprop --breadcrumb-height
 * @cssprop --item-text-size
 * @cssprop --item-color
 * @cssprop --item-active-color
 * @cssprop --item-active-font-weight
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-breadcrumb-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=173%3A29384&t=iXgqa5cQO84PPz1R-1
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/navigation_role
 * @stable false
 */
@keyNavigationList<Breadcrumb>()
export class Breadcrumb extends LitElement {
  get keynavListConfig(): KeynavListConfig {
    return {
      items: Array.from(this.querySelectorAll<BreadcrumbFocusable>('mlv-button, mlv-icon-button'))
    }
  }

  declare _internals: ElementInternals;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-breadcrumb',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'mlv-icon': Icon
  };

  @state() private breadcrumbItems: Element[] = [];

  render() {
    return html`
    <ol internal-host>
      ${this.breadcrumbItems.map((el, idx) => html`
        <li>
          <slot name=${el.slot} @slotchange=${this.#removeItem}></slot>
          ${(idx < this.breadcrumbItems.length - 1) ? html`<mlv-icon separator aria-hidden="true" name="chevron-right" size="sm"></mlv-icon>` : nothing}
        </li>
      `)}
    </ol>
    <slot hidden-slot @slotchange=${this.#createItems}></slot>`;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'navigation';
  }

  #removeItem(e) {
    if (!e.target.assignedElements().length) {
      this.#resetItems();
    }
  }

  #createItems(e) {
    if (e.target && e.target.assignedElements().length) {
      this.#resetItems();
      const items = this.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])').assignedElements();
      items.filter(i => new Set(['MLV-BUTTON', 'MLV-ICON-BUTTON', 'SPAN', 'A']).has(i.tagName)).forEach(i => i.slot = generateId());
      items.filter(i => new Set(['MLV-BUTTON', 'MLV-ICON-BUTTON']).has(i.tagName)).forEach((i: Button) => i.setAttribute('interaction', 'ghost'));
      this.breadcrumbItems = items.length ? items : this.breadcrumbItems;
    }
  }

  #resetItems() {
    Array.from(this.shadowRoot.querySelectorAll('slot')).flatMap(i => i.assignedElements()).forEach(i => i.slot = '');
  }
}
