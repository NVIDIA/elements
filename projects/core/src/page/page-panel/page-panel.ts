import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { Size } from '@nvidia-elements/core/internal';
import {
  appendRootNodeStyle,
  attachInternals,
  audit,
  I18nController,
  scopedRegistry,
  TypeExpandableController,
  useStyles
} from '@nvidia-elements/core/internal';
import { IconButton } from '@nvidia-elements/core/icon-button';
import styles from './page-panel.css?inline';
import globalStyles from './page-panel.global.css?inline';

/**
 * @element nve-page-panel
 * @description Child panel for embedded panels within the page component. Typically used for left/right/bottom page slot positions.
 * @entrypoint \@nvidia-elements/core/page
 * @since 1.15.0
 * @event open
 * @event close
 * @slot - default content slot
 * @slot actions - slot for action / dismiss buttons
 * @command --open - use to open the panel
 * @command --close - use to close the panel
 * @command --toggle - use to toggle the panel
 * @cssprop --background
 * @cssprop --border
 * @cssprop --color
 * @cssprop --gap
 * @cssprop --padding
 * @cssprop --height
 * @cssprop --width
 * @cssprop --max-width
 * @cssprop --max-height
 * @cssprop --animation-duration - Duration of panel open/close animations

 * @csspart icon-button - The close/collapse icon button element
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role
 *
 */
@audit()
@scopedRegistry()
export class PagePanel extends LitElement {
  /**
   * Sets the max size of the panel.
   */
  @property({ type: String, reflect: true }) size?: Size;

  /**
   * Determines if a closable button should render within page panel.
   * @deprecated use the `actions` slot instead
   */
  @property({ type: Boolean }) closable: boolean;

  /**
   * Determines if a expandable button should render within page panel.
   * @deprecated use the `actions` slot instead
   */
  @property({ type: Boolean }) expandable: boolean;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables updating internal string values for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-page-panel',
    version: '0.0.0',
    parents: ['nve-page']
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  #typeExpandableController = new TypeExpandableController(this, { useHidden: true });

  get #position() {
    const position: Record<string, string> = {
      left: 'left',
      right: 'right',
      bottom: 'bottom'
    };

    return position[this.slot] || '';
  }

  get #closableIconName() {
    return this.expandable ? 'double-chevron' : 'cancel';
  }

  get #closableIconDirection() {
    const directions: Record<string, string> = {
      left: 'left',
      right: 'right',
      bottom: 'down'
    };

    return directions[this.#position] || 'up';
  }

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
    <div internal-host>
      <div part="_header">
        <slot name="header"></slot>
        <slot name="actions">
          ${this.closable || this.expandable ? html`<nve-icon-button part="icon-button" exportparts="icon:icon-button-icon" @click=${() => this.#typeExpandableController.close()} .iconName=${this.#closableIconName} .direction=${this.#closableIconDirection} aria-label=${this.i18n.close} container="inline" role="button"></nve-icon-button>` : nothing}
        </slot>
      </div>
      <div class="content">
        <slot></slot>
      </div>
      <div>
        <slot name="footer"></slot>
      </div>
    </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    appendRootNodeStyle(this, globalStyles);
    this._internals.role = 'region';
  }
}
