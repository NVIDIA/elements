// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { html } from 'lit';
import type { TemplateResult } from 'lit';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';

import '@nvidia-elements/monaco/diff-editor/define.js';
import { MonacoDiffEditor } from '@nvidia-elements/monaco/diff-editor';

import '@nvidia-elements/monaco/editor/define.js';
import { MonacoEditor } from '@nvidia-elements/monaco/editor';

import { updateThemeForColorScheme } from '../../themes/index.js';

vi.mock('../../themes/index.js', () => {
  return {
    defineThemes: vi.fn(),
    applyThemeForColorScheme: vi.fn(),
    updateThemeForColorScheme: vi.fn()
  };
});

const mockUpdateThemeForColorScheme = vi.mocked(updateThemeForColorScheme);

const originalValue = `type Package = {
  name: string;
  description: string;
}

class PackageService {
  #packages: Package[] = [];

  findByName(name: string): Package | undefined {
    return this.#packages.find(p => p.name === name);
  }

  constructor() {
    this.#packages.push({
      name: '@nvidia-elements/monaco',
      description: 'Monaco Editor Elements'
    });
  }
}

const service = new PackageService();
console.log(service.findByName('@nvidia-elements/monaco'));
`;

const modifiedValue = `type Package = {
  name: string;
  description: string;
}

class PackageService {
  #packages: Package[] = [];

  constructor() {
    this.#packages.push({
      name: '@nvidia-elements/monaco',
      description: 'Monaco Editor Elements'
    });
  }

  findByName(name: string): Package | undefined {
    return this.#packages.find(p => p.name === name);
  }
}

const service = new PackageService();
console.log(service.findByName('@nvidia-elements/monaco'));
`;

type Teardown = () => void;

type EditorTestConfig = {
  tag: string;
  template: () => TemplateResult;
  setup: (element: MonacoDiffEditor | MonacoEditor) => Teardown;
};

interface TestContext {
  beforeReady?: () => void;
}

describe.each<EditorTestConfig>([
  {
    tag: MonacoEditor.metadata.tag,
    template: () => html`<nve-monaco-editor></nve-monaco-editor>`,
    setup: (element: MonacoDiffEditor | MonacoEditor) => {
      const { editor, monaco } = element as MonacoEditor;
      const model = monaco.editor.createModel(modifiedValue, 'typescript');
      editor.setModel(model);
      return () => {
        model.dispose();
      };
    }
  },
  {
    tag: MonacoDiffEditor.metadata.tag,
    template: () => html`<nve-monaco-diff-editor></nve-monaco-diff-editor>`,
    setup: (element: MonacoDiffEditor | MonacoEditor) => {
      const { editor, monaco } = element as MonacoDiffEditor;
      const original = monaco.editor.createModel(
        originalValue,
        'typescript',
        monaco.Uri.parse('diff:///src/example.ts')
      );
      const modified = monaco.editor.createModel(
        modifiedValue,
        'typescript',
        monaco.Uri.parse('file:///src/example.ts')
      );
      editor.setModel({ original, modified });
      return () => {
        original.dispose();
        modified.dispose();
      };
    }
  }
])('BaseMonacoEditor (as used in $tag)', ({ tag, template, setup }) => {
  let fixture: HTMLElement;
  let element: MonacoEditor | MonacoDiffEditor;
  let teardown: Teardown;

  beforeEach<TestContext>(async ({ beforeReady }) => {
    fixture = await createFixture(template());
    element = fixture.querySelector(tag) as MonacoEditor | MonacoDiffEditor;

    beforeReady?.();
    await untilEvent(element, 'ready');

    teardown = setup(element);

    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
    teardown();
    vi.clearAllMocks();
  });

  it('should provide access to the Monaco Editor API instance', async () => {
    expect(element.monaco).toBeDefined();
  });

  it('should provide access to the Monaco Editor instance', async () => {
    expect(element.editor).toBeDefined();
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

    const readyEvent = untilEvent(element, 'ready');
    parentElement.appendChild(element);
    await readyEvent;
  });

  it('should stop internal DOM input and change events from leaking out', async () => {
    const inputSpy = vi.fn();
    const changeSpy = vi.fn();

    document.addEventListener('input', inputSpy);
    document.addEventListener('change', changeSpy);

    const editorDiv = element.shadowRoot.querySelector('#editor');
    editorDiv.dispatchEvent(new InputEvent('input', { bubbles: true }));
    editorDiv.dispatchEvent(new Event('change', { bubbles: true }));

    expect(inputSpy).not.toHaveBeenCalled();
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it('should not re-insert editor styles when reconnected to DOM', async () => {
    const initialStyleSheets = element.shadowRoot.adoptedStyleSheets.length;

    fixture.removeChild(element);

    await elementIsStable(element);

    fixture.appendChild(element);

    await untilEvent(element, 'ready');
    await elementIsStable(element);

    expect(element.shadowRoot.adoptedStyleSheets.length).toBe(initialStyleSheets);
  });

  it('should toggle theme when color scheme probe transitions', async () => {
    mockUpdateThemeForColorScheme.mockClear();

    const probe = element.shadowRoot.querySelector('#color-scheme-probe');
    probe.dispatchEvent(new TransitionEvent('transitionrun'));

    expect(mockUpdateThemeForColorScheme).toHaveBeenCalledWith(element.monaco, element);
  });

  it.extend<{ beforeReady?: () => void }>({
    beforeReady: async ({}, use) => {
      await use(() => {
        const probe = element.shadowRoot.querySelector('#color-scheme-probe');
        probe.dispatchEvent(new TransitionEvent('transitionrun'));

        expect(mockUpdateThemeForColorScheme).not.toHaveBeenCalled();
      });
    }
  })('should not toggle the theme until the editor is ready', async () => {
    expect(mockUpdateThemeForColorScheme).toHaveBeenCalledWith(element.monaco, element);
  });
});
