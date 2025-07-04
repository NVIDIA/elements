import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { html } from 'lit';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@nvidia-elements/testing';

import type * as monaco from '@nvidia-elements/monaco';
import { MonacoEditor } from '@nvidia-elements/monaco/editor';
import '@nvidia-elements/monaco/editor/define.js';

const value = `type Package = {
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

describe('nve-monaco-editor', () => {
  let fixture: HTMLElement;
  let element: MonacoEditor;
  let model: monaco.editor.ITextModel;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-monaco-editor></nve-monaco-editor>
    `);
    element = fixture.querySelector(MonacoEditor.metadata.tag) as MonacoEditor;

    await untilEvent(element, 'ready');

    const { editor, monaco } = element;
    model = monaco.editor.createModel(value, 'typescript');
    editor.setModel(model);

    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
    model.dispose();
  });

  it('should define element', async () => {
    expect(customElements.get(MonacoEditor.metadata.tag)).toBeDefined();
  });

  it('should render editor', async () => {
    expect(element.shadowRoot.querySelector('#editor')).toBeDefined();
    expect(element.shadowRoot.querySelector('.monaco-editor')).toBeDefined();
  });
});
