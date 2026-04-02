// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const exampleValue = `type Package = {
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
  return evaluate(() => document.querySelectorAll('nve-monaco-editor:state(ready)').length === 1);
}

export function template() {
  return /* html */ `
  <div nve-layout="column gap:md align:stretch" style="width: 640px; height: 400px;">
    <nve-monaco-editor id="editor"></nve-monaco-editor>
  </div>

  <script type="module">
    const editor = document.querySelector('nve-monaco-editor#editor');
    editor.addEventListener('ready', (event) => {
      const model = event.target.editor.getModel();
      model.setLanguage('typescript');
      model.setValue(\`${exampleValue}\`);
    });
  </script>
  `;
}
