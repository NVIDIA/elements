import { html, LitElement } from 'lit';
import { SupportStatus, useStyles } from '@elements/elements/internal';
import { property } from 'lit/decorators/property.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './progress-bar.css?inline';

/**
 * @element mlv-progress-bar
 * @description A progress bar is a visual indicator of the status of a running task. Under the hood the native HTML `progress` element is used to achieve proper a11y concerns.
 * @since 0.16.0
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-progress-bar-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/progressbar_role
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29%3A20&mode=dev
 * @stable false
 */
export class ProgressBar extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-progress-bar',
    version: 'PACKAGE_VERSION'
  };
 
  /** The current `value` of the progress indicator, set to the native HTML progress element. */  
  @property({ type: Number }) value?: number = 0;

  /** The `max` property sets the highest value that `value` will be scaled to. */  
  @property({ type: Number }) max? = 100;

  /** Defines visual treatment to represent a ongoing task or support status. */
  @property({ type: String, reflect: true }) status: SupportStatus;

  render() {
    const classes = { full: this.value === this.max, minWidth: this.value > 0 };
    
    return html`
      <progress .max=${this.max} .value=${this.value} class=${classMap(classes)}></progress>
    `;
  }
}
