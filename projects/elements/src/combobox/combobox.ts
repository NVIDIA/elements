import type { PropertyValues } from 'lit';
import { html, isServer, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { ContainerElement } from '@nvidia-elements/core/internal';
import {
  createLightDismiss,
  focusElementTimeout,
  getDisplayValue,
  getElementUpdate,
  onChildListMutation,
  useStyles
} from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import { inputStyles } from '@nvidia-elements/core/input';
import { Menu, MenuItem } from '@nvidia-elements/core/menu';
import { Dropdown } from '@nvidia-elements/core/dropdown';
import { Tag } from '@nvidia-elements/core/tag';
import { Icon } from '@nvidia-elements/core/icon';
import styles from './combobox.css?inline';

/**
 * @element nve-combobox
 * @description An editable combobox with autocomplete behavior and selection support.
 * @since 0.17.0
 * @entrypoint \@nvidia-elements/core/combobox
 * @slot - default slot for an input and a datalist/select element
 * @slot prefix-icon - slot for icon to be placed before the input
 * @slot footer - slot for dropdown footer content
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
 * @storybook https://NVIDIA.github.io/elements/docs/elements/combobox/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=30-41&mode=design&t=guIM7VohnWYQUEQv-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/
 */
export class Combobox extends Control implements ContainerElement {
  /** Flat container option is used when embedding component within another containing element */
  @property({ type: String, reflect: true }) accessor container: 'flat';

  /** Disable rendering of inline tags for multiple select */
  @property({ type: Boolean, reflect: true }) accessor notags: boolean;

  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-combobox',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon,
    [Dropdown.metadata.tag]: Dropdown,
    [Menu.metadata.tag]: Menu,
    [MenuItem.metadata.tag]: MenuItem,
    [Tag.metadata.tag]: Tag
  };

  /**
   * If a <select> is provided, on focus all options will be shown by default.
   * If a <datalist> is provided, on focus only options that match the current input value will be shown.
   */
  get #datalist(): HTMLSelectElement {
    return this.shadowRoot
      ? ((this.shadowRoot
          .querySelector('slot')
          ?.assignedElements({ flatten: true })
          ?.find(i => i.tagName === 'DATALIST' || i.tagName === 'SELECT') ??
          this.querySelector('datalist, select')) as HTMLSelectElement)
      : null;
  }

  get #select(): HTMLSelectElement {
    return this.shadowRoot
      ? ((this.shadowRoot
          .querySelector('slot')
          ?.assignedElements({ flatten: true })
          ?.find(i => i.tagName === 'SELECT') ?? this.querySelector('select')) as HTMLSelectElement)
      : null;
  }

  get #options(): HTMLOptionElement[] {
    return Array.from(this.#datalist?.options ? this.#datalist.options : []);
  }

  get #items() {
    return Array.from(this.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag));
  }

  get #dropdown() {
    return this.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
  }

  get #input() {
    return this.shadowRoot.querySelector('[input]');
  }

  get #tags() {
    return this.shadowRoot.querySelector('.tags');
  }

  get #hasAvailableOptions() {
    return this.#options.find(o => !o.disabled && !o.hidden);
  }

  get #hasFooterContent() {
    return !!this.querySelector('[slot="footer"]');
  }

  #observers: (MutationObserver | ResizeObserver)[] = [];

  protected _associateDatalist = false;

  protected get prefixContent() {
    return this.#select?.multiple && !this.notags
      ? html`
    <div class="tags-label" aria-hidden="true">${this.#select.selectedOptions.length} ${this.i18n.selected}</div>
    <div class="tags">
      ${Array.from<HTMLOptionElement>(this.#select.selectedOptions).map(
        o => html`
      <nve-tag readonly color="gray-slate" closable .value=${o.value} @click=${() => this.#selectValue(o)}>${getDisplayValue(o)}</nve-tag>`
      )}
    </div>`
      : html`<slot name="prefix-icon"></slot>`;
  }

  get #largeOptionsList() {
    return this.#options.length > 50;
  }

  protected get suffixContent() {
    return !isServer
      ? html`
    <nve-dropdown .popoverType=${'manual'} .modal=${false} @open=${e => (e.target.hidden = false)} @close=${this.#closeListBox} hidden .anchor=${this.#input as HTMLElement} .trigger=${this.#input as HTMLElement} position="bottom">
      <nve-menu role="listbox" style="--width: 100%; --min-width: fit-content" aria-label=${ifDefined(this.i18n.select)}>
        ${this.#options
          .filter(o => !o.hidden)
          .filter(o => !(o.value === '' && o.disabled))
          .map(
            o => html`
          <nve-menu-item .value=${getDisplayValue(o)} role="option" @click=${() => this.#selectValue(o)} ?selected=${o.selected} aria-selected=${o.selected ? 'true' : 'false'} ?disabled=${o.disabled} aria-label=${getDisplayValue(o)}>
            ${this.#getOptionCheckbox(o)}
            ${this.#largeOptionsList ? getDisplayValue(o) : html`<span role="presentation">${(o.label ? o.label : o.value)?.split('')?.map((c, ci) => html`<span ?matches=${this.#characterAtIndexMatches(c, ci)}>${c}</span>`)}</span>`}
          </nve-menu-item>`
          )}
        ${this.#options.filter(o => !o.disabled && !o.hidden).length === 0 ? html`<nve-menu-item .value=${''} disabled>${this.i18n.noResults}</nve-menu-item>` : nothing}
      </nve-menu>
      <slot name="footer"></slot>
    </nve-dropdown>`
      : nothing;
  }

  #getOptionCheckbox(o: HTMLOptionElement) {
    const select = this.#select;
    if (select?.multiple && this.#largeOptionsList) {
      return html`<input aria-hidden="true" type="checkbox" .checked=${o.selected} .disabled=${o.disabled} .name=${o.selected ? 'check' : undefined} />`;
    } else if (select?.multiple) {
      return html`<nve-checkbox><input aria-hidden="true" type="checkbox" .checked=${o.selected} .disabled=${o.disabled} .name=${o.selected ? 'check' : undefined} /></nve-checkbox>`;
    } else if (select) {
      return html`<nve-icon .name=${o.selected ? 'check' : undefined} size="sm"></nve-icon>`;
    } else {
      return nothing;
    }
  }

  async firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    await this.updateComplete;
    this.#setupSingleSelect();
    this.#setupMultipleSelect();
    this.#setupAutoCompleteKeyEvents();
    this.#setupMenuItemUpdateEvents();
    this.#setupOpenKeyEvents();
    this.#setupOverflowListener();
    this.#setupSlotStates();
    await this.#setupLightDismiss();
    this.input.setAttribute('list', '');
    this.input.autocomplete = 'off';
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observers.forEach(observer => observer.disconnect());
  }

  reset() {
    this.#dropdown.hidePopover();
    if (this.#select) {
      this.#select.selectedIndex = -1;
    }
    super.reset();
  }

  /** Select all options provided */
  selectAll() {
    this.#options.forEach(o => (o.selected = true));
    this.requestUpdate();
    this.#select.dispatchEvent(new Event('input', { bubbles: true }));
    this.#select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  #setupSingleSelect() {
    if (this.#select && !this.#select.multiple) {
      this.#setupInitialValue();
      this.#syncSelectValueStates();
      this.#syncOptionSelectedStates();
    }
  }

  #setupMultipleSelect() {
    if (this.#select?.multiple) {
      this.#setupInitialValue();
      this.#syncSelectValueStates();
      this.#syncOptionSelectedStates();
      this._internals.states.add('multiple');
    }
  }

  #setupInitialValue() {
    const selected = Array.from(this.#select.selectedOptions).find((o: HTMLOptionElement) =>
      o.hasAttribute('selected')
    );
    if (selected && !this.#select.multiple) {
      this.input.value = getDisplayValue(selected);
    }
  }

  #updateInputValue() {
    if (!this.#select.multiple) {
      this.input.value = getDisplayValue(
        Array.from(this.#select.selectedOptions).find(o => o.value === this.#select.value)
      );
    }
  }

  #syncSelectValueStates() {
    this.#observers.push(
      getElementUpdate(this.#select, 'value', () => {
        this.#updateInputValue();
        this.requestUpdate();
      }),
      onChildListMutation(this.#select, () => this.requestUpdate(), { attributes: true, subtree: true }),
      onChildListMutation(this.#select, () => this.#syncOptionSelectedStates(), { subtree: true })
    );
  }

  #trackedOptions = new Set();
  #syncOptionSelectedStates() {
    this.#options.forEach(o => {
      if (!this.#trackedOptions.has(o)) {
        this.#trackedOptions.add(o);
        this.#observers.push(getElementUpdate(o, 'selected', () => this.requestUpdate()));
      }
    });
  }

  #setupAutoCompleteKeyEvents() {
    this.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        if (this.#hasAvailableOptions && this.#dropdown.matches(':popover-open') && this.input.value !== '') {
          e.preventDefault();
          this.#setInputValue(this.#items[0].value);
          this.#setSelectValue(this.#options.find(o => (o.label ? o.label : o.value) === this.#items[0].value));
        }
        this.#dropdown.hidePopover();
      }
    });
  }

  #setupMenuItemUpdateEvents() {
    this.input.addEventListener('input', () => this.#filterOptions());
    this.shadowRoot.addEventListener('slotchange', () => this.#filterOptions());
  }

  async #setupLightDismiss() {
    const dropdown = this.#dropdown;
    await dropdown.updateComplete;
    const options = {
      element: dropdown?.shadowRoot.querySelector<HTMLElement>('[internal-host]'),
      focusElement: this.input
    };
    createLightDismiss(options, () => {
      if (this.#dropdown.matches(':popover-open')) {
        this.#dropdown.hidePopover();
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

      if (e?.code === 'ArrowDown' && (this.getRootNode() as ShadowRoot).activeElement === this.input) {
        this.#dropdown.tabIndex = 0;
        this.#items[0]?.focus();
        e.preventDefault();
      }
    });
  }

  #selectValue(option: { selected?: boolean; label?: string; value?: string }) {
    if (!this.#select?.multiple) {
      this.#setInputValue(getDisplayValue(option));
      this.#dropdown.hidePopover();
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

  #filterOptions() {
    this.#options.forEach(option => {
      const hasLabel = option.textContent.trim().length;
      if (hasLabel) {
        const matchesLabel = option.textContent.toLocaleLowerCase().includes(this.input?.value.toLowerCase());
        option.hidden = !matchesLabel;
      } else {
        const matchesValue = option.value.toLocaleLowerCase().includes(this.input?.value.toLowerCase());
        option.hidden = !matchesValue;
      }
    });
    this.requestUpdate();
  }

  #openListBox() {
    if (!this.input.disabled && !this.#dropdown.matches(':popover-open')) {
      if (this.#select) {
        this.#options.forEach(option => (option.hidden = false));
      } else {
        this.#filterOptions();
      }
      this.#dropdown.style.setProperty('--min-width', `${this.#input.getBoundingClientRect().width}px`);
      this.#dropdown.showPopover();
      this.#dropdown.tabIndex = -1;
    }
  }

  #closeListBox() {
    this.#dropdown.hidePopover();
    this.#validateSingleSelectValue();
  }

  #validateSingleSelectValue() {
    const invalidInputValue =
      this.#select &&
      !this.#select.multiple &&
      !this.#options.filter(o => !(o.value === '' && o.disabled)).find(o => getDisplayValue(o) === this.input.value);
    if (invalidInputValue) {
      this.#options.forEach(o => (o.selected = false));
      this.#setInputValue('');
      this.#setSelectValue({ value: '', selected: false });
    }
  }

  #setInputValue(value: string) {
    this.input.value = value;
    this.input.dispatchEvent(new Event('input', { bubbles: true }));
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  #setSelectValue(option: { value?: string; selected?: boolean }) {
    [...this.#options, { value: '', selected: null }].find(o => o.value === option.value).selected = option.selected;

    if (this.#select && !this.#select.multiple) {
      this.#select.value = option.value;
    }

    this.#select?.dispatchEvent(new Event('input', { bubbles: true }));
    this.#select?.dispatchEvent(new Event('change', { bubbles: true }));
  }

  #setupOverflowListener() {
    if (this.#select?.multiple && !this.notags) {
      this.#updateMultipleOverflow(this.#tags.getBoundingClientRect().width);
      const observer = new ResizeObserver(entries => this.#updateMultipleOverflow(entries[0].contentRect.width));
      this.#observers.push(observer);
      observer.observe(this.#tags);
    }
  }

  #updateMultipleOverflow(tagWidth: number) {
    const INPUT_MIN_WIDTH = 100;
    if (this.#select?.multiple && tagWidth > this.#input.getBoundingClientRect().width - INPUT_MIN_WIDTH) {
      this._internals.states.add('multiple-overflow');
    } else {
      this._internals.states.delete('multiple-overflow');
    }
  }

  #setupSlotStates() {
    this.#setSlotStates();
    this.shadowRoot.addEventListener('slotchange', () => this.#setSlotStates());
  }

  #setSlotStates() {
    if (this.#hasFooterContent) {
      this._internals.states.add('footer-content');
    } else {
      this._internals.states.delete('footer-content');
    }
  }
}
