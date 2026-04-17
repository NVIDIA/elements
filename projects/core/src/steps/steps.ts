// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { when } from 'lit/directives/when.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import type { KeynavListConfig, Container } from '@nvidia-elements/core/internal';
import {
  BaseButton,
  stateSelected,
  useStyles,
  keyNavigationList,
  attachInternals,
  audit,
  scopedRegistry
} from '@nvidia-elements/core/internal';
import stepsItemStyleSheet from './steps-item.css?inline';
import stepsStyleSheet from './steps.css?inline';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { ProgressRing } from '@nvidia-elements/core/progress-ring';

/**
 * @element nve-steps-item
 * @description Represents an individual step within a multi-step workflow, displaying its status and enabling navigation within the parent steps component.
 * @since 0.30.0
 * @entrypoint \@nvidia-elements/core/steps
 * @slot - default slot for step text
 * @slot status-icon - custom slotted step icon
 * @cssprop --font-size
 * @cssprop --border-top
 * @cssprop --width
 * @cssprop --font-size
 * @cssprop --font-weight
 * @cssprop --border-radius
 * @cssprop --color
 * @cssprop --text-transform
 * @csspart icon-button - The icon button element
 * @csspart progress-ring - The progress ring element
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 */
@audit()
@scopedRegistry()
@stateSelected<StepsItem>()
export class StepsItem extends BaseButton {
  /**
   * Determines which item the user selects, defaults to false.
   */
  @property({ type: Boolean, reflect: true }) selected = false;

  /**
   * Four visual treatments represent the `status` of tasks. When `status` has a value of `warning`, `success`, or `danger`, the component embeds appropriate icons.
   */
  @property({ type: String, reflect: true }) status?: 'accent' | 'danger' | 'success' | 'pending';

  /**
   * Determines whether the steps should display in condensed format with no text labels.
   */
  @property({ type: String, reflect: true }) container?: Extract<Container, 'condensed'>;

  /** @private */
  @state() index: number;

  static styles = useStyles([stepsItemStyleSheet]);

  static readonly metadata = {
    tag: 'nve-steps-item',
    version: '0.0.0',
    parents: ['nve-steps']
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton,
    [ProgressRing.metadata.tag]: ProgressRing
  };

  render() {
    return html`
      <div internal-host focus-within>  
        <slot name="status-icon">
          ${this.status === undefined ? html`<nve-icon-button part="icon-button" readonly id="number-icon" .disabled=${this.disabled}>${this.index}</nve-icon-button>` : ''}
          ${this.status === 'success' ? html`<nve-icon-button part="icon-button" readonly size="sm" interaction="emphasis" icon-name="check"></nve-icon-button>` : ''}
          ${this.status === 'danger' ? html`<nve-icon-button part="icon-button" readonly size="sm" interaction="destructive" icon-name="exclamation-circle"></nve-icon-button>` : ''}
          ${this.status === 'pending' ? html`<nve-progress-ring part="progress-ring" status="accent" size="sm"></nve-progress-ring>` : ''}
        </slot>
        ${when(this.container !== 'condensed', () => html`<slot></slot>`)}
      </div>
    `;
  }

  constructor() {
    super();
    this.type = 'button';
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'tab';
  }
}

/**
 * @element nve-steps
 * @description Steps enables a multi-step workflow allowing a user to complete a goal in a specific sequence.
 * @since 0.30.0
 * @entrypoint \@nvidia-elements/core/steps
 * @slot - default slot for steps-item
 * @cssprop --gap
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 */
@audit()
@keyNavigationList<Steps>()
export class Steps extends LitElement {
  /**
   * Determines whether the steps should display in a vertical layout vs. defaulting to horizontal.
   */
  @property({ type: Boolean, reflect: true }) vertical = false;

  /**
   * Determines whether the steps should display in condensed format with no text labels.
   */
  @property({ type: String, reflect: true }) container?: Extract<Container, 'condensed'>;

  /**
   * Determines whether the steps should handle selection behavior vs. defaults to off.
   */
  @property({ type: Boolean, attribute: 'behavior-select' }) behaviorSelect = false;

  static styles = useStyles([stepsStyleSheet]);

  static readonly metadata = {
    tag: 'nve-steps',
    version: '0.0.0',
    children: ['nve-steps-item']
  };

  /** @private */
  get keynavListConfig(): KeynavListConfig {
    return {
      items: this.steps,
      layout: this.vertical ? 'vertical' : 'horizontal'
    };
  }

  @queryAssignedElements({ selector: 'nve-steps-item, nve-steps-item' }) private steps!: StepsItem[];

  /** @private */
  declare _internals: ElementInternals;

  #selectTab(stepsItem: HTMLElement & { matches: Element['matches']; disabled?: boolean; selected?: boolean }) {
    if (!this.behaviorSelect || !stepsItem.matches('nve-steps-item, nve-steps-item') || stepsItem.disabled) {
      return;
    }

    this.keynavListConfig.items.forEach((i: HTMLElement) => ((i as StepsItem).selected = false));
    stepsItem.selected = true;
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
    this.addEventListener('click', (e: Event) =>
      this.#selectTab(e.target as HTMLElement & { matches: Element['matches']; disabled?: boolean; selected?: boolean })
    );
  }

  firstUpdated(props: PropertyValues<this>) {
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
