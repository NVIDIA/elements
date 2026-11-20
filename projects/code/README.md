# @nvidia-elements/code

NVIDIA Design System and UI Agent Harness for AI/ML Factories, Robotics, and Autonomous Vehicles.

Code blocks and native textareas with syntax highlighting for supported languages. Both components preserve source text and use the CSS Custom Highlight API.

- [Documentation](https://NVIDIA.github.io/elements/docs/code/)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)
- [GitHub Repo](https://github.com/NVIDIA/elements)
- [npm](https://www.npmjs.com/package/@nvidia-elements/code)

## Getting Started

```bash
npm install @nvidia-elements/code
```

## Usage

Import only the languages you need before registering either component. Both examples use TypeScript.

```javascript
import '@nvidia-elements/code/languages/css.js';
import '@nvidia-elements/code/languages/go.js';
import '@nvidia-elements/code/languages/html.js';
import '@nvidia-elements/code/languages/javascript.js';
import '@nvidia-elements/code/languages/json.js';
import '@nvidia-elements/code/languages/markdown.js';
import '@nvidia-elements/code/languages/python.js';
import '@nvidia-elements/code/languages/tsx.js';
import '@nvidia-elements/code/languages/typescript.js';
import '@nvidia-elements/code/languages/xml.js';
import '@nvidia-elements/code/languages/yaml.js';
```

### Read-only code

```javascript
import '@nvidia-elements/code/code-block/define.js';
```

```html
<nve-code-block language="typescript">
  <template>
    console.log('hello there')
  </template>
</nve-code-block>
```

### Editable code

```javascript
import '@nvidia-elements/code/code-textarea/define.js';
```

```html
<nve-code-textarea language="typescript">
  <label>Source code</label>
  <textarea name="source" rows="8" spellcheck="false">const answer: number = 42;</textarea>
</nve-code-textarea>
```

The textarea retains native editing and form behavior. See the [Code Textarea documentation](https://NVIDIA.github.io/elements/docs/code/code-textarea/) for examples.

## NVIDIA Elements Skill

Install the Elements agent skill with the open [skills](https://www.skills.sh/nvidia/elements/elements) CLI:

```shell
npx skills add https://github.com/nvidia/elements --skill elements
```
