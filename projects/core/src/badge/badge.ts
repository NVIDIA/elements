import type { PropertyValues } from 'lit';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Icon } from '@nvidia-elements/core/icon';
import type { TaskStatus, SupportStatus, TrendStatus, Color, Prominence } from '@nvidia-elements/core/internal';
import {
  useStyles,
  statusIcons,
  statusStateStyles,
  supportStateStyles,
  colorStateStyles,
  attachInternals,
  I18nController,
  typeSSR,
  scopedRegistry
} from '@nvidia-elements/core/internal';
import styles from './badge.css?inline';

/**
 * @element nve-badge
 * @description A visual indicator that communicates a status description of an associated component. Status badges use short text, color, built in icons for quick recognition and render near the relevant content.
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/badge
 * @slot - default slot for content
 * @slot prefix-icon - slot for prefix icon
 * @slot suffix-icon - slot for suffix icon
 * @cssprop --background
 * @cssprop --color
 * @cssprop --gap
 * @cssprop --font-size
 * @cssprop --icon-color
 * @cssprop --padding
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --font-weight
 * @cssprop --text-transform
 * @cssprop --width
 * @cssprop --height
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 */
@typeSSR()
@scopedRegistry()
export class Badge extends LitElement {
  /**
   * Visual treatment to represent a ongoing task, support status.
   */
  @property({ type: String, reflect: true }) status: TaskStatus | SupportStatus | TrendStatus;

  /**
   * Highlights content to draw attention and convey simple messages.
   */
  @property({ type: String, reflect: true }) color: Color;

  /**
   * Determines the container styles of component. Flat suits nesting within other containers.
   */
  @property({ type: String, reflect: true }) container?: 'flat';

  /** Determines the visual prominence or weight */
  @property({ type: String, reflect: true }) prominence?: Extract<Prominence, 'emphasis'>;

  static styles = useStyles([styles, statusStateStyles, supportStateStyles, colorStateStyles]);

  static readonly metadata = {
    tag: 'nve-badge',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  get #size() {
    return this.status && statusIcons[this.status] === 'dot' ? 'sm' : 'md';
  }

  /** @private */
  declare _internals: ElementInternals;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables updating internal string values for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  render() {
    return html`
      <div internal-host>
        <slot name="prefix-icon">${this.status && !this.status?.includes('trend') ? html`<nve-icon part="_icon" .name=${statusIcons[this.status] ?? ''} .size=${this.#size} aria-hidden="true"></nve-icon>` : nothing}</slot>
        <slot @slotchange=${this.#slotChange}></slot>
        <slot name="suffix-icon">
          ${this.status?.includes('trend') ? html`<nve-icon part="_icon" .name=${statusIcons[this.status]} aria-hidden="true"></nve-icon>` : nothing}
        </slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'status';
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this.#assignAriaLabel();
  }

  #slotChange() {
    this.#assignAriaLabel();
    this.#assignDefaultIcon();
  }

  #assignAriaLabel() {
    const trend = this.status?.includes('trend')
      ? ` ${this.i18n.trend} ${(this.i18n as Record<string, string>)[this.status!.split('-')[1]!]}`
      : '';
    this._internals.ariaLabel = this.textContent + trend;
  }

  #assignDefaultIcon() {
    const unassignedIcon = this.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!
      .assignedElements()
      .find(i => i.matches('nve-icon, nve-icon') && !i.slot);
    if (unassignedIcon) {
      unassignedIcon.slot = 'prefix-icon';
    }
  }
}
