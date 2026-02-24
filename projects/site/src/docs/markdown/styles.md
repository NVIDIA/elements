---
{
  title: 'Markdown CSS Utility',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

### Installation

```html
<link rel="stylesheet" type="text/css" href="@nvidia-elements/markdown/dist/styles/index.css" />
```

### Usage

To style the content inside an HTML element with the markdown styles,
add `nve-markdown` attribute to the element.

### Example

{% example '@nvidia-elements/markdown/markdown/markdown.examples.json', 'CssUtility' %}

### Supported tags

- Headings (`h1`, `h2`, `h3`, `h4`, `h5`, `h6`)
- Unordered Lists (`ul`, `li`)
- Ordered Lists (`ol`, `li`)
- Blockquote (`blockquote`)
- Code (`pre`, `code`)
- Table (`table`, `thead`, `th`, `tr`, `td`)
- Image (`img`)
- Paragraph (`p`)
- Links (`a`)
- Bold (`strong`)
- Strikethrough (`del`)
- Italics (`em`)
