import { html, nothing, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { ContainerElement, createLightDismiss, focusElementTimeout, useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import { Icon } from '@elements/elements/icon';
import { IconButton } from '@elements/elements/icon-button/icon-button';
import { Menu, MenuItem } from '@elements/elements/menu';
import { Dropdown } from '@elements/elements/dropdown';
import { Tag } from '@elements/elements/tag';
import styles from './combobox.css?inline';

/**
 * @element mlv-combobox
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
    tag: 'mlv-combobox',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'mlv-dropdown': Dropdown,
    'mlv-menu': Menu,
    'mlv-menu-item': MenuItem,
    'mlv-icon': Icon,
    'mlv-icon-button': IconButton,
    'mlv-tag': Tag
  }

  get #datalist() {
    return (this.shadowRoot.querySelector('slot')?.assignedElements({ flatten: true })?.find(i => i.tagName === 'DATALIST' || i.tagName === 'SELECT') ?? this.querySelector('datalist, select')) as HTMLSelectElement;
  }

  get #select() {
    return (this.shadowRoot.querySelector('slot')?.assignedElements({ flatten: true })?.find(i => i.tagName === 'SELECT') ?? this.querySelector('select')) as HTMLSelectElement;
  }

  get #options(): HTMLOptionElement[] {
    return Array.from(this.#datalist?.options ? this.#datalist.options : []);
  }

  get #items() {
    return Array.from(this.shadowRoot.querySelectorAll('mlv-menu-item'));
  }

  get #dropdown() {
    return this.shadowRoot.querySelector<Dropdown>('mlv-dropdown');
  }

  get #input() {
    return this.shadowRoot.querySelector('[input]')
  }

  get #tags() {
    return this.shadowRoot.querySelector('.tags')
  }

  get #hasAvailableOptions() {
    return this.#options.find(o => !o.disabled);
  }

  #observers: (MutationObserver | ResizeObserver)[] = [];

  protected get prefixContent() {
    return this.#select?.multiple ? html`
    <div class="tags-label" aria-hidden="true">${this.#select.selectedOptions.length} ${this.i18n.selected}</div>
    <div class="tags">
      ${Array.from<HTMLOptionElement>(this.#select.selectedOptions).map(o => html`
      <mlv-tag readonly color="gray-slate" closable .value=${o.value} @click=${() => this.#selectValue(o)}>${o.value}</mlv-tag>`)}
    </div>` : html`<slot name="prefix-icon"></slot>`;
  }

  protected get suffixContent() {
    const multiple = this.#select?.multiple;
    const options = this.#options;
    return html`
      <mlv-dropdown .popoverType=${'manual'} @close=${e => e.target.hidden = true} @open=${e => e.target.hidden = false} hidden .anchor=${this.#input as HTMLElement} .trigger=${this.input as HTMLElement} position="bottom" alignment="center">
        <mlv-menu role="listbox" style="--width: 100%; --min-width: fit-content" aria-label=${this.i18n.select}>
          ${options.filter(o => !o.disabled).map(o => html`
          <mlv-menu-item .value=${o.value} role="option" @click=${() => this.#selectValue(o)} ?selected=${o.selected} aria-selected=${o.selected ? 'true' : 'false'} ?disabled=${o.disabled} aria-label=${o.value}>
            ${multiple ? html`<mlv-icon name=${o.selected ? 'check' : ''} size="sm"></mlv-icon>` : nothing}
            ${options.length < 50 ? html`<span role="presentation">${o.value?.split('')?.map((c, ci) => html`<span ?matches=${this.#characterAtIndexMatches(c, ci)}>${c}</span>`)}</span>` : o.value}
          </mlv-menu-item>`)}
          ${options.filter(o => !o.disabled).length === 0 ? html`<mlv-menu-item .value=${''} disabled>${this.i18n.noResults}</mlv-menu-item>` : nothing}
        </mlv-menu>
      </mlv-dropdown>`;
  }

  async firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    await this.updateComplete;
    this.input.setAttribute('list', '');
    this.#setupSingleSelect();
    this.#setupMultipleSelect();
    this.#setupAutoCompleteKeyEvents();
    this.#setupMenuItemUpdateEvents();
    this.#setupOpenKeyEvents();
    this.#setupLightDismiss();
    this.#setupOverflowListener();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observers.forEach(observer => observer.disconnect());
  }

  #setupSingleSelect() {
    if (this.#select && !this.#select.multiple && !this.input.value) {
      const initial = this.#options.find(o => o.hasAttribute('selected'))?.value;
      this.input.value = initial ?? '';
    }

    this.input.addEventListener('blur', () => {
      if (this.#select && !this.#select.multiple && !this.#options.find(o => o.value === this.input.value)) {
        this.#options.forEach(o => o.selected = false);
        this.#setInputValue('');
        this.#setSelectValue({ value: '', selected: false });
      }
    });
  }

  #setupMultipleSelect() {
    if (this.#select?.multiple) {
      this._internals.states.add('--multiple');
    }
  }

  #setupAutoCompleteKeyEvents() {
    this.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        if (this.#hasAvailableOptions && !this.#dropdown.hidden && this.input.value !== '') {
          e.preventDefault();
          this.#setInputValue(this.#items[0].value);
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
    const options = { element: this.shadowRoot.querySelector('mlv-dropdown')?.shadowRoot.querySelector('dialog'), focusElement: this.input };
    createLightDismiss(options, () => {
      if (!this.#dropdown.hidden) {
        this.#dropdown.close();
      }
    });
  }

  #setupOpenKeyEvents() {
    this.input.addEventListener('pointerdown', () => {
      this.#openListBox();
    });

    this.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code !== 'Tab' && e.code !== 'Escape') {
        this.#openListBox();
      }

      if (e?.code === 'ArrowDown' && (this.getRootNode() as any).activeElement === this.input) {
        this.#items[0]?.focus();
        e.preventDefault();
      }
    });
  }

  #selectValue(option: { selected?: boolean; value?: string; }) {
    if (!this.#select?.multiple) {
      this.#setInputValue(option.value);
      this.#dropdown.close();
      focusElementTimeout(this.input);
    }

    if (this.#select) {
      option.selected = !option.selected;
      this.#setSelectValue(option);
    }

    this.requestUpdate();
  }

  #characterAtIndexMatches(character: string, index: number) {
    if (this.#hasAvailableOptions) {
      return this.input.value.toLowerCase()[index]?.toLowerCase() === character.toLowerCase();
    }
  }

  #updateMenuItems() {
    this.#options.forEach(option => {
      option.disabled = !option.value.toLocaleLowerCase().includes(this.input?.value.toLowerCase());
    });

    this.requestUpdate();
  }

  #openListBox() {
    if (!this.input.disabled && this.#dropdown.hidden) {
      this.#updateMenuItems();
      this.#dropdown.style.setProperty('--min-width', `${this.#input.getBoundingClientRect().width}px`);
      this.#dropdown.open();
    }
  }

  #setInputValue(value: string) {
    this.input.value = value;
    this.input.dispatchEvent(new Event('input', { bubbles: true }));
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  #setSelectValue(option: { value?: string; selected?: boolean; }) {
    [...this.#options, { value: '', selected: null }].find(o => o.value === option.value).selected = option.selected;

    if (!this.#select.multiple) {
      this.#select.value = option.value;
    }

    this.#select.dispatchEvent(new Event('input', { bubbles: true }));
    this.#select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  #setupOverflowListener() {
    if (this.#select?.multiple) {
      const observer = new ResizeObserver((entries) => this.#updateMultipleOverflow(entries[0].contentRect.width));
      this.#observers.push(observer);
      observer.observe(this.#tags);
    }
  }

  #updateMultipleOverflow(tagWidth: number) {
    const INPUT_MIN_WIDTH = 100;
    if (this.#select?.multiple && tagWidth > this.#input.getBoundingClientRect().width - INPUT_MIN_WIDTH) {
      this._internals.states.add('--multiple-overflow');
    } else {
      this._internals.states.delete('--multiple-overflow');
    }
  }
}
