import { define } from '@elements/elements/internal';
import { File } from '@elements/elements/file';
import '@elements/elements/forms/define.js';

define(File);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-file': File;
  }
}
