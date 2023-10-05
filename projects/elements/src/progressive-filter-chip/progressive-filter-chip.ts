import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { appendRootNodeStyle, attachInternals, generateId, I18nController, TypeClosableController, useStyles } from '@elements/elements/internal';
import { Input } from '@elements/elements/input';
import { Select } from '@elements/elements/select';
import { Date } from '@elements/elements/date';
import { IconButton } from '@elements/elements/icon-button';
import globalStyles from './progressive-filter-chip.global.css?inline';
import styles from './progressive-filter-chip.css?inline';

/**
 * @element mlv-progressive-filter-chip
 * @description A filter chip is a control that enables users to select multiple options from a set of choices.
 * @since 0.16.0
 * @slot - default slot for content
 * @event close - dispatched when close button is clicked
 * @cssprop --background
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-filter-chip-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=72%3A5357
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
 * @stable false
 * @vqa false
 */
export class ProgressiveFilterChip extends LitElement {
  static readonly metadata = {
    tag: 'mlv-progressive-filter-chip',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'mlv-input': Input,
    'mlv-select': Select,
    'mlv-date': Date,
    'mlv-icon-button': IconButton
  }

  /** Determines if a close button should render within filter chip */
  @property({ type: Boolean }) closable: boolean;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  @property({ type: Object, attribute: 'mlv-i18n' }) i18n = this.#i18nController.i18n;

  @state() private inputs: Element[] = [];

  static styles = useStyles([styles]);

  #typeClosableController = new TypeClosableController(this);

  /** @private */
  declare _internals: ElementInternals;

  #getControlTemplate(el: Element) {
    const slot = html`<slot name=${el.slot} @slotchange=${this.#removeItem}></slot>`;
    if (el.tagName === 'SELECT') {
      return html`<mlv-select multiple-overflow ?fit-text=${!(el as HTMLSelectElement).multiple}>${slot}</mlv-select>`;
    } else if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'date') {
      return html`<mlv-date>${slot}</mlv-date>`;
    } else if (el.tagName === 'INPUT') {
      return html`<mlv-input>${slot}</mlv-input>`;
    } else {
      return slot;
    }
  }

  render() {
    return html`
    <div internal-host>
      ${this.inputs.map(el => this.#getControlTemplate(el))}
      ${this.closable ? html`<mlv-icon-button @click=${() => this.#typeClosableController.close()} .ariaLabel=${this.i18n.close} icon-name="cancel"></mlv-icon-button>` : nothing}
    </div>
    <slot hidden-slot @slotchange=${this.#createItems}></slot>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'toolbar';
    this.setAttribute('mlv-control', '');
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
      const items = Array.from(this.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])').assignedElements()).filter(i => i.matches('input, select, mlv-button, [mlv-control]'));
      items.forEach(i => i.slot = generateId());
      this.inputs = items.length ? items : this.inputs;
    }
  }

  #resetItems() {
    Array.from(this.shadowRoot.querySelectorAll('slot')).flatMap(i => i.assignedElements()).forEach(i => i.slot = '');
  }
}
