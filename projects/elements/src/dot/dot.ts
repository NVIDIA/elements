import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Size, statusStateStyles, supportStateStyles, SupportStatus, TaskStatus, useStyles } from '@elements/elements/internal';
import styles from './dot.css?inline';

/**
 * @alpha
 * @element mlv-dot
 * @slot - default content
 * @cssprop --gap
 * @cssprop --font-size
 * @cssprop --font-weight
 * @cssprop --background
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --height
 * @cssprop --width
 * @cssprop --padding
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-dot-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=96-5042&t=CAAM7yEBvG18tRRa-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 * @stable false
 */
export class Dot extends LitElement {
  /** visual treatment to represent a ongoing task status */
  @property({ type: String, reflect: true }) status: SupportStatus | TaskStatus;

  /** determines size of dot relative to provided text */
  @property({ type: String, reflect: true }) size: Size; // todo: abstract t-shirt sizes to interface

  static styles = useStyles([styles, statusStateStyles, supportStateStyles]);

  static readonly metadata = {
    tag: 'mlv-dot',
    version: 'PACKAGE_VERSION'
  };

  #internals = this.attachInternals();

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${() => this.#updateSlot()}></slot>
      </div>
    `;
  }

  #updateSlot() {
    this.textContent.length ? this.#internals.states.add('--has-text') : this.#internals.states.delete('--has-text');
  }
}
