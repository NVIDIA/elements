import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import type { Size, SupportStatus } from '@nvidia-elements/core/internal';
import { attachInternals, I18nController, statusIcons, useStyles } from '@nvidia-elements/core/internal';
import { Icon } from '@nvidia-elements/core/icon';
import styles from './progress-ring.css?inline';

/**
 * @element nve-progress-ring
 * @description The `progress-ring` component shows the status of a pending task. It also serves the basis of the page loading element.
 * @since 0.17.0
 * @entrypoint \@nvidia-elements/core/progress-ring
 * @slot - Content to display in the ring center. Defaults to a status icon.
 * @slot status-icon - (deprecated) Use the default slot instead.
 * @cssprop --background-color
 * @cssprop --ring-color
 * @cssprop --ring-background-opacity
 * @cssprop --ring-width
 * @cssprop --width
 * @cssprop --height
 * @cssprop --animation-duration
 * @cssprop --color
 * @csspart icon - The icon element
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/progressbar_role
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

  /** The `max` value of the progress ring that the `value` is proportionally scaled to. */
  @property({ type: Number }) max? = 100;

  /** Four visual treatments represent the `status` of tasks. When `status` changes to `warning`, `success`, or `danger`, the component embeds appropriate icons. */
  @property({ type: String, reflect: true }) status?: SupportStatus | 'neutral' = 'neutral';

  /** T-shirt `size` of the progress indicator, used to scale the ring. */
  @property({ type: String, reflect: true }) size?: Size | 'xxs' | 'xs' | 'xl';

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables updating internal string values for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  @queryAssignedElements({ slot: 'status-icon' })
  private _deprecatedStatusIconSlot!: Element[];

  /**
   * Tracks presence of content presence in deprecated status-icon slot.
   */
  #hasStatusIconContent = false;

  render() {
    return html`
      <div internal-host ?indeterminate=${this.value === undefined}>
        <svg viewBox="0 0 16 16" role="presentation">
          <circle cx="8px" cy="8px" r="6.5px" class="background"></circle>
          <circle cx="8px" cy="8px" r="6.5px" class="ring"
            stroke-dasharray=${((this.value ?? 0) / (this.max ?? 100)) * 44 + 'px' + ' ' + '44px'}>
          </circle>
        </svg>
        <slot>
          ${
            this.status !== 'accent' && !this.#hasStatusIconContent
              ? html`<nve-icon part="icon" .name=${this.status ? statusIcons[this.status] : undefined} .status=${this.status as SupportStatus} aria-hidden="true"></nve-icon>`
              : ''
          }
        </slot>
        <slot name="status-icon" @slotchange=${this.#updateStatusIcon}></slot>
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
    const i18nRecord = this.i18n as Record<string, string | undefined>;
    this._internals.ariaLabel =
      (this.status && i18nRecord[this.status] && i18nRecord[this.status] !== 'neutral'
        ? i18nRecord[this.status]!
        : this.i18n.information) ?? null;
  }

  #updateStatusIcon() {
    this.#hasStatusIconContent = this._deprecatedStatusIconSlot.length > 0;
    this.requestUpdate();
  }
}
