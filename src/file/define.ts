import { File } from '@elements/elements/file';
import '@elements/elements/forms/define.js';

customElements.get('nve-file') || customElements.define('nve-file', File);

declare global {
  interface HTMLElementTagNameMap {
    'nve-file': File;
  }
}
