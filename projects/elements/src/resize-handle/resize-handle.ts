import { html, type PropertyValues } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property } from 'lit/decorators/property.js';
import { useStyles, typeTouch, BaseFormAssociatedElement } from '@nvidia-elements/core/internal';
import type { NveTouchEvent } from '@nvidia-elements/core/internal';
import styles from './resize-handle.css?inline';

/**
 * @element nve-resize-handle
 * @description A resize-handle slider is a control that enables users to resize views or panels vertically or horizontally.
 * @since 1.27.0
 * @entrypoint \@nvidia-elements/core/resize-handle
 * @cssprop --background
 * @cssprop --line-width
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-resize-handle-documentation--docs
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog?node-id=3975-92825&p=f&t=vwCezJmCbI1X94vQ-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/slider/
 * @stable false
 */
@typeTouch<ResizeHandle>()
export class ResizeHandle extends BaseFormAssociatedElement<number> {
  /**
   * Determines the orientation direction of the resize handle.
   */
  @property({ type: String, reflect: true }) orientation?: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * Determines the minimum resize value.
   */
  @property({ type: Number, reflect: true }) min = 0;

  /**
   * Determines the maximum resize value.
   */
  @property({ type: Number, reflect: true }) max = 100;

  /**
   * Determines the value step change.
   */
  @property({ type: Number, reflect: true }) step = 10;

  static styles = useStyles([styles]);

  get #range() {
    return this.shadowRoot.querySelector('input');
  }

  static readonly metadata = {
    tag: 'nve-resize-handle',
    version: '0.0.0'
  };

  #offset = 0;

  render() {
    return html`
      <div internal-host>
        <div class="line" part="_line"></div>
        <input aria-label=${ifDefined(this.ariaLabel ?? this.i18n.resize)} type="range" min=${this.min} max=${this.max} .valueAsNumber=${this.valueAsNumber} @input=${e => this.#setInput(e.target.valueAsNumber)} @change=${e => this.#setChange(e.target.valueAsNumber)} step=${this.step} />
      </div>
    `;
  }

  constructor() {
    super();
    this.value = this.value ?? 50;
    this.#offset = this.valueAsNumber;
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'none';
  }

  firstUpdated(props: PropertyValues) {
    super.firstUpdated(props);
    this.addEventListener('nve-touch-start', () => this.#touchStart());
    this.addEventListener('nve-touch-end', () => this.#touchEnd());
    this.addEventListener('nve-touch-move', (e: NveTouchEvent) => this.#touchMove(e));
    this.addEventListener('dblclick', () => this.#toggle());
  }

  #toggle() {
    const value = this.valueAsNumber <= this.max && this.valueAsNumber !== this.min ? this.min : this.max;
    this.#setInput(value);
    this.#setChange(value);
  }

  #touchStart() {
    this.#range.step = '1';
    this._internals.states.add('active');
    this.#offset = this.valueAsNumber;
  }

  #touchMove(e: NveTouchEvent) {
    const offset = (this.orientation === 'vertical' ? e.offsetX : -e.offsetY) * (this.dir === 'rtl' ? -1 : 1);
    this.#offset = this.#offset + offset;
    this.#setInput(this.#offset);
  }

  #touchEnd() {
    this.#offset = this.valueAsNumber;
    this.#range.step = `${this.step}`;
    this.#setChange(this.#offset);
    this._internals.states.delete('active');
  }

  #setInput(value: number) {
    this.#updateValue(value);
    this.dispatchInputEvent();
  }

  #setChange(value: number) {
    this.#updateValue(value);
    this.dispatchChangeEvent();
  }

  #updateValue(value: number) {
    if (value <= this.max && value >= this.min) {
      this.valueAsNumber = value;
    }
  }
}
