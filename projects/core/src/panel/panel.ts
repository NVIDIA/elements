import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { when } from 'lit/directives/when.js';
import {
  stateExpanded,
  I18nController,
  TypeExpandableController,
  useStyles,
  attachInternals,
  scopedRegistry
} from '@nvidia-elements/core/internal';
import { IconButton } from '@nvidia-elements/core/icon-button';
import panelStyleSheet from './panel.css?inline';
import panelHeaderStyleSheet from './panel-header.css?inline';
import panelContentStyleSheet from './panel-content.css?inline';
import panelFooterStyleSheet from './panel-footer.css?inline';

/**
 * @element nve-panel-header
 * @description Displays the title, subtitle, and optional action controls at the top of a panel.
 * @since 0.10.0
 * @entrypoint \@nvidia-elements/core/panel
 * @slot - default content slot
 * @slot title - Title Text
 * @slot subtitle - Subtitle Text
 * @slot action-icon - Extra Action Button
 * @cssprop --padding
 * @cssprop --border-bottom
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 * @deprecated use `nve-page-panel` with `nve-page` instead
 */
export class PanelHeader extends LitElement {
  static styles = useStyles([panelHeaderStyleSheet]);

  static readonly metadata = {
    tag: 'nve-panel-header',
    version: '0.0.0'
  };

  render() {
    return html`
      <div internal-host>
        <div id="titles">
          <slot name="title"></slot>
          <slot name="subtitle"></slot>
          <slot></slot>
        </div>

        <slot name="action-icon"></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback(); // Do not override connectedCallback w/out supering
    this.slot = 'header';
  }
}

/**
 * @element nve-panel-content
 * @description Contains the main body content within a panel, providing a structured region for detailed information.
 * @since 0.10.0
 * @entrypoint \@nvidia-elements/core/panel
 * @slot - This is a default/unnamed slot for panel content
 * @cssprop --padding
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 */
export class PanelContent extends LitElement {
  static styles = useStyles([panelContentStyleSheet]);

  static readonly metadata = {
    tag: 'nve-panel-content',
    version: '0.0.0'
  };

  render() {
    return html`
      <slot></slot>
    `;
  }
}

/**
 * @element nve-panel-footer
 * @description Provides a designated area at the bottom of a panel for actions or supplementary controls.
 * @since 0.10.0
 * @entrypoint \@nvidia-elements/core/panel
 * @slot - This is a default/unnamed slot for panel footer content
 * @cssprop --padding
 * @cssprop --border-top
 * @cssprop --gap
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 */
export class PanelFooter extends LitElement {
  static styles = useStyles([panelFooterStyleSheet]);

  static readonly metadata = {
    tag: 'nve-panel-footer',
    version: '0.0.0'
  };

  render() {
    return html`
      <footer internal-host>
        <slot></slot>
      </footer>
    `;
  }

  connectedCallback() {
    super.connectedCallback(); // Do not override connectedCallback w/out supering
    this.slot = 'footer';
  }
}

/**
 * @element nve-panel
 * @description Panel is inline container for content that couples to the content on the page (details, extra actions/options). Or [Drawer](./docs/elements/drawer/) is out of context of the rest of the page (notifications, navigations, settings).
 * @since 0.10.0
 * @entrypoint \@nvidia-elements/core/panel
 * @event open - Dispatched when the panel opens.
 * @event close - Dispatched when the panel closes.
 * @slot - This is a default/unnamed slot for panel content
 * @slot header - header element (Use `panel-header` or custom content)
 * @slot content - content element (Use `panel-content` or custom content)
 * @slot footer - footer element (Use `panel-footer` or custom content)
 * @cssprop --background
 * @cssprop --color
 * @cssprop --box-shadow
 * @cssprop --panel-button-border-radius - Border radius of the panel expand/collapse button
 * @csspart icon-button - The expand/collapse icon button element
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 */

@scopedRegistry()
@stateExpanded<Panel>()
export class Panel extends LitElement {
  /**
   * Determines whether the panel is fully expanded, displaying its contents, or not.
   */
  @property({ type: Boolean, reflect: true }) expanded = false;

  /**
   * Determines whether the panel collapses down to an expand icon, or fully hides.
   */
  @property({ type: Boolean }) closable = false;

  /**
   * Determines whether the panel should handle auto-closing behavior vs. defaults to off.
   */
  @property({ type: Boolean, attribute: 'behavior-expand' }) behaviorExpand = false;

  /**
   * Sets the proper collapse icon and collapse animation, based on which side of the page the panel occupies.
   */
  @property({ type: String }) side: 'left' | 'right' = 'left';

  static styles = useStyles([panelStyleSheet]);

  static readonly metadata = {
    tag: 'nve-panel',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  /** @private */
  declare _internals: ElementInternals;

  #i18nController: I18nController<this> = new I18nController<this>(this);
  #typeExpandableController = new TypeExpandableController(this);

  /**
   * Enables updating internal string values for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  get #direction() {
    if (this.side === 'left') {
      return this.expanded ? 'left' : 'right';
    } else {
      return this.expanded ? 'right' : 'left';
    }
  }

  render() {
    return html`
      <div internal-host>
        <div class="header">
          <slot name="header"></slot>

          ${when(
            !this.closable,
            () => html`
              <nve-icon-button part="icon-button" exportparts="icon:icon-button-icon" .container=${this.expanded ? 'flat' : undefined} icon-name="double-chevron"
                @click=${() => this.#typeExpandableController.toggle()}
                .direction=${this.#direction}
                .expanded=${this.expanded}
                .ariaLabel=${this.expanded ? this.i18n.close : this.i18n.expand}
              ></nve-icon-button>
            `,
            () => html`
              <nve-icon-button part="icon-button" exportparts="icon:icon-button-icon" container="flat" icon-name="cancel"
                @click=${() => this.#typeExpandableController.close()}
                .expanded=${this.expanded}
                .ariaLabel=${this.expanded ? this.i18n.hide : this.i18n.show}
              ></nve-icon-button>
            `
          )}
        </div>

        <div class="content">
          <slot></slot>
        </div>

        <slot name="footer"></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'region';
  }
}
