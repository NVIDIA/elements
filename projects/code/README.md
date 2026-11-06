# @nvidia-elements/code

NVIDIA Design System and UI Agent Harness for AI/ML Factories, Robotics, and Autonomous Vehicles.

Syntax-highlighted code block components supporting many programming languages.

- [Documentation](https://NVIDIA.github.io/elements/docs/code/)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)
- [GitHub Repo](https://github.com/NVIDIA/elements)
- [npm](https://www.npmjs.com/package/@nvidia-elements/code)

## Getting Started

```bash
npm install @nvidia-elements/code
```

## Usage

```javascript
// import only languages needed
import '@nvidia-elements/code/code-block/languages/bash.js';
import '@nvidia-elements/code/code-block/languages/css.js';
import '@nvidia-elements/code/code-block/languages/go.js';
import '@nvidia-elements/code/code-block/languages/html.js';
import '@nvidia-elements/code/code-block/languages/javascript.js';
import '@nvidia-elements/code/code-block/languages/json.js';
import '@nvidia-elements/code/code-block/languages/markdown.js';
import '@nvidia-elements/code/code-block/languages/python.js';
import '@nvidia-elements/code/code-block/languages/toml.js';
import '@nvidia-elements/code/code-block/languages/typescript.js';
import '@nvidia-elements/code/code-block/languages/xml.js';
import '@nvidia-elements/code/code-block/languages/yaml.js';

// import codeblock component
import '@nvidia-elements/code/code-block/define.js';
```

```html
<nve-code-block language="typescript">
  <template>
    console.log('hello there')
  </template>
</nve-code-block>
```

## NVIDIA Elements Skill

Install the Elements agent skill with the open [skills](https://www.skills.sh/nvidia/elements/elements) CLI:

```shell
npx skills add https://github.com/nvidia/elements --skill elements
```
