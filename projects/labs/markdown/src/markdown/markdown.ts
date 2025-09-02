import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './markdown.css?inline';

// Type definitions for the lazy-loaded MarkdownIt module
interface MarkdownItInstance {
  render(markdown: string): string;
}

interface MarkdownItConstructor {
  new (config?: Record<string, unknown>): MarkdownItInstance;
}

/** Default configuration for markdown-it parser */
const CONFIG = {
  html: true,
  linkify: true,
  typographer: true,
  breaks: false
} as const;

/**
 * A web component that renders markdown content.
 *
 * Supports two input modes:
 * - `source` property: Markdown content that can be set programmatically
 * - `<template>` slot: Markdown content inside a template element
 *
 * @element nve-markdown
 * @cssprop --padding - The padding of the component
 * @description A web component that inputs markdown content and renders it as HTML formatted with Elements styles.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/markdown/markdown
 * @slot - The slot can contain a template element with markdown content
 * @property source - Markdown content to render (can be set programmatically)
 * @alpha
 *
 */
export class Markdown extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-markdown',
    version: '0.0.0'
  };

  static elementDefinitions = {};

  /**
   * Markdown content source that can be set programmatically
   */
  @property({ type: String }) source = '';

  /**
   * Markdown-it constructor (lazy-loaded)
   */
  #MarkdownItConstructor?: MarkdownItConstructor;

  /**
   * Markdown-it instance for parsing markdown content (lazy-loaded)
   */
  #markdownIt?: MarkdownItInstance;

  /**
   * Internal state for the content to render
   */
  @state() private renderedHtml = '';

  /**
   * Query assigned elements in the default slot
   */
  @queryAssignedElements({ slot: '' }) private slotElements!: HTMLElement[];

  render() {
    return html`
      <div internal-host>${unsafeHTML(this.renderedHtml)}</div>
      <slot @slotchange=${this.#processSlottedContent}></slot>
    `;
  }

  protected updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('source')) {
      if (this.source) {
        // Process markdown content from source property
        void this.#parseMarkdown(this.source)
          .then(html => {
            this.renderedHtml = html;
          })
          .catch(_error => {
            // Don't update renderedHtml on parsing error - keep previous content
            console.debug('Markdown parsing failed, keeping previous content');
          });
      } else {
        // Source was cleared, check for slotted content or clear completely
        this.renderedHtml = '';
        this.#processSlottedContent();
      }
    }
  }

  /**
   * Process slotted content to extract markdown from template elements.
   * Only processes when source property is empty (source takes priority).
   */
  #processSlottedContent(): void {
    // Don't process slotted content if we have content from the source property
    if (this.source) return;

    const templateElement = this.slotElements.find(e => e.localName === 'template') as HTMLTemplateElement | undefined;

    if (!templateElement) {
      this.renderedHtml = '';
      return;
    }

    const content = templateElement.innerHTML.trim();

    // console.log(content, 'UPDATE');

    // Process template content: replace <br> with newlines, then remove leading indentation
    // const markdown = content
    //   .replace(/<br\s*\/?>/gi, '\n') // Replace <br> tags with newlines
    //   .split('\n') // Split into lines
    //   .map(line => line.replace(/^ {4}/, '')) // Remove exactly 4 leading spaces from each line
    //   .join('\n'); // Join back together

    // console.log(markdown);

    void this.#parseMarkdown(content)
      .then(html => {
        this.renderedHtml = html;
      })
      .catch(_error => {
        // Don't update renderedHtml on parsing error - keep previous content
        console.debug('Markdown parsing failed, keeping previous content');
      });
  }

  /**
   * Parse markdown content to HTML using markdown-it.
   * Lazy-loads the markdown-it instance only when needed for better performance.
   *
   * @param markdown - The markdown content to parse
   * @returns Parsed HTML content or empty string if input is empty
   */
  async #parseMarkdown(markdown: string): Promise<string> {
    if (!markdown) return '';

    // console.log(markdown);

    // Lazy-load markdown-it constructor only when needed
    if (!this.#MarkdownItConstructor) {
      const module = await import('markdown-it');
      this.#MarkdownItConstructor = module.default;
    }

    // Lazy-load markdown-it instance only when needed
    if (!this.#markdownIt) {
      this.#markdownIt = new this.#MarkdownItConstructor(CONFIG);
    }

    try {
      return this.#markdownIt.render(markdown);
    } catch (error) {
      console.error('Error parsing markdown:', error);
      // Re-throw the error so calling methods can handle it
      throw error;
    }
  }
}
