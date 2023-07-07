import { LitElement, html, PropertyValues, nothing, TemplateResult } from 'lit';
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
 * @element mlv-control
 * @cssprop --cursor
 * @cssprop --accent-color
 * @cssprop --color
 * @cssprop --label-color
 * @cssprop --label-width
 * @cssprop --control-width
 * @cssprop --control-height
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/foundations-forms-controls--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-43&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
 * @package true
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

  get #visibleMessages() {
    return this.#messages.filter(i => !i.hasAttribute('hidden'));
  }

  /** @private */
  get input() {
    return this.querySelector<HTMLInputElement>(inputQuery);
  }

  /** @private */
  protected get prefixContent(): typeof nothing | TemplateResult {
    return nothing;
  }

  /** @private */
  protected get suffixContent(): typeof nothing | TemplateResult {
    return nothing;
  }

  @state() private inlineControl = false;

  @state() private styleStates = { 'no-messages': !this.#visibleMessages.length, 'no-label': !this.#label, 'inline-control': this.inlineControl };

  /** @private */
  declare _internals: ElementInternals;

  #observers: (MutationObserver | ResizeObserver)[] = [];

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-control',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'mlv-icon': Icon,
    'mlv-icon-button': IconButton
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

    if (!this.input.showPicker) {
      this.input.showPicker = () => this.input.focus();
    }
  }

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    this.setAttribute('mlv-control', '');
    this.setAttribute('mlv-control', this.querySelector('[mlv-control]') ? 'custom' : '');
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
    this.toggleAttribute('multiple', this.input?.multiple);
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

  protected showPicker() {
    try {
      this.input.showPicker();
    } catch {
      // 
    }
  }
}
