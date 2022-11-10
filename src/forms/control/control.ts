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

  @state() private styleStates = { 'no-messages': !this.#messages.length, 'no-label': !this.#label, 'inline-control': this.inlineControl };

  static styles = useStyles([styles]);

  /** @private */
  declare _internals: ElementInternals;

  #observers: (MutationObserver | ResizeObserver)[] = [];

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
  }

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    this.setAttribute('mlv-control', '');
    this.input?.multiple ? this.setAttribute('multiple', '') : this.removeAttribute('multiple');
    this.input?.size ? this.setAttribute('size', '') : this.removeAttribute('size');
    this.inlineControl = isInlineInputType(this.input);
    setupControlValidationStates(this, this.#messages);
    this.#observers.push(
      ...setupControlStates(this),
      ...setupControlStatusStates(this, this.#messages),
      setupControlLayoutStates(this),
    );

    this.#updateAssociations();
    this.#updateStyleStates();
    this.shadowRoot.addEventListener('slotchange', () => {
      this.#updateAssociations();
      this.#updateStyleStates();
    });
  }

  #updateStyleStates() {
    this.styleStates = { 'no-messages': !this.#messages.length, 'no-label': !this.#label, 'inline-control': this.inlineControl };
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
