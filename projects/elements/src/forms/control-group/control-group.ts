import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { attachInternals, useStyles, associateAriaLabel, assoicateAriaDescribedBy, associateControlGroup } from '@elements/elements/internal';
import { ControlMessage } from '../control-message/control-message.js';
import { setupControlStatusStates, setupControlGroupStates, inputQuery } from '../utils/states.js';
import { setupControlLayoutStates } from '../utils/layout.js';
import styles from './control-group.css?inline';

/**
 * @element mlv-control-group
 * @since 0.3.0
 * @slot - Control input elements
 * @cssprop --color
 * @cssprop --label-color
 * @cssprop --label-width
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-input-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-43&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
 * @package true
 */
export class ControlGroup extends LitElement {
  /** Set each slotted control + label + control message layout */
  @property({ type: String, reflect: true }) layout: 'vertical' | 'vertical-inline' | 'horizontal' | 'horizontal-inline';

  get label() {
    return this.querySelector<HTMLLabelElement>('label');
  }

  get inputs() {
    return this.querySelectorAll<HTMLInputElement>(inputQuery);
  }

  get #messages() {
    return Array.from(this.querySelectorAll<ControlMessage>('mlv-control-message'));
  }

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-control-group',
    version: 'PACKAGE_VERSION'
  };

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
    assoicateAriaDescribedBy(Array.from(this.querySelectorAll<ControlMessage>('mlv-control-message')), this);
    associateControlGroup(Array.from(this.inputs));
  }

  #assignLabel() {
    if (this.label) {
      this.label.slot = 'label';
    }
  }
}
