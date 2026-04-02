// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { MonacoInput } from '@nvidia-elements/monaco/input';
import { MonacoDiffInput } from '@nvidia-elements/monaco/diff-input';
import { MonacoEditor } from '@nvidia-elements/monaco/editor';
import { MonacoDiffEditor } from '@nvidia-elements/monaco/diff-editor';

import type * as monaco from '@nvidia-elements/monaco';
import type { Monaco } from '@nvidia-elements/monaco';

import '@nvidia-elements/monaco/input/define.js';
import '@nvidia-elements/monaco/diff-input/define.js';

/**
 * Simulates user typing in the Monaco editor by directly modifying the editor model.
 * This is used to test user gesture-based changes that should trigger input events.
 */
async function simulateUserTyping(
  element: MonacoInput | MonacoDiffInput,
  model: monaco.editor.ITextModel,
  content: string
) {
  element.focus();
  model?.setValue(content);

  await elementIsStable(element);
}

/**
 * Simulates a validation error update from a Monaco editor worker.
 * This is used to test syntax validation behavior.
 */
function simulateValidationError(monaco: Monaco, model: monaco.editor.ITextModel, message: string = 'Syntax error') {
  monaco.editor.setModelMarkers(model, 'mock', [
    {
      message,
      severity: 8 /* monaco.MarkerSeverity.Error */,
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1
    }
  ]);
  model.setVersionValidated(model.getVersionId());
}

type InputTestConfig = {
  tag: string;
  editorTag: string;
  template: () => ReturnType<typeof html>;
  setup: (element: MonacoInput | MonacoDiffInput) => {
    monaco: Monaco;
    model: monaco.editor.ITextModel;
    updateEditorOptionsSpy: Mock<
      (newOptions: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions) => void
    >;
  };
};

describe.each<InputTestConfig>([
  {
    tag: MonacoInput.metadata.tag,
    editorTag: MonacoEditor.metadata.tag,
    template: () => html`<nve-monaco-input value="initial value"></nve-monaco-input>`,
    setup: element => {
      const inputElement = element as MonacoInput;
      const editorEl = inputElement.shadowRoot?.querySelector<MonacoEditor>(MonacoEditor.metadata.tag);
      const monaco = editorEl.monaco!;
      const model = editorEl.editor!.getModel()!;
      const updateEditorOptionsSpy = vi.spyOn(editorEl.editor!, 'updateOptions');

      return { monaco, model, updateEditorOptionsSpy };
    }
  },
  {
    tag: MonacoDiffInput.metadata.tag,
    editorTag: MonacoDiffEditor.metadata.tag,
    template: () =>
      html`<nve-monaco-diff-input original="original value" value="initial value"></nve-monaco-diff-input>`,
    setup: element => {
      const diffElement = element as MonacoDiffInput;
      const editorEl = diffElement.shadowRoot?.querySelector<MonacoDiffEditor>(MonacoDiffEditor.metadata.tag);
      const editor = editorEl.editor!.getModifiedEditor();
      const monaco = editorEl.monaco!;
      const model = editorEl.editor!.getModel()!.modified;
      const updateEditorOptionsSpy = vi.spyOn(editor, 'updateOptions');

      return { monaco, model, updateEditorOptionsSpy };
    }
  }
])('BaseMonacoInput (as used in $tag)', ({ tag, editorTag, template, setup }) => {
  let fixture: HTMLElement;
  let element: MonacoInput | MonacoDiffInput;
  let monaco: Monaco;
  let model: monaco.editor.ITextModel;
  let updateEditorOptionsSpy: Mock<
    (newOptions: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions) => void
  >;
  let consoleSpy: Mock<{
    (...data: unknown[]): void;
    (message?: unknown, ...optionalParams: unknown[]): void;
  }>;

  beforeEach(async () => {
    fixture = await createFixture(template());
    element = fixture.querySelector(tag) as MonacoInput | MonacoDiffInput;

    await untilEvent(element, 'ready');
    await elementIsStable(element);

    const setupResult = setup(element);
    monaco = setupResult.monaco;
    model = setupResult.model;
    updateEditorOptionsSpy = setupResult.updateEditorOptionsSpy;
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    removeFixture(fixture);
    updateEditorOptionsSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should instantiate editor', async () => {
    expect(element.shadowRoot.querySelector(editorTag)).toBeDefined();
  });

  it('should have a custom css state when ready', async () => {
    expect(element.matches(':state(ready)')).toBe(true);
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

  describe('value property', () => {
    it('should set initial value from attribute', async () => {
      expect(element.value).toBe('initial value');
    });

    it('should set value from property', async () => {
      const expectedValue = 'console.log("Hello, world!");';

      element.value = expectedValue;

      expect(element.value).toBe(expectedValue);
      expect(model.getValue()).toBe(expectedValue);
    });

    it('should not re-apply the value if it is the same to prevent framework binding loops and races', async () => {
      const expectedValue = 'console.log("Hello, world!");';

      element.value = expectedValue;
      const expectedVersion = model.getVersionId();
      element.value = expectedValue;

      expect(element.value).toBe(expectedValue);
      expect(model.getValue()).toBe(expectedValue);
      expect(model.getVersionId()).toBe(expectedVersion);
    });

    it('should gracefully handle removal of the value attribute', async () => {
      element.removeAttribute('value');

      expect(element.value).toBe('');
    });
  });

  describe('disabled property', () => {
    it('should update editor options when disabled changes state', async () => {
      element.disabled = true;

      expect(element.disabled).toBe(true);
      expect(updateEditorOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          readOnly: true
        })
      );
    });
  });

  describe('language property', () => {
    it('should update model language when language changes', async () => {
      element.language = 'typescript';

      await elementIsStable(element);

      expect(element.language).toBe('typescript');
      expect(model.getLanguageId()).toBe('typescript');
    });
  });

  describe('optional features', () => {
    it('should update editor options when folding changes', async () => {
      element.folding = true;

      expect(element.folding).toBe(true);
      expect(updateEditorOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          folding: true
        })
      );
    });

    it('should update editor options when insertSpaces changes', async () => {
      element.insertSpaces = true;

      expect(element.insertSpaces).toBe(true);
      expect(updateEditorOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          insertSpaces: true
        })
      );
    });

    it('should update editor options when lineNumbers changes', async () => {
      element.lineNumbers = 'on';

      expect(element.lineNumbers).toBe('on');
      expect(updateEditorOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          lineNumbers: 'on'
        })
      );
    });

    it('should update editor options when minimap changes', async () => {
      element.minimap = true;

      expect(element.minimap).toBe(true);
      expect(updateEditorOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          minimap: expect.objectContaining({
            enabled: true
          })
        })
      );
    });

    it('should update editor options when readOnly changes', async () => {
      element.readOnly = true;

      expect(element.readOnly).toBe(true);
      expect(updateEditorOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          readOnly: true
        })
      );
    });

    it('should update editor options when tabSize changes', async () => {
      element.tabSize = 4;

      expect(element.tabSize).toBe(4);
      expect(updateEditorOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          tabSize: 4
        })
      );
    });

    it('should update editor options when wordWrap changes', async () => {
      element.wordWrap = 'on';

      expect(element.wordWrap).toBe('on');
      expect(updateEditorOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          wordWrap: 'on'
        })
      );
    });
  });

  describe('updateEditorOptions()', () => {
    it('should update attributes and editor options when updateEditorOptions() is called', async () => {
      const mockOptions = {
        folding: true,
        insertSpaces: true,
        lineNumbers: 'on' as const,
        minimap: { enabled: true },
        readOnly: true,
        tabSize: 4,
        wordWrap: 'on' as const
      };

      element.updateEditorOptions(mockOptions);

      expect(updateEditorOptionsSpy).toHaveBeenCalledWith(expect.objectContaining(mockOptions));

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

      element.updateEditorOptions(mockOptions);

      expect(updateEditorOptionsSpy).toHaveBeenCalledWith(expect.objectContaining(mockOptions));
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

      await simulateUserTyping(element, model, 'user typed content');

      expect(inputSpy).toHaveBeenCalled();
      expect(element.value).toBe('user typed content');
    });

    it('should dispatch a change event on blur after content change', async () => {
      const changeSpy = vi.fn();
      element.addEventListener('change', changeSpy);

      await simulateUserTyping(element, model, 'user typed content');
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
      simulateValidationError(monaco, model);

      expect(element.validity.customError).toBe(true);
      expect(element.validationMessage).toBeTruthy();
    });

    it('should clear validation when switching to non-validation-supported language', async () => {
      // Start with a syntax validatable language and invalid code
      element.language = 'javascript';
      element.value = '[x for x in range(5)]';

      await elementIsStable(element);

      // Simulate validation update from worker
      simulateValidationError(monaco, model);

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
      simulateValidationError(monaco, model);

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

      // intentional invalid value
      const validationEvent = untilEvent(element, 'syntax-validation-changed');
      element.value = JSON.stringify({ name: 123 });

      await elementIsStable(element);
      await validationEvent;

      expect(element.validity.customError).toBe(true);
      expect(element.validationMessage).toContain('Incorrect type. Expected "string".');

      // fix the error
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
      simulateValidationError(monaco, model);

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
    let validationSpy: Mock<EventListener>;

    beforeEach(async () => {
      element.language = 'typescript';

      await elementIsStable(element);

      validationSpy = vi.fn();
      element.addEventListener('syntax-validation-changed', validationSpy);
    });

    afterEach(() => {
      element.removeEventListener('syntax-validation-changed', validationSpy);
    });

    it('should ignore validation results from stale model versions', async () => {
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
