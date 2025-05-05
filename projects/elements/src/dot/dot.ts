import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { Size, SupportStatus, TaskStatus } from '@nvidia-elements/core/internal';
import { attachInternals, statusStateStyles, supportStateStyles, useStyles } from '@nvidia-elements/core/internal';
import styles from './dot.css?inline';

/**
 * @element nve-dot
 * @description A visual indicator that communicates a status or notification of an associated component.
 * @since 0.10.0
 * @entrypoint \@nvidia-elements/core/dot
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
 * @storybook https://NVIDIA.github.io/elements/docs/elements/dot/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=96-5042&t=CAAM7yEBvG18tRRa-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 */
export class Dot extends LitElement {
  /** Defines visual treatment to represent a ongoing task or support status. */
  @property({ type: String, reflect: true }) status: SupportStatus | TaskStatus;

  /** Determines size of dot relative to provided text. */
  @property({ type: String, reflect: true }) size: Size;

  static styles = useStyles([styles, statusStateStyles, supportStateStyles]);

  static readonly metadata = {
    tag: 'nve-dot',
    version: '0.0.0'
  };

  _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${() => this.#updateSlot()}></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'img';
  }

  #updateSlot() {
    this.textContent.length ? this._internals.states.add('has-text') : this._internals.states.delete('has-text');
  }
}
