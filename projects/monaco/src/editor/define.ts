import { define } from '@nvidia-elements/core/internal';
import { Editor } from '@nvidia-elements/monaco/editor';

define(Editor);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-monaco-editor']: Editor;
  }
}
