import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { Color, Size } from '@nvidia-elements/core/internal';
import { useStyles, colorStateStyles, attachInternals } from '@nvidia-elements/core/internal';
import styles from './logo.css?inline';

/**
 * @element nve-logo
 * @description A visual indicator for a brand or application.
 * @since 0.10.0
 * @entrypoint \@nvidia-elements/core/logo
 * @slot - default slot for content
 * @cssprop --background
 * @cssprop --gap
 * @cssprop --color
 * @cssprop --height
 * @cssprop --width
 * @cssprop --font-size
 * @cssprop --border-radius
 * @cssprop --font-weight
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 */
export class Logo extends LitElement {
  /**
   * Visual treatment to represent unique color of an application
   */
  @property({ type: String, reflect: true }) color: Color;

  /**
   * Determines size of logo
   */
  @property({ type: String, reflect: true }) size?: Size;

  static styles = useStyles([styles, colorStateStyles]);

  static readonly metadata = {
    tag: 'nve-logo',
    version: '0.0.0'
  };

  _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        <slot>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 17" fill="none"><path fill="#75B900" fill-rule="evenodd" d="M9.707 5.014V3.51h.52c4.333-.167 7.106 3.51 7.106 3.51s-2.946 4.011-6.24 4.011c-.52 0-.867 0-1.213-.167V6.351c1.733.168 1.907.836 2.946 2.508L15.08 7.02s-1.56-2.006-4.334-2.006h-1.04Zm0-2.841h.52c5.893-.167 9.706 4.847 9.706 4.847s-4.506 5.181-9.013 5.181c-.347 0-.867 0-1.213-.167v1.337h1.04c4.333 0 7.453-2.172 10.4-4.68.52.335 2.6 1.337 2.946 1.672-2.773 2.34-9.533 4.178-13.347 4.178h-1.04v2.173H26V0H9.707v2.173Zm0 8.691v1.17c-3.987-.668-5.027-4.68-5.027-4.68s1.907-2.005 5.027-2.34v1.338C7.973 6.184 6.76 7.689 6.76 7.689s.693 2.507 2.947 3.175ZM2.6 7.187S5.027 3.844 9.707 3.51V2.34C4.507 2.674 0 7.02 0 7.02s2.6 7.187 9.707 7.689V13.37C4.507 12.87 2.6 7.187 2.6 7.187Z" clip-rule="evenodd"/></svg>
        </slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'img';
  }
}
