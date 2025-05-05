import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import {
  attachInternals,
  useStyles,
  associateAriaLabel,
  associateAriaDescribedBy,
  associateControlGroup,
  tagSelector
} from '@nvidia-elements/core/internal';
import type { ControlMessage } from '../control-message/control-message.js';
import { setupControlStatusStates, setupControlGroupStates, inputQuery } from '../utils/states.js';
import { setupControlLayoutStates } from '../utils/layout.js';
import styles from './control-group.css?inline';

/**
 * @element nve-control-group
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/forms
 * @slot - Control input elements
 * @cssprop --color
 * @cssprop --label-color
 * @cssprop --label-width
 * @storybook https://NVIDIA.github.io/elements/docs/elements/input/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-43&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
 * @package true
 */
export class ControlGroup extends LitElement {
  /** Set each slotted control + label + control message layout */
  @property({ type: String, reflect: true }) layout:
    | 'vertical'
    | 'vertical-inline'
    | 'horizontal'
    | 'horizontal-inline';

  get label() {
    return this.querySelector?.<HTMLLabelElement>('label');
  }

  get inputs() {
    return this.querySelectorAll ? Array.from(this.querySelectorAll<HTMLInputElement>(inputQuery)) : [];
  }

  get #messages() {
    return this.querySelectorAll
      ? Array.from(this.querySelectorAll<ControlMessage>(tagSelector('nve-control-message')))
      : [];
  }

  #observers: (MutationObserver | ResizeObserver)[] = [];

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-control-group',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host class="${this.#messages.length ? '' : 'no-messages'} ${this.label ? '' : 'no-label'}">
        <slot name="label"></slot>
        <slot class="input-slot"></slot>
        <slot name="messages"></slot>
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
    this.#observers = [
      setupControlGroupStates(this),
      setupControlLayoutStates(this),
      ...setupControlStatusStates(this, this.#messages)
    ];
    this.#updateAssociations();
    this.shadowRoot.addEventListener('slotchange', () => this.#updateAssociations());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observers.forEach(observer => observer.disconnect());
  }

  #updateAssociations() {
    this.#assignLabel();
    associateAriaLabel(this.label, this);
    associateAriaDescribedBy(
      Array.from(this.querySelectorAll<ControlMessage>(tagSelector('nve-control-message'))),
      this
    );
    associateControlGroup(Array.from(this.inputs));
  }

  #assignLabel() {
    if (this.label) {
      this.label.slot = 'label';
    }
  }
}
