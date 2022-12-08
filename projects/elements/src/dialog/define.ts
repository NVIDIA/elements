import { Dialog, DialogHeader, DialogFooter } from '@elements/elements/dialog';
import '@elements/elements/icon-button/define.js';

customElements.get('nve-dialog') || customElements.define('nve-dialog', Dialog);
customElements.get('nve-dialog-header') || customElements.define('nve-dialog-header', DialogHeader);
customElements.get('nve-dialog-footer') || customElements.define('nve-dialog-footer', DialogFooter);

declare global {
  interface HTMLElementTagNameMap {
    'nve-dialog': Dialog;
    'nve-dialog-header': DialogHeader;
    'nve-dialog-footer': DialogFooter;
  }
}
