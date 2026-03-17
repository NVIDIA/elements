import { html } from 'lit';
import '@nvidia-elements/markdown/markdown/define.js';
import '@nvidia-elements/markdown/styles/index.css';

/* eslint-disable @nvidia-elements/lint/no-unstyled-typography */

export default {
  title: 'Elements/Markdown',
  component: 'nve-markdown'
};

/** @summary Markdown component rendering content from a template element. */
export const Default = {
  render: () => html`
<nve-markdown>
  <template>
    # Default

    This is a default markdown component in its initial state.

    - List item 1
    - List item 2
    - List item 3
  </template>
</nve-markdown>
  `
};

/**
 * @summary Comprehensive typography demo using template element with headings, lists, links, and inline code
 * @tags test-case
 */
export const KitchenSinkFromTemplate = {
  render: () => html`
<nve-markdown>
  <template>
# Comprehensive Markdown Documentation Example

This document demonstrates **100%** of the styling capabilities of the nve-markdown component, covering all CSS rules defined in the stylesheet.

## Typography and Text Formatting

Markdown supports various text formatting options including **bold text**, *italic text*, and ***bold italic text***.

For technical documentation, you might need <kbd>Ctrl</kbd> + <kbd>C</kbd> for keyboard shortcuts, <var>x</var> = <var>y</var> + 5 for variables, or <samp>Hello World</samp> for sample output.

### Links and References

Here's an example of an [internal link](#internal), and an [external link](https://example.com) that opens in a new tab.

For scientific notation: H<sub>2</sub>O and E=mc<sup>2</sup> demonstrate subscript and superscript formatting.

#### Text Modifications

Sometimes you need to show <del>deleted text</del> and <ins>inserted text</ins> to track changes. Use <abbr title="Hypertext Markup Language">HTML</abbr> for abbreviations with tooltips.

<small>Fine print: This text uses the small element for disclaimers or additional notes that are less prominent.</small>

## Lists and Hierarchies

### Unordered Lists

- First level item one
- First level item two
  - Second level item one
  - Second level item two
    - Third level item
- First level item three

This paragraph tests that lists properly end with margin-bottom.

### Ordered Lists

1. Step one: Initialize the project
2. Step two: Install dependencies
   1. Run \\\`npm install\\\`
   2. Verify installation
3. Step three: Start development server

## Code Examples

Inline code like \`const greeting = "Hello";\` is useful for short snippets.
  </template>
</nve-markdown>
  `
};

/**
 * @summary Comprehensive typography demo using JavaScript source property with tables, blockquotes, and status indicators
 * @tags test-case
 */
export const KitchenSinkFromSource = {
  render: () => html`
    <div>
      <nve-markdown id="kitchen-sink-source"></nve-markdown>
      
      <script type="module">
        const element = document.getElementById('kitchen-sink-source');
        
        const markdownContent = \`# Comprehensive Markdown Documentation Example

This document demonstrates **100%** of the styling capabilities of the nve-markdown component, covering all CSS rules defined in the stylesheet.

## Typography and Text Formatting

Markdown supports various text formatting options including **bold text**, *italic text*, and ***bold italic text***. You can also use <mark>highlighted text</mark> to draw attention to specific content.

For technical documentation, you might need <kbd>Ctrl</kbd> + <kbd>C</kbd> for keyboard shortcuts, <var>x</var> = <var>y</var> + 5 for variables, or <samp>Hello World</samp> for sample output.

### Links and References

Here's an example of an [internal link](#internal), and an [external link](https://example.com) that opens in a new tab.

For scientific notation: H<sub>2</sub>O and E=mc<sup>2</sup> demonstrate subscript and superscript formatting.

#### Text Modifications

Sometimes you need to show <del>deleted text</del> and <ins>inserted text</ins> to track changes. Use <abbr title="Hypertext Markup Language">HTML</abbr> for abbreviations with tooltips.

<small>Fine print: This text uses the small element for disclaimers or additional notes that are less prominent.</small>

## Lists and Hierarchies

### Unordered Lists

- First level item one
- First level item two
  - Second level item one
  - Second level item two
    - Third level item
- First level item three

This paragraph tests that lists properly end with margin-bottom.

### Ordered Lists

1. Step one: Initialize the project
2. Step two: Install dependencies
   1. Run \\\`npm install\\\`
   2. Verify installation
3. Step three: Start development server

## Code Examples

Inline code like \\\`const greeting = "Hello";\\\` is useful for short snippets.

## Blockquotes and Citations

> "Design is not just what it looks like and feels like. Design is how it works."
>
> This famous quote emphasizes the importance of functionality in design.

## Tables

| Feature | Description | Status | Priority |
|---------|-------------|---------|----------|
| Typography | Complete set of text styles | ✅ Complete | High |
| Lists | Ordered and unordered lists with proper nesting | ✅ Complete | High |
| Code Blocks | Syntax highlighting with overflow support | 🚧 In Progress | Medium |
| Tables | Data presentation with zebra striping | ✅ Complete | Medium |\`;
        
        element.source = markdownContent;
      </script>
    </div>
  `
};

/**
 * @summary Basic inline source attribute usage with headings, lists, bold/italic text, and code blocks
 * @tags test-case
 */
export const FromSource = {
  render: () => html`
<nve-markdown source="# This is a heading

- list item 1
- list item 2
- list item 3

**Bold text** and *italic text* with a [link](https://example.com).

\`\`\`javascript
const code = 'example';
\`\`\`"></nve-markdown>
  `
};

/** @summary Markdown content defined inside a template element with nested lists and inline formatting */
export const FromTemplate = {
  render: () => html`
<nve-markdown>
  <template>
# Markdown from Template

This content is **markdown** inside a template element.

### Unordered Lists

- First level item one
- First level item two
  - Second level item one
  - Second level item two
    - Third level item
- First level item three

This paragraph tests that lists properly end with margin-bottom.

### Ordered Lists

1. Step one: Initialize the project
2. Step two: Install dependencies
   1. Run \\\`npm install\\\`
   2. Verify installation
3. Step three: Start development server

**Bold text** and *italic text* with a [link](https://example.com).
  </template>
</nve-markdown>
  `
};

/** @summary Mixing raw HTML elements with markdown syntax within a template */
export const CombinedFromTemplate = {
  render: () => html`
<nve-markdown>
  <template>
# Markdown from Template

This content is **markdown** inside a template element.

- Template list item 1 
- Template list item 2 
- Template list item 3 

## HTML Mixed with Markdown

This content has <strong>HTML</strong> mixed with markdown.
<ul>
  <li>HTML list item 1</li>
  <li>HTML list item 2</li>
  <li>HTML list item 3</li>
</ul>
  </template>
</nve-markdown>
  `
};

/**
 * @summary Progressive streaming demo simulating AI assistant responses with block-by-block content rendering
 * @tags test-case
 */
export const JavaScriptDriven = {
  render: () => html`
    <div>
      <nve-markdown id="programmatic-markdown"></nve-markdown>
      
      <script type="module">
        const element = document.getElementById('programmatic-markdown');
        // Complete markdown content to stream
        const fullContent = \`# AI Assistant Response
\\n
Thank you for your question about **markdown streaming**. Here's how it works:
\\n
## Key Features
\\n
- **Real-time parsing** as content arrives
- *Progressive* rendering updates  
- Smooth user experience
- Dynamic content handling
\\n
### Implementation Example
\\n
\\\`\\\`\\\`javascript
const element = document.getElementById('markdown');
element.source = streamingContent;
\\\`\\\`\\\`
\\n
## How It Works
\\n
The markdown component processes content incrementally, allowing for:
\\n
1. **Streaming responses** from AI systems
2. **Live updates** without page refreshes
3. **Progressive enhancement** of content
\\n
### Use Cases
\\n
- Chat applications with AI assistants
- Real-time documentation generation
- Interactive tutorials and guides
- Live content editing interfaces
\\n
## Technical Details
\\n
The component uses a reactive approach:
\\n
- Watches for \\\`source\\\` property changes
- Re-parses markdown on each update
- Maintains smooth rendering performance
- Handles both markdown and HTML content types
\\n
### Performance Benefits
\\n
- **Lazy loading** of markdown parser
- **Efficient re-rendering** with Lit's update cycle
- **Memory optimization** through proper cleanup
\\n
> Perfect for AI assistants and real-time documentation!\`;
        // Split content into blocks/paragraphs for progressive display
        const blocks = fullContent.split('\\n');
        let currentBlockIndex = 0;
        function streamContent() {
          if (currentBlockIndex < blocks.length) {
            // Add 1 block at a time to preserve markdown structure
            currentBlockIndex++;
            const currentContent = blocks.slice(0, currentBlockIndex).join(' \\n');
            
            element.source = currentContent;
            
            setTimeout(streamContent, 300);
          }
        }
        // Start streaming after a brief delay
        setTimeout(streamContent, 1000);
      </script>
    </div>
  `
};

/**
 * @summary Interactive demo with buttons to switch between different source content dynamically
 * @tags test-case
 */
export const DynamicSource = {
  render: () => html`
    <div>
      <h3>Dynamic Source Demo</h3>
      <p>This demonstrates switching between two HTML contents via the source property.</p>
      
      <nve-markdown id="dynamic-source-markdown" type="html"></nve-markdown>
      
      <div style="margin-top: 1rem;">
        <button id="switch-to-source-1">Switch to Source 1</button>
        <button id="switch-to-source-2">Switch to Source 2</button>
      </div>
      
      <script type="module">
        const nveMarkdown = document.getElementById('dynamic-source-markdown');
        const source1Btn = document.getElementById('switch-to-source-1');
        const source2Btn = document.getElementById('switch-to-source-2');
        
        source1Btn.addEventListener('click', () => {
          nveMarkdown.source = '# Source 1';
        });
        
        source2Btn.addEventListener('click', () => {
          nveMarkdown.source = '# Source 2';
        });
      </script>
    </div>
  `
};

/** 
 * @summary Full markdown-it feature showcase with all heading levels, horizontal rules, emphasis, blockquotes, and tables
 * @tags test-case
 */
export const FullFeature = {
  render: () => html`
    <div>
      <nve-markdown id="markdown-it-demo"></nve-markdown>
      
      <script type="module">
        const element = document.getElementById('markdown-it-demo');
        
        const markdownContent = \`# h1 Heading

## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading


## Horizontal Rules

___

---

***


## Typographic replacements

Enable typographer option to see result.

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,  -- ---

"Smartypants, double quotes" and 'single quotes'


## Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~


## Blockquotes


> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.


## Lists

### Unordered

+ Create a list by starting a line with \\\`+\\\`, \\\`-\\\`, or \\\`*\\\`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Marker character change
    + Marker character change
    - Marker character change
+ Very easy!

### Ordered

1. A list item with a number
2. A list item with a number
3. A list item with a number

1. You can use sequential numbers...
1. ...or keep all the numbers as \\\`1.\\\`

Start numbering with offset:

57. foo
1. bar


## Code

Inline \\\`code\\\`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code


Block code "fences"

\\\`\\\`\\\`
Sample text here...
\\\`\\\`\\\`

Syntax highlighting

\\\`\\\`\\\` js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
\\\`\\\`\\\`

## Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |


## Links

[link text](http://dev.nodeca.com)

[link with title](http://nodeca.github.io/pica/demo/ "title text!")

Autoconverted link https://github.com/nodeca/pica (enable linkify to see)


## Images

![TestImage](/static/images/test-map-2.webp "Test Image")
\`;
        
        element.source = markdownContent;
      </script>
    </div>
  `
};

/**
 * @summary CSS utility attribute for applying markdown typography styles to any element without using the Web Component. Use the nve-markdown attribute on a container and import the styles CSS file separately.
 * @tags test-case
 */
export const CssUtility = {
  render: () => html`
    <div nve-markdown>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
      <ul>
        <li>Unordered list item 1</li>
        <li>Unordered list item 2</li>
      </ul>
      <ol>
        <li>Ordered list item 1</li>
        <li>Ordered list item 2</li>
      </ol>
      <blockquote>this is a blockqoute</blockquote>
      <strong>strong</strong>
      <del>del</del>
      <em>em</em>
      <table>
        <thead>
          <tr>
            <th>Syntax</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Header</td>
            <td>Title</td>
          </tr>
          <tr>
            <td>Paragraph</td>
            <td>Text</td>
          </tr>
        </tbody>
      </table>
    </div>
    <script type="module">
      import '@nvidia-elements/markdown/styles/index.css';
    </script>
  `
};
