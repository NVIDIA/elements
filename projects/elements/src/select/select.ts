import type { PropertyValues } from 'lit';
import { html, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  focusElementTimeout,
  onListboxActivate,
  useStyles,
  i18n,
  I18nController,
  onChildListMutation,
  getElementUpdate,
  typeSSR
} from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import { Icon } from '@nvidia-elements/core/icon';
import { Menu, MenuItem } from '@nvidia-elements/core/menu';
import { Dropdown } from '@nvidia-elements/core/dropdown';
import { Tag } from '@nvidia-elements/core/tag';
import styles from './select.css?inline';

/**
 * @element nve-select
 * @description A select is a control that enables users to select an option from a list of options.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/select
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --border
 * @cssprop --scroll-height
 * @storybook https://NVIDIA.github.io/elements/docs/elements/select/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-24&t=clRGqnKDRGNhR0Yu-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
 */
@typeSSR()
@i18n<Select>()
export class Select extends Control {
  static styles = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-select',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon,
    [Dropdown.metadata.tag]: Dropdown,
    [Menu.metadata.tag]: Menu,
    [MenuItem.metadata.tag]: MenuItem,
    [Tag.metadata.tag]: Tag
  };

  /** Flat container option is used when embeding component within another containing element */
  @property({ type: String, reflect: true }) container?: 'flat' | 'inline';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables internal string values to be updated for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  get #select() {
    return this.input as unknown as HTMLSelectElement;
  }

  get #options() {
    return Array.from(this.#select?.options ? this.#select.options : []);
  }

  get #dropdown() {
    return this.shadowRoot.querySelector<Dropdown>(Dropdown.metadata.tag);
  }

  get #menuItems() {
    return this.shadowRoot.querySelectorAll<MenuItem>(MenuItem.metadata.tag);
  }

  get #input() {
    return this.shadowRoot.querySelector<HTMLElement>('[input]');
  }

  get #tags() {
    return this.shadowRoot.querySelector('.tags');
  }

  get #placeholderOption() {
    return this.#options.find(o => o.selected && o.hidden && o.disabled);
  }

  #observers: (MutationObserver | ResizeObserver)[] = [];

  get #multipleSelectLabel() {
    const option = this.#placeholderOption;
    const label = option
      ? this.#placeholderOption.innerText
      : `${this.#select.selectedOptions.length} ${this.i18n.selected}`;
    return html`<div class="tags-label ${this.#placeholderOption ? 'placeholder' : ''}" aria-hidden="true">${label}</div>`;
  }

  protected get prefixContent() {
    return this.#select?.multiple
      ? html`
    ${this.#multipleSelectLabel}
    <div class="tags">
      ${this.#options
        .filter(o => o.selected && o !== this.#placeholderOption)
        .map(
          o => html`
      <nve-tag readonly color="gray-slate" closable .value=${o.value} @click=${() => this.#selectValue(o, false)}>${o.textContent}</nve-tag>`
        )}
    </div>`
      : nothing;
  }

  get #menu() {
    return html`
    <nve-menu role="listbox" style="--width: 100%; --min-width: fit-content" aria-label=${ifDefined(this.i18n.select)}>
      ${this.#options
        .filter(o => o !== this.#placeholderOption)
        .map(
          (o, i) => html`
      <nve-menu-item role="option" @click=${() => this.#selectValue(o, !o.selected)} ?selected=${o.selected} ?disabled=${o.disabled} ?hidden=${!!o.hidden} aria-selected=${o.selected}>
        <slot name="option-${i + 1}">
          <nve-icon name="check" size="sm" aria-hidden="true"></nve-icon> ${o.innerText}
        </slot>
      </nve-menu-item>`
        )}
    </nve-menu>`;
  }

  protected get suffixContent() {
    return this.#select?.size === 0
      ? html`
      <nve-icon name="caret" part="caret" direction="down" size="sm" aria-hidden="true"></nve-icon>
      <nve-dropdown @close=${e => (e.target.hidden = true)} @open=${e => (e.target.hidden = false)} hidden .anchor=${this.#input as HTMLElement} .trigger=${this.#input as HTMLElement} position="bottom">
        ${this.#menu}
      </nve-dropdown>`
      : this.#menu;
  }

  async firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    await this.updateComplete;
    this.#setupCustomSelectUI();
    this.#setupOverflowListener();
    this.#syncSelectValueStates();
    this.#syncOptionSelectedStates();
  }

  #syncSelectValueStates() {
    this.#observers.push(
      getElementUpdate(this.#select, 'value', () => this.requestUpdate()),
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

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observers.forEach(observer => observer.disconnect());
  }

  async updated(props: PropertyValues<this>) {
    super.updated(props);
    if (this.#select?.size && this.#select?.size !== 0) {
      this._internals.states.add('size');
      this.style.setProperty('--size', `${this.#select?.size + 0.75}`);
    }

    if (this.#select?.multiple && this.#select?.size === 0) {
      this._internals.states.add('multiple');
    }
  }

  #setupCustomSelectUI() {
    if (this.#select?.size === 0) {
      onListboxActivate(this.#select, () => {
        this.requestUpdate(); // update menu items
        this.#dropdown.style.setProperty('--min-width', `${this.#input.getBoundingClientRect().width}px`);
        this.#dropdown.showPopover();
        focusElementTimeout(this.#menuItems[0]);
      });
    }
  }

  #setupOverflowListener() {
    const observer = new ResizeObserver(entries => this.#updateMultipleOverflow(entries[0].contentRect.width));
    this.#observers.push(observer);
    observer.observe(this.#input);
  }

  async #selectValue(option: HTMLOptionElement, selected: boolean) {
    if (this.#select.multiple || (!this.#select.multiple && option.value !== this.#select.value)) {
      option.selected = selected;
    }

    // native select only the first selected option determines the select input value
    if (this.#select.selectedOptions.length < 1) {
      this.#select.value = selected ? option.value : '';
    }

    this.#select.dispatchEvent(new Event('input', { bubbles: true }));
    this.#select.dispatchEvent(new Event('change', { bubbles: true }));
    this.requestUpdate();

    if (!this.#select.multiple && this.#dropdown) {
      this.#dropdown.hidePopover();
    } else {
      await this.updateComplete;
      this.#updateMultipleOverflow(this.#input.getBoundingClientRect().width);
    }
  }

  #updateMultipleOverflow(width: number) {
    if (this.#select?.multiple && this.#tags.getBoundingClientRect().width > width - 48) {
      this._internals.states.add('multiple-overflow');
    } else {
      this._internals.states.delete('multiple-overflow');
    }
  }
}
