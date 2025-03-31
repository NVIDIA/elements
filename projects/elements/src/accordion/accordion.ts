import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import type { ContainerElement, Container } from '@nvidia-elements/core/internal';
import {
  stateExpanded,
  I18nController,
  TypeExpandableController,
  useStyles,
  attachInternals,
  generateId,
  isFocusable,
  hostAttr
} from '@nvidia-elements/core/internal';
import { IconButton } from '@nvidia-elements/core/icon-button';
import accordionStyleSheet from './accordion.css?inline';
import accordionHeaderStyleSheet from './accordion-header.css?inline';
import accordionContentStyleSheet from './accordion-content.css?inline';
import accordionGroupStyleSheet from './accordion-group.css?inline';

/**
 * @element nve-accordion-header
 * @since 0.12.0
 * @entrypoint \@nvidia-elements/core/accordion
 * @slot prefix
 * @slot suffix
 * @slot title - (deprecated)
 * @slot subtitle - (deprecated)
 * @slot actions - (deprecated)
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-accordion-documentation--docs
 * @figma https://zeroheight.com/4dfee7d25/p/5152ae--accordion/b/992fcd/i/210564630
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 */
export class AccordionHeader extends LitElement {
  static styles = useStyles([accordionHeaderStyleSheet]);

  static readonly metadata = {
    tag: 'nve-accordion-header',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        <slot name="prefix"></slot>
        <div id="titles">
          <slot name="title"></slot>
          <slot name="subtitle"></slot>
        </div>
        <slot></slot>
        <div id="actions">
          <slot name="actions"></slot>
        </div>
        <slot name="suffix"></slot>
      </div>
    `;
  }

  @hostAttr() slot = 'header';

  connectedCallback() {
    super.connectedCallback(); // Do not override connectedCallback w/out supering
    attachInternals(this);
    this._internals.role = 'heading';
    this._internals.ariaLevel = '2';
  }
}

/**
 * @element nve-accordion-content
 * @since 0.12.0
 * @entrypoint \@nvidia-elements/core/accordion
 * @slot - This is a default/unnamed slot for accordion content content
 * @cssprop --padding
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-accordion-documentation--docs
 * @figma https://zeroheight.com/4dfee7d25/p/5152ae--accordion/b/992fcd/i/210564630
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 */
export class AccordionContent extends LitElement {
  static styles = useStyles([accordionContentStyleSheet]);

  static readonly metadata = {
    tag: 'nve-accordion-content',
    version: '0.0.0'
  };

  render() {
    return html`
      <slot></slot>
    `;
  }
}

/**
 * @element nve-accordion
 * @description An accordion is a vertical stack of interactive headings used to toggle the display of further information.
 * @since 0.12.0
 * @entrypoint \@nvidia-elements/core/accordion
 * @slot - This is a default/unnamed slot for accordion content
 * @slot icon-button - icon elements to display for expand/collapse
 * @slot header - header element (Use `accordion-header` or custom content)
 * @slot content - content element (Use `accordion-content` or custom content)
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --color
 * @cssprop --header-padding
 * @cssprop --transition
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-accordion-documentation--docs
 * @figma https://zeroheight.com/4dfee7d25/p/5152ae--accordion/b/992fcd/i/210564630
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 */
@stateExpanded<Accordion>()
export class Accordion extends LitElement implements ContainerElement {
  static styles = useStyles([accordionStyleSheet]);

  static readonly metadata = {
    tag: 'nve-accordion',
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
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  /**
   * Determines the container styles of component. Flat is used for nesting accordions within other containers. Inset can be used for more complex accordions where content is distinctly separated.
   */
  @property({ type: String, reflect: true }) container?: Extract<Container, 'flat' | 'full' | 'inset'> = 'full';

  /**
   * Determines whether the accordion is expanded, displaying its contents, or not.
   */
  @property({ type: Boolean, reflect: true }) expanded = false;

  /**
   * Determines whether the accordion is expandable
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Determines whether or not the accordion should opt-in to stateful expansion behavior (defaults to stateless)
   */
  @property({ type: Boolean, attribute: 'behavior-expand' }) behaviorExpand = false;

  get #hasAction(): boolean {
    return !!(this?.querySelectorAll ? Array.from(this?.querySelectorAll<HTMLSlotElement>('[slot="actions"]')) : [])
      .length;
  }

  get #header() {
    return this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name=header]')?.assignedElements()[0];
  }

  #toggle(element: HTMLElement) {
    if (!this.disabled && (!isFocusable(element) || element.id === 'internal-trigger')) {
      this.#typeExpandableController.toggle();
    }
  }

  render() {
    return html`
      <div internal-host class=${this.#hasAction ? 'has-action' : ''}>
        <div id="header"
          @click=${e => this.#toggle(e.target)}
          .ariaLabel=${this.expanded ? this.i18n.close : this.i18n.expand}
          .ariaControls=${'content'}
          >
          <slot name="header"></slot>

          <slot name="icon-button">
            <nve-icon-button
              id="internal-trigger"
              container="inline"
              icon-name="caret"
              direction=${this.expanded ? (this.#hasAction ? 'down' : 'up') : this.#hasAction ? 'right' : 'down'}
              ?disabled=${this.disabled}
              ?pressed=${this.expanded}
              .expanded=${this.expanded}
              .ariaLabel=${this.expanded ? this.i18n.close : this.i18n.expand}
            ></nve-icon-button>
          </slot>
        </div>

        <div id="content" .ariaHidden=${!this.expanded}>
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

  async firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);

    if (this.#header) {
      this.#header.id ||= generateId();
      this.setAttribute('aria-labelledby', this.#header.id);
    }
  }
}

/**
 * @element nve-accordion-group
 * @since 0.12.0
 * @entrypoint \@nvidia-elements/core/accordion
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-accordion-documentation--docs
 * @figma https://zeroheight.com/4dfee7d25/p/5152ae--accordion/b/992fcd/i/210564630
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 */
export class AccordionGroup extends LitElement {
  declare _internals: ElementInternals;
  static styles = useStyles([accordionGroupStyleSheet]);

  /**
   * Determines whether or not the accordion should opt-in to stateful expansion behavior (defaults to stateless)
   */
  @property({ type: Boolean, attribute: 'behavior-expand' }) behaviorExpand = false;

  /**
   * Determines whether or not the accordion should opt-in to stateful expansion of a single accordion at a time
   */
  @property({ type: Boolean, attribute: 'behavior-expand-single' }) behaviorExpandSingle = false;

  /** flat (Borderless, container-less accordions), full (default), or inset (Rounded corner, contained accordion) */
  @property({ type: String, reflect: true }) container?: Extract<Container, 'flat' | 'full' | 'inset'> = 'full';

  static readonly metadata = {
    tag: 'nve-accordion-group',
    version: '0.0.0'
  };

  @queryAssignedElements() private accordions!: Accordion[];

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${() => this.#updateChildAttributes()}></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'group';

    this.addEventListener('open', e => {
      if (this.behaviorExpandSingle) {
        this.accordions.filter(accordion => accordion !== e.target).forEach(accordion => (accordion.expanded = false));
      }
    });
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this.#updateChildAttributes();
  }

  #updateChildAttributes() {
    this.accordions.forEach(accordion => (accordion.container = this.container));
    this.accordions.forEach(accordion => (accordion.behaviorExpand = this.behaviorExpand || this.behaviorExpandSingle));
  }
}
