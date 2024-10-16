import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { Size, SupportStatus } from '@nvidia-elements/core/internal';
import { attachInternals, I18nController, statusIcons, useStyles } from '@nvidia-elements/core/internal';
import { Icon } from '@nvidia-elements/core/icon';
import styles from './progress-ring.css?inline';

/**
 * @element nve-progress-ring
 * @description The `progress-ring` component is used to indicate the status of a pending task. It also serves the basis of the page loading element.
 * @since 0.17.0
 * @slot status-icon
 * @cssprop --background-color
 * @cssprop --ring-color
 * @cssprop --ring-background-opacity
 * @cssprop --ring-width
 * @cssprop --width
 * @cssprop --height
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-progress-ring-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/progressbar_role
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29%3A20&mode=dev
 */
export class ProgressRing extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-progress-ring',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  /** @private */
  declare _internals: ElementInternals;

  /** The current `value` of the progress ring. When not set, an indeterminate animation will show. */
  @property({ type: Number }) value?: number;

  /** The `max` value of the progress ring that the `value` is proportionaly scaled to. */
  @property({ type: Number }) max? = 100;

  /** There are four visual treatments that represent the `status` of varius tasks. When `status` is set to `warning`, `success` or `danger`, appropriate icons are embedded. */
  @property({ type: String, reflect: true }) status?: SupportStatus | 'neutral' = 'neutral';

  /** T-shirt `size` of the progress indicator, used to scale the ring. */
  @property({ type: String, reflect: true }) size?: Size | 'xxs' | 'xs' | 'xl';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables internal string values to be updated for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  render() {
    return html`
      <div internal-host ?indeterminate=${this.value === undefined} ?zeroValue=${this.value === 0}>
        <svg viewBox="0 0 16 16" role="presentation">
          <circle cx="8px" cy="8px" r="6.5px" class="background"></circle>
          <circle cx="8px" cy="8px" r="6.5px" class="ring"
            stroke-dasharray=${(this.value / this.max) * 44 + 'px' + ' ' + '44px'}>
          </circle>
        </svg>

        <slot name="status-icon">
          ${this.status !== 'accent' ? html`<nve-icon .name=${statusIcons[this.status] as any} .status=${this.status as any} aria-hidden="true"></nve-icon>` : ''}
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
    this._internals.ariaValueMax = `${this.max}`;
    this._internals.ariaLabel =
      this.i18n[this.status] && this.i18n[this.status] !== 'neutral' ? this.i18n[this.status] : this.i18n.information;
  }
}
