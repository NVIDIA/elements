import { LitElement, html, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { attachInternals, useStyles, associateLabel, assoicateAriaDescribedBy, associateDataList } from '@elements/elements/internal';
import { ControlMessage } from '../control-message/control-message.js';
import { setupControlValidationStates, setupControlStates, setupControlStatusStates, inputQuery, isInlineInputType, setupControlLayoutStates } from '../utils/index.js';
import styles from './control.css?inline';

/**
 * @alpha
 * @element nve-control
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

  render() {
    return !this.inlineControl ? html`
      <div internal-host class="${this.#messages.length ? '' : 'no-messages'}">
        ${this.#label ? html`<slot name="label"></slot>` : ''}
        <div input>
          ${this.prefixContent}
          <slot></slot>
          ${this.suffixContent}
        </div>
        <slot name="messages"></slot>
      </div>
    ` : html`
      <div internal-host class="inline-control ${this.#messages.length ? '' : 'no-messages'}">
        <slot input></slot>
        <slot name="label"></slot>
        <slot name="messages"></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
  }

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    this.setAttribute('nve-control', '');
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
