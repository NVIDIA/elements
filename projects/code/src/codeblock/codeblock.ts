import { html, LitElement } from 'lit';
import type { PropertyValues } from 'lit';
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
 * @entrypoint \@nvidia-elements/code/codeblock
 * @slot - for declarative slotting of source code and not using the `code` property
 * @slot actions - slot for action bar
 * @cssprop --background
 * @cssprop --padding
 * @cssprop --border-radius
 * @cssprop --border
 * @cssprop --font-family
 * @cssprop --white-space
 * @aria https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/
 * @beta
 */
export class CodeBlock extends LitElement implements ContainerElement {
  static readonly metadata = {
    tag: 'nve-codeblock',
    version: '0.0.0'
  };

  /**
   * Determines the container styles of component. Flat enables nesting within other containers.
   */
  @property({ type: String, reflect: true }) container?: 'flat' | 'inline';

  /**
   * Programming language that processes the codeblock.
   */
  @property({ type: String }) language:
    | 'bash'
    | 'css'
    | 'go'
    | 'html'
    | 'javascript'
    | 'json'
    | 'markdown'
    | 'python'
    | 'shell'
    | 'toml'
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
  @property({ attribute: 'line-numbers', type: Boolean }) lineNumbers?: boolean;

  /**
   * Adds styling to highlight the provided code lines.
   * For many lines: use Comma seperated values, ex: (1,5,7).
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
      .reduce((p: string[], n) => {
        let template = '';
        if (n instanceof HTMLTemplateElement) {
          template = n.content.textContent ?? '';
        } else if (n instanceof HTMLElement) {
          template = n.innerHTML;
        } else {
          template = n.textContent ?? '';
        }

        return [...p, template];
      }, [] as string[])
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

  update(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('code')) {
      this.#updateCode();
    }

    super.update(changedProperties);
  }

  #updateCode(): void {
    const code = this.#source?.trim();
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
    const range: number[] = [];
    const lines = this.highlight!.split(',');
    for (const l in lines) {
      const [startStr, endStr] = lines[l]!.split('-');
      const start = parseInt(startStr!);
      let end = parseInt(endStr!);
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
