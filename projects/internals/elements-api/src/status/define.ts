import { define } from '@nvidia-elements/core/internal';
import { Status } from './status.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/alert/define.js';

define(Status);

declare global {
  interface HTMLElementTagNameMap {
    'nve-api-status': Status;
  }
}
