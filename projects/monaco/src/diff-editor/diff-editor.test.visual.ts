import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

const options = {
  network: true
};

describe('monaco diff editor visual', () => {
  test('editor should match visual baseline when narrow', async () => {
    const report = await visualRunner.render('monaco-diff-editor.narrow', template('', 640, 486), options);
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(20);
  });

  test('editor should match visual baseline when wide', async () => {
    const report = await visualRunner.render('monaco-diff-editor.wide', template('', 1280, 486), options);
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(20);
  });

  test('editor should match visual baseline dark theme when narrow', async () => {
    const report = await visualRunner.render('monaco-diff-editor.dark.narrow', template('dark', 640, 486), options);
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(20);
  });

  test('editor should match visual baseline dark theme when wide', async () => {
    const report = await visualRunner.render('monaco-diff-editor.dark.wide', template('dark', 1280, 486), options);
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(20);
  });
});

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

function template(theme: '' | 'dark' = '', width: number, height: number) {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/monaco/diff-editor/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="column gap:md align:stretch" style="width: ${width}px; height: ${height}px;">
    <nve-monaco-diff-editor></nve-monaco-diff-editor>
  </div>

  <script type="module">
  const diffEditorEl = document.querySelector('nve-monaco-diff-editor');
  diffEditorEl.addEventListener('ready', (event) => {
    const { editor, monaco } = event.target;
    const original = monaco.editor.createModel(
      \`${originalValue}\`,
      'typescript',
      monaco.Uri.parse('diff:///src/example.ts')
    );
    const modified = monaco.editor.createModel(
      \`${modifiedValue}\`,
      'typescript',
      monaco.Uri.parse('file:///src/example.ts')
    );
    editor.setModel({ original, modified });
  });
  </script>
  `;
}
