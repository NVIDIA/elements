import { LitElement, html, nothing, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { Icon } from '@elements/elements/icon';
import { IconButton } from '@elements/elements/icon-button/icon-button';
import { attachInternals, useStyles, associateLabel, assoicateAriaDescribedBy, associateDataList, appendRootNodeStyle, getAttributeListChanges, I18nController } from '@elements/elements/internal';
import { ControlMessage } from '../control-message/control-message.js';
import { setupControlValidationStates, setupControlStates, setupControlStatusStates, inputQuery } from '../utils/states.js';
import { setupControlLayoutStates, isInlineInputType } from '../utils/layout.js';
import globalStyles from './control.global.css?inline';
import styles from './control.css?inline';

/**
 * @element nve-control
 * @since 0.3.0
 * @entrypoint \@elements/elements/forms
 * @slot - Control input element
 * @slot label - Label element
 * @cssprop --cursor
 * @cssprop --accent-color
 * @cssprop --color
 * @cssprop --label-color
 * @cssprop --label-width
 * @cssprop --control-width
 * @cssprop --control-height
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/foundations-forms-controls--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-43&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
 * @package true
 */
export class Control extends LitElement {
  /** Set current visaul state for control. This overrides any validation states active. */
  @property({ type: String }) status: 'warning' | 'error' | 'success' | 'disabled';

  /** Set current control + label + control message layout. Layouts will collapse based on available container space. */
  @property({ type: String, reflect: true }) layout: 'vertical' | 'vertical-inline' | 'horizontal' | 'horizontal-inline';

  /** Sets the input to match the width of the active text content of the control value. Only applicable to vertical input box type controls (input, select) */
  @property({ type: Boolean, reflect: true, attribute: 'fit-text' }) fitText = false;

  /** Sets the input to match native default content block */
  @property({ type: Boolean, reflect: true, attribute: 'fit-content' }) fitContent = false;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables internal string values to be updated for internationalization. */
  @property({ type: Object, attribute: 'nve-i18n' }) i18n = this.#i18nController.i18n;

  get #label() {
    return this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="label"]')?.assignedElements({ flatten: true })?.[0] as HTMLLabelElement;
  }

  get #messages() {
    return (this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="messages"]')?.assignedElements({ flatten: true }) ?? []) as ControlMessage[];
  }

  get #visibleMessages() {
    return this.#messages.filter(i => !i.hasAttribute('hidden'));
  }

  #input: HTMLInputElement;

  /** @private */
  get input() {
    if (!this.#input) {
      const slotted = this.querySelector('slot')?.assignedElements()?.find(i => i.matches(inputQuery)) ?? Array.from(this.shadowRoot.querySelector('slot')?.assignedElements({ flatten: true }) ?? []).find(i => i.matches(inputQuery));
      this.#input = (slotted ? slotted : this.querySelector(inputQuery)) as HTMLInputElement;
    }

    return this.#input;
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
    tag: 'nve-control',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'nve-icon': Icon,
    'nve-icon-button': IconButton
  }

  render() {
    return !this.inlineControl ? html`
      <div internal-host class=${classMap(this.styleStates)}>
        <slot name="label" ?hidden=${!this.#label}></slot>
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
    this.setAttribute('nve-control', '');
    this.setAttribute('nve-control', this.querySelector('[nve-control]') ? 'custom' : '');

    this.shadowRoot.addEventListener('slotchange', () => {
      this.#updateStyleStates();

      if (this.input && this.#observers.length === 0) {
        this.#setupInput();
        this.#setupFitText();
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observers.forEach(observer => observer.disconnect());
  }

  /** Resets control value to initial attribute value and clears any active validation rules. */
  reset() {
    this.input.value = this.input.getAttribute('value');
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('reset', { bubbles: true }));
  }

  #setupInput() {
    setupControlValidationStates(this, this.#messages);

    this.#observers.push(
      ...setupControlStates(this),
      ...setupControlStatusStates(this, this.#messages),
      setupControlLayoutStates(this),
      getAttributeListChanges(this, ['hidden', 'status'], () => this.#updateStyleStates())
    );

    this.#polyfillShowPicker();
    this.#updateAssociations();
    this.shadowRoot.addEventListener('slotchange', () => {
      this.#updateStyleStates();
      this.#updateAssociations();
    });
  }

  #setupFitText() {
    if (this.fitText) {
      this.#getCharacterWidth();
      this.input.addEventListener('input', () => this.#getCharacterWidth());
      this.input.addEventListener('change', () => this.#getCharacterWidth());
    }
  }

  #getCharacterWidth() {
    if (this.input.tagName === 'INPUT') {
      const offset = this.input.type !== 'text' ? 4 : 0;
      this.style.setProperty('--control-width', `${this.input.value.length + offset}ch`);
      this.input.style.setProperty('max-width', `${this.input.value.length + 2}ch`, 'important');
    } else if (this.input.tagName === 'SELECT') {
      this.style.setProperty('--control-width', `${(this.input.options[this.input.selectedIndex].textContent.length) + 4}ch`);
    }
  }

  #polyfillShowPicker() {
    if (!this.input.showPicker) {
      this.input.showPicker = () => this.input.focus();
    }
  }

  #updateStyleStates() {
    if (this.input) {
      this.inlineControl = isInlineInputType(this.input);
      this.toggleAttribute('multiple', this.input?.multiple);
      this.input?.hasAttribute('size') ? this.setAttribute('size', '') : this.removeAttribute('size');
      this.styleStates = { 'no-messages': !this.#visibleMessages.length, 'no-label': !this.#label, 'inline-control': this.inlineControl };
    }
  }

  #updateAssociations() {
    this.#assignLabel();
    associateLabel(this.#label, this.input);
    assoicateAriaDescribedBy(Array.from(this.#messages), this.input);
    associateDataList(this.querySelector<HTMLDataListElement>('datalist'), this.input);
  }

  #assignLabel() {
    const label = this.querySelector('label') || this.shadowRoot.querySelector('slot').assignedNodes({ flatten: true }).find((i: HTMLElement) => i.tagName === 'LABEL') as HTMLLabelElement;
    if (label) {
      label.slot = 'label';
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
