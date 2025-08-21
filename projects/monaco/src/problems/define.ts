import { define } from '@nvidia-elements/core/internal';
import { MonacoProblems } from '@nvidia-elements/monaco/problems';
import '@nvidia-elements/monaco/editor/define.js';

define(MonacoProblems);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-monaco-problems']: MonacoProblems;
  }
}
