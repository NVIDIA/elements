import { define } from '@elements/elements/internal';
import { Dialog, DialogHeader, DialogFooter } from '@elements/elements/dialog';
import '@elements/elements/icon-button/define.js';

define(Dialog);
define(DialogHeader);
define(DialogFooter);

declare global {
  interface HTMLElementTagNameMap {
    'nve-dialog': Dialog;
    'nve-dialog-header': DialogHeader;
    'nve-dialog-footer': DialogFooter;
  }
}
