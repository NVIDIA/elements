import { defineElement } from '@elements/elements/internal';
import { Dialog, DialogHeader, DialogFooter } from '@elements/elements/dialog';
import '@elements/elements/icon-button/define.js';

defineElement('mlv-dialog', Dialog);
defineElement('mlv-dialog-header', DialogHeader);
defineElement('mlv-dialog-footer', DialogFooter);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-dialog': Dialog;
    'mlv-dialog-header': DialogHeader;
    'mlv-dialog-footer': DialogFooter;
  }
}
