import { LitElement, html, PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { attachInternals, useStyles, associateLabel, assoicateAriaDescribedBy, associateDataList, appendRootNodeStyle } from '@elements/elements/internal';
import { ControlMessage } from '../control-message/control-message.js';
import { setupControlValidationStates, setupControlStates, setupControlStatusStates, inputQuery } from '../utils/states.js';
import { setupControlLayoutStates, isInlineInputType } from '../utils/layout.js';
import globalStyles from './control.global.css?inline';
import styles from './control.css?inline';

/**
 * @alpha
 * @element mlv-control
 */
export class Control extends LitElement {
  @property({ type: String }) status: 'warning' | 'error' | 'success' | 'disabled';

  @property({ type: String, reflect: true }) layout: 'vertical' | 'vertical-inline' | 'horizontal' | 'horizontal-inline';

  get #label() {
    return this.querySelector<HTMLLabelElement>('label');
  }

  get #messages() {
    return Array.from(this.querySelectorAll<ControlMessage>('mlv-control-message'));
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

  static styles = useStyles([styles]);

  /** @private */
  declare _internals: ElementInternals;

  #observers: (MutationObserver | ResizeObserver)[] = [];

  get #internalStyleStates() {
    return { 'no-messages': !this.#messages.length, 'no-label': !this.#label, 'inline-control': this.inlineControl };
  }

  render() {
    return !this.inlineControl ? html`
      <div internal-host class=${classMap(this.#internalStyleStates)}>
        ${this.#label ? html`<slot name="label"></slot>` : ''}
        <div input>
          ${this.prefixContent}
          <slot></slot>
          ${this.suffixContent}
        </div>
        <slot name="messages"></slot>
      </div>
    ` : html`
      <div internal-host class=${classMap(this.#internalStyleStates)}>
        <slot input></slot>
        <slot name="label"></slot>
        <slot name="messages"></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    appendRootNodeStyle(this, globalStyles);
  }
  
  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    this.setAttribute('mlv-control', '');
    this.inlineControl = isInlineInputType(this.input);
    setupControlValidationStates(this, this.#messages);
    this.#observers.push(
      ...setupControlStates(this),
      ...setupControlStatusStates(this, this.#messages),
      setupControlLayoutStates(this),
    );
    this.#updateAssociations();
    this.shadowRoot.addEventListener('slotchange', () => this.#updateAssociations());
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
