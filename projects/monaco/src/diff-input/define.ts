import { define } from '@nvidia-elements/core/internal';
import { MonacoDiffInput } from '@nvidia-elements/monaco/diff-input';
import '@nvidia-elements/monaco/diff-editor/define.js';

define(MonacoDiffInput);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-monaco-diff-input']: MonacoDiffInput;
  }
}
