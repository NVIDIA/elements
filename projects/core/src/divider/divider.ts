import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles, attachInternals } from '@nvidia-elements/core/internal';
import styles from './divider.css?inline';

/**
 * @element nve-divider
 * @description Divider is a component that separates and distinguishes sections of content or groups of menuitems.
 * @since 0.12.0
 * @entrypoint \@nvidia-elements/core/divider
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --size
 * @cssprop --border-radius
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/separator_role
 */
export class Divider extends LitElement {
  /**
   * Determines the orientation of the divider.
   */
  @property({ type: String, reflect: true }) orientation: 'vertical' | 'horizontal' = 'horizontal';

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-divider',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`<div internal-host></div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'separator';
    this._internals.ariaOrientation = this.orientation;
  }
}
