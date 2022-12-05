import { ControlMessage } from '../control-message/control-message.js';
import { Control } from '../control/control.js';

export function showNonValidationMessages(messages: ControlMessage[]) {
  messages.filter(m => !m.hasAttribute('error')).forEach(m => m.removeAttribute('hidden'));
}

export function hideAllValidationMessages(messages: ControlMessage[]) {
  messages.filter(m => m.hasAttribute('error')).forEach(m => m.setAttribute('hidden', ''));
}

export function showActiveValidationMessages(control: Control, messages: ControlMessage[]) {
  messages.find(m => control.input.validity[m.error])?.removeAttribute('hidden');
}

export function hideAllControlMessages(messages: ControlMessage[]) {
  messages.forEach(m => m.setAttribute('hidden', ''));
}

export function hideInactiveValidationMessages(control: Control, messages: ControlMessage[]) {
  if (messages.find(m => m.error) && control.input.validity.valid) {
    messages.filter(m => m.error && !control.input.validity[m.error]).forEach(m => m.setAttribute('hidden', ''));
  }
}
