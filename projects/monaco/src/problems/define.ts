import { define } from '@nvidia-elements/core/internal';
import { MonacoProblems } from '@nvidia-elements/monaco/problems';
import { MonacoEditor } from '@nvidia-elements/monaco/editor';

define(MonacoProblems);
define(MonacoEditor);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-monaco-problems']: MonacoProblems;
  }
}
