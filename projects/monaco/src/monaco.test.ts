// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi } from 'vitest';
import { injectMonacoGlobalStyles, loadMonaco, loadEditorStyles } from './monaco.js';
import { createMonacoEnvironment } from './environment.js';

describe('Monaco Module', () => {
  describe('loadMonaco', () => {
    it('should dynamically import and return the Monaco instance', async () => {
      const monaco = await loadMonaco();
      expect(monaco).toBeDefined();
      expect(monaco.editor).toBeDefined();
    });

    it('should create a default MonacoEnvironment if not already specified', async () => {
      await loadMonaco();
      expect(globalThis.MonacoEnvironment).toBeDefined();
      expect(globalThis.MonacoEnvironment?.getWorker).toBeDefined();

      const worker = globalThis.MonacoEnvironment?.getWorker;
      if (!worker) {
        throw new Error('The default Monaco worker factory was not initialized');
      }
      const jsonWorker = await worker('', 'json');
      expect(jsonWorker, 'JSON worker').toBeDefined();
      jsonWorker.terminate();

      const cssWorker = await worker('', 'css');
      expect(cssWorker, 'CSS worker').toBeDefined();
      cssWorker.terminate();

      const htmlWorker = await worker('', 'html');
      expect(htmlWorker, 'HTML worker').toBeDefined();
      htmlWorker.terminate();

      const tsWorker = await worker('', 'typescript');
      expect(tsWorker, 'TypeScript worker').toBeDefined();
      tsWorker.terminate();

      const defaultWorker = await worker('', 'other');
      expect(defaultWorker, 'Default editor worker').toBeDefined();
      defaultWorker.terminate();
    });

    it('should not replace MonacoEnvironment if already specified', async () => {
      const defaultEnv = createMonacoEnvironment();
      function getWorker(_, label: string) {
        return defaultEnv.getWorker(_, label);
      }
      const existingEnv = { getWorker };
      globalThis.MonacoEnvironment = existingEnv;

      await loadMonaco();
      expect(globalThis.MonacoEnvironment).toBe(existingEnv);
      expect(globalThis.MonacoEnvironment.getWorker).toBe(existingEnv.getWorker);
    });

    it('should define and apply the elements monaco theme for the current color scheme', async () => {
      const monaco = await loadMonaco();

      expect(monaco.editor.getTheme()).toBeDefined();

      const currentTheme = monaco.editor.getTheme();
      const colorScheme = getComputedStyle(document.documentElement).colorScheme;
      expect(currentTheme).toBe(colorScheme === 'dark' ? 'elements-dark' : 'elements-light');
    });

    it('should load the monaco codicon font', async () => {
      await loadMonaco();
      await document.fonts.load('16px codicon');

      expect(document.fonts.check('16px codicon')).toBe(true);
    });
  });

  describe('language integration', () => {
    it('should validate JSON through the public language-worker accessor', async () => {
      const monaco = await loadMonaco();
      const model = monaco.editor.createModel('{"value": }', 'json');
      try {
        const getWorker = await monaco.json.getWorker();
        const worker = await getWorker(model.uri);
        const diagnostics = await worker.doValidation(model.uri.toString());
        expect(diagnostics.length).toBeGreaterThan(0);
      } finally {
        model.dispose();
      }
    });

    it('should treat TypeScript files without imports or exports as separate modules', async () => {
      const monaco = await loadMonaco();
      const first = monaco.editor.createModel('const moduleDetectionProbe = 1;', 'typescript');
      const second = monaco.editor.createModel('const moduleDetectionProbe = 2;', 'typescript');
      try {
        const getWorker = await monaco.typescript.getTypeScriptWorker();
        const worker = await getWorker(first.uri, second.uri);
        expect(await worker.getSemanticDiagnostics(first.uri.toString())).toEqual([]);
        expect(await worker.getSemanticDiagnostics(second.uri.toString())).toEqual([]);
      } finally {
        first.dispose();
        second.dispose();
      }
    });
  });

  describe('patch regressions', () => {
    it('should expose validation completion through the public helper', async () => {
      // patches/monaco-editor.patch: TextModel validation event and public editor helpers.
      const monaco = await loadMonaco();
      const model = monaco.editor.createModel('value', 'plaintext');
      const listener = vi.fn();
      const subscription = monaco.editor.onDidValidateModelVersion(model, listener);
      try {
        monaco.editor.setModelVersionValidated(model, model.getVersionId());
        expect(listener).toHaveBeenCalledExactlyOnceWith(model.getVersionId());
        subscription.dispose();
        monaco.editor.setModelVersionValidated(model, model.getVersionId());
        expect(listener).toHaveBeenCalledTimes(1);
      } finally {
        subscription.dispose();
        model.dispose();
      }
    });

    it('should paste clipboard text into a shadow-root editor', async () => {
      // Retired clipboard.js patch: upstream no longer reads an unavailable product service during paste.
      const monaco = await loadMonaco();
      const host = document.createElement('div');
      document.body.append(host);
      const shadow = host.attachShadow({ mode: 'open' });
      shadow.adoptedStyleSheets = [await loadEditorStyles()];
      const container = document.createElement('div');
      container.style.cssText = 'width: 600px; height: 250px';
      shadow.append(container);
      const model = monaco.editor.createModel('', 'plaintext');
      const editor = monaco.editor.create(container, { model });
      // Exercise the browser clipboard fallback without requiring an OS clipboard or user gesture.
      const nativePaste = vi.spyOn(document, 'execCommand').mockReturnValue(false);
      const clipboard = vi.spyOn(navigator.clipboard, 'readText').mockResolvedValue('clipboard text');
      try {
        editor.focus();
        expect(editor.hasTextFocus()).toBe(true);
        await editor.trigger('test', 'editor.action.clipboardPasteAction', null);
        await vi.waitFor(() => expect(model.getValue()).toBe('clipboard text'));
        expect(clipboard).toHaveBeenCalled();
      } finally {
        clipboard.mockRestore();
        nativePaste.mockRestore();
        editor.dispose();
        model.dispose();
        host.remove();
      }
    });

    it('should cancel pending linked editing updates when the editor is disposed', async () => {
      const monaco = await loadMonaco();
      // patches/monaco-editor.patch: linkedEditing.js cancellation handlers (issue #4702).
      const provideLinkedEditingRanges = vi.fn(() => ({
        ranges: [new monaco.Range(1, 1, 1, 4), new monaco.Range(1, 6, 1, 9)]
      }));
      const provider = monaco.languages.registerLinkedEditingRangeProvider('plaintext', { provideLinkedEditingRanges });
      const container = document.createElement('div');
      container.style.cssText = 'width: 600px; height: 250px';
      document.body.append(container);
      const model = monaco.editor.createModel('tag  tag', 'plaintext');
      const editor = monaco.editor.create(container, { model, linkedEditing: true });
      try {
        await vi.waitFor(() => expect(provideLinkedEditingRanges).toHaveBeenCalled());
        // A cursor move queues a range refresh; disposal must handle its cancellation.
        editor.setPosition(new monaco.Position(1, 2));
        model.dispose();
        editor.dispose();
        // Let rejection handlers run; Vitest reports any unhandled disposal rejection.
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(model.isDisposed()).toBe(true);
      } finally {
        editor.dispose();
        model.dispose();
        provider.dispose();
        container.remove();
      }
    });
  });

  describe('injectMonacoGlobalStyles', () => {
    it('should inject the monaco global styles', async () => {
      const injectedStyles = await injectMonacoGlobalStyles();

      expect(injectedStyles).toBeDefined();
      expect(globalThis.document.adoptedStyleSheets.includes(injectedStyles)).toBe(true);
    });

    it('should not inject the monaco global styles if they have already been injected', async () => {
      const injectedStyles = await injectMonacoGlobalStyles();
      const injectedStyles2 = await injectMonacoGlobalStyles();

      expect(injectedStyles2).toBe(injectedStyles);
      expect(globalThis.document.adoptedStyleSheets.filter(style => style === injectedStyles).length).toBe(1);
    });
  });

  describe('loadEditorStyles', () => {
    it('should return a CSSStyleSheet', async () => {
      const styles = await loadEditorStyles();
      expect(styles).toBeInstanceOf(CSSStyleSheet);
    });

    it('should load Monaco editor styles', async () => {
      const styles = await loadEditorStyles();
      expect(styles.cssRules.length).toBeGreaterThan(0);
    });
  });
});
