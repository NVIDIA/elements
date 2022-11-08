import { Dialog, DialogHeader, DialogFooter } from '@elements/elements/dialog';

customElements.get('mlv-dialog') || customElements.define('mlv-dialog', Dialog);
customElements.get('mlv-dialog-header') || customElements.define('mlv-dialog-header', DialogHeader);
customElements.get('mlv-dialog-footer') || customElements.define('mlv-dialog-footer', DialogFooter);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-dialog': Dialog;
    'mlv-dialog-header': DialogHeader;
    'mlv-dialog-footer': DialogFooter;
  }
}
