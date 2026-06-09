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

/**
 * Adds validation states to custom element
 * :state(valid) form control is in a valid state
 * :state(invalid) form control is in a invalid state
 */
// eslint-disable-next-line max-lines-per-function
export function setupControlValidationStates(control: Control, messages: ControlMessage[]) {
  const cleanups: ControlStateCleanup[] = [];

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
        control._internals.states.delete('invalid');
        control._internals.states.add('valid');
        control.status = null!;
      }

      hideInactiveValidationMessages(control, messages);
    };

    const resetValidityState = () => {
      control.status = null!;
      control._internals.states.delete('valid');
      control._internals.states.delete('invalid');
      hideAllValidationMessages(messages);
    };

    const onBlur = () => {
      control.input.checkValidity();
      updateValidityState();
    };

    const onInput = () => {
      updateValidityState();
    };

    const onInvalid = () => {
      if (messages.find(m => m.error)) {
        hideAllValidationMessages(messages);
        showActiveValidationMessages(control, messages);
      }

      control.status = 'error';
      control._internals.states.delete('valid');
      control._internals.states.add('invalid');
    };

    cleanups.push(
      addCleanupListener(control.input, 'blur', onBlur),
      addCleanupListener(control.input, 'input', onInput),
      addCleanupListener(control.input, 'invalid', onInvalid),
      addCleanupListener(control, 'reset', resetValidityState)
    );

    if (control.input.form) {
      cleanups.push(addCleanupListener(control.input.form, 'reset', resetValidityState));
    }
  }

  const onSlotChange = () => {
    const current = Array.from(control.querySelectorAll<ControlMessage>(ControlMessage.metadata.tag));
    control._internals.states.delete('valid');
    control._internals.states.delete('invalid');
    if (current.find(m => !m.hidden && (m.status === 'error' || m.error))) {
      control._internals.states.add('invalid');
    } else {
      control._internals.states.add('valid');
    }
  };
  cleanups.push(addCleanupListener(control.shadowRoot!, 'slotchange', onSlotChange));

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

export function showNonValidationMessages(messages: ControlMessage[]) {
  messages.filter(m => !m.hasAttribute('error')).forEach(m => m.removeAttribute('hidden'));
}

export function hideAllValidationMessages(messages: ControlMessage[]) {
  messages.filter(m => m.hasAttribute('error')).forEach(m => m.setAttribute('hidden', ''));
}

export function showActiveValidationMessages(control: Control, messages: ControlMessage[]) {
  messages.find(m => m.error && control.input.validity[m.error])?.removeAttribute('hidden');
}

export function hideInactiveValidationMessages(control: Control, messages: ControlMessage[]) {
  if (messages.find(m => m.error) && control.input.validity.valid) {
    messages.filter(m => m.error && !control.input.validity[m.error!]).forEach(m => m.setAttribute('hidden', ''));
  }
}
