import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { attachInternals, I18nController, keyNavigationList, KeynavListConfig, useStyles } from '@elements/elements/internal';
import styles from './pagination.css?inline';

/**
 * @element nve-pagination
 * @slot - default slot for content
 * @cssprop --background
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-pagination-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=3689-87177&t=znx8f5Hs8oD2ySWm-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
 * @stable false
 */
@keyNavigationList<Pagination>()
export class Pagination extends LitElement {
  @property({ type: Number }) value = 1;

  @property({ type: Number }) step = 10;

  @property({ type: Number }) items: number;

  @property({ type: Boolean }) skippable: boolean;

  @property({ type: Boolean }) disabled: boolean;

  @property({ type: String }) name: string;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  @property({ type: Object, attribute: 'nve-i18n' }) i18n = this.#i18nController.i18n;

  static formAssociated = true;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-pagination',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
  };

  /** @private */
  get keynavListConfig(): KeynavListConfig {
    return {
      items: this.shadowRoot.querySelectorAll<HTMLElement>('nve-icon-button, input, select'),
      layout: 'horizontal'
    }
  }

  /** @private */
  declare _internals: ElementInternals;

  get #currentPage() {
    return ((this.value - 1) * this.step) + this.step;
  }

  get #selectLabel() {
    return `${Math.max(1, (this.value - 1) * this.step)}-${((this.value - 1) * this.step) + this.step}`;
  }

  get #label() {
    return html`<label>of ${this.items}</label>`;
  }

  get #previousButton() {
    return html`<nve-icon-button @click=${() => this.#setValue(this.value - 1)} .disabled=${this.disabled || this.#currentPage <= this.step} .ariaLabel=${this.i18n.previous} interaction="flat" icon-name="chevron" direction="left"></nve-icon-button>`;
  }

  get #nextButton() {
    return html`<nve-icon-button @click=${() => this.#setValue(this.value + 1)} .disabled=${this.disabled || this.#currentPage >= this.items} .ariaLabel=${this.i18n.next} interaction="flat" icon-name="chevron" direction="right"></nve-icon-button>`;
  }

  get #startButton() {
    return html`<nve-icon-button @click=${() => this.#setValue(1)} .disabled=${this.disabled || this.#currentPage <= this.step} .ariaLabel=${this.i18n.start} interaction="flat" icon-name="arrow-stop" direction="left"></nve-icon-button>`;
  }

  get #endButton() {
    return html`<nve-icon-button @click=${() => this.#setValue(this.items / this.step)} .disabled=${this.disabled || (((this.value - 1) * this.step) + this.step) >= this.items} .ariaLabel=${this.i18n.end} interaction="flat" icon-name="arrow-stop" direction="right"></nve-icon-button>`;
  }

  get #select() {
    return html`
    <nve-select>
      <select .ariaLabel=${this.i18n.currentPage} @change=${e => this.#setStep(parseInt(e.target.value, 10))} value=${this.step} .disabled=${this.disabled}>
        <option ?selected=${this.step === 10} value="10">10</option>
        <option ?selected=${this.step === 20} value="20">20</option>
        <option ?selected=${this.step === 50} value="50">50</option>
        <option ?selected=${this.step === 100} value="100">100</option>
      </select>
      <div class="select-label">${this.#selectLabel}</div>
    </nve-select>
    `;
  }

  render() {
    return html`
      <div internal-host role="presentation">
        ${this.skippable
          ? html`
            ${this.#startButton}
            ${this.#previousButton}
            ${this.#select}
            ${this.#label}
            ${this.#nextButton}
            ${this.#endButton}
          `
          : html`
            ${this.#select}
            ${this.#label}
            ${this.#previousButton}
            ${this.#nextButton}
        `}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'toolbar';
    this._internals.setFormValue(`${this.value}`);
  }

  #setStep(value: number) {
    this.#setValue(1);
    /* eslint-disable-next-line */
    this.step = value; // stateful due to internalized select element
  }

  #setValue(value: number) {
    this.value = value;
    this._internals.setFormValue(`${this.value}`);
    this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, data: `${this.value}` }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }
}
