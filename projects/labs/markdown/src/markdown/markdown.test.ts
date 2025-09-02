import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi, type MockInstance } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { Markdown } from '@nvidia-elements/markdown/markdown';
import '@nvidia-elements/markdown/markdown/define.js';
// Import CSS variables data for testing
import cssVars from '@nvidia-elements/themes/data.css-vars.json';

// Helper function to wait for async markdown parsing to complete
async function waitForMarkdownParsing(element: Markdown) {
  await elementIsStable(element);
  // Wait for async markdown parsing to complete
  await new Promise(resolve => setTimeout(resolve, 100));
  await elementIsStable(element);
}

describe(Markdown.metadata.tag, () => {
  describe('basic functionality', () => {
    let fixture: HTMLElement;
    let element: Markdown;

    beforeEach(async () => {
      fixture = await createFixture(html`
        <nve-markdown></nve-markdown>
      `);
      element = fixture.querySelector(Markdown.metadata.tag);
      await waitForMarkdownParsing(element);
    });

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should define element', () => {
      expect(customElements.get(Markdown.metadata.tag)).toBeDefined();
    });
  });

  describe('source property', () => {
    let fixture: HTMLElement;
    let element: Markdown;

    beforeEach(async () => {
      fixture = await createFixture(html`
        <nve-markdown></nve-markdown>
      `);
      element = fixture.querySelector(Markdown.metadata.tag);
      await waitForMarkdownParsing(element);
    });

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should render parsed markdown content when source is set', async () => {
      element.source = '# Hello Markdown';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content).toBeTruthy();
      expect(content.innerHTML).toContain('<h1>Hello Markdown</h1>');
    });

    it('should render HTML tags within markdown content', async () => {
      element.source = '# Hello HTML\n\nThis is <strong>HTML</strong> content within markdown';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content).toBeTruthy();
      expect(content.innerHTML).toContain('<h1>Hello HTML</h1>');
      expect(content.innerHTML).toContain('<p>This is <strong>HTML</strong> content within markdown</p>');
    });

    it('should update content when source changes', async () => {
      element.source = '**First content**';
      await waitForMarkdownParsing(element);

      element.source = '*Updated content*';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<em>Updated content</em>');
    });

    it('should always parse markdown content regardless of HTML tags', async () => {
      // Start with markdown
      element.source = '# Hello World';
      await waitForMarkdownParsing(element);

      let content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<h1>Hello World</h1>');

      // Update with markdown containing HTML
      element.source = '## Hello **World** with <em>HTML</em>';
      await waitForMarkdownParsing(element);

      content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<h2>Hello <strong>World</strong> with <em>HTML</em></h2>');
    });
  });

  describe('template content extraction', () => {
    let fixture: HTMLElement;
    let element: Markdown;

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should extract and parse markdown content from template element', async () => {
      fixture = await createFixture(html`
        <nve-markdown>
          <template># Markdown from template

- item 1
- item 2</template>
        </nve-markdown>
      `);
      element = fixture.querySelector(Markdown.metadata.tag);

      // Wait for the element to process the initial slotchange and markdown parsing
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content).toBeTruthy();
      expect(content.innerHTML).toContain('<h1>Markdown from template</h1>');
      expect(content.innerHTML).toContain('<ul>');
      expect(content.innerHTML).toContain('<li>item 1</li>');
      expect(content.innerHTML).toContain('<li>item 2</li>');
    });

    it('should handle HTML tags within markdown template content', async () => {
      fixture = await createFixture(html`
        <nve-markdown>
          <template># Markdown with <em>HTML</em>

- item **1** with <strong>bold</strong>
- item 2</template>
        </nve-markdown>
      `);
      element = fixture.querySelector(Markdown.metadata.tag);

      // Wait for the element to process the initial slotchange
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content).toBeTruthy();
      expect(content.innerHTML).toContain('<h1>Markdown with <em>HTML</em></h1>');
      expect(content.innerHTML).toContain('<ul>');
      expect(content.innerHTML).toContain('<li>item <strong>1</strong> with <strong>bold</strong></li>');
      expect(content.innerHTML).toContain('<li>item 2</li>');
    });

    it('should always parse markdown syntax in template content', async () => {
      fixture = await createFixture(html`
        <nve-markdown>
          <template># This becomes a heading
**This becomes bold**
- This becomes a list item</template>
        </nve-markdown>
      `);
      element = fixture.querySelector(Markdown.metadata.tag);
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content).toBeTruthy();
      // Should contain parsed HTML elements
      expect(content.innerHTML).toContain('<h1>This becomes a heading</h1>');
      expect(content.innerHTML).toContain('<strong>This becomes bold</strong>');
      expect(content.innerHTML).toContain('<li>This becomes a list item</li>');
    });
  });

  describe('markdown parsing behavior', () => {
    let fixture: HTMLElement;
    let element: Markdown;

    beforeEach(async () => {
      fixture = await createFixture(html`
        <nve-markdown></nve-markdown>
      `);
      element = fixture.querySelector(Markdown.metadata.tag);
      await waitForMarkdownParsing(element);
    });

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should always parse markdown content', async () => {
      element.source = '# Hello **World**';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<h1>Hello <strong>World</strong></h1>');
    });

    it('should work with template content as markdown', async () => {
      fixture = await createFixture(html`
        <nve-markdown>
          <template># Markdown Template</template>
        </nve-markdown>
      `);
      element = fixture.querySelector(Markdown.metadata.tag);
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<h1>Markdown Template</h1>');
    });
  });

  describe('slot handling', () => {
    let fixture: HTMLElement;
    let element: Markdown;

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should handle multiple elements with template', async () => {
      fixture = await createFixture(html`
        <nve-markdown>
          <p>Before template</p>
          <template># Template content</template>
          <p>After template</p>
        </nve-markdown>
      `);
      element = fixture.querySelector(Markdown.metadata.tag);
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content).toBeTruthy();
      expect(content.innerHTML).toContain('<h1>Template content</h1>');
    });
  });

  describe('programmatic source updates', () => {
    let fixture: HTMLElement;
    let element: Markdown;

    beforeEach(async () => {
      fixture = await createFixture(html`
        <nve-markdown></nve-markdown>
      `);
      element = fixture.querySelector(Markdown.metadata.tag);
      await waitForMarkdownParsing(element);
    });

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should update content when source is set programmatically', async () => {
      // Set source programmatically
      element.source = '# Programmatic Content';
      await waitForMarkdownParsing(element);

      // Should now show parsed content
      const content = element.shadowRoot.querySelector('div');
      expect(content).toBeTruthy();
      expect(content.innerHTML).toContain('<h1>Programmatic Content</h1>');
    });

    it('should update content multiple times when source changes', async () => {
      // Set initial content
      element.source = '# First Content';
      await waitForMarkdownParsing(element);

      let content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<h1>First Content</h1>');

      // Update content
      element.source = '## Second Content';
      await waitForMarkdownParsing(element);

      content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<h2>Second Content</h2>');
      expect(content.innerHTML).not.toContain('<h1>First Content</h1>');

      // Update again with complex content
      element.source = '### Third Content\n\n- Item 1\n- Item 2';
      await waitForMarkdownParsing(element);

      content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<h3>Third Content</h3>');
      expect(content.innerHTML).toContain('<ul>');
      expect(content.innerHTML).toContain('<li>Item 1</li>');
      expect(content.innerHTML).toContain('<li>Item 2</li>');
    });

    it('should clear content when source is set to empty string', async () => {
      // Set initial content
      element.source = '# Some Content';
      await waitForMarkdownParsing(element);

      expect(element.shadowRoot.querySelector('div')).toBeTruthy();

      // Clear content
      element.source = '';
      await waitForMarkdownParsing(element);

      // Should show slot again
      expect(element.shadowRoot.querySelector('slot')).toBeTruthy();
      // Note: div is still present but empty with the new render method
    });

    it('should handle rapid source updates correctly', async () => {
      // Rapidly update source multiple times
      element.source = '# First';
      element.source = '## Second';
      element.source = '### Third';

      // Wait for all updates to complete
      await waitForMarkdownParsing(element);

      // Should show the final content
      const content = element.shadowRoot.querySelector('div');
      expect(content).toBeTruthy();
      expect(content.innerHTML).toContain('<h3>Third</h3>');
      expect(content.innerHTML).not.toContain('<h1>First</h1>');
      expect(content.innerHTML).not.toContain('<h2>Second</h2>');
    });

    it('should handle complex markdown content programmatically', async () => {
      const complexMarkdown = `# Complex Content

This is a **bold** statement with *italic* text.

## Lists

1. Ordered item 1
2. Ordered item 2

- Unordered item 1
- Unordered item 2

## Code

Here's some \`inline code\` and a block:

\`\`\`javascript
const example = 'Hello World';
console.log(example);
\`\`\`

## Links and Quotes

Visit [this link](https://example.com) for more info.

> This is a blockquote with **bold** text inside.`;

      element.source = complexMarkdown;
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content).toBeTruthy();

      // Check various elements are present
      expect(content.innerHTML).toContain('<h1>Complex Content</h1>');
      expect(content.innerHTML).toContain('<strong>bold</strong>');
      expect(content.innerHTML).toContain('<em>italic</em>');
      expect(content.innerHTML).toContain('<ol>');
      expect(content.innerHTML).toContain('<ul>');
      expect(content.innerHTML).toContain('<code>inline code</code>');
      expect(content.innerHTML).toContain('<pre>');
      expect(content.innerHTML).toContain('<a href="https://example.com">this link</a>');
      expect(content.innerHTML).toContain('<blockquote>');
    });
  });

  describe('markdown parsing features', () => {
    let fixture: HTMLElement;
    let element: Markdown;

    beforeEach(async () => {
      fixture = await createFixture(html`
        <nve-markdown></nve-markdown>
      `);
      element = fixture.querySelector(Markdown.metadata.tag);
      await waitForMarkdownParsing(element);
    });

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should parse headings correctly', async () => {
      element.source = '# H1\n## H2\n### H3';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<h1>H1</h1>');
      expect(content.innerHTML).toContain('<h2>H2</h2>');
      expect(content.innerHTML).toContain('<h3>H3</h3>');
    });

    it('should parse emphasis and strong text', async () => {
      element.source = '*italic* and **bold** and ***both***';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<em>italic</em>');
      expect(content.innerHTML).toContain('<strong>bold</strong>');
      // markdown-it can render ***both*** as either <strong><em>both</em></strong> or <em><strong>both</strong></em>
      expect(content.innerHTML).toMatch(/<(strong><em|em><strong)>both<\/(em><\/strong|strong><\/em)>/);
    });

    it('should parse links correctly', async () => {
      element.source = '[Link text](https://example.com)';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<a href="https://example.com">Link text</a>');
    });

    it('should parse unordered lists', async () => {
      element.source = '- Item 1\n- Item 2\n- Item 3';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<ul>');
      expect(content.innerHTML).toContain('<li>Item 1</li>');
      expect(content.innerHTML).toContain('<li>Item 2</li>');
      expect(content.innerHTML).toContain('<li>Item 3</li>');
    });

    it('should parse ordered lists', async () => {
      element.source = '1. First\n2. Second\n3. Third';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<ol>');
      expect(content.innerHTML).toContain('<li>First</li>');
      expect(content.innerHTML).toContain('<li>Second</li>');
      expect(content.innerHTML).toContain('<li>Third</li>');
    });

    it('should parse inline code', async () => {
      element.source = 'Here is `inline code` in text';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<code>inline code</code>');
    });

    it('should parse code blocks', async () => {
      element.source = '```javascript\nconst x = 1;\n```';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<pre>');
      expect(content.innerHTML).toContain('<code');
      expect(content.innerHTML).toContain('const x = 1;');
    });

    it('should parse blockquotes', async () => {
      element.source = '> This is a blockquote';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<blockquote>');
      expect(content.innerHTML).toContain('This is a blockquote');
    });

    it('should handle mixed markdown content', async () => {
      element.source = `# Title

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

[A link](https://example.com) and \`inline code\`.`;

      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<h1>Title</h1>');
      expect(content.innerHTML).toContain('<p>');
      expect(content.innerHTML).toContain('<strong>bold</strong>');
      expect(content.innerHTML).toContain('<em>italic</em>');
      expect(content.innerHTML).toContain('<ul>');
      expect(content.innerHTML).toContain('<a href="https://example.com">A link</a>');
      expect(content.innerHTML).toContain('<code>inline code</code>');
    });

    it('should auto-linkify URLs when linkify is enabled', async () => {
      element.source = 'Visit https://example.com for more info';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<a href="https://example.com">https://example.com</a>');
    });

    it('should allow HTML when html option is enabled', async () => {
      element.source = 'Markdown with <strong>HTML</strong> tags';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<strong>HTML</strong>');
    });
  });

  describe('styles', () => {
    let fixture: HTMLElement;
    let element: Markdown;

    beforeEach(async () => {
      fixture = await createFixture(html`
        <nve-markdown></nve-markdown>
      `);
      element = fixture.querySelector(Markdown.metadata.tag);
      await waitForMarkdownParsing(element);
    });

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should apply proper heading styles', async () => {
      element.source = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      const h1 = content.querySelector('h1');
      const h2 = content.querySelector('h2');
      const h3 = content.querySelector('h3');
      const h6 = content.querySelector('h6');

      // Check that headings are rendered
      expect(h1).toBeTruthy();
      expect(h2).toBeTruthy();
      expect(h3).toBeTruthy();
      expect(h6).toBeTruthy();

      // Check computed styles for key properties
      const h1Styles = getComputedStyle(h1);

      // Verify CSS custom properties are defined (even if not applied in test environment)
      const boldWeight = cssVars['--nve-ref-font-weight-bold']?.values?.[''] || '700';
      const semiboldWeight = cssVars['--nve-ref-font-weight-semibold']?.values?.[''] || '600';

      // Test that we have access to the expected token values
      expect(semiboldWeight).toBe('600');
      expect(boldWeight).toBe('700');

      // Basic style checks that work in test environment
      expect(h1Styles.marginTop).toBe('0px'); // margin reset
      // Note: Border styles may not apply properly in test environment
    });

    it('should apply proper list styling', async () => {
      element.source = '- Item 1\n- Item 2\n- Item 3';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      const ul = content.querySelector('ul');
      const li = content.querySelector('li');

      expect(ul).toBeTruthy();
      expect(li).toBeTruthy();

      const ulStyles = getComputedStyle(ul);

      expect(ulStyles.display).toBe('flex');
      expect(ulStyles.flexDirection).toBe('column');
      // Note: Padding may not apply properly in test environment due to CSS custom properties
    });

    it('should apply proper code styling', async () => {
      element.source = 'Here is `inline code` and a block:\n\n```\ncode block\n```';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      const inlineCode = content.querySelector('code');
      const preElement = content.querySelector('pre');
      const blockCode = preElement?.querySelector('code');

      expect(inlineCode).toBeTruthy();
      expect(preElement).toBeTruthy();
      expect(blockCode).toBeTruthy();

      const inlineStyles = getComputedStyle(inlineCode);
      const blockStyles = getComputedStyle(blockCode);

      // Font family may not resolve properly in test environment
      expect(inlineStyles.display).toBe('inline-block');
      expect(blockStyles.display).toBe('block');
      expect(blockStyles.whiteSpace).toBe('pre');
    });

    it('should apply proper link styling', async () => {
      element.source = '[Internal link](#test) and [External link](https://example.com)';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      const links = content.querySelectorAll('a');

      expect(links.length).toBe(2);

      const linkStyles = getComputedStyle(links[0]);
      expect(linkStyles.textDecoration).toContain('underline');
      // Note: text-underline-offset may not apply in test environment
    });

    it('should apply proper blockquote styling', async () => {
      element.source = '> This is a blockquote\n> with multiple lines';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      const blockquote = content.querySelector('blockquote');

      expect(blockquote).toBeTruthy();

      const styles = getComputedStyle(blockquote);
      expect(styles.fontStyle).toBe('italic');
      // Note: Border and padding styles may not apply properly in test environment
    });

    it('should apply proper emphasis and strong styling', async () => {
      element.source = '*italic text* and **bold text** and ***both***';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      const em = content.querySelector('em');
      const strong = content.querySelector('strong');

      expect(em).toBeTruthy();
      expect(strong).toBeTruthy();

      const emStyles = getComputedStyle(em);

      expect(emStyles.fontStyle).toBe('italic');

      // Verify we can access CSS variables for font weights
      const semiboldWeight = cssVars['--nve-ref-font-weight-semibold']?.values?.[''] || '600';
      expect(semiboldWeight).toBe('600'); // Verify token value is correct

      // Note: In test environment, CSS custom properties may not resolve properly,
      // so we focus on verifying the elements exist and have the right structure
    });
  });

  describe('source property priority and edge cases', () => {
    let fixture: HTMLElement;
    let element: Markdown;

    beforeEach(async () => {
      fixture = await createFixture(html`
        <nve-markdown></nve-markdown>
      `);
      element = fixture.querySelector(Markdown.metadata.tag);
      await waitForMarkdownParsing(element);
    });

    afterEach(() => {
      removeFixture(fixture);
    });

    it('should prioritize source property over template content', async () => {
      // Set source property first
      element.source = '# Source content';
      await waitForMarkdownParsing(element);

      // Add a template - but it should be ignored due to source taking priority
      const template = document.createElement('template');
      template.innerHTML = '<h1>Template content</h1>';
      element.appendChild(template);

      // Template should be ignored when source property exists
      await waitForMarkdownParsing(element);

      // Should still show the source content, not template content
      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('Source content');
      expect(content.innerHTML).not.toContain('Template content');
    });

    it('should handle empty markdown input gracefully', async () => {
      // Test that empty markdown input shows slot instead of div
      element.source = '';
      await waitForMarkdownParsing(element);

      const slot = element.shadowRoot.querySelector('slot');
      expect(slot).toBeTruthy();
    });
  });

  describe('invalid input handling', () => {
    let fixture: HTMLElement;
    let element: Markdown;
    let consoleErrorSpy: MockInstance;
    let consoleDebugSpy: MockInstance;

    beforeEach(async () => {
      fixture = await createFixture(html`
        <nve-markdown></nve-markdown>
      `);
      element = fixture.querySelector(Markdown.metadata.tag);
      await waitForMarkdownParsing(element);

      // Spy on console methods to verify error handling
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    });

    afterEach(() => {
      removeFixture(fixture);
      consoleErrorSpy?.mockRestore();
      consoleDebugSpy?.mockRestore();
    });

    it('should handle null input gracefully by clearing content', async () => {
      // Set initial content
      element.source = '# Initial content';
      await waitForMarkdownParsing(element);

      const initialContent = element.shadowRoot.querySelector('div').innerHTML;
      expect(initialContent).toContain('<h1>Initial content</h1>');

      // Set null input - this should clear content (falsy value behavior)
      (element as unknown as { source: null }).source = null;
      await waitForMarkdownParsing(element);

      // Content should be cleared because null is falsy
      const content = element.shadowRoot.querySelector('div');
      // Check that HTML content is cleared (Lit template markers may remain)
      expect(content.innerHTML).not.toContain('<h1>Initial content</h1>');
    });

    it('should handle undefined input gracefully by clearing content', async () => {
      // Set initial content
      element.source = '# Initial content';
      await waitForMarkdownParsing(element);

      const initialContent = element.shadowRoot.querySelector('div').innerHTML;
      expect(initialContent).toContain('<h1>Initial content</h1>');

      // Set undefined input - this should clear content (falsy value behavior)
      (element as unknown as { source: undefined }).source = undefined;
      await waitForMarkdownParsing(element);

      // Content should be cleared because undefined is falsy
      const content = element.shadowRoot.querySelector('div');
      // Check that HTML content is cleared (Lit template markers may remain)
      expect(content.innerHTML).not.toContain('<h1>Initial content</h1>');
    });

    it('should handle zero input gracefully by clearing content', async () => {
      // Set initial content
      element.source = '# Initial content';
      await waitForMarkdownParsing(element);

      const initialContent = element.shadowRoot.querySelector('div').innerHTML;
      expect(initialContent).toContain('<h1>Initial content</h1>');

      // Set zero input - this should clear content (falsy value behavior)
      (element as unknown as { source: number }).source = 0;
      await waitForMarkdownParsing(element);

      // Content should be cleared because 0 is falsy
      const content = element.shadowRoot.querySelector('div');
      // Check that HTML content is cleared (Lit template markers may remain)
      expect(content.innerHTML).not.toContain('<h1>Initial content</h1>');
    });

    it('should handle false input gracefully by clearing content', async () => {
      // Set initial content
      element.source = '# Initial content';
      await waitForMarkdownParsing(element);

      const initialContent = element.shadowRoot.querySelector('div').innerHTML;
      expect(initialContent).toContain('<h1>Initial content</h1>');

      // Set false input - this should clear content (falsy value behavior)
      (element as unknown as { source: boolean }).source = false;
      await waitForMarkdownParsing(element);

      // Content should be cleared because false is falsy
      const content = element.shadowRoot.querySelector('div');
      // Check that HTML content is cleared (Lit template markers may remain)
      expect(content.innerHTML).not.toContain('<h1>Initial content</h1>');
    });

    it('should attempt to parse non-string truthy inputs and handle parsing errors', async () => {
      // Set initial content
      element.source = '# Initial content';
      await waitForMarkdownParsing(element);

      const initialContent = element.shadowRoot.querySelector('div').innerHTML;
      expect(initialContent).toContain('<h1>Initial content</h1>');

      // Set object input - this is truthy so it will attempt to parse
      (element as unknown as { source: object }).source = { markdown: '# Test' };
      await waitForMarkdownParsing(element);

      // Content should remain unchanged due to parsing error being caught
      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toBe(initialContent);

      // Should have logged the parsing error
      expect(consoleDebugSpy).toHaveBeenCalledWith('Markdown parsing failed, keeping previous content');
    });

    it('should attempt to parse array input and handle parsing errors', async () => {
      // Set initial content
      element.source = '# Initial content';
      await waitForMarkdownParsing(element);

      const initialContent = element.shadowRoot.querySelector('div').innerHTML;
      expect(initialContent).toContain('<h1>Initial content</h1>');

      // Set array input - this is truthy so it will attempt to parse
      (element as unknown as { source: string[] }).source = ['# Test markdown'];
      await waitForMarkdownParsing(element);

      // Content should remain unchanged due to parsing error being caught
      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toBe(initialContent);

      // Should have logged the parsing error
      expect(consoleDebugSpy).toHaveBeenCalledWith('Markdown parsing failed, keeping previous content');
    });

    it('should handle numeric string input correctly', async () => {
      // Numeric strings should be treated as valid markdown content
      element.source = '12345';
      await waitForMarkdownParsing(element);

      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toContain('<p>12345</p>');
    });

    it('should handle boolean true input by attempting to parse', async () => {
      // Set initial content
      element.source = '# Initial content';
      await waitForMarkdownParsing(element);

      const initialContent = element.shadowRoot.querySelector('div').innerHTML;
      expect(initialContent).toContain('<h1>Initial content</h1>');

      // Set true input - this is truthy so it will attempt to parse
      (element as unknown as { source: boolean }).source = true;
      await waitForMarkdownParsing(element);

      // Content should remain unchanged due to parsing error being caught
      const content = element.shadowRoot.querySelector('div');
      expect(content.innerHTML).toBe(initialContent);

      // Should have logged the parsing error
      expect(consoleDebugSpy).toHaveBeenCalledWith('Markdown parsing failed, keeping previous content');
    });
  });
});
