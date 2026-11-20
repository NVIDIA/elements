// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  getAttributeChanges,
  getAttributeListChanges,
  getElementUpdate,
  matchesElementName
} from '@nvidia-elements/core/internal';
import type { ControlGroup } from '../control-group/control-group.js';
import { ControlMessage } from '../control-message/control-message.js';
import type { Control } from '../control/control.js';

export const inputQuery = 'input, select, selectmenu, textarea, [nve-control]';
export interface ControlStateCleanup {
  disconnect: () => void;
}

interface InputValidationBinding {
  input?: HTMLInputElement;
  nativeMessage?: ControlMessage;
}

const validationBindings = new WeakMap<Control, InputValidationBinding>();

function getInputValidationBinding(control: Control) {
  let binding = validationBindings.get(control);
  if (!binding) {
    binding = { input: control.input };
    validationBindings.set(control, binding);
  }
  return binding;
}

export function releaseInputValidation(control: Control, messages: ControlMessage[]) {
  const binding = validationBindings.get(control);
  if (!binding?.input) return;

  if (binding.nativeMessage && messages.includes(binding.nativeMessage)) {
    binding.nativeMessage.hidden = true;
  }
  binding.nativeMessage = undefined;
  binding.input = undefined;
  clearValidityState(control);
}

function clearValidityState(control: Control) {
  control._internals.states.delete('valid');
  control._internals.states.delete('invalid');
}

function setValidityState(control: Control, state: 'valid' | 'invalid') {
  const states = control._internals.states;
  states.delete(state === 'valid' ? 'invalid' : 'valid');
  states.add(state);
}

function syncValidityFromMessages(control: Control, messages: ControlMessage[]) {
  const hasError = messages.some(message => !message.hidden && (message.status === 'error' || message.error));
  setValidityState(control, hasError ? 'invalid' : 'valid');
}

function syncSlottedMessageValidity(control: Control) {
  const messages = Array.from(control.querySelectorAll<ControlMessage>(ControlMessage.metadata.tag));
  syncValidityFromMessages(control, messages);
}

/**
 * Adds validation states to custom element
 * :state(valid) form control is in a valid state
 * :state(invalid) form control is in a invalid state
 */
// eslint-disable-next-line max-lines-per-function
export function setupControlValidationStates(control: Control, messages: ControlMessage[]) {
  const cleanups: ControlStateCleanup[] = [];
  const binding = getInputValidationBinding(control);

  if (
    !control.input.form?.noValidate &&
    !control.input.formNoValidate &&
    !control.input.hasAttribute('formnovalidate')
  ) {
    hideAllValidationMessages(messages);

    /**
     * updateValidityState() logic triggered by input blur() or input() change events
     */
    const updateValidityState = () => {
      if (control.input.validity?.valid) {
        binding.nativeMessage = undefined;
        setValidityState(control, 'valid');
        control.status = null!;
      }

      hideInactiveValidationMessages(control, messages);
    };

    const resetValidityState = () => {
      binding.nativeMessage = undefined;
      control.status = null!;
      clearValidityState(control);
      hideAllValidationMessages(messages);
    };

    const onInvalid = () => {
      if (messages.find(m => m.error)) {
        hideAllValidationMessages(messages);
        const message = messages.find(({ error }) => error && control.input.validity[error]);
        binding.nativeMessage = message;
        message?.removeAttribute('hidden');
      }

      control.status = 'error';
      setValidityState(control, 'invalid');
    };

    cleanups.push(
      addCleanupListener(control.input, 'blur', () => {
        control.input.checkValidity();
        updateValidityState();
      }),
      addCleanupListener(control.input, 'input', updateValidityState),
      addCleanupListener(control.input, 'invalid', onInvalid),
      addCleanupListener(control, 'reset', resetValidityState)
    );

    if (control.input.form) {
      cleanups.push(addCleanupListener(control.input.form, 'reset', resetValidityState));
    }
  }

  if (binding.input !== control.input) {
    binding.input = control.input;
    syncValidityFromMessages(control, messages);
  }
  cleanups.push(addCleanupListener(control.shadowRoot!, 'slotchange', () => syncSlottedMessageValidity(control)));
  return cleanups;
}

/**
 * Adds control interaction states to custom element
 * :state(checked) form control is in a checked state
 * :state(disabled) form control is in a disabled state
 * :state(readonly) form control is in a readonly state
 * :state(touched) form control received focus and then blurred
 * :state(dirty) user modified the form control
 */
export function setupControlStates(control: Control) {
  const observers: ControlStateCleanup[] = [];
  const states = control._internals.states;
  control.input.checked ? states.add('checked') : states.delete('checked');
  control.input.indeterminate ? states.add('indeterminate') : states.delete('indeterminate');

  observers.push(...addControlInteractionListeners(control));
  observers.push(
    getElementUpdate(control.input, 'readonly', value =>
      (value === '' ? true : value) ? states.add('readonly') : states.delete('readonly')
    ),
    getElementUpdate(control.input, 'checked', () =>
      control.input.checked ? states.add('checked') : states.delete('checked')
    ),
    getElementUpdate(control.input, 'disabled', value =>
      (value === '' ? true : value) ? states.add('disabled') : states.delete('disabled')
    ),
    getElementUpdate(control.input, 'indeterminate', () =>
      control.input.indeterminate ? states.add('indeterminate') : states.delete('indeterminate')
    )
  );
  return observers;
}

function addControlInteractionListeners(control: Control): ControlStateCleanup[] {
  const cleanups: ControlStateCleanup[] = [];
  const states = control._internals.states;
  const onFocus = () => control._internals.states.add('focus');
  const onInput = () => control._internals.states.add('dirty');
  const onBlur = () => {
    control._internals.states.add('touched');
    control._internals.states.delete('focus');
  };

  const onRootChange = (e: Event) => {
    if ((e.target as HTMLInputElement).name === control.input?.name) {
      control.input.checked ? states.add('checked') : states.delete('checked');
    }
  };

  const onFormReset = () => {
    control._internals.states.delete('touched');
    control._internals.states.delete('dirty');
    control._internals.states.delete('error');
    control._internals.states.delete('success');
    control.requestUpdate();
  };

  cleanups.push(
    addCleanupListener(control.input, 'focus', onFocus),
    addCleanupListener(control.input, 'input', onInput),
    addCleanupListener(control.input, 'blur', onBlur),
    addCleanupListener(control.input.getRootNode(), 'change', onRootChange)
  );

  if (control.input.form) {
    cleanups.push(addCleanupListener(control.input.form, 'reset', onFormReset));
  }

  return cleanups;
}

/**
 * Adds control group interaction states to custom element
 * :state(disabled) any form control within group is in a disabled state
 */
export function setupControlGroupStates(controlGroup: ControlGroup) {
  toggleControlGroupDisabledState(controlGroup);
  return getAttributeChanges(controlGroup, 'disabled', () => toggleControlGroupDisabledState(controlGroup));
}

function toggleControlGroupDisabledState(controlGroup: ControlGroup) {
  if (Array.from(controlGroup.inputs).find(i => i.disabled)) {
    controlGroup._internals.states.add('disabled');
  } else {
    controlGroup._internals.states.delete('disabled');
  }
}

/**
 * Adds control status states to custom element
 * :state(error) form control is in a error state
 * :state(success) form control is in a success state
 */
export function setupControlStatusStates(control: Control | ControlGroup, messages: ControlMessage[]) {
  updateControlStatusState(control, messages.find(m => !m.hidden)!);
  const observers: ControlStateCleanup[] = [];
  observers.push(
    getAttributeListChanges(control, ['hidden', 'status'], mutation => {
      const target = mutation.target as ControlMessage;
      if (matchesElementName(target, ControlMessage)) {
        updateControlStatusState(control, target);
      }
    })
  );

  const onSlotChange = () => {
    const current = Array.from(control.querySelectorAll<ControlMessage>(ControlMessage.metadata.tag));
    const message = current.find(m => m.status && !m.hidden);
    control._internals.states.delete('error');
    control._internals.states.delete('success');
    if (message) {
      control._internals.states.add(message.status!);
    }
  };
  observers.push(addCleanupListener(control.shadowRoot!, 'slotchange', onSlotChange));

  return observers;
}

function addCleanupListener(target: EventTarget, type: string, listener: EventListener): ControlStateCleanup {
  target.addEventListener(type, listener);
  return {
    disconnect: () => target.removeEventListener(type, listener)
  };
}

export function updateControlStatusState(control: Control | ControlGroup, message: ControlMessage) {
  control._internals.states.delete('error');
  control._internals.states.delete('success');

  if (message?.status?.length && !message?.hidden) {
    control._internals.states.add(message.status);
  }
}

export function hideAllValidationMessages(messages: ControlMessage[]) {
  messages.filter(m => m.hasAttribute('error')).forEach(m => m.setAttribute('hidden', ''));
}

export function hideInactiveValidationMessages(control: Control, messages: ControlMessage[]) {
  if (messages.find(m => m.error) && control.input.validity.valid) {
    messages.filter(m => m.error && !control.input.validity[m.error]).forEach(m => m.setAttribute('hidden', ''));
  }
}
