import { define } from '@nvidia-elements/core/internal';
import { MonacoInput } from '@nvidia-elements/monaco/input';
import '@nvidia-elements/monaco/editor/define.js';

define(MonacoInput);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-monaco-input']: MonacoInput;
  }
}
