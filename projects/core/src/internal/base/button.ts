// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, isServer, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { stateActive } from '../controllers/state-active.controller.js';
import { stateDisabled } from '../controllers/state-disabled.controller.js';
import { stateExpanded } from '../controllers/state-expanded.controller.js';
import { statePressed } from '../controllers/state-pressed.controller.js';
import { stateSelected } from '../controllers/state-selected.controller.js';
import { typeButton } from '../controllers/type-button.controller.js';
import { typeAnchor } from '../controllers/type-anchor.controller.js';
import { typeSubmit } from '../controllers/type-submit.controller.js';
import { typeNativePopoverTrigger } from '../controllers/type-native-popover-trigger.controller.js';
import { stateCurrent } from '../controllers/state-current.controller.js';
import { typeCommand } from '../controllers/type-command.controller.js';
import { attachInternals } from '../utils/a11y.js';
import { typeInterest } from '../controllers/type-interest.controller.js';

/**
 * Standard button behaviors for custom elements.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/button/
 */
@typeButton<BaseButton>()
@typeAnchor<BaseButton>()
@typeSubmit<BaseButton & { form: HTMLFormElement | null }>() // override to exclude type string from getter, see comment in getter below
@typeNativePopoverTrigger<BaseButton>()
@typeCommand<BaseButton>()
@typeInterest<BaseButton>()
@stateActive<BaseButton>()
@stateCurrent<BaseButton>()
@statePressed<BaseButton>()
@stateSelected<BaseButton>()
@stateDisabled<BaseButton>()
@stateExpanded<BaseButton>()
export class BaseButton extends LitElement {
  static formAssociated = true;

  /**
   * Use for toggle button types.
   * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed
   */
  @property({ type: Boolean, reflect: true }) pressed: boolean;

  /**
   * Use for buttons that expand/collapse content.
   * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded
   */
  @property({ type: Boolean, reflect: true }) expanded: boolean;

  /**
   * Like input readonly, sets a button semantically as visual treatment only
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly
   */
  @property({ type: Boolean, reflect: true }) readonly: boolean;

  #form: string | HTMLFormElement | null = null;

  /**
   * Like input form, sets a button to submit a form outside its parent form.
   * Returns a reference to the form element if available.
   * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/form
   */
  @property({
    type: String,
    attribute: 'form',
    converter: {
      fromAttribute: (value: string) => value
    }
  })
  set form(form: string | HTMLFormElement) {
    this.#form = form;
    if (typeof form === 'string') {
      this.setAttribute('form', form);
    } else {
      this.removeAttribute('form');
    }
  }

  // eslint-disable-next-line @typescript-eslint/related-getter-setter-pairs
  get form(): HTMLFormElement | null | string {
    // string should drop from the type but without it the type does not derive from the setter correctly
    if (this.#form && typeof this.#form !== 'string') {
      return this.#form;
    } else if (typeof this.#form === 'string' && !isServer) {
      const rootNode = this.getRootNode() as Document | ShadowRoot;
      return rootNode.getElementById ? (rootNode.getElementById(this.#form) as HTMLFormElement) : null;
    } else {
      return this._internals?.form;
    }
  }

  /**
   * The name of the button, submitted as a pair with the button's value as part of the form data, when that button submits the form.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-name
   */
  @property({ type: String, reflect: true }) name: string;

  /**
   * Defines the value associated with the button's name when submitting the form data. The server receives this value in params when the form submits through this button.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-value
   */
  @property({ type: String, reflect: true }) value: string;

  /**
   * Defines the button behavior when associated within an <form> element.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type
   */
  @property({ type: String, reflect: true }) type: 'button' | 'submit' | 'reset';

  /**
   * This Boolean attribute prevents the user from interacting with the button: it cannot receive press or focus events.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-disabled
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * This Boolean attribute prevents the selected state when the button belongs to a multi-choice selection group
   * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-selected
   */
  @property({ type: Boolean, reflect: true }) selected: boolean;

  /**
   * This Boolean attribute sets the current state, used to represent the current page or navigation link
   * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current
   */
  @property({ type: String, reflect: true }) current: 'page' | 'step';

  /**
   * Establishing a relationship between a popover and its invoker button.
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/popoverTargetElement
   */
  @property({ type: Object }) popoverTargetElement: HTMLElement | null = null; // eslint-disable-line local/primitive-property

  /**
   * The idref of the element that receives the popover.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#popovertarget
   */
  @property({ type: String, attribute: 'popovertarget', reflect: true }) popovertarget: string;

  /**
   * The popover target action to perform on the popover target element.
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/popoverTargetAction
   */
  @property({ type: String, attribute: 'popovertargetaction', reflect: true })
  popoverTargetAction: 'show' | 'hide' | 'toggle';

  /**
   * The element that receives the command.
   * https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API
   */
  @property({ type: Object }) commandForElement: HTMLElement | null = null; // eslint-disable-line local/primitive-property

  /**
   * The idref of the element that receives the command.
   * https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API
   */
  @property({ type: String, attribute: 'commandfor', reflect: true }) commandfor: string | null = null;

  /**
   * The command to execute on the element.
   * https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API
   */
  @property({ type: String, attribute: 'command', reflect: true }) command: string;

  /**
   * The element that receives the interest.
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/interestForElement
   */
  @property({ type: Object }) interestForElement: HTMLElement | null = null; // eslint-disable-line local/primitive-property

  /**
   * The idref of the element that receives the interest.
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/interestForElement
   */
  @property({ type: String, reflect: true }) interestfor: string | null = null;

  /**
   * @private
   * An instance of `ElementInternals` that decorators/controllers set dynamically
   */
  declare _internals: ElementInternals;

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
  }

  render() {
    return html`<div internal-host><slot></slot></div>`;
  }
}
