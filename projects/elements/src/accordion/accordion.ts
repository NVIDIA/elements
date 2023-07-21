import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { stateExpanded, I18nController, TypeExpandableController, useStyles, attachInternals, ContainerElement, Container } from '@elements/elements/internal';
import { IconButton } from '@elements/elements/icon-button/icon-button';
import accordionStyleSheet from './accordion.css?inline';
import accordionHeaderStyleSheet from './accordion-header.css?inline';
import accordionContentStyleSheet from './accordion-content.css?inline';


/**
 * @element nve-accordion-header
 * @slot title - Title heading
 * @slot subtitle - Subtitle Text
 * @slot actions - Extra Action Button (use `nve-icon-button`)
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-accordion-documentation--docs
 * @figma https://zeroheight.com/4dfee7d25/p/5152ae--accordion/b/992fcd/i/210564630
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 * @stable false
 */
export class AccordionHeader extends LitElement {
  declare _internals: ElementInternals;
  static styles = useStyles([accordionHeaderStyleSheet]);

  static readonly metadata = {
    tag: 'nve-accordion-header',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`
      <div internal-host>
        <div id="titles">
          <slot name="title"></slot>
          <slot name="subtitle"></slot>
        </div>

        <div id="actions">
          <slot name="actions"></slot>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback(); // Do not override connectedCallback w/out supering
    this.slot = 'header';
    attachInternals(this);
    this._internals.role = 'heading';
  }
}


/**
 * @element nve-accordion-content
 * @slot - This is a default/unnamed slot for accordion content content
 * @cssprop --padding
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-accordion-documentation--docs
 * @figma https://zeroheight.com/4dfee7d25/p/5152ae--accordion/b/992fcd/i/210564630
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 * @stable false
 */
 export class AccordionContent extends LitElement {
  static styles = useStyles([accordionContentStyleSheet]);

  static readonly metadata = {
    tag: 'nve-accordion-content',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`
      <slot></slot>
    `;
  }
}


/**
 * @element nve-accordion
 * @slot - This is a default/unnamed slot for accordion content
 * @slot header - header element (Use `<nve-accordion-header>` or custom content)
 * @slot content - content element (Use `<nve-accordion-content>` or custom content)
 * @cssprop --background
 * @cssprop --color
 * @cssprop --box-shadow
 * @cssprop --header-padding
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-accordion-documentation--docs
 * @figma https://zeroheight.com/4dfee7d25/p/5152ae--accordion/b/992fcd/i/210564630
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 * @stable false
 * @vqa false
 * @unitTests false
 */

@stateExpanded<Accordion>()
export class Accordion extends LitElement implements ContainerElement {
  declare _internals: ElementInternals;

  static styles = useStyles([accordionStyleSheet]);

  static readonly metadata = {
    tag: 'nve-accordion',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'nve-icon-button': IconButton,
  };


  #i18nController: I18nController<this> = new I18nController<this>(this);
  #typeExpandableController = new TypeExpandableController(this);

  @property({ type: Object, attribute: 'nve-i18n' }) i18n = this.#i18nController.i18n;
  /** flat (Borderless, container-less accordions), full (default), or inset (Rounded corner, contained accordion) */
  @property({ type: String, reflect: true }) container?: Container = 'full';
  /**
   * Determines whether the accordion is expanded, displaying its contents, or not.
   */
  @property({ type: Boolean, reflect: true }) expanded = false;
  /**
   * Determines whether or not the accordion should opt-in to stateful expansion behavior (defaults to stateless)
  */
  @property({ type: Boolean, attribute: 'behavior-expand'}) behaviorExpand = false;


  get #hasAction(): boolean {
    return !!this.querySelector('[slot="actions"]')
  }

  render() {
    return html`
      <div internal-host class=${this.#hasAction ? 'has-action' : ''}>
        <div id="header">
          <slot id="heading" name="header"></slot>

          <nve-icon-button
            interaction="flat"
            size="sm"
            @click=${() => this.#typeExpandableController.toggle()}
            direction=${this.expanded ? this.#hasAction ? 'down' : 'up' : this.#hasAction ? 'right' : 'down'}
            icon-name="caret"
            .expanded=${this.expanded}
            .ariaLabel=${this.expanded ? this.i18n.close : this.i18n.expand}
            .ariaControls=${'content'}
            ></nve-icon-button>
        </div>

        <div id="content" aria-labelledby="heading">
          <slot></slot>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'region';
  }
}