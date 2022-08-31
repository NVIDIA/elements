import { getAttributeChanges, getAttributeListChanges } from '@elements/elements/internal';
import { ControlGroup } from '../control-group/control-group.js';
import { ControlMessage } from '../control-message/control-message.js';
import { Control } from '../control/control.js';

export const inputQuery = 'input, select, selectmenu, textarea, [nve-control]';

export function isInlineInputType(input: HTMLInputElement) {
  return input.type === 'radio' || input.type === 'checkbox';
}

/**
 * Adds validation states to custom element
 * :--valid form control is in a valid state
 * :--invalid form control is in a invalid state
 * :--dirty form control has been edited
 * :--touched form control has been focused
 * :--focus form control is focused
 */
export function setupControlValidationStates(control: Control, messages: ControlMessage[]) {
  messages.filter(m => m.hasAttribute('error')).forEach(m => {
    m.setAttribute('hidden', '');
    m.status = 'error';
  });
  
  control.input.addEventListener('blur', () => {
    control.input.checkValidity();
    control._internals.states.delete('--touched');
    control._internals.states.delete('--focus');
  });

  control.input.addEventListener('invalid', () => {
    messages.forEach(m => m.setAttribute('hidden', ''));
    messages.find(m => control.input.validity[m.error])?.removeAttribute('hidden');
    control.status = 'error';
    control._internals.states.add('--invalid');
  });

  control.input.addEventListener('focus', () => {
    control._internals.states.add('--focus');
  });

  control.input.addEventListener('input', () => {
    control._internals.states.add('--dirty');

    if (control.input.validity.valid) {
      control._internals.states.delete('--invalid');
      control._internals.states.add('--valid');
      control.status = null;
      messages.filter(m =>!m.hasAttribute('error')).forEach(m => m.removeAttribute('hidden'));
    } else {
      control._internals.states.delete('--valid');
      control._internals.states.add('--invalid');
    }

    messages.filter(m => control.input.validity.valid && m.error && !control.input.validity[m.error]).forEach(m => m.setAttribute('hidden', ''));
  });
}

/**
 * Adds control interaction states to custom element
 * :--checked form control is in a checked state
 * :--disabled form control is in a disabled state
 * :--readonly form control is in a readonly state
 */
export function setupControlStates(control: Control) {
  const observers: MutationObserver[] = [];
  const states = control._internals.states;
  control.input.addEventListener('change', () => control.input.checked ? states.add('--checked') : states.delete('--checked'));
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
      if (target.tagName.toLocaleLowerCase() === 'nve-control-message') {
        updateControlStatusState(control, target);
      }
    }),
  );
  return observers;
}

function updateControlStatusState(control: Control | ControlGroup, message: ControlMessage) {
  control._internals.states.delete('--error');
  control._internals.states.delete('--success');

  if (message?.status?.length && !message?.hidden) {
    control._internals.states.add(`--${message.status}`);
  }
}

const layoutWeights = {
  'undefined': 0,
  'vertical': 0,
  'vertical-inline': 1,
  'horizontal': 2,
  'horizontal-inline': 3
};

export function setupControlLayoutStates(control: Control | ControlGroup) {
  const originalLayout = control.layout;
  const resizeObserver = new ResizeObserver((entries) => {
    const width = entries[0].contentRect.width;

    if (width < 300) {
      control.layout = 'vertical';
    } else if (width < 400) {
      control.layout = 'vertical-inline';
    } else if (width < 500) {
      control.layout = 'horizontal';
    } else if (width < 600) {
      control.layout = 'horizontal-inline';
    }

    if (layoutWeights[originalLayout] < layoutWeights[control.layout]) {
      control.layout = originalLayout;
    }
  });

  resizeObserver.observe(control);
  return resizeObserver;
}