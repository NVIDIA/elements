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
 * @element mlv-panel-header
 * @slot title - Title Text
 * @slot subtitle - Subtitle Text
 * @slot action-icon - Extra Action Button
 * @cssprop --padding
 * @cssprop --border-bottom
 * @cssprop --line-height
 */
export class PanelHeader extends LitElement {
  static styles = useStyles([panelHeaderStyleSheet]);

  static readonly metadata = {
    tag: 'mlv-panel-header',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`
      <header internal-host>
        <div id="titles">
          <slot name="title"></slot>
          <slot name="subtitle"></slot>
        </div>

        <div id="icon-buttons">
          <slot name="action-icon"></slot>
          <slot name="close-button"></slot>
        </div>
      </header>
    `;
  }

  connectedCallback() {
    super.connectedCallback(); // Do not override connectedCallback w/out supering
    this.slot = 'header';
  }
}


/**
 * @element mlv-panel-content
 * @slot - This is a default/unnamed slot for panel content content
 * @cssprop --padding
 */
 export class PanelContent extends LitElement {
  static styles = useStyles([panelContentStyleSheet]);

  static readonly metadata = {
    tag: 'mlv-panel-content',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`
      <slot></slot>
    `;
  }
}


/**
 * @element mlv-panel-footer
 * @slot - This is a default/unnamed slot for panel footer content
 * @cssprop --padding
 */
 export class PanelFooter extends LitElement {
  static styles = useStyles([panelFooterStyleSheet]);

  static readonly metadata = {
    tag: 'mlv-panel-footer',
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
 * @element mlv-panel
 * @slot - This is a default/unnamed slot for panel content
 * @slot action-icon - Extra Action Button
 * @slot content - content element (Use <mlv-panel-content> or custom content)
 * @slot footer - footer element (Use <mlv-panel-footer> or custom content)
 * @cssprop --background
 * @cssprop --color
 * @cssprop --box-shadow
 */

@stateExpanded<Panel>()
export class Panel extends LitElement {
  declare _internals: ElementInternals;

  static styles = useStyles([panelStyleSheet]);

  static readonly metadata = {
    tag: 'mlv-panel',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'mlv-icon-button': IconButton,
    'mlv-panel-header': PanelHeader
  };


  #i18nController: I18nController<this> = new I18nController<this>(this);
  #typeClosableController = new TypeClosableController(this);

  @property({ type: Object, attribute: 'mlv-i18n' }) i18n = this.#i18nController.i18n;
  @property({ type: Boolean, reflect: true }) expanded: boolean = true;
  @property({ type: Boolean }) closable: boolean = false;
  @property({ type: String }) side: 'left' | 'right' = 'left';
  @property({ type: String }) title: string;
  @property({ type: String }) subtitle: string;

  render() {
    return html`
      <div internal-host>
          <mlv-panel-header>
            ${when(this.title, () => html`<div slot="title">${this.title}</div>`)}

            ${when(this.subtitle, () => html`<div slot="subtitle">${this.subtitle}</div>`)}

            <div slot="action-icon">
              <slot name="action-icon"></slot>
            </div>

            ${when(
              !this.closable,
              () => html`
                <mlv-icon-button slot="close-button" interaction=${this.expanded ? 'ghost' : ''} icon-name=${this.expanded ? 'collapse-panel' : 'expand-panel'}
                  @click=${() => this.expanded = !this.expanded}
                  direction=${this.side}
                  .expanded=${this.expanded}
                  .ariaLabel=${this.expanded ? this.i18n.close : this.i18n.expand}
                ></mlv-icon-button>
              `,
              () => html`
                <mlv-icon-button slot="close-button" interaction="ghost" icon-name="cancel"
                  @click=${() => this.#typeClosableController.close()}
                  .expanded=${this.expanded}
                  .ariaLabel=${this.expanded ? this.i18n.hide : this.i18n.show}
                ></mlv-icon-button>
              `)}
          </mlv-panel-header>

        <slot></slot>

        <slot name="footer"></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'region';
  }
}