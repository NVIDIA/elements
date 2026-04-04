// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

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
  scopedRegistry,
  useStyles
} from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import { inputStyles } from '@nvidia-elements/core/input';
import { Menu, MenuItem } from '@nvidia-elements/core/menu';
import { Dropdown } from '@nvidia-elements/core/dropdown';
import { Tag } from '@nvidia-elements/core/tag';
import { Icon } from '@nvidia-elements/core/icon';
import { Checkbox } from '@nvidia-elements/core/checkbox';
import styles from './combobox.css?inline';

/**
 * @element nve-combobox
 * @description An editable combobox with autocomplete behavior and selection support.
 * @since 0.17.0
 * @entrypoint \@nvidia-elements/core/combobox
 * @slot - default slot for an input and a datalist/select element
 * @slot prefix-icon - slot for icon before the input
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
 * @cssprop --border-color
 * @cssprop --max-height
 * @cssprop --text-transform
 * @csspart tag - The tag element for selected items
 * @csspart dropdown - The dropdown popup element
 * @csspart menu - The menu element
 * @csspart menu-item - The menu item elements
 * @csspart checkbox - The checkbox element
 * @csspart icon - The icon element
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/
 */
@scopedRegistry()
export class Combobox extends Control implements ContainerElement {
  /**
   * Reduces the visual container for a minimal borderless appearance while preserving whitespace bounds.
   * Use when embedding within another container such as a toolbar.
   */
  @property({ type: String, reflect: true }) container: 'flat';

  /** Disable rendering of inline tags for many-item select */
  @property({ type: Boolean, reflect: true }) notags: boolean;

  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-combobox',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Checkbox.metadata.tag]: Checkbox,
    [Icon.metadata.tag]: Icon,
    [Dropdown.metadata.tag]: Dropdown,
    [Menu.metadata.tag]: Menu,
    [MenuItem.metadata.tag]: MenuItem,
    [Tag.metadata.tag]: Tag
  };

  /**
   * If a <select> exists, on focus all options show by default.
   * If a <datalist> exists, on focus only options that match the current input value show.
   */

  #_datalist: HTMLSelectElement | null;
  get #datalist(): HTMLSelectElement | null {
    if (!this.#_datalist) {
      this.#_datalist = this.shadowRoot
        ? ((this.shadowRoot
            .querySelector('slot')
            ?.assignedElements({ flatten: true })
            ?.find(i => i.tagName === 'DATALIST' || i.tagName === 'SELECT') ??
            this.querySelector('datalist, select')) as HTMLSelectElement)
        : null;
    }
    return this.#_datalist;
  }

  #_select: HTMLSelectElement | null;
  get #select(): HTMLSelectElement | null {
    if (!this.#_select) {
      this.#_select = this.shadowRoot
        ? ((this.shadowRoot
            .querySelector('slot')
            ?.assignedElements({ flatten: true })
            ?.find(i => i.tagName === 'SELECT') ?? this.querySelector('select')) as HTMLSelectElement)
        : null;
    }
    return this.#_select;
  }

  get #options(): HTMLOptionElement[] {
    return Array.from(this.#datalist?.options ? this.#datalist.options : []);
  }

  get #items() {
    return Array.from(this.shadowRoot!.querySelectorAll<MenuItem>(MenuItem.metadata.tag));
  }

  get #dropdown() {
    return this.shadowRoot!.querySelector<Dropdown>(Dropdown.metadata.tag);
  }

  get #input() {
    return this.shadowRoot!.querySelector('[input]');
  }

  get #tags() {
    return this.shadowRoot!.querySelector('.tags');
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
      <nve-tag part="tag" readonly color="gray-slate" closable .value=${o.value} @click=${() => this.#selectValue(o)}>${getDisplayValue(o)}</nve-tag>`
      )}
    </div>`
      : html`<slot name="prefix-icon"></slot>`;
  }

  get #largeOptionsList() {
    return (this.#datalist?.options?.length ?? 0) > 50;
  }

  get #isPristine() {
    return !this._internals.states.has('dirty');
  }

  protected get suffixContent() {
    if (isServer) return nothing;
    const options = this.#options;
    const largeOptionsList = this.#largeOptionsList;
    const isPristine = this.#isPristine;
    const visibleOptions = options.filter(o => !o.hidden).filter(o => !(o.value === '' && o.disabled));
    const hasNoResults = visibleOptions.filter(o => !o.disabled).length === 0;
    return html`
    <nve-dropdown part="dropdown" .popoverType=${'manual'} .modal=${false} @open=${(e: Event) => ((e.target as HTMLElement).hidden = false)} @close=${this.#closeListBox} hidden .anchor=${this.#input as HTMLElement} .trigger=${this.#input as HTMLElement} position="bottom">
      <nve-menu part="menu" role="listbox" style="--width: 100%; --min-width: fit-content" aria-label=${ifDefined(this.i18n.select)}>
        ${visibleOptions.map(
          o => html`
          <nve-menu-item part="menu-item" .option=${getDisplayValue(o)} role="option" @click=${() => this.#selectValue(o)} ?selected=${o.selected} aria-selected=${o.selected ? 'true' : 'false'} ?disabled=${o.disabled} aria-label=${getDisplayValue(o)}>
            ${this.#getOptionCheckbox(o)}
            ${largeOptionsList || isPristine ? getDisplayValue(o) : html`<span role="presentation">${(o.label ? o.label : o.value)?.split('')?.map((c, ci) => html`<span ?matches=${this.#characterAtIndexMatches(c, ci)}>${c}</span>`)}</span>`}
          </nve-menu-item>`
        )}
        ${hasNoResults ? html`<nve-menu-item part="menu-item" .value=${''} disabled>${this.i18n.noResults}</nve-menu-item>` : nothing}
      </nve-menu>
      <slot name="footer"></slot>
    </nve-dropdown>`;
  }

  #getOptionCheckbox(o: HTMLOptionElement) {
    const select = this.#select;
    if (select?.multiple && this.#largeOptionsList) {
      return html`<input aria-hidden="true" type="checkbox" .checked=${o.selected} .disabled=${o.disabled} .name=${o.selected ? 'check' : undefined} />`;
    } else if (select?.multiple) {
      /* eslint-disable @nvidia-elements/lint/no-missing-control-label */
      return html`<nve-checkbox part="checkbox"><input aria-hidden="true" type="checkbox" .checked=${o.selected} .disabled=${o.disabled} .name=${o.selected ? 'check' : undefined} /></nve-checkbox>`;
    } else if (select) {
      return html`<nve-icon part="icon" name="check" size="sm"></nve-icon>`;
    } else {
      return nothing;
    }
  }

  async firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    this.shadowRoot!.addEventListener('slotchange', () => {
      this.#_datalist = null;
      this.#_select = null;
    });
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

  connectedCallback() {
    super.connectedCallback();
    this.#observers.push(
      onChildListMutation(
        this,
        () => {
          this.#syncOptionSelectedStates();
          this.requestUpdate();
        },
        { attributes: true, subtree: true }
      )
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observers.forEach(observer => observer.disconnect());
  }

  reset() {
    this.#dropdown!.hidePopover();
    if (this.#select) {
      this.#select.selectedIndex = -1;
    }
    super.reset();
  }

  /** Select all options provided */
  selectAll() {
    this.#options.forEach(o => (o.selected = true));
    this.requestUpdate();
    this.#select!.dispatchEvent(new Event('input', { bubbles: true }));
    this.#select!.dispatchEvent(new Event('change', { bubbles: true }));
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
    const selected = Array.from(this.#select!.selectedOptions).find((o: HTMLOptionElement) =>
      o.hasAttribute('selected')
    );
    if (selected && !this.#select!.multiple && !this.input.defaultValue) {
      this.input.value = getDisplayValue(selected);
    }
  }

  #updateInputValue() {
    if (!this.#select!.multiple && !this.input.defaultValue) {
      this.input.value = getDisplayValue(
        Array.from(this.#select!.selectedOptions).find(o => o.value === this.#select!.value)!
      );
    }
  }

  #syncSelectValueStates() {
    this.#observers.push(
      getElementUpdate(this.#select!, 'value', () => {
        this.#updateInputValue();
        this.requestUpdate();
      })
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
        if (this.#hasAvailableOptions && this.#dropdown!.matches(':popover-open') && this.input.value !== '') {
          e.preventDefault();
          // the menu item option property caches/stores the option value instead of value to prevent unnecessary lit lifecycle updates for each menu item
          this.#setInputValue((this.#items[0] as MenuItem & { option: string }).option);
          this.#setSelectValue(
            this.#options.find(
              o => (o.label ? o.label : o.value) === (this.#items[0] as MenuItem & { option: string }).option
            )!
          );
        }
        this.#dropdown!.hidePopover();
      }
    });
  }

  #setupMenuItemUpdateEvents() {
    this.input.addEventListener('input', () => this.#filterOptions());
    this.shadowRoot!.addEventListener('slotchange', () => this.#filterOptions());
  }

  async #setupLightDismiss() {
    const dropdown = this.#dropdown!;
    await dropdown.updateComplete;
    const options = {
      element: dropdown.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!,
      focusElement: this.input
    };
    createLightDismiss(options, () => {
      if (this.#dropdown!.matches(':popover-open')) {
        this.#dropdown!.hidePopover();
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
        this.#dropdown!.tabIndex = 0;
        this.#items[0]?.focus();
        e.preventDefault();
      }
    });
  }

  #selectValue(option: { selected?: boolean; label?: string; value?: string }) {
    if (!this.#select?.multiple) {
      this.#setInputValue(getDisplayValue(option));
      this.#dropdown!.hidePopover();
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
    return false;
  }

  #filterOptions() {
    this.#options.forEach(option => {
      const hasLabel = option.textContent!.trim().length;
      if (hasLabel) {
        const matchesLabel = option.textContent!.toLocaleLowerCase().includes(this.input?.value.toLowerCase());
        option.hidden = !matchesLabel;
      } else {
        const matchesValue = option.value.toLocaleLowerCase().includes(this.input?.value.toLowerCase());
        option.hidden = !matchesValue;
      }
    });
    this.requestUpdate();
  }

  #openListBox() {
    if (!this.input.disabled && !this.#dropdown!.matches(':popover-open')) {
      if (this.#select) {
        this.#options.forEach(option => (option.hidden = false));
      } else {
        this.#filterOptions();
      }
      this.#dropdown!.style.setProperty('--min-width', `${this.#input!.getBoundingClientRect().width}px`);
      // explicitly provide source as the performance optimizations in the suffixContent getter prevent the dropdown from setting its anchor/trigger reliably
      this.#dropdown!.showPopover({ source: this.#input as HTMLElement });
      this.#dropdown!.tabIndex = -1;
    }
  }

  #closeListBox() {
    this.#dropdown!.hidePopover();
    this._internals.states.delete('dirty');
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
    const found = [...this.#options, { value: '', selected: null as boolean | null }].find(
      o => o.value === option.value
    );
    if (found) found.selected = option.selected ?? null;

    if (this.#select && !this.#select.multiple) {
      this.#select.value = option.value!;
    }

    this.#select?.dispatchEvent(new Event('input', { bubbles: true }));
    this.#select?.dispatchEvent(new Event('change', { bubbles: true }));
  }

  #setupOverflowListener() {
    if (this.#select?.multiple && !this.notags) {
      if (this.#select.selectedOptions.length > 1) {
        // only calculate initial overflow if many tags exist
        this.#updateMultipleOverflow(this.#tags!.getBoundingClientRect().width);
      }
      const observer = new ResizeObserver(entries => this.#updateMultipleOverflow(entries[0]!.contentRect.width));
      this.#observers.push(observer);
      observer.observe(this.#tags!);
    }
  }

  #updateMultipleOverflow(tagWidth: number) {
    const INPUT_MIN_WIDTH = 100;
    if (this.#select?.multiple && tagWidth > this.#input!.getBoundingClientRect().width - INPUT_MIN_WIDTH) {
      this._internals.states.add('multiple-overflow');
    } else {
      this._internals.states.delete('multiple-overflow');
    }
  }

  #setupSlotStates() {
    this.#setSlotStates();
    this.shadowRoot!.addEventListener('slotchange', () => this.#setSlotStates());
  }

  #setSlotStates() {
    if (this.#hasFooterContent) {
      this._internals.states.add('footer-content');
    } else {
      this._internals.states.delete('footer-content');
    }
  }
}
