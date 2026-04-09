import { define } from '@nvidia-elements/core/internal';
import { MonacoDiffInput } from '@nvidia-elements/monaco/diff-input';
import { MonacoDiffEditor } from '@nvidia-elements/monaco/diff-editor';

define(MonacoDiffInput);
define(MonacoDiffEditor);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-monaco-diff-input']: MonacoDiffInput;
  }
}
