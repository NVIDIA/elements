import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './badge-axe.css?inline';

export class BadgeAxe extends LitElement {
  /** Axe test result */
  @property({ type: String }) value: undefined | false | string;

  @property({ type: String }) container: 'flat';

  static metadata = {
    tag: 'nve-api-badge-axe',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  render() {
    return html`
      ${this.container !== 'flat' ? html`<nve-tooltip id="tooltip" position="bottom" status="muted">Score/issues reported via AXE Core tests</nve-tooltip>` : nothing}
      ${this.value === undefined || this.value === '' ? html`<nve-badge popovertarget="tooltip" .container=${this.container as any} status="success" style="--text-transform: none"><a href="https://github.com/dequelabs/axe-core" target="_blank">axe-core</a></nve-badge>` : nothing}
      ${this.value === false ? html`<nve-badge popovertarget="tooltip" .container=${this.container as any} status="pending">Pending</nve-badge>` : nothing}
      ${this.value ? html`<nve-badge popovertarget="tooltip" .container=${this.container as any} status="warning" style="--text-transform: none"><a href="https://dequeuniversity.com/rules/axe/4.8/${this.value}?application=axeAPI" target="_blank">${this.value}</a></nve-badge>` : nothing}
    `;
  }
}
