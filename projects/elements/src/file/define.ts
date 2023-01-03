import { defineElement } from '@elements/elements/internal';
import { File } from '@elements/elements/file';
import '@elements/elements/forms/define.js';

defineElement('mlv-file', File);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-file': File;
  }
}
