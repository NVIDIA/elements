import { LitElement, html, PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { Icon } from '@elements/elements/icon';
import { IconButton } from '@elements/elements/icon-button/icon-button';
import { attachInternals, useStyles, associateLabel, assoicateAriaDescribedBy, associateDataList, appendRootNodeStyle, getAttributeListChanges } from '@elements/elements/internal';
import { ControlMessage } from '../control-message/control-message.js';
import { setupControlValidationStates, setupControlStates, setupControlStatusStates, inputQuery } from '../utils/states.js';
import { setupControlLayoutStates, isInlineInputType } from '../utils/layout.js';
import globalStyles from './control.global.css?inline';
import styles from './control.css?inline';

/**
 * @alpha
 * @element nve-control
 * @cssprop --cursor
 * @cssprop --accent-color
 * @cssprop --color
 * @cssprop --label-color
 * @cssprop --label-width
 * @cssprop --control-width
 * @cssprop --control-height
 */
export class Control extends LitElement {
  @property({ type: String }) status: 'warning' | 'error' | 'success' | 'disabled';

  @property({ type: String, reflect: true }) layout: 'vertical' | 'vertical-inline' | 'horizontal' | 'horizontal-inline';

  get #label() {
    return this.querySelector<HTMLLabelElement>('label');
  }

  get #messages() {
    return Array.from(this.querySelectorAll<ControlMessage>('nve-control-message'));
  }

  get #visibleMessages() {
    return this.#messages.filter(i => !i.hasAttribute('hidden'));
  }

  /** @private */
  get input() {
    return this.querySelector<HTMLInputElement>(inputQuery);
  }

  /** @private */
  protected get prefixContent() {
    return html``;
  }

  /** @private */
  protected get suffixContent() {
    return html``;
  }

  @state() private inlineControl = false;

  @state() private styleStates = { 'no-messages': !this.#visibleMessages.length, 'no-label': !this.#label, 'inline-control': this.inlineControl };

  static styles = useStyles([styles]);

  /** @private */
  declare _internals: ElementInternals;

  #observers: (MutationObserver | ResizeObserver)[] = [];

  static elementDefinitions = {
    'nve-icon': Icon,
    'nve-icon-button': IconButton
  }

  render() {
    return !this.inlineControl ? html`
      <div internal-host class=${classMap(this.styleStates)}>
        ${this.#label ? html`<slot name="label"></slot>` : ''}
        <div input>
          ${this.prefixContent}
          <slot></slot>
          ${this.suffixContent}
        </div>
        <slot name="messages"></slot>
      </div>
    ` : html`
      <div internal-host class=${classMap(this.styleStates)}>
        <div input><slot interaction-state></slot></div>
        <slot name="label"></slot>
        <slot name="messages"></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    appendRootNodeStyle(this, globalStyles);
    this.shadowRoot.addEventListener('slotchange', () => this.#updateStyleStates());
  }

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    this.setAttribute('nve-control', '');
    this.setAttribute('nve-control', this.querySelector('[nve-control]') ? 'custom' : '');
    setupControlValidationStates(this, this.#messages);
    this.#observers.push(
      ...setupControlStates(this),
      ...setupControlStatusStates(this, this.#messages),
      setupControlLayoutStates(this),
      getAttributeListChanges(this, ['hidden', 'status'], () => this.#updateStyleStates())
    );

    this.#updateAssociations();
    this.shadowRoot.addEventListener('slotchange', () => this.#updateAssociations());
  }

  #updateStyleStates() {
    this.inlineControl = isInlineInputType(this.input);
    this.input?.multiple ? this.setAttribute('multiple', '') : this.removeAttribute('multiple');
    this.input?.size ? this.setAttribute('size', '') : this.removeAttribute('size');
    this.styleStates = { 'no-messages': !this.#visibleMessages.length, 'no-label': !this.#label, 'inline-control': this.inlineControl };
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observers.forEach(observer => observer.disconnect());
  }

  #updateAssociations() {
    this.#assignLabel();
    associateLabel(this.#label, this.input);
    assoicateAriaDescribedBy(Array.from(this.#messages), this.input);
    associateDataList(this.querySelector<HTMLDataListElement>('datalist'), this.input);
  }

  #assignLabel() {
    if (this.#label) {
      this.#label.slot = 'label';
    }
  }
}
