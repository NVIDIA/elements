import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { attachInternals, Size, statusIcons, SupportStatus, useStyles } from '@elements/elements/internal';
import { Icon } from '@elements/elements/icon';
import styles from './progress-ring.css?inline';

/**
 * @element nve-progress-ring
 * @description - The `nve-progress-ring` component is used to indicate the status of a pending task
 * @since - 0.17.0
 * @slot - status-icon
 * @cssprop --background-color
 * @cssprop --ring-color
 * @cssprop --ring-background-opacity
 * @cssprop --ring-width
 * @cssprop --width
 * @cssprop --height
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-progress-ring-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/progressbar_role
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29%3A20&mode=dev
 * @vqa true
 * @unitTests false
 */
export class ProgressRing extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-progress-ring',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'nve-icon': Icon
  };

  /** @private */
  declare _internals: ElementInternals;

  /** current value of the progress indicator */  
  @property({ type: Number }) value?: number;

  /** minimum value of the progress indicator */  
  @property({ type: Number }) min? = 0;

  /** max value of the progress indicator */  
  @property({ type: Number }) max? = 100;

  /** visual treatment to represent a ongoing task status */
  @property({ type: String, reflect: true }) status?: SupportStatus | 'neutral' = 'neutral';

  /** T-shirt size of the progress indicator */
  @property({ type: String, reflect: true }) size?: Size | 'xxs' | 'xs' | 'xl';


  render() {
    return html`
      <div internal-host ?indeterminate=${this.value === undefined} ?zeroValue=${this.value === 0} >
        <svg viewBox="0 0 16 16">
          <circle cx="8px" cy="8px" r="7px" class="background"></circle>
          <circle cx="8px" cy="8px" r="7px" class="ring"
            stroke-dasharray=${this.value / this.max * 44 + 'px' + ' ' + '44px'}>
          </circle>
        </svg>

        <slot name="status-icon">
          ${this.status !== 'accent' ? html`<nve-icon .name=${statusIcons[this.status] as any} .status=${this.status}></nve-icon>` : ''}
        </slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'progressbar';
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this._internals.ariaValueNow = `${this.value === undefined ? '' : this.value}`;
    this._internals.ariaValueMin = `${this.min}`;
    this._internals.ariaValueMax = `${this.max}`;
  }
}
