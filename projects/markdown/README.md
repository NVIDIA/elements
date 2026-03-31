# @nvidia-elements/markdown

A Web Component for rendering markdown content with full styling support.

- [Documentation](https://NVIDIA.github.io/elements/docs/markdown/)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)
- [GitLab Repo](https://github.com/NVIDIA/elements)
- [Artifactory](https://registry.npmjs.org

## Getting Started

```bash
# local .npmrc file
registry=https://registry.npmjs.org

# https://registry.npmjs.org
npm login

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

## Features

- **Markdown Parsing**: Full markdown support with syntax highlighting, links, lists, and more
- **HTML Templates**: Support for raw HTML content via template elements
- **Two Input Modes**: Clear separation between markdown (source) and HTML (template)
- **Performance Optimized**: Lazy-loaded markdown parser for better initial load times
- **Design System Integration**: Styled with NVE design tokens and CSS custom properties
