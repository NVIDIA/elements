import { PropertyValues, html, render } from 'lit';
import { appendRootNodeStyle, useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { Icon } from '@elements/elements/icon';
import { IconButton } from '@elements/elements/icon-button/icon-button';
import { Menu, MenuItem } from '@elements/elements/menu';
import globalStyles from './select.global.css?inline';
import styles from './select.css?inline';

/**
 * @element mlv-select
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --border
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-select-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-24&t=clRGqnKDRGNhR0Yu-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select
 */
export class Select extends Control {
  static styles = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'mlv-select',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'mlv-menu': Menu,
    'mlv-menu-item': MenuItem,
    'mlv-icon': Icon,
    'mlv-icon-button': IconButton
  }

  protected get suffixContent() {
    return (this.input?.multiple || this.input?.size) ? html`` : html`<mlv-icon name="caret" direction="down"></mlv-icon>`;
  }

  get #select() {
    return this.querySelector('select');
  }

  get #options() {
    return Array.from(this.querySelectorAll('option'));
  }

  get #dropdown() {
    return this.querySelector('mlv-dropdown');
  }

  get #menuItems() {
    return this.querySelectorAll('mlv-menu-item');
  }

  protected get dropdown() {
    return html`
    <mlv-dropdown hidden .anchor=${this.#select as HTMLElement}>
      <mlv-menu role="listbox">
        ${this.#options.map(o => html`<mlv-menu-item role="option" aria-selected=${o.value === this.#select.value} ?selected=${o.value === this.#select.value} .value=${o.value}>${this.#getOptionLabel(o)}</mlv-menu-item>`)}
      </mlv-menu>
    </mlv-dropdown>`
  }

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
  }

  firstUpdated(props: PropertyValues<this>): void {
    super.firstUpdated(props);
    render(this.dropdown, this);
    this.#dropdown.addEventListener('close', () => this.#dropdown.toggleAttribute('hidden'));
    this.#dropdown.addEventListener('click', (e: any) => this.#selectValue(e.target.value));
    this.#select.addEventListener('pointerdown', (e: any) => {
      if (!this.#select.disabled && !this.#select.size && !this.#select.multiple) {
        e.preventDefault();
        this.#updateOptions();
        this.#dropdown.style.setProperty('--width', `${this.#select.getBoundingClientRect().width}px`);
        this.#dropdown.hidden = false;
      }
    });
  }

  #selectValue(value) {
    this.#select.value = value;
    this.#updateOptions();
    this.#select.dispatchEvent(new Event('input'));
    this.#select.dispatchEvent(new Event('change'));
    this.#dropdown.toggleAttribute('hidden');
  }

  #updateOptions() {
    this.#menuItems.forEach((o: any) => o.selected = (o.value === this.#select.value))
  }

  #getOptionLabel(option: HTMLOptionElement) {
    const template = option.querySelector('template');
    return template ? template.content.cloneNode(true) : option.innerText;
  }
}
