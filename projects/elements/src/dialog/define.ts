import { defineElement } from '@elements/elements/internal';
import { Dialog, DialogHeader, DialogFooter } from '@elements/elements/dialog';
import '@elements/elements/icon-button/define.js';

defineElement('nve-dialog', Dialog);
defineElement('nve-dialog-header', DialogHeader);
defineElement('nve-dialog-footer', DialogFooter);

declare global {
  interface HTMLElementTagNameMap {
    'nve-dialog': Dialog;
    'nve-dialog-header': DialogHeader;
    'nve-dialog-footer': DialogFooter;
  }
}
