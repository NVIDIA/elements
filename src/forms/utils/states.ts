import { getAttributeChanges, getAttributeListChanges } from '@elements/elements/internal';
import { ControlGroup } from '../control-group/control-group.js';
import { ControlMessage } from '../control-message/control-message.js';
import { Control } from '../control/control.js';
import { hideAllControlMessages, hideAllValidationMessages, hideInactiveValidationMessages, showActiveValidationMessages, showNonValidationMessages } from './messages.js';

export const inputQuery = 'input, select, selectmenu, textarea, [mlv-control]';

/**
 * Adds validation states to custom element
 * :--valid form control is in a valid state
 * :--invalid form control is in a invalid state
 */
export function setupControlValidationStates(control: Control, messages: ControlMessage[]) {
  if (!control.input.form?.noValidate && !control.input.formNoValidate && !control.input.hasAttribute('formnovalidate')) {
    hideAllValidationMessages(messages);

    control.input.addEventListener('blur', () => control.input.checkValidity());

    control.input.addEventListener('invalid', () => {
      if (messages.find(m => m.error)) {
        hideAllControlMessages(messages);
        showActiveValidationMessages(control, messages);
      }

      control.status = 'error';
      control._internals.states.delete('--valid');
      control._internals.states.add('--invalid');
    });

    control.input.addEventListener('input', () => {
      if (control.input.validity.valid) {
        control._internals.states.delete('--invalid');
        control._internals.states.add('--valid');
        control.status = null;
        showNonValidationMessages(messages);
      }

      hideInactiveValidationMessages(control,  messages);
    });
  } else {
    control.shadowRoot.addEventListener('slotchange', () => {
      const messages = Array.from(control.querySelectorAll<ControlMessage>('mlv-control-message'));
      if (messages.find(m => m.status === 'error')) {
        control._internals.states.delete('--valid');
        control._internals.states.add('--invalid');
      } else {
        control._internals.states.delete('--invalid');
        control._internals.states.add('--valid');
      }
    });
  }
}

/**
 * Adds control interaction states to custom element
 * :--checked form control is in a checked state
 * :--disabled form control is in a disabled state
 * :--readonly form control is in a readonly state
 * :--touched form control was focused and then blurred
 * :--dirty form control was modified by user
 */
export function setupControlStates(control: Control) {
  const observers: MutationObserver[] = [];
  const states = control._internals.states;
  control.input.checked ? states.add('--checked') : states.delete('--checked');
  control.input.addEventListener('change', () => control.input.checked ? states.add('--checked') : states.delete('--checked'));
  control.input.addEventListener('focus', () => control._internals.states.add('--focus'));
  control.input.addEventListener('input', () => control._internals.states.add('--dirty'));
  control.input.addEventListener('blur', () => {
    control._internals.states.add('--touched');
    control._internals.states.delete('--focus');
  });

  observers.push(
    getAttributeChanges(control.input, 'readonly', value => (value === '' ? true : value) ? states.add('--readonly') : states.delete('--readonly')),
    getAttributeChanges(control.input, 'checked', value => (value === '' ? true : value) ? states.add('--checked') : states.delete('--checked')),
    getAttributeChanges(control.input, 'disabled', value => (value === '' ? true : value) ? states.add('--disabled') : states.delete('--disabled')),
  );
  return observers;
}

/**
 * Adds control group interaction states to custom element
 * :--disabled any form control within group is in a disabled state
 */
 export function setupControlGroupStates(controlGroup: ControlGroup) {
  const inputs = Array.from(controlGroup.inputs);
  if (inputs.filter(i => !i.disabled).length === 0) {
    controlGroup._internals.states.add('--disabled');
  }

  const observers: MutationObserver[] = [];
  observers.push(
    getAttributeChanges(controlGroup, 'disabled', () => {
      if (inputs.filter(i => !i.disabled).length === 0) {
        controlGroup._internals.states.add('--disabled');
      } else {
        controlGroup._internals.states.delete('--disabled');
      }
    }),
  );
  return observers;
}

/**
 * Adds control status states to custom element
 * :--error form control is in a error state
 * :--success form control is in a success state
 */
export function setupControlStatusStates(control: Control | ControlGroup, messages: ControlMessage[]) {
  updateControlStatusState(control, messages.find(m => !m.hidden));
  const observers: MutationObserver[] = [];
  observers.push(
    getAttributeListChanges(control, ['hidden', 'status'], mutation => {
      const target = mutation.target as ControlMessage;
      if (target.tagName.toLocaleLowerCase() === 'mlv-control-message') {
        updateControlStatusState(control, target);
      }
    }),
  );
  return observers;
}

export function updateControlStatusState(control: Control | ControlGroup, message: ControlMessage) {
  control._internals.states.delete('--error');
  control._internals.states.delete('--success');

  if (message?.status?.length && !message?.hidden) {
    control._internals.states.add(`--${message.status}`);
  }
}
