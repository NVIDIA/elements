import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import { Icon } from '@nvidia-elements/core/icon';
import { IconButton } from '@nvidia-elements/core/icon-button';
import type { SupportStatus, TaskStatus } from '@nvidia-elements/core/internal';
import {
  attachInternals,
  I18nController,
  statusIcons,
  TypeClosableController,
  useStyles,
  statusStateStyles,
  supportStateStyles,
  appendRootNodeStyle
} from '@nvidia-elements/core/internal';
import globalStyles from './alert.global.css?inline';
import styles from './alert.css?inline';

/**
 * @element nve-alert
 * @description Alert is an element that displays a brief, important message in a way that attracts the user's attention without interrupting the user's task.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/alert
 * @event close - Dispatched when the alert is closed within a alert group.
 * @slot icon - Icon slot is placed on the left side of the alert. Icons are typically used to represent the alert's status.
 * @slot prefix - Prefix slot is placed between the icon and the content. Prefixes are typically used to represent the alert's status.
 * @slot actions - Actions are placed on the right side of the alert. Actions are typically buttons, but can also be links. Actions should be used for actions that the user can take to resolve the alert.
 * @slot content - Content for large overflow text.
 * @slot - Default content placed inside of the alert.
 * @cssprop --gap
 * @cssprop --font-size
 * @cssprop --color
 * @cssprop --icon-color
 * @cssprop --icon-size
 * @cssprop --font-weight
 * @cssprop --justify-content
 * @cssprop --align-items
 * @cssprop --min-height
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-alert-documentation--docs
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alert/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=76-5326&t=CAAM7yEBvG18tRRa-0
 */
export class Alert extends LitElement {
  static styles = useStyles([styles, statusStateStyles, supportStateStyles]);

  static readonly metadata = {
    tag: 'nve-alert',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon,
    [IconButton.metadata.tag]: IconButton
  };

  /** Defines visual treatment to represent a ongoing task or support status. */
  @property({ type: String, reflect: true }) status?: SupportStatus | TaskStatus | 'muted';

  /** When used in an `alert-group` the `closable` property enables alerts to be dismissed within the same group. */
  @property({ type: Boolean }) closable = false;

  #typeClosableController = new TypeClosableController(this);

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables internal string values to be updated for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  @queryAssignedElements({ slot: 'prefix', flatten: true }) private prefixItems!: any[];

  @queryAssignedElements({ slot: 'actions', flatten: true }) private actionItems!: any[];

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host @slotchange=${() => this.requestUpdate()}>
        <slot name="icon"><nve-icon role="img" name=${statusIcons[this.status]} aria-label=${this.i18n[this.status] ?? this.i18n.information}></nve-icon></slot>
        <slot name="prefix" ?hidden=${!this.prefixItems.length}></slot>
        <slot></slot>
        <slot name="actions" ?hidden=${!this.actionItems.length}></slot>
        ${this.closable ? html`<nve-icon-button @click=${() => this.#typeClosableController.close()} container="flat" icon-name="cancel" size="sm" .ariaLabel=${this.i18n.close}></nve-icon-button>` : ''}
      </div>
      <slot name="content" part="content"></slot>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    appendRootNodeStyle(this, globalStyles);
    this._internals.role = 'alert';
  }
}
