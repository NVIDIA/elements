# @nvidia-elements/markdown

A web component for rendering markdown content with full styling support.

## Features

- **Markdown Parsing**: Full markdown support with syntax highlighting, links, lists, and more
- **HTML Templates**: Support for raw HTML content via template elements
- **Two Input Modes**: Clear separation between markdown (source) and HTML (template)
- **Performance Optimized**: Lazy-loaded markdown parser for better initial load times
- **Design System Integration**: Styled with NVE design tokens and CSS custom properties

## Getting Started

```bash
# local .npmrc file
registry=https://registry.npmjs.org

# https://registry.npmjs.org
npm login

# install
npm install @nvidia-elements/markdown
```

## Usage

### Markdown Content (via source property)

Perfect for dynamic content and programmatic updates:

````html
<nve-markdown source="# Hello World

This is **bold** and *italic* text with a [link](https://example.com).

- List item 1
- List item 2

```javascript
const code = 'example';
```"></nve-markdown>
````

```javascript
// Programmatic updates
const element = document.querySelector('nve-markdown');
element.source = '# Updated Content\n\nNew markdown content here.';
```

### HTML Content (via template)

Perfect for static content and precise HTML control:

```html
<nve-markdown>
  <template>
    <h1>Static HTML Content</h1>
    <p>This content is <strong>HTML</strong> and won't be parsed as markdown.</p>
    <ul>
      <li>HTML list item 1</li>
      <li>HTML list item 2</li>
    </ul>
  </template>
</nve-markdown>
```

## API

### Properties

| Property | Type     | Description                          |
| -------- | -------- | ------------------------------------ |
| `source` | `string` | Markdown content to parse and render |

### Slots

| Slot      | Description                                          |
| --------- | ---------------------------------------------------- |
| (default) | Can contain a `<template>` element with HTML content |

## Examples

See the [examples](./src/markdown/markdown.stories.ts) for comprehensive usage demonstrations.

## Development

```bash
# Run tests
pnpm run test

# Run with watch mode
pnpm run test:watch

# Run lighthouse performance tests
pnpm run test:lighthouse

# Lint code
pnpm run lint
```
