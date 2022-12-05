import { describe, expect, it } from 'vitest';
import { Control } from '../control/control.js';
import { showNonValidationMessages, hideAllValidationMessages, showActiveValidationMessages, hideAllControlMessages, hideInactiveValidationMessages } from './messages.js';

describe('showNonValidationMessages', () => {
  it('should show all messages that do not have a validation requirement', async () => {
    const messages = [
      document.createElement('nve-control-message'),
      document.createElement('nve-control-message')
    ];

    messages[0].setAttribute('error', 'valueMissing');
    messages[0].hidden = true;
    messages[1].hidden = true;

    showNonValidationMessages(messages);

    expect(messages[0].hidden).toBe(true);
    expect(messages[1].hidden).toBe(false);
  });
});

describe('hideAllValidationMessages', () => {
  it('should hide all messages with a validation requirement', async () => {
    const messages = [
      document.createElement('nve-control-message'),
      document.createElement('nve-control-message')
    ];

    messages[0].setAttribute('error', 'valueMissing');

    hideAllValidationMessages(messages);

    expect(messages[0].hidden).toBe(true);
    expect(messages[1].hidden).toBe(false);
  });
});

describe('showActiveValidationMessages', () => {
  it('should only messages wich have active validation rules', async () => {
    const controlMock = { input: { validity: { valueMissing: true } } } as Control;
    const messages = [
      document.createElement('nve-control-message'),
      document.createElement('nve-control-message')
    ];

    messages[0].error = 'valueMissing';
    messages[0].hidden = true;
    messages[1].hidden = true;

    showActiveValidationMessages(controlMock, messages);

    expect(messages[0].hidden).toBe(false);
    expect(messages[1].hidden).toBe(true);
  });
});

describe('hideAllControlMessages', () => {
  it('should hide all control messages', async () => {
    const messages = [
      document.createElement('nve-control-message'),
      document.createElement('nve-control-message')
    ];

    hideAllControlMessages(messages);

    expect(messages[0].hidden).toBe(true);
    expect(messages[1].hidden).toBe(true);
  });
});

describe('hideInactiveValidationMessages', () => {
  it('should hide all validation messages if control is valid', async () => {
    const controlMock = { input: { validity: { valid: true } } } as Control;
    const messages = [
      document.createElement('nve-control-message'),
      document.createElement('nve-control-message')
    ];

    messages[0].error = 'valueMissing';

    hideInactiveValidationMessages(controlMock, messages);

    expect(messages[0].hidden).toBe(true);
    expect(messages[1].hidden).toBe(false);
  });
});
