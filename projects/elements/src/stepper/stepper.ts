import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { when } from 'lit/directives/when.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import {
  BaseButton,
  stateSelected,
  useStyles,
  keyNavigationList,
  KeynavListConfig,
  attachInternals,
  SupportStatus,
  Container
} from '@nvidia-elements/core/internal';
import stepperItemStyleSheet from './stepper-item.css?inline';
import stepperStyleSheet from './stepper.css?inline';

import { IconButton } from '@nvidia-elements/core/icon-button';
import { ProgressRing } from '@nvidia-elements/core/progress-ring';
import '@nvidia-elements/core/progress-ring/define.js';
import '@nvidia-elements/core/icon-button/define.js';

/**
 * @element mlv-stepper-item
 * @since 0.30.0
 * @slot - default slot for step text
 * @slot - status-icon custom slotted step icon
 * @cssprop --font-size
 * @cssprop --border-width
 * @cssprop --border-height
 * @cssprop --border-top
 * @cssprop --width
 * @cssprop --font-size
 * @cssprop --font-weight
 * @cssprop --border-radius
 * @cssprop --color
 * @cssprop --height
 * @cssprop --cursor
 * @cssprop --text-transform
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-stepper-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=121-5453&mode=design&t=SR1GmFYykivamkZc-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 * @unitTests false
 * @vqa false
 */
@stateSelected<StepperItem>()
export class StepperItem extends BaseButton {
  /**
   * Determines which tab item is selected, defaults to false.
   */
  @property({ type: Boolean, reflect: true }) selected = false;
  /**
   * There are four visual treatments that represent the `status` of varius tasks. When `status` is set to `warning`, `success` or `danger`, appropriate icons are embedded.
   */
  @property({ type: String, reflect: true }) status?: SupportStatus | 'pending';
  /**
   * Determines whether or not the stepper should display in condensed format with no text labels.
   */
  @property({ type: String, reflect: true }) container?: Container = 'condensed';

  @property({ type: Number }) index;

  static styles = useStyles([stepperItemStyleSheet]);

  static readonly metadata = {
    tag: 'mlv-stepper-item',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton,
    [ProgressRing.metadata.tag]: ProgressRing
  };

  render() {
    return html`
      <div internal-host focus-within>  
        <slot name="status-icon">
          ${this.status === undefined ? html`<mlv-icon-button readonly id="number-icon" .disabled=${this.disabled}>${this.index}</mlv-icon-button>` : ''}
          ${this.status === 'success' ? html`<mlv-icon-button readonly size="sm" interaction="emphasis" icon-name="check"></mlv-icon-button>` : ''}
          ${this.status === 'danger' ? html`<mlv-icon-button readonly size="sm" interaction="destructive" icon-name="exclamation-circle"></mlv-icon-button>` : ''}
          ${this.status === 'pending' ? html`<mlv-progress-ring status="accent" size="sm"></mlv-progress-ring>` : ''}
        </slot>
        ${when(this.container !== 'condensed', () => html`<slot></slot>`)}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'tab';
  }
}

/**
 * @element mlv-stepper
 * @description Stepper enables a multi-step workflow allowing a user to complete a goal in a specefic sequence.
 * @since 0.30.0
 * @slot - default slot for mlv-tab-item
 * @cssprop --gap
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-stepper-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-55&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 * @unitTests false
 * @vqa false
 * @package false
 * @stable false
 */
@keyNavigationList<Stepper>()
export class Stepper extends LitElement {
  /**
   * Determines whether or not the stepper should display in a vertical layout vs. defaulting to horizontal.
   */
  @property({ type: Boolean, reflect: true }) vertical = false;

  /**
   * Determines whether or not the stepper should display in condensed format with no text labels.
   */
  @property({ type: String, reflect: true }) container?: Container;

  /**
   * Determines whether or not the stepper should handle selection behavior vs. defaults to off.
   */
  @property({ type: Boolean, attribute: 'behavior-select' }) behaviorSelect = false;

  static styles = useStyles([stepperStyleSheet]);

  static readonly metadata = {
    tag: 'mlv-stepper',
    version: '0.0.0'
  };

  /** @private */
  get keynavListConfig(): KeynavListConfig {
    return {
      items: this.steps,
      layout: this.vertical ? 'vertical' : 'horizontal'
    };
  }

  @queryAssignedElements() private steps!: StepperItem[];

  /** @private */
  declare _internals: ElementInternals;

  #selectTab(stepperItem) {
    if (!this.behaviorSelect || stepperItem.tagName !== 'MLV-STEPPER-ITEM' || stepperItem.disabled) {
      return;
    }

    this.keynavListConfig.items.forEach((i: StepperItem) => (i.selected = false));
    stepperItem.selected = true;
  }

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'tablist';
    this.addEventListener('click', (e: CustomEvent) => this.#selectTab(e.target));
  }

  firstUpdated(props) {
    super.firstUpdated(props);

    this.steps.forEach((item, i) => {
      item.index = i + 1;
    });
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this.#updateChildAttributes();
    this._internals.ariaOrientation = this.vertical ? 'vertical' : 'horizontal';
  }

  #updateChildAttributes() {
    this.steps.forEach(stepItem => (stepItem.container = this.container));
  }
}
