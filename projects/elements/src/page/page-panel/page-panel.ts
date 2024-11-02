import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import {
  appendRootNodeStyle,
  attachInternals,
  auditParent,
  I18nController,
  Size,
  TypeExpandableController,
  useStyles
} from '@nvidia-elements/core/internal';
import { IconButton } from '@nvidia-elements/core/icon-button';
import styles from './page-panel.css?inline';
import globalStyles from './page-panel.global.css?inline';

/**
 * @element nve-page-panel
 * @description Child panel for embeded panels within the page component. Typically used for left/right/bottom page slot positions.
 * @entrypoint \@nvidia-elements/core/page
 * @since 1.15.0
 * @event open
 * @event close
 * @slot default content slot
 * @cssprop --background
 * @cssprop --border
 * @cssprop --color
 * @cssprop --gap
 * @cssprop --padding
 * @cssprop --height
 * @cssprop --width
 * @cssprop --max-width
 * @cssprop --max-height
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-page-documentation--docs
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog?node-id=30-54&node-type=canvas&t=MpkuCQK1YGf307s2-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role
 * @stable false
 */
@auditParent()
export class PagePanel extends LitElement {
  /**
   * Sets the maximum size of the panel.
   */
  @property({ type: String, reflect: true }) size?: Size;

  /**
   * Determines if a closable button should render within page panel.
   */
  @property({ type: Boolean }) closable: boolean;

  /**
   * Determines if a expandable button should render within page panel.
   */
  @property({ type: Boolean }) expandable: boolean;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-page-panel',
    version: '0.0.0',
    parent: 'nve-page'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  #typeExpandableController = new TypeExpandableController(this);

  get #position() {
    const position = {
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
    const directions = {
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
        ${this.closable || this.expandable ? html`<nve-icon-button @click=${() => this.#typeExpandableController.close()} .iconName=${this.#closableIconName} .direction=${this.#closableIconDirection} .ariaLabel=${this.i18n.close} part="_close-btn" container="inline"></nve-icon-button>` : nothing}
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
