import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { MonacoInput } from '@nvidia-elements/monaco/input';
import { MonacoEditor } from '@nvidia-elements/monaco/editor';

import type * as monaco from 'monaco-editor';

import '@nvidia-elements/monaco/input/define.js';

/**
 * Simulates user typing in the Monaco editor by directly modifying the editor model.
 * This is used to test user gesture-based changes that should trigger input events.
 */
async function simulateUserTyping(element: MonacoInput, content: string) {
  element.focus();
  const editorEl = element.shadowRoot?.querySelector<MonacoEditor>(MonacoEditor.metadata.tag);
  const model = editorEl.editor?.getModel();
  model?.setValue(content);
  await elementIsStable(element);
}

describe('nve-monaco-input', () => {
  let fixture: HTMLElement;
  let element: MonacoInput;
  let editorEl: MonacoEditor;
  let model: monaco.editor.ITextModel;
  let updateOptionsSpy: ReturnType<typeof vi.spyOn>;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-monaco-input value="initial value"></nve-monaco-input>
    `);
    element = fixture.querySelector(MonacoInput.metadata.tag) as MonacoInput;
    await untilEvent(element, 'ready');
    await elementIsStable(element);
    editorEl = element.shadowRoot?.querySelector<MonacoEditor>(MonacoEditor.metadata.tag);
    model = editorEl.editor?.getModel()!;
    updateOptionsSpy = vi.spyOn(editorEl.editor!, 'updateOptions');
    consoleSpy = vi.spyOn(console, 'warn');
  });

  afterEach(() => {
    removeFixture(fixture);
    updateOptionsSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should define element', async () => {
    expect(customElements.get(MonacoInput.metadata.tag)).toBeDefined();
  });

  it('should instantiate editor', async () => {
    expect(element.shadowRoot.querySelector(MonacoEditor.metadata.tag)).toBeDefined();
  });

  it('should have a custom css state when ready', async () => {
    expect(element.matches(':state(ready)')).toBe(true);
  });

  it('should set initial value from attribute', async () => {
    expect(element.value).toBe('initial value');
  });

  it('should set value from property', async () => {
    const expectedValue = 'console.log("Hello, world!");';

    element.value = expectedValue;

    await elementIsStable(element);
    expect(element.value).toBe(expectedValue);
    expect(model.getValue()).toBe(expectedValue);
  });

  it('should gracefully handle connect/disconnect during initialization', async () => {
    const { parentElement } = element;

    element.remove();

    const canceledEvent = untilEvent(element, 'canceled');
    parentElement.appendChild(element);
    element.remove();
    await canceledEvent;
    expect(element.matches(':state(ready)')).toBe(false);

    const readyEvent = untilEvent(element, 'ready');
    parentElement.appendChild(element);
    await readyEvent;
    expect(element.matches(':state(ready)')).toBe(true);
  });

  it('should gracefully handle removal of the value attribute', async () => {
    element.removeAttribute('value');

    await elementIsStable(element);
    expect(element.value).toBe('');
  });

  it('should toggle disabled state', async () => {
    element.disabled = true;

    await elementIsStable(element);
    expect(element.disabled).toBe(true);
    expect(updateOptionsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        readOnly: true
      })
    );
  });

  describe('optional features', () => {
    it('should toggle folding', async () => {
      element.folding = true;

      await elementIsStable(element);
      expect(element.folding).toBe(true);
      expect(updateOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          folding: true,
          lineDecorationsWidth: 10
        })
      );
    });

    it('should toggle insertSpaces', async () => {
      element.insertSpaces = true;

      await elementIsStable(element);
      expect(element.insertSpaces).toBe(true);
      expect(updateOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          insertSpaces: true
        })
      );
    });

    it('should toggle lineNumbers', async () => {
      element.lineNumbers = 'on';

      await elementIsStable(element);
      expect(element.lineNumbers).toBe('on');
      expect(updateOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          lineNumbers: 'on',
          lineDecorationsWidth: 10
        })
      );
    });

    it('should toggle minimap', async () => {
      element.minimap = true;

      await elementIsStable(element);
      expect(element.minimap).toBe(true);
      expect(updateOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          minimap: expect.objectContaining({
            enabled: true
          })
        })
      );
    });

    it('should toggle readOnly', async () => {
      element.readOnly = true;

      await elementIsStable(element);
      expect(element.readOnly).toBe(true);
      expect(updateOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          readOnly: true
        })
      );
    });

    it('should set tabSize', async () => {
      element.tabSize = 4;

      await elementIsStable(element);
      expect(element.tabSize).toBe(4);
      expect(updateOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          tabSize: 4
        })
      );
    });

    it('should set wordWrap', async () => {
      element.wordWrap = 'on';

      await elementIsStable(element);
      expect(element.wordWrap).toBe('on');
      expect(updateOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          wordWrap: 'on'
        })
      );
    });

    it('should set language', async () => {
      element.language = 'typescript';

      await elementIsStable(element);
      expect(element.language).toBe('typescript');
      expect(model.getLanguageId()).toBe('typescript');
    });
  });

  describe('setOptions', () => {
    it('should update attributes through setOptions method', async () => {
      const mockOptions = {
        folding: true,
        insertSpaces: true,
        lineNumbers: 'on' as const,
        minimap: { enabled: true },
        readOnly: true,
        tabSize: 4,
        wordWrap: 'on' as const
      };

      element.updateOptions(mockOptions);
      await elementIsStable(element);

      expect(element.folding).toBe(true);
      expect(element.insertSpaces).toBe(true);
      expect(element.lineNumbers).toBe('on');
      expect(element.minimap).toBe(true);
      expect(element.readOnly).toBe(true);
      expect(element.tabSize).toBe(4);
      expect(element.wordWrap).toBe('on');
    });

    it('should support additional Monaco editor options', async () => {
      const mockOptions = {
        fontSize: 14,
        fontFamily: 'monospace',
        smoothScrolling: true
      };

      element.updateOptions(mockOptions);
      await elementIsStable(element);

      expect(updateOptionsSpy).toHaveBeenCalledWith(expect.objectContaining(mockOptions));
    });
  });

  describe('focus management', () => {
    it('should focus the editor and become active element when focus() is called', async () => {
      const focusSpy = vi.fn();
      element.addEventListener('focus', focusSpy);

      element.focus();

      expect(document.activeElement).toBe(element);
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should blur the editor and lose active element when blur() is called', async () => {
      const blurSpy = vi.fn();
      element.addEventListener('blur', blurSpy);

      element.focus();
      element.blur();

      expect(document.activeElement).not.toBe(element);
      expect(blurSpy).toHaveBeenCalled();
    });
  });

  describe('events', () => {
    it('should not dispatch an input event on programmatic value change', async () => {
      const inputSpy = vi.fn();
      element.addEventListener('input', inputSpy);

      element.value = 'new content';

      expect(inputSpy).not.toHaveBeenCalled();
      expect(element.value).toBe('new content');
    });

    it('should dispatch an input event on user gesture-based change', async () => {
      const inputSpy = vi.fn();
      element.addEventListener('input', inputSpy);

      await simulateUserTyping(element, 'user typed content');

      expect(inputSpy).toHaveBeenCalled();
      expect(element.value).toBe('user typed content');
    });

    it('should dispatch a change event on blur after content change', async () => {
      const changeSpy = vi.fn();
      element.addEventListener('change', changeSpy);

      await simulateUserTyping(element, 'user typed content');
      element.blur();

      expect(changeSpy).toHaveBeenCalled();
      expect(element.value).toBe('user typed content');
    });

    it('should not dispatch a change event on blur when no content change', async () => {
      const changeSpy = vi.fn();
      element.addEventListener('change', changeSpy);

      element.focus();
      element.blur();

      expect(changeSpy).not.toHaveBeenCalled();
    });
  });

  describe('syntax validation', () => {
    it('should validate syntax (where available)', async () => {
      element.language = 'typescript';
      element.value = 'const n: number = "not a number";';
      await elementIsStable(element);

      // Simulate validation update from worker
      editorEl.monaco!.editor.setModelMarkers(model, 'mock', [
        {
          message: 'Syntax error',
          severity: 8 /* monaco.MarkerSeverity.Error */,
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1
        }
      ]);
      model.setVersionValidated(model.getVersionId());

      expect(element.validity.customError).toBe(true);
      expect(element.validationMessage).toBeTruthy();
    });

    it('should clear validation when switching to non-validation-supported language', async () => {
      // Start with a syntax validatable language and invalid code
      element.language = 'javascript';
      element.value = '[x for x in range(5)]'; // Python list comprehension
      await elementIsStable(element);

      // Simulate validation update from worker
      editorEl.monaco!.editor.setModelMarkers(model, 'mock', [
        {
          message: 'Syntax error',
          severity: 8 /* monaco.MarkerSeverity.Error */,
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1
        }
      ]);
      model.setVersionValidated(model.getVersionId());

      expect(element.validity.customError).toBe(true);
      expect(element.validationMessage).toBeTruthy();

      // Switch to a non-syntax validatable language
      element.language = 'python';
      await elementIsStable(element);

      expect(element.validity.customError).toBe(false);
      expect(element.validationMessage).toBe('');
    });

    it('should not validate syntax when novalidate is set', async () => {
      element.language = 'typescript';
      element.noValidate = true;
      element.value = 'const n: number = "not a number";';
      await elementIsStable(element);

      // Simulate validation update from worker
      editorEl.monaco!.editor.setModelMarkers(model, 'mock', [
        {
          message: 'Syntax error',
          severity: 8 /* monaco.MarkerSeverity.Error */,
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1
        }
      ]);
      model.setVersionValidated(model.getVersionId());

      expect(element.validity.customError).toBe(false);
      expect(element.validationMessage).toBe('');
    });

    it('should validate JSON against schema', async () => {
      element.language = 'json';
      element.schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
          description: { type: 'string' }
        },
        required: ['name', 'version']
      };

      // intentional invalid value
      const validationEvent = untilEvent(element, 'syntax-validation-changed');
      element.value = JSON.stringify({ name: 123, version: '1.0' });
      await elementIsStable(element);
      await validationEvent;

      expect(element.validity.customError).toBe(true);
      expect(element.validationMessage).toContain('Incorrect type. Expected "string".');

      // fix the error
      const validationEvent2 = untilEvent(element, 'syntax-validation-changed');
      element.value = JSON.stringify({ name: 'test', version: '1.0.0' });
      await elementIsStable(element);
      await validationEvent2;

      expect(element.validity.customError).toBe(false);
      expect(element.validationMessage).toBe('');
    });

    it('should clear schema validation when language changes from JSON', async () => {
      element.language = 'json';
      element.schema = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        },
        required: ['name']
      };
      const validationEvent = untilEvent(element, 'syntax-validation-changed');
      element.value = JSON.stringify({ name: 123 });
      await elementIsStable(element);
      await validationEvent;

      expect(element.validity.customError).toBe(true);
      expect(element.validationMessage).toContain('Incorrect type. Expected "string".');

      const validationEvent2 = untilEvent(element, 'syntax-validation-changed');
      element.language = 'javascript';
      await elementIsStable(element);
      await validationEvent2;

      expect(element.validity.customError).toBe(true);
      expect(element.validationMessage).toBe(`';' expected.`);
    });
  });

  describe('required validation', () => {
    it('should validate required state', async () => {
      element.required = true;
      element.value = '';
      await elementIsStable(element);

      expect(element.validity.valueMissing).toBe(true);
    });

    it('should not validate required state when novalidate is set', async () => {
      element.required = true;
      element.noValidate = true;
      element.value = '';
      await elementIsStable(element);

      expect(element.validity.valueMissing).toBe(false);
    });

    it('should clear required validation when value is set', async () => {
      element.required = true;
      element.value = '';
      await elementIsStable(element);

      expect(element.validity.valueMissing).toBe(true);

      element.value = 'some value';
      await elementIsStable(element);

      expect(element.validity.valueMissing).toBe(false);
    });

    it('should validate required state after blur', async () => {
      element.required = true;
      element.value = '';
      await elementIsStable(element);

      element.focus();
      element.blur();
      await elementIsStable(element);

      expect(element.validity.valueMissing).toBe(true);
    });

    it('should prioritize required validation over syntax validation', async () => {
      element.required = true;
      element.language = 'typescript';
      element.value = '';
      await elementIsStable(element);

      // Simulate validation update from worker
      editorEl.monaco!.editor.setModelMarkers(model, 'mock', [
        {
          message: 'Syntax error',
          severity: 8 /* monaco.MarkerSeverity.Error */,
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1
        }
      ]);
      model.setVersionValidated(model.getVersionId());

      expect(element.validity.valueMissing).toBe(true);
      expect(element.validity.customError).toBe(false);
    });
  });

  describe('CSS validation', () => {
    beforeEach(async () => {
      element.language = 'css';
      await elementIsStable(element);
    });

    it('should mark invalid CSS as invalid', async () => {
      const syntaxChangeEvent = untilEvent(element, 'syntax-validation-changed');
      element.value = '.invalid {';

      await elementIsStable(element);
      await syntaxChangeEvent;

      expect(element.validity.customError).toBe(true);
      expect(element.validationMessage).toBeTruthy();

      const syntaxChangeEvent2 = untilEvent(element, 'syntax-validation-changed');
      element.value = '.valid { color: red; }';

      await elementIsStable(element);
      await syntaxChangeEvent2;

      expect(element.validity.customError).toBe(false);
      expect(element.validationMessage).toBe('');
    });

    it('should mark valid CSS as valid', async () => {
      const syntaxChangeEvent = untilEvent(element, 'syntax-validation-changed');
      element.value = '.valid { color: red; }';

      await elementIsStable(element);
      await syntaxChangeEvent;

      expect(element.validity.customError).toBe(false);
      expect(element.validationMessage).toBe('');
    });
  });

  describe('JSON validation', () => {
    beforeEach(async () => {
      element.language = 'json';
      await elementIsStable(element);
    });

    it('should mark invalid JSON as invalid', async () => {
      const syntaxChangeEvent = untilEvent(element, 'syntax-validation-changed');
      element.value = '{ invalid: json }';

      await elementIsStable(element);
      await syntaxChangeEvent;

      expect(element.validity.customError).toBe(true);
      expect(element.validationMessage).toBeTruthy();

      const syntaxChangeEvent2 = untilEvent(element, 'syntax-validation-changed');
      element.value = '{"valid": "json"}';

      await elementIsStable(element);
      await syntaxChangeEvent2;

      expect(element.validity.customError).toBe(false);
      expect(element.validationMessage).toBe('');
    });

    it('should mark valid JSON as valid', async () => {
      const syntaxChangeEvent = untilEvent(element, 'syntax-validation-changed');
      element.value = '{"valid": "json"}';

      await elementIsStable(element);
      await syntaxChangeEvent;

      expect(element.validity.customError).toBe(false);
      expect(element.validationMessage).toBe('');
    });
  });

  describe('TypeScript validation', () => {
    beforeEach(async () => {
      element.language = 'typescript';
      await elementIsStable(element);
    });

    it('should mark invalid TypeScript as invalid', async () => {
      const syntaxChangeEvent = untilEvent(element, 'syntax-validation-changed');
      element.value = 'const n: number = "not a number";';

      await elementIsStable(element);
      await syntaxChangeEvent;

      expect(element.validity.customError).toBe(true);
      expect(element.validationMessage).toBeTruthy();

      const syntaxChangeEvent2 = untilEvent(element, 'syntax-validation-changed');
      element.value = 'const n: number = 42;';

      await elementIsStable(element);
      await syntaxChangeEvent2;

      expect(element.validity.customError).toBe(false);
      expect(element.validationMessage).toBe('');
    });

    it('should mark valid TypeScript as valid', async () => {
      const syntaxChangeEvent = untilEvent(element, 'syntax-validation-changed');
      element.value = 'const n: number = 42;';

      await elementIsStable(element);
      await syntaxChangeEvent;

      expect(element.validity.customError).toBe(false);
      expect(element.validationMessage).toBe('');
    });
  });

  describe('async validation behavior', () => {
    let model: monaco.editor.ITextModel;

    beforeEach(async () => {
      element.language = 'typescript';
      await elementIsStable(element);

      model = editorEl.editor!.getModel()!;
    });

    it('should ignore validation results from stale model versions', async () => {
      const validationSpy = vi.fn();
      element.addEventListener('syntax-validation-changed', validationSpy);
      const validationEvent = untilEvent(element, 'syntax-validation-changed');

      model.setValue('const n: number = "not a number";');
      const firstVersion = model.getVersionId();

      expect(element.validity.customError).toBe(true);
      expect(element.validationMessage).toBe('Validating syntax...');

      model.setValue('const n: number = 42;');
      const secondVersion = model.getVersionId();

      expect(secondVersion).toBeGreaterThan(firstVersion);

      // Simulate validation update from worker arriving with a stale version ID
      model.setVersionValidated(firstVersion);
      expect(validationSpy).not.toHaveBeenCalled();

      await validationEvent;
      expect(validationSpy).toHaveBeenCalledTimes(1);

      expect(element.validity.customError).toBe(false);
      expect(element.validationMessage).toBe('');
    });
  });
});
