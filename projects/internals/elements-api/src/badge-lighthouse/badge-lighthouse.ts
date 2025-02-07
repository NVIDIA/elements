import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './badge-lighthouse.css?inline';

function getLighthouseScoreStatus(score: number) {
  if (score !== null) {
    if (score > 95) {
      return 'success';
    } else if (score > 80) {
      return 'warning';
    } else {
      return 'danger';
    }
  } else {
    return 'unknown';
  }
}

export class BadgeLighthouse extends LitElement {
  /* eslint rulesdir/primitive-property: 0 */
  @property({ type: Object }) value: { performance?: number; accessibility?: number; bestPractices?: number } = {};

  @property({ type: String }) container: 'flat';

  static metadata = {
    tag: 'nve-api-badge-lighthouse',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  get #average() {
    const values = Object.keys(this.value ?? {})
      .map(key => (this.value ?? {})[key])
      .filter(value => value !== undefined);
    return values.length ? Math.floor(values.reduce((prev, next) => prev + next, 0) / values.length) : null;
  }

  render() {
    return html`
      ${
        this.value && this.container !== 'flat'
          ? html`
      <nve-tooltip style="--background: var(--nve-sys-layer-overlay-background);" position="bottom" id="tooltip">
        <div style="display: flex; flex-direction: column; gap:12px;">
          <nve-badge container="flat" .status=${getLighthouseScoreStatus(this.value.performance)}>Performance: ${this.value.performance}</nve-badge>
          <nve-badge container="flat" .status=${getLighthouseScoreStatus(this.value.bestPractices)}>Best Practices: ${this.value.bestPractices}</nve-badge>
          <nve-badge container="flat" .status=${getLighthouseScoreStatus(this.value.accessibility)}>Accessibility: ${this.value.accessibility}</nve-badge>
        </div>
      </nve-tooltip>`
          : nothing
      }
      <nve-badge popovertarget="tooltip" .status=${getLighthouseScoreStatus(this.#average)} .container=${this.container} style="--text-transform: none">
        <a href="https://developer.chrome.com/docs/lighthouse/overview/" target="_blank"><slot></slot>${this.#average}</a>
      </nve-badge>
    `;
  }
}
