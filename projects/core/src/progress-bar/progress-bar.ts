import { html, LitElement } from 'lit';
import type { SupportStatus } from '@nvidia-elements/core/internal';
import { scopedRegistry, useStyles } from '@nvidia-elements/core/internal';
import { property } from 'lit/decorators/property.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './progress-bar.css?inline';

/**
 * @element nve-progress-bar
 * @description A progress bar is a visual indicator of the status of a running task. Under the hood, the component uses the native HTML `progress` element to achieve proper a11y concerns.
 * @since 0.16.0
 * @entrypoint \@nvidia-elements/core/progress-bar
 * @cssprop --height
 * @cssprop --opacity
 * @cssprop --background
 * @cssprop --accent-color
 * @cssprop --indeterminate-gradient - Gradient used for indeterminate state animation
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/progressbar_role
 */
@scopedRegistry()
export class ProgressBar extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-progress-bar',
    version: '0.0.0'
  };

  /** The current `value` of the progress indicator, set to the native HTML progress element. */
  @property({ type: Number, reflect: true }) value?: number;

  /** The `max` property sets the highest value that `value` scales to. */
  @property({ type: Number }) max? = 100;

  /** Defines visual treatment to represent a ongoing task or support status. */
  @property({ type: String, reflect: true }) status: SupportStatus;

  render() {
    const classes = {
      full: this.value === this.max,
      'min-width': this.value !== undefined && this.value > 0,
      indeterminate: this.value === undefined
    };

    return html`
      <progress internal-host .max=${this.max as number} .value=${this.value === undefined ? (100 as number) : (this.value as number)} class=${classMap(classes)}></progress>
    `;
  }
}
