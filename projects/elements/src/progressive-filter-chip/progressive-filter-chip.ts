import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import {
  appendRootNodeStyle,
  attachInternals,
  generateId,
  I18nController,
  TypeClosableController,
  typeSSR,
  useStyles
} from '@nvidia-elements/core/internal';
import { Input } from '@nvidia-elements/core/input';
import { Select } from '@nvidia-elements/core/select';
import { Date } from '@nvidia-elements/core/date';
import { IconButton } from '@nvidia-elements/core/icon-button';
import globalStyles from './progressive-filter-chip.global.css?inline';
import styles from './progressive-filter-chip.css?inline';

/**
 * @element nve-progressive-filter-chip
 * @description A filter chip is a control that enables users to select many options from a set of choices.
 * @since 0.16.0
 * @entrypoint \@nvidia-elements/core/progressive-filter-chip
 * @slot - default slot for content
 * @event close - Dispatched when the filter chip closes.
 * @cssprop --gap
 * @cssprop --border-radius
 * @cssprop --border
 * @cssprop --background
 * @cssprop --font-weight
 * @cssprop --padding
 * @cssprop --width
 * @csspart select - The select element
 * @csspart date - The date input element
 * @csspart input - The input element
 * @csspart icon-button - The icon button element
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
 */
@typeSSR()
export class ProgressiveFilterChip extends LitElement {
  static readonly metadata = {
    tag: 'nve-progressive-filter-chip',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Input.metadata.tag]: Input,
    [Select.metadata.tag]: Select,
    [Date.metadata.tag]: Date,
    [IconButton.metadata.tag]: IconButton
  };

  /** Determines if a close button should render within filter chip */
  @property({ type: Boolean }) closable: boolean;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables updating internal string values for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  @state() private inputs: Element[] = [];

  static styles = useStyles([styles]);

  #typeClosableController = new TypeClosableController(this);

  /** @private */
  declare _internals: ElementInternals;

  #getControlTemplate(el: Element) {
    const slot = html`<slot name=${el.slot} @slotchange=${this.#removeItem}></slot>`;
    if (el.tagName === 'SELECT') {
      return html`<nve-select part="select" multiple-overflow ?fit-text=${!(el as HTMLSelectElement).multiple}>${slot}</nve-select>`;
    } else if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'date') {
      return html`<nve-date part="date">${slot}</nve-date>`;
    } else if (el.tagName === 'INPUT') {
      return html`<nve-input part="input">${slot}</nve-input>`;
    } else {
      return slot;
    }
  }

  render() {
    return html`
    <div internal-host>
      ${this.inputs.map(el => this.#getControlTemplate(el))}
      ${this.closable ? html`<nve-icon-button part="icon-button" exportparts="icon:icon-button-icon" @click=${() => this.#typeClosableController.close()} .ariaLabel=${this.i18n.close} icon-name="cancel"></nve-icon-button>` : nothing}
    </div>
    <slot hidden-slot @slotchange=${this.#createItems}></slot>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'toolbar';
    this.setAttribute('nve-control', '');
    appendRootNodeStyle(this, globalStyles);
  }

  #removeItem(e: Event) {
    if (!(e.target as HTMLSlotElement).assignedElements().length) {
      this.#resetItems();
    }
  }

  #createItems(e: Event) {
    if (e.target && (e.target as HTMLSlotElement).assignedElements().length) {
      this.#resetItems();
      const items = Array.from(
        this.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!.assignedElements()
      ).filter(i => i.matches('input, select, nve-button, nve-button, [nve-control], [nve-control]'));
      items.forEach(i => (i.slot = generateId()));
      this.inputs = items.length ? items : this.inputs;
    }
  }

  #resetItems() {
    Array.from(this.shadowRoot!.querySelectorAll('slot'))
      .flatMap(i => i.assignedElements())
      .forEach(i => (i.slot = ''));
  }
}
