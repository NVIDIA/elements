import { define } from '@elements/elements/internal';
import { CodeBlock } from './codeblock.js';

define(CodeBlock);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-codeblock']: CodeBlock;
  }
}
