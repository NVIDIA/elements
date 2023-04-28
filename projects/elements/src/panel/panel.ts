import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { when } from 'lit/directives/when.js';
import { stateExpanded, I18nController, TypeExpandableController, useStyles } from '@elements/elements/internal';
import { IconButton } from '@elements/elements/icon-button/icon-button';
import panelStyleSheet from './panel.css?inline';
import panelHeaderStyleSheet from './panel-header.css?inline';
import panelContentStyleSheet from './panel-content.css?inline';
import panelFooterStyleSheet from './panel-footer.css?inline';


/**
 * @element nve-panel-header
 * @slot title - Title Text
 * @slot subtitle - Subtitle Text
 * @slot action-icon - Extra Action Button (use `nve-icon-button`)
 * @cssprop --padding
 * @cssprop --border-bottom
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-panel-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-54&t=iOYah8Uct8CFd69k-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 * @stable false
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
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-panel-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-54&t=iOYah8Uct8CFd69k-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 * @stable false
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
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-panel-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-54&t=iOYah8Uct8CFd69k-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 * @stable false
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
 * @element nve-panel
 * @slot - This is a default/unnamed slot for panel content
 * @slot header - header element (Use `<nve-panel-header>` or custom content)
 * @slot content - content element (Use `<nve-panel-content>` or custom content)
 * @slot footer - footer element (Use `<nve-panel-footer>` or custom content)
 * @cssprop --background
 * @cssprop --color
 * @cssprop --box-shadow
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-panel-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-54&t=iOYah8Uct8CFd69k-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 * @stable false
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
  #typeExpandableController = new TypeExpandableController(this);

  @property({ type: Object, attribute: 'nve-i18n' }) i18n = this.#i18nController.i18n;
  /**
   * Determines whether or not the panel is fully expanded, displaying its contents, or not.
   */
  @property({ type: Boolean, reflect: true }) expanded = false;
  /**
   * Determines whether or not the panel will collapse down to an expand icon, or fully hide.
  */
  @property({ type: Boolean }) closable = false;
  /**
   * Determines whether or not the panel should handle auto-closing behavior vs. defaults to off.
   */
  @property({ type: Boolean, attribute: 'behavior-expand'}) behaviorExpand = false;
  /**
   * Sets the proper collapse icon and collapse animation, based on what side of the page the panel will be used.
  */
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
                @click=${() => this.#typeExpandableController.toggle()}
                direction=${this.side}
                .expanded=${this.expanded}
                .ariaLabel=${this.expanded ? this.i18n.close : this.i18n.expand}
              ></nve-icon-button>
            `,
            () => html`
              <nve-icon-button interaction="ghost" icon-name="cancel"
                @click=${() => this.#typeExpandableController.close()}
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