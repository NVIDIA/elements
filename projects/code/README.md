# @nvidia-elements/code

NVIDIA Design System and UI Agent Harness for AI/ML Factories, Robotics, and Autonomous Vehicles.

Syntax-highlighted codeblocks and editable native textareas supporting many programming languages.

Syntax coloring uses the CSS Custom Highlight API over preserved code text. Browsers without that API display plain code. Line numbers remain outside the copyable code. Markdown bold and italic scopes use semantic colors; native highlights do not provide bold or italic typography.

The build compiles grammar sources into indexed scanner data. The package includes [grammar source notices](dist/GRAMMAR-LICENSES.txt) and a [source manifest](dist/highlight-grammars.json) alongside the generated modules.

The shared browser engine lives in `src/internal/highlight/`. Grammar compilation runs from `build/highlight/` as a prerequisite of the library build. Generated machine data lives in `src/internal/highlight/generated/`; the scanner and registry remain authored source. See [Development](DEVELOPMENT.md) for the source layout, language additions, validation, and measurements.

`typescript` uses the TypeScript grammar. Import `codeblock/languages/tsx.js` and use `language="tsx"` for TypeScript with JSX. Markdown fences select the same distinct grammars through `ts` or `typescript`, and `tsx`.

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
import '@nvidia-elements/code/codeblock/languages/bash.js';
import '@nvidia-elements/code/codeblock/languages/css.js';
import '@nvidia-elements/code/codeblock/languages/go.js';
import '@nvidia-elements/code/codeblock/languages/html.js';
import '@nvidia-elements/code/codeblock/languages/javascript.js';
import '@nvidia-elements/code/codeblock/languages/json.js';
import '@nvidia-elements/code/codeblock/languages/markdown.js';
import '@nvidia-elements/code/codeblock/languages/python.js';
import '@nvidia-elements/code/codeblock/languages/toml.js';
import '@nvidia-elements/code/codeblock/languages/tsx.js';
import '@nvidia-elements/code/codeblock/languages/typescript.js';
import '@nvidia-elements/code/codeblock/languages/xml.js';
import '@nvidia-elements/code/codeblock/languages/yaml.js';

// import codeblock component
import '@nvidia-elements/code/codeblock/define.js';
```

```html
<nve-codeblock language="typescript">
  <template>
    console.log('hello there')
  </template>
</nve-codeblock>
```

## Editable code

Import `@nvidia-elements/code/code-textarea/define.js` and the same language modules used by codeblocks:

```html
<nve-code-textarea language="typescript">
  <label>Source code</label>
  <textarea name="source" rows="8" spellcheck="false">const answer: number = 42;</textarea>
</nve-code-textarea>
```

The slotted textarea retains native selection, undo, composition, validation, and form submission. Highlighting uses native opaque value ranges without an overlay or token elements. Browsers without `textarea.createValueRange()` keep a usable plain textarea.

Direct `textarea.value` assignments and native input/reset events refresh highlighting. After `setRangeText()` or an edit that bypasses the observed setter, call `codeTextarea.refreshHighlighting()`. The component reuses scanner checkpoints and unchanged native ranges for ordinary input edits.

See [Code Textarea documentation](https://NVIDIA.github.io/elements/docs/code/code-textarea/) for the full editing contract. Large documents can incur native range painting costs. Use this component for source snippets and form fields.

## NVIDIA Elements Skill

Install the Elements agent skill with the open [skills](https://www.skills.sh/nvidia/elements/elements) CLI:

```shell
npx skills add https://github.com/nvidia/elements --skill elements
```
