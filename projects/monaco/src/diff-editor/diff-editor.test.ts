// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { html } from 'lit';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';

import type * as monaco from '@nvidia-elements/monaco';
import { MonacoDiffEditor } from '@nvidia-elements/monaco/diff-editor';
import '@nvidia-elements/monaco/diff-editor/define.js';

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

describe('nve-monaco-diff-editor', () => {
  let fixture: HTMLElement;
  let element: MonacoDiffEditor;
  let original: monaco.editor.ITextModel;
  let modified: monaco.editor.ITextModel;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-monaco-diff-editor></nve-monaco-diff-editor>
    `);
    element = fixture.querySelector(MonacoDiffEditor.metadata.tag) as MonacoDiffEditor;

    await untilEvent(element, 'ready');

    const { editor, monaco } = element;
    original = monaco.editor.createModel(originalValue, 'typescript', monaco.Uri.parse('diff:///src/example.ts'));
    modified = monaco.editor.createModel(modifiedValue, 'typescript', monaco.Uri.parse('file:///src/example.ts'));
    editor.setModel({ original, modified });

    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
    original.dispose();
    modified.dispose();
  });

  it('should define element', async () => {
    expect(customElements.get(MonacoDiffEditor.metadata.tag)).toBeDefined();
  });

  it('should render editor', async () => {
    expect(element.shadowRoot.querySelector('#editor')).toBeDefined();
    expect(element.shadowRoot.querySelector('.monaco-diff-editor')).toBeDefined();
  });

  it('should not incorrectly report duplicate symbol diagnostics originating from diff:// model references', async () => {
    const { editor, monaco } = element;

    const { original, modified } = editor.getModel();

    const worker = await monaco.typescript.getTypeScriptWorker();
    const workerInstance = await worker(original.uri, modified.uri);

    const diagnostics = await workerInstance.getSemanticDiagnostics(modified.uri.toString());

    expect(diagnostics.length).toBe(0);
  });
});
