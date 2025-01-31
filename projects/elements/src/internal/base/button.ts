import { html, LitElement } from 'lit';
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
import { attachInternals } from '../utils/a11y.js';

/**
 * Standard button behaviors for custom elements.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/button/
 */
@typeButton<BaseButton>()
@typeAnchor<BaseButton>()
@typeSubmit<BaseButton>()
@typeNativePopoverTrigger<BaseButton>()
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
   * Similar to input readonly, sets a button sematically as visual treatment only
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly
   */
  @property({ type: Boolean, reflect: true }) readonly: boolean;

  /**
   * Similar to input form, sets a button to submit a form outside its parent form
   * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/form
   */
  @property({ type: String, reflect: true }) form: string;

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

  @property({ type: Object }) popoverTargetElement: HTMLElement;

  @property({ type: String, attribute: 'popovertarget', reflect: true }) popovertarget: string;

  @property({ type: String, attribute: 'popovertargetaction', reflect: true }) popoverTargetAction:
    | 'show'
    | 'hide'
    | 'toggle';

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
