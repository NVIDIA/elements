import { expect, test, describe } from 'vitest';
import { visualRunner } from '@nve-internals/vite';

describe('monaco diff input visual', () => {
  test('input should match visual baseline when narrow', async () => {
    const report = await visualRunner.render('monaco-diff-input.narrow', template('', 640, 1252), { network: true });
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(5);
  });

  test('input should match visual baseline when wide', async () => {
    const report = await visualRunner.render('monaco-diff-input.wide', template('', 1280, 1252), { network: true });
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(5);
  });

  test('input should match visual baseline dark theme when narrow', async () => {
    const report = await visualRunner.render('monaco-diff-input.dark.narrow', template('dark', 640, 1252), {
      network: true
    });
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(5);
  });

  test('input should match visual baseline dark theme when wide', async () => {
    const report = await visualRunner.render('monaco-diff-input.dark.wide', template('dark', 1280, 1252), {
      network: true
    });
    expect(report.maxDiffPercentage).toBeLessThanOrEqual(5);
  });
});

const originalJsonValue = `{
  "name": "my-original-app",
  "version": "0.0.0"
}`;

const jsonValue = `{
  "name": "my-modified-app",
  "version": "1.0.0"
}`;

const invalidJsonValue = `{
  "name": "my-modified-app",
  "version": "1.0.0",
  "description": 42
}`;

const jsonSchema = `{
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "Project name" },
    "version": { "type": "string", "pattern": "^\\\\d+\\\\.\\\\d+\\\\.\\\\d+$", "description": "Semantic version number" },
    "description": { "type": "string", "description": "Project description" }
  },
  "required": ["name", "version"]
}`;

function template(theme: '' | 'dark' = '', width: number, height: number) {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/forms/define.js';
    import '@nvidia-elements/monaco/diff-input/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="column gap:md" style="width: ${width}px; height: ${height}px;">
    <nve-monaco-diff-input language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${jsonValue}'></nve-monaco-diff-input>

    <nve-monaco-diff-input language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${jsonValue}' disabled></nve-monaco-diff-input>

    <nve-monaco-diff-input language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${jsonValue}' line-numbers="on" side-by-side></nve-monaco-diff-input>

    <nve-control style="width: 100%;">
      <label>•︎•︎•︎•︎•︎•︎</label>
      <nve-monaco-diff-input nve-control language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${jsonValue}' line-numbers="on" side-by-side></nve-monaco-diff-input>
      <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
    </nve-control>

    <nve-control style="width: 100%;">
      <label>•︎•︎•︎•︎•︎•︎</label>
      <nve-monaco-diff-input nve-control language="json" schema='${jsonSchema}' original='${originalJsonValue}' value='${invalidJsonValue}' line-numbers="on" side-by-side></nve-monaco-diff-input>
      <nve-control-message>•︎•︎•︎•︎•︎•︎</nve-control-message>
    </nve-control>
  </div>
  `;
}
