import { html, LitElement } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { property } from 'lit/decorators/property.js';
import styles from './progress-bar.css?inline';

/**
 * @element nve-progress-bar
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-progress-bar-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/progressbar_role
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29%3A20&mode=dev
 * @vqa false
 */
export class ProgressBar extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-progress-bar',
    version: 'PACKAGE_VERSION'
  };

  @property({ type: Number }) value = 0;

  @property({ type: Number }) min = 0;

  @property({ type: Number }) max = 100;

  render() {
    return html`
      <progress .min=${this.min} .max=${this.max} .value=${this.value} class=${this.value === this.max ? 'full' : ''}></progress>
    `;
  }
}
