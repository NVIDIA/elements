import { html, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { clickOutsideElementBounds, ContainerElement, focusElementTimeout, useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import type { Dropdown } from '@elements/elements/dropdown';
import styles from './combobox.css?inline';

/**
 * @element nve-combobox
 * @description An editable combobox with autocomplete behavior from a given datalist.
 * @since 0.17.0
 * @slot - default slot for input
 * @slot prefix-icon - slot for icon to be placed before the input
 * @cssprop --scroll-height
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --background
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --border
 * @cssprop --cursor
 * @cssprop --font-weight
 * @cssprop --width
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-combobox-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=30-41&mode=design&t=guIM7VohnWYQUEQv-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 * @stable false
 */
export class Combobox extends Control implements ContainerElement {
  /** Flat container option is used when embeding component within another containing element */
  @property({ type: String, reflect: true }) container?: 'flat';

  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-combobox',
    version: 'PACKAGE_VERSION'
  };

  @state() private options = [{ value: this.i18n.noResults, disabled: true, selected: null }];

  get #datalist() {
    return (this.shadowRoot.querySelector('slot')?.assignedElements({ flatten: true })?.find(i => i.tagName === 'DATALIST') ?? this.querySelector('datalist')) as HTMLSelectElement;
  }

  get #dropdown() {
    return this.shadowRoot.querySelector<Dropdown>('nve-dropdown');
  }

  get #input() {
    return this.shadowRoot.querySelector('[input]')
  }

  get #hasAvailableOptions() {
    return this.options[0]?.value !== this.i18n.noResults;
  }

  protected get prefixContent() {
    return html`<slot name="prefix-icon"></slot>`;
  }

  protected get suffixContent() {
    return html`
      <nve-dropdown .popoverType=${'manual'} @close=${e => e.target.hidden = true} @open=${e => e.target.hidden = false} hidden .anchor=${this.#input as HTMLElement} .trigger=${this.input as HTMLElement} position="bottom" alignment="center">
        <nve-menu role="listbox" style="--width: 100%; --min-width: fit-content" aria-label=${this.i18n.select}>
          ${this.options.map(o => html`
          <nve-menu-item role="option" @click=${() => this.#selectValue(o.value)} ?selected=${o.selected} aria-selected=${o.selected ? 'true' : 'false'} ?disabled=${o.disabled} aria-label=${o.value}>
            <span role="presentation">${o.value?.split('')?.map((c, ci) => html`<span ?matches=${this.#characterAtIndexMatches(c, ci)}>${c}</span>`)}</span>
          </nve-menu-item>`)}
        </nve-menu>
      </nve-dropdown>`;
  }

  async firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    await this.updateComplete;
    this.input.setAttribute('list', '');
    this.#setupAutoCompleteKeyEvents();
    this.#setupMenuItemUpdateEvents();
    this.#setupOpenKeyEvents();
    this.#setupLightDismiss();
  }

  #setupAutoCompleteKeyEvents() {
    this.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        if (this.#hasAvailableOptions && !this.#dropdown.hidden && this.input.value !== '') {
          e.preventDefault();
          this.input.value = this.options[0].value;
        }
        this.#dropdown.close();
      }
    });
  }

  #setupMenuItemUpdateEvents() {
    this.input.addEventListener('input', () => this.#updateMenuItems());
    this.shadowRoot.addEventListener('slotchange', () => this.#updateMenuItems());
  }

  #setupLightDismiss() {
    globalThis.document.addEventListener('pointerup', (e: PointerEvent) => {
      if (clickOutsideElementBounds(e, this)) {
        this.#dropdown.close();
      }
    });

    this.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        this.#dropdown.close();
        focusElementTimeout(this.input);
      }
    });
  }

  #setupOpenKeyEvents() {
    this.input.addEventListener('pointerdown', () => {
      if (!this.input.disabled) {
        this.#openListBox();
      }
    });

    this.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.#dropdown.hidden && e.code !== 'Tab' && e.code !== 'Escape') {
        this.#openListBox();
      }

      if ((e as KeyboardEvent)?.code === 'ArrowDown' && globalThis.document.activeElement === this.input) {
        this.#dropdown.querySelector('nve-menu-item')?.focus();
        e.preventDefault();
      }
    });
  }

  #openListBox() {
    this.#updateMenuItems();
    this.#dropdown.style.setProperty('--min-width', `${this.#input.getBoundingClientRect().width}px`);
    this.#dropdown.open();
  }

  #selectValue(value: string) {
    this.input.value = value;
    this.input.dispatchEvent(new Event('input', { bubbles: true }));
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
    this.requestUpdate();
    this.#dropdown.close();
    focusElementTimeout(this.input);
  }

  #characterAtIndexMatches(character: string, index: number) {
    if (this.#hasAvailableOptions) {
      return this.input.value.toLowerCase()[index]?.toLowerCase() === character.toLowerCase();
    }
  }

  #updateMenuItems() {
    const filtered = Array.from(this.#datalist?.options).filter((o: HTMLOptionElement) => (o.value).toLocaleLowerCase().includes(this.input?.value.toLowerCase()));
    this.options = filtered.length !== 0 ? filtered : [{ value: this.i18n.noResults, disabled: true, selected: null }] as any;
  }
}
