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
  I18nController
} from '@nvidia-elements/core/internal';
import styles from './badge.css?inline';

/**
 * @element nve-badge
 * @description A visual indicator that communicates a status description of an associated component. Status badges use short text, color, and icons for quick recognition and are placed near the relevant content.
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/badge
 * @slot - default slot for content
 * @slot prefix-icon - slot for prefix icon
 * @slot suffix-icon - slot for suffix icon
 * @cssprop --background
 * @cssprop --gap
 * @cssprop --font-size
 * @cssprop --status-color
 * @cssprop --padding
 * @cssprop --border-radius
 * @cssprop --font-weight
 * @cssprop --text-transform
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-badge-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=96-5042&t=UOtcGeukBSZqsnnO-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 */
export class Badge extends LitElement {
  /**
   * Visual treatment to represent a ongoing task, support or trend status. [Figma](https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=48-710&mode=design)
   */
  @property({ type: String, reflect: true }) status: TaskStatus | SupportStatus | TrendStatus;

  /**
   * Highlights content to draw attention and convey simple messages. [Figma](https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=56-308&mode=design&t=eeBXUleEIUIAeQQh-0)
   */
  @property({ type: String, reflect: true }) color: Color;

  /**
   * Determines the container styles of component. Flat is used for nesting within other containers.
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
    return statusIcons[this.status] === 'dot' ? 'sm' : 'md';
  }

  /** @private */
  declare _internals: ElementInternals;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  render() {
    return html`
      <div internal-host>
        <slot name="prefix-icon">${this.status && !this.status?.includes('trend') ? html`<nve-icon name=${statusIcons[this.status]} .size=${this.#size} aria-hidden="true"></nve-icon>` : nothing}</slot>
        <slot @slotchange=${this.#slotChange}></slot>
        <slot name="suffix-icon">
          ${this.status?.includes('trend') ? html`<nve-icon .name=${statusIcons[this.status] as any} aria-hidden="true"></nve-icon>` : nothing}
        </slot>
      </div>
    `;
  }

  async connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    await this.updateComplete;
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
    const trend = this.status?.includes('trend') ? ` ${this.i18n.trend} ${this.i18n[this.status.split('-')[1]]}` : '';
    this._internals.ariaLabel = this.textContent + trend;
  }

  #assignDefaultIcon() {
    const unassignedIcon = this.shadowRoot
      .querySelector<HTMLSlotElement>('slot:not([name])')
      .assignedElements()
      .find(i => i.matches('nve-icon, nve-icon') && !i.slot);
    if (unassignedIcon) {
      unassignedIcon.slot = 'prefix-icon';
    }
  }
}
