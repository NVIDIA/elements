import { define } from '@nvidia-elements/core/internal';
import { MonacoDiffEditor } from '@nvidia-elements/monaco/diff-editor';

define(MonacoDiffEditor);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-monaco-diff-editor']: MonacoDiffEditor;
  }
}
