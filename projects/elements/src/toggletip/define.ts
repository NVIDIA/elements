import { define } from '@nvidia-elements/core/internal';
import { Toggletip, ToggletipHeader, ToggletipFooter } from '@nvidia-elements/core/toggletip';
import '@nvidia-elements/core/icon-button/define.js';

define(Toggletip);
define(ToggletipFooter);
define(ToggletipHeader);

declare global {
  interface HTMLElementTagNameMap {
    'nve-toggletip': Toggletip;
    'nve-toggletip-footer': ToggletipFooter;
    'nve-toggletip-header': ToggletipHeader;
  }
}
