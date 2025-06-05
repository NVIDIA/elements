import { expect, test, describe } from 'vitest';
import { visualRunner } from '@nve-internals/vite';

describe('monaco editor visual', () => {
  test('editor should match visual baseline', async () => {
    const report = await visualRunner.render('monaco-editor', template(), { network: true });
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(5);
  });

  test('editor should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('monaco-editor.dark', template('dark'), { network: true });
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(5);
  });
});

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

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/monaco/editor/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="column gap:md" style="width: 640px; height: 400px;">
    <nve-monaco-editor></nve-monaco-editor>
  </div>

  <script type="module">
    const editor = document.querySelector('nve-monaco-editor');
    editor.addEventListener('ready', (event) => {
      const model = event.target.editor.getModel();
      model.setLanguage('typescript');
      model.setValue(\`${exampleValue}\`);
    });
  </script>
  `;
}
