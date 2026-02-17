import { define } from '@nvidia-elements/core/internal';
import { Dialog, DialogHeader, DialogFooter } from '@nvidia-elements/core/dialog';
import '@nvidia-elements/core/icon-button/define.js';

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
