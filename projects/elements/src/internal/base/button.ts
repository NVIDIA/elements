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
@stateActive<BaseButton>()
@stateCurrent<BaseButton>()
@statePressed<BaseButton>()
@stateSelected<BaseButton>()
@stateDisabled<BaseButton>()
@stateExpanded<BaseButton>()
export class BaseButton extends LitElement {
  static formAssociated = true;

  /**
   * Use for buttons that are toggle button types.
   * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed
   */
  @property({ type: Boolean, reflect: true }) pressed: boolean;

  /**
   * Use for button that are used for expanding/collapsing content.
   * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded
   */
  @property({ type: Boolean, reflect: true }) expanded: boolean;

  /**
   * Similar to input readonly, sets a button semantically as visual treatment only
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly
   */
  @property({ type: Boolean, reflect: true }) readonly: boolean;

  #form: string | HTMLFormElement = null;

  /**
   * Similar to input form, sets a button to submit a form outside its parent form.
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

  get form(): HTMLFormElement | null | string {
    // string should be removed but without it the type is not derived from the setter correctly
    if (this.#form && typeof this.#form !== 'string') {
      return this.#form;
    } else if (typeof this.#form === 'string' && !isServer) {
      return (this.getRootNode() as Document | ShadowRoot).getElementById(this.#form) as HTMLFormElement;
    } else {
      return this._internals?.form;
    }
  }

  /**
   * The name of the button, submitted as a pair with the button's value as part of the form data, when that button is used to submit the form.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-name
   */
  @property({ type: String, reflect: true }) name: string;

  /**
   * Defines the value associated with the button's name when it's submitted with the form data. This value is passed to the server in params when the form is submitted using this button.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-value
   */
  @property({ type: String, reflect: true }) value: string;

  /**
   * Defines the button behavior when associated within an <form> element.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type
   */
  @property({ type: String, reflect: true }) type: 'button' | 'submit' | 'reset';

  /**
   * This Boolean attribute prevents the user from interacting with the button: it cannot be pressed or focused.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-disabled
   */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * This Boolean attribute prevents the selected state if button is part of a multi choice selection group
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
  @property({ type: Object }) popoverTargetElement: HTMLElement; // eslint-disable-line local/primitive-property

  /**
   * The id of the element to which the popover is applied.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#popovertarget
   */
  @property({ type: String, attribute: 'popovertarget', reflect: true }) popovertarget: string;

  /**
   * The popover target action to be applied to the popover target element.
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/popoverTargetAction
   */
  @property({ type: String, attribute: 'popovertargetaction', reflect: true }) popoverTargetAction:
    | 'show'
    | 'hide'
    | 'toggle';

  /**
   * The id of the element to which the command is applied.
   * https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API
   */
  @property({ type: String, attribute: 'commandfor', reflect: true }) commandFor: string;

  /**
   * The command to be applied to the element.
   * https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API
   */
  @property({ type: String, attribute: 'command', reflect: true }) command: string;

  /**
   * @private
   * A instance of `ElementInternals` that is set dynamically by the applied decorators/controllers
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
