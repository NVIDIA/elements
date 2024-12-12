import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { KeynavListConfig } from '@nvidia-elements/core/internal';
import {
  attachInternals,
  formatStandardNumber,
  I18nController,
  keyNavigationList,
  useStyles
} from '@nvidia-elements/core/internal';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Select } from '@nvidia-elements/core/select';
import styles from './pagination.css?inline';

/**
 * @element nve-pagination
 * @description Pagination is a control that enables users to navigate through pages of content.
 * @since 0.11.0
 * @event input emits when the value (page) has changed
 * @event change emits when the value (page) has changed
 * @event first-page emits when the first page is active
 * @event last-page emits when the last page is active
 * @slot - default slot for content
 * @cssprop --background
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-pagination-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=3689-87177&t=znx8f5Hs8oD2ySWm-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
 */
@keyNavigationList<Pagination>()
export class Pagination extends LitElement {
  /**
   * The current page number.
   */
  @property({ type: Number }) value = 1;

  /**
   * The number of items per page.
   */
  @property({ type: Number }) step = 10;
  /**
   * The array of custom step-size.
   */
  @property({ type: Array }) stepSizes = [10, 20, 50, 100];

  /**
   * The total number of items.
   */
  @property({ type: Number }) items: number;

  /**
   * Whether or not the pagination is skippable to start/end.
   */
  @property({ type: Boolean }) skippable: boolean;

  /**
   * Whether or not the step selector is disabled.
   */
  @property({ type: Boolean, attribute: 'disable-step' }) disableStep: boolean;

  /**
   * Whether or not the pagination is disabled.
   */
  @property({ type: Boolean }) disabled: boolean;

  /**
   * The name for the pagination, required to associate it with a form.
   */
  @property({ type: String }) name: string;

  /**
   * Determines the container styles of component. Flat is used for nesting within other containers. Inline is used to inline within other inline content.
   */
  @property({ type: String, reflect: true }) container?: 'flat' | 'inline';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  static formAssociated = true;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-pagination',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton,
    [Select.metadata.tag]: Select
  };

  /** @private */
  get keynavListConfig(): KeynavListConfig {
    return {
      items: this.shadowRoot.querySelectorAll<HTMLElement>(`${IconButton.metadata.tag}, input, select`),
      layout: 'horizontal'
    };
  }

  /** @private */
  declare _internals: ElementInternals;

  get #currentPage() {
    return (this.value - 1) * this.step + this.step;
  }

  get #isLastPage() {
    return this.items / this.value === this.step;
  }

  get #isFirstPage() {
    return this.value === 1;
  }

  get #selectLabel() {
    return `${formatStandardNumber(Math.max(1, (this.value - 1) * this.step))}-${formatStandardNumber(
      (this.value - 1) * this.step + this.step
    )}`;
  }

  get #label() {
    return this.items ? html`<label>${this.i18n.of} ${formatStandardNumber(this.items)}</label>` : nothing;
  }

  get #previousButton() {
    return html`<nve-icon-button
      @click=${() => this.#setValue(this.value - 1)}
      .disabled=${this.disabled || this.#currentPage <= this.step}
      .ariaLabel=${this.i18n.previous}
      container="inline"
      icon-name="chevron"
      direction="left"
    ></nve-icon-button>`;
  }

  get #nextButton() {
    return html`<nve-icon-button
      @click=${() => this.#setValue(this.value + 1)}
      .disabled=${this.disabled || this.#currentPage >= this.items}
      .ariaLabel=${this.i18n.next}
      container="inline"
      icon-name="chevron"
      direction="right"
    ></nve-icon-button>`;
  }

  get #startButton() {
    return html`<nve-icon-button
      @click=${() => this.#setValue(1)}
      .disabled=${this.disabled || this.#currentPage <= this.step}
      .ariaLabel=${this.i18n.start}
      container="inline"
      icon-name="arrow-stop"
      direction="left"
    ></nve-icon-button>`;
  }

  get #endButton() {
    return html`<nve-icon-button
      @click=${() => this.#setValue(this.items / this.step)}
      .disabled=${this.disabled || (this.value - 1) * this.step + this.step >= this.items}
      .ariaLabel=${this.i18n.end}
      container="inline"
      icon-name="arrow-stop"
      direction="right"
    ></nve-icon-button>`;
  }

  #resizeObserver: ResizeObserver;

  get #select() {
    return this.disableStep
      ? html`<label>${this.#selectLabel}&nbsp;</label>`
      : html`
          <nve-select .container=${this.container}>
            <select
              .ariaLabel=${this.i18n.currentPage}
              @change=${e => this.#setStep(parseInt(e.target.value, 10))}
              value=${this.step}
              .disabled=${this.disabled || this.disableStep}
            >
            ${this.stepSizes.map(i => html`<option ?selected=${this.step === i} value=${i}>${i}</option>`)}
            </select>
            <div class="select-label">${this.#selectLabel}</div>
          </nve-select>
        `;
  }

  render() {
    return html`
      <div internal-host role="presentation">
        ${
          this.skippable && this.items
            ? html`
              ${this.#startButton} ${this.#previousButton} ${this.#select} ${this.#label} ${this.#nextButton}
              ${this.#endButton}
            `
            : html` ${this.#select} ${this.#label} ${this.#previousButton} ${this.#nextButton} `
        }
      </div>
    `;
  }

  async connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'toolbar';
    this._internals.setFormValue(`${this.value}`);

    await this.updateComplete;
    this.#setupLabelWidth();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#resizeObserver?.unobserve(this);
  }

  #setupLabelWidth() {
    const label = this.shadowRoot.querySelector('.select-label');
    const select = this.shadowRoot.querySelector('select');
    if (label && select) {
      this.#resizeObserver = new ResizeObserver(
        entries => (select.style.minWidth = `${entries[0].contentRect.width + 36}px`)
      );
      this.#resizeObserver.observe(label);
    }
  }

  #setStep(value: number) {
    /* eslint-disable-next-line */
    this.step = value; // stateful due to internalized select element
    this.dispatchEvent(new CustomEvent('step-change', { detail: this.step, bubbles: true, composed: true }));
    this.#setValue(this.value);
  }

  #setValue(value: number) {
    if (this.value !== value) {
      this.value = value;
      this._internals.setFormValue(`${this.value}`);
      this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, data: `${this.value}` }));
      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }

    if (this.#isLastPage) {
      this.dispatchEvent(new CustomEvent('last-page', { bubbles: true, composed: true }));
    }

    if (this.#isFirstPage) {
      this.dispatchEvent(new CustomEvent('first-page', { bubbles: true, composed: true }));
    }
  }
}
