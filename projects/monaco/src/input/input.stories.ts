import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/monaco/input/define.js';

export default {
  title: 'Monaco/Input',
  component: 'nve-monaco-input'
};

export const Default = {
  render: () => html`
<nve-monaco-input language="typescript" value="console.log('Hello, world!');"></nve-monaco-input>
<script type="module">
  const input = document.querySelector('nve-monaco-input');
  input.addEventListener('input', () => console.log('input: ', input.value));
  input.addEventListener('change', () => console.log('change: ', input.value));
</script>
`
};

export const WithOptionalAttributes = {
  render: () => html`
<nve-monaco-input value="console.log('Hello, world!');" line-numbers="on" folding minimap></nve-monaco-input>
`
};

export const ReadOnly = {
  render: () => html`
<nve-monaco-input readonly value="console.log('Hello, world!');"></nve-monaco-input>
`
};

export const Disabled = {
  render: () => html`
<nve-monaco-input value="console.log('Hello, world!');" disabled></nve-monaco-input>
`
};

export const Control = {
  render: () => html`
  <nve-control>
    <label>label</label>
    <nve-monaco-input value="console.log('Hello, world!');" nve-control language="javascript"></nve-monaco-input>
    <nve-control-message>message<span id="emoji"></span></nve-control-message>
  </nve-control>
  `
};

export const JSONSchemaValidation = {
  render: () => html`
  <form id="json-schema-validation-example" nve-layout="column gap:lg">
    <nve-control style="width: 100%;">
      <label>JSON Configuration</label>
      <nve-monaco-input 
        nve-control 
        name="config" 
        language="json"
      ></nve-monaco-input>
      <nve-control-message>JSON schema validation errors will prevent form submission</nve-control-message>
    </nve-control>
    <nve-button type="submit">Submit</nve-button>
  </form>

  <script type="module">
    const form = document.querySelector('form#json-schema-validation-example');
    const input = form.querySelector('nve-monaco-input');
    input.schema = {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        version: { type: 'string', pattern: '^\\\\d+\\\\.\\\\d+\\\\.\\\\d+$', description: 'Semantic version number' },
        description: { type: 'string', description: 'Project description' }
      },
      required: ['name', 'version']
    };
    input.value = JSON.stringify({
      name: "my-app",
      version: "1.0.0"
    }, null, 2);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      console.log('Form data:', {
        config: formData.get('config')
      });
    });
  </script>
  `
};

export const TypeScriptValidation = {
  render: () => html`
  <form id="typescript-validation-example" nve-layout="column gap:lg">
    <nve-control style="width: 100%;">
      <label>TypeScript Code</label>
      <nve-monaco-input nve-control name="code" language="typescript"></nve-monaco-input>
      <nve-control-message>TypeScript validation errors will prevent form submission</nve-control-message>
    </nve-control>
    <nve-button type="submit">Submit</nve-button>
  </form>

  <script type="module">
    const form = document.querySelector('form#typescript-validation-example');
    const input = form.querySelector('nve-monaco-input');
    input.value = 'const x: number = "string"; // Type error';

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      console.log('Form data:', {
        code: formData.get('code')
      });
    });
  </script>
  `
};