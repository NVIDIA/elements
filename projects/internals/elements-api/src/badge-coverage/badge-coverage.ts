import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './badge-coverage.css?inline';

export class BadgeCoverage extends LitElement {
  @property({ type: Number }) value: number;

  @property({ type: String }) container: 'flat';

  static metadata = {
    tag: 'nve-api-badge-coverage',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  get #formattedValue() {
    return this.value
      ? new Intl.NumberFormat('default', {
          style: 'percent',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(this.value / 100)
      : null;
  }

  get #status() {
    if (this.value !== undefined) {
      if (this.value >= 90) {
        return 'success';
      } else if (this.value >= 70) {
        return 'warning';
      } else {
        return 'danger';
      }
    } else {
      return 'unknown';
    }
  }

  render() {
    return html`<nve-badge .container=${this.container} .status=${this.#status}><slot></slot>${this.#formattedValue}</nve-badge>`;
  }
}
