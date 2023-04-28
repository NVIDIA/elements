import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { statusStateStyles, supportStateStyles, SupportStatus, TaskStatus, useStyles } from '@elements/elements/internal';
import styles from './dot.css?inline';

/**
 * @alpha
 * @element mlv-dot
 * @slot - This is a default/unnamed slot for content
 * @cssprop --background
 * @cssprop --color
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-dot-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=96-5042&t=CAAM7yEBvG18tRRa-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 * @stable false
 */
export class Dot extends LitElement {
  /** visual treatment to represent a ongoing task status */
  @property({ type: String, reflect: true }) status: SupportStatus | TaskStatus;

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
    console.log(this.#internals)
    this.textContent.length ? this.#internals.states.add('--has-text') : this.#internals.states.delete('--has-text');
  }
}
