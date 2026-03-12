import type { TemplateResult } from 'lit';
import { LitElement, html, nothing, isServer } from 'lit';
import { property } from 'lit/decorators/property.js';
import {
  attachInternals,
  useStyles,
  associateLabel,
  associateAriaDescribedBy,
  associateDataList,
  appendRootNodeStyle,
  getAttributeListChanges,
  I18nController,
  hostAttr,
  typeSSR
} from '@nvidia-elements/core/internal';
import type { ControlMessage } from '../control-message/control-message.js';
import {
  setupControlValidationStates,
  setupControlStates,
  setupControlStatusStates,
  inputQuery
} from '../utils/states.js';
import { setupControlLayoutStates } from '../utils/layout.js';
import globalStyles from './control.global.css?inline';
import styles from './control.css?inline';

/**
 * @element nve-control
 * @description Wraps a form input with its associated label and validation messages, managing layout and accessibility associations.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/forms
 * @slot - Control input element
 * @slot label - Label element
 * @cssprop --cursor
 * @cssprop --accent-color
 * @cssprop --color
 * @cssprop --label-color
 * @cssprop --label-width
 * @cssprop --label-font-weight
 * @cssprop --label-font-size
 * @cssprop --control-width
 * @cssprop --control-height

 * @aria https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
 * @package true
 */
@typeSSR()
export class Control extends LitElement {
  /** Set current visaul state for control. This overrides any validation states active. */
  @property({ type: String }) status: 'warning' | 'error' | 'success' | 'disabled';

  /** Set current control + label + control message layout. Layouts will collapse based on available container space. */
  @property({ type: String, reflect: true }) layout:
    | 'vertical'
    | 'vertical-inline'
    | 'horizontal'
    | 'horizontal-inline';

  /** Sets the input to match the width of the active text content of the control value. Only applicable to vertical input box type controls (input, select) */
  @property({ type: Boolean, reflect: true, attribute: 'fit-text' }) fitText = false;

  /** Sets the input to match native default content block */
  @property({ type: Boolean, reflect: true, attribute: 'fit-content' }) fitContent = false;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables internal string values to update for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  /** Set the visual prominence of the control */
  @property({ type: String, reflect: true }) prominence: 'muted';

  get #label() {
    return this.shadowRoot
      ?.querySelector<HTMLSlotElement>('slot[name="label"]')
      ?.assignedElements({ flatten: true })?.[0] as HTMLLabelElement;
  }

  get #messages() {
    return (this.shadowRoot
      ?.querySelector<HTMLSlotElement>('slot[name="messages"]')
      ?.assignedElements({ flatten: true }) ?? []) as ControlMessage[];
  }

  #input: HTMLInputElement;

  /** @private */
  get input(): HTMLInputElement {
    if (!isServer && !this.#input) {
      const slotted =
        this.querySelector('slot')
          ?.assignedElements()
          ?.find(i => i.matches(inputQuery)) ??
        Array.from(this.shadowRoot!.querySelector('slot')?.assignedElements({ flatten: true }) ?? []).find(i =>
          i.matches(inputQuery)
        );
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

  @hostAttr({ attribute: 'nve-control' }) protected nveControl = '';

  /** @private */
  declare _internals: ElementInternals;

  #observers: (MutationObserver | ResizeObserver)[] = [];

  protected _associateDatalist = true;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-control',
    version: '0.0.0'
  };

  render() {
    return this.nveControl !== 'inline'
      ? html`
      <div internal-host part="_internal-host">
        <slot name="label" part="_label"></slot>
        <div input part="_input">
          ${this.prefixContent}
          <slot></slot>
          ${this.suffixContent}
        </div>
        <slot name="messages" part="_messages"></slot>
      </div>
    `
      : html`
      <div internal-host part="_internal-host">
        <div input part="_input"><slot interaction-state></slot></div>
        <slot name="label" part="_label"></slot>
        <slot name="messages" part="_messages"></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    appendRootNodeStyle(this, globalStyles);

    this.shadowRoot!.addEventListener('slotchange', () => {
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
    this.input.value = this.input.getAttribute('value') ?? '';
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('reset', { bubbles: true, composed: true }));
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
    this.shadowRoot!.addEventListener('slotchange', () => {
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
      this.style.setProperty(
        '--control-width',
        `${(this.input as unknown as HTMLSelectElement).options[(this.input as unknown as HTMLSelectElement).selectedIndex]!.textContent!.length + 4}ch`
      );
    }
  }

  #polyfillShowPicker() {
    if (!this.input.showPicker) {
      this.input.showPicker = () => this.input.focus();
    }
  }

  #updateStyleStates() {
    if (this.input) {
      this.toggleAttribute('multiple', this.input?.multiple);
      this.input?.hasAttribute('size') ? this.setAttribute('size', '') : this.removeAttribute('size');
    }
  }

  #updateAssociations() {
    this.#assignLabel();
    associateLabel(this.#label, this.input);
    associateAriaDescribedBy(Array.from(this.#messages), this.input);

    if (this._associateDatalist) {
      associateDataList(this.querySelector<HTMLDataListElement>('datalist')!, this.input);
    }
  }

  #assignLabel() {
    const label =
      this.querySelector('label') ||
      (this.shadowRoot!.querySelector('slot')!
        .assignedNodes({ flatten: true })
        .find((i: Node) => (i as HTMLElement).tagName === 'LABEL') as HTMLLabelElement);
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
