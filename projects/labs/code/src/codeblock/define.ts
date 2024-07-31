import { define } from '@nvidia-elements/core/internal';
import { CodeBlock } from './codeblock.js';

define(CodeBlock);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-codeblock']: CodeBlock;
  }
}
