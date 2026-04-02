// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { MonacoDiffInput } from '@nvidia-elements/monaco/diff-input';
import { MonacoDiffEditor } from '@nvidia-elements/monaco/diff-editor';

import type * as monaco from '@nvidia-elements/monaco';

import '@nvidia-elements/monaco/diff-input/define.js';

describe('nve-monaco-diff-input', () => {
  let fixture: HTMLElement;
  let element: MonacoDiffInput;

  let diffEditor: monaco.editor.IStandaloneDiffEditor;

  let originalEditor: monaco.editor.IStandaloneCodeEditor;
  let originalModel: monaco.editor.ITextModel;

  let updateOptionsSpy: Mock<(newOptions: monaco.editor.IDiffEditorOptions) => void>;
  let updateOriginalEditorOptionsSpy: Mock<
    (newOptions: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions) => void
  >;
  let consoleSpy: Mock<{
    (...data: unknown[]): void;
    (message?: unknown, ...optionalParams: unknown[]): void;
  }>;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-monaco-diff-input language="plaintext" original="original value" value="modified value"></nve-monaco-diff-input>
    `);
    element = fixture.querySelector(MonacoDiffInput.metadata.tag) as MonacoDiffInput;

    await untilEvent(element, 'ready');
    await elementIsStable(element);

    diffEditor = element.shadowRoot?.querySelector<MonacoDiffEditor>(MonacoDiffEditor.metadata.tag)!.editor;
    originalEditor = diffEditor.getOriginalEditor();
    originalModel = diffEditor.getModel().original;

    updateOptionsSpy = vi.spyOn(diffEditor, 'updateOptions');
    updateOriginalEditorOptionsSpy = vi.spyOn(originalEditor, 'updateOptions');
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    removeFixture(fixture);
    updateOptionsSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should define element', async () => {
    expect(customElements.get(MonacoDiffInput.metadata.tag)).toBeDefined();
  });

  it('should instantiate editor', async () => {
    expect(element.shadowRoot.querySelector(MonacoDiffEditor.metadata.tag)).toBeDefined();
  });

  describe('original property', () => {
    it('should update the original model when original property changes', async () => {
      const expectedValue = 'updated original content';
      element.original = expectedValue;

      expect(originalModel.getValue()).toBe(expectedValue);
    });

    it('should not re-apply the value if it is the same to prevent framework binding loops and races', async () => {
      const expectedValue = 'console.log("Hello, world!");';

      element.original = expectedValue;
      const expectedVersion = originalModel.getVersionId();
      element.original = expectedValue;

      expect(element.original).toBe(expectedValue);
      expect(originalModel.getValue()).toBe(expectedValue);
      expect(originalModel.getVersionId()).toBe(expectedVersion);
    });

    it('should gracefully handle removal of the original attribute', async () => {
      element.removeAttribute('original');

      expect(element.original).toBe('');
    });
  });

  describe('originalLanguage property', () => {
    it('should default to an empty string', async () => {
      expect(element.originalLanguage).toBe('');
    });

    it('should update the original model language when originalLanguage changes', async () => {
      element.originalLanguage = 'python';

      expect(originalModel.getLanguageId()).toBe('python');
    });

    it('should fall back to main language when originalLanguage is empty string', async () => {
      element.language = 'css';
      element.originalLanguage = '';

      expect(originalModel.getLanguageId()).toBe('css');
    });
  });

  describe('disabled property', () => {
    it('should update editor options when disabled changes', async () => {
      element.disabled = true;

      expect(updateOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          readOnly: true
        })
      );
    });
  });

  describe('readOnly property', () => {
    it('should update editor options when readOnly changes', async () => {
      element.readOnly = true;

      expect(updateOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          readOnly: true
        })
      );
    });
  });

  describe('sideBySide property', () => {
    it('should update editor options when sideBySide changes', async () => {
      element.sideBySide = true;

      expect(updateOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          renderSideBySide: true
        })
      );
    });
  });

  describe('updateOptions method', () => {
    it('should update attributes and diff editor options when updateOptions() is called', async () => {
      const options = {
        readOnly: true,
        renderSideBySide: true,
        ignoreTrimWhitespace: false
      };

      element.updateOptions(options);

      expect(updateOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...options,
          originalEditable: false
        })
      );
    });

    it('should warn when originalEditable is set to true', async () => {
      const options = {
        originalEditable: true
      };

      element.updateOptions(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Editing the original model is not supported, use nve-monaco-editor instead.'
      );
    });

    it('should preserve sideBySide when updateOptions receives undefined renderSideBySide', async () => {
      element.sideBySide = true;
      element.updateOptions({ renderSideBySide: undefined });
      expect(element.sideBySide).toBe(true);
    });

    it('should force originalEditable to false even when set to true', async () => {
      const options = {
        originalEditable: true
      };

      element.updateOptions(options);

      expect(updateOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          originalEditable: false
        })
      );
    });
  });

  describe('updateEditorOptions()', () => {
    it('should also update original editor options when properties are set', async () => {
      element.folding = true;
      element.insertSpaces = true;
      element.lineNumbers = 'on';
      element.minimap = true;
      element.readOnly = true;
      element.tabSize = 4;
      element.wordWrap = 'on';

      expect(updateOriginalEditorOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          folding: true,
          insertSpaces: true,
          lineNumbers: 'on',
          minimap: expect.objectContaining({
            enabled: true
          }),
          readOnly: true,
          tabSize: 4,
          wordWrap: 'on'
        })
      );
    });

    it('should also update original editor options when updateEditorOptions() is called', async () => {
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

      expect(updateOriginalEditorOptionsSpy).toHaveBeenCalledWith(expect.objectContaining(mockOptions));
    });

    it('should also support updating original editor options with additional Monaco editor options', async () => {
      const mockOptions = {
        fontSize: 14,
        fontFamily: 'monospace',
        smoothScrolling: true
      };

      element.updateEditorOptions(mockOptions);

      expect(updateOriginalEditorOptionsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockOptions,
          readOnly: true
        })
      );
    });
  });

  describe('updateOriginalEditorOptions()', () => {
    it('should update original editor options when updateEditorOptions() is called', async () => {
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

      expect(updateOriginalEditorOptionsSpy).toHaveBeenCalledWith(expect.objectContaining(mockOptions));
    });

    it('should support additional Monaco editor options', async () => {
      const options = {
        fontSize: 14,
        fontFamily: 'monospace',
        readOnly: true
      };

      element.updateOriginalEditorOptions(options);

      expect(updateOriginalEditorOptionsSpy).toHaveBeenCalledWith(options);
    });
  });

  describe('language property override', () => {
    it('should not change original model language when originalLanguage is set', async () => {
      element.originalLanguage = 'javascript';
      element.language = 'python';

      await elementIsStable(element);

      expect(originalModel.getLanguageId()).toBe('javascript');
    });

    it('should apply language to original model when originalLanguage is empty', async () => {
      element.originalLanguage = '';
      element.language = 'css';

      await elementIsStable(element);

      expect(originalModel.getLanguageId()).toBe('css');
    });
  });
});
