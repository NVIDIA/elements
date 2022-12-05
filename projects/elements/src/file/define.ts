import { File } from '@elements/elements/file';
import '@elements/elements/forms/define.js';

customElements.get('mlv-file') || customElements.define('mlv-file', File);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-file': File;
  }
}
