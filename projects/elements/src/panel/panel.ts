import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { when } from 'lit/directives/when.js';
import { stateExpanded, I18nController, TypeClosableController, useStyles } from '@elements/elements/internal';
import { IconButton } from '@elements/elements/icon-button/icon-button';
import panelStyleSheet from './panel.css?inline';
import panelHeaderStyleSheet from './panel-header.css?inline';
import panelContentStyleSheet from './panel-content.css?inline';
import panelFooterStyleSheet from './panel-footer.css?inline';



/**
 * @element nve-panel-header
 * @slot title - Title Text
 * @slot subtitle - Subtitle Text
 * @slot action-icon - Extra Action Button
 * @cssprop --padding
 * @cssprop --border-bottom
 */
export class PanelHeader extends LitElement {
  static styles = useStyles([panelHeaderStyleSheet]);

  static readonly metadata = {
    tag: 'nve-panel-header',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`
      <div internal-host>
        <div id="titles">
          <slot name="title"></slot>
          <slot name="subtitle"></slot>
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
 * @slot - This is a default/unnamed slot for panel content content
 * @cssprop --padding
 */
 export class PanelContent extends LitElement {
  static styles = useStyles([panelContentStyleSheet]);

  static readonly metadata = {
    tag: 'nve-panel-content',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`
      <slot></slot>
    `;
  }
}


/**
 * @element nve-panel-footer
 * @slot - This is a default/unnamed slot for panel footer content
 * @cssprop --padding
 * @cssprop --border-top
 * @cssprop --gap
 */
 export class PanelFooter extends LitElement {
  static styles = useStyles([panelFooterStyleSheet]);

  static readonly metadata = {
    tag: 'nve-panel-footer',
    version: 'PACKAGE_VERSION'
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
 * @alpha
 * @element nve-panel
 * @slot - This is a default/unnamed slot for panel content
 * @slot action-icon - Extra Action Button
 * @slot content - content element (Use <nve-panel-content> or custom content)
 * @slot footer - footer element (Use <nve-panel-footer> or custom content)
 * @cssprop --background
 * @cssprop --color
 * @cssprop --box-shadow
 */

@stateExpanded<Panel>()
export class Panel extends LitElement {
  declare _internals: ElementInternals;

  static styles = useStyles([panelStyleSheet]);

  static readonly metadata = {
    tag: 'nve-panel',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'nve-icon-button': IconButton,
    'nve-panel-header': PanelHeader
  };


  #i18nController: I18nController<this> = new I18nController<this>(this);
  #typeClosableController = new TypeClosableController(this);

  @property({ type: Object, attribute: 'nve-i18n' }) i18n = this.#i18nController.i18n;
  @property({ type: Boolean, reflect: true }) expanded = true;
  @property({ type: Boolean }) closable = false;
  @property({ type: String }) side: 'left' | 'right' = 'left';

  render() {
    return html`
      <div internal-host>
        <div class="header">
          <slot name="header"></slot>

          ${when(
            !this.closable,
            () => html`
              <nve-icon-button interaction=${this.expanded ? 'ghost' : ''} icon-name=${this.expanded ? 'collapse-panel' : 'expand-panel'}
                @click=${() => this.expanded = !this.expanded}
                direction=${this.side}
                .expanded=${this.expanded}
                .ariaLabel=${this.expanded ? this.i18n.close : this.i18n.expand}
              ></nve-icon-button>
            `,
            () => html`
              <nve-icon-button interaction="ghost" icon-name="cancel"
                @click=${() => this.#typeClosableController.close()}
                .expanded=${this.expanded}
                .ariaLabel=${this.expanded ? this.i18n.hide : this.i18n.show}
              ></nve-icon-button>
            `)}
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
    this._internals.role = 'region';
  }
}