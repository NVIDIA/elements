import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { useStyles, ContainerElement, shiftLeft } from '@elements/elements/internal';
import styles from './codeblock.css?inline';

import hljs from 'highlight.js/lib/core';
import shell from 'highlight.js/lib/languages/shell';

hljs.registerLanguage('shell', shell);

/**
 * @element nve-codeblock
 * @description A container for content representing programming languages.
 * @since 0.1.0
 */
export class CodeBlock extends LitElement implements ContainerElement {
  static readonly metadata = {
    tag: 'nve-codeblock',
    version: '0.0.0'
  };

  @property({ type: String, reflect: true }) container?: 'flat' | 'inline';

  @property({ type: String }) language?: string;

  @property({ type: String }) code?: string;

  @property({ attribute: 'line-numbers', type: Boolean }) lineNumbers?: Boolean;

  @property({ type: String }) highlight?: string;

  @state() private formattedCode?: string;

  static styles = useStyles([styles]);

  get #source(): string | undefined {
    const textContent = this.shadowRoot
      ?.querySelector('slot')
      ?.assignedNodes()
      .reduce((p: any, n: any) => {
        // if innerHTML its an HTMLElement instance or Template tag
        // if not then its a TextNode type and should use textContent instead
        return [...p, n.innerHTML ?? n.textContent];
      }, [])
      .join('');

    return shiftLeft(this.code ?? (textContent as string));
  }

  render() {
    return html`
      <div internal-host>
        <pre class="hljs"><code class="${this.language ?? ''}"><slot @slotchange=${this.#updateCode} hidden></slot>${unsafeHTML(this.formattedCode)}</code></pre>
        <slot name="actions"></slot>
      </div>
    `;
  }

  update(changedProperties: Map<string, any>) {
    if (changedProperties.has('code')) {
      this.#updateCode();
    }

    super.update(changedProperties);
  }

  #updateCode(): void {
    const code = this.#source;
    if (!code) {
      return;
    }

    // default language
    if (!this.language) {
      this.language = 'shell';
    }

    // apply highlightjs
    this.formattedCode = hljs.highlight(code, { language: this.language }).value;

    // apply line-numbers
    if (this.lineNumbers) {
      const lines = this.formattedCode.split('\n').map((line, index) => {
        return `<span class="hljs-linenumber">${index + 1}</span>${line}`;
      });
      this.formattedCode = lines.join('\n');
    }

    // apply line highlights
    if (this.highlight) {
      const linesToHighlight = this.getLinesToHighlight();
      const lines = this.formattedCode.split('\n').map((line, index) => {
        let span = `${line}`;
        if (linesToHighlight.includes(index + 1)) {
          // fix for highlightjs multi-line comments
          if (line.includes('hljs-comment') && !line.endsWith('</span>')) {
            line = `${line}</span>`;
          }
          span = `<span class="hljs-highlight">${line}</span>`;
        }
        return span;
      });
      this.formattedCode = lines.join('\n');
    }

    this.requestUpdate();
  }

  private getLinesToHighlight() {
    const range = [];
    if (this.highlight) {
      const lines = this.highlight.split(',');
      for (let l in lines) {
        const [startStr, endStr] = lines[l].split('-');
        const start = parseInt(startStr);
        let end = parseInt(endStr);
        if (!end) {
          end = start;
        }

        for (let i = start; i <= end; i++) {
          range.push(i);
        }
      }
    }

    return range;
  }
}
