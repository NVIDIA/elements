import { html, LitElement, nothing } from 'lit';
import { state } from 'lit/decorators/state.js';
import type { KeynavListConfig } from '@nvidia-elements/core/internal';
import {
  useStyles,
  keyNavigationList,
  attachInternals,
  generateId,
  isFocusable,
  typeSSR
} from '@nvidia-elements/core/internal';
import styles from './breadcrumb.css?inline';
import { Icon } from '@nvidia-elements/core/icon';
import type { Button } from '@nvidia-elements/core/button';

/**
 * @element nve-breadcrumb
 * @description Breadcrumb is a component that can help users establish their location while navigating a website with complex URLs and navigation paths.
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/breadcrumb
 * @cssprop --breadcrumb-height
 * @cssprop --item-text-size
 * @cssprop --item-color
 * @cssprop --item-active-color
 * @cssprop --item-active-font-weight
 * @slot - default slot for `nve-button` and anchor elements
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-breadcrumb-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=173%3A29384&t=iXgqa5cQO84PPz1R-1
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/navigation_role
 */
@typeSSR()
@keyNavigationList<Breadcrumb>()
export class Breadcrumb extends LitElement {
  get keynavListConfig(): KeynavListConfig {
    return {
      items: Array.from(this.shadowRoot.querySelectorAll('slot'))
        .flatMap(slot => slot.assignedElements())
        .filter(e => isFocusable(e)) as HTMLElement[]
    };
  }

  /** @private */
  declare _internals: ElementInternals;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-breadcrumb',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  @state() private breadcrumbItems: Element[] = [];

  render() {
    return html`
    <ol internal-host>
      ${this.breadcrumbItems.map(
        (el, idx) => html`
        <li>
          <slot name=${el.slot} @slotchange=${this.#removeItem}></slot>
          ${idx < this.breadcrumbItems.length - 1 ? html`<nve-icon separator aria-hidden="true" name="chevron" direction="right" size="sm"></nve-icon>` : nothing}
        </li>
      `
      )}
    </ol>
    <slot ?hidden-slot=${!this.breadcrumbItems.length} @slotchange=${this.#createItems}></slot>`;
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
      items
        .filter(i => i.matches('nve-button, nve-icon-button, mlv-button, mlv-icon-button, span, a'))
        .forEach(i => (i.slot = generateId()));
      items
        .filter(i => i.matches('nve-button, nve-icon-button, mlv-button, mlv-icon-button'))
        .forEach((i: Button) => (i.container = 'inline'));
      this.breadcrumbItems = items.length ? items : this.breadcrumbItems;
    }
  }

  #resetItems() {
    Array.from(this.shadowRoot.querySelectorAll('slot'))
      .flatMap(i => i.assignedElements())
      .forEach(i => (i.slot = ''));
  }
}
