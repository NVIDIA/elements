import { define } from '@nvidia-elements/core/internal';
import { File } from '@nvidia-elements/core/file';
import { Control, ControlGroup, ControlMessage } from '@nvidia-elements/core/forms';

define(File);
define(Control);
define(ControlGroup);
define(ControlMessage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-file': File;
  }
}
