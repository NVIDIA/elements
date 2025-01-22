import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import type { ContainerElement } from '@nvidia-elements/core/internal';
import { useStyles, shiftLeft } from '@nvidia-elements/core/internal';
import styles from './codeblock.css?inline';

import hljs from 'highlight.js/lib/core';
import shell from 'highlight.js/lib/languages/shell';

hljs.registerLanguage('shell', shell);

/**
 * @element nve-codeblock
 * @description A container for content representing programming languages.
 * @since 0.1.0
 * @slot actions - slot for action bar
 * @cssprop --background
 * @cssprop --padding
 * @cssprop --border-radius
 * @cssprop --font-family
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/labs-code-codeblock-documentation--docs
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog?node-id=12982-3305&t=3Qq325PlfuYlknS6-0
 * @aria https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/
 * @beta
 */
export class CodeBlock extends LitElement implements ContainerElement {
  static readonly metadata = {
    tag: 'nve-codeblock',
    version: '0.0.0'
  };

  /**
   * Determines the container styles of component. Flat is used for nesting within other containers.
   */
  @property({ type: String, reflect: true }) container?: 'flat' | 'inline';

  /**
   * Programming language to be used to process the codeblock.
   */
  @property({ type: String }) language:
    | 'css'
    | 'go'
    | 'html'
    | 'javascript'
    | 'json'
    | 'markdown'
    | 'python'
    | 'shell'
    | 'typescript'
    | 'xml'
    | 'yaml' = 'shell';

  /**
   * Text code to be process into a codeblock.
   */
  @property({ type: String }) code?: string;

  /**
   * Adds styling to show the line numbers of the codeblock.
   */
  @property({ attribute: 'line-numbers', type: Boolean }) lineNumbers?: Boolean;

  /**
   * Adds styling to highlight the provided code lines.
   * For multiple lines: use Comma seperated values, ex: (1,5,7).
   * For range of lines, use hyphen seperated values, ex: (1-5).
   * You can combine both such as: ex: (1,5,10-15,20).
   */
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
        <pre class="hljs"><code class=${this.language ?? ''}><slot @slotchange=${this.#updateCode} hidden></slot>${unsafeHTML(this.formattedCode)}</code></pre>
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
    const code = this.#source.trim();
    if (!code) {
      return;
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
      const linesToHighlight = this.#getLinesToHighlight();
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

  #getLinesToHighlight() {
    const range = [];
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

    return range;
  }
}
