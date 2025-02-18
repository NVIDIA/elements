import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './badge-status.css?inline';

const statuses = {
  'pre-release': 'warning',
  beta: 'accent',
  stable: 'success',
  undefined: 'unknown'
} as const;

export class BadgeStatus extends LitElement {
  /** Axe test result */
  @property({ type: String }) value: 'pre-release' | 'beta' | 'stable' | undefined;

  @property({ type: String }) container: 'flat';

  static metadata = {
    tag: 'nve-api-badge-status',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  render() {
    return html`
      <nve-badge .container=${this.container} .status=${statuses[this.value]}>
        ${this.value ? this.value : 'unknown'}&nbsp;<slot></slot>
      </nve-badge>
    `;
  }
}
