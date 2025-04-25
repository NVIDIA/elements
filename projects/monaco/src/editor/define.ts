import { define } from '@nvidia-elements/core/internal';
import { MonacoEditor } from '@nvidia-elements/monaco/editor';

define(MonacoEditor);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-monaco-editor']: MonacoEditor;
  }
}
