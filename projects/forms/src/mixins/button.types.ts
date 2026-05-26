// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type ButtonType = 'button' | 'submit' | 'reset';
export type CurrentState = 'page' | 'step';
export type PopoverTargetAction = 'show' | 'hide' | 'toggle';

export interface ButtonFormControlMixinInstance {
  /**
   * Use for toggle button types.
   * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed
   * @attr pressed
   * @reflect
   */
  pressed: boolean;

  /**
   * Use for buttons that expand or collapse content.
   * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded
   * @attr expanded
   * @reflect
   */
  expanded: boolean;

  /**
   * Like input readonly, sets a button semantically as visual treatment only.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly
   * @attr readonly
   * @reflect
   */
  readOnly: boolean;

  /**
   * Use `readOnly`. The `readonly` attribute remains supported.
   * @deprecated Use `readOnly`. The `readonly` attribute remains supported.
   */
  readonly: boolean;

  /**
   * Like input form, sets a button to submit a form outside its parent form.
   * Returns a reference to the form element if available.
   * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/form
   * @attr form
   */
  form: HTMLFormElement | null | string;

  /**
   * The name of the button, submitted as a pair with the button value as part of the form data.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-name
   * @attr name
   * @reflect
   */
  name: string;

  /**
   * Defines the value associated with the button name when submitting form data.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-value
   * @attr value
   * @reflect
   */
  value: string;

  /**
   * Defines the button behavior when associated within a form element.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type
   * @attr type
   * @reflect
   */
  type: ButtonType;

  /**
   * Prevents the user from interacting with the button.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-disabled
   * @attr disabled
   * @reflect
   */
  disabled: boolean;

  /**
   * Sets selected state when the button belongs to a multi-choice selection group.
   * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-selected
   * @attr selected
   * @reflect
   */
  selected: boolean;

  /**
   * Sets the current state used to represent the current page or navigation link.
   * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current
   * @attr current
   * @reflect
   */
  current: CurrentState;

  /**
   * Establishes a relationship between a popover and its invoker button.
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/popoverTargetElement
   */
  popoverTargetElement: HTMLElement | null;

  /**
   * The id reference of the element that receives the popover.
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#popovertarget
   * @attr popovertarget
   * @reflect
   */
  popovertarget: string;

  /**
   * The popover target action to perform on the popover target element.
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/popoverTargetAction
   * @attr popovertargetaction
   * @reflect
   */
  popoverTargetAction: PopoverTargetAction;

  /**
   * The element that receives the command.
   * https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API
   * @attr commandfor
   * @reflect
   */
  commandForElement: HTMLElement | null;

  /**
   * The command to execute on the element.
   * https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API
   * @attr command
   * @reflect
   */
  command: string;

  /**
   * The element that receives the interest.
   * https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/interestForElement
   * @attr interestfor
   * @reflect
   */
  interestForElement: HTMLElement | null;

  _internals: ElementInternals;
}
