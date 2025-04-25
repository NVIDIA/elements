import { define } from '@nvidia-elements/core/internal';
import { MonacoInput } from '@nvidia-elements/monaco/input';

define(MonacoInput);

declare global {
  interface HTMLElementTagNameMap {
    ['nve-monaco-input']: MonacoInput;
  }
}
