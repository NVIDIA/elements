import { html, nothing, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './badge-bundle.css?inline';

export class BadgeBundle extends LitElement {
  /** Total bundle size in kb including all externalized dependencies */
  @property({ type: Number }) value: number;

  @property({ type: String }) container: 'flat';

  static metadata = {
    tag: 'nve-api-badge-bundle',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  get #status() {
    if (this.value !== undefined) {
      if (this.value <= 25) {
        return 'success';
      } else if (this.value <= 40) {
        return 'warning';
      } else {
        return 'danger';
      }
    } else {
      return 'unknown';
    }
  }

  render() {
    return html`
      <nve-badge popovertarget="tooltip" .container=${this.container} .status=${this.#status}><slot></slot>${this.value}${this.value ? 'kb' : nothing}</nve-badge>
      ${this.container !== 'flat' ? html`<nve-tooltip position="bottom" status="muted" id="tooltip" style="--width: 280px">Lighthouse determined network response bundle size using GZIP compression.</nve-tooltip>` : nothing}
    `;
  }
}
