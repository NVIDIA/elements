// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

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

export function readyCheck(evaluate: (fn: () => boolean) => Promise<boolean>) {
  return evaluate(() => document.querySelectorAll('nve-monaco-diff-editor:state(ready)').length === 2);
}

export function template() {
  return /* html */ `
  <div nve-layout="column gap:md align:stretch" style="width: 640px; height: 486px;">
    <nve-monaco-diff-editor id="diff-editor-narrow"></nve-monaco-diff-editor>
  </div>
  <div nve-layout="column gap:md align:stretch" style="width: 1280px; height: 486px;">
    <nve-monaco-diff-editor id="diff-editor-wide"></nve-monaco-diff-editor>
  </div>

  <script type="module">
    const diffEditorNarrow = document.querySelector('nve-monaco-diff-editor#diff-editor-narrow');
    diffEditorNarrow.addEventListener('ready', (event) => {
      const { editor, monaco } = event.target;
      const original = monaco.editor.createModel(\`${originalValue}\`, 'typescript', monaco.Uri.parse('diff:///src/example-narrow.ts'));
      const modified = monaco.editor.createModel(\`${modifiedValue}\`, 'typescript', monaco.Uri.parse('file:///src/example-narrow.ts'));
      editor.setModel({ original, modified });
    });

    const diffEditorWide = document.querySelector('nve-monaco-diff-editor#diff-editor-wide');
    diffEditorWide.addEventListener('ready', (event) => {
      const { editor, monaco } = event.target;
      const original = monaco.editor.createModel(\`${originalValue}\`, 'typescript', monaco.Uri.parse('diff:///src/example-wide.ts'));
      const modified = monaco.editor.createModel(\`${modifiedValue}\`, 'typescript', monaco.Uri.parse('file:///src/example-wide.ts'));
      editor.setModel({ original, modified });
    });
  </script>
  `;
}
