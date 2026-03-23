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
  hostAttr,
  audit,
  scopedRegistry
} from '@nvidia-elements/core/internal';
import { IconButton } from '@nvidia-elements/core/icon-button';
import accordionStyleSheet from './accordion.css?inline';
import accordionHeaderStyleSheet from './accordion-header.css?inline';
import accordionContentStyleSheet from './accordion-content.css?inline';
import accordionGroupStyleSheet from './accordion-group.css?inline';

/**
 * @element nve-accordion-header
 * @description Provides the clickable heading region of an accordion that toggles the visibility of associated content.
 * @since 0.12.0
 * @entrypoint \@nvidia-elements/core/accordion
 * @slot - default content slot
 * @slot prefix - slot for prefix content
 * @slot suffix - slot for suffix content
 * @slot title - (deprecated)
 * @slot subtitle - (deprecated)
 * @slot actions - (deprecated)
 * @cssprop --cursor
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
 * @description Contains the collapsible body content that reveals or hides when the parent accordion expands or collapses.
 * @since 0.12.0
 * @entrypoint \@nvidia-elements/core/accordion
 * @slot - This is a default/unnamed slot for accordion content
 * @cssprop --padding
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
 * @command --open - use to open the accordion
 * @command --close - use to close the accordion
 * @command --toggle - use to toggle the accordion
 * @slot - This is a default/unnamed slot for accordion content
 * @slot icon-button - icon elements to display for expand/collapse
 * @slot header - header element (Use `accordion-header` or custom content)
 * @slot content - content element (Use `accordion-content` or custom content)
 * @cssprop --background
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --header-padding
 * @cssprop --cursor
 * @cssprop --transition
 * @csspart icon-button - The toggle icon button element
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 */
@audit()
@scopedRegistry()
@stateExpanded<Accordion>()
export class Accordion extends LitElement implements ContainerElement {
  static styles = useStyles([accordionStyleSheet]);

  static readonly metadata = {
    tag: 'nve-accordion',
    version: '0.0.0',
    children: [AccordionHeader.metadata.tag, AccordionContent.metadata.tag, IconButton.metadata.tag]
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

  /**
   * Determines the container styles of component. Flat suits nesting accordions within other containers. Inset suits more complex accordions where content needs distinct separation.
   */
  @property({ type: String, reflect: true }) container?: Extract<Container, 'flat' | 'inset'>;

  /**
   * Determines whether the accordion expands to display its contents.
   */
  @property({ type: Boolean, reflect: true }) expanded = false;

  /**
   * Determines whether the accordion is expandable
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Determines whether the accordion should opt-in to stateful expansion behavior (defaults to stateless)
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
          @click=${(e: Event) => this.#toggle(e.target as HTMLElement)}
          .ariaLabel=${this.expanded ? this.i18n.close : this.i18n.expand}
          .ariaControls=${'content'}
          >
          <slot name="header"></slot>

          <slot name="icon-button">
            <nve-icon-button part="icon-button"
            exportparts="icon:icon-button-icon"
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
 * @description Organizes many accordions into a cohesive group, enabling coordinated expand/collapse behavior such as single-item expansion.
 * @since 0.12.0
 * @entrypoint \@nvidia-elements/core/accordion
 * @cssprop --padding
 * @slot - This is a default slot for accordions within the group
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 */
@audit()
export class AccordionGroup extends LitElement {
  declare _internals: ElementInternals;
  static styles = useStyles([accordionGroupStyleSheet]);

  /**
   * Determines whether the accordion should opt-in to stateful expansion behavior (defaults to stateless)
   */
  @property({ type: Boolean, attribute: 'behavior-expand' }) behaviorExpand = false;

  /**
   * Determines whether the accordion should opt-in to stateful expansion of a single accordion at a time
   */
  @property({ type: Boolean, attribute: 'behavior-expand-single' }) behaviorExpandSingle = false;

  /** flat (Borderless, container-less accordions), full (default), or inset (Rounded corner, contained accordion) */
  @property({ type: String, reflect: true }) container?: Extract<Container, 'flat' | 'inset'>;

  static readonly metadata = {
    tag: 'nve-accordion-group',
    version: '0.0.0',
    children: [Accordion.metadata.tag]
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
      if (this.behaviorExpandSingle && this.accordions.find(accordion => accordion === e.target)) {
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
