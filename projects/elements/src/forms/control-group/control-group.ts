import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { attachInternals, useStyles, associateAriaLabel, assoicateAriaDescribedBy, associateControlGroup } from '@elements/elements/internal';
import { ControlMessage } from '../control-message/control-message.js';
import { setupControlStatusStates, setupControlGroupStates, inputQuery } from '../utils/states.js';
import { setupControlLayoutStates } from '../utils/layout.js';
import styles from './control-group.css?inline';

/**
 * @alpha
 * @element nve-control-group
 * @cssprop --color
 * @cssprop --label-color 
 * @cssprop --label-width
 */
export class ControlGroup extends LitElement {
  @property({ type: String, reflect: true }) layout: 'vertical' | 'vertical-inline' | 'horizontal' | 'horizontal-inline';;
  
  get label() {
    return this.querySelector<HTMLLabelElement>('label');
  }

  get inputs() {
    return this.querySelectorAll<HTMLInputElement>(inputQuery);
  }

  get #messages() {
    return Array.from(this.querySelectorAll<ControlMessage>('nve-control-message'));
  }

  static styles = useStyles([styles]);

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host class="${this.#messages.length ? '' : 'no-messages'} ${this.label ? '' : 'no-label'}">
        ${this.label ? html`<slot name="label"></slot>` : ''}
        <slot class="input-slot"></slot>
        ${this.#messages.length ? html`<slot name="messages"></slot>` : ''}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'group';
  }

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    setupControlGroupStates(this);
    setupControlLayoutStates(this);
    setupControlStatusStates(this, this.#messages);
    this.#updateAssociations();
    this.shadowRoot.addEventListener('slotchange', () => this.#updateAssociations());
  }

  #updateAssociations() {
    this.#assignLabel();
    associateAriaLabel(this.label, this);
    assoicateAriaDescribedBy(Array.from(this.querySelectorAll<ControlMessage>('nve-control-message')), this);
    associateControlGroup(Array.from(this.inputs));
  }

  #assignLabel() {
    if (this.label) {
      this.label.slot = 'label';
    }
  }
}
