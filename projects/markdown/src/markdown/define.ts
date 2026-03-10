import { define } from '@nvidia-elements/core/internal';
import { Markdown } from './markdown.js';

define(Markdown);

declare global {
  interface HTMLElementTagNameMap {
    'nve-markdown': Markdown;
  }
}
